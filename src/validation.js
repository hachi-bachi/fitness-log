import { isRealDate } from "./dates.js";

// Checks the raw form values. Returns { errors, entry }.
// errors is a list of { field, message }. entry is null when any error exists.
export function validateWorkout(raw, today) {
  const errors = [];
  const exercise = raw.exercise.trim();
  const sets = raw.sets.trim();
  const reps = raw.reps.trim();
  const weight = raw.weight.trim();
  const date = raw.date.trim();

  if (exercise === "") {
    errors.push({ field: "exercise", message: "Enter an exercise name." });
  } else if (exercise.length > 50) {
    errors.push({ field: "exercise", message: "Exercise name must be 50 characters or fewer." });
  }

  if (!/^\d+$/.test(sets) || Number(sets) < 1 || Number(sets) > 99) {
    errors.push({ field: "sets", message: "Sets must be a whole number from 1 to 99." });
  }

  if (!/^\d+$/.test(reps) || Number(reps) < 1 || Number(reps) > 999) {
    errors.push({ field: "reps", message: "Reps must be a whole number from 1 to 999." });
  }

  if (!/^\d+(\.\d{1,2})?$/.test(weight) || Number(weight) > 2000) {
    errors.push({ field: "weight", message: "Weight must be a number from 0 to 2000 (lbs)." });
  }

  if (date === "") {
    errors.push({ field: "date", message: "Choose a date." });
  } else if (!isRealDate(date)) {
    errors.push({ field: "date", message: "Enter a valid date." });
  } else if (date > today) {
    errors.push({ field: "date", message: "Date cannot be in the future." });
  }

  if (errors.length > 0) {
    return { errors: errors, entry: null };
  }
  return {
    errors: [],
    entry: {
      exercise: exercise,
      sets: Number(sets),
      reps: Number(reps),
      weight: Number(weight),
      date: date
    }
  };
}
