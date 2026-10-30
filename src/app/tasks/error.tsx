"use client";

export default function TasksError({
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  return (
    <main className="mx-auto px-4 py-8">
      <p role="alert">任务工作区加载失败，请稍后重试。</p>
      <button
        type="button"
        onClick={() => retry()}
        className="mt-3 rounded border border-blue-400 px-3 py-2 text-blue-700 dark:text-blue-300"
      >
        重新加载任务
      </button>
    </main>
  );
}
