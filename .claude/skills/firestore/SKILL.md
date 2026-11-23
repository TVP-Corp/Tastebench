---
name: firestore
description: "WHEN you read or write Firestore data, change firestore.rules, use the emulators, or deploy rules in Tastebench."
---

# Firestore in Tastebench

Firestore is the only backend. The client is untrusted: `firestore.rules` is the whole authorization model.

## Data model

- `rooms/{code}`: `name`, `creatorUid`, `status` (`open` | `preview` | `locked`), `entries[{id,title}]` (1..30), `criteria[{id,title}]` (1+), `results` (null until lock), `createdAt`, `closedAt`, `lockedAt`.
- `rooms/{code}/participants/{uid}`: `name` (1..30 chars), `scores{entryId:{criterionId: number|'skip'}}` (integer tenths 0..100), `notes{entryId:string}`, `joinedAt`, `updatedAt`.
- Types live in `src/domain/types.ts`. The mapping from snapshot to type lives in `subscribeRoom` and `subscribeParticipants` in `src/firebase/rooms.ts`, with defaults for missing maps.

## Client setup (`src/firebase/app.ts`)

- `initializeFirestore` with `persistentLocalCache` and `persistentMultipleTabManager`, or `memoryLocalCache` when `indexedDB` is missing (tests, node).
- `VITE_USE_EMULATOR=true` connects Auth to `127.0.0.1:9099` and Firestore to `127.0.0.1:8080`, and falls back to project `demo-rating-rooms`.
- Sign-in is anonymous, once per page, through the module-level promise in `src/firebase/useAuth.ts`.

## Writes

- Every write is a function in `src/firebase/rooms.ts`. Do not call the Firestore SDK from `routes/` or `ui/`.
- Use field-path updates (`[`scores.${entryId}.${criterionId}`]`) so two phones never overwrite each other's maps.
- UI handlers do not await writes. They call `fn(...).catch((e) => console.error(...))`. The offline cache applies the write locally at once.
- Multi-document changes use `writeBatch` (see `discardRoom` once PR #1 merges) or `runTransaction` (`createRoom` retries 5 random codes).

## Rules (`firestore.rules`)

- Read: any signed-in user.
- Room create: `creatorUid == request.auth.uid`, `status == 'open'`, `results == null`, entry and criteria counts.
- Room update: only the creator, one branch per transition, each with `changed().hasOnly([...])`. Lock also needs `hasAll` and non-null `results`.
- Participant create: doc id is the caller's uid, room `open`. Update: own doc, only `scores`, `notes`, `updatedAt`, room `open` or `preview`. Delete: own doc or creator, never the creator's own doc, room not `locked`.
- Rules cannot loop. List checks are unrolled to index 29 (`sameId(0)`..`sameId(29)`), which is why entries cap at 30.
- `get()` inside a batch sees the state before the batch; `getAfter()`/`existsAfter()` see the state after it.

## Emulators and tests

- `pnpm emulators` starts Auth and Firestore with `--project demo-rating-rooms`. Java 21+ is required.
- `pnpm test:emu` runs `tests/emu/*.test.ts` through `firebase emulators:exec` with `vitest.emu.config.ts` (node, `fileParallelism: false`).
- `tests/emu/rules.test.ts` uses `@firebase/rules-unit-testing`: `seed(status)`, `as(uid)`, `assertSucceeds` and `assertFails`. Add one allow case and at least one deny case for every rule branch you add.

## Deploy rules

- The rules do not deploy with the site.
- Run `pnpm exec firebase deploy --only firestore:rules --project <project-id>`. `.firebaserc` defaults to `demo-rating-rooms`, so always pass `--project`.
- In CI, the "Deploy Firestore rules" workflow (PR #1) reads the project from `vars.VITE_FIREBASE_PROJECT_ID` and the key from the `FIREBASE_SERVICE_ACCOUNT` secret.

## Gotchas

- A write that the rules reject after lock fails silently on purpose: the caller only logs it.
- Deleting a room does not delete its `participants` subcollection. Delete participant docs in the same batch.
- `room(code)` in the participant rules is a `get()`; it errors when the room is missing, which denies the request.

## Hard rules

- **SEC-HARDCODED-SECRET**: Do not commit a real credential, token, or private key in source or config. Instead, read it from the environment or a secret store at runtime: `VITE_FIREBASE_*` repository variables for the web config, a GitHub secret for a service account key.
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

_Generated by repo-onboarder 6.0.0._
