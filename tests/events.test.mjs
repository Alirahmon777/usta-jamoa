// Run with: node --test tests/
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";

import { handler } from "../plugins/usta/scripts/dashboard.mjs";
import { emit, readEvents } from "../plugins/usta/scripts/events.mjs";
import { record, summarize, usage } from "../plugins/usta/scripts/record-event.mjs";
import { approve, clear, report, start } from "../plugins/usta/scripts/task-state.mjs";

const makeRepo = () => mkdtempSync(path.join(tmpdir(), "usta-events-"));
const types = (repo) => readEvents(repo).map((event) => (event.type.startsWith("phase.") ? `${event.type}:${event.phase}` : event.type));
const agent = (repo, hook, type, id, extra = {}) =>
  record({ hook_event_name: hook, agent_type: `usta:${type}`, agent_id: id, ...extra }, repo);

test("agents outside a task are not recorded, except triage", () => {
  const repo = makeRepo();
  agent(repo, "SubagentStart", "coder", "c1");
  agent(repo, "SubagentStart", "Explore", "e1");
  assert.deepEqual(readEvents(repo), []);
  agent(repo, "SubagentStart", "triage", "t1");
  assert.deepEqual(types(repo), ["phase.started:triage", "agent.started"]);
});

test("a complex task moves through its phases and the approval gate", () => {
  const repo = makeRepo();
  agent(repo, "SubagentStart", "triage", "t1");
  agent(repo, "SubagentStop", "triage", "t1", { last_assistant_message: '{"level": "complex"}' });
  start({ taskId: "promo", level: "complex", title: "Promo-kod" }, repo);
  agent(repo, "SubagentStart", "analyzer", "a1");
  agent(repo, "SubagentStop", "analyzer", "a1", { last_assistant_message: "## 12 fayl topildi" });
  agent(repo, "SubagentStart", "planner", "p1");
  agent(repo, "SubagentStop", "planner", "p1");
  start({ taskId: "promo", level: "complex", plan: "docs/plans/x/plan.md" }, repo);
  approve(repo);
  agent(repo, "SubagentStart", "coder", "c1");
  clear(repo);

  assert.deepEqual(types(repo), [
    "phase.started:triage", "agent.started", "agent.finished",
    "task.started",
    "phase.finished:triage", "phase.started:analyze", "agent.started", "agent.finished",
    "phase.finished:analyze", "phase.started:brainstorm",
    "phase.finished:brainstorm", "phase.started:plan", "agent.started", "agent.finished",
    "phase.finished:plan", "phase.started:approve", "approval.waiting", "approval.granted",
    "phase.finished:approve", "phase.started:implement", "agent.started",
    "phase.finished:implement", "task.finished",
  ]);
  const events = readEvents(repo);
  assert.equal(events.find((e) => e.type === "task.started").phases.join(","),
    "triage,analyze,brainstorm,plan,approve,implement,simplify,test,review");
  assert.equal(events[2].summary, "daraja: complex");
  assert.equal(events.find((e) => e.id === "a1" && e.type === "agent.finished").summary, "12 fayl topildi");
  assert.equal(events.find((e) => e.id === "c1").model, "opus");
});

test("a trivial task skips straight to implement; the next task starts a fresh log", () => {
  const repo = makeRepo();
  start({ taskId: "typo", level: "trivial", autoApprove: true }, repo);
  agent(repo, "SubagentStart", "coder", "c1");
  clear(repo);
  agent(repo, "SubagentStart", "triage", "t2");
  assert.deepEqual(types(repo), ["phase.started:triage", "agent.started"]);
});

test("only plan parts, tests and findings can be reported", () => {
  const repo = makeRepo();
  report('{"type":"tests","passed":3,"failed":0,"skipped":0,"durationMs":900}', repo);
  assert.equal(readEvents(repo)[0].passed, 3);
  assert.throws(() => report('{"type":"approval.granted","by":"human"}', repo), /must be one of/);
});

test("usage counts each API response once and estimates its cost", () => {
  const file = path.join(makeRepo(), "agent.jsonl");
  const line = (requestId, model) => JSON.stringify({ requestId, message: { model, usage: {
    input_tokens: 1000, cache_creation_input_tokens: 0, cache_read_input_tokens: 0, output_tokens: 1000 } } });
  writeFileSync(file, [line("r1", "claude-sonnet-5-5"), line("r1", "claude-sonnet-5-5"), line("r2", "claude-sonnet-5-5")].join("\n"));
  assert.deepEqual(usage(file), { tokens: 4000, costUsd: 0.024, model: "sonnet" });
  assert.equal(summarize("```json\n{}\n```\n\nDone: 2 files changed."), "Done: 2 files changed.");
});

test("the dashboard server serves the event log and never files outside its folder", async () => {
  const repo = makeRepo();
  emit(repo, { type: "task.finished", status: "ok" });
  const server = createServer(handler(repo)).listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    assert.match(await (await fetch(`${base}/events.jsonl`)).text(), /task\.finished/);
    assert.equal((await fetch(`${base}/`, { redirect: "manual" })).headers.get("location"), "/dashboard");
    assert.match(await (await fetch(`${base}/dashboard`)).text(), /<div id="root">/);
    assert.match(await (await fetch(`${base}/..%2f..%2fpackage.json`)).text(), /<div id="root">/);
  } finally {
    server.close();
  }
});

test("a phase with a running agent stays open while the next one starts", () => {
  const repo = makeRepo();
  start({ taskId: "t", level: "simple", autoApprove: true }, repo);
  agent(repo, "SubagentStart", "tester", "t1");
  agent(repo, "SubagentStart", "reviewer", "r1");
  assert.ok(!types(repo).includes("phase.finished:test"));
  agent(repo, "SubagentStop", "tester", "t1");
  assert.equal(types(repo).at(-1), "phase.finished:test");
});
