/**
 * @fileoverview Streak calculation utilities.
 * A "streak" counts consecutive days where total CO2e is below
 * the LOW_IMPACT_THRESHOLD_KG (5 kg/day).
 */

import type { DailyLog, StreakData } from "@/types";
import { LOW_IMPACT_THRESHOLD_KG } from "@/utils/constants";
import { getTodayKey } from "@/utils/date";

/**
 * Determines whether a given daily log qualifies as a "low impact" day.
 * A day qualifies if total CO2e is below the LOW_IMPACT_THRESHOLD_KG.
 *
 * @param log - The DailyLog to evaluate
 * @returns `true` if the day is low impact
 */
export function isLowImpactDay(log: DailyLog): boolean {
  return log.totalKgCO2e < LOW_IMPACT_THRESHOLD_KG;
}

/**
 * Calculates the current active streak of consecutive low-impact days.
 * Counts backwards from today. Stops at the first non-qualifying day.
 *
 * @param logs - Array of DailyLog objects sorted by date (any order)
 * @returns Number of consecutive low-impact days ending today (or yesterday)
 */
export function getCurrentStreak(logs: DailyLog[]): number {
  if (logs.length === 0) return 0;

  const today = getTodayKey();
  const logMap = new Map<string, DailyLog>(logs.map((l) => [l.date, l]));

  let streak = 0;
  const checkDate = new Date(today);

  // Allow streak to continue if today hasn't been logged yet
  const todayLog = logMap.get(today);
  if (todayLog && !isLowImpactDay(todayLog)) return 0;

  // Walk backwards day by day
  while (true) {
    const dateKey = checkDate.toISOString().split("T")[0];
    const log = logMap.get(dateKey);

    if (!log) {
      // No log for this date — only skip if it's today (not yet logged)
      if (dateKey === today) {
        checkDate.setDate(checkDate.getDate() - 1);
        continue;
      }
      break;
    }

    if (!isLowImpactDay(log)) break;

    streak++;
    checkDate.setDate(checkDate.getDate() - 1);
  }

  return streak;
}

/**
 * Finds the all-time longest streak across all logged days.
 *
 * @param logs - Array of all DailyLog objects
 * @returns The highest streak count achieved
 */
export function getLongestStreak(logs: DailyLog[]): number {
  if (logs.length === 0) return 0;

  // Sort by date ascending
  const sorted = [...logs].sort((a, b) => a.date.localeCompare(b.date));

  let longest = 0;
  let current = 0;

  for (let i = 0; i < sorted.length; i++) {
    const log = sorted[i];

    if (!isLowImpactDay(log)) {
      current = 0;
      continue;
    }

    // Check if this day is consecutive with the previous
    if (i > 0) {
      const prevDate = new Date(sorted[i - 1].date);
      const currDate = new Date(log.date);
      const diffDays =
        (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);

      if (diffDays === 1) {
        current++;
      } else {
        current = 1; // Gap in dates — reset streak
      }
    } else {
      current = 1;
    }

    longest = Math.max(longest, current);
  }

  return longest;
}

/**
 * Calculates and returns the full StreakData object from all logs.
 *
 * @param logs - All DailyLog objects for the user
 * @returns Complete StreakData with current, longest, and total low-impact days
 */
export function calculateStreakData(logs: DailyLog[]): StreakData {
  const currentStreak = getCurrentStreak(logs);
  const longestStreak = getLongestStreak(logs);
  const totalLowImpactDays = logs.filter(isLowImpactDay).length;

  const lowImpactLogs = logs
    .filter(isLowImpactDay)
    .sort((a, b) => b.date.localeCompare(a.date));

  const lastLowImpactDate =
    lowImpactLogs.length > 0 ? lowImpactLogs[0].date : null;

  return {
    currentStreak,
    longestStreak,
    lastLowImpactDate,
    totalLowImpactDays,
  };
}
