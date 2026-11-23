---
name: developing-javascript-applications
description: "WHEN you change TypeScript structure, module boundaries, state or data flow, or repo conventions in Tastebench beyond one component."
---

# Developing JavaScript applications in Tastebench

Tastebench is one TypeScript app with three modules: `src/domain`, `src/firebase`, and `src/routes` + `src/ui`. Treat each as one module.

## Default workflow

1. Touch at most two modules per iteration unless the task needs more. A new Firestore action is the usual exception (see `room-action`).
2. Keep code, tests and styles next to the feature: a component and its `*.test.tsx` sit in the same folder.
3. Do not change dependencies, `pnpm-lock.yaml`, `.oxlintrc.json`, `tsconfig*.json`, `vite.config.ts` or `.github/workflows/` unless the task needs it.
4. Match the existing style: two-space indent, single quotes, no semicolons in most `src/routes` and `src/firebase` files (`src/domain` and `src/ui` use semicolons). Follow the file you edit.

## Structure and boundaries

- Dependencies go `routes`/`ui` → `firebase` → `domain`. See `domain-layer`, `data-layer`, `presentation-layer`.
- Reuse what exists before you add a library: react-aria-components for controls, Tailwind for styles, `useDebounced` for debouncing, `ConfirmDialog` for confirmations.
- Keep refactors in proportion to the task. Prefer the smallest diff that a reviewer reads in one pass.

## State and data

- Remote state comes only from Firestore subscriptions in `useRoom`, shared through `RoomContext`. Do not copy it into local state; derive from it.
- Local UI state (`sheet`, `editId`, `draft`, `locking`) stays in the component that uses it.
- Handle loading (`room` undefined), not found, error and empty states on purpose. `RoomGate` shows each one.
- Add memoization only for a measured problem. `useMemo` in `Results.tsx` guards `computeResults`.

## TypeScript

- `tsconfig.app.json` sets `noUnusedLocals` and `noUnusedParameters`. Run `pnpm exec tsc -b`.
- No `any` in new code. Use `unknown` at boundaries and narrow (see `isValidScore(v: unknown): v is Score`).
- Prefer union literals (`'open' | 'preview' | 'locked'`), discriminated results and `as const` over casts. A cast such as `as Set<Key>` needs a reason the types cannot express.

_Source: developing-javascript-applications (repo-onboarder 6.0.0)._
