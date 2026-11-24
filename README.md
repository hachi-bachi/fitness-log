# Fitness Log

Fitness Log is a web application for logging workouts and reviewing training history. It supports logging a workout, viewing the saved history in date order, seeing the personal record for each exercise, and deleting a workout you logged by mistake. Sprint 2 adds deleting (and, in the same sprint, editing and filtering).

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
- `src/history.js`: orders the workout history
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

No sample data file is needed. All example data above is fictional.

## Where data is stored

Workouts are saved in your browser's localStorage under the key `fitnessLog.workouts`. Data persists after refreshing the page or restarting the browser. It stays in that browser only, and clearing the site data for localhost erases it.

## Known limitations

- Workouts cannot be edited yet.
- Deleting a workout cannot be undone.
- Weight is in pounds only.
- A bodyweight exercise logged at 0 lbs shows a record of 0 lbs, because records are based on weight.
- Weekly training volume and training streaks are planned for a later sprint.
- Data is not shared between browsers or computers.
- Opening `localhost:8000` and `127.0.0.1:8000` uses separate storage, so use the same address each time.
