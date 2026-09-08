"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AuthNav() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (alive) { setUser(data.user ?? null); setLoading(false); }
    }).catch(() => { if (alive) setLoading(false); });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (alive) setUser(session?.user ?? null);
    });

    return () => { alive = false; sub?.subscription.unsubscribe(); };
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    window.location.reload();
  };

  if (loading) return <span className="auth-nav placeholder">…</span>;

  if (user) {
    const email = user.email ?? "";
    return (
      <div className="auth-nav">
        <span className="auth-user" title={email}>
          <span className="auth-avatar">{email.slice(0, 1).toUpperCase()}</span>
          <span className="auth-email">{email}</span>
        </span>
        <button className="auth-nav-btn" onClick={handleSignOut}>退出</button>
      </div>
    );
  }

  return (
    <Link className="auth-nav-btn primary" href="/login">登录 / 注册</Link>
  );
}