import Link from "next/link";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Agent Workspace · 学习项目",
  description:
    "这个应用是帮助我，学习AI应用开发得一个项目,目的之掌握传统前端向AI应用开发得完整流程",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <nav className="flex gap-4 mx-auto py-6">
          <Link href="/">首页</Link>
          <Link href="/tasks">任务工作区</Link>
        </nav>
        {children}
      </body>
    </html>
  );
}
