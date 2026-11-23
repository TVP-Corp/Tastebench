# Tastebench

## What this is

A mobile-first web app for rating rooms. A creator makes a room with entries and criteria. Friends join with a 6-character code or a link and rate each entry from 0.0 to 10.0 per criterion, with notes. The creator closes the room (preview), can rename entries, then locks the results into a Firestore snapshot. It is a static Vite + React site on GitHub Pages, with Firebase anonymous auth and Firestore as the backend (Spark plan, no server code).

| Module            | Responsibility                                                                                                                                                                |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/domain/`     | Pure logic and types: `score.ts` (tenths 0..100, picker math), `results.ts` (averages, ranks), `progress.ts`, `code.ts` (room codes, ids), `types.ts`. No React, no Firebase. |
| `src/firebase/`   | Data layer: `app.ts` (init, emulator switch), `rooms.ts` (every read and write), `useAuth.ts`, `useRoom.ts`.                                                                  |
| `src/routes/`     | Screens: `Landing`, `CreateRoom`, `RoomGate` (view routing per room status), `JoinName`, `Rate`, `Waiting`, `Results`, `RoomContext`.                                         |
| `src/ui/`         | Shared components: `Screen`, `PillButton`, `ScorePicker`, `ProgressSegments`, `ParticipantList`, `ConfirmDialog`, `ShareCard`, `RankingList`, `EntryDetail`.                  |
| `firestore.rules` | All authorization. The client is untrusted.                                                                                                                                   |
| `tests/emu/`      | Rules and data-layer tests against the emulators. `tests/e2e/` holds the Playwright flow.                                                                                     |

## Local setup

- Node `24.14.0` (`.tool-versions`), pnpm `11.21.0` (`packageManager` in `package.json`), Java 21+ for the Firestore emulator.
- `pnpm install`. Build scripts are off by default; `pnpm-workspace.yaml` `allowBuilds` lists the exceptions.
- `package.json` versions are exact. `saveExact: true` in `pnpm-workspace.yaml` keeps `pnpm add` exact.
- Env vars (`.env.example`): `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_APP_ID`, `VITE_USE_EMULATOR`. Local work needs none of the Firebase values: `VITE_USE_EMULATOR=true` falls back to project `demo-rating-rooms`. Production values are GitHub repository variables.
- Local services: `pnpm emulators` (Auth on 9099, Firestore on 8080).

## Build / test / run

- Run: `pnpm emulators` in one terminal, `VITE_USE_EMULATOR=true pnpm dev` in another.
- Unit tests: `pnpm test` (Vitest, jsdom, `src/**/*.test.ts(x)`).
- Rules and data layer: `pnpm test:emu` (starts the emulators, runs `tests/emu`).
- End to end: `pnpm test:e2e` (Playwright, 3 browser contexts at 390x844). Run `pnpm exec playwright install chromium` once.
- Build: `pnpm build` (`tsc -b && vite build`, output `dist/`).
- Lint: `pnpm lint` (oxlint). It exits 1 on `main` because of `react(refs)` warnings in `src/routes/RoomGate.tsx`.
- Format: `pnpm format` (oxfmt, writes) and `pnpm format:check`; config in `.oxfmtrc.json`.
- Run `pnpm format:check`, `pnpm test` and `pnpm exec tsc -b` before you push. Run `pnpm test:emu` after any change to `firestore.rules` or `src/firebase/rooms.ts`.

## Conventions

- Change only what the task needs. Write the shortest code that a reviewer reads on the first pass. Never hand-type long lists of literal words or patterns. Comment only a reason that the code cannot show.
- Layers depend one way: `routes`/`ui` → `firebase` → `domain`. Keep `domain` free of React and Firebase.
- All Firestore access goes through `src/firebase/rooms.ts`. Writes use field paths (`scores.<entryId>.<criterionId>`) and UI handlers do not await them: they call `.catch(console.error)` so the offline cache keeps the UI responsive. Example: `Rate.tsx` `setScore(...)`.
- Scores are integer tenths `0..100` or `'skip'`. Validate with `isValidScore` (`src/domain/score.ts`). A missing score counts as 0 and stays in the divisor; a skip leaves the divisor.
- Every data change needs a matching rule in `firestore.rules` and tests in `tests/emu/rules.test.ts`. Rules cannot loop, so list checks are unrolled (see `sameIds`, 30-entry cap).
- Use react-aria-components for every interactive control (`Button`, `ToggleButton`, `TextField` with `Label`, `Modal`/`Dialog`). Use `PillButton` (`variant` primary or secondary) for primary actions and `ConfirmDialog` for destructive confirmations.
- Tailwind v4 utility classes inline; touch targets are at least `min-h-11`. Do not override one utility with a conflicting one through `className`; add a variant instead (see `PillButton`).
- Screens read room state from `useRoomContext()`. Navigation inside a room uses absolute paths `/r/<code>/...`.
- Component tests mock `../firebase/rooms` and `../firebase/app` with `vi.mock` and query by role and accessible name.
- An effect must return nothing or a cleanup function. Wrap calls such as `window.scrollTo` in braces.
- The session-lessons hook loads the merged suppression rows at session start. Before you write code, check the **Hard rules** sections of the repo's skills and those rows, and stop and wait for the user's answer before you break a hard rule.

## Database changes

There are no migrations. Firestore is schemaless, and the shape lives in code:

1. Change the type in `src/domain/types.ts`.
2. Change the write and the mapping in `src/firebase/rooms.ts` (`subscribeRoom` / `subscribeParticipants` map fields with defaults, so old documents still load).
3. Change `firestore.rules` (allowed keys with `hasOnly`, status gates) and add allow and deny cases to `tests/emu/rules.test.ts`.
4. Run `pnpm test:emu`.
5. Deploy the rules: the "Deploy Firestore rules" workflow, or `pnpm exec firebase deploy --only firestore:rules --project <project-id>`. `.firebaserc` defaults to `demo-rating-rooms`, so always pass `--project`.

## How to add new code

- Room or participant action (new write): `types.ts` → `rooms.ts` function → `firestore.rules` → `tests/emu/rules.test.ts` → UI caller and its component test that mocks the new function. See the `room-action` skill.
- Screen or component: add the route in `RoomGate.tsx` (room screens) or `App.tsx` (top-level), build it from `Screen`, add a `*.test.tsx` next to it. See the `screen` skill.
- Scoring or ranking logic: change `src/domain/*.ts` with a test first in the matching `*.test.ts`. See the `scoring` skill.

## CI/CD

- `.github/workflows/deploy.yml` runs on push to `main`: `pnpm install --frozen-lockfile`, `pnpm format:check`, `pnpm test`, a check for `VITE_FIREBASE_API_KEY` and `VITE_FIREBASE_PROJECT_ID`, `pnpm build`, then deploys `dist/` to GitHub Pages.
- Reproduce locally with `pnpm test && pnpm build`. `.claude/pre-pr-checks` runs `pnpm format:check`, `pnpm test` and `pnpm exec tsc -b` before a PR.
- Pin third-party actions to a commit SHA (see `pnpm/action-setup`).
- Firestore rules do not deploy with the site. Deploy them after any merge that changes `firestore.rules`.

## Pull requests

- Prefer small PRs: keep one concern per PR. When a change mixes concerns or passes about 400 changed lines, split it and ask the user: "Stacked or regular PRs? Stacked fits when each part builds on the one before it, so they merge in order. Regular fits when the parts are independent, so each can merge alone."
- Before you dispatch `pr-author` to open a PR, ask the user: draft (the default, cheaper on CI) or ready for review. Mark a draft ready with `gh pr ready <number>` when it is ready for review under the team process. A draft saves CI only where the repo's workflows skip drafts.
- The remote is `TVP-Corp/Tastebench`. The `gh-organization-check` guard blocks agent writes to this GitHub org, so the user pushes and opens PRs for this repo.

## Process skills (mandatory)

- **Plan before building.** Use `designing-changes` to explore and refine the approach, `planning-changes` to write the implementation plan, and `parallel-development` to carry an approved plan out. They are required before multi-step or architecture-touching work.
- **Design visually.** When a plan, tech design, or story/task/bug solution describes a flow or an API interaction, invoke `design-diagrams`: mermaid in the design or plan markdown, never in a Jira description.
- **Build with discipline.** Use `testing-first` (tests first), `finding-root-causes` (structured root-causing, not guess-and-check), and `finishing-a-branch` (prove the change works before you call it done).
- **Isolate and parallelize.** In `mandatory` mode, every repo-code change happens in a git worktree, one per stream. Read the mode with `echo "${PRIMARY_WORKTREE_MODE:-mandatory}"`. In `mandatory` mode, use a worktree from the `worktree-manager` agent. In `lease` mode, one stream, or streams that run one after the other, get no worktree: dispatch the subagent into the primary tree, where it first runs `git checkout -b <TICKET>-<slug>` and takes the lease. Use `worktree-manager` only for a stream that runs at the same time as another agent that holds the lease. `worktree-manager` creates each worktree and its tokensave index; remove the worktree once its branch lands. For one new task, put `enter: yes` in the dispatch, then move into the worktree with the `EnterWorktree` tool (`path`). The `env` key `PRIMARY_WORKTREE_MODE` in `.claude/settings.json` sets the mode (`mandatory` here). The gitignored `.claude/settings.local.json` overrides it per developer; `~/.claude/settings.json` applies only when neither repo file sets it. In `lease` mode, the lease is held per clone, in the git common directory; the holder makes its branch with `git checkout -b <TICKET>-<slug>`, and `no-main-write` and `flat-branch-names` still apply. A subagent takes over a lease that its own main session holds, and the main session is then blocked in the primary tree until `SubagentStop` or the 10-minute expiry. Decompose development work and dispatch it across parallel subagents with `parallel-development`, which owns worktree placement under `.claude/worktrees/` on a flat, ticket-prefixed branch, the schedule, the dispatch, the task loop with its review, and the only two cases where serial single-context work is allowed.
- **Review.** Use `requesting-review` before merging and `answering-review` to act on the feedback.
- **Wrap up.** Use `finishing-a-branch` to land a branch cleanly.
- **Author skills.** Use `writing-guidance` (with the `skill-creator` plugin to measure it) when you add a repo skill.
- **Compound.** At the end of a branch, or right after a hard-won fix, invoke `distilling-lessons` to push the durable rule back into the repo skill that produced it, or append it to `docs/lessons/LESSONS.md`. Route delegated work by tier with `model-routing`: default down, and escalate a tier only when the task's difficulty earns it.
- For exact symbol work in JavaScript or TypeScript (all references, implementations, callers, types, hover), use the built-in `LSP` tool. No hook enforces this.
- **Ask with `AskUserQuestion`.** Ask every question to the user with the `AskUserQuestion` tool, never as plain text in a reply.

**Hook-enforced local rules** (this onboarder plugin):

- **plan before a code change.** `plan-before-implement` blocks repo-code edits until a plan signal appears (`ExitPlanMode` or a planning skill).
- **plans outside the repo.** `plans-outside-repo` blocks any `.md`/`.markdown` write
  with a `plans` or `specs` directory segment inside the repo. `node_modules/`, `vendor/` and
  `.git/` are exempt. Plans and specs go outside the repo, in the plans and specs
  directory that the hook names, as `<YYYYMMDD>-<HHMM>_<branch>_<slug>.md`.
- **require plan approval.** `require-plan-approval` blocks implementation edits from the first plan write until a typed reply or dialog answer. Approval lasts for the session.
- **flat branch names.** `flat-branch-names` blocks a branch name with a `/` or without a `no-jira-` or `<JIRA-ID>-` prefix.
- **worktree path.** `worktree-path` blocks a `git worktree add` outside `.claude/worktrees/`.
- **work in a worktree.** `require-worktree` and `require-worktree-git` block primary-tree changes, except branch deletion, the `lease` holder and a default-branch switch while nobody holds it.
- **worktree-manager only.** `require-worktree-manager` blocks a dispatch with `isolation: "worktree"`. Use the `worktree-manager` agent.
- **enter the created worktree.** `enter-pending-worktree` blocks the main session's next edit, Bash command or dispatch one time and tells it to call `EnterWorktree`.
- **agent tier override.** `agent-model-override` asks the user before a dispatch runs with a `model` other than the agent's frontmatter tier.
- **dispatch contract.** `dispatch-contract` blocks a `software-engineer` or `mechanical-refactor` prompt with a fenced function body or a report override.
- **plans without code bodies.** `plan-no-bodies` blocks a plan write that holds a function body.
- **add skills through add-skill.** `add-skill-route` blocks the creation of a `.claude/skills/<name>/` that is not in the hash record, outside `/repo-onboarder:add-skill` and `/repo-onboarder:init`.
- **prefer subagents.** `prefer-subagents` blocks a main-thread repo-code change in an onboarded repo and names the subagent to dispatch.
- **no writes to main/master.** `no-main-write` blocks commits, merges, rebases and resets on `main`/`master`, and pushes to them. Integrate through a PR.
- **pre-PR checks.** `pre-pr-checks` blocks `gh pr create` and `gh pr edit` when `.claude/pre-pr-checks` fails.
- **require pr-author.** `require-pr-author` blocks PR creation and title or body edits outside the `pr-author` agent.
- **pr-author merge policy.** `pr-author-policy` text-matches and blocks direct `gh pr merge`, `gh api` and MCP merges, and asks the user to confirm `pr-squash-merge.sh`.
- **no plain force-push.** `git-push-policy` blocks `git push --force` and `-f`. `--force-with-lease` is allowed.
- **allowed GitHub org only.** `gh-organization-check` blocks a GitHub write aimed at an owner outside `CLAUDE_ALLOWED_GH_ORG`.
- **no cat of large source.** `no-cat-source` blocks a first statement `cat <one file>` of a source file over 300 lines.
- **tokensave first.** Explore through `context_get`, `code_search` and `impact_analyze`. `tokensave-first` blocks `Explore` while `.tokensave/` exists; `tokensave-scope` needs `path_include` under the working subfolder.
- **signed commits.** `require-signed-commits` blocks an unsigned commit and any action that disables signing. Use SSH signing or a cached `gpg-agent`.
- **no AI attribution.** `no-ai-attribution` blocks a commit or PR that carries a Claude co-author trailer or generated-by line.
- **no committed plans.** `no-committed-plans` blocks a commit that stages files under a legacy `docs/superpowers/` path.
- **attribution settings.** The `.claude/settings.json` `attribution` block suppresses Claude Code's commit and PR byline. It is not a hook.
- **model defaults.** The `.claude/settings.json` `model`, `effortLevel` and `advisorModel` keys set the starting tier. They are not hooks.

Every guard degrades to a clean no-op and blocks only on a positive match. If a guard blocks a legitimate call, stop and tell the user. Do not work around it.

The process skills are mandatory directives you must invoke.

_Generated by repo-onboarder plugin version 6.0.0._
