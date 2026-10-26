import type { Task } from "@/types/task";
import { ApiErrorSchema, CreateTaskResponseSchema } from "@/lib/schemas/task";
export async function createTask(
    input: { title: string },
): Promise<Task> {
    const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
    });
    const data: unknown = await response.json().catch(() => null);

    if (!response.ok) {
        const failure = ApiErrorSchema.safeParse(data);
        throw new Error(failure.success ? failure.data.error : "添加失败，请稍后重试");
    }
    const result = CreateTaskResponseSchema.safeParse(data);
    if (!result.success) {
        throw new Error("服务端返回的任务格式不正确");
    }
    return result.data.task;
}