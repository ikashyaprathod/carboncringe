/**
 * @fileoverview Activity log management hook.
 * Handles CRUD for ActivityEntry objects keyed by date in localStorage.
 */

"use client";

import { useCallback, useMemo } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { calculateActivityEmission } from "@/utils/carbonCalculator";
import { getTodayKey } from "@/utils/date";
import { STORAGE_KEYS, ACTIVITY_METADATA } from "@/utils/constants";
import type { ActivityEntry, ActivityType } from "@/types";

type ActivityLog = Record<string, ActivityEntry[]>;

/**
 * Hook for logging and retrieving carbon activities.
 * Activities are stored per-date in a Record<dateKey, ActivityEntry[]>.
 *
 * @returns Log helpers: logActivity, removeActivity, getTodayActivities, getActivitiesByDate, clearToday
 */
export function useActivityLog() {
  const [log, setLog] = useLocalStorage<ActivityLog>(STORAGE_KEYS.ACTIVITY_LOG, {});

  /**
   * Logs a new activity for today.
   * Automatically calculates kgCO2e from the activity type and quantity.
   *
   * @param activityType - The type of activity
   * @param quantity - How many units (km, meals, hours, orders)
   * @param note - Optional user note
   * @returns The created ActivityEntry
   */
  const logActivity = useCallback(
    (activityType: ActivityType, quantity: number, note?: string): ActivityEntry => {
      const today = getTodayKey();
      const entry: ActivityEntry = {
        id: crypto.randomUUID(),
        date: today,
        category: ACTIVITY_METADATA[activityType].category,
        activityType,
        quantity,
        kgCO2e: calculateActivityEmission(activityType, quantity),
        loggedAt: Date.now(),
        ...(note ? { note } : {}),
      };

      setLog((prev) => ({
        ...prev,
        [today]: [...(prev[today] ?? []), entry],
      }));

      return entry;
    },
    [setLog]
  );

  /**
   * Removes an activity entry by ID from any date.
   *
   * @param id - The ActivityEntry.id to remove
   * @param date - The date key the entry belongs to
   */
  const removeActivity = useCallback(
    (id: string, date: string) => {
      setLog((prev) => ({
        ...prev,
        [date]: (prev[date] ?? []).filter((e) => e.id !== id),
      }));
    },
    [setLog]
  );

  /**
   * Returns all activity entries for today.
   */
  const getTodayActivities = useCallback((): ActivityEntry[] => {
    const today = getTodayKey();
    return log[today] ?? [];
  }, [log]);

  /**
   * Returns activity entries for a specific date.
   *
   * @param date - ISO date string YYYY-MM-DD
   */
  const getActivitiesByDate = useCallback(
    (date: string): ActivityEntry[] => log[date] ?? [],
    [log]
  );

  /** All date keys that have entries */
  const allDates = useMemo(() => Object.keys(log).sort().reverse(), [log]);

  return {
    log,
    logActivity,
    removeActivity,
    getTodayActivities,
    getActivitiesByDate,
    allDates,
  };
}
