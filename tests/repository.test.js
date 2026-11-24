import test from "node:test";
import assert from "node:assert/strict";
import { WorkoutRepository, STORAGE_KEY } from "../src/repository.js";

// A fake storage that lives in memory. It has the same getItem/setItem shape as localStorage,
// which is why the repository can be tested without a browser.
class MemoryStorage {
  constructor(initial = {}) { this.data = Object.assign({}, initial); this.writes = 0; }
  getItem(key) { return key in this.data ? this.data[key] : null; }
  setItem(key, value) { this.writes += 1; this.data[key] = String(value); }
}

// A fake storage that cannot save, like a browser with storage turned off or full.
class BrokenStorage {
  getItem() { return null; }
  setItem() { throw new Error("storage is full"); }
}

const ENTRY = { exercise: "Bench Press", sets: 3, reps: 8, weight: 135, date: "2026-11-10" };

function makeRepo(storage) {
  let n = 0;
  return new WorkoutRepository(storage, { now: () => 1000, makeId: () => "id" + (++n) });
}

test("add saves a workout with an id and timestamp, and list returns it", () => {
  const repo = makeRepo(new MemoryStorage());
  const saved = repo.add(ENTRY);
  assert.equal(saved.id, "id1");
  assert.equal(saved.exercise, "Bench Press");
  assert.equal(saved.createdAt, 1000);
  assert.deepEqual(repo.list(), [saved]);
});

test("saved workouts are still there for a new repository on the same storage", () => {
  const storage = new MemoryStorage();
  makeRepo(storage).add(ENTRY);
  assert.equal(new WorkoutRepository(storage).list().length, 1);
});

test("list gives an empty list when nothing is saved", () => {
  assert.deepEqual(makeRepo(new MemoryStorage()).list(), []);
});

test("list gives an empty list when the saved data is corrupted", () => {
  const storage = new MemoryStorage({ [STORAGE_KEY]: "{not json" });
  assert.deepEqual(makeRepo(storage).list(), []);
});

test("list skips saved items that are not valid workouts", () => {
  const good = { id: "a", exercise: "Squat", sets: 4, reps: 5, weight: 185, date: "2026-11-02", createdAt: 1 };
  const storage = new MemoryStorage({ [STORAGE_KEY]: JSON.stringify([good, { id: "b" }, null, 7]) });
  assert.deepEqual(makeRepo(storage).list(), [good]);
});

test("add reports failure with null when storage cannot save", () => {
  const repo = makeRepo(new BrokenStorage());
  assert.equal(repo.add(ENTRY), null);
});
