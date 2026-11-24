# Fitness Log

Fitness Log is a web application for logging workouts and reviewing training history. It supports logging a workout, viewing the saved history in date order, seeing the personal record for each exercise, deleting a workout you logged by mistake, editing a workout to fix its details, and filtering the history to one exercise. Sprint 2 adds deleting, editing, and filtering the history by exercise.

Author: Hassan Janjua

Course: CS 319, Fundamentals of Software Engineering, Northeastern Illinois University

## Technologies

- HTML, CSS, and JavaScript (ES modules, no frameworks, no build step)
- Browser localStorage for saved data
- Node.js built-in test runner (`node --test`) for the automated tests

## Prerequisites

- A current desktop browser (Chrome, Safari, Firefox, or Edge)
- Python 3.8 or newer, only to serve the files locally. Check with `python3 --version`.
- Node.js 18 or newer, only to run the automated tests. Check with `node --version`.

No packages need to be installed. `package.json` only holds the test command, and there is no `npm install` step.

## Installation

```
git clone https://github.com/hachi-bachi/fitness-log.git
cd fitness-log
```

If you downloaded a ZIP instead, open a terminal in the unzipped folder that contains `index.html`.

## Configuration

None. The application needs no settings, accounts, or environment variables.

## Running the application

From the folder that contains `index.html`, run:

```
python3 -m http.server 8000
```

Then open http://localhost:8000 in your browser. You should see the page titled "Fitness Log" with a "Log a workout" form. Press Ctrl+C in the terminal to stop the server.

Serving the files this way is recommended because some browsers block local stylesheets and scripts when `index.html` is opened directly from disk.

## Running the automated tests

From the folder that contains `package.json`, run either of these:

```
npm test
```

or

```
node --test
```

The tests are in the `tests/` folder and need no browser. All tests should pass and the summary should show `fail 0`.

## Code layout

- `index.html`, `styles.css`: the page and its styles
- `app.js`: connects the page to the logic below (reading the form, drawing the tables, handling clicks)
- `src/dates.js`: date helpers
- `src/validation.js`: checks the form values for a workout
- `src/exercise.js`: the rule for treating exercise names as the same exercise
- `src/history.js`: orders and filters the workout history
- `src/editing.js`: turns a saved workout into form values for editing
- `src/records.js`: works out the personal record for each exercise
- `src/repository.js`: saves and loads workouts through a storage object it is given (localStorage in the browser, a fake in tests)
- `tests/`: automated tests, one file per module

## Trying the Sprint 1 functionality

1. In "Log a workout", enter Exercise `Bench Press`, Sets `3`, Reps `8`, Weight `135`, and keep today's date. Select **Add Workout**. A confirmation appears and the workout shows in "Workout history".
2. Add a second workout: `Bench Press`, 3 sets, 5 reps, 155 lbs, with an earlier date. It appears below the first one, because history is sorted newest date first.
3. Check "Personal records". Bench Press shows 155 lbs, the heaviest weight logged for that exercise.
4. Select **Add Workout** with the Exercise box empty, or containing only spaces. An error message appears and nothing is added.
5. Refresh the page. Your workouts and personal records are still there.

## Trying the delete feature (Sprint 2)

1. Add two workouts, for example `Bench Press` at 155 lbs and `Bench Press` at 135 lbs. Personal records shows 155 lbs.
2. In "Workout history", select **Delete** on the 155 lbs row. The row asks "Delete this workout?" with **Yes, delete** and **Cancel**. Nothing is removed yet.
3. Select **Cancel**. The workout is still there.
4. Select **Delete** again, then **Yes, delete**. A message confirms the deletion, the row disappears, and Personal records drops back to 135 lbs.
5. Refresh the page. The deleted workout stays deleted.

## Trying the edit feature (Sprint 2)

1. Add a workout such as `Bench Press`, 3 sets, 8 reps, 135 lbs.
2. In "Workout history", select **Edit** on that row. The form at the top fills with its values, the heading changes to "Edit workout", the button says **Save Changes**, and the row is highlighted.
3. Change the weight to `145` and select **Save Changes**. A confirmation appears, the row shows 145 lbs, and Personal records updates.
4. Select **Edit** again and enter `0` sets, then **Save Changes**. An error appears and the workout is not changed.
5. Select **Cancel edit**. The form goes back to "Log a workout" and nothing is changed.
6. Refresh the page. The edited workout keeps its new values.

## Trying the filter feature (Sprint 2)

1. Add three workouts: `Bench Press`, `Squat`, and `bench press` (lowercase) on different dates.
2. In "Workout history", open the **Filter by exercise** list. It shows "All exercises", "Bench Press", and "Squat". The two bench press spellings count as one exercise.
3. Choose **Bench Press**. Only the two bench press workouts show, newest first, with the message "Showing 2 of 3 workouts."
4. With the filter on, add a `Squat` workout. A note says it is hidden by the current filter. Choose **All exercises** and it appears.
5. Choose **Squat**, then delete every squat workout. The filter returns to "All exercises" by itself.

Filtering only changes what the history shows. Your saved workouts and Personal records are not affected.

No sample data file is needed. All example data above is fictional.

## Where data is stored

Workouts are saved in your browser's localStorage under the key `fitnessLog.workouts`. Data persists after refreshing the page or restarting the browser. It stays in that browser only, and clearing the site data for localhost erases it.

## Known limitations

- Editing replaces all of a workout's details at once. There is no edit history and no undo.
- Deleting a workout cannot be undone.
- Weight is in pounds only.
- A bodyweight exercise logged at 0 lbs shows a record of 0 lbs, because records are based on weight.
- The filter picks one exercise at a time. It does not filter by date, and it is not remembered after a page refresh.
- Weekly training volume and training streaks are planned for a later sprint.
- Data is not shared between browsers or computers.
- Opening `localhost:8000` and `127.0.0.1:8000` uses separate storage, so use the same address each time.
