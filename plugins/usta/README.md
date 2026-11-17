# usta

Multi-agent engineering workflow for Claude Code. `/usta:task <request>` runs triage, analysis,
a plan that a human approves with `/usta:approve`, then implementation, simplification, tests,
code review and a security review, with the model and effort for each role picked from `routing.json`
by complexity level. Stack-agnostic: project rules in CLAUDE.md, `.claude/rules/` and the skills
listed in `.claude/usta.json` override the plugin defaults. Run `/usta:init` once per
project to add docs templates and settings. Full guide (Uzbek): the repository README.
