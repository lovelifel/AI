import { CreateTaskRequestSchema } from "@/lib/schemas/task";

export async function POST(request: Request) {
    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return Response.json({ error: "请求体必须是合法 JSON" }, { status: 400 });
    }
    const result = CreateTaskRequestSchema.safeParse(body);
    if (!result.success) {
        return Response.json(
            { error: result.error.issues[0]?.message ?? "请求参数不合法" },
            { status: 400 },
        );
    }

    const task = {
        id: crypto.randomUUID(),
        title: result.data.title,
    };

    return Response.json({ task }, { status: 201 });
}
