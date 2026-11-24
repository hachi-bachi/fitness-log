// Exercise names are compared ignoring case and extra spaces, so "Bench Press" and
// " bench press " count as the same exercise. This is the one place that rule lives.
export function exerciseKey(name) {
  return name.trim().toLowerCase();
}
