/**
 * @fileoverview Pattern detection utility.
 * Analyzes historical log data to predict likely activities based on day of week frequency.
 */

import type { ActivityEntry, ActivityType } from "@/types";
import { fromDateKey } from "@/utils/date";
import { calculateActivityEmission } from "@/utils/carbonCalculator";

export interface SuggestedActivity {
  activityType: ActivityType;
  quantity: number;
  kgCO2e: number;
}

/**
 * Counts occurrences of logged activity types on a specific day of the week.
 *
 * @param logs - Record of activities grouped by date
 * @param dayOfWeek - Day of week index (0 = Sunday, 1 = Monday, etc.)
 * @returns Record mapping activity types to counts
 */
export function getFrequentActivitiesForDay(
  logs: Record<string, ActivityEntry[]>,
  dayOfWeek: number
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const [dateKey, entries] of Object.entries(logs)) {
    const date = fromDateKey(dateKey);
    if (date.getDay() === dayOfWeek) {
      for (const entry of entries) {
        counts[entry.activityType] = (counts[entry.activityType] ?? 0) + 1;
      }
    }
  }
  return counts;
}

/**
 * Analyzes full activity logs and generates up to 3 suggested activities for today.
 *
 * @param logs - Full logs from storage
 * @param todayKey - Today's date key (YYYY-MM-DD)
 * @returns Ranked array of suggested activities to log
 */
export function getSuggestedActivities(
  logs: Record<string, ActivityEntry[]>,
  todayKey: string
): SuggestedActivity[] {
  const allEntries: ActivityEntry[] = [];
  const historicalLogs: Record<string, ActivityEntry[]> = {};
  
  let totalEntriesCount = 0;
  for (const [dateKey, entries] of Object.entries(logs)) {
    totalEntriesCount += entries.length;
    if (dateKey !== todayKey) {
      historicalLogs[dateKey] = entries;
      allEntries.push(...entries);
    }
  }

  // Under 5 total entries (including today) -> no suggestions yet
  if (totalEntriesCount < 5) {
    return [];
  }

  const todayDate = fromDateKey(todayKey);
  const todayDayOfWeek = todayDate.getDay();

  // 1. Calculate overall frequency and quantities
  const overallCounts: Record<string, number> = {};
  const quantities: Record<string, number[]> = {};

  for (const entry of allEntries) {
    const type = entry.activityType;
    overallCounts[type] = (overallCounts[type] ?? 0) + 1;
    quantities[type] = quantities[type] ?? [];
    quantities[type].push(entry.quantity);
  }

  // 2. Calculate day-of-week specific frequency
  const dayOfWeekCounts: Record<string, number> = {};
  for (const [dateKey, entries] of Object.entries(historicalLogs)) {
    const date = fromDateKey(dateKey);
    if (date.getDay() === todayDayOfWeek) {
      for (const entry of entries) {
        dayOfWeekCounts[entry.activityType] = (dayOfWeekCounts[entry.activityType] ?? 0) + 1;
      }
    }
  }

  // 3. Compute scores and rank
  const activeTypes = Object.keys(overallCounts) as ActivityType[];
  const ranked = activeTypes.map((type) => {
    const overall = overallCounts[type] ?? 0;
    const daySpecific = dayOfWeekCounts[type] ?? 0;

    // Formula: weight day-of-week occurrences highly, fallback to overall counts
    const score = daySpecific * 3 + overall;

    // Get average quantity logged historically for this type
    const qList = quantities[type] || [1];
    const sum = qList.reduce((a, b) => a + b, 0);
    const avgQuantity = Math.round((sum / qList.length) * 10) / 10;

    return {
      activityType: type,
      quantity: avgQuantity,
      score,
    };
  });

  // Sort by score descending
  ranked.sort((a, b) => b.score - a.score);

  // Filter out any activities already logged today to prevent duplicate suggestions
  const todayEntries = logs[todayKey] ?? [];
  const todayLoggedTypes = new Set(todayEntries.map((e) => e.activityType));
  const filtered = ranked.filter((r) => !todayLoggedTypes.has(r.activityType));

  // Map to the final suggestion structure and limit to top 3
  return filtered.slice(0, 3).map((item) => ({
    activityType: item.activityType,
    quantity: item.quantity,
    kgCO2e: calculateActivityEmission(item.activityType, item.quantity),
  }));
}
