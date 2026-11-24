import { todayISO, formatDate } from "./src/dates.js";
import { validateWorkout } from "./src/validation.js";
import { sortedWorkouts, exerciseOptions, filterByExercise, resolveFilter } from "./src/history.js";
import { computeRecords } from "./src/records.js";
import { WorkoutRepository } from "./src/repository.js";
import { workoutToForm } from "./src/editing.js";
import { exerciseKey } from "./src/exercise.js";

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

// The workout waiting for the user to confirm its deletion, or null.
let pendingDeleteId = null;
// The workout currently loaded into the form for editing, or null when adding a new one.
let editingId = null;
// The exercise the history is filtered to (see exerciseKey), or "" for all exercises.
let selectedExercise = "";
const historyBox = document.getElementById("history");
const historyStatus = document.getElementById("history-status");

function setHistoryStatus(message, isError) {
  historyStatus.textContent = message;
  historyStatus.classList.toggle("error", Boolean(isError));
}

function makeButton(label, action, id, kind) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = label;
  button.className = kind;
  button.dataset.action = action;
  button.dataset.id = id;
  return button;
}

const filterRow = document.getElementById("filter-row");
const filterSelect = document.getElementById("exercise-filter");
const filterCount = document.getElementById("filter-count");

// Rebuilds the "filter by exercise" list from the saved workouts and selects the current choice.
function renderFilter(all) {
  filterRow.hidden = all.length === 0;
  filterSelect.textContent = "";
  const everything = document.createElement("option");
  everything.value = "";
  everything.textContent = "All exercises";
  filterSelect.appendChild(everything);
  exerciseOptions(all).forEach(function (option) {
    const el = document.createElement("option");
    el.value = option.key;
    el.textContent = option.label;
    filterSelect.appendChild(el);
  });
  filterSelect.value = selectedExercise;
}

filterSelect.addEventListener("change", function () {
  selectedExercise = filterSelect.value;
  setHistoryStatus("", false);
  renderHistory();
});

function renderHistory() {
  const container = historyBox;
  container.textContent = "";
  const all = repo.list();
  selectedExercise = resolveFilter(selectedExercise, all);
  renderFilter(all);
  const list = sortedWorkouts(filterByExercise(all, selectedExercise));
  filterCount.textContent = selectedExercise ? filterSummary(list.length, all.length) : "";

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
  head.appendChild(makeCell("th", "Actions"));
  table.appendChild(head);

  list.forEach(function (w) {
    const row = document.createElement("tr");
    row.appendChild(makeCell("td", formatDate(w.date)));
    row.appendChild(makeCell("td", w.exercise));
    row.appendChild(makeCell("td", String(w.sets), "num"));
    row.appendChild(makeCell("td", String(w.reps), "num"));
    row.appendChild(makeCell("td", String(w.weight), "num"));

    if (w.id === editingId) row.classList.add("editing");

    const actions = document.createElement("td");
    actions.className = "actions";
    if (w.id === pendingDeleteId) {
      row.classList.add("pending");
      actions.appendChild(makeCell("span", "Delete this workout?", "confirm-text"));
      actions.appendChild(makeButton("Yes, delete", "confirm-delete", w.id, "danger"));
      actions.appendChild(makeButton("Cancel", "cancel-delete", w.id, "secondary"));
    } else {
      const edit = makeButton("Edit", "edit", w.id, "secondary");
      edit.setAttribute("aria-label", "Edit " + w.exercise + " from " + formatDate(w.date));
      actions.appendChild(edit);
      const del = makeButton("Delete", "ask-delete", w.id, "secondary");
      del.setAttribute("aria-label", "Delete " + w.exercise + " from " + formatDate(w.date));
      actions.appendChild(del);
    }
    row.appendChild(actions);
    table.appendChild(row);
  });
  container.appendChild(table);
}

// Says how many workouts match the filter, for example "Showing 2 of 5 workouts."
function filterSummary(shown, total) {
  return "Showing " + shown + " of " + total + " workout" + (total === 1 ? "" : "s") + ".";
}

