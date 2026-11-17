---
name: react-standards
description: Opt-in React + TypeScript standards (components, effects and hooks, state, accessibility, React Testing Library) plus React checklists for the simplifier, reviewer and tester. Use when writing, simplifying, reviewing or testing React/TypeScript code in a project that lists this skill in .claude/usta.json or has no React rules of its own.
---
# React + TypeScript standards (opt-in)

These add to the `engineering-standards` skill. **Precedence:** the project's own rules (CLAUDE.md,
`.claude/rules/`, project skills) override this file wherever they differ.
When this file and the existing code disagree, follow the existing code and mention the difference.

## TypeScript
- `strict` mode. No `any`; use `unknown` and narrow it. No `as` casts except at validated boundaries.
- Type props with a named `type XxxProps`. Let TypeScript infer local variables and return types of small functions.
- Model states with discriminated unions (`{ status: "loading" } | { status: "error"; error: Error } | ...`)
  instead of several booleans.
- Validate data from the network at the boundary (e.g. zod), then trust the types inside.

## Components
- One component per file for exported components; small private helpers may live alongside.
- Function components only. Keep a component under ~150 lines; split by responsibility, not by line count.
- Props are the API: keep them few and specific. No "config object" props, no boolean flags that switch
  between two different components (make two components).
- Derive values during render instead of copying props or other state into state.
- Lift state only as high as needed. Reach for context only for truly global values (theme, auth, locale),
  not to avoid passing a prop two levels.

## Effects and hooks
- `useEffect` is for synchronizing with something outside React (subscriptions, DOM APIs, timers).
  Do not use it to derive data, respond to events, or reset state. Handle events in event handlers.
- Data fetching goes through the project's data layer (e.g. TanStack Query, SWR, framework loaders),
  not hand-written `useEffect` + `useState` fetches.
- `useMemo`/`useCallback` only for a measured problem or a referential-equality requirement
  (memoized child, effect dependency). Not by default.
- Custom hooks only when logic is reused or the component becomes hard to read; name them `useXxx`.
- Obey the rules of hooks and exhaustive dependencies; never silence the lint rule.

## Styling, accessibility, UX
- Use the project's existing styling approach; do not introduce a second one.
- Semantic HTML first (`button`, `label`, `nav`); every interactive element is keyboard reachable and
  has an accessible name. Images have `alt`.
- Every async UI has loading, empty and error states.

## Lists, keys, performance
- Keys are stable IDs, never array indexes for lists that change.
- No premature optimization; check bundle impact before adding a dependency.

## Tests
- Test behavior the user sees with React Testing Library: query by role/label/text, interact with
  `userEvent`, assert on the screen. Do not test implementation details or internal state.
- Mock the network at the boundary (e.g. MSW), not internal modules.
- Critical user flows (auth, checkout, forms that save data) also get a Playwright e2e test.

## Checklists per role
- **simplifier:** state that can be derived during render; `useEffect` used to derive data or handle
  events; `useMemo`/`useCallback` without a real need; context used to skip one or two prop levels;
  boolean-flag props that switch between two components; hand-written fetch effects where the project
  has a data layer; nested ternaries in JSX (extract a small component or early return).
- **reviewer:** rules of hooks and effect dependencies, effects used for derivation or events, unstable
  list keys, `any` or unsafe casts, missing loading/empty/error states, accessibility (semantic
  elements, labels, keyboard), needless re-renders only when they are visible, new dependencies and
  bundle size growth.
- **tester:** component tests with React Testing Library (query by role/label/text, `userEvent`, assert
  on what the user sees); mock the network at the boundary (MSW), not internal modules; critical flows
  (auth, payments, forms that save data) also get a Playwright e2e test.
