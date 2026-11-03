import "server-only";
import { Task, TaskPage } from "@/lib/schemas/task";
import { db } from "@/lib/db";
import { tasks } from "@/lib/db/schema";
import { cache } from "react";
import { asc, ilike, eq, count, and } from "drizzle-orm";

export async function listTasks(keyword = ""): Promise<Task[]> {
  const escaped = keyword.replace(/[\\%_]/g, "\\$&");
  const condition = keyword ? ilike(tasks.title, `%${escaped}%`) : undefined;
  const taskList = await db
    .select({ id: tasks.id, title: tasks.title, status: tasks.status })
    .from(tasks)
    .where(condition)
    .orderBy(asc(tasks.createdAt), asc(tasks.id));

  return taskList;
}

export const getTaskById = cache(
  async (id: string): Promise<Task | undefined> => {
    const [task] = await db
      .select({ id: tasks.id, title: tasks.title, status: tasks.status })
      .from(tasks)
      .where(eq(tasks.id, id))
      .limit(1);

    return task;
  },
);

export async function listTasksPage(
  keyword = "",
  page = 1,
  status?: Task["status"],
): Promise<TaskPage> {
  const pageSize = 5;
  const offset = (page - 1) * pageSize;
  const escaped = keyword.replace(/[\\%_]/g, "\\$&");
  const condition = and(
    keyword ? ilike(tasks.title, `%${escaped}%`) : undefined,
    status ? eq(tasks.status, status) : undefined,
  );
  const [taskList, summaries] = await Promise.all([
    db
      .select({ id: tasks.id, title: tasks.title, status: tasks.status })
      .from(tasks)
      .where(condition)
      .orderBy(asc(tasks.createdAt), asc(tasks.id))
      .limit(pageSize)
      .offset(offset),
    db.select({ total: count() }).from(tasks).where(condition),
  ]);

  const [summary] = summaries;

  return {
    tasks: taskList,
    page,
    pageSize,
    total: summary.total,
  };
}