// ----- Deleting a workout -----

function deleteWorkout(id) {
  const target = repo.list().find(function (w) { return w.id === id; });
  pendingDeleteId = null;
  if (editingId === id) stopEditing();
  if (!target || !repo.remove(id)) {
    setHistoryStatus("That workout could not be deleted.", true);
  } else {
    setHistoryStatus("Deleted " + target.exercise + " from " + formatDate(target.date) + ".", false);
  }
  renderHistory();
  renderRecords();
}

historyBox.addEventListener("click", function (event) {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const id = button.dataset.id;
  const action = button.dataset.action;
  setHistoryStatus("", false);

  if (action === "edit") {
    startEdit(id);
  } else if (action === "ask-delete") {
    pendingDeleteId = id;
    renderHistory();
    historyBox.querySelector('button[data-action="cancel-delete"]').focus();
  } else if (action === "cancel-delete") {
    pendingDeleteId = null;
    renderHistory();
    const again = historyBox.querySelector('button[data-id="' + id + '"]');
    if (again) again.focus();
  } else if (action === "confirm-delete") {
    deleteWorkout(id);
  }
});

// ----- Personal records -----

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
const submitButton = document.getElementById("submit-button");
const cancelEditButton = document.getElementById("cancel-edit");

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

// ----- Editing a workout -----

function startEdit(id) {
  const target = repo.list().find(function (w) { return w.id === id; });
  if (!target) {
    setHistoryStatus("That workout could not be found.", true);
    renderHistory();
    return;
  }
  pendingDeleteId = null;
  editingId = id;
  const values = workoutToForm(target);
  fieldIds.forEach(function (field) {
    document.getElementById(field).value = values[field];
  });
  clearErrors();
  statusLine.textContent = "";
  document.getElementById("log-heading").textContent = "Edit workout";
  submitButton.textContent = "Save Changes";
  cancelEditButton.hidden = false;
  renderHistory();
  document.getElementById("exercise").focus();
  form.scrollIntoView({ behavior: "smooth", block: "start" });
}

function stopEditing() {
  editingId = null;
  clearErrors();
  document.getElementById("log-heading").textContent = "Log a workout";
  submitButton.textContent = "Add Workout";
  cancelEditButton.hidden = true;
  resetForm();
  renderHistory();
}

function saveEdit(entry) {
  const updated = repo.update(editingId, entry);
  if (!updated) {
    showErrors([{ field: "exercise", message: "The workout could not be updated. It may have been deleted, or browser storage is unavailable." }]);
    return;
  }
  stopEditing();
  renderRecords();
  statusLine.textContent = "Updated " + updated.exercise + ": " + updated.sets + " x " +
    updated.reps + " at " + updated.weight + " lbs.";
}

cancelEditButton.addEventListener("click", function () {
  stopEditing();
  statusLine.textContent = "Edit cancelled. Nothing was changed.";
});

form.addEventListener("submit", function (event) {
  event.preventDefault();
  clearErrors();
  statusLine.textContent = "";

  const result = validateWorkout(readForm(), todayISO());
  if (result.errors.length > 0) {
    showErrors(result.errors);
    return;
  }
  if (editingId !== null) {
    saveEdit(result.entry);
    return;
  }
  if (!repo.add(result.entry)) {
    showErrors([{ field: "exercise", message: "The workout could not be saved. Browser storage is unavailable." }]);
    return;
  }
  statusLine.textContent = "Added " + result.entry.exercise + ": " + result.entry.sets + " x " +
    result.entry.reps + " at " + result.entry.weight + " lbs.";
  if (selectedExercise && exerciseKey(result.entry.exercise) !== selectedExercise) {
    statusLine.textContent += " It is hidden by the current filter.";
  }
  renderHistory();
  renderRecords();
  resetForm();
});

resetForm();
renderHistory();
renderRecords();
