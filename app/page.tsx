"use client";

import React, { useState, useRef, useEffect } from "react";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { ChatInput } from "@/components/ChatInput";
import { Sidebar } from "@/components/Sidebar";
import { buildProductionContext } from "@/lib/context";
import {
  ChatSession,
  StoredMessage,
  getAllSessions,
  saveSession,
  deleteSession,
  getMessagesBySessionId,
  saveMessages,
  updateSessionTitle,
  clearAllChatData,
} from "@/lib/db";

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<StoredMessage[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef<boolean>(true);

  // app/page.tsx (示例绑定)
  const handleRenameSession = async (id: string, newTitle: string) => {
    // 1. 持久化到 IndexedDB
    await updateSessionTitle(id, newTitle);
    // 2. 更新内存 state
    setSessions((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, title: newTitle, updatedAt: Date.now() } : s,
      ),
    );
  };

  const handleDeleteSession = async (id: string) => {
    // 1. 级联删除 IndexedDB 数据（包括 session 与关联 messages）
    await deleteSession(id);
    // 2. 更新内存 state
    setSessions((prev) => prev.filter((s) => s.id !== id));
    // 3. 若删除的是当前激活会话，重置会话或切到第一条
    if (currentSessionId === id) {
      setCurrentSessionId(null);
      setMessages([]);
    }
  };

  const handleClearAll = async () => {
    if (confirm("确定要清空全部会话与记录吗？此操作不可逆。")) {
      await clearAllChatData();
      setSessions([]);
      setCurrentSessionId(null);
      setMessages([]);
    }
  };

  // 2. 新建会话
  const handleNewSession = async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setLoading(false);
    }

    const newId = `session_${Date.now()}`;
    const newSession: ChatSession = {
      id: newId,
      title: "新对话",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await saveSession(newSession);
    setSessions((prev) => [newSession, ...prev]);
    setCurrentSessionId(newId);
    setMessages([]);
    autoScrollRef.current = true;
  };
  // 1. 初始化会话与历史消息
  useEffect(() => {
    const initData = async () => {
      const storedSessions = await getAllSessions();
      setSessions(storedSessions);

      if (storedSessions.length > 0) {
        const firstSession = storedSessions[0];
        setCurrentSessionId(firstSession.id);
        const msgs = await getMessagesBySessionId(firstSession.id);
        setMessages(msgs);
      } else {
        await handleNewSession();
      }
    };
    initData();
  }, []);
  // 3. 切换会话
  const handleSelectSession = async (sessionId: string) => {
    if (sessionId === currentSessionId) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setLoading(false);
    }

    setCurrentSessionId(sessionId);
    const msgs = await getMessagesBySessionId(sessionId);
    setMessages(msgs);
    autoScrollRef.current = true;
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setLoading(false);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const { scrollHeight, scrollTop, clientHeight } = container;
    const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);
    if (distanceFromBottom <= 15) {
      autoScrollRef.current = true;
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (e.deltaY < 0) {
      autoScrollRef.current = false;
    }
  };

  // 流式打字自动吸底
  useEffect(() => {
    if (autoScrollRef.current && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: "auto",
      });
    }
  }, [messages]);

  // 7. 发送消息
  const handleSend = async () => {
    if (!input.trim() || loading || !currentSessionId) return;

    const userText = input.trim();
    setInput("");
    setLoading(true);
    autoScrollRef.current = true;

    const userMsg: StoredMessage = {
      id: `msg_${Date.now()}`,
      sessionId: currentSessionId,
      role: "user",
      content: userText,
      createdAt: Date.now(),
    };

    const assistantMsgId = `msg_${Date.now() + 1}`;
    const assistantMsg: StoredMessage = {
      id: assistantMsgId,
      sessionId: currentSessionId,
      role: "assistant",
      content: "",
      thinking: "",
      isThinkingDone: false,
      createdAt: Date.now() + 1,
    };

    const nextMessages = [...messages, userMsg, assistantMsg];
    setMessages(nextMessages);

    // 自动提炼会话首句标题
    const activeSession = sessions.find((s) => s.id === currentSessionId);
    if (activeSession && activeSession.title === "新对话") {
      const autoTitle =
        userText.slice(0, 15) + (userText.length > 15 ? "..." : "");
      const updatedSession = {
        ...activeSession,
        title: autoTitle,
        updatedAt: Date.now(),
      };
      await saveSession(updatedSession);
      setSessions((prev) =>
        prev.map((s) => (s.id === currentSessionId ? updatedSession : s)),
      );
    }

    await saveMessages([userMsg, assistantMsg]);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    let finalThinking = "";
    let finalContent = "";
    let finalThinkingDone = false;

    const context = buildProductionContext(nextMessages);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: context,
        }),
        signal: abortController.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error("服务端未返回有效的数据流");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;

        let thinking = "";
        let content = fullText;
        let isThinkingDone = false;

        // 统一处理带 <think> 与不带 <think> 的不同模型输出
        if (fullText.includes("<think>")) {
          if (fullText.includes("</think>")) {
            const parts = fullText.split("</think>");
            thinking = parts[0].replace("<think>", "").trim();
            content = parts.slice(1).join("</think>").trimStart();
            isThinkingDone = true;
          } else {
            thinking = fullText.replace("<think>", "").trimStart();
            content = "";
            isThinkingDone = false;
          }
        } else {
          isThinkingDone = true;
          content = fullText;
        }

        finalThinking = thinking;
        finalContent = content;
        finalThinkingDone = isThinkingDone;

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId
              ? { ...msg, thinking, content, isThinkingDone }
              : msg,
          ),
        );
      }

      // 流结束，将完整的助手回答落盘至 IndexedDB
      await saveMessages([
        {
          ...assistantMsg,
          content: finalContent,
          thinking: finalThinking,
          isThinkingDone: finalThinkingDone,
        },
      ]);
    } catch (error: unknown) {
      if (error instanceof Error && error.name === "AbortError") {
        // 用户主动停止生成，保存当前已生成的切片
        await saveMessages([
          {
            ...assistantMsg,
            content: finalContent,
            thinking: finalThinking,
            isThinkingDone: finalThinkingDone,
          },
        ]);
      } else {
        console.error("请求失败:", error);
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-zinc-50">
      {/* 左侧会话侧边栏 */}
      <Sidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={handleSelectSession}
        onNewSession={handleNewSession}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
        onClearAll={handleClearAll}
      />

      {/* 右侧主聊天区 */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        <header className="h-14 border-b border-zinc-200 bg-white px-6 flex items-center justify-between shrink-0">
          <h1 className="font-semibold text-sm text-zinc-800 truncate">
            {sessions.find((s) => s.id === currentSessionId)?.title || "新对话"}
          </h1>
        </header>

        <main className="flex-1 min-h-0 relative flex flex-col">
          {messages.length === 0 && (
            <div className="text-center text-zinc-400 text-sm mt-28">
              暂无消息，输入一句话开始多轮对话吧
            </div>
          )}

          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            onWheel={handleWheel}
            className="flex-1 min-h-0 overflow-y-auto px-4 py-6 space-y-5"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.role === "user" ? "items-end" : "items-start"
                }`}
              >
                {msg.role === "user" ? (
                  <div className="bg-blue-600 text-white px-4 py-2.5 rounded-2xl max-w-[80%] text-sm whitespace-pre-wrap shadow-sm">
                    {msg.content}
                  </div>
                ) : (
                  <div className="max-w-[85%] space-y-2">
                    {msg.thinking && (
                      <details
                        open={!msg.isThinkingDone}
                        className="border border-indigo-100 bg-indigo-50/40 rounded-xl overflow-hidden text-xs"
                      >
                        <summary className="px-3 py-2 cursor-pointer font-medium text-indigo-700 flex items-center gap-2 select-none">
                          <span>💭 思考过程</span>
                          {!msg.isThinkingDone && (
                            <span className="text-indigo-400 font-normal animate-pulse">
                              思考中...
                            </span>
                          )}
                        </summary>
                        <div className="px-3 py-2.5 border-t border-indigo-100/60 bg-white/70 text-zinc-600 font-mono whitespace-pre-wrap">
                          {msg.thinking}
                        </div>
                      </details>
                    )}

                    {msg.content && (
                      <div className="border border-zinc-100 bg-white shadow-sm rounded-2xl px-4 py-3 text-sm text-zinc-800 leading-relaxed">
                        <MarkdownRenderer markdown={msg.content} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </main>

        <footer className="p-4 border-t border-zinc-200 bg-white shrink-0">
          <div className="max-w-4xl mx-auto">
            <ChatInput
              value={input}
              onChange={setInput}
              onSend={handleSend}
              onStop={handleStop}
              loading={loading}
            />
          </div>
        </footer>
      </div>
    </div>
  );
}
