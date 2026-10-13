import { useState, useCallback } from "react";

export function useCopy(timeout = 2000) {
  const [copied, setCopied] = useState(false);

    const copyToClipboard = useCallback(async (text: string) => {
        if (!text || !navigator.clipboard) return false;
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), timeout);
            return true;
        } catch (err) {
            console.error('复制失败:', err);
            return false;
        }
    }, [timeout]);

    return { copied, copyToClipboard };
}