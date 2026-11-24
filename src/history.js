// Pure functions for ordering the workout history.

// Newest date first. Entries on the same date show the most recently added first.
export function sortedWorkouts(list) {
  return list.slice().sort(function (a, b) {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1;
    return (b.createdAt || 0) - (a.createdAt || 0);
  });
}
