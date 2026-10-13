// hooks/useCopy.ts
import { useState, useCallback } from "react";

export function useCopy(timeout = 2000) {
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const copyToClipboard = useCallback(
        async (text: string, id?: string) => {
            if (!text || !navigator.clipboard) return false;
            try {
                await navigator.clipboard.writeText(text);
                // 若传入具体 id 则记录该 id；若未传则使用默认标识符 'default'
                const activeId = id ?? "default";
                setCopiedId(activeId);
                setTimeout(() => setCopiedId(null), timeout);
                return true;
            } catch (err) {
                console.error("复制失败:", err);
                return false;
            }
        },
        [timeout]
    );

    return { copiedId, copyToClipboard };
}