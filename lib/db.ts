// lib/db.ts
import { openDB, DBSchema, IDBPDatabase } from "idb";

// 消息结构
export interface StoredMessage {
    id: string;
    sessionId: string;
    role: "user" | "assistant";
    content: string;
    thinking?: string;
    isThinkingDone?: boolean;
    createdAt: number;
}

// 会话元数据
export interface ChatSession {
    id: string;
    title: string;
    createdAt: number;
    updatedAt: number;
}

// 定义 IndexedDB Schema 规范
interface ChatDBSchema extends DBSchema {
    sessions: {
        key: string;
        value: ChatSession;
        indexes: { "by-updated": number };
    };
    messages: {
        key: string;
        value: StoredMessage;
        indexes: { "by-session": string };
    };
}

const DB_NAME = "ai_chat_database";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<ChatDBSchema>> | null = null;

export function getDB() {
    if (!dbPromise) {
        dbPromise = openDB<ChatDBSchema>(DB_NAME, DB_VERSION, {
            upgrade(db) {
                // 1. 创建 sessions 会话表，按更新时间排序建立索引
                if (!db.objectStoreNames.contains("sessions")) {
                    const sessionStore = db.createObjectStore("sessions", { keyPath: "id" });
                    sessionStore.createIndex("by-updated", "updatedAt");
                }

                // 2. 创建 messages 消息明细表，按 sessionId 建立索引
                if (!db.objectStoreNames.contains("messages")) {
                    const msgStore = db.createObjectStore("messages", { keyPath: "id" });
                    msgStore.createIndex("by-session", "sessionId");
                }
            },
        });
    }
    return dbPromise;
}

// 获取所有会话列表（按最近更新时间倒序排列）
export async function getAllSessions(): Promise<ChatSession[]> {
    const db = await getDB();
    const sessions = await db.getAllFromIndex("sessions", "by-updated");
    return sessions.reverse();
}

// 保存或更新单个会话元数据
export async function saveSession(session: ChatSession): Promise<void> {
    const db = await getDB();
    await db.put("sessions", session);
}

// 删除单个会话及其名下的所有消息
export async function deleteSession(sessionId: string): Promise<void> {
    const db = await getDB();
    const tx = db.transaction(["sessions", "messages"], "readwrite");
    await tx.objectStore("sessions").delete(sessionId);

    // 删除该会话关联的所有消息
    const index = tx.objectStore("messages").index("by-session");
    let cursor = await index.openCursor(IDBKeyRange.only(sessionId));
    while (cursor) {
        await cursor.delete();
        cursor = await cursor.continue();
    }
    await tx.done;
}

// 获取指定会话下的全部历史消息
export async function getMessagesBySessionId(sessionId: string): Promise<StoredMessage[]> {
    const db = await getDB();
    const messages = await db.getAllFromIndex("messages", "by-session", sessionId);
    return messages.sort((a, b) => a.createdAt - b.createdAt);
}

// 批量保存/更新某个会话下的全部消息
export async function saveMessages(messages: StoredMessage[]): Promise<void> {
    if (messages.length === 0) return;
    const db = await getDB();
    const tx = db.transaction("messages", "readwrite");
    for (const msg of messages) {
        await tx.store.put(msg);
    }
    await tx.done;
}