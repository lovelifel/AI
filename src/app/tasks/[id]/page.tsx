import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { z } from "zod";
import { getTaskById } from "@/lib/server/tasks";

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ID = z.uuid().safeParse(id);
  if (!ID.success) {
    notFound();
  }
  const task = await getTaskById(ID.data);

  if (!task) {
    notFound();
  }

  return <h1>{task.title}</h1>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  const parsed = z.uuid().safeParse(id);
  if (!parsed.success) {
    notFound();
  }

  const task = await getTaskById(parsed.data);
  if (!task) {
    notFound();
  }

  return {
    title: `${task.title} · Agent Workspace`,
    description: `查看任务：${task.title}`,
  };
}
