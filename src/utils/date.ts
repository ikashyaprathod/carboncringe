/**
 * @fileoverview Date helper utilities.
 * All date operations use ISO 8601 strings (YYYY-MM-DD) as keys
 * to avoid timezone issues with Date object comparisons.
 */

import type { DailyLog } from "@/types";

/**
 * Returns today's date as an ISO date string (YYYY-MM-DD).
 * Uses local timezone, not UTC.
 *
 * @returns Today's date key e.g. "2024-03-15"
 */
export function getTodayKey(): string {
  const now = new Date();
  return toDateKey(now);
}

/**
 * Converts a Date object to an ISO date string (YYYY-MM-DD).
 * Uses local timezone.
 *
 * @param date - The Date to convert
 * @returns ISO date string
 */
export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Returns a Date object from an ISO date string (YYYY-MM-DD).
 * Parses as local time (not UTC) to avoid off-by-one day issues.
 *
 * @param dateKey - ISO date string e.g. "2024-03-15"
 * @returns Corresponding Date object at midnight local time
 */
export function fromDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

/**
 * Returns the ISO date keys for the last N days (including today).
 * Most recent date first.
 *
 * @param n - Number of days to return (defaults to 7)
 * @returns Array of date key strings, descending order
 */
export function getLastNDays(n: number = 7): string[] {
  const days: string[] = [];
  const today = new Date();

  for (let i = 0; i < n; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    days.push(toDateKey(date));
  }

  return days;
}

/**
 * Returns the start (Monday) and end (Sunday) date keys of the
 * current ISO week.
 *
 * @returns Object with weekStart and weekEnd date strings
 */
export function getWeekRange(): { weekStart: string; weekEnd: string } {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon, ...
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return {
    weekStart: toDateKey(monday),
    weekEnd: toDateKey(sunday),
  };
}

/**
 * Groups an array of DailyLog objects by ISO week (Monday–Sunday).
 *
 * @param logs - Array of DailyLog objects
 * @returns Map from week-start date key → logs in that week
 */
export function groupLogsByWeek(
  logs: DailyLog[]
): Map<string, DailyLog[]> {
  const groups = new Map<string, DailyLog[]>();

  for (const log of logs) {
    const date = fromDateKey(log.date);
    const dayOfWeek = date.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

    const monday = new Date(date);
    monday.setDate(date.getDate() + mondayOffset);
    const weekKey = toDateKey(monday);

    const existing = groups.get(weekKey) ?? [];
    groups.set(weekKey, [...existing, log]);
  }

  return groups;
}

/**
 * Formats a date key for human-readable display.
 *
 * @param dateKey - ISO date string
 * @param format - "short" = "Mar 15", "long" = "Friday, March 15", "relative" = "Today" / "Yesterday" / date
 * @returns Formatted date string
 */
export function formatDisplayDate(
  dateKey: string,
  format: "short" | "long" | "relative" = "short"
): string {
  const date = fromDateKey(dateKey);
  const today = getTodayKey();
  const yesterday = toDateKey(new Date(new Date().setDate(new Date().getDate() - 1)));

  if (format === "relative") {
    if (dateKey === today) return "Today";
    if (dateKey === yesterday) return "Yesterday";
  }

  if (format === "long") {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/**
 * Returns `true` if the given date key is today.
 *
 * @param dateKey - ISO date string to check
 */
export function isToday(dateKey: string): boolean {
  return dateKey === getTodayKey();
}

/**
 * Returns the number of days between two ISO date keys.
 * Positive if dateA is after dateB.
 *
 * @param dateA - ISO date string
 * @param dateB - ISO date string to subtract
 */
export function daysBetween(dateA: string, dateB: string): number {
  const a = fromDateKey(dateA).getTime();
  const b = fromDateKey(dateB).getTime();
  return Math.round((a - b) / (1000 * 60 * 60 * 24));
}
