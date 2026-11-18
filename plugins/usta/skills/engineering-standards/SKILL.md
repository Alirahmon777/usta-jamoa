---
name: engineering-standards
description: Core senior-engineering standards (simplicity first, surgical changes, verified execution, production concerns). Preloaded by the usta agents; load it before writing, simplifying or reviewing code.
user-invocable: false
---
# Engineering standards (stack-agnostic core)

**Precedence:** the project's own rules win wherever they differ: CLAUDE.md, `.claude/rules/`, project and personal skills, and the skills listed in `.claude/usta.json`. This file is the default only.

The bar: code a strong senior engineer would approve in review without comments.
Senior code is mostly *boring*: small, obvious, consistent with the codebase. Cleverness is a cost.

## 1. Think before coding
- Restate the goal and the acceptance criteria in one or two lines before touching code.
- State assumptions explicitly. If two readings of the request exist, name both and pick one with a reason.
- If a simpler approach than the one requested exists, say so before implementing.

## 2. Simplicity first (the most important rule)
- Write the least code that fully solves the stated problem.
- No speculative features, options, flags, config, plugin points or "future-proofing".
- No abstraction (interface, base class, factory, strategy, generic helper) until there are **three** real call sites.
- No new dependency when the standard library or an existing dependency does the job.
- Prefer plain functions and data over class hierarchies. Prefer early returns over nested conditionals.
- Functions do one thing; aim for < 40 lines and <= 3 levels of nesting. Names say what, not how.
- Handle errors that can actually happen at this boundary; do not wrap impossible cases in try/except.
- Comments explain *why*, never *what*. Delete commented-out code.
- Simple is not the same as short: prefer explicit, readable code over clever one-liners;
  no nested ternaries (use if/else or switch); do not merge unrelated concerns to save lines.
- Self-check before finishing: "Would a senior reviewer call any part of this over-engineered?" If yes, cut it.

## 3. Design principles (applied through simplicity)
Use these to judge a design, not as patterns to add. **When they conflict, KISS and YAGNI win.**
- **KISS:** the most direct solution a reader understands on first pass.
- **YAGNI:** build only what the current acceptance criteria need. No hooks for imagined futures.
- **DRY:** one source of truth for a piece of *knowledge* (a rule, a constant, a schema). Duplicated
  code is fine until the third real copy; a wrong shared abstraction costs more than duplication.
- **SOLID**, pragmatically:
  - Single responsibility: a function, component or module has one reason to change.
  - Open/closed: extend by adding code, but only at a point that already varies today.
  - Liskov: a subtype or implementation honours the full contract of what it replaces.
  - Interface segregation: small, specific props, parameters and interfaces; no "options bag".
  - Dependency inversion: depend on an interface only at real boundaries (I/O, network, storage,
    third-party services) where tests or a second implementation need it. Not for internal code.
- Composition over inheritance; pure functions where possible; side effects at the edges.

## 4. Surgical changes
- Touch only what the task needs. Match the existing style, naming, folder layout and patterns of the file you are in, even if you would do it differently.
- Do not refactor, reformat or rename unrelated code. Mention problems you notice instead of fixing them.
- Remove only imports/functions that your own change made unused.

## 5. Goal-driven, verified execution
- Turn the task into checks: a failing test that reproduces the bug, or tests for each acceptance criterion.
- Run lint, typecheck and tests after each step. Never claim success without command output that shows it.
- Never disable, skip or weaken a test to make it pass.

## 6. Verify, don't trust (how usta agents treat each other)
- Another agent's report is a claim, not evidence. "Tests pass", "all criteria met", "no callers
  affected": check it yourself (run the command, open the file) before you build on it.
- Your job is to find what is wrong, not to agree. Ask how it breaks: empty, null, huge or malformed
  input, the boundary value, the same call twice, two calls at once, a failure halfway, a missing
  permission, the old data already in production.
- Every finding carries evidence: a command and its output, or file:line and the input that breaks it.
  A finding you cannot back up is a question, and you say so.
- Finders report, the coder fixes, finders check the fix. Never fix code you are judging.
- Being critical is not being noisy: no style nitpicks dressed up as findings.

## 7. Production concerns (proportional to risk)
- Validate input at trust boundaries; parameterize queries; never log secrets or personal data.
- Database/schema changes are backward compatible and come with a migration and a rollback note.
- Public API changes are versioned or backward compatible.
- Add logging/metrics only where an on-call engineer would need them.
