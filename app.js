"use strict";

const STORAGE_KEY = "fitnessLog.workouts";

// Returns today's date as YYYY-MM-DD in the user's local time zone.
function todayISO() {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return d.getFullYear() + "-" + month + "-" + day;
}

// Formats a YYYY-MM-DD string for display without shifting the day across time zones.
function formatDate(iso) {
  const parts = iso.split("-").map(Number);
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function isRealDate(iso) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
  const parts = iso.split("-").map(Number);
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  return d.getFullYear() === parts[0] && d.getMonth() === parts[1] - 1 && d.getDate() === parts[2];
}

// Checks the raw form values. Returns { errors, entry }.
// errors is a list of { field, message }. entry is null when any error exists.
function validateWorkout(raw, today) {
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

// ----- Form handling -----

const form = document.getElementById("workout-form");
const errorBox = document.getElementById("form-errors");
const statusLine = document.getElementById("form-status");
const fieldIds = ["exercise", "sets", "reps", "weight", "date"];

function clearErrors() {
  errorBox.hidden = true;
  errorBox.textContent = "";
  fieldIds.forEach(function (id) {
    const input = document.getElementById(id);
    input.classList.remove("invalid");
    input.removeAttribute("aria-invalid");
  });
}

function showErrors(errors) {
  errorBox.textContent = "";
  const ul = document.createElement("ul");
  errors.forEach(function (e) {
    const li = document.createElement("li");
    li.textContent = e.message;
    ul.appendChild(li);
    const input = document.getElementById(e.field);
    input.classList.add("invalid");
    input.setAttribute("aria-invalid", "true");
  });
  errorBox.appendChild(ul);
  errorBox.hidden = false;
  document.getElementById(errors[0].field).focus();
}

function readForm() {
  return {
    exercise: document.getElementById("exercise").value,
    sets: document.getElementById("sets").value,
    reps: document.getElementById("reps").value,
    weight: document.getElementById("weight").value,
    date: document.getElementById("date").value
  };
}

function resetForm() {
  form.reset();
  document.getElementById("date").value = todayISO();
  document.getElementById("date").max = todayISO();
}

form.addEventListener("submit", function (event) {
  event.preventDefault();
  clearErrors();
  statusLine.textContent = "";

  const result = validateWorkout(readForm(), todayISO());
  if (result.errors.length > 0) {
    showErrors(result.errors);
    return;
  }
  statusLine.textContent = "Entry is valid. Saving is not added yet.";
});

resetForm();
