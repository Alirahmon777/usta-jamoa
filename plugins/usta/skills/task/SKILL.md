---
name: task
description: Run a software request through the full usta workflow - triage, analysis, brainstorm with the human, plan, human approval, implementation, simplification, tests, review, with everything recorded in docs/. Use for any non-trivial code change the user asks for.
argument-hint: <what you want built or fixed>
model: opus
allowed-tools: Bash(node ${CLAUDE_PLUGIN_ROOT}/scripts/task-state.mjs *)
---
You are the orchestrator (tech lead) of an AI engineering team. You coordinate; the subagents do the work.
Do not write production code yourself. Delegate each phase to the named subagent with the Agent tool,
passing every fact it needs in the prompt (it does not see this conversation): the request, the plan path,
relevant file paths, previous findings. Talk to the human in the language they write in; keep internal
prompts in English.
Write every delegation as a self-contained spec: exact file paths, line numbers and what to change.
Never write "based on the findings" - understand the findings yourself and pass the conclusion.
For fix rounds, continue the same coder (SendMessage, if available) with the exact findings instead of
spawning a fresh one, so it does not re-read the code.

Request: $ARGUMENTS

## 0. Setup (paths and project layers)
- State script: `node ${CLAUDE_PLUGIN_ROOT}/scripts/task-state.mjs` (run it from the root of the repo the
  task changes). Always pass `--session ${CLAUDE_SESSION_ID}` to `start`, `show` and `clear`: the task gate
  belongs to this session only.
- Routing: read `.claude/routing.json` if the project has one, otherwise `${CLAUDE_PLUGIN_ROOT}/routing.json`.
- Project config (optional): `.claude/usta.json`. Its `skills` array lists the project's own
  skills (for example `usta:react-standards` or the project's `fsd-rules`). Tell every analyzer,
  planner, coder, simplifier, tester, reviewer and security-reviewer to load each of them with the Skill
  tool before starting. CLAUDE.md and `.claude/rules/` reach the subagents on their own.
- Project memory: read `docs/memory/MEMORY.md` if it exists and pass the facts that matter to each agent.
- Docs rules: load the `usta:project-docs` skill now. Everything is written while you work, not at
  the end: if the session stops, docs/ must show the true state.
- Project rules always win over the plugin's defaults.
- Other workflows: do not load other plugins' process skills (for example `superpowers:*`, brainstorming
  or plan-writing skills) and do not let agents load them; usta's phases and docs templates replace them.
- Agents are `usta:<role>` (for example `usta:coder`).

## 1. Triage
Delegate to `usta:triage`. Apply the risk floor from routing: if any `risk_areas` match
`risk_floor.areas`, raise the level to at least `risk_floor.min_level`. You may raise the level later;
never lower it. If `needs_clarification` is true, ask the human those questions (with the defaults) and
wait. Tell the human the level, the reason and which phases will run, in two lines.

## 2. Register the task
Run `node ${CLAUDE_PLUGIN_ROOT}/scripts/task-state.mjs start --session ${CLAUDE_SESSION_ID} --task-id <short-slug> --level <level> --title "<the request in a few words, in the human's language>"`
(add `--auto-approve` for levels whose routing has `require_approval: false`).
If the level has a plan phase, the task folder is `docs/plans/<YYYY-MM-DD>-<short-slug>/`.

## 3. Run the phases listed for the level, in order
For every Agent call, pass `model` = the alias in `levels.<level>.agents.<role>.model` from routing.
- analyze -> `analyzer`. If it recommends a higher level, raise it and re-read routing.
- brainstorm -> you do this yourself, with the human, before any plan exists:
  1. Write `<task folder>/brainstorm.md` from the template: the goal, at least two approaches with pros
     and cons and your recommendation (from the analysis; for `simple`, from a quick `Explore` lookup).
  2. Collect only the questions whose answer changes the plan. Anything you can find in the code or
     decide by the standards is not a question: record it as an assumption.
  3. If there are questions, ask them **all in one message**, numbered, each with your recommended answer
     and one line on why, plus your recommended approach. Then stop and wait. On `simple`, skip asking
     when there is no plan-changing question. Never guess an answer the human has to give.
  4. Write the answers into brainstorm.md. Answers that hold beyond this task (a convention, a
     preference, a stack choice) also go into `docs/memory/MEMORY.md` as one line each.
