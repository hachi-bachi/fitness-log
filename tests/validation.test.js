import test from "node:test";
import assert from "node:assert/strict";
import { validateWorkout } from "../src/validation.js";

const TODAY = "2026-11-13";

function raw(overrides) {
  return Object.assign(
    { exercise: "Bench Press", sets: "3", reps: "8", weight: "135", date: "2026-11-10" },
    overrides
  );
}

function fieldsWithErrors(overrides) {
  return validateWorkout(raw(overrides), TODAY).errors.map((e) => e.field);
}

test("a valid entry is accepted and converted to numbers", () => {
  const result = validateWorkout(raw({ exercise: "  Bench Press  " }), TODAY);
  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.entry, {
    exercise: "Bench Press", sets: 3, reps: 8, weight: 135, date: "2026-11-10"
  });
});

test("an empty or whitespace-only exercise name is rejected", () => {
  assert.deepEqual(fieldsWithErrors({ exercise: "" }), ["exercise"]);
  assert.deepEqual(fieldsWithErrors({ exercise: "   " }), ["exercise"]);
});

test("an exercise name over 50 characters is rejected, 50 is allowed", () => {
  assert.deepEqual(fieldsWithErrors({ exercise: "x".repeat(51) }), ["exercise"]);
  assert.deepEqual(fieldsWithErrors({ exercise: "x".repeat(50) }), []);
});

test("sets must be a whole number from 1 to 99", () => {
  assert.deepEqual(fieldsWithErrors({ sets: "0" }), ["sets"]);
  assert.deepEqual(fieldsWithErrors({ sets: "100" }), ["sets"]);
  assert.deepEqual(fieldsWithErrors({ sets: "2.5" }), ["sets"]);
  assert.deepEqual(fieldsWithErrors({ sets: "99" }), []);
});

test("reps must be a whole number from 1 to 999", () => {
  assert.deepEqual(fieldsWithErrors({ reps: "0" }), ["reps"]);
  assert.deepEqual(fieldsWithErrors({ reps: "2.5" }), ["reps"]);
  assert.deepEqual(fieldsWithErrors({ reps: "1000" }), ["reps"]);
});

test("weight allows 0 and two decimals, but not negatives, text, or over 2000", () => {
  assert.deepEqual(fieldsWithErrors({ weight: "0" }), []);
  assert.deepEqual(fieldsWithErrors({ weight: "42.25" }), []);
  assert.deepEqual(fieldsWithErrors({ weight: "-5" }), ["weight"]);
  assert.deepEqual(fieldsWithErrors({ weight: "heavy" }), ["weight"]);
  assert.deepEqual(fieldsWithErrors({ weight: "42.255" }), ["weight"]);
  assert.deepEqual(fieldsWithErrors({ weight: "2000.01" }), ["weight"]);
});

test("a missing, impossible, or future date is rejected", () => {
  assert.deepEqual(fieldsWithErrors({ date: "" }), ["date"]);
  assert.deepEqual(fieldsWithErrors({ date: "2026-02-30" }), ["date"]);
  assert.deepEqual(fieldsWithErrors({ date: "2026-11-14" }), ["date"]);
  assert.deepEqual(fieldsWithErrors({ date: TODAY }), []);
});

test("a completely empty form reports one error per field and no entry", () => {
  const result = validateWorkout(
    { exercise: "", sets: "", reps: "", weight: "", date: "" }, TODAY
  );
  assert.equal(result.errors.length, 5);
  assert.equal(result.entry, null);
});
