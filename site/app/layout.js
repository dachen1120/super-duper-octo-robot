import "./globals.css";

export const metadata = {
  title: "用兴趣学英语 · 行业新闻美语学习",
  description: "先选你感兴趣的行业，再通过最新新闻的 A/B 双语对话练习美式英语听力与口语。",
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}