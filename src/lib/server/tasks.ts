import "server-only";
import { Task } from "@/lib/schemas/task";
import { db } from "@/lib/db";
import { tasks } from "@/lib/db/schema";
import { asc, ilike, eq } from "drizzle-orm";
import { cache } from "react";

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
