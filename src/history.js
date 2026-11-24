// Pure functions for ordering and filtering the workout history.

import { exerciseKey } from "./exercise.js";

// Newest date first. Entries on the same date show the most recently added first.
export function sortedWorkouts(list) {
  return list.slice().sort(function (a, b) {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1;
    return (b.createdAt || 0) - (a.createdAt || 0);
  });
}

// The choices for the "filter by exercise" list: one per exercise, ignoring case and extra
// spaces, labelled with the first spelling used and sorted by label.
// Returns a list of { key, label }.
export function exerciseOptions(list) {
  const seen = {};
  list.forEach(function (w) {
    const key = exerciseKey(w.exercise);
    const added = w.createdAt || 0;
    if (!seen[key] || added < seen[key].added) {
      seen[key] = { key: key, label: w.exercise.trim(), added: added };
    }
  });
  return Object.keys(seen).map(function (key) {
    return { key: key, label: seen[key].label };
  }).sort(function (a, b) {
    return a.label.localeCompare(b.label);
  });
}

// Keeps only the workouts for one exercise. An empty key means "all exercises".
// Returns a new list and never changes the one passed in.
export function filterByExercise(list, key) {
  if (!key) return list.slice();
  return list.filter(function (w) { return exerciseKey(w.exercise) === key; });
}

// Gives back the chosen filter if that exercise still has workouts, otherwise "" (all exercises).
// This keeps the filter from pointing at an exercise that was deleted or renamed.
export function resolveFilter(key, list) {
  if (!key) return "";
  return list.some(function (w) { return exerciseKey(w.exercise) === key; }) ? key : "";
}
