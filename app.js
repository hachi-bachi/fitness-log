import { todayISO, formatDate } from "./src/dates.js";
import { validateWorkout } from "./src/validation.js";
import { sortedWorkouts } from "./src/history.js";
import { computeRecords } from "./src/records.js";
import { WorkoutRepository } from "./src/repository.js";

// ----- Storage -----

// localStorage can be missing or blocked (some private modes). Fall back to a storage that
// reads as empty and refuses to save, so the app shows its normal "could not be saved" message.
function browserStorage() {
  try {
    return window.localStorage;
  } catch (err) {
    return {
      getItem: function () { return null; },
      setItem: function () { throw new Error("Storage is unavailable."); }
    };
  }
}

const repo = new WorkoutRepository(browserStorage());

// ----- Workout history -----

function makeCell(tag, text, className) {
  const cell = document.createElement(tag);
  cell.textContent = text;
  if (className) cell.className = className;
  return cell;
}

function renderHistory() {
  const container = document.getElementById("history");
  container.textContent = "";
  const list = sortedWorkouts(repo.list());

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

function renderRecords() {
  const container = document.getElementById("records");
  container.textContent = "";
  const records = computeRecords(repo.list());

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
  if (!repo.add(result.entry)) {
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
