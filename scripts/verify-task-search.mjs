import assert from "node:assert/strict";

const baseUrl = process.env.TEST_BASE_URL ?? "http://localhost:3000";
const endpoint = `${baseUrl}/api/tasks`;
const ids = [];
const tag = `Search${Date.now()}`;

async function search(q) {
  const url = new URL(endpoint);
  if (q !== undefined) url.searchParams.set("q", q);
  const response = await fetch(url);
  return { status: response.status, data: await response.json() };
}

try {
  const baseline = await search();
  assert.equal(baseline.status, 200);
  const titles = [`${tag} React`, `${tag} 100%`, `${tag} a_b`, `${tag} aXb`, `${tag} path\\name`, `${tag} O'Reilly`];
  for (const title of titles) {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    assert.equal(response.status, 201);
    ids.push((await response.json()).task.id);
  }

  for (const query of [undefined, "", "   ", ` ${tag.toLowerCase()} REACT `, "%", "_", "\\", "O'Reilly", `${tag} missing`, "' OR 1=1 --"]) {
    const result = await search(query);
    assert.equal(result.status, 200);
    const normalized = (query ?? "").trim().toLowerCase();
    const expected = titles.filter((title) => title.toLowerCase().includes(normalized));
    const actual = result.data.tasks.filter((task) => ids.includes(task.id)).map((task) => task.title);
    assert.deepEqual(actual, expected, `Unexpected literal results for ${JSON.stringify(query)}`);
  }
  assert.equal((await search("x".repeat(100))).status, 200);
  const tooLong = await search("x".repeat(101));
  assert.equal(tooLong.status, 400);
  assert.equal(typeof tooLong.data.error, "string");
  console.log("PASS: empty/whitespace, case-insensitive matching, literal %, _, backslash, quotes, no match, 100/101 boundary");
} finally {
  for (const id of ids) {
    const response = await fetch(`${endpoint}/${id}`, { method: "DELETE" });
    assert.ok([204, 404].includes(response.status), `Cleanup failed for disposable task ${id}`);
  }
  console.log(`Cleaned ${ids.length} disposable tasks; no existing task IDs were modified`);
}
