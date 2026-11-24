import test from "node:test";
import assert from "node:assert/strict";
import { sortedWorkouts } from "../src/history.js";

function w(id, date, createdAt) {
  return { id, exercise: "X", sets: 1, reps: 1, weight: 1, date, createdAt };
}

test("workouts are sorted newest date first regardless of the order added", () => {
  const sorted = sortedWorkouts([w("a", "2026-11-01", 1), w("b", "2026-11-09", 2), w("c", "2026-11-05", 3)]);
  assert.deepEqual(sorted.map((x) => x.id), ["b", "c", "a"]);
});

test("workouts on the same date show the most recently added first", () => {
  const sorted = sortedWorkouts([w("a", "2026-11-05", 100), w("b", "2026-11-05", 300), w("c", "2026-11-05", 200)]);
  assert.deepEqual(sorted.map((x) => x.id), ["b", "c", "a"]);
});

test("sorting does not change the list that was passed in", () => {
  const input = [w("a", "2026-11-01", 1), w("b", "2026-11-09", 2)];
  sortedWorkouts(input);
  assert.deepEqual(input.map((x) => x.id), ["a", "b"]);
});

test("an empty list gives an empty list", () => {
  assert.deepEqual(sortedWorkouts([]), []);
});
