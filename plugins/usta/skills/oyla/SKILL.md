---
name: oyla
description: Plan-only mode - read the code, find risks, ask the human the decisions that matter, and write the plan into docs/plans/ (brainstorm, plan, progress, HANDOFF). Never changes source code, even in auto mode; /usta:resume builds the plan later. Use when the human asks to think, plan, estimate or review risks before building.
argument-hint: <what you want planned>
model: opus
allowed-tools: Bash(node ${CLAUDE_PLUGIN_ROOT}/scripts/task-state.mjs *)
---
You are the orchestrator from the `usta:task` skill, but this run only thinks and plans. Load the
`usta:task` skill for the setup, paths, routing and docs rules (its sections 0, 1 and the brainstorm,
plan and critique parts of 3), and the `usta:project-docs` skill. Talk to the human in their language.

Request: $ARGUMENTS

**What hooks enforce for this session, whatever the permission mode:** edits only under `docs/`,
shell commands only if they read, and only the agents triage, analyzer, planner, reviewer and
security-reviewer. `/usta:approve` is refused. Do not try to get around any of this; if something
needs code or a command that writes, put it in the plan as a step.

1. **Triage:** `usta:triage` with the request word for word, as in the task skill.
2. **Register:** `node ${CLAUDE_PLUGIN_ROOT}/scripts/task-state.mjs start --session ${CLAUDE_SESSION_ID} --mode plan --task-id <short-slug> --level <level> --task-type <task_type> [--risks <areas>] --title "<a few words>"`.
   The level in its output decides the models (routing of that level; for an agent the level has no
   entry for, use opus with effort high). Task folder: `docs/plans/<YYYY-MM-DD>-<short-slug>/`.
3. **Analyze:** `usta:analyzer` on every level. Ask it for the risks, the questions that change the plan,
   and which installed rule packs apply (skills named `usta-<name>:*`, for example `usta-payme:payme-merchant`).
   Tell the planner and reviewer to load those packs.
4. **Brainstorm with the human:** as in the task skill. Ask every plan-changing question in one message,
   numbered, each with your recommended answer and why, then **stop and wait, even in auto mode**.
   Never answer for the human. Write the answers into brainstorm.md (lasting ones into docs/memory/MEMORY.md).
5. **Plan:** `usta:planner` with the task folder, the analysis and the answers. Then run the `start`
   command again with `--mode plan --plan <task folder>/plan.md` so the plan floors check the level.
6. **Critique:** `usta:reviewer` in plan critique mode (and `usta:security-reviewer` in plan critique mode
   when triage flagged risk areas), in parallel. Send their BLOCKER and MAJOR findings to the same
   planner once; the rest go into the plan's risks. A finding that needs the human's decision is a
   question for them: ask it the same way as in step 4.
7. **Docs:** plan.md status `draft`; progress.md has the brainstorm and plan ticked and every build step
   open; HANDOFF.md "Keyingi qadam": `/usta:resume <task folder>`.
8. **Report** in a few lines: the approach, the risks the critique found and how the plan answers them,
   the decisions taken, open questions, the level the build will run at. Tell the human that
   `/usta:resume <task folder>` builds it (with its own approval gate). Then run
   `node ${CLAUDE_PLUGIN_ROOT}/scripts/task-state.mjs clear --session ${CLAUDE_SESSION_ID}`.
