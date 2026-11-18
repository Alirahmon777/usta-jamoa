// /usta:oyla (plan mode), /usta:tez (fast mode) and the prompt reminder. Run with: node --test tests/*.test.mjs
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";

import { decide as agentGate } from "../plugins/usta/scripts/agent-gate.mjs";
import { decide as approveHook } from "../plugins/usta/scripts/approve-hook.mjs";
import { decide as bashGate } from "../plugins/usta/scripts/guard-bash.mjs";
import { decide as promptReminder } from "../plugins/usta/scripts/prompt-reminder.mjs";
import { decide as planGate } from "../plugins/usta/scripts/require-approved-plan.mjs";
import { readTask, start } from "../plugins/usta/scripts/task-state.mjs";

const S = "session-modes";
const makeRepo = () => mkdtempSync(path.join(tmpdir(), "usta-modes-"));
const edit = (file) => ({ session_id: S, tool_input: { file_path: file } });
const bash = (command) => ({ session_id: S, tool_input: { command } });
const agent = (type) => ({ session_id: S, tool_input: { subagent_type: type } });
function writeJson(repo, rel, data) {
  mkdirSync(path.dirname(path.join(repo, rel)), { recursive: true });
  writeFileSync(path.join(repo, rel), JSON.stringify(data));
}

test("plan mode writes docs only, even after an approval attempt", () => {
  const repo = makeRepo();
  start({ taskId: "o", level: "simple", session: S, mode: "plan", autoApprove: true }, repo);
  assert.equal(readTask(repo, S).approved, false);
  assert.equal(planGate(edit("docs/plans/2026-11-18-o/plan.md"), repo), null);
  assert.match(planGate(edit("src/App.tsx"), repo), /only plans/);
  assert.equal(approveHook({ command_name: "usta:approve", session_id: S }, repo).decision, "block");
  assert.match(planGate(edit("src/App.tsx"), repo), /only plans/);
});

test("plan mode keeps its mode when the plan is registered", () => {
  const repo = makeRepo();
  start({ taskId: "o", level: "simple", session: S, mode: "plan" }, repo);
  start({ taskId: "o", level: "simple", session: S, plan: "docs/plans/p.md", autoApprove: true }, repo);
  assert.equal(readTask(repo, S).mode, "plan");
  assert.equal(readTask(repo, S).approved, false);
});

test("plan mode shell is read-only", () => {
  const repo = makeRepo();
  start({ taskId: "o", level: "moderate", session: S, mode: "plan" }, repo);
  for (const command of ["git diff HEAD~1", "ls src && cat package.json", "grep -rn foo src | head"]) {
    assert.equal(bashGate(bash(command), repo), null, command);
  }
  for (const command of ["npm install", "echo x > src/a.ts", "sed -i s/a/b/ src/a.ts", "git diff --output=x.patch", "git commit -m x"]) {
    assert.match(bashGate(bash(command), repo), /read-only/, command);
  }
});

test("plan mode runs only the planning agents", () => {
  const repo = makeRepo();
  start({ taskId: "o", level: "complex", session: S, mode: "plan" }, repo);
  for (const role of ["usta:analyzer", "usta:planner", "usta:reviewer", "usta:security-reviewer"]) {
    assert.equal(agentGate(agent(role), repo), null, role);
  }
  for (const role of ["usta:coder", "usta:tester", "usta:simplifier"]) {
    assert.match(agentGate(agent(role), repo), /only plans/, role);
  }
});

test("fast mode is approved at once and refuses risky or big work", () => {
  const repo = makeRepo();
  assert.equal(start({ taskId: "f", level: "trivial", session: S, mode: "fast" }, repo).approved, true);
  assert.throws(() => start({ taskId: "g", level: "simple", session: S, mode: "fast", risks: ["payments"] }, repo), /Too big for \/usta:tez/);
  assert.throws(() => start({ taskId: "h", level: "trivial", session: S, mode: "fast", taskType: "migration" }, repo), /Too big/);
  assert.throws(() => start({ taskId: "i", level: "moderate", session: S, mode: "fast" }, repo), /Too big/);
});

test("fast mode stops at max_files distinct files and uses no usta agents", () => {
  const repo = makeRepo();
  writeJson(repo, ".claude/usta.json", { requireTask: true });
  start({ taskId: "f", level: "simple", session: S, mode: "fast" }, repo);
  for (const file of ["src/a.ts", "src/b.ts", "src/c.ts", "src/a.ts"]) assert.equal(planGate(edit(file), repo), null, file);
  assert.match(planGate(edit("src/d.ts"), repo), /at most 3 files/);
  assert.equal(planGate(edit("docs/known-issues/x-bugs.md"), repo), null);
  assert.deepEqual(readTask(repo, S).files, ["src/a.ts", "src/b.ts", "src/c.ts"]);
  assert.match(agentGate(agent("usta:coder"), repo), /works alone/);
  assert.equal(agentGate(agent("Explore"), repo), null);
});

test("prompt reminder only for requireTask projects, plain prompts and no active task", () => {
  const repo = makeRepo();
  const prompt = (text) => promptReminder({ prompt: text, session_id: S, cwd: repo }, repo);
  assert.deepEqual(prompt("fix the header"), {});
  writeJson(repo, ".claude/usta.json", { requireTask: true });
  assert.match(prompt("fix the header").hookSpecificOutput.additionalContext, /usta:tez/);
  assert.deepEqual(prompt("/usta:task fix the header"), {});
  start({ taskId: "t", level: "simple", session: S }, repo);
  assert.deepEqual(prompt("and the footer"), {});
});
