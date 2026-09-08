"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState("signin"); // signin | signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [notice, setNotice] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr(""); setNotice("");
    if (!email.trim() || !password) { setErr("请输入邮箱和密码。"); return; }
    if (mode === "signup" && password.length < 6) { setErr("密码至少 6 位。"); return; }
    setBusy(true);
    const supabase = createClient();
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) { setErr(translateErr(error.message)); return; }
        router.push("/");
        router.refresh();
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: window.location.origin + "/login?confirmed=1" },
        });
        if (error) { setErr(translateErr(error.message)); return; }
        if (data.session) { router.push("/"); router.refresh(); }
        else { setNotice("注册成功！已发送确认邮件，请查收后登录。"); setMode("signin"); }
      }
    } finally {
      setBusy(false);
    }
  };

  const translateErr = (msg) => {
    if (/invalid login credentials/i.test(msg)) return "邮箱或密码不正确。";
    if (/already registered/i.test(msg)) return "该邮箱已注册，请直接登录。";
    if (/rate limit/i.test(msg)) return "操作太频繁，请稍后再试。";
    return msg;
  };

  return (
    <main className="wrap login-wrap">
      <Link className="back-link" href="/">← 返回首页</Link>
      <div className="login-card">
        <h1>{mode === "signin" ? "登录" : "注册"}</h1>
        <p className="login-sub">登录后同步学习进度、生词本与收藏。</p>
        {notice && <div className="auth-msg ok">{notice}</div>}
        {err && <div className="auth-msg err">{err}</div>}
        <form onSubmit={submit}>
          <label>
            邮箱
            <input
              type="email" value={email} autoComplete="email"
              onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required
            />
          </label>
          <label>
            密码
            <input
              type="password" value={password} autoComplete={mode === "signin" ? "current-password" : "new-password"}
              onChange={(e) => setPassword(e.target.value)} placeholder={mode === "signin" ? "输入密码" : "至少 6 位"} required
            />
          </label>
          <button className="login-submit" type="submit" disabled={busy}>
            {busy ? "请稍候…" : mode === "signin" ? "登录" : "创建账号"}
          </button>
        </form>
        <div className="login-switch">
          {mode === "signin" ? (
            <>还没有账号？ <button onClick={() => { setMode("signup"); setErr(""); setNotice(""); }}>去注册</button></>
          ) : (
            <>已有账号？ <button onClick={() => { setMode("signin"); setErr(""); setNotice(""); }}>去登录</button></>
          )}
        </div>
      </div>
    </main>
  );
}