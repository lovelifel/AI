import { z } from "zod";

export const TaskTitleSchema = z.string()
  .trim()
  .min(1, "请输入任务名称")
  .max(30, "任务名称不能超过 30 个字符");

export const CreateTaskRequestSchema = z.object({ title: TaskTitleSchema });
export const TaskSchema = z.object({
  id: z.string().min(1),
  title: TaskTitleSchema,
});
export const CreateTaskResponseSchema = z.object({ task: TaskSchema });
export const ApiErrorSchema = z.object({ error: z.string().min(1) });

export type Task = z.infer<typeof TaskSchema>;
