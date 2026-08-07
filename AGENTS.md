# Galatea

Static, dependency-free PWA. No build step, no package manager, no test runner. Each page is a
single self-contained HTML file with inline CSS and inline JS.

- `index.html` — home
- `gym/index.html` — 12-week gym planner (the largest page; all state in `localStorage`)
- `style/index.html` — style cheatsheet
- `assets/site.css`, `assets/pwa.js` — shared by the home and style pages only; `gym/` is self-contained
- `sw.js` — service worker, app-shell cache

## Serving locally

The manifest and service worker use absolute `/galatea/...` paths because the site deploys to a
subpath. Serve the **parent** directory so paths match production:

```
cd ..  &&  python3 -m http.server 8765
# then open http://localhost:8765/galatea/gym/
```

Serving `galatea/` itself as the web root makes `/galatea/icons/*` 404.

## Deploying

**Bump `CACHE_NAME` in `sw.js`** (`galatea-shell-vN` → `vN+1`) whenever a cached file changes.
Without it the installed PWA keeps serving the old HTML and the in-app update banner never fires.

## Gym app notes

- State lives in `localStorage` under `twelveWeekGymPlanV1`; `defaultData()` defines the shape.
  Never rename or delete keys — users restore JSON backups exported from older versions, and
  `restoreData` merges them over `defaultData()`. Prefer ignoring stale keys over migrating.
- `renderWorkout()` replaces `#workout-content` via `innerHTML`. Do **not** call it from an `input`
  or `change` handler on the set inputs: it destroys the `<details>` elements mid-interaction, so
  the exercise box collapses and the user's tap is swallowed. Update the affected node directly
  instead (see `refreshExerciseSuggestion`). Open/closed state is tracked in the `openExercises`
  set so the re-renders that *are* necessary preserve it.
- Per-exercise rest presets are derived from each exercise's `rest` string by `restPresets()`
  (`"2–3 min"` → `[120, 180]`). Keep `rest` in the form `"<n>[–<n>] (min|sec)"`.
- Supersets are declared with a `superset` group key on each member, **not** described in `cue`
  prose. `groupExercises()` only pairs members that are **adjacent** in the workout's `exercises`
  array, so keep partners next to each other — inserting an exercise between them silently breaks
  the pair. A group of one (e.g. when short mode filters a partner out) renders as a normal
  exercise. Members share one "Rest after both" control and have no individual rest buttons.
- When dropping an exercise from a workout, move it into `archivedPerformanceExercises` with the
  same `id` and its original `workoutId` instead of deleting it. Logged sets are keyed by
  `week:workoutId` + exercise `id`, so an outright delete strands that history; archived entries
  appear in the Progress dropdowns only when they actually have logged sets.
- The app reloads itself on service-worker `controllerchange`. In browser automation this destroys
  the execution context a few seconds after load; block `sw.js` via request interception when
  writing tests.

## Verifying

Browser-based only. Worth checking after any gym-app change: enter a weight then tap straight into
reps (box must stay open), switch plan weeks, tick a session complete, and restore an old JSON
backup.
