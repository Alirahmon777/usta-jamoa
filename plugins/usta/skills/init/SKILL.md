---
name: init
description: Set up the current project for the usta workflow - docs/ folders and templates (plans, memory, adr, simplification, known-issues), .claude/usta.json, .gitignore and a short CLAUDE.md section. Safe to run again.
disable-model-invocation: true
---
Set up this project for the usta plugin. Never overwrite a file that already exists: add only
what is missing and report what you skipped. Work from the project root.

1. **docs/ folders.** Copy what is missing from `${CLAUDE_PLUGIN_ROOT}/templates/docs/`:
   - `docs/plans/_TEMPLATE/` (brainstorm.md, plan.md, progress.md, HANDOFF.md)
   - `docs/known-issues/_TEMPLATE.md`, `docs/adr/_TEMPLATE.md`, `docs/simplification/_TEMPLATE.md`
   - `docs/memory/MEMORY.md` (a real file, not a template): fill "Stack va buyruqlar" with what you
     find in the repository.
   - `docs/difference/` and `docs/migration-reports/` only if the human says this is a migration project.
   If the project already keeps its docs elsewhere, ask before creating these folders.

2. **.gitignore.** Make sure it contains `.claude/state/` (the active task lives there).

3. **CLAUDE.md.** If there is no "How work flows here" section, append this (create the file if needed),
   then fill the commands from `package.json`, `Makefile`, `pyproject.toml` or similar, and leave the
   rest of the file untouched:
   ```markdown
   ## How work flows here
   Non-trivial requests go through `/usta:task <request>`:
   triage -> analysis -> plan -> human approval (`/usta:approve`) -> implement -> simplify -> test -> review.
   Continue unfinished work in a new session with `/usta:resume docs/plans/<plan>.md`.
   Project rules in this file and in `.claude/rules/` override the plugin's default standards.
   Find bugs and debt in existing code with `/usta:audit`.

   ## Project memory
   @docs/memory/MEMORY.md

   ## Commands
   - Lint: `<command>`
   - Typecheck: `<command>`
   - Tests: `<command>`
   - Build: `<command>`
   - Full verify (run before saying "done"): `<commands joined with &&>`

   ## Repo-specific lessons
   <!-- Add a line here every time an agent makes the same mistake twice. -->
   ```

4. **Project config** (do this last: once `requireTask` is on, other files need a task). If
   `.claude/usta.json` is missing, create it. Agents can create this file but not change it later,
   so get the human's answers first:
   ```json
   {
     "requireTask": true,
     "skills": []
   }
   ```
   - `requireTask: true` means source files cannot be edited outside `/usta:task`. Ask the
     human whether they want that (recommended) or `false` (the gate only applies while a task runs).
   - `skills`: the skills every agent loads before it starts. Look at the stack: if `package.json`
     depends on `react`, propose `"usta:react-standards"`. If stack rule packs are installed (skills
     named `usta-<stack>:rules`, for example `usta-java:rules` or `usta-react-fsd:rules`), propose the
     ones that match the stack. Integration packs (for example `usta-payme:*`) are not listed here:
     they load only for tasks about them. If the project has its own skills in
     `.claude/skills/`, list them and ask which ones every agent should load. Write only what the human
     confirms.

5. **Optional overrides** (mention, do not create): copy `${CLAUDE_PLUGIN_ROOT}/routing.json` to
   `.claude/routing.json` to change models, effort, phases or budgets for this project only.

Finish with a short list of what was created, what was skipped, and the next commands to try:
`/usta:audit` for an existing codebase, then `/usta:task <request>`.
