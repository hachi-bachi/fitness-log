import test from "node:test";
import assert from "node:assert/strict";
import { sortedWorkouts, exerciseOptions, filterByExercise, resolveFilter } from "../src/history.js";

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

function named(id, exercise, createdAt) {
  return { id, exercise, sets: 1, reps: 1, weight: 1, date: "2026-11-01", createdAt };
}

test("exerciseOptions lists each exercise once, sorted, using the first spelling", () => {
  const options = exerciseOptions([
    named("a", "Squat", 1), named("b", "Bench Press", 2), named("c", "  bench press ", 3)
  ]);
  assert.deepEqual(options, [
    { key: "bench press", label: "Bench Press" },
    { key: "squat", label: "Squat" }
  ]);
});

test("exerciseOptions gives an empty list when there are no workouts", () => {
  assert.deepEqual(exerciseOptions([]), []);
});

test("filterByExercise keeps only that exercise, ignoring case and spaces", () => {
  const list = [named("a", "Squat", 1), named("b", "Bench Press", 2), named("c", " BENCH PRESS", 3)];
  assert.deepEqual(filterByExercise(list, "bench press").map((w) => w.id), ["b", "c"]);
});

test("filterByExercise with an empty key returns every workout", () => {
  const list = [named("a", "Squat", 1), named("b", "Bench Press", 2)];
  assert.deepEqual(filterByExercise(list, "").map((w) => w.id), ["a", "b"]);
});

test("filterByExercise gives an empty list for an exercise with no workouts", () => {
  assert.deepEqual(filterByExercise([named("a", "Squat", 1)], "deadlift"), []);
});

test("filterByExercise does not change the list it is given", () => {
  const list = [named("a", "Squat", 1), named("b", "Bench Press", 2)];
  filterByExercise(list, "squat");
  assert.equal(list.length, 2);
});

test("filtering then sorting still shows the newest date first", () => {
  const a = Object.assign(named("a", "Squat", 1), { date: "2026-11-01" });
  const b = Object.assign(named("b", "Squat", 2), { date: "2026-11-09" });
  const c = Object.assign(named("c", "Bench Press", 3), { date: "2026-11-12" });
  const shown = sortedWorkouts(filterByExercise([a, b, c], "squat"));
  assert.deepEqual(shown.map((w) => w.id), ["b", "a"]);
});

test("resolveFilter keeps a filter that still has workouts", () => {
  assert.equal(resolveFilter("squat", [named("a", "Squat", 1)]), "squat");
});

test("resolveFilter falls back to all exercises when the exercise is gone", () => {
  assert.equal(resolveFilter("squat", [named("a", "Bench Press", 1)]), "");
  assert.equal(resolveFilter("squat", []), "");
});

test("resolveFilter keeps 'all exercises' as all exercises", () => {
  assert.equal(resolveFilter("", [named("a", "Squat", 1)]), "");
});
