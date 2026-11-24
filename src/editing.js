// Helpers for editing a saved workout.

// Turns a saved workout into the text values the form fields show.
// This is the reverse of validateWorkout, which turns form text into numbers.
export function workoutToForm(workout) {
  return {
    exercise: workout.exercise,
    sets: String(workout.sets),
    reps: String(workout.reps),
    weight: String(workout.weight),
    date: workout.date
  };
}
