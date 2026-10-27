"use client";
import type { Task } from "@/types/task";
import { useEffect, useRef, useState } from "react";
import { CreateTaskRequestSchema } from "@/lib/schemas/task";
import { createTask, deleteTask, getTasks } from "@/lib/api/tasks";

export default function TaskDraft() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [keyword, setKeyword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const mutationInFlight = useRef(false);
  const isFormDisabled = isSubmitting || deletingId !== null || isLoading || Boolean(loadError);
  const query = keyword.trim().toLowerCase();
  const filteredTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(query),
  );

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const tasks = await getTasks();
        if (!ignore) setTasks(tasks);
      } catch {
        if (!ignore) setLoadError("读取任务失败，请刷新重试");
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    void load();

    return () => {
      ignore = true;
    };
  }, []);
  async function handleAddTask() {
    if (isFormDisabled || mutationInFlight.current) {
      return;
    }
    const input = CreateTaskRequestSchema.safeParse({ title: value });
    if (!input.success) {
      setError(input.error.issues[0]?.message ?? "任务名称不合法");
      return;
    }
    setError("");
    mutationInFlight.current = true;
    setIsSubmitting(true);
    try {
      const task = await createTask(input.data);
      setTasks((prev) => [...prev, task]);
      setValue("");
      setError("");
    } catch (error) {
      setError(error instanceof Error ? error.message : "添加失败，请稍后重试");
    } finally {
      mutationInFlight.current = false;
      setIsSubmitting(false);
    }
  }

  async function handleDeleteTask(id: string) {
    if (isFormDisabled || mutationInFlight.current) return;

    mutationInFlight.current = true;
    setDeletingId(id);
    setDeleteError("");
    try {
      await deleteTask(id);
      setTasks((prev) => prev.filter((task) => task.id !== id));
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : "删除任务失败，请稍后重试");
    } finally {
      mutationInFlight.current = false;
      setDeletingId(null);
    }
  }

  return (
    <div>
      <p>任务已保存到数据库，尚未执行。</p>
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
      {isLoading ? (
        <p role="status">加载中…</p>
      ) : loadError ? (
        <p role="alert">{loadError}</p>
      ) : (
        <>
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
                <li key={task.id} className="flex items-center gap-3">
                  <span>{task.title}</span>
                  <button
                    type="button"
                    disabled={isFormDisabled}
                    aria-label={`删除任务：${task.title}`}
                    onClick={() => void handleDeleteTask(task.id)}
                    className="rounded border border-red-400 px-2 py-1 text-red-700 disabled:opacity-50 dark:text-red-300"
                  >
                    {deletingId === task.id ? "删除中…" : "删除"}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
      {deleteError && <p role="alert">{deleteError}</p>}
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
            disabled={isFormDisabled}
          />
          <button type="submit" disabled={isFormDisabled}>
            {isSubmitting ? "添加中…" : "添加任务"}
          </button>
          {error && <p role="alert">{error}</p>}
        </form>
      </div>
    </div>
  );
}
