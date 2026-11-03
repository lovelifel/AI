"use client";

import { useActionState, useState } from "react";
import { updateTaskTitle } from "@/app/tasks/actions";
import type { UpdateTaskTitleState } from "@/app/tasks/actions";

const initialState: UpdateTaskTitleState = { success: false };

export default function TaskTitleForm({ id, title }: { id: string; title: string }) {
  const [state, formAction, pending] = useActionState(updateTaskTitle, initialState);
  const [value, setValue] = useState(title);
  const [edited, setEdited] = useState(false);
  const hasChanges = value.trim() !== title;
  const canSave = !pending && hasChanges && value.trim().length > 0;

  function cancelChanges() {
    setValue(title);
    setEdited(true);
  }

  return (
    <form
      action={formAction}
      onSubmit={() => setEdited(false)}
      className="mt-4 flex flex-col gap-3"
    >
      <input type="hidden" name="id" value={id} />
      <label htmlFor="task-title">任务标题</label>
      <input
        id="task-title"
        name="title"
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
          setEdited(true);
        }}
        maxLength={30}
        required
        readOnly={pending}
        className="rounded border border-zinc-400 bg-transparent px-3 py-2"
      />
      <button type="submit" disabled={!canSave} className="rounded border px-3 py-2 disabled:opacity-50">
        {pending ? "保存中…" : "保存"}
      </button>
      <button
        type="button"
        disabled={pending || value === title}
        onClick={cancelChanges}
        className="rounded border px-3 py-2 disabled:opacity-50"
      >
        取消修改
      </button>
      {!pending && !edited && state.error && <p role="alert">{state.error}</p>}
      <p role="status">{!pending && !edited && state.success ? "保存成功" : ""}</p>
    </form>
  );
}
