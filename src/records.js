// Pure function that works out the personal record for each exercise.

import { exerciseKey } from "./exercise.js";

// ----- Personal records -----

// A record is the heaviest weight logged for an exercise. Exercise names are matched
// ignoring case and extra spaces, and shown with the first spelling used. Ties go to more reps, then the earlier date.
export function computeRecords(list) {
  const best = {};
  const names = {};
  list.forEach(function (w) {
    const key = exerciseKey(w.exercise);
    const added = w.createdAt || 0;
    // Show the spelling used the first time the exercise was logged.
    if (!names[key] || added < names[key].added) {
      names[key] = { name: w.exercise.trim(), added: added };
    }
    const current = best[key];
    const beats = !current ||
      w.weight > current.weight ||
      (w.weight === current.weight && w.reps > current.reps) ||
      (w.weight === current.weight && w.reps === current.reps && w.date < current.date);
    if (beats) best[key] = w;
  });
  return Object.keys(best).sort().map(function (key) {
    return { exercise: names[key].name, weight: best[key].weight, reps: best[key].reps, date: best[key].date };
  });
}
