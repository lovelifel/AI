// components/Sidebar.tsx
"use client";

import React from "react";
import { ChatSession } from "@/lib/db";

interface SidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  currentSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
}) => {
  return (
    <aside className="w-64 bg-zinc-900 text-zinc-200 flex flex-col h-screen border-r border-zinc-800 select-none">
      {/* 顶部：新建对话按钮 */}
      <div className="p-3 border-b border-zinc-800">
        <button
          onClick={onNewSession}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700/80 text-sm font-medium transition-colors border border-zinc-700/60 shadow-sm"
        >
          <span className="text-base font-bold">+</span>
          <span>新建对话</span>
        </button>
      </div>

      {/* 中间：历史会话列表 */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
        {sessions.length === 0 ? (
          <div className="text-xs text-zinc-500 text-center py-8">
            暂无历史对话
          </div>
        ) : (
          sessions.map((session) => {
            const isActive = session.id === currentSessionId;
            return (
              <div
                key={session.id}
                onClick={() => onSelectSession(session.id)}
                className={`group flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer text-xs transition-colors ${
                  isActive
                    ? "bg-zinc-800 text-white font-medium shadow-inner"
                    : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
                }`}
              >
                {/* 会话标题（带单行省略） */}
                <div className="flex items-center gap-2 min-w-0 flex-1 pr-2">
                  <span className="text-zinc-500">💬</span>
                  <span className="truncate">{session.title}</span>
                </div>

                {/* 悬浮显示的删除按钮 */}
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // 阻止触发选中
                    onDeleteSession(session.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-400 text-zinc-500 transition-opacity"
                  title="删除此会话"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* 底部信息栏 */}
      <div className="p-3 border-t border-zinc-800 text-[11px] text-zinc-500 text-center">
        本地持久化 (IndexedDB)
      </div>
    </aside>
  );
};
