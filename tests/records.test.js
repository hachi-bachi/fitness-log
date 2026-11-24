import test from "node:test";
import assert from "node:assert/strict";
import { computeRecords } from "../src/records.js";

function w(exercise, weight, reps, date, createdAt) {
  return { id: exercise + createdAt, exercise, sets: 3, reps, weight, date, createdAt };
}

test("the record for an exercise is its heaviest weight", () => {
  const records = computeRecords([
    w("Bench Press", 135, 8, "2026-11-01", 1),
    w("Bench Press", 155, 5, "2026-11-05", 2),
    w("Bench Press", 115, 10, "2026-11-08", 3)
  ]);
  assert.equal(records.length, 1);
  assert.equal(records[0].weight, 155);
});

test("each exercise gets its own record, sorted by name", () => {
  const records = computeRecords([w("Squat", 185, 5, "2026-11-01", 1), w("Bench Press", 135, 8, "2026-11-02", 2)]);
  assert.deepEqual(records.map((r) => r.exercise), ["Bench Press", "Squat"]);
});

test("names match ignoring case and extra spaces, and show the first spelling used", () => {
  const records = computeRecords([
    w("Bench Press", 135, 8, "2026-11-01", 1),
    w("  bench press ", 155, 5, "2026-11-05", 2)
  ]);
  assert.equal(records.length, 1);
  assert.equal(records[0].exercise, "Bench Press");
  assert.equal(records[0].weight, 155);
});

test("on equal weight, more reps wins, then the earlier date", () => {
  const moreReps = computeRecords([w("Row", 100, 5, "2026-11-01", 1), w("Row", 100, 8, "2026-11-02", 2)]);
  assert.equal(moreReps[0].reps, 8);
  const earlier = computeRecords([w("Row", 100, 5, "2026-11-05", 1), w("Row", 100, 5, "2026-11-02", 2)]);
  assert.equal(earlier[0].date, "2026-11-02");
});

test("no workouts gives no records", () => {
  assert.deepEqual(computeRecords([]), []);
});
