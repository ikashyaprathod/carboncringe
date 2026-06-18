/**
 * @fileoverview Footprint calculation hook with memoized derived state.
 * Computes daily and weekly footprints from the activity log.
 */

"use client";

import { useMemo } from "react";
import { useActivityLog } from "@/hooks/useActivityLog";
import {
  calculateDailyFootprint,
  calculateWeeklyTotal,
  getTopCategory,
  getImpactEquivalents,
  compareToAverage,
} from "@/utils/carbonCalculator";
import { getTodayKey, getLastNDays } from "@/utils/date";
import type { DailyLog, FootprintBreakdown } from "@/types";

/**
 * Hook that provides memoized carbon footprint calculations.
 * All derived values recompute only when the underlying activity log changes.
 *
 * @returns Footprint data: today, weekly, breakdown, equivalents, trend
 */
export function useFootprint() {
  const { getActivitiesByDate } = useActivityLog();

  /** Today's entries and calculated totals */
  const today = useMemo(() => {
    const todayKey = getTodayKey();
    const entries = getActivitiesByDate(todayKey);
    const { totalKgCO2e, breakdown } = calculateDailyFootprint(entries);
    return { entries, totalKgCO2e, breakdown };
  }, [getActivitiesByDate]);

  /** Last 7 days as DailyLog array */
  const last7Days = useMemo((): DailyLog[] => {
    return getLastNDays(7).map((date) => {
      const entries = getActivitiesByDate(date);
      const { totalKgCO2e, breakdown } = calculateDailyFootprint(entries);
      return { date, entries, totalKgCO2e, breakdown };
    });
  }, [getActivitiesByDate]);

  /** Weekly aggregate */
  const weekly = useMemo(() => {
    return calculateWeeklyTotal(last7Days);
  }, [last7Days]);

  /** Top emitting category this week */
  const topCategory = useMemo(
    () => getTopCategory(weekly.breakdown),
    [weekly.breakdown]
  );

  /** Impact equivalents for today's footprint */
  const todayEquivalents = useMemo(
    () => getImpactEquivalents(today.totalKgCO2e),
    [today.totalKgCO2e]
  );

  /** % comparison vs global average (13.5 kg/day) for today */
  const todayVsAverage = useMemo(
    () => compareToAverage(today.totalKgCO2e),
    [today.totalKgCO2e]
  );

  /** Chart data for the last 7 days */
  const chartData = useMemo(
    () =>
      last7Days
        .slice()
        .reverse()
        .map((day) => ({
          date: day.date,
          total: day.totalKgCO2e,
          transport: day.breakdown.transport,
          food: day.breakdown.food,
          energy: day.breakdown.energy,
          shopping: day.breakdown.shopping,
        })),
    [last7Days]
  );

  /** Category breakdown as array for pie/bar charts */
  const breakdownArray = useMemo(
    (): { category: keyof FootprintBreakdown; value: number }[] =>
      (["transport", "food", "energy", "shopping"] as const).map((cat) => ({
        category: cat,
        value: weekly.breakdown[cat],
      })),
    [weekly.breakdown]
  );

  return {
    today,
    last7Days,
    weekly,
    topCategory,
    todayEquivalents,
    todayVsAverage,
    chartData,
    breakdownArray,
  };
}
