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

test("remove deletes only the workout with that id and saves the change", () => {
  const repo = makeRepo(new MemoryStorage());
  const first = repo.add(ENTRY);
  const second = repo.add(Object.assign({}, ENTRY, { exercise: "Squat" }));
  assert.equal(repo.remove(first.id), true);
  assert.deepEqual(repo.list(), [second]);
});

test("remove survives a reload because it is saved to storage", () => {
  const storage = new MemoryStorage();
  const repo = makeRepo(storage);
  const saved = repo.add(ENTRY);
  repo.remove(saved.id);
  assert.deepEqual(new WorkoutRepository(storage).list(), []);
});

test("remove with an id that does not exist returns false and writes nothing", () => {
  const storage = new MemoryStorage();
  const repo = makeRepo(storage);
  repo.add(ENTRY);
  const writesBefore = storage.writes;
  assert.equal(repo.remove("no-such-id"), false);
  assert.equal(storage.writes, writesBefore);
  assert.equal(repo.list().length, 1);
});

test("remove returns false when the change cannot be saved", () => {
  const good = { id: "a", exercise: "Squat", sets: 4, reps: 5, weight: 185, date: "2026-11-02", createdAt: 1 };
  const storage = new BrokenStorage();
  storage.getItem = () => JSON.stringify([good]);
  const repo = makeRepo(storage);
  assert.equal(repo.remove("a"), false);
  assert.equal(repo.list().length, 1);
});

test("update changes the details but keeps the id and the original added time", () => {
  const repo = makeRepo(new MemoryStorage());
  const saved = repo.add(ENTRY);
  const updated = repo.update(saved.id, Object.assign({}, ENTRY, { weight: 145, reps: 6 }));
  assert.equal(updated.id, saved.id);
  assert.equal(updated.createdAt, saved.createdAt);
  assert.equal(updated.weight, 145);
  assert.equal(updated.reps, 6);
  assert.deepEqual(repo.list(), [updated]);
});

test("update changes only the workout with that id", () => {
  const repo = makeRepo(new MemoryStorage());
  const first = repo.add(ENTRY);
  const second = repo.add(Object.assign({}, ENTRY, { exercise: "Squat" }));
  repo.update(first.id, Object.assign({}, ENTRY, { exercise: "Incline Press" }));
  const names = repo.list().map((w) => w.exercise);
  assert.deepEqual(names, ["Incline Press", "Squat"]);
  assert.deepEqual(repo.list()[1], second);
});

test("update survives a reload because it is saved to storage", () => {
  const storage = new MemoryStorage();
  const repo = makeRepo(storage);
  const saved = repo.add(ENTRY);
  repo.update(saved.id, Object.assign({}, ENTRY, { weight: 200 }));
  assert.equal(new WorkoutRepository(storage).list()[0].weight, 200);
});

test("update with an id that does not exist returns null and writes nothing", () => {
  const storage = new MemoryStorage();
  const repo = makeRepo(storage);
  repo.add(ENTRY);
  const writesBefore = storage.writes;
  assert.equal(repo.update("no-such-id", ENTRY), null);
  assert.equal(storage.writes, writesBefore);
});

test("update returns null and keeps the old data when the change cannot be saved", () => {
  const good = { id: "a", exercise: "Squat", sets: 4, reps: 5, weight: 185, date: "2026-11-02", createdAt: 1 };
  const storage = new BrokenStorage();
  storage.getItem = () => JSON.stringify([good]);
  const repo = makeRepo(storage);
  assert.equal(repo.update("a", Object.assign({}, ENTRY, { exercise: "Squat" })), null);
  assert.deepEqual(repo.list(), [good]);
});
