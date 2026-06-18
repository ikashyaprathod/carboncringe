/**
 * @fileoverview Core carbon footprint calculation functions.
 * All functions are pure (no side effects) and fully typed.
 * Uses standard emission factors from DEFRA / Poore & Nemecek.
 *
 * ⚠️ Disclaimer: Values are estimates based on global averages.
 */

import type {
  ActivityEntry,
  ActivityType,
  DailyLog,
  FootprintBreakdown,
  ImpactEquivalent,
} from "@/types";
import {
  EMISSION_FACTORS,
  ACTIVITY_METADATA,
  KG_CO2_PER_TREE_YEAR,
  KG_CO2_PER_CAR_KM,
  KG_CO2_PER_PHONE_CHARGE,
  KG_CO2_PER_NETFLIX_HOUR,
} from "@/utils/constants";

/**
 * Calculates the CO2e (kg) for a single activity.
 *
 * @param activityType - The type of activity performed
 * @param quantity - How many units (km, meals, hours, orders)
 * @returns Emission in kg CO2e, clamped to 0 minimum
 */
export function calculateActivityEmission(
  activityType: ActivityType,
  quantity: number
): number {
  const factor = EMISSION_FACTORS[activityType];
  const safeQuantity = Math.max(0, quantity);
  return Math.round(factor.kgCO2ePerUnit * safeQuantity * 100) / 100;
}

/**
 * Builds an empty zero-value footprint breakdown.
 *
 * @returns FootprintBreakdown with all categories at 0
 */
function createEmptyBreakdown(): FootprintBreakdown {
  return { transport: 0, food: 0, energy: 0, shopping: 0 };
}

/**
 * Calculates the total carbon footprint and category breakdown
 * from a list of activity entries.
 *
 * @param entries - Array of ActivityEntry objects for a single day
 * @returns Object containing total kg CO2e and category breakdown
 */
export function calculateDailyFootprint(entries: ActivityEntry[]): {
  totalKgCO2e: number;
  breakdown: FootprintBreakdown;
} {
  const breakdown = createEmptyBreakdown();

  for (const entry of entries) {
    const category = ACTIVITY_METADATA[entry.activityType].category;
    breakdown[category] = Math.round((breakdown[category] + entry.kgCO2e) * 100) / 100;
  }

  const totalKgCO2e =
    Math.round(
      (breakdown.transport +
        breakdown.food +
        breakdown.energy +
        breakdown.shopping) *
        100
    ) / 100;

  return { totalKgCO2e, breakdown };
}

/**
 * Aggregates multiple daily logs into a weekly total and breakdown.
 *
 * @param days - Array of DailyLog objects (up to 7)
 * @returns Total CO2e, average daily CO2e, and combined category breakdown
 */
export function calculateWeeklyTotal(days: DailyLog[]): {
  totalKgCO2e: number;
  avgDailyKgCO2e: number;
  breakdown: FootprintBreakdown;
} {
  if (days.length === 0) {
    return { totalKgCO2e: 0, avgDailyKgCO2e: 0, breakdown: createEmptyBreakdown() };
  }

  const breakdown = createEmptyBreakdown();

  for (const day of days) {
    breakdown.transport = Math.round((breakdown.transport + day.breakdown.transport) * 100) / 100;
    breakdown.food = Math.round((breakdown.food + day.breakdown.food) * 100) / 100;
    breakdown.energy = Math.round((breakdown.energy + day.breakdown.energy) * 100) / 100;
    breakdown.shopping = Math.round((breakdown.shopping + day.breakdown.shopping) * 100) / 100;
  }

  const totalKgCO2e =
    Math.round(
      (breakdown.transport + breakdown.food + breakdown.energy + breakdown.shopping) * 100
    ) / 100;

  const avgDailyKgCO2e = Math.round((totalKgCO2e / days.length) * 100) / 100;

  return { totalKgCO2e, avgDailyKgCO2e, breakdown };
}

/**
 * Returns the activity category with the highest total CO2e.
 *
 * @param breakdown - FootprintBreakdown object
 * @returns The category string with the highest value
 */
export function getTopCategory(
  breakdown: FootprintBreakdown
): keyof FootprintBreakdown {
  return (Object.keys(breakdown) as Array<keyof FootprintBreakdown>).reduce(
    (top, category) => (breakdown[category] > breakdown[top] ? category : top),
    "transport" as keyof FootprintBreakdown
  );
}

/**
 * Converts a kg CO2e value into relatable real-world equivalents.
 * Makes footprint data emotionally tangible — not just a number.
 *
 * @param kgCO2e - Total carbon emissions in kg CO2e
 * @returns ImpactEquivalent with trees, km, phone charges, Netflix hours
 */
export function getImpactEquivalents(kgCO2e: number): ImpactEquivalent {
  const safeKg = Math.max(0, kgCO2e);
  return {
    trees: Math.round((safeKg / KG_CO2_PER_TREE_YEAR) * 10) / 10,
    kmNotDriven: Math.round(safeKg / KG_CO2_PER_CAR_KM),
    phoneCharges: Math.round(safeKg / KG_CO2_PER_PHONE_CHARGE),
    netflixHours: Math.round(safeKg / KG_CO2_PER_NETFLIX_HOUR),
  };
}

/**
 * Formats a kg CO2e value as a human-readable string.
 *
 * @param kgCO2e - Value in kg CO2e
 * @returns Formatted string e.g. "12.3 kg" or "1.2 tonnes"
 */
export function formatFootprint(kgCO2e: number): string {
  if (kgCO2e >= 1000) {
    return `${(kgCO2e / 1000).toFixed(2)} tonnes`;
  }
  return `${kgCO2e.toFixed(1)} kg`;
}

/**
 * Returns a percentage of how much a footprint exceeds or beats
 * the global daily average (13.5 kg CO2e/day).
 *
 * @param kgCO2e - Today's footprint
 * @param averageKg - The benchmark average (defaults to global avg)
 * @returns Signed percentage — negative means below average (good)
 */
export function compareToAverage(
  kgCO2e: number,
  averageKg: number = 13.5
): number {
  if (averageKg === 0) return 0;
  return Math.round(((kgCO2e - averageKg) / averageKg) * 100);
}
