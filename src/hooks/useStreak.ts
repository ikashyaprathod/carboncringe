/**
 * @fileoverview Streak tracking hook derived from the activity log.
 */

"use client";

import { useMemo } from "react";
import { useActivityLog } from "@/hooks/useActivityLog";
import { calculateDailyFootprint } from "@/utils/carbonCalculator";
import { calculateStreakData } from "@/utils/streak";
import type { DailyLog, StreakData } from "@/types";

/**
 * Hook that computes streak data reactively from the activity log.
 * Recalculates whenever the log changes.
 *
 * @returns StreakData: currentStreak, longestStreak, lastLowImpactDate, totalLowImpactDays
 */
export function useStreak(): StreakData {
  const { log } = useActivityLog();

  const streakData = useMemo((): StreakData => {
    const dailyLogs: DailyLog[] = Object.entries(log).map(([date, entries]) => {
      const { totalKgCO2e, breakdown } = calculateDailyFootprint(entries);
      return { date, entries, totalKgCO2e, breakdown };
    });

    return calculateStreakData(dailyLogs);
  }, [log]);

  return streakData;
}