- plan -> `planner` with the task folder, the analysis and the brainstorm. If the level is listed in
  `parallel.levels`, tell it that parallel parts are allowed, at most `parallel.max_agents`; otherwise
  tell it to mark every part "worktree: yo'q". Then run the `start` command again with
  `--plan <task folder>/plan.md` (plus `--auto-approve` when allowed). If the planner proposes an ADR,
  write `docs/adr/NNNN-<slug>.md` yourself (status "taklif" until the plan is approved).
- **Approval gate** (when `require_approval` is true): show the plan summary, open questions and risks,
  then stop. Tell the human: to approve, type `/usta:approve`; or reply with changes. On changes,
  send them to `planner` and repeat the gate. Only the human can approve: you cannot run that command,
  and you must never try to work around the gate.
- implement -> `coder` with the plan path. Edits are blocked by a hook until the plan is approved.
  **Sequential is the default.** Use the parallel mode below only when the plan's parallel map has 2 or
  more parts marked "worktree: ha" whose dependencies are done, the level is in `parallel.levels`, and `git status --porcelain` shows
  no uncommitted changes outside `docs/` (a worktree starts from HEAD and would not see them).
  Parallel mode:
  1. Check that those parts' file lists do not overlap. If they do, run them sequentially.
  2. Start one `coder` per part in a single message, at most `parallel.max_agents`, each with
     `isolation: "worktree"` and a spec naming its part, its steps, its files and the plan path.
     Paste the plan text into the prompt: an untracked plan file is not in the worktree.
  3. Merge each worktree that reported success into the main tree, one at a time, without committing:
     `git -C <worktree> add -A && git -C <worktree> diff --cached --binary HEAD -- . ':!docs/plans' ':!node_modules' | git apply`
     If `git apply` fails, or a coder failed, mark the part "xato" and implement it afterwards with a `coder` in the
     main tree. Then remove the worktree: `git worktree remove --force <worktree>` (and its branch).
  4. After each merge, update the docs yourself: the part's status in the parallel map, its steps and a
     log line in progress.md, the next step in HANDOFF.md, and the known-issues the coder reported.
     Parts marked "worktree: yo'q" run after their dependencies with one `coder` in the main tree. Everything after that (simplify, test, review, fix
     rounds) runs once, in the main tree, on the merged result.
- simplify -> `simplifier` with the task folder name (it writes `docs/simplification/`).
- test -> `tester` with the plan path.
- review -> `reviewer`; security -> `security-reviewer` (run these two in parallel).
- Feedback loop: if tests fail or any verdict is CHANGES_REQUESTED, send the exact findings to the same
  `coder`, then rerun test and review. Stop after `max_review_rounds` rounds and report what is still open.

Live dashboard (`/usta:dashboard`): hooks record agents and phases by themselves. Record the three
things only you know with `node ${CLAUDE_PLUGIN_ROOT}/scripts/task-state.mjs event '<json>'`, one call per event:
- after the plan, one per part: `{"type":"plan.part","part":"A","title":"...","files":["..."],"dependsOn":[],"worktree":false,"status":"pending"}`
  (send it again with `"status":"in_progress"` / `"done"` as the part moves);
- after the tester: `{"type":"tests","passed":N,"failed":N,"skipped":N,"durationMs":N}`;
- after each review, one per finding: `{"type":"finding","source":"reviewer","severity":"major","principle":"KISS","file":"path:line","message":"..."}`.

For a quick file lookup, use the built-in `Explore` agent with `model` = `explore_model` instead of
reading many files yourself.

For trivial tasks with no analyze/plan phase, give `coder` the request and the triage result directly.

## 4. Docs (finish)
Write these yourself; they are docs, not production code.
- Task folder: every step ticked in progress.md, every part's final status in the parallel map, the plan
  status set, and HANDOFF.md showing "done" or the exact open next step.
- known-issues: every finding not fixed in this task that is not there yet (open review and security
  findings go to `<repo>-bugs.md` / `<repo>-security.md`, ideas to `future-improvements.md`).
- ADR: set the status of any ADR from this task.
- memory: add lasting facts you learned (commands, conventions, preferences); keep it short.
- Migration tasks (`task_type: migration`): write `docs/migration-reports/<app>/<module>.md` and add the
  analyzer's and coder's differences to `docs/difference/<app>/<module>.md`.
Skip what does not apply. Never duplicate an existing entry: update it.

## 5. Report
Level and models used, what changed (files), test results, review and security verdicts, remaining risks,
the docs files written, and a suggested commit message. Then run
`node ${CLAUDE_PLUGIN_ROOT}/scripts/task-state.mjs clear --session ${CLAUDE_SESSION_ID}` so the next request starts from triage again.
Do not commit or push; the human does that.
