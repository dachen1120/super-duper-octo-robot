"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import industries from "@/lib/industries";

const fmtTime = (ms) => {
  if (!Number.isFinite(ms) || ms < 0) return "0:00";
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, "0")}`;
};

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function tokenize(en) {
  return en.split(/\s+/).filter(Boolean);
}

export default function LearningPage({ industryId }) {
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retry, setRetry] = useState(0);

  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [timeMs, setTimeMs] = useState(0);
  const [durationMs, setDurationMs] = useState(0);
  const [rate, setRate] = useState(1);
  const [roleMode, setRoleMode] = useState("all"); // all | A | B
  const [mode, setMode] = useState("all");         // all(整段) | single(单句)
  const [loopId, setLoopId] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [grammarOpen, setGrammarOpen] = useState({});
  const [modeHint, setModeHint] = useState("连续播放全部");
  const [wordTip, setWordTip] = useState(null);
  const [rec, setRec] = useState({ phase: "idle", targetId: null, blobUrl: null, err: null, recSize: 0 });

  const dataRef = useRef(null);
  const modeRef = useRef("all");
  const roleRef = useRef("all");
  const recRef = useRef(rec);
  const recStartedRef = useRef(false);
  const resumeFullMsRef = useRef(0); // 单句播完后，整段续播位置（该句在整段中的 endMs）
  const mediaRecRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const recTimerRef = useRef(null);

  useEffect(() => { dataRef.current = data; }, [data]);
  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { roleRef.current = roleMode; }, [roleMode]);
  useEffect(() => { recRef.current = rec; }, [rec]);

  const ind = industries.find((i) => i.id === industryId);
  const turns = data?.dialogue?.turns ?? [];
  const news = data?.news ?? [];

  // 组装对话行：话题切换处插入 topic 块
  const rows = useMemo(() => {
    const out = [];
    let lastNewsId = null;
    for (const t of turns) {
      if (t.relatedNewsId && t.relatedNewsId !== lastNewsId) {
        const n = news.find((x) => x.id === t.relatedNewsId);
        if (n) out.push({ type: "topic", news: n });
      }
      if (t.relatedNewsId) lastNewsId = t.relatedNewsId;
      out.push({ type: "line", turn: t });
    }
    return out;
  }, [turns, news]);

  // ---- load ----
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setErr(null);
    fetch(`/api/sample/${encodeURIComponent(industryId)}`)
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        if (d.error) { setErr(d.error); setData(null); }
        else { setData(d); document.title = `${d.industry?.name ?? industryId} 每日新闻对话 · 用兴趣学英语`; }
      })
      .catch(() => { if (!cancelled) setErr("内容加载失败，请检查网络后重试。"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [industryId, retry]);

  const turnById = useCallback((id) => (dataRef.current?.dialogue?.turns ?? []).find((t) => t.id === id) || null, []);
  const fullAudio = () => dataRef.current?.dialogue?.audio ?? null;

  // 切换音频源（整段 full / 单句 per-turn）；loop 由 <audio>.loop 原生控制
  const setSource = useCallback((src, wantLoop) => {
    const a = audioRef.current;
    if (!a) return;
    const cur = a.getAttribute("src");
    if (cur !== src) {
      a.src = src;
    }
    a.loop = !!wantLoop;
  }, []);

  // ---- audio 引擎（事件驱动，不做高频 seek 控制）----
  useEffect(() => {
    const a = audioRef.current;
    if (!a || !data) return undefined;

    const onMeta = () => {
      if (a.duration && Number.isFinite(a.duration)) {
        setDurationMs(Math.round(a.duration * 1000));
      }
    };
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => {
      const rc = recRef.current;
      // 跟读：原音播完自动开始录音
      if (rc && rc.phase === "playing" && rc.targetId && !recStartedRef.current) {
        recStartedRef.current = true;
        beginRecord(rc.targetId);
        return;
      }
      a.loop = false;
      setPlaying(false);
      setLoopId(null);
      setMode("all");
      setModeHint(roleRef.current === "all" ? "连续播放全部" : "只播放" + roleRef.current + "角色 · 另一角色留给你说（会留时间）");
      if (roleRef.current !== "all") a.volume = 1;
    };
    const tick = () => {
      const t = a.currentTime * 1000;
      setTimeMs(Math.round(t));
      if (modeRef.current === "all") {
        const ts = dataRef.current?.dialogue?.turns ?? [];
        // 高亮整段中当前话轮（含句间停顿归属前一句）
        let cur = null;
        for (let i = 0; i < ts.length; i++) {
          if (t >= (ts[i].audio?.startMs ?? 0) - 40) cur = ts[i].id;
          else break;
        }
        setActiveId((prev) => (prev === cur ? prev : cur));
        const turn = ts.find((x) => x.id === cur);
        const role = roleRef.current;
        if (turn && role !== "all" && turn.speaker !== role) {
          if (a.volume !== 0) a.volume = 0;
          setModeHint("AI 已静音留白，现在请你来念「" + (role === "A" ? "B" : "A") + "」的对白…");
        } else {
          if (a.volume !== 1) a.volume = 1;
          setModeHint(role === "all" ? "连续播放全部" : "只播放" + role + "角色 · 另一角色留给你说（会留时间）");
        }
      }
    };

    a.addEventListener("loadedmetadata", onMeta);
    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);
    a.addEventListener("ended", onEnded);
    a.addEventListener("timeupdate", tick);
    return () => {
      a.removeEventListener("loadedmetadata", onMeta);
      a.removeEventListener("play", onPlay);
      a.removeEventListener("pause", onPause);
      a.removeEventListener("ended", onEnded);
      a.removeEventListener("timeupdate", tick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, roleMode, mode, loopId, rate, rec.phase]);

  // 语速变化即时生效
  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = rate;
  }, [rate]);

  // ---- auto scroll：高亮句滚动到视口约 25% 高度（getBoundingClientRect + window.scrollTo）----
  useEffect(() => {
    if (!activeId) return;
    const el = document.getElementById("line-" + activeId);
    if (!el) return;
    const r = el.getBoundingClientRect();
    const targetY = r.top + window.scrollY - window.innerHeight * 0.25;
    window.scrollTo({ top: Math.max(0, targetY), behavior: "smooth" });
  }, [activeId]);

  // ---- 整段 / 连续播放（角色留白模式基于整段） ----
  const playAll = useCallback(() => {
    const a = audioRef.current;
    const fa = fullAudio();
    if (!a || !fa || !data) return;
    const fullDur = fa.durationMs || 0;
    setMode("all");
    setLoopId(null);
    setDurationMs(fullDur);
    setSource(fa.src, false);
    const t = a.currentTime * 1000;
    // 从单句结束后续播：定位到该句在整段中的结束点
    if (resumeFullMsRef.current > 0 && modeRef.current === "single") {
      a.currentTime = Math.min(resumeFullMsRef.current, fullDur - 50) / 1000;
      resumeFullMsRef.current = 0;
    } else if (t < 0 || t > fullDur) {
      a.currentTime = 0;
    }
    a.volume = 1;
    setModeHint(roleRef.current === "all" ? "连续播放全部" : "只播放" + roleRef.current + "角色 · 另一角色留给你说（会留时间）");
    a.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  }, [data, setSource, fullAudio]);

  const togglePlay = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) playAll();
    else { a.pause(); setPlaying(false); if (roleRef.current !== "all") a.volume = 1; }
  }, [playAll]);

  // ---- 单句播放 / 单句循环（使用每句独立音频，start 稳定、loop 原生） ----
  const playSentence = useCallback((turnId, opts) => {
    const a = audioRef.current;
    const turn = turnById(turnId);
    if (!a || !turn || !turn.audio) return;
    const looping = !!(opts && opts.loop);
    setMode("single");
    setLoopId(looping ? turnId : null);
    setModeHint(looping ? "单句循环播放" : "单句播放（点击任意一句开始）");
    setActiveId(turnId);
    resumeFullMsRef.current = turn.audio.endMs; // 整段续播位置
    setDurationMs(turn.audio.durationMs || (turn.audio.endMs - turn.audio.startMs));
    setSource(turn.audio.src, looping);
    a.currentTime = 0;
    a.volume = 1;
    a.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  }, [turnById, setSource]);

  const toggleLoopBtn = useCallback((turnId) => {
    if (loopId === turnId) {
      const a = audioRef.current;
      if (a) { a.loop = false; a.pause(); setPlaying(false); }
      setLoopId(null);
      setMode("all");
      setModeHint("连续播放全部");
      return;
    }
    playSentence(turnId, { loop: true });
  }, [loopId, playSentence]);

  const seekTo = useCallback((sec) => {
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = sec;
    setTimeMs(Math.round(sec * 1000));
  }, []);

  // ---- 单词释义 ----
  const findGloss = (turn, tokens, i) => {
    const gs = turn.glosses ?? [];
    const tryMatch = (phrase) => {
      const key = phrase.toLowerCase();
      const g = gs.find((x) => x.word.toLowerCase() === key);
      return g || null;
    };
    const one = tryMatch(tokens[i]);
    if (one) return { gloss: one, text: tokens[i], len: 1 };
    const two = i + 1 < tokens.length ? tryMatch(tokens[i] + " " + tokens[i + 1]) : null;
    if (two) return { gloss: two, text: tokens[i] + " " + tokens[i + 1], len: 2 };
    return null;
  };

  const showDef = (el, text, def) => {
    const r = el.getBoundingClientRect();
    setWordTip({ text, def, x: r.left + r.width / 2, y: r.top });
    try {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = "en-US";
        u.rate = 0.85;
        window.speechSynthesis.speak(u);
      }
    } catch { /* speech unsupported */ }
  };

  // ---- 录音 ----
  const cleanupRec = useCallback(() => {
    if (recTimerRef.current) clearTimeout(recTimerRef.current);
    if (mediaRecRef.current && mediaRecRef.current.state !== "inactive") {
      try { mediaRecRef.current.stop(); } catch { /* noop */ }
    }
    if (streamRef.current) { streamRef.current.getTracks().forEach((tr) => tr.stop()); streamRef.current = null; }
    mediaRecRef.current = null;
  }, []);

  const beginRecord = useCallback(async (turnId) => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setRec({ phase: "done", targetId: turnId, blobUrl: null, err: "当前浏览器不支持录音，请使用 Chrome/Edge，并确保 HTTPS 或 localhost。", recSize: 0 });
      return;
    }
    const turn = turnById(turnId);
    const durSec = turn && turn.audio ? (turn.audio.endMs - turn.audio.startMs) / 1000 : 4;
    const areaEl = document.getElementById("rec-" + turnId);
    if (areaEl) {
      areaEl.innerHTML = '<div class="rec-tip">🔴 正在录音，请大声跟读…（' + Math.max(1, Math.round(durSec)) + " 秒后自动停止）</div>";
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      let mime = "";
      if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported) {
        if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) mime = "audio/webm;codecs=opus";
        else if (MediaRecorder.isTypeSupported("audio/webm")) mime = "audio/webm";
        else if (MediaRecorder.isTypeSupported("audio/mp4")) mime = "audio/mp4";
      }
      const mr = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
      mediaRecRef.current = mr;
      mr.ondataavailable = (e) => { if (e.data && e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mr.mimeType || "audio/webm" });
        setRec((prev) => ({ phase: "done", targetId: prev.targetId, blobUrl: URL.createObjectURL(blob), err: null, recSize: blob.size }));
        cleanupRec();
      };
      mr.start();
      recTimerRef.current = setTimeout(() => {
        if (mediaRecRef.current && mediaRecRef.current.state !== "inactive") mediaRecRef.current.stop();
      }, Math.max(durSec, 1.5) * 1000);
    } catch (ex) {
      setRec({ phase: "done", targetId: turnId, blobUrl: null, err: "无法访问麦克风：" + ex.message + "。请允许麦克风权限。", recSize: 0 });
    }
  }, [turnById, cleanupRec]);

  const startFollow = useCallback((turnId) => {
    const a = audioRef.current;
    const turn = turnById(turnId);
    if (!a || !turn || !turn.audio) return;
    setWordTip(null);
    setRec({ phase: "playing", targetId: turnId, blobUrl: null, err: null, recSize: 0 });
    setMode("single");
    setLoopId(null);
    setActiveId(turnId);
    resumeFullMsRef.current = turn.audio.endMs;
    setDurationMs(turn.audio.durationMs || (turn.audio.endMs - turn.audio.startMs));
    recStartedRef.current = false;
    const areaEl = document.getElementById("rec-" + turnId);
    if (areaEl) { areaEl.classList.add("show"); areaEl.innerHTML = '<div class="rec-tip">▶ 正在播放原音，请仔细听…</div>'; }
    setSource(turn.audio.src, false);
    a.currentTime = 0;
    a.volume = 1;
    a.play().then(() => setPlaying(true)).catch(() => {
      if (areaEl) areaEl.innerHTML = '<div class="rec-tip">音频无法播放，请先点击播放按钮。</div>';
    });
  }, [turnById, setSource]);

  const replayOriginal = useCallback((turnId) => {
    const a = audioRef.current;
    const turn = turnById(turnId);
    if (!a || !turn || !turn.audio) return;
    setMode("single");
    setLoopId(null);
    setSource(turn.audio.src, false);
    a.currentTime = 0;
    a.volume = 1;
    a.play().then(() => setPlaying(true)).catch(() => {});
  }, [turnById, setSource]);

  const playMine = useCallback(() => {
    const url = recRef.current?.blobUrl;
    if (url) new Audio(url).play().catch(() => {});
  }, []);

  const redo = useCallback(() => {
    const target = rec.targetId;
    cleanupRec();
    if (rec.blobUrl) URL.revokeObjectURL(rec.blobUrl);
    setRec({ phase: "idle", targetId: null, blobUrl: null, err: null, recSize: 0 });
    if (target) setTimeout(() => startFollow(target), 60);
  }, [rec, cleanupRec, startFollow]);

  useEffect(() => () => {
    cleanupRec();
    if (recRef.current?.blobUrl) URL.revokeObjectURL(recRef.current.blobUrl);
    if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // word tooltip auto-hide
  useEffect(() => {
    if (!wordTip) return undefined;
    const t = setTimeout(() => setWordTip(null), 2200);
    return () => clearTimeout(t);
  }, [wordTip]);

  // ---- render states ----
  if (loading) {
    return (
      <main className="wrap loading">
        <Link className="back-link" href="/">← 返回首页</Link>
        <div className="skeleton-block" />
        <div className="skeleton-block short" />
        <p className="muted">正在加载今日内容与对话音频…</p>
      </main>
    );
  }
  if (err || !data) {
    return (
      <main className="wrap error-view">
        <Link className="back-link" href="/">← 返回首页</Link>
        <div className="error-card">
          <h2>{ind ? `${ind.icon} ${ind.name}` : industryId}</h2>
          <p>{err || "未找到示例内容。"}</p>
          <p className="muted">{err && err.includes("登录") ? "学习内容需登录后查看，登录即可开始学习。" : "该行业内容正在准备中，可先返回首页选择 AI科技（已上线）。"}</p>
          {err && err.includes("登录") && (
            <p style={{ marginTop: 10 }}>
              <Link className="auth-nav-btn primary" href="/login">去登录</Link>
            </p>
          )}
          <button onClick={() => setRetry((v) => v + 1)}>重试</button>
        </div>
      </main>
    );
  }

  const dateLabel = (data.generatedAt || "").slice(0, 10).replace(/-/g, ".");
  const duration = durationMs || data.dialogue?.audio?.durationMs || 0;
  const fullSrc = data.dialogue?.audio?.src;

  return (
    <main className="wrap learn">
      <audio ref={audioRef} src={fullSrc} preload="auto" style={{ display: "none" }} />

      <header>
        <div>
          <Link className="back-link" href="/">← 切换行业</Link>
          <h1>{ind ? `${ind.name}` : industryId} 每日新闻对话</h1>
        </div>
        <span className="date-badge">{dateLabel || "今日"}</span>
      </header>

      <div className="tip">
        学习提示：点击英文单词查看中文释义并播放美式发音；点击每句下方的「语法」查看讲解；
        点击整句空白处从该句开始播放（单句自动暂停）；选「A角色 / B角色」后对方话轮静音留白，由你开口。
      </div>
      <div className="wave"><span></span><span></span><span></span><span></span><span></span></div>

      {/* sticky player */}
      <section className="player">
        <div className="player-top">
          <button className={"play-btn" + (playing ? " playing" : "")} onClick={togglePlay} aria-label={playing ? "暂停" : "播放全部"}>
            <svg className="icon-play" viewBox="0 0 24 24" fill="currentColor" style={{ display: playing ? "none" : "" }}><path d="M8 5v14l11-7z" /></svg>
            <svg className="icon-pause" viewBox="0 0 24 24" fill="currentColor" style={{ display: playing ? "" : "none" }}><path d="M6 4h4v16H6zM14 4h4v16h-4z" /></svg>
          </button>
          <div className="progress-area">
            <div className="time-row"><span className="now" id="curTime">{fmtTime(timeMs)}</span><span id="totalTime">{fmtTime(duration)}</span></div>
            <input className="seek" type="range" min="0" max={Math.max(duration / 1000, 1)} step="0.01" value={Math.min(timeMs / 1000, Math.max(duration / 1000, 1))}
              onChange={(e) => seekTo(parseFloat(e.target.value))} aria-label="播放进度" />
          </div>
        </div>
        <div className="player-tools">
          <div className="tool-group">
            {["all", "A", "B"].map((r) => (
              <button key={r} className={"role-btn" + (roleMode === r ? " on" : "")} data-role={r}
                onClick={() => {
                  setRoleMode(r);
                  if (modeRef.current === "all") setModeHint(r === "all" ? "连续播放全部" : "只播放" + r + "角色 · 另一角色留给你说（会留时间）");
                }}>
                {r === "all" ? "全部" : r + "角色"}
              </button>
            ))}
          </div>
          <div className="tool-group">
            {[0.75, 1, 1.5].map((s) => (
              <button key={s} className={"rate-btn" + (rate === s ? " on" : "")} data-rate={s}
                onClick={() => { setRate(s); if (audioRef.current) audioRef.current.playbackRate = s; }}>
                {s}x
              </button>
            ))}
          </div>
        </div>
        <div className="mode-hint" dangerouslySetInnerHTML={{ __html: modeHint }} />
      </section>

      {/* conversation */}
      <div id="lines">
        {rows.map((row) => {
          if (row.type === "topic") {
            const n = row.news;
            return (
              <div className="topic-block" key={"topic-" + n.id}>
                <div className="topic-title">📰 {n.headline}</div>
                <div className="topic-tags">{(n.tags || []).map((t) => <span className="tag" key={t}>#{t}</span>)}</div>
                <div className="source-line">
                  <span>{n.source}</span>
                  <span className="dot">·</span>
                  <span>更新于 {n.updatedLabel}</span>
                  {n.sourceUrl && <a href={n.sourceUrl} target="_blank" rel="noopener noreferrer">查看原文 ↗</a>}
                </div>
              </div>
            );
          }
          const t = row.turn;
          const isActive = activeId === t.id;
          const isMuted = roleMode !== "all" && t.speaker !== roleMode;
          const tokens = tokenize(t.en);
          const showGrammar = !!grammarOpen[t.id];
          const isLoop = loopId === t.id;
          const recFor = rec.targetId === t.id;
          return (
            <div key={t.id} id={"line-" + t.id}
              className={"line speaker-" + (t.speaker === "A" ? "a" : "b") + (isActive ? " playing" : "")}
              onClick={(e) => {
                if (e.target.closest(".word") || e.target.closest("button") || e.target.closest("a")) return;
                playSentence(t.id, {});
              }}>
              <span className="spk-tag">{t.speaker === "A" ? "A" : "B"}</span>
              {isMuted && isActive && <span className="speak-now">该你开口</span>}
              <div className="en">
                {tokens.map((tk, i) => {
                  const hit = findGloss(t, tokens, i);
                  return (
                    <span key={i} className={hit ? "word" : ""}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (hit) showDef(e.currentTarget, hit.text, hit.gloss.pos + " " + hit.gloss.meaning);
                      }}>
                      {tk}{i < tokens.length - 1 ? " " : ""}
                    </span>
                  );
                })}
              </div>
              <div className="zh">{t.zh}</div>
              <div className="btn-row">
                <button className={"btn-grammar" + (showGrammar ? " active" : "")}
                  onClick={(e) => { e.stopPropagation(); setGrammarOpen((p) => ({ ...p, [t.id]: !p[t.id] })); }}>
                  {showGrammar ? "收起语法" : "语法"}
                </button>
                <button className={"btn-loop" + (isLoop ? " active" : "")}
                  onClick={(e) => { e.stopPropagation(); toggleLoopBtn(t.id); }}>
                  {isLoop ? "⏹ 停止循环" : "循环"}
                </button>
                <button className={"btn-record" + (recFor && rec.phase === "recording" ? " recording" : "")}
                  onClick={(e) => { e.stopPropagation(); startFollow(t.id); }}>
                  {recFor && rec.phase === "recording" ? "⏺ 录音中…" : "跟读"}
                </button>
              </div>
              {showGrammar && (
                <div className="grammar-box show">
                  <b>📘 {t.grammar?.title}</b><br />{t.grammar?.body}
                </div>
              )}
              <div className="record-area" id={"rec-" + t.id}>
                {recFor && rec.phase === "done" && (
                  <div>
                    <div style={{ marginBottom: 6, fontWeight: 600 }}>🎙 录音完成，听一听对比：</div>
                    <div className="rec-btns">
                      <button className="rb-play-orig" onClick={(e) => { e.stopPropagation(); replayOriginal(t.id); }}>▶ 听原音</button>
                      <button className="rb-play-mine" onClick={(e) => { e.stopPropagation(); playMine(); }} disabled={!rec.blobUrl}>▶ 听我的</button>
                      <button className="rb-again" onClick={(e) => { e.stopPropagation(); redo(); }}>🔄 重录</button>
                    </div>
                    {rec.err && <div className="rec-tip">{rec.err}</div>}
                    {!rec.err && rec.recSize < 2000 && <div style={{ marginTop: 4, color: "#b91c1c", fontSize: 12 }}>⚠ 录音内容过短，可能是麦克风未采集到声音，建议重录。</div>}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* word def tooltip */}
      {wordTip && (
        <div className="word-def show" style={{ top: wordTip.y - 42, left: wordTip.x }}>
          <span style={{ color: "#fbbf24" }}>🔊 {escapeHtml(wordTip.text)}</span> · {wordTip.def}
        </div>
      )}

      <div className="hint-line">— 点击句子开始 · 点击单词学释义 · 练习口语 —</div>
      <footer className="learn-foot">
        <Link href="/">← 返回首页选择其他行业</Link>
        <p className="muted">内容为 AI 学习示例，含来源链接；请以新闻原文为准。</p>
      </footer>
    </main>
  );
}