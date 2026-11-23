---
name: building-react-nextjs-uis
description: "WHEN you write or change React 19 components, hooks, effects or component composition in Tastebench."
---

# Building React UIs in Tastebench

Tastebench uses React 19 with Vite, not Next.js. There are no server components: every component runs in the browser, and every `VITE_` variable ships in the bundle.

## Default workflow

1. Use function components and hooks.
2. Keep components small and easy to test. Split a screen into a wrapper and a keyed child when per-item state must reset (`Rate` → `RateEntry key={i}`).
3. Derive UI from props and context instead of copying state (`states`, `last`, `incomplete` are computed on each render).
4. Use effects only to sync with something outside React: `window.scrollTo`, Firestore subscriptions in `useRoom`, the `prevStatus` ref in `RoomGate`.

## Hooks and composition

- Keep state where it is used. Share room data through `RoomContext`, not prop drilling.
- Extract a custom hook when behavior repeats or hides the component's intent (`useDebounced`, `useRoom`, `useAuth`).
- Return nothing or a cleanup function from an effect. Never return the result of a call.
- Name handlers for the user action (`next`, `go`, `confirmLock`, `startEdit`).
- Make loading, empty, error and disabled states real UI paths (`return null` while `room` is missing; `isDisabled` on Save when the draft is empty).
- `StrictMode` runs effects twice in development. Code must survive that.

## Composition and performance

- Compose with slots: `Screen` takes `actions` and `footer` as nodes; `RankingList` takes `renderAction`.
- Add `useMemo` or `useCallback` only for a measured problem.
- For deeper patterns, use the buckets this skill absorbs: `external-composition-patterns` (`react-patterns`, `react-state-management`, `vercel-composition-patterns`) and `external-react-performance` (`react-performance`, `vercel-react-best-practices`). Ignore their Next.js and server-component parts here.

## Hard rules

- **NEXT-CLIENT-SECRET**: Do not pass a secret or server-only data to a client component or a `NEXT_PUBLIC_` variable. Instead, keep it in server code and pass the client only the values it must display. In this repo every `VITE_` variable ships in the bundle, so only the public Firebase web config may use one.
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

_Source: building-react-nextjs-uis (repo-onboarder 6.0.0)._
