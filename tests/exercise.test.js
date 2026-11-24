import test from "node:test";
import assert from "node:assert/strict";
import { exerciseKey } from "../src/exercise.js";

test("exerciseKey ignores case", () => {
  assert.equal(exerciseKey("Bench Press"), exerciseKey("BENCH press"));
});

test("exerciseKey ignores spaces at the start and end", () => {
  assert.equal(exerciseKey("  Squat "), "squat");
});

test("different exercises have different keys", () => {
  assert.notEqual(exerciseKey("Squat"), exerciseKey("Front Squat"));
});
