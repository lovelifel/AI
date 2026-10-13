// components/ChatMessageItem.tsx
"use client";

import React from "react";
import { StoredMessage } from "@/lib/db";
import { useCopy } from "@/hooks/useCopy";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

interface ChatMessageItemProps {
  message: StoredMessage;
  isLastAssistant: boolean;
  isStreaming: boolean;
  onRegenerate: (messageId: string) => void;
  onDelete: (messageId: string) => void;
}

export function ChatMessageItem({
  message,
  isLastAssistant,
  isStreaming,
  onRegenerate,
  onDelete,
}: ChatMessageItemProps) {
  const isUser = message.role === "user";
  const { copied, copyToClipboard } = useCopy();

  return (
    <div
      className={`group w-full flex flex-col py-3 px-4 ${
        isUser ? "items-end" : "items-start"
      }`}
    >
      {/* 消息主体气泡 */}
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm relative ${
          isUser
            ? "bg-zinc-800 text-zinc-100 rounded-br-sm"
            : "bg-zinc-900/70 border border-zinc-800 text-zinc-200 rounded-bl-sm w-full"
        }`}
      >
        {/* DeepSeek 思考过程折叠区（如果有） */}
        {message.thinking && (
          <details className="mb-3 rounded-lg border border-zinc-700/50 bg-zinc-950/40 p-2.5 text-xs text-zinc-400">
            <summary className="cursor-pointer select-none font-medium text-zinc-500 hover:text-zinc-300">
              {message.isThinkingDone ? "已完成思考" : "正在思考中..."}
            </summary>
            <div className="mt-2 whitespace-pre-wrap font-mono leading-relaxed text-zinc-400">
              {message.thinking}
            </div>
          </details>
        )}

        {/* 消息正文 */}
        {isUser ? (
          <div className="whitespace-pre-wrap leading-relaxed">
            {message.content}
          </div>
        ) : (
          <MarkdownRenderer markdown={message.content} />
        )}

        {/* 底部悬浮/常驻操作工具栏 */}
        <div
          className={`flex items-center gap-1.5 mt-2 pt-1 border-t border-zinc-800/60 opacity-0 group-hover:opacity-100 transition-opacity select-none ${
            isUser ? "justify-end" : "justify-start"
          }`}
        >
          {/* 一键复制纯文本/Markdown */}
          <button
            type="button"
            onClick={() => copyToClipboard(message.content)}
            className="flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-200 px-1.5 py-0.5 rounded hover:bg-zinc-800 transition-colors"
            title="复制内容"
          >
            {copied ? (
              <span className="text-emerald-400 font-medium">已复制</span>
            ) : (
              <span>复制</span>
            )}
          </button>

          {/* 重新生成（仅对最后一条非流式 Assistant 消息展示） */}
          {!isUser && isLastAssistant && !isStreaming && (
            <button
              type="button"
              onClick={() => onRegenerate(message.id)}
              className="flex items-center gap-1 text-[11px] text-zinc-500 hover:text-indigo-400 px-1.5 py-0.5 rounded hover:bg-zinc-800 transition-colors"
              title="重新生成此回复"
            >
              重新生成
            </button>
          )}

          {/* 单条删除 */}
          {!isStreaming && (
            <button
              type="button"
              onClick={() => onDelete(message.id)}
              className="flex items-center gap-1 text-[11px] text-zinc-500 hover:text-rose-400 px-1.5 py-0.5 rounded hover:bg-zinc-800 transition-colors"
              title="删除此条消息"
            >
              删除
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
