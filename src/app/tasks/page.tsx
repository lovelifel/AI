import TaskDraft from "@/components/TaskDraft";
import { db } from "@/lib/db";
import { tasks } from "@/lib/db/schema";
import { asc } from "drizzle-orm";
import type { Metadata } from "next";

const getData = async () => {
  const taskList = await db
    .select({ id: tasks.id, title: tasks.title, status: tasks.status })
    .from(tasks)
    .orderBy(asc(tasks.createdAt), asc(tasks.id));
  return taskList;
};

export const metadata: Metadata = {
  title: "任务工作区 · Agent Workspace",
};
export default async function TasksPage() {
  const initialTasks = await getData();
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main>
        <h1>任务工作区</h1>
        <TaskDraft taskList={initialTasks} />
      </main>
    </div>
  );
}
