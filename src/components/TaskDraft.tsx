"use client";
import type { Task } from "@/types/task";
import { useEffect, useRef, useState } from "react";
import { CreateTaskRequestSchema } from "@/lib/schemas/task";
import {
  createTask,
  deleteTask,
  getTasks,
  updateTaskStatus,
} from "@/lib/api/tasks";

export default function TaskDraft({ taskList }: { taskList: Task[] }) {
  const [tasks, setTasks] = useState<Task[]>([...taskList]);
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [keyword, setKeyword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const mutationInFlight = useRef(false);
  const isMutating = isSubmitting || deletingId !== null || updatingId !== null;
  const isFormDisabled = isMutating || isLoading || Boolean(loadError);
  const query = keyword.trim();

  useEffect(() => {
    let ignore = false;
    const controller = new AbortController();

    async function load() {
      try {
        const tasks = await getTasks(query, controller.signal);
        if (!ignore) setTasks(tasks);
      } catch (error) {
        if (!ignore && !controller.signal.aborted) {
          setLoadError(
            error instanceof Error ? error.message : "读取任务失败，请重试",
          );
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    const timer = window.setTimeout(() => void load(), query ? 300 : 0);

    return () => {
      ignore = true;
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query, reloadKey]);

  function handleSearchChange(nextKeyword: string) {
    if (mutationInFlight.current) return;
    setKeyword(nextKeyword);
    if (nextKeyword.trim() !== query) {
      setLoadError(null);
      setIsLoading(true);
    }
  }

  function reloadSearch() {
    setLoadError(null);
    setIsLoading(true);
    setReloadKey((prev) => prev + 1);
  }
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
      await createTask(input.data);
      setValue("");
      setError("");
      reloadSearch();
    } catch (error) {
      setError(error instanceof Error ? error.message : "添加失败，请稍后重试");
    } finally {
      mutationInFlight.current = false;
      setIsSubmitting(false);
    }
  }
  async function handleUpdateTaskStatus(id: string, status: Task["status"]) {
    if (isFormDisabled || mutationInFlight.current) return;

    mutationInFlight.current = true;
    setUpdatingId(id);
    setUpdateError("");
    try {
      const updated = await updateTaskStatus(id, status);
      setTasks((prev) =>
        prev.map((task) => (task.id === updated.id ? updated : task)),
      );
    } catch (error) {
      setUpdateError(
        error instanceof Error ? error.message : "更新任务失败，请稍后重试",
      );
    } finally {
      mutationInFlight.current = false;
      setUpdatingId(null);
    }
  }
  async function handleDeleteTask(id: string) {
    if (isFormDisabled || mutationInFlight.current) return;

    mutationInFlight.current = true;
    setDeletingId(id);
    setDeleteError("");
    try {
      await deleteTask(id);
      reloadSearch();
    } catch (error) {
      setDeleteError(
        error instanceof Error ? error.message : "删除任务失败，请稍后重试",
      );
    } finally {
      mutationInFlight.current = false;
      setDeletingId(null);
    }
  }

  return (
    <div>
      <p>任务已保存到数据库；状态为手动标记，尚未接入 Agent 执行。</p>
      <label htmlFor="task-search">搜索任务</label>
      <input
        id="task-search"
        className="rounded-md border border-zinc-400 bg-white px-3 py-2 text-zinc-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:border-zinc-500 dark:bg-zinc-900 dark:text-zinc-100"
        value={keyword}
        onChange={(event) => handleSearchChange(event.target.value)}
        disabled={isMutating}
      />
      <button
        type="button"
        disabled={isMutating}
        onClick={() => handleSearchChange("")}
      >
        清空搜索
      </button>
      {isLoading ? (
        <p role="status">正在查询任务…</p>
      ) : loadError ? (
        <div>
          <p role="alert">{loadError}</p>
          <button type="button" onClick={reloadSearch}>
            重试查询
          </button>
        </div>
      ) : (
        <>
          <p>
            {query ? "匹配" : "共"} {tasks.length} 项任务
          </p>
          {tasks.length === 0 ? (
            <p>{query ? "没有匹配的任务" : "暂无任务"}</p>
          ) : (
            <ul>
              {tasks.map((task) => (
                <li key={task.id} className="flex items-center gap-3">
                  <span>{task.title}</span>
                  <span
                    className={
                      task.status === "done"
                        ? "text-green-700 dark:text-green-300"
                        : "text-zinc-600 dark:text-zinc-300"
                    }
                  >
                    {task.status === "done" ? "已完成" : "待完成"}
                  </span>
                  <button
                    type="button"
                    disabled={isFormDisabled}
                    aria-label={`${task.status === "done" ? "标记待完成" : "标记完成"}：${task.title}`}
                    onClick={() =>
                      void handleUpdateTaskStatus(
                        task.id,
                        task.status === "done" ? "todo" : "done",
                      )
                    }
                    className="rounded border border-blue-400 px-2 py-1 text-blue-700 disabled:opacity-50 dark:text-blue-300"
                  >
                    {updatingId === task.id
                      ? "更新中…"
                      : task.status === "done"
                        ? "标记待完成"
                        : "标记完成"}
                  </button>
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
      {updateError && <p role="alert">{updateError}</p>}
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
