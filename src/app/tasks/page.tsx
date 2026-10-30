import TaskDraft from "@/components/TaskDraft";
import type { Metadata } from "next";
import { listTasks } from "@/lib/server/tasks";
import { TaskSearchQuerySchema } from "@/lib/schemas/task";

export const metadata: Metadata = {
  title: "任务工作区 · Agent Workspace",
};
export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const params = await searchParams;
  const parsed = TaskSearchQuerySchema.safeParse(params);
  if (!parsed.success) {
    return <p role="alert">搜索参数不合法</p>;
  }
  const initialTasks = await listTasks(parsed.data.q);
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main>
        <h1>任务工作区</h1>
        <TaskDraft taskList={initialTasks} initialKeyword={parsed.data.q} />
      </main>
    </div>
  );
}
