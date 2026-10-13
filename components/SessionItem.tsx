// components/sidebar/SessionItem.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import type { ChatSession } from "@/lib/db";

interface SessionItemProps {
  session: ChatSession;
  isActive: boolean;
  onSelect: (id: string) => void;
  onRename: (id: string, newTitle: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function SessionItem({
  session,
  isActive,
  onSelect,
  onRename,
  onDelete,
}: SessionItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempTitle, setTempTitle] = useState(session.title);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // 进入编辑状态时，同步最新的 session.title 并开启编辑
  const handleStartEditing = () => {
    setTempTitle(session.title);
    setIsEditing(true);
  };


  // 切入编辑态时自动聚焦且全选
  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  // 点击菜单外部（Click Outside）或按 Esc 关闭下拉菜单
  useEffect(() => {
    if (!isMenuOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        setIsMenuOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  // 提交重命名并持久化
  const handleCommitRename = async () => {
    setIsEditing(false);
    const trimmed = tempTitle.trim();
    if (trimmed && trimmed !== session.title) {
      await onRename(session.id, trimmed);
    } else {
      setTempTitle(session.title); // 空字符或未变更则回滚
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.currentTarget.blur(); // 触发 onBlur 统一保存
    } else if (e.key === "Escape") {
      setTempTitle(session.title);
      setIsEditing(false);
    }
  };

  return (
    <div
      onClick={() => onSelect(session.id)}
      className={`group relative flex items-center justify-between h-9 px-3 rounded-lg cursor-pointer text-sm select-none transition-colors ${
        isActive
          ? "bg-zinc-800 text-zinc-100 font-medium"
          : "text-zinc-400 hover:bg-zinc-850 hover:text-zinc-200"
      }`}
    >
      {/* 文本展示 / 重命名输入框 */}
      <div className="flex-1 min-w-0 pr-2">
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={tempTitle}
            onChange={(e) => setTempTitle(e.target.value)}
            onBlur={handleCommitRename}
            onKeyDown={handleInputKeyDown}
            onClick={(e) => e.stopPropagation()} // 阻止选中文本时触发会话切换
            className="w-full bg-zinc-900 text-zinc-100 text-xs px-2 py-0.5 rounded border border-blue-500 outline-none ring-1 ring-blue-500/30"
          />
        ) : (
          <span
            onDoubleClick={(e) => {
              e.stopPropagation();
              handleStartEditing();
            }}
            className="block truncate text-xs sm:text-sm"
            title={session.title || "新会话"}
          >
            {session.title || "新会话"}
          </span>
        )}
      </div>

      {/* 移入浮现的三点操作按钮 */}
      {!isEditing && (
        <div className="relative flex items-center">
          <button
            ref={triggerRef}
            type="button"
            title="更多操作"
            onClick={(e) => {
              e.stopPropagation(); // 阻止触发会话选中
              setIsMenuOpen((prev) => !prev);
            }}
            className={`p-1 rounded-md transition-all ${
              isMenuOpen
                ? "opacity-100 bg-zinc-700 text-zinc-100"
                : "opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-zinc-150 hover:bg-zinc-750"
            }`}
          >
            {/* 三点图标 */}
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="1" />
              <circle cx="19" cy="12" r="1" />
              <circle cx="5" cy="12" r="1" />
            </svg>
          </button>

          {/* 下拉浮动菜单 */}
          {isMenuOpen && (
            <div
              ref={menuRef}
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-7 z-50 w-28 py-1 bg-zinc-900 border border-zinc-750 rounded-lg shadow-xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-100"
            >
              {/* 重命名 */}
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  handleStartEditing();
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
              >
                <svg
                  className="w-3.5 h-3.5 text-zinc-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                  <path d="m15 5 4 4" />
                </svg>
                重命名
              </button>

              <div className="h-px bg-zinc-800 my-1" />

              {/* 删除 */}
              <button
                type="button"
                onClick={async () => {
                  setIsMenuOpen(false);
                  await onDelete(session.id);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors"
              >
                <svg
                  className="w-3.5 h-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 6h18" />
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                </svg>
                删除会话
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
