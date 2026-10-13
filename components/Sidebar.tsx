"use client";
import { useState } from "react";
import type { ChatSession } from "@/lib/db";
import { SessionItem } from "./SessionItem";

interface SidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onRenameSession: (id: string, newTitle: string) => Promise<void>;
  onDeleteSession: (id: string) => Promise<void>;
  onNewSession: () => void;
  onClearAll: () => Promise<void>;
}

export function Sidebar({
  sessions,
  currentSessionId,
  onSelectSession,
  onRenameSession,
  onDeleteSession,
  onNewSession,
  onClearAll,
}: SidebarProps) {
  const [collapse, setCollapse] = useState(false);

  const toggleCollapse = () => {
    setCollapse(!collapse);
  };

  return (
    <>
      {/* 收起状态下的浮动快捷展开入口 */}
      {collapse && (
        <div className="fixed top-2.5 left-3 z-30 flex items-center gap-1 bg-zinc-900/90 border border-zinc-750 rounded-lg p-1 shadow-lg backdrop-blur-md transition-all animate-in fade-in duration-200">
          <button
            type="button"
            onClick={toggleCollapse}
            className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
            title="展开侧边栏"
          >
            {/* 展开面板图标 */}
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M9 3v18" />
              <path d="m14 9 3 3-3 3" />
            </svg>
          </button>
          <div className="w-px h-4 bg-zinc-800" />
          <button
            type="button"
            onClick={onNewSession}
            className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
            title="新建对话"
          >
            {/* 新建对话加号 */}
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </div>
      )}

      {/* 侧边栏主体：支持平滑宽度伸缩过渡 */}
      <aside
        className={`relative h-full bg-zinc-950 border-r border-zinc-800 flex flex-col select-none transition-all duration-300 ease-in-out shrink-0 overflow-hidden ${
          collapse ? "w-0 border-r-0 opacity-0 pointer-events-none" : "w-64 opacity-100"
        }`}
      >
        <div className="w-64 h-full flex flex-col p-3 shrink-0">
          {/* 顶部：标题与收起操作栏 */}
          <div className="flex items-center justify-between mb-2 px-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 tracking-wider">
              <svg
                className="w-3.5 h-3.5 text-zinc-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span>历史记录</span>
            </div>
            <button
              type="button"
              onClick={toggleCollapse}
              className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-850 transition-colors"
              title="收起侧边栏"
            >
              {/* 收起面板图标 */}
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M9 3v18" />
                <path d="m16 15-3-3 3-3" />
              </svg>
            </button>
          </div>

          {/* 新建对话按钮 */}
          <button
            type="button"
            onClick={onNewSession}
            className="w-full flex items-center justify-between py-2 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-850 text-zinc-200 text-xs sm:text-sm font-medium border border-zinc-800 transition-colors"
          >
            <span>新建对话</span>
            <span className="text-zinc-400 text-base leading-none">+</span>
          </button>

          {/* 中部：历史会话滚动列表 */}
          <div className="flex-1 overflow-y-auto mt-3 space-y-1 pr-1 custom-scrollbar">
            {sessions.map((session) => (
              <SessionItem
                key={session.id}
                session={session}
                isActive={session.id === currentSessionId}
                onSelect={onSelectSession}
                onRename={onRenameSession}
                onDelete={onDeleteSession}
              />
            ))}

            {sessions.length === 0 && (
              <div className="text-center text-xs text-zinc-600 mt-10">
                暂无历史对话
              </div>
            )}
          </div>

          {/* 底部：一键清空记录 */}
          <div className="pt-2 border-t border-zinc-850">
            <button
              type="button"
              onClick={onClearAll}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs text-zinc-500 hover:text-rose-400 hover:bg-rose-950/20 transition-colors"
            >
              <span>清空所有记录</span>
              <svg
                className="w-3.5 h-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
