import { todayISO, formatDate, isRealDate } from "./src/dates.js";
import { validateWorkout } from "./src/validation.js";

const STORAGE_KEY = "fitnessLog.workouts";

// ----- Storage (browser localStorage) -----

function isStoredWorkout(w) {
  return w && typeof w.id === "string" && typeof w.exercise === "string" &&
    Number.isFinite(w.sets) && Number.isFinite(w.reps) &&
    Number.isFinite(w.weight) && isRealDate(String(w.date));
}

function loadWorkouts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data.filter(isStoredWorkout) : [];
  } catch (err) {
    return [];
  }
}

function saveWorkouts(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return true;
  } catch (err) {
    return false;
  }
}

function addWorkout(entry) {
  const list = loadWorkouts();
  list.push({
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    exercise: entry.exercise,
    sets: entry.sets,
    reps: entry.reps,
    weight: entry.weight,
    date: entry.date,
    createdAt: Date.now()
  });
  return saveWorkouts(list);
}

// ----- Workout history -----

// Newest date first. Entries on the same date show the most recently added first.
function sortedWorkouts(list) {
  return list.slice().sort(function (a, b) {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1;
    return (b.createdAt || 0) - (a.createdAt || 0);
  });
}

function makeCell(tag, text, className) {
  const cell = document.createElement(tag);
  cell.textContent = text;
  if (className) cell.className = className;
  return cell;
}

function renderHistory() {
  const container = document.getElementById("history");
  container.textContent = "";
  const list = sortedWorkouts(loadWorkouts());

  if (list.length === 0) {
    const p = document.createElement("p");
    p.className = "empty";
    p.textContent = "No workouts logged yet.";
    container.appendChild(p);
    return;
  }

  const table = document.createElement("table");
  const head = document.createElement("tr");
  head.appendChild(makeCell("th", "Date"));
  head.appendChild(makeCell("th", "Exercise"));
  head.appendChild(makeCell("th", "Sets", "num"));
  head.appendChild(makeCell("th", "Reps", "num"));
  head.appendChild(makeCell("th", "Weight (lbs)", "num"));
  table.appendChild(head);

  list.forEach(function (w) {
    const row = document.createElement("tr");
    row.appendChild(makeCell("td", formatDate(w.date)));
    row.appendChild(makeCell("td", w.exercise));
    row.appendChild(makeCell("td", String(w.sets), "num"));
    row.appendChild(makeCell("td", String(w.reps), "num"));
    row.appendChild(makeCell("td", String(w.weight), "num"));
    table.appendChild(row);
  });
  container.appendChild(table);
}

// ----- Personal records -----

// A record is the heaviest weight logged for an exercise. Exercise names are matched
// ignoring case and extra spaces, and shown with the first spelling used. Ties go to more reps, then the earlier date.
function computeRecords(list) {
  const best = {};
  const names = {};
  list.forEach(function (w) {
    const key = w.exercise.trim().toLowerCase();
    const added = w.createdAt || 0;
    // Show the spelling used the first time the exercise was logged.
    if (!names[key] || added < names[key].added) {
      names[key] = { name: w.exercise.trim(), added: added };
    }
    const current = best[key];
    const beats = !current ||
      w.weight > current.weight ||
      (w.weight === current.weight && w.reps > current.reps) ||
      (w.weight === current.weight && w.reps === current.reps && w.date < current.date);
    if (beats) best[key] = w;
  });
  return Object.keys(best).sort().map(function (key) {
    return { exercise: names[key].name, weight: best[key].weight, reps: best[key].reps, date: best[key].date };
  });
}

function renderRecords() {
  const container = document.getElementById("records");
  container.textContent = "";
  const records = computeRecords(loadWorkouts());

  if (records.length === 0) {
    const p = document.createElement("p");
    p.className = "empty";
    p.textContent = "Log a workout to see your personal records.";
    container.appendChild(p);
    return;
  }

  const ul = document.createElement("ul");
  ul.className = "record-list";
  records.forEach(function (w) {
    const li = document.createElement("li");
    const name = document.createElement("span");
    name.textContent = w.exercise;
    const detail = document.createElement("span");
    const weight = document.createElement("span");
    weight.className = "record-weight";
    weight.textContent = w.weight + " lbs";
    const extra = document.createElement("span");
    extra.className = "record-detail";
    extra.textContent = " for " + w.reps + " reps on " + formatDate(w.date);
    detail.appendChild(weight);
    detail.appendChild(extra);
    li.appendChild(name);
    li.appendChild(detail);
    ul.appendChild(li);
  });
  container.appendChild(ul);
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
  if (!addWorkout(result.entry)) {
    showErrors([{ field: "exercise", message: "The workout could not be saved. Browser storage is unavailable." }]);
    return;
  }
  statusLine.textContent = "Added " + result.entry.exercise + ": " + result.entry.sets + " x " +
    result.entry.reps + " at " + result.entry.weight + " lbs.";
  renderHistory();
  renderRecords();
  resetForm();
});

resetForm();
renderHistory();
renderRecords();
