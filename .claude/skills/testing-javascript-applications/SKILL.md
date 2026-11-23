---
name: testing-javascript-applications
description: "WHEN you add or review unit, component, emulator or end-to-end tests in Tastebench, or decide which kind of test a change needs."
---

# Testing JavaScript applications in Tastebench

Tests must be fast, focused, and meaningful. Commands and file layout are in the `test` skill.

## Which test for which change

- **Unit (Vitest, `src/domain/*.test.ts`)**: pure functions such as `computeResults`, `pickWhole`, `firstIncompleteIndex`.
- **Component (Vitest + Testing Library, `*.test.tsx`)**: user-visible behavior and state transitions, with the data layer mocked.
- **Emulator (`tests/emu`)**: Firestore rules and the real data functions.
- **End to end (`tests/e2e/flow.spec.ts`)**: the one critical multi-user flow. Do not add a branch there that a component test can cover.

## Assertions

- Query by role and accessible name (`getByRole('button', { name: 'Previous' })`). Avoid class names and DOM shape.
- `data-testid` is a last resort. The repo uses it only for `score-value` and `ranking-row`.
- Assert outcomes: the text on screen, the mocked function called with the right arguments, the heading after navigation.
- Cover success, empty, error and boundary states (for example 10 allows only `.0`; divisor 0 gives `-`).

## Mocks and data

- Mock external edges only: `../firebase/rooms`, `../firebase/app`, `useRoom`, `useAuth`, browser APIs that jsdom lacks. Never mock the function under test.
- A mock must behave like the real edge where it matters: `window.scrollTo` returns a Promise in Chrome, so the mock does too.
- Reuse `src/test/fixture.ts` and small local factories (`mk`, `room(status)`).
- Use `vi.hoisted` when a mock object must exist before `vi.mock` runs (see `Results.test.tsx`).

## Vitest notes

- `vitest.config.ts` sets `globals: true`, jsdom and `src/test/setup.ts` (`@testing-library/jest-dom/vitest`).
- `vitest.emu.config.ts` runs in node with `fileParallelism: false`, because the emulator state is shared.
- `vi.clearAllMocks()` in `beforeEach` resets call counts between cases.
- For deeper Vitest guidance, use the `external-vitest` bucket that this skill absorbs: fake timers, `vi.spyOn`, concurrent tests, coverage.

## Verification

- Run the smallest suite first, then the full `pnpm test`.
- Prove that a new test fails without the fix (for example by stashing the fix).
- Say which suites you did not run and why.

_Source: testing-javascript-applications (repo-onboarder 6.0.0)._
