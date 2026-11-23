---
name: applying-security-best-practices
description: "WHEN the user asks for secure-by-default code, a security review, or a vulnerability report of Tastebench, or a change touches firestore.rules, secrets, workflows or rendering of user text."
---

# Applying security best practices in Tastebench

Use this skill for an explicit security request, and for any change to `firestore.rules`, `.github/workflows/`, environment variables or rendering of user-entered text.

## Threat model in one paragraph

The whole client is public: the bundle, the Firebase web config and the room codes. Any signed-in (anonymous) user can call Firestore directly with the same config. So `firestore.rules` is the only authorization. Room names, entry titles, criteria, participant names and notes are untrusted input from other people in the room.

## Workflow

1. Name the scope: React frontend (`src/`), Firestore rules, or CI (`.github/workflows/`).
2. For the frontend, read [references/react-frontend.md](references/react-frontend.md). It adapts the React and general web frontend references of the `applying-security-best-practices` source to this repo.
3. For rules, check each write path against `firestore.rules` and prove it with allow and deny cases in `tests/emu/rules.test.ts`.
4. For CI, check secret exposure: which workflows and branches can read a secret, which third-party actions run in that job, and whether each one is pinned to a SHA.
5. For a fix, change only what the finding needs and run `pnpm test` and `pnpm test:emu`.
6. For a report, order findings by severity, give `file:line` evidence, and keep to issues with a concrete misuse path.

## Known risks to check first

- A rule branch without `hasOnly` lets a caller write extra fields.
- A delete that leaves child documents (a room deleted without its `participants`) leaves readable orphan data.
- A new `VITE_` variable is public. Never put a secret in one.
- A workflow with `workflow_dispatch` gives repository secrets to any branch that a writer pushes.

## Hard rules

- **SEC-HARDCODED-SECRET**: Do not commit a real credential, token, or private key in source or config. Instead, read it from the environment or a secret store at runtime: `VITE_FIREBASE_*` repository variables for the web config, a GitHub secret for a service account key.
  decision: keep
  Known debt: none found at onboarding.

- **SEC-INJECTION**: Do not build a SQL query, shell command, or file path by concatenating untrusted input. Instead, use parameterized queries, argument arrays, and path validation against an allowed root.
  decision: keep
  Known debt: none found at onboarding.

- **SEC-UNSAFE-HTML**: Do not render untrusted input as raw HTML, for example through `dangerouslySetInnerHTML` or `innerHTML`. Instead, render it as text (JSX escapes by default), or sanitize it with a maintained sanitizer first.
  decision: keep
  Known debt: none found at onboarding.

> Before you write code that breaks a hard rule, stop. Tell the user the rule
> id, the rule, and the good alternative, and wait for an answer. Do not stop
> when a suppression row loaded at session start covers the rule for this
> path, or when the user told you in this session to keep the pattern.
>
> A hard rule wins over any deferral to repo precedent in this skill, its
> references, or the vendored material, such as "only if the project already uses it". A
> suppression row applies only when its Scope glob matches the path that you
> write. Otherwise, the warning fires.
>
> Add a row to `.claude/AGENT_SUPPRESS_WARNINGS.md` only when the
> user explicitly suppresses a warning. Use this format, and create the file
> with its header when it does not exist:
> `| Rule | Skill | Scope | Reason | Date | By |`
> A new row applies only after its PR merges to the default branch. Until
> then, the exception for a user who told you to keep the pattern covers it.

_Source: applying-security-best-practices (repo-onboarder 6.0.0)._
