"use client";

import { useRef, useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function AuthPanel() {
  const { data: session, isPending, error: sessionError, refetch } = authClient.useSession();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const inFlight = useRef(false);

  async function submit() {
    if (inFlight.current) return;
    if (mode === "register" && !name.trim()) {
      setError("请输入姓名");
      return;
    }
    inFlight.current = true;
    setPending(true);
    setError("");
    setMessage("");
    try {
      const result = mode === "register"
        ? await authClient.signUp.email({ name: name.trim(), email: email.trim(), password })
        : await authClient.signIn.email({ email: email.trim(), password });
      if (result.error) {
        setError(result.error.message || "认证失败，请检查输入后重试");
        return;
      }
      setPassword("");
      setMessage(mode === "register" ? "注册成功，已登录" : "登录成功");
      await refetch();
    } catch {
      setError("请求失败，请稍后重试");
    } finally {
      inFlight.current = false;
      setPending(false);
    }
  }

  async function signOut() {
    if (inFlight.current) return;
    inFlight.current = true;
    setPending(true);
    setError("");
    setMessage("");
    try {
      const result = await authClient.signOut();
      if (result.error) {
        setError(result.error.message || "退出失败，请重试");
        return;
      }
      setPassword("");
      setMode("login");
      setMessage("已退出登录");
      await refetch();
    } catch {
      setError("退出失败，请稍后重试");
    } finally {
      inFlight.current = false;
      setPending(false);
    }
  }

  const inputClass = "rounded border border-zinc-400 bg-transparent px-3 py-2";
  const buttonClass = "rounded border px-3 py-2 disabled:opacity-40";

  return (
    <section className="mt-4 flex flex-col gap-4">
      {isPending ? <p role="status">正在读取登录状态…</p> : sessionError ? (
        <div>
          <p role="alert">读取登录状态失败，请重试。</p>
          <button type="button" className={buttonClass} onClick={() => void refetch()}>重新读取</button>
        </div>
      ) : session ? (
        <div className="flex flex-col gap-3">
          <h2>当前已登录</h2>
          <p>姓名：{session.user.name}</p>
          <p>邮箱：{session.user.email}</p>
          <button type="button" className={buttonClass} disabled={pending} onClick={() => void signOut()}>
            {pending ? "退出中…" : "退出登录"}
          </button>
        </div>
      ) : (
        <>
          <div className="flex gap-3">
            <button type="button" className={buttonClass} aria-pressed={mode === "login"} disabled={pending} onClick={() => { setMode("login"); setPassword(""); setError(""); setMessage(""); }}>登录</button>
            <button type="button" className={buttonClass} aria-pressed={mode === "register"} disabled={pending} onClick={() => { setMode("register"); setPassword(""); setError(""); setMessage(""); }}>注册</button>
          </div>
          <h2>{mode === "register" ? "注册账号" : "登录账号"}</h2>
          <form className="flex flex-col gap-3" onSubmit={(event) => { event.preventDefault(); void submit(); }}>
            {mode === "register" && (
              <>
                <label htmlFor="auth-name">姓名</label>
                <input id="auth-name" name="name" autoComplete="name" className={inputClass} required maxLength={100} readOnly={pending} value={name} onChange={(event) => setName(event.target.value)} />
              </>
            )}
            <label htmlFor="auth-email">邮箱</label>
            <input id="auth-email" name="email" type="email" autoComplete="email" className={inputClass} required readOnly={pending} value={email} onChange={(event) => setEmail(event.target.value)} />
            <label htmlFor="auth-password">密码</label>
            <input id="auth-password" name="password" type="password" autoComplete={mode === "register" ? "new-password" : "current-password"} className={inputClass} required minLength={mode === "register" ? 8 : undefined} maxLength={128} readOnly={pending} value={password} onChange={(event) => setPassword(event.target.value)} />
            <button type="submit" disabled={pending} className={buttonClass}>{pending ? "提交中…" : mode === "register" ? "创建账号" : "登录账号"}</button>
          </form>
        </>
      )}
      {error && <p role="alert">{error}</p>}
      <p role="status">{message}</p>
    </section>
  );
}
