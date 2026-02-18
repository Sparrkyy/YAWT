# WorkoutApp

A personal PWA workout tracker for Ethan and Ava. Mobile-first, hosted on GitHub Pages.

## Stack
- **React + Vite** — frontend
- **Supabase** — persistence (not yet integrated, using local state for now)
- **GitHub Pages** — hosting

## Data Model
Flat log structure (mirrors the Excel sheet):
- **sets**: `date, user, exercise, reps, weight_lbs, notes`
- **exercises**: `name, muscle_group_weightings` (chest, back, shoulders, biceps, triceps, quads, hamstrings, glutes, calves, abs, rear_delts, low_back)

## Users
No auth for now. Users select their name (Ethan / Ava) when logging.

## Status
- [ ] UI scaffold
- [ ] Local state / mock data
- [ ] Supabase integration
- [ ] PWA manifest (add to home screen)
- [ ] GitHub Pages deploy
