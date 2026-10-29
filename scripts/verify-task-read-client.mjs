import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const compile = (source) => ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const moduleUrl = (code) => `data:text/javascript;base64,${Buffer.from(code).toString("base64")}`;
const schema = await readFile(new URL("../src/lib/schemas/task.ts", import.meta.url), "utf8");
const schemaUrl = moduleUrl(compile(schema).replace('"zod"', JSON.stringify(import.meta.resolve("zod"))));
const api = await readFile(new URL("../src/lib/api/tasks.ts", import.meta.url), "utf8");
const { getTasks } = await import(moduleUrl(compile(api).replace('"@/lib/schemas/task"', JSON.stringify(schemaUrl))));
const originalFetch = globalThis.fetch;

try {
  const controller = new AbortController();
  const tasks = [{ id: "fixture", title: "测试任务", status: "todo" }];
  globalThis.fetch = async (path, options) => {
    assert.equal(new URL(path, "http://localhost").searchParams.get("q"), "a&b 中文");
    assert.equal(options.signal, controller.signal);
    assert.equal(options.cache, "no-store");
    return Response.json({ tasks });
  };
  assert.deepEqual(await getTasks("  a&b 中文  ", controller.signal), tasks);

  globalThis.fetch = async () => Response.json({ error: "关键词过长" }, { status: 400 });
  await assert.rejects(() => getTasks("bad"), /关键词过长/);
  globalThis.fetch = async () => new Response("upstream failure", { status: 502 });
  await assert.rejects(() => getTasks(), /无法获取任务列表/);
  globalThis.fetch = async () => Response.json({ tasks: [{}] });
  await assert.rejects(() => getTasks(), /任务列表格式不正确/);

  globalThis.fetch = (_path, { signal }) => new Promise((_resolve, reject) => {
    signal.addEventListener("abort", () => reject(new DOMException("Cancelled", "AbortError")), { once: true });
  });
  const pending = getTasks("old", controller.signal);
  controller.abort();
  await assert.rejects(() => pending, { name: "AbortError" });
  console.log("PASS: query encoding, signal forwarding, response validation, error fallback and cancellation");
} finally {
  globalThis.fetch = originalFetch;
}
