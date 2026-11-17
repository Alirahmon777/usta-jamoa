#!/usr/bin/env node
// SubagentStart / SubagentStop hook for usta:* agents: records each agent run in the dashboard's event log.
// It stays silent outside /usta:task (no active task), except for triage, which runs before the task exists.
import { existsSync, readFileSync, realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { emit, enterBrainstormIfNext, enterPhase, ROLE_PHASE, settlePhase } from "./events.mjs";
import { findTaskProject, projectDir, readTask, routingPath } from "./task-state.mjs";

/** USD per million tokens. An estimate for the dashboard, not a bill; unknown models count as 0. */
const PRICES = {
  opus: { input: 4, output: 20, cacheRead: 0.2 },
  sonnet: { input: 2, output: 10, cacheRead: 0.1 },
  haiku: { input: 0.1, output: 0.5, cacheRead: 0.01 },
};
const CACHE_WRITE_FACTOR = 1.25;

export const modelAlias = (model = "") => Object.keys(PRICES).find((alias) => model.includes(alias));

/** Sums one subagent transcript: tokens, estimated cost and the model it actually ran on. */
export function usage(transcriptPath) {
  const result = { tokens: 0, costUsd: 0, model: undefined };
  if (!transcriptPath || !existsSync(transcriptPath)) return result;
  const seen = new Set();
  for (const line of readFileSync(transcriptPath, "utf8").split("\n")) {
    if (!line.includes('"usage"')) continue;
    const entry = JSON.parse(line);
    const { usage: u, model } = entry.message ?? {};
    // One API response is split over several transcript lines that repeat its usage.
    if (!u || seen.has(entry.requestId)) continue;
    seen.add(entry.requestId);
    result.model = modelAlias(model) ?? result.model;
    const write = u.cache_creation_input_tokens ?? 0;
    const read = u.cache_read_input_tokens ?? 0;
    result.tokens += u.input_tokens + write + read + u.output_tokens;
    const price = PRICES[modelAlias(model)];
    if (price) {
      result.costUsd +=
        (u.input_tokens * price.input + write * price.input * CACHE_WRITE_FACTOR + read * price.cacheRead +
          u.output_tokens * price.output) / 1e6;
    }
  }
  result.costUsd = Math.round(result.costUsd * 10_000) / 10_000;
  return result;
}

/** One short line from the agent's final answer. */
export function summarize(message = "") {
  const level = message.match(/"level"\s*:\s*"(\w+)"/)?.[1];
  if (level) return `daraja: ${level}`;
  const line = message
    .replace(/```[\s\S]*?```/g, "")
    .split("\n")
    .map((text) => text.replace(/[#*`>|]/g, "").trim())
    .find((text) => text.length > 3);
  return line && line.length > 120 ? `${line.slice(0, 117)}…` : line;
}

/**
 * SubagentStop can fire a moment before the agent's last reply reaches its transcript.
 * Waits (at most ~2s) until the reply is there, so its tokens are counted.
 */
function waitForTranscript(transcriptPath, lastMessage = "") {
  const snippet = JSON.stringify(lastMessage.slice(0, 40)).slice(1, -1);
  const sleeper = new Int32Array(new SharedArrayBuffer(4));
  for (let attempt = 0; attempt < 20; attempt++) {
    if (!transcriptPath || !existsSync(transcriptPath)) return;
    if (readFileSync(transcriptPath, "utf8").includes(snippet)) return;
    Atomics.wait(sleeper, 0, 0, 100);
  }
}

/** The model and effort routing assigns to a role; the real model is filled in when the agent stops. */
function routed(project, role, level) {
  const routing = JSON.parse(readFileSync(routingPath(project), "utf8"));
  if (role === "triage") return { model: routing.triage_model, effort: "medium" };
  return routing.levels[level]?.agents?.[role] ?? { model: routing.orchestrator_model, effort: "–" };
}

export function record(payload, sessionProject) {
  const role = (payload.agent_type ?? "").replace(/^usta:/, "");
  const phase = ROLE_PHASE[role];
  // The task's project (it may be a nested repo the state script ran in) gets the events.
  const home = findTaskProject([sessionProject, payload.cwd], payload.session_id);
  const task = home && readTask(home, payload.session_id);
  const project = home ?? sessionProject;
  if (!phase || (!task && role !== "triage")) return;

  if (payload.hook_event_name === "SubagentStart") {
    enterPhase(project, phase);
    const { model, effort } = routed(project, role, task?.level);
    emit(project, { type: "agent.started", id: payload.agent_id, agent: role, model, effort, phase });
  }

  if (payload.hook_event_name === "SubagentStop") {
    waitForTranscript(payload.agent_transcript_path, payload.last_assistant_message);
    const { model, ...spent } = usage(payload.agent_transcript_path);
    emit(project, {
      type: "agent.finished",
      id: payload.agent_id,
      status: "ok",
      ...spent,
      ...(model && { model }),
      ...(payload.effort?.level && { effort: payload.effort.level }),
      summary: summarize(payload.last_assistant_message),
    });
    settlePhase(project, phase);
    if (task) enterBrainstormIfNext(project);
  }
}

// realpath: the plugin may be reached through a symlink, while import.meta.url is always resolved.
if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const payload = JSON.parse(readFileSync(0, "utf8"));
  try {
    record(payload, process.env.CLAUDE_PROJECT_DIR || payload.cwd || projectDir());
  } catch (error) {
    // The dashboard is optional: never break the agent run because of it.
    process.stderr.write(`usta dashboard event skipped: ${error.message}\n`);
  }
}
