# React frontend security for Tastebench

This file adapts the React and general web frontend security references of the `applying-security-best-practices` source to a Vite + React 19 + Firebase app with no server of its own. Rule ids match the source, so you can look up the full text there.

## Applies here

| Rule | What it means in Tastebench | Where to check |
|---|---|---|
| REACT-CONFIG-001 | Every `VITE_` variable is in the public bundle. Only the Firebase web config may use one. | `src/firebase/app.ts`, `.env.example`, `deploy.yml` |
| REACT-XSS-001 | Never pass user text (room, entry, criterion, participant names, notes) to `dangerouslySetInnerHTML`. | `git grep dangerouslySetInnerHTML src` must stay empty |
| REACT-XSS-002 | Render user text as JSX children or attributes. React escapes them. | `RankingList`, `EntryDetail`, `ParticipantList` |
| REACT-DOM-001 | Do not write user text through `innerHTML`, `outerHTML`, `insertAdjacentHTML` or `document.write`. | `src/` |
| REACT-URL-001 | Build share links only from the room code after `normalizeCode` and `isValidCode`. Never put user text in `href`. | `ShareCard.tsx`, `RoomGate.tsx` |
| REACT-REDIRECT-001 | Navigate only to app paths (`/r/<code>/...`). Do not navigate to a URL taken from data. | `navigate(...)` calls |
| REACT-AUTHZ-001 | Hiding a button is not access control. Every gate that `isCreator` or `room.status` drives in the UI needs the same check in `firestore.rules`. | `firestore.rules`, `tests/emu/rules.test.ts` |
| REACT-AUTH-001 | Firebase stores the anonymous session in IndexedDB. Do not copy tokens into `localStorage` or into logs. | `useAuth.ts` |
| REACT-SRI-001, REACT-3P-001 | Load no third-party scripts or styles from a CDN. Everything comes through the Vite build. | `index.html` |
| REACT-SUPPLY-001 | Commit `pnpm-lock.yaml`, install with `--frozen-lockfile`, keep dependency build scripts off (`pnpm-workspace.yaml` `allowBuilds`), pin third-party actions to a SHA. | `package.json`, workflows |

## Does not apply

- REACT-CSRF-001: there are no cookie-authenticated requests. Firestore calls carry a Firebase ID token.
- REACT-SW-001: there is no service worker.
- REACT-POSTMSG-001, REACT-FILE-001: no `postMessage` and no file uploads.
- REACT-MARKUP-001: notes render as plain text, not Markdown. If Markdown is added, configure the renderer to drop raw HTML.

## Partial: headers and CSP

GitHub Pages cannot set response headers. REACT-CSP-001, REACT-HEADERS-001 and REACT-TT-001 can only use a `<meta http-equiv="Content-Security-Policy">` tag in `index.html`. A policy must allow `connect-src` to `*.googleapis.com` and the Firebase auth domain. Test it on the deployed site before you merge.

## Review checklist for a change

1. Does user text reach any HTML sink, URL or navigation target?
2. Does every new write have a rule with `hasOnly` and a status gate, and a deny test?
3. Does a new environment variable hold anything other than public config?
4. Does a new dependency or action come pinned and reviewed?
