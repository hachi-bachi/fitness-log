import test from "node:test";
import assert from "node:assert/strict";
import { todayISO, formatDate, isRealDate } from "../src/dates.js";

test("todayISO formats the given date as YYYY-MM-DD", () => {
  assert.equal(todayISO(new Date(2026, 10, 13)), "2026-11-13");
});

test("todayISO pads single digit months and days", () => {
  assert.equal(todayISO(new Date(2026, 0, 5)), "2026-01-05");
});

test("formatDate shows a readable date without shifting the day", () => {
  assert.equal(formatDate("2026-03-05"), "Mar 5, 2026");
  assert.equal(formatDate("2026-12-31"), "Dec 31, 2026");
});

test("isRealDate accepts real dates, including a leap day", () => {
  assert.equal(isRealDate("2026-11-13"), true);
  assert.equal(isRealDate("2024-02-29"), true);
});

test("isRealDate rejects impossible dates and bad formats", () => {
  assert.equal(isRealDate("2026-02-30"), false);
  assert.equal(isRealDate("2025-02-29"), false);
  assert.equal(isRealDate("2026-13-01"), false);
  assert.equal(isRealDate("11/13/2026"), false);
  assert.equal(isRealDate(""), false);
});
