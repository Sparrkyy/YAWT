# WorkoutApp (YAWT)

A personal PWA workout tracker for Ethan and Ava. Mobile-first, hosted on GitHub Pages at `/YAWT/`.

## Stack
- **React 19 + Vite 5** — frontend
- **GitHub Pages** — hosting (`base: '/YAWT/'` in vite.config.js)
- **Google Sheets API v4** — backend (no server; all reads/writes go directly from the browser)
- **Google Identity Services (GIS)** — OAuth2 token flow for auth
- **Vitest + Testing Library** — unit and component tests
- **Husky** — git hooks (pre-push runs `npm test`)

## Dev Server
Always start with `--host` so Ava can open it on her phone over LAN:
```
npm run dev -- --host
```

## Environment Variables
Required in `.env.local` (never committed):
```
VITE_GOOGLE_CLIENT_ID=   # OAuth 2.0 client ID from Google Cloud Console
VITE_SHEET_ID=           # The ID from the Google Sheet URL
```
Both are also injected as GitHub Actions secrets at build time.

## Data Model

### Set object (JS)
```js
{
  id: string,         // UUID (crypto.randomUUID or timestamp fallback)
  date: string,       // 'YYYY-MM-DD' e.g. '2026-02-19'
  user: string,       // 'Ethan' or 'Ava'
  exercise: string,   // exercise name (must match an exercise in the Exercises tab)
  reps: number|null,  // null when not tracked (bodyweight holds, cardio, etc.)
  weight: number,     // lbs
  notes: string,      // optional, empty string when absent
  createdAt: string,  // ISO timestamp e.g. '2026-02-19T10:00:00.000Z'
}
```

### Exercise object (JS)
```js
{
  name: string,
  muscles: {          // all keys are camelCase, values are weightings 0–2
    chest, back, shoulders, biceps, triceps,
    quads, hamstrings, glutes, calves, tibialis,
    abs, rearDelts, lowBack
  }
}
```
Muscle keys are **camelCase** in JS (`rearDelts`, `lowBack`) but stored as JSON in the sheet.

## Google Sheets Backend (`src/data/sheetsApi.js`)

### Sheet structure
| Tab | Range | Columns |
|---|---|---|
| Sets | `Sets!A:H` | A=id, B=date, C=user, D=exercise, E=reps, F=weight, G=notes, H=createdAt |
| Exercises | `Exercises!A:B` | A=name, B=muscles (JSON string) |

Row 1 of each tab is a header row (skipped on read). `SETS_GID = 0` is the numeric sheet ID used for `deleteDimension` batch requests.

### Auth
`src/data/auth.js` wraps GIS. On sign-in, `tokenClient.requestAccessToken()` pops the Google consent screen. The resulting token is stored in a module-level variable and attached as `Authorization: Bearer <token>` to every Sheets API request. Scope: `https://www.googleapis.com/auth/spreadsheets`.

## Architecture

```
src/
├── App.jsx                  # Root: auth state, tab nav, sets/exercises data, activeUser
├── views/
│   ├── LogView.jsx          # Log new sets; shows today's sets with swipe-to-delete
│   ├── HistoryView.jsx      # All sets grouped by date, newest first
│   ├── ExercisesView.jsx    # Exercise library; opens ExerciseEditSheet modal
│   ├── ExerciseEditSheet.jsx# Muscle weighting steppers (0–2 in 0.25 steps)
│   ├── StatsView.jsx        # Muscle volume heatmap by period (week/month/year)
│   └── BodyDiagram.jsx      # SVG front/back body with color-scaled muscle regions
├── components/
│   ├── SwipeableRow.jsx     # Touch swipe-to-delete with axis locking
│   └── ConfirmDialog.jsx    # "Delete set?" confirmation modal
└── data/
    ├── sheetsApi.js         # All Google Sheets CRUD (getSets, addSet, deleteSet, etc.)
    ├── auth.js              # GIS OAuth2 token flow
    ├── statsUtils.js        # Pure: getDateRange(period), computeStats(sets, exercises, period, user)
    ├── logUtils.js          # Pure: getBestSet(sets, exercise, user), getLastSet(sets, exercise, user)
    ├── grouping.js          # Pure: groupExercises(exercises) → [{label, exercises}]
    └── exercises.js         # Static seed data + MUSCLE_GROUPS array
```

## Testing

### Run tests
```
npm test           # single pass (also used by pre-push hook and CI)
npm run test:watch # re-runs on file save during development
```

### Test files (`src/__tests__/`)
| File | Tests | What's covered |
|---|---|---|
| `statsUtils.test.js` | 8 | `computeStats` — period filtering, user filter, add/delete effects |
| `grouping.test.js` | 7 | `groupExercises` — section assignment, alphabetical sort, edge cases |
| `logUtils.test.js` | 8 | `getBestSet` / `getLastSet` — weight ranking, null reps, user/exercise filters |
| `sheetsApi.serialization.test.js` | 5 | `rowToSet`/`setToRow`/`rowToExercise`/`exerciseToRow` roundtrips |
| `StatsView.test.jsx` | 3 | Renders empty state, muscle rows, period switching |
| `HistoryView.test.jsx` | 3 | Renders empty state, date grouping, newest-first order |
| `ConfirmDialog.test.jsx` | 9 | Default/custom props, confirm/cancel/close/backdrop interactions |
| `SettingsView.test.jsx` | 7 | Dialog open/close, createNewSheet success/failure, loading state, ID truncation |
| `SetupView.test.jsx` | 13 | Sheet/users phase rendering, create/link success and failure paths, user list management |
| `App.test.jsx` | 5 | Sign-in screen, onboarding phase transitions driven by localStorage state |

**Total: 68 tests.** All tests use `vi.setSystemTime('2026-02-19')` as the anchor date. No test ever hits the real Sheets API — serialization helpers are pure functions, and network-dependent code is not tested.

### What is intentionally not tested
- `sheetsApi.js` network calls — require real credentials
- Auth flow (`auth.js`) — out of scope
- `BodyDiagram` SVG rendering — mocked in component tests
- `SwipeableRow` touch physics — jsdom has no touch geometry

### Test policy for new features
Any new component or view feature must ship with at least basic test coverage.
When in doubt: add a test file alongside the implementation before marking the work done.

## Deployment (GitHub Actions)
On push to `main`: install → **test** → build (with Sheets secrets injected) → deploy to GitHub Pages. Push is blocked if tests fail (both locally via Husky pre-push and in CI).
