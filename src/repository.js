import { isRealDate } from "./dates.js";

export const STORAGE_KEY = "fitnessLog.workouts";

export function isStoredWorkout(w) {
  return Boolean(w) && typeof w.id === "string" && typeof w.exercise === "string" &&
    Number.isFinite(w.sets) && Number.isFinite(w.reps) &&
    Number.isFinite(w.weight) && isRealDate(String(w.date));
}

function defaultMakeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// Saves and loads workouts. It does not know where the data really lives: it only needs a
// "storage" object with getItem(key) and setItem(key, value), the same shape as localStorage.
// The browser passes localStorage in. Tests pass a fake. (Dependency Inversion)
export class WorkoutRepository {
  constructor(storage, options = {}) {
    this.storage = storage;
    this.now = options.now || Date.now;
    this.makeId = options.makeId || defaultMakeId;
  }

  // Returns every valid saved workout, oldest first. Bad or missing data gives an empty list.
  list() {
    try {
      const raw = this.storage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const data = JSON.parse(raw);
      return Array.isArray(data) ? data.filter(isStoredWorkout) : [];
    } catch (err) {
      return [];
    }
  }

  // Saves a validated entry. Returns the saved workout, or null if saving failed.
  add(entry) {
    const list = this.list();
    const workout = {
      id: this.makeId(),
      exercise: entry.exercise,
      sets: entry.sets,
      reps: entry.reps,
      weight: entry.weight,
      date: entry.date,
      createdAt: this.now()
    };
    list.push(workout);
    return this.#save(list) ? workout : null;
  }

  #save(list) {
    try {
      this.storage.setItem(STORAGE_KEY, JSON.stringify(list));
      return true;
    } catch (err) {
      return false;
    }
  }
}
