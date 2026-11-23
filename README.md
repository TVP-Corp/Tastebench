# Rating rooms

A small web app for rating things with friends. It runs on a phone.

One person creates a room with a list of entries and a list of criteria. Friends join with a six-character code or a link. Each person rates every entry on every criterion from 0 to 10, with one decimal. The creator closes the room to see a preview of the ranking. The creator can rename entries. Then the creator locks the results.

The app is a static site. It uses Firebase (anonymous sign-in and Firestore) as its backend. It is hosted on GitHub Pages.

## Local work

Install the packages:

```
pnpm install
```

Start the Firebase emulators in one terminal:

```
pnpm emulators
```

Start the app against the emulators in a second terminal:

```
VITE_USE_EMULATOR=true pnpm dev
```

## Tests

- `pnpm test` runs the unit tests.
- `pnpm test:emu` runs the Firestore rules tests with the emulators.
- `pnpm test:e2e` runs a browser test with three people. It starts the emulators and the app. Run `pnpm exec playwright install chromium` once before it.

## Firebase setup

You need a Google account. Do these steps once.

1. Create a Firebase project on the Spark plan. Do not add billing.
2. Create a Firestore database.
3. Turn on anonymous sign-in in Authentication.
4. Add `<user>.github.io` to the authorized domains in Authentication.
5. Copy the web config into GitHub repository variables `VITE_FIREBASE_*`. Under Settings, Secrets and variables, Actions, Variables, add:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
6. Deploy `firestore.rules`. A merge to `main` that changes the rules deploys them. You can also run the "Deploy Firestore rules" workflow, or run `pnpm exec firebase deploy --only firestore:rules --project <project-id>` from a laptop.

## GitHub Actions

| Workflow | File | Trigger | What it does |
|---|---|---|---|
| build | `build.yml` | pull request to `main`, push to `main` | Runs the unit tests. |
| Emulator tests | `emulator-tests.yml` | manual | Runs `pnpm test:emu` with the Firebase emulators. |
| Deploy Firestore rules | `deploy-rules.yml` | push to `main` that changes the rules, manual | Deploys `firestore.rules` to the project in `VITE_FIREBASE_PROJECT_ID`. |
| Deploy to GitHub Pages | `deploy.yml` | push to `main` | Runs the unit tests, builds the site and deploys it. |

To start a manual workflow, open the Actions tab, select the workflow and click "Run workflow". You can also run `gh workflow run deploy-rules.yml`.

To block a merge until the unit tests pass, add a branch rule for `main` that requires the `unit-tests` status check.

### Service account for the rules deploy

The "Deploy Firestore rules" workflow needs the secret `FIREBASE_SERVICE_ACCOUNT`.

1. In the Google Cloud console for the Firebase project, open IAM and admin, then Service accounts.
2. Create a service account with the roles "Firebase Rules Admin", "Service Usage Consumer" and "Cloud Datastore Viewer".
3. Create a JSON key for the service account.
4. In GitHub, open Settings, Secrets and variables, Actions, Secrets. Add the secret `FIREBASE_SERVICE_ACCOUNT` with the full JSON key as its value.
5. Delete the local copy of the key file.

## GitHub Pages setup

1. Open the repository Settings, then Pages.
2. Set the source to "GitHub Actions".
3. Push to `main`. The workflow in `.github/workflows/deploy.yml` runs the tests, builds the site and deploys it.
