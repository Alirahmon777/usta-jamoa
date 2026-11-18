// Run with: node --test tests/
// Level floors, the parallel and budget limits, and the plugin routing defaults.
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";

import { decide as agentGate } from "../plugins/usta/scripts/agent-gate.mjs";
import { decide as approveHook } from "../plugins/usta/scripts/approve-hook.mjs";
import { emit } from "../plugins/usta/scripts/events.mjs";
import { planSize, readTask, start } from "../plugins/usta/scripts/task-state.mjs";

const routing = JSON.parse(readFileSync(new URL("../plugins/usta/routing.json", import.meta.url), "utf8"));
const makeRepo = () => mkdtempSync(path.join(tmpdir(), "usta-routing-"));
const S = "s1";
const coder = (extra = {}) => ({ session_id: S, tool_input: { subagent_type: "usta:coder", ...extra } });

function writePlan(repo, rows) {
  const file = path.join(repo, "docs/plans/2026-11-18-x/plan.md");
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, [
    "# Reja", "", "## 3. Bosqichlar", "1. `src/x.ts` - nimadir", "",
    "## 4. Parallel xarita", "", "| Qism | Bosqichlar | Fayllar | Bog'liq | Worktree | Holat |", "|---|---|---|---|---|---|",
    ...rows, "", "## 5. Tekshirish rejasi",
  ].join("\n"));
  return "docs/plans/2026-11-18-x/plan.md";
}
const row = (part, files, worktree = "yo'q") =>
  `| ${part} | 1 | ${files.map((file) => `\`${file}\``).join(", ")} | - | ${worktree} | kutilmoqda |`;

test("simplify runs on every level except trivial", () => {
  for (const [level, config] of Object.entries(routing.levels)) {
    assert.equal(config.phases.includes("simplify"), level !== "trivial", level);
    if (level !== "trivial") assert.ok(config.agents.simplifier, level);
  }
  assert.equal(routing.levels.simple.agents.simplifier.model, "sonnet");
});

test("the reviewer is sonnet on simple and opus from moderate up", () => {
  assert.equal(routing.levels.simple.agents.reviewer.model, "sonnet");
  for (const level of ["moderate", "complex", "critical"]) assert.equal(routing.levels[level].agents.reviewer.model, "opus");
});

test("the parallel map is measured: parts, file entries and worktree parts", () => {
  const repo = makeRepo();
  const plan = writePlan(repo, [row("A", ["a.ts", "b.ts"], "ha"), row("B", ["c/**"], "ha (mustaqil)"), row("C", ["d.ts"])]);
  assert.deepEqual(planSize(readFileSync(path.join(repo, plan), "utf8")), { parts: 3, files: 4, worktrees: 2 });
  assert.deepEqual(planSize("# Reja\n\nbitta qadam"), { parts: 0, files: 0, worktrees: 0 });
});

test("a migration triaged as simple runs as at least moderate", () => {
  const state = start({ taskId: "m", level: "simple", taskType: "migration", session: S }, makeRepo());
  assert.equal(state.level, "moderate");
  assert.equal(state.triage_level, "simple");
  assert.deepEqual(state.raised_because, ["task type: migration"]);
});

test("risk areas raise the level", () => {
  assert.equal(start({ taskId: "r", level: "simple", risks: ["auth"], session: S }, makeRepo()).level, "complex");
});

test("a six-part parallel plan turns a simple task into complex and needs the human again", () => {
  const repo = makeRepo();
  assert.equal(start({ taskId: "doc", level: "simple", autoApprove: true, session: S }, repo).approved, true);
  const plan = writePlan(repo, ["A", "B", "C", "D", "E", "F"].map((part) => row(part, [`apps/${part}/**`], "ha")));
  const state = start({ taskId: "doc", level: "simple", plan, autoApprove: true, session: S }, repo);
  assert.equal(state.level, "complex");
  assert.equal(state.approved, false);
  assert.equal(state.budget_usd, routing.levels.complex.max_budget_usd);
  assert.match(state.raised_because.join("; "), /6 parts/);
});

test("a small one-part plan keeps the simple level", () => {
  const repo = makeRepo();
  const plan = writePlan(repo, [row("A", ["src/sum.mjs", "src/sum.test.mjs"])]);
  assert.equal(start({ taskId: "s", level: "simple", plan, session: S }, repo).level, "simple");
});

test("a later start for the same task never lowers its level", () => {
  const repo = makeRepo();
  start({ taskId: "t", level: "simple", taskType: "migration", session: S }, repo);
  const plan = writePlan(repo, [row("A", ["a.ts"])]);
  const state = start({ taskId: "t", level: "simple", plan, session: S }, repo);
  assert.equal(state.level, "moderate");
  assert.equal(state.task_type, "migration");
});

test("parallel worktree agents are refused below parallel.levels", () => {
  const repo = makeRepo();
  start({ taskId: "t", level: "simple", session: S }, repo);
  assert.match(agentGate(coder({ isolation: "worktree" }), repo), /does not allow parallel/);
  assert.equal(agentGate(coder(), repo), null);
  start({ taskId: "u", level: "moderate", session: S }, repo);
  assert.equal(agentGate(coder({ isolation: "worktree" }), repo), null);
});

test("agents outside usta or outside a task are never gated", () => {
  const repo = makeRepo();
  assert.equal(agentGate(coder({ isolation: "worktree" }), repo), null);
  start({ taskId: "t", level: "simple", session: S }, repo);
  assert.equal(agentGate({ session_id: S, tool_input: { subagent_type: "Explore", isolation: "worktree" } }, repo), null);
});

test("over budget, new agents stop until the human types /usta:budget", () => {
  const repo = makeRepo();
  start({ taskId: "t", level: "simple", session: S }, repo);
  emit(repo, { type: "agent.finished", id: "a", status: "ok", tokens: 1, costUsd: 2.5 });
  assert.equal(agentGate(coder(), repo), null);
  emit(repo, { type: "agent.finished", id: "b", status: "ok", tokens: 1, costUsd: 1 });
  assert.match(agentGate(coder(), repo), /reached its budget.*\/usta:budget/);

  const output = approveHook({ command_name: "usta:budget", session_id: S }, repo);
  assert.match(output.hookSpecificOutput.additionalContext, /\$6\.5/);
  assert.equal(readTask(repo, S).budget_usd, 6.5);
  assert.equal(agentGate(coder(), repo), null);
});

test("/usta:budget without a task is blocked", () => {
  assert.equal(approveHook({ command_name: "usta:budget", session_id: S }, makeRepo()).decision, "block");
});
