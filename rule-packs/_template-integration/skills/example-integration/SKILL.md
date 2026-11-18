---
name: example-integration
description: How to integrate PROVIDER (protocol, required checks, error codes, test cases) with examples for NestJS and Java. Load when a task adds, changes, reviews or tests PROVIDER code, for example "PROVIDER merchant API" or "PROVIDER callback".
user-invocable: false
---
# PROVIDER integration

<!-- Rename the folder and `name` to what the integration is, for example payme-merchant,
     eimzo-frontend, eimzo-backend, oneid. One skill per side or flow; one plugin per provider.
     The description decides when Claude loads this skill: name the provider and the words people use. -->

These add to usta's `engineering-standards`. **Precedence:** the project's own rules win.

## How it works
<the flow in a few lines: who calls whom, in what order, what is signed or verified>

## Rules (must hold in every implementation)
- <for example: verify the signature/credentials of every incoming request before reading the body>
- <idempotency: the same request twice gives the same answer and no second side effect>
- <amounts, currencies, time zones, timeouts, retries>

## Error codes and answers
| Case | Code | Answer |
|---|---|---|
| <case> | <code> | <what to return> |

## Tests every implementation needs (tester, reviewer)
- <happy path, wrong credentials, repeated request, wrong amount, timeout, cancellation...>

## Security checks (security-reviewer)
- <what an attacker would try against this integration>

## Examples
Open only the one for the project's stack:
- NestJS: [references/nestjs.md](references/nestjs.md)
- Java (Spring): [references/java.md](references/java.md)
