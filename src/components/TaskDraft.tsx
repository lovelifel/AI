"use client";
import type { Task, TaskPage } from "@/lib/schemas/task";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CreateTaskRequestSchema, TaskListQuerySchema } from "@/lib/schemas/task";
import {
  createTask,
  deleteTask,
  getTasksPage,
  updateTaskStatus,
} from "@/lib/api/tasks";

export default function TaskDraft({
  initialResult,
  initialKeyword,
  initialStatus,
}: {
  initialResult: TaskPage;
  initialKeyword: string;
  initialStatus?: Task["status"];
}) {
  const [result, setResult] = useState(initialResult);
  const [page, setPage] = useState(initialResult.page);
  const tasks = result.tasks;
  const totalPages = Math.max(1, Math.ceil(result.total / result.pageSize));
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [keyword, setKeyword] = useState(initialKeyword);
  const [statusFilter, setStatusFilter] = useState<Task["status"] | "">(initialStatus ?? "");
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
  const query = keyword.trim();
  const searchParams = useSearchParams();
  const urlQuery = TaskListQuerySchema.safeParse({
    q: searchParams.get("q") ?? "",
    page: searchParams.get("page") ?? undefined,
    status: searchParams.get("status") ?? undefined,
  });
  const urlValid = urlQuery.success;
  const isFormDisabled = isMutating || isLoading || Boolean(loadError) || !urlValid;
  const urlKeyword = urlQuery.success ? urlQuery.data.q : "";
  const urlPage = urlQuery.success ? urlQuery.data.page : 1;
  const urlStatus = urlQuery.success ? urlQuery.data.status ?? "" : "";
  const lastUrlQuery = useRef(JSON.stringify([initialKeyword, initialResult.page, initialStatus ?? ""]));

  useEffect(() => {
    if (!urlValid) return;
    const nextQuery = JSON.stringify([urlKeyword, urlPage, urlStatus]);
    if (lastUrlQuery.current === nextQuery) return;
    lastUrlQuery.current = nextQuery;
    setKeyword(urlKeyword);
    setPage(urlPage);
    setStatusFilter(urlStatus);
    setLoadError(null);
    setIsLoading(true);
    setReloadKey((prev) => prev + 1);
  }, [urlKeyword, urlPage, urlStatus, urlValid]);

  useEffect(() => {
    if (reloadKey === 0 || !urlValid) return;
    let ignore = false;
    let correctingPage = false;
    const controller = new AbortController();

    async function load() {
      try {
        const url = new URL(window.location.href);
        if (query) {
          url.searchParams.set("q", query);
        } else {
          url.searchParams.delete("q");
        }
        if (page === 1) url.searchParams.delete("page");
        else url.searchParams.set("page", String(page));
        if (statusFilter) url.searchParams.set("status", statusFilter);
        else url.searchParams.delete("status");
        // Do not re-query in response to our own URL update.
        lastUrlQuery.current = JSON.stringify([query, page, statusFilter]);
        window.history.replaceState(null, "", url);
        const nextResult = await getTasksPage(query, page, controller.signal, statusFilter || undefined);
        if (ignore) return;
        const lastPage = Math.max(1, Math.ceil(nextResult.total / nextResult.pageSize));
        if (page > lastPage) {
          correctingPage = true;
          setPage(lastPage);
          return;
        }
        setResult(nextResult);
      } catch (error) {
        if (!ignore && !controller.signal.aborted) {
          setLoadError(
            error instanceof Error ? error.message : "读取任务失败，请重试",
          );
        }
      } finally {
        if (!ignore && !correctingPage) setIsLoading(false);
      }
    }

    const timer = window.setTimeout(() => void load(), query ? 300 : 0);

    return () => {
      ignore = true;
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query, page, statusFilter, reloadKey, urlValid]);

  function handleSearchChange(nextKeyword: string) {
    if (mutationInFlight.current) return;
    setKeyword(nextKeyword);
    if (nextKeyword.trim() !== query) {
      setPage(1);
      setLoadError(null);
      setIsLoading(true);
      setReloadKey((prev) => prev + 1);
    }
  }

  function changePage(nextPage: number) {
    if (isFormDisabled || mutationInFlight.current || nextPage === page) return;
    setPage(nextPage);
    setLoadError(null);
    setIsLoading(true);
    setReloadKey((prev) => prev + 1);
  }

  function changeStatus(nextStatus: Task["status"] | "") {
    if (mutationInFlight.current || nextStatus === statusFilter) return;
    setStatusFilter(nextStatus);
    setPage(1);
    reloadSearch();
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
      if (statusFilter) {
        // Re-query to update membership, total and the current page together.
        reloadSearch();
      } else {
        setResult((prev) => ({
          ...prev,
          tasks: prev.tasks.map((task) => (task.id === updated.id ? updated : task)),
        }));
      }
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
      <label htmlFor="task-status-filter">任务状态</label>
      <select
        id="task-status-filter"
        value={statusFilter}
        disabled={isMutating}
        onChange={(event) => {
          const nextStatus = event.target.value;
          if (nextStatus === "" || nextStatus === "todo" || nextStatus === "done") {
            changeStatus(nextStatus);
          }
        }}
        className="mr-3 rounded border border-zinc-400 bg-white px-3 py-2 text-zinc-950 dark:bg-zinc-900 dark:text-zinc-100"
      >
        <option value="">全部状态</option>
        <option value="todo">待完成</option>
        <option value="done">已完成</option>
      </select>
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
      {!urlValid ? (
        <p role="alert">查询参数不合法，请检查搜索词、页码和状态</p>
      ) : isLoading ? (
        <p role="status">正在查询任务…</p>
      ) : loadError ? (
        <div>
          <p role="alert">{loadError}</p>
          <button type="button" onClick={reloadSearch} disabled={!urlValid}>
            重试查询
          </button>
        </div>
      ) : (
        <>
          <p>
            {query || statusFilter ? "匹配" : "共"} {result.total} 项任务，本页 {tasks.length} 项
          </p>
          {tasks.length === 0 ? (
            <p>{result.total > 0 ? "当前页没有任务，请返回上一页" : query || statusFilter ? "没有匹配的任务" : "暂无任务"}</p>
          ) : (
            <ul>
              {tasks.map((task) => (
                <li key={task.id} className="flex items-center gap-3">
                  <Link
                    href={`/tasks/${task.id}`}
                    className="underline underline-offset-4"
                  >
                    {task.title}
                  </Link>
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
          <nav aria-label="任务分页" className="my-3 flex items-center gap-3 [&_button:disabled]:opacity-40">
            <button type="button" disabled={isFormDisabled || page <= 1} onClick={() => changePage(1)}>
              第一页
            </button>
            <button type="button" disabled={isFormDisabled || page <= 1} onClick={() => changePage(page - 1)}>
              上一页
            </button>
            <span>第 {page} 页，共 {totalPages} 页</span>
            <button type="button" disabled={isFormDisabled || page >= totalPages} onClick={() => changePage(page + 1)}>
              下一页
            </button>
          </nav>
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
