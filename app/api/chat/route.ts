import OpenAI from "openai";

const client = new OpenAI({
    apiKey: process.env.AI_API_KEY,
    baseURL: process.env.AI_BASE_URL,
});
type CustomDelta = {
    content?: string | null;
    reasoning_content?: string | null;
};
export async function POST(req: Request) {
    const { content } = await req.json();
    if (!content || !Array.isArray(content) || content.length === 0) {
        return new Response(JSON.stringify({ error: "content 必须是非空数组" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }
    const recentMessages = content.slice(-10);
    const systemPrompt = {
        role: "system",
        content: "你是一个高效、精准的 AI 助手。请直接清晰地回答用户的问题。",
    };
    const response = await client.chat.completions.create({
        model: process.env.AI_MODEL || "Pro/deepseek-ai/DeepSeek-R1",
        messages: [systemPrompt, ...recentMessages],
        stream: true
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
        async start(controller) {
            let isThinkingStarted = false;
            let isThinkingEnded = false;
            try {
                for await (const chunk of response) {
                    const delta = chunk.choices[0]?.delta as CustomDelta | undefined;
                    const reasoning = delta?.reasoning_content || "";
                    if (reasoning) {
                        if (!isThinkingStarted) {
                            controller.enqueue(encoder.encode("<think>"));
                            isThinkingStarted = true;
                        }
                        controller.enqueue(encoder.encode(reasoning));

                    }
                    const content = delta?.content;
                    if (content) {
                        if (!isThinkingEnded && isThinkingStarted) {
                            controller.enqueue(encoder.encode("</think>"));
                            isThinkingEnded = true;
                        }
                        controller.enqueue(encoder.encode(content));
                    }
                }
            } catch (err) {
                controller.error(err);
            } finally {
                controller.close();
            }

        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream; charset=utf-8",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    });
}