import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import { getTaskById } from "@/lib/server/tasks";
import TaskTitleForm from "@/components/TaskTitleForm";
import { getCurrentUser } from "@/lib/server/session";

// Validating the session requires request-time work before showing the task.
export const instant = false;

async function getVisibleTask(id: string) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const parsed = z.uuid().safeParse(id);
  if (!parsed.success) {
    notFound();
  }

  const task = await getTaskById(parsed.data);
  if (!task) {
    notFound();
  }
  return task;
}

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const task = await getVisibleTask(id);

  return (
    <main>
      <h1>{task.title}</h1>

      <TaskTitleForm key={task.id} id={task.id} title={task.title} />
    </main>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const task = await getVisibleTask(id);

  return {
    title: `${task.title} · Agent Workspace`,
    description: `查看任务：${task.title}`,
  };
}
