"use client";
import type { Task } from "@/types/task";
import { useState } from "react";
import { CreateTaskRequestSchema } from "@/lib/schemas/task";
import { createTask } from "@/lib/api/tasks";

export default function TaskDraft() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [keyword, setKeyword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const query = keyword.trim().toLowerCase();
  const filteredTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(query),
  );

  async function handleAddTask() {
    if (isSubmitting) {
      return;
    }
    const input = CreateTaskRequestSchema.safeParse({ title: value });
    if (!input.success) {
      setError(input.error.issues[0]?.message ?? "任务名称不合法");
      return;
    }
    setError("");
    setIsSubmitting(true);
    try {
      const task = await createTask(input.data);
      setTasks((prev) => [...prev, task]);
      setValue("");
      setError("");
    } catch (error) {
      setError(error instanceof Error ? error.message : "添加失败，请稍后重试");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <p>任务仅保存在当前页面，尚未执行；刷新后清空。</p>
      <label htmlFor="task-search">搜索任务</label>
      <input
        id="task-search"
        className="rounded-md border border-zinc-400 bg-white px-3 py-2 text-zinc-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:border-zinc-500 dark:bg-zinc-900 dark:text-zinc-100"
        value={keyword}
        onChange={(event) => setKeyword(event.target.value)}
      />
      <button type="button" onClick={() => setKeyword("")}>
        清空搜索
      </button>
      <p>
        共 {tasks.length} 项，匹配 {filteredTasks.length} 项
      </p>
      {tasks.length === 0 ? (
        <p>暂无任务</p>
      ) : filteredTasks.length === 0 ? (
        <p>没有匹配的任务</p>
      ) : (
        <ul>
          {filteredTasks.map((task) => (
            <li key={task.id}>{task.title}</li>
          ))}
        </ul>
      )}
      <div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAddTask();
          }}
        >
          <label htmlFor="task">请输入:</label>
          <input
            id="task"
            className="rounded-md border border-zinc-400 bg-white px-3 py-2 text-zinc-950 placeholder:text-zinc-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:border-zinc-500 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-400"
            placeholder="输入任务名称"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={isSubmitting}
          />
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "添加中…" : "添加任务"}
          </button>
          {error && <p role="alert">{error}</p>}
        </form>
      </div>
    </div>
  );
}
