"use client";
import { useState, useRef } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
  id: string;
  thinking?: string;
  isThinkingDone?: boolean;
}

export default function Home() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userText = input.trim();
    setInput("");
    setLoading(true);
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: userText,
    };
    const assistantMsgId = crypto.randomUUID();
    const assistantMsg: Message = {
      id: assistantMsgId,
      role: "assistant",
      content: "",
      thinking: "",
      isThinkingDone: false,
    };
    const nextMessages = [...messages, userMsg];
    setMessages([...nextMessages, assistantMsg]);
    const payloadMessages = nextMessages.map(({ role, content }) => ({
      role,
      content,
    }));
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: payloadMessages }),
        signal: abortController.signal,
      });
      if (!response.body) {
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
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMsgId
                ? { ...msg, thinking, content, isThinkingDone }
                : msg,
            ),
          );
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      // 无论成功、失败还是被中断，一定会执行这里
      setLoading(false);
      abortControllerRef.current = null; // 清理引用
    }
  };
  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4">
      <header className="py-3 border-b flex justify-between items-center">
        <h1 className="font-semibold text-lg text-gray-800">多轮对话工作台</h1>
        <button
          onClick={() => setMessages([])}
          className="text-xs text-gray-500 hover:text-red-500 border px-2 py-1 rounded"
        >
          清空对话
        </button>
      </header>

      {/* 消息滚动区域 */}
      <main className="flex-1 overflow-y-auto py-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 text-sm mt-20">
            暂无消息，输入一句话开始多轮对话吧
          </div>
        )}

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
                {/* 思考过程卡片（每条助手消息独立维护折叠） */}
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
                    <div className="px-3 py-2.5 border-t border-indigo-100/60 bg-white/70 text-gray-600 font-mono whitespace-pre-wrap">
                      {msg.thinking}
                    </div>
                  </details>
                )}

                {/* 正文回答 */}
                {msg.content && (
                  <div className="border border-gray-100 bg-white shadow-sm rounded-2xl px-4 py-3 text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {msg.content}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        <div ref={chatBottomRef} />
      </main>

      {/* 底部输入框 */}
      <footer className="pt-2 border-t flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.nativeEvent.isComposing) {
              e.preventDefault();
              handleSend();
            }
          }}
          disabled={loading}
          placeholder="问点什么..."
          className="flex-1 border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
        />
        {loading ? (
          <button
            onClick={handleStop}
            className="bg-rose-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-rose-700 transition-colors"
          >
            停止
          </button>
        ) : (
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            发送
          </button>
        )}
      </footer>
    </div>
  );
}
