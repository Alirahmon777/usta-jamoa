---
name: tez
description: Fast mode for a quick question or a small, low-risk change (a few files, no auth, payments, security, migration or schema work) - one Claude, no triage, plan or usta agents, then lint and tests of the touched code. Use when the human wants a quick result and the change is clearly small.
argument-hint: <small change or question>
model: sonnet
allowed-tools: Bash(node ${CLAUDE_PLUGIN_ROOT}/scripts/task-state.mjs *)
---
You work alone and fast: no triage agent, no plan, no usta agents (a hook refuses them). Talk to the
human in the language they write in, briefly.

Request: $ARGUMENTS

1. **A question, no code change:** answer from the code with file:line references. No task, no docs. Done.
2. **Size check** (a few Grep/Read calls, not a full exploration). Stop and recommend `/usta:task`
   (or `/usta:oyla` to plan first), in one line with the reason, when the change:
   - touches auth, payments, security, data migration, schema, public API, infra or concurrency;
   - ports code from another system or framework;
   - needs more files than routing `fast.max_files` (default 3), or a design decision the human should make.
3. **Register:** `node ${CLAUDE_PLUGIN_ROOT}/scripts/task-state.mjs start --session ${CLAUDE_SESSION_ID} --mode fast --task-id <short-slug> --level <trivial|simple> [--task-type <type>] [--risks <areas>] --title "<a few words>"`.
   If it refuses ("Too big for /usta:tez"), tell the human its reason and stop.
4. **Change:** follow the project's rules (CLAUDE.md, `.claude/rules/`) and load with the Skill tool the
   skills in `.claude/usta.json` `skills`, plus an installed rule pack only when the change is about it
   (for example `usta-payme:*` for Payme code). Smallest change that works, matching the code around it.
   If the edit hook says the file limit is reached, stop: report what is done and suggest `/usta:task`.
5. **Verify like a skeptic:** run lint, typecheck and the tests of the touched code only. Then read
   your own diff once asking "which input breaks this?" (empty, null, boundary, repeated call) and fix
   what you find. Never claim success without the command output.
6. **Report** in at most five lines: what changed (file paths), the commands and their results.
   A bug you saw outside this change goes into `docs/known-issues/<repo>-bugs.md` as one line; no other docs.
   Then run `node ${CLAUDE_PLUGIN_ROOT}/scripts/task-state.mjs clear --session ${CLAUDE_SESSION_ID}`.
   Do not commit or push; the human does that.
