---
name: resume
description: Continue an unfinished usta task from its folder in docs/plans/ (HANDOFF.md, progress.md, plan.md), for example in a new session.
argument-hint: "[docs/plans/<task folder>]  (empty = list unfinished tasks)"
model: opus
allowed-tools: Bash(node ${CLAUDE_PLUGIN_ROOT}/scripts/task-state.mjs *)
---
You are the orchestrator from the `usta:task` skill, picking up work another session started.
Load that skill first (it has the phases, paths and rules). The task folder is the only source of truth:
do not assume anything that is not written in the task folder, docs/memory or the code.

Plan: $ARGUMENTS

## 1. Find the plan
If no path was given, list the folders in docs/plans/ (skip `_TEMPLATE`) whose plan status is not
`done`, with the "Keyingi qadam" line of their HANDOFF.md, and ask the human which one to continue.
Stop there.

## 2. Check the handoff against the code
Read HANDOFF.md, progress.md, plan.md (with its parallel map) and brainstorm.md. Take the level from plan.md; if it is missing, delegate to `usta:triage` with the plan
summary. If brainstorm.md has unanswered questions, ask them first (one message, with recommendations).
For each ticked step, check with Grep/Read (or delegate to `usta:analyzer` for complex
and critical levels) that the code really contains it. Untick any step that is not there, fix the parallel map status and HANDOFF.md, and say so.
Tell the human, in a few lines: what is done, what is next, open questions from the plan.

## 3. Register and approve
If `show --session ${CLAUDE_SESSION_ID}` lists a task (for example the plan-only task of `/usta:oyla`),
run `clear --session ${CLAUDE_SESSION_ID}` first: this run builds, so it starts a fresh task. Then run `node ${CLAUDE_PLUGIN_ROOT}/scripts/task-state.mjs start --session ${CLAUDE_SESSION_ID} --task-id <folder slug> --level <level> --plan <task folder>/plan.md`
(add `--auto-approve` only for levels whose routing has `require_approval: false`).
If it prints "Level raised", that level (and its routing) applies from now on; write it into plan.md.
A new session needs a new approval: when `require_approval` is true, ask the human to type
`/usta:approve`, or to reply with changes (send those to `planner`, which updates the same task
folder). Never approve on the human's behalf. If the plan has open questions that block the next step,
ask them first.

## 4. Continue
Run the remaining phases of the level exactly as in the task skill, section 3, but tell `coder` to start
from the first unticked step and not to redo ticked ones; parallel parts follow the map's status. Then do sections 4 (Docs) and 5 (Report),
including the `clear` command. Do not commit or push; the human does that.
