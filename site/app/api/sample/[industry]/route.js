import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { promises as fs } from "fs";
import { accessSync } from "fs";
import path from "path";

function findSamplesDir() {
  let dir = process.cwd();
  for (let i = 0; i < 5; i++) {
    const candidate = path.join(dir, "content", "samples");
    try { accessSync(candidate); return candidate; } catch { /* next */ }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

const pad = (n) => String(n).padStart(2, "0");
const fmtUpdated = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}（来源更新时间）`;
};

async function loadFromSupabase(industry) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null; // 未配置 Supabase -> 走本地示例兜底

  // 公开判断该行业是否已有 published 内容（不暴露正文）
  const anon = createClient(url, key);
  const { data: slugs } = await anon.rpc("published_industry_slugs");
  if (Array.isArray(slugs) && slugs.length > 0 && !slugs.includes(industry)) {
    return { __missing: "该行业内容正在准备中，敬请期待。" };
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll() { /* route 只读，无需写 cookie */ },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { __authRequired: true };

  const { data: ind, error: indErr } = await supabase
    .from("industries")
    .select("id, slug, name_zh, name_en, icon")
    .eq("slug", industry)
    .maybeSingle();
  if (indErr || !ind) return { __missing: "该行业尚未开放。" };

  const { data: batch } = await supabase
    .from("content_batches")
    .select("id, title, title_en, brief_date, full_audio_url, duration_ms, published_at, model, prompt_version")
    .eq("industry_id", ind.id)
    .eq("status", "published")
    .order("brief_date", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!batch) return { __missing: "该行业暂无已发布内容。" };

  const { data: news } = await supabase
    .from("news_items")
    .select("id, importance, headline_zh, headline_en, summary_zh, summary_en, tags, source_name, source_url, published_at")
    .eq("batch_id", batch.id)
    .order("importance", { ascending: true });

  const { data: turns } = await supabase
    .from("dialogue_turns")
    .select("id, related_news_id, seq_no, speaker, text_en, text_zh, glosses, grammar, audio_url, start_ms, end_ms")
    .eq("batch_id", batch.id)
    .order("seq_no", { ascending: true });

  return {
    schemaVersion: "0.3",
    generatedAt: batch.published_at || `${batch.brief_date}T00:00:00+08:00`,
    industry: {
      id: ind.slug,
      name: ind.name_zh,
      nameEn: ind.name_en,
      icon: ind.icon || "🗞️",
    },
    news: (news || []).map((n) => ({
      id: String(n.id),
      importance: n.importance,
      headline: n.headline_zh,
      headlineEn: n.headline_en,
      summary: n.summary_zh,
      summaryEn: n.summary_en,
      tags: n.tags || [],
      source: n.source_name,
      sourceUrl: n.source_url,
      updatedAt: n.published_at,
      updatedLabel: fmtUpdated(n.published_at),
    })),
    dialogue: {
      title: batch.title,
      titleEn: batch.title_en,
      audio: {
        src: "/audio/" + (batch.full_audio_url || ""),
        durationMs: batch.duration_ms || 0,
        model: batch.model,
        promptVersion: batch.prompt_version,
      },
      turns: (turns || []).map((t) => ({
        id: "t-" + t.id,
        seq: t.seq_no,
        speaker: t.speaker,
        en: t.text_en,
        zh: t.text_zh,
        glosses: t.glosses || [],
        grammar: t.grammar || {},
        audio: {
          src: "/audio/" + (t.audio_url || ""),
          startMs: t.start_ms || 0,
          endMs: t.end_ms || 0,
          durationMs: Math.max(0, (t.end_ms || 0) - (t.start_ms || 0)),
        },
        relatedNewsId: t.related_news_id != null ? String(t.related_news_id) : null,
      })),
    },
  };
}

async function loadFromLocal(industry) {
  const dir = findSamplesDir();
  if (!dir) return NextResponse.json({ error: "content/samples 不存在" }, { status: 500 });
  let files = [];
  try { files = await fs.readdir(dir); } catch { files = []; }
  const matches = files
    .filter((f) => f.startsWith(industry + "-") && f.endsWith(".json"))
    .sort()
    .reverse();
  if (matches.length === 0) {
    return NextResponse.json({ error: `该行业暂无示例内容（${industry}）` }, { status: 404 });
  }
  const raw = await fs.readFile(path.join(dir, matches[0]), "utf-8");
  const data = JSON.parse(raw);
  // 本地 JSON 里相对音频路径 -> 绝对 URL
  const absolutize = (obj) => {
    if (Array.isArray(obj)) return obj.map(absolutize);
    if (obj && typeof obj === "object") {
      const out = {};
      for (const [k, v] of Object.entries(obj)) {
        if (k === "src" && typeof v === "string" && v.startsWith("audio/")) out[k] = "/audio/" + v;
        else out[k] = absolutize(v);
      }
      return out;
    }
    return obj;
  };
  return NextResponse.json(absolutize(data));
}

export async function GET(_req, { params }) {
  const { industry } = await params;
  const db = await loadFromSupabase(industry);
  if (db && db.__authRequired) {
    return NextResponse.json({ error: "登录后才能开始学习。请先登录。" }, { status: 401 });
  }
  if (db && db.__missing) {
    return NextResponse.json({ error: db.__missing }, { status: 404 });
  }
  if (db) {
    return NextResponse.json(db);
  }
  return loadFromLocal(industry);
}