import test from "node:test";
import assert from "node:assert/strict";
import { workoutToForm } from "../src/editing.js";
import { validateWorkout } from "../src/validation.js";

const SAVED = { id: "a", exercise: "Bench Press", sets: 3, reps: 8, weight: 135.5, date: "2026-11-10", createdAt: 5 };

test("workoutToForm gives text values for every form field", () => {
  assert.deepEqual(workoutToForm(SAVED), {
    exercise: "Bench Press", sets: "3", reps: "8", weight: "135.5", date: "2026-11-10"
  });
});

test("a weight of 0 is shown as 0, not left blank", () => {
  assert.equal(workoutToForm(Object.assign({}, SAVED, { weight: 0 })).weight, "0");
});

test("a saved workout survives a round trip through the form and validation", () => {
  const result = validateWorkout(workoutToForm(SAVED), "2026-11-13");
  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.entry, {
    exercise: "Bench Press", sets: 3, reps: 8, weight: 135.5, date: "2026-11-10"
  });
});
