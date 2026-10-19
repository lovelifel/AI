import { StoredMessage } from "./db";


export interface ApiMessage {
    role: "system" | "user" | "assistant";
    content: string;
}

function estimateTokens(text: string): number {
    if (!text) return 0;
    let tokens = 0;
    for (let i = 0; i < text.length; i++) {
        const code = text.charCodeAt(i);
        tokens += code >= 0x4e00 && code <= 0x9fa5 ? 1.5 : 0.35;
    }
    return Math.ceil(tokens);
}

export function buildProductionContext(
    messages: StoredMessage[],
    maxTokens = 3500,
    systemPrompt = "你是一个高效、严谨的专家级助手。"
): ApiMessage[] {
    const valid = messages.filter((m) => m.content?.trim());
    if (!valid.length) return systemPrompt ? [{ role: "system", content: systemPrompt }] : [];
    const head = valid.length > 1 && valid[0].role === "user" ? valid[0] : undefined;
    const tail = valid[valid.length - 1];
    const middle = valid.slice(head ? 1 : 0, -1);
    let remain = maxTokens - estimateTokens(systemPrompt) - estimateTokens(tail.content) - estimateTokens(head?.content || "");

    const keptMiddle: StoredMessage[] = [];
    for (let i = middle.length - 1; i >= 0; i--) {

        const cost = estimateTokens(middle[i].content);
        if (remain < cost) break;
        remain -= cost;
        keptMiddle.unshift(middle[i]);
    }
    return [
        ...(systemPrompt ? [{ role: "system" as const, content: systemPrompt }] : []),
        ...(head ? [{ role: head.role, content: head.content }] : []),
        ...keptMiddle.map(({ role, content }) => ({ role, content })),
        { role: tail.role, content: tail.content },
    ];
}