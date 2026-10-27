import TaskDraft from "@/components/TaskDraft";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "任务工作区 · Agent Workspace",
};
export default async function TasksPage() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main>
        <h1>任务工作区</h1>
        <TaskDraft />
      </main>
    </div>
  );
}
