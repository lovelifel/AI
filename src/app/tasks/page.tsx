import TaskDraft from "@/components/TaskDraft";
import type { Metadata } from "next";
import { listTasksPage } from "@/lib/server/tasks";
import { TaskListQuerySchema } from "@/lib/schemas/task";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/server/session";

export const metadata: Metadata = {
  title: "任务工作区 · Agent Workspace",
};
export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string | string[];
    page?: string | string[];
    status?: string | string[];
  }>;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const params = await searchParams;
  const parsed = TaskListQuerySchema.safeParse(params);
  if (!parsed.success) {
    return <p role="alert">搜索参数不合法</p>;
  }
  const initialResult = await listTasksPage(
    parsed.data.q,
    parsed.data.page,
    parsed.data.status,
  );
  const totalPages = Math.max(
    1,
    Math.ceil(initialResult.total / initialResult.pageSize),
  );

  if (parsed.data.page > totalPages) {
    const query = new URLSearchParams();

    if (parsed.data.q) {
      query.set("q", parsed.data.q);
    }

    if (parsed.data.status) {
      query.set("status", parsed.data.status);
    }
    query.set("page", String(totalPages));

    redirect(`/tasks?${query.toString()}`);
  }
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main>
        <h1>任务工作区</h1>
        <TaskDraft
          initialResult={initialResult}
          initialKeyword={parsed.data.q}
          initialStatus={parsed.data.status}
        />
      </main>
    </div>
  );
}
