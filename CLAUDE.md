# WorkoutApp

A personal PWA workout tracker for Ethan and Ava. Mobile-first, hosted on GitHub Pages.

## Stack
- **React + Vite** — frontend
- **GitHub Pages** — hosting
- **Google sheets API** - backend data storage

## Data Model
Flat log structure (mirrors the Excel sheet):
- **sets**: `date, user, exercise, reps, weight_lbs, notes`
- **exercises**: `name, muscle_group_weightings` (chest, back, shoulders, biceps, triceps, quads, hamstrings, glutes, calves, abs, rear_delts, low_back)

## Dev Server
Always start the dev server with `--host` so it's accessible on the LAN (Ava can open it on her phone):
```
npm run dev -- --host
```