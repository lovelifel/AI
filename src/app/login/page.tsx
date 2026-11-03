import type { Metadata } from "next";
import AuthPanel from "@/components/AuthPanel";

export const metadata: Metadata = { title: "登录与注册 · Agent Workspace" };

export default function LoginPage() {
  return (
    <main className="mx-auto w-full max-w-md px-4 py-8">
      <h1>登录与注册</h1>
      <AuthPanel />
    </main>
  );
}
