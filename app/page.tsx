"use client";

import React, { useState, useRef, useEffect } from "react";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { ChatInput } from "@/components/ChatInput";
import { Sidebar } from "@/components/Sidebar";
import { buildProductionContext } from "@/lib/context";
import { useCopy } from "@/hooks/useCopy";

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
  deleteMessagesByIds,
  deleteMessage,
} from "@/lib/db";

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<StoredMessage[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 引入复制 Hook
  const { copiedId, copyToClipboard } = useCopy();

  const abortControllerRef = useRef<AbortController | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef<boolean>(true);

  // 侧边栏重命名
  const handleRenameSession = async (id: string, newTitle: string) => {
    await updateSessionTitle(id, newTitle);
    setSessions((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, title: newTitle, updatedAt: Date.now() } : s,
      ),
    );
  };

  // 侧边栏删除会话
  const handleDeleteSession = async (id: string) => {
    await deleteSession(id);
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (currentSessionId === id) {
      setCurrentSessionId(null);
      setMessages([]);
    }
  };

  // 侧边栏一键清空
  const handleClearAll = async () => {
    if (confirm("确定要清空全部会话与记录吗？此操作不可逆。")) {
      await clearAllChatData();
      setSessions([]);
      setCurrentSessionId(null);
      setMessages([]);
    }
  };

  // 新建会话
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

  // 初始化会话与历史消息
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

  // 切换会话
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

  // 停止生成
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

  // ================= 消息级生命周期核心逻辑 =================

  // 单条消息删除
  const handleDeleteMessage = async (msgId: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== msgId));
    await deleteMessage(msgId);
  };

  // 重新生成（Regenerate）闭环
  const handleRegenerate = async (targetMsgId: string) => {
    if (loading || !currentSessionId) return;

    // 1. 熔断可能在途的流
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // 2. 定位截断点：找到被重新生成的这轮回答（或追问）
    const targetIndex = messages.findIndex((m) => m.id === targetMsgId);
    if (targetIndex === -1) return;

    // 截取目标消息之前的历史，截断点之后的消息全部作废
    const preservedMessages = messages.slice(0, targetIndex);
    const discardedMessages = messages.slice(targetIndex);

    // 3. 内存 State 与 IndexedDB 物理同步清理截断数据
    setMessages(preservedMessages);
    await deleteMessagesByIds(discardedMessages.map((m) => m.id));

    // 4. 重建 Token 预算与上下文滑窗装箱
    const context = buildProductionContext(preservedMessages);

    // 5. 占位全新的 Assistant 消息
    const assistantMsgId = `msg_${Date.now()}`;
    const assistantMsg: StoredMessage = {
      id: assistantMsgId,
      sessionId: currentSessionId,
      role: "assistant",
      content: "",
      thinking: "",
      isThinkingDone: false,
      createdAt: Date.now(),
    };

    setMessages([...preservedMessages, assistantMsg]);
    setLoading(true);
    autoScrollRef.current = true;

    // 6. 重新发起流式调度
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    let finalThinking = "";
    let finalContent = "";
    let finalThinkingDone = false;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: context }),
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

      // 7. 流正常结束，原子写入 IndexedDB
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
        await saveMessages([
          {
            ...assistantMsg,
            content: finalContent,
            thinking: finalThinking,
            isThinkingDone: finalThinkingDone,
          },
        ]);
      } else {
        console.error("重新生成请求失败:", error);
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  // 发送消息
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
            {messages.map((msg, index) => {
              const isAssistant = msg.role === "assistant";
              const isLastAssistant =
                isAssistant && index === messages.length - 1;

              return (
                <div
                  key={msg.id}
                  className={`group flex flex-col ${
                    msg.role === "user" ? "items-end" : "items-start"
                  }`}
                >
                  {msg.role === "user" ? (
                    <div className="flex flex-col items-end max-w-[80%]">
                      <div className="bg-blue-600 text-white px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap shadow-sm">
                        {msg.content}
                      </div>

                      {/* 用户消息操作区：复制与删除 */}
                      <div className="flex items-center gap-2 mt-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => copyToClipboard(msg.content, msg.id)}
                          className="text-[11px] text-zinc-400 hover:text-zinc-600 select-none"
                        >
                          {copiedId === msg.id ? "已复制" : "复制"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteMessage(msg.id)}
                          className="text-[11px] text-zinc-400 hover:text-rose-500 select-none"
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="max-w-[85%] space-y-2">
                      {/* 思考过程 */}
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

                      {/* 消息正文 */}
                      {msg.content && (
                        <div className="border border-zinc-100 bg-white shadow-sm rounded-2xl px-4 py-3 text-sm text-zinc-800 leading-relaxed">
                          <MarkdownRenderer markdown={msg.content} />
                        </div>
                      )}

                      {/* Assistant 操作栏：复制、重新生成、删除 */}
                      <div className="flex items-center gap-3 px-1 pt-0.5 opacity-0 group-hover:opacity-100 transition-opacity select-none">
                        <button
                          type="button"
                          onClick={() => copyToClipboard(msg.content, msg.id)}
                          className="text-[11px] text-zinc-400 hover:text-zinc-700 flex items-center gap-1 transition-colors"
                        >
                          <span>
                            {copiedId === msg.id ? "✓ 已复制" : "复制"}
                          </span>
                        </button>

                        {/* 仅在最后一条 Assistant 且非 loading 状态下展示重新生成 */}
                        {isLastAssistant && !loading && (
                          <button
                            type="button"
                            onClick={() => handleRegenerate(msg.id)}
                            className="text-[11px] text-zinc-400 hover:text-blue-600 flex items-center gap-1 transition-colors"
                          >
                            <span>重新生成</span>
                          </button>
                        )}

                        {!loading && (
                          <button
                            type="button"
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="text-[11px] text-zinc-400 hover:text-rose-500 flex items-center gap-1 transition-colors"
                          >
                            <span>删除</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
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
