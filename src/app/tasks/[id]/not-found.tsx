import Link from "next/link";

export default function TaskNotFound() {
  return (
    <main className="mx-auto px-4 py-8">
      <h1>任务不存在</h1>
      <p>该任务可能已被删除，请返回列表查看。</p>
      <Link href="/tasks" className="underline">返回任务列表</Link>
    </main>
  );
}
