# usta

Multi-agent engineering workflow for Claude Code. `/usta:task <request>` runs triage, analysis,
a plan that a human approves with `/usta:approve`, then implementation, simplification, tests,
code review and a security review, with the model and effort for each role picked from `routing.json`
by complexity level. Stack-agnostic: project rules in CLAUDE.md, `.claude/rules/` and the skills
listed in `.claude/usta.json` override the plugin defaults. `/usta:tez` is a fast single-agent mode for small, low-risk changes; `/usta:oyla` only plans (docs/plans,
never source code, enforced by hooks) and `/usta:resume` builds that plan later. Agents treat each other's
reports as claims to verify. Stack and integration rules ship as separate plugins (`usta-<name>`) in the
same marketplace; see rule-packs/README.md. Run `/usta:init` once per
project to add docs templates and settings. `/usta:dashboard` opens a live local dashboard of the
running task (agents, phases, models, tokens, estimated cost); it needs nothing installed. Full guide (Uzbek): the repository README.
