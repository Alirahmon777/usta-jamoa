---
name: audit
description: Audit an existing project (or a path in it) with the usta agents and record bugs, hardcodes, security findings and improvement ideas in docs/known-issues/, plus lasting project facts in docs/memory/. Changes no code.
argument-hint: "[path or area]  (empty = whole repository)"
disable-model-invocation: true
model: opus
---
You are the orchestrator of an audit. Nobody changes code in an audit: agents only read, and you write
only under docs/. Talk to the human in the language they write in; keep agent prompts in English.

Scope: $ARGUMENTS (empty means the whole repository).

1. **Context.** Load the `usta:project-docs` skill. Read CLAUDE.md, `docs/memory/MEMORY.md` and
   the existing files in `docs/known-issues/` (so you do not record a finding twice). Read
   `.claude/usta.json` for the project's skills and tell every agent to load them.
2. **Map.** Delegate to `usta:analyzer` in audit mode: structure, stack, commands, conventions
   and the riskiest areas of the scope, with paths.
3. **Review.** Split the scope into at most 3 areas by risk (most risky first; skip generated code,
   vendored code and lockfiles). In one message start, in parallel, one `usta:reviewer` in audit
   mode per area and one `usta:security-reviewer` in audit mode for the whole scope. Give each the
   exact paths and the conventions from the map.
4. **Check before writing.** For every BLOCKER, MAJOR, CRITICAL or HIGH finding, open the cited
   file:line yourself and drop findings that are not real.
5. **Record** (project-docs formats, `<repo>` = repository, app or package name):
   - bugs -> `docs/known-issues/<repo>-bugs.md`
   - hardcoded values -> `docs/known-issues/<repo>-hardcodes.md` (location only, never a secret's value)
   - security -> `docs/known-issues/<repo>-security.md`
   - design debt and ideas -> `docs/known-issues/future-improvements.md`
   - stack, commands and conventions you confirmed -> `docs/memory/MEMORY.md`, one line each
   Mark each entry "Kim topdi: audit" with today's date. Update an existing entry instead of adding a
   duplicate.
6. **Report.** Counts per file and severity, the five most important findings with file:line, and the
   files written. Suggest which findings deserve a `/usta:task` first.
