import Link from "next/link";
import industries from "@/lib/industries";
import AuthNav from "@/components/AuthNav";
import IndustryGrid from "@/components/IndustryGrid";

export default function HomePage() {
  return (
    <main className="home">
      <div className="home-top"><AuthNav /></div>
      <section className="home-hero">
        <h1>用兴趣学英语 🎧</h1>
        <p className="home-sub">
          选一个你感兴趣的行业，用最新新闻的 A/B 双语对话练习美式英语听力与口语。
        </p>
      </section>
      <section>
        <h2 className="home-section-title">选择行业</h2>
        <IndustryGrid industries={industries} />
        <p className="muted home-avail-note">带「敬请期待」的行业内容正在准备中；学习内容需登录后查看。</p>
      </section>
      <footer className="home-foot">
        内容基于公开新闻报道生成（含来源与原文链接），仅供学习参考，请以原文为准。
      </footer>
    </main>
  );
}