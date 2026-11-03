"use server";

import { db } from "@/lib/db";
import { z } from "zod";
import { TaskTitleSchema } from "@/lib/schemas/task";
import { eq } from "drizzle-orm";
import { tasks } from "@/lib/db/schema";
import { revalidatePath } from "next/cache";

const UpdateTaskTitleSchema = z.object({
  id: z.uuid(),
  title: TaskTitleSchema,
});

export type UpdateTaskTitleState = {
  success: boolean;
  error?: string;
};

export async function updateTaskTitle(
  _prevState: UpdateTaskTitleState,
  formData: FormData,
): Promise<UpdateTaskTitleState> {
  const id = formData.get("id");
  const title = formData.get("title");
  const result = UpdateTaskTitleSchema.safeParse({ id, title });
  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0]?.message ?? "参数格式错误",
    };
  }
  let task;

  try {
    [task] = await db
      .update(tasks)
      .set({ title: result.data.title })
      .where(eq(tasks.id, result.data.id))
      .returning({ id: tasks.id });

    if (!task) {
      return { success: false, error: "任务不存在或已被删除" };
    }
  } catch (error) {
    console.error("更新任务标题失败", error);
    return { success: false, error: "保存失败，请稍后重试" };
  }
  revalidatePath(`/tasks/${result.data.id}`);
  revalidatePath("/tasks");

  return { success: true };
}
