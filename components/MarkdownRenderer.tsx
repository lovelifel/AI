// components/MarkdownRenderer.tsx
"use client";

import React from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useCopy } from "@/hooks/useCopy";
interface MarkdownRendererProps {
  markdown: string;
}
function CodeBlock({ language, value }: { language: string; value: string }) {
  const { copied, copyToClipboard } = useCopy();
  return (
    <div className="relative my-3 rounded-xl overflow-hidden border border-zinc-800 shadow-md bg-[#1e1e1e]">
      {/* 顶部语言标签与复制栏 */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-[#252526] text-xs text-zinc-400 font-mono select-none border-b border-zinc-800">
        <span className="uppercase tracking-wider font-semibold">
          {language || "text"}
        </span>
        <button
          onClick={() => copyToClipboard(value)}
          className="flex items-center gap-1 hover:text-white transition-colors text-xs py-0.5 px-2 rounded hover:bg-zinc-700/60"
        >
          {copied ? (
            <span className="text-emerald-400 font-sans">✓ 已复制</span>
          ) : (
            <span className="font-sans">复制代码</span>
          )}
        </button>
      </div>

      <SyntaxHighlighter
        language={language || "text"}
        style={dark}
        customStyle={{
          margin: 0,
          padding: "1rem",
          fontSize: "0.85rem",
          lineHeight: "1.55",
          backgroundColor: "#1e1e1e",
        }}
        wrapLongLines={true}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  markdown,
}) => {
  return (
    <Markdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => (
          <h1 className="text-lg font-bold my-3 text-zinc-900 border-b pb-1">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-base font-semibold my-2.5 text-zinc-900">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-sm font-semibold my-2 text-zinc-900">
            {children}
          </h3>
        ),
        // 段落
        p: ({ children }) => <p className="mb-2 leading-relaxed">{children}</p>,
        // 列表
        ul: ({ children }) => (
          <ul className="list-disc pl-5 my-2 space-y-1">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal pl-5 my-2 space-y-1">{children}</ol>
        ),
        // 表格增强
        table: ({ children }) => (
          <div className="overflow-x-auto my-3 border border-zinc-200 rounded-lg">
            <table className="border-collapse text-xs w-full text-left">
              {children}
            </table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="bg-zinc-100 text-zinc-700 border-b border-zinc-200">
            {children}
          </thead>
        ),
        th: ({ children }) => (
          <th className="px-3 py-2 font-semibold border-r border-zinc-200 last:border-r-0">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="px-3 py-2 border-t border-r border-zinc-200 last:border-r-0 text-zinc-600">
            {children}
          </td>
        ),
        // 引用块
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-indigo-500 pl-3 my-2 text-zinc-600 bg-indigo-50/40 py-1 rounded-r">
            {children}
          </blockquote>
        ),
        code(props) {
          const { children, className } = props;
          const match = /language-(\w+)/.exec(className || "");
          const codeString = String(children).replace(/\n$/, "");
          if (match) {
            return <CodeBlock language={match[1]} value={codeString} />;
          }

          return (
            <code
              className="bg-zinc-100 text-rose-600 px-1.5 py-0.5 rounded font-mono text-xs border border-zinc-200"
              {...props}
            >
              {children}
            </code>
          );
        },
      }}
    >
      {markdown}
    </Markdown>
  );
};
