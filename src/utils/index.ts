/**
 * @fileoverview Barrel export for all utility modules.
 * Import utilities from "@/utils" for cleaner imports.
 *
 * @example
 * import { calculateActivityEmission, getTodayKey } from "@/utils";
 */

export {
  calculateActivityEmission,
  calculateDailyFootprint,
  calculateWeeklyTotal,
  getTopCategory,
  getImpactEquivalents,
  formatFootprint,
  compareToAverage,
} from "./carbonCalculator";

export {
  STORAGE_KEYS,
  LOW_IMPACT_THRESHOLD_KG,
  GLOBAL_AVG_DAILY_KG,
  UK_AVG_DAILY_KG,
  KG_CO2_PER_TREE_YEAR,
  KG_CO2_PER_CAR_KM,
  KG_CO2_PER_PHONE_CHARGE,
  KG_CO2_PER_NETFLIX_HOUR,
  EMISSION_FACTORS,
  CATEGORY_METADATA,
  ACTIVITY_METADATA,
  ACTIONS_LIBRARY,
} from "./constants";

export {
  getTodayKey,
  toDateKey,
  fromDateKey,
  getLastNDays,
  getWeekRange,
  groupLogsByWeek,
  formatDisplayDate,
  isToday,
  daysBetween,
} from "./date";

export { calculateStreakData, getCurrentStreak, getLongestStreak, isLowImpactDay } from "./streak";

export { getFrequentActivitiesForDay, getSuggestedActivities } from "./patternDetector";
