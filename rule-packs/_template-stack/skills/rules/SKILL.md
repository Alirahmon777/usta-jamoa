---
name: rules
description: STACK rules (structure, naming, errors, testing) plus checklists for the usta coder, simplifier, tester and reviewer. Load when writing, simplifying, testing or reviewing STACK code in a project that lists usta-STACK:rules in .claude/usta.json.
user-invocable: false
---
# STACK rules

These add to usta's `engineering-standards`. **Precedence:** the project's own rules (CLAUDE.md,
`.claude/rules/`, project skills) win wherever they differ.

<!-- Keep this file short (under ~150 lines): every agent loads it on every task.
     Long examples go to references/<topic>.md and are linked from here; agents open them only when needed. -->

## Rules
- <one rule per line, each one checkable in review>

## Coder checklist
- <what to do while writing code>

## Simplifier checklist
- <STACK-specific over-engineering to remove>

## Tester checklist
- <test framework, layout, what every change must test, how to break STACK code>

## Reviewer checklist
- <what to reject in review, with the rule it breaks>
