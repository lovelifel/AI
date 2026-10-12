// components/ChatInput.tsx
"use client";

import React, { useRef, useEffect } from "react";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onStop: () => void;
  loading: boolean;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSend,
  onStop,
  loading,
  disabled = false,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 高度自适应计算
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    const nextHeight = Math.max(44, textarea.scrollHeight);
    textarea.style.height = `${nextHeight}px`;
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.nativeEvent.isComposing) {
      return;
    }

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!loading && value.trim()) {
        onSend();
      }
    }
  };

  return (
    <div className="relative flex w-[100%] items-end gap-2 p-2 border border-zinc-200 rounded-2xl bg-white shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
      <textarea
        ref={textareaRef}
        rows={1}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder="输入消息，Enter 发送，Shift + Enter 换行..."
        className="flex-1 max-h-48  resize-none border-0 bg-transparent px-3 py-2.5 text-sm text-zinc-800 placeholder-zinc-400 outline-none leading-relaxed overflow-y-auto"
      />

      <div className="pb-1.5 pr-1.5 flex items-center">
        {loading ? (
          <button
            type="button"
            onClick={onStop}
            className="flex items-center justify-center h-8 w-8 rounded-xl bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow-sm"
            title="停止生成"
          >
            <span className="h-3 w-3 rounded-sm bg-white" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onSend}
            disabled={!value.trim() || disabled}
            className="flex items-center justify-center h-8 w-8 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:bg-zinc-200 disabled:text-zinc-400 disabled:cursor-not-allowed transition-colors shadow-sm"
            title="发送消息"
          >
            <svg className="w-4 h-4 fill-current rotate-90" viewBox="0 0 20 20">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};
