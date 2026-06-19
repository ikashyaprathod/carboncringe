import { getFrequentActivitiesForDay, getSuggestedActivities } from "@/utils/patternDetector";
import type { ActivityEntry } from "@/types";

const makeMockEntry = (
  id: string,
  date: string,
  activityType: ActivityEntry["activityType"],
  quantity: number
): ActivityEntry => ({
  id,
  date,
  category: "transport",
  activityType,
  quantity,
  kgCO2e: 1.0,
  loggedAt: Date.now(),
});

describe("patternDetector", () => {
  describe("getFrequentActivitiesForDay", () => {
    it("correctly aggregates activity counts on a specific day of week", () => {
      // Mondays are day index 1.
      // "2026-06-15" is a Monday.
      // "2026-06-16" is a Tuesday.
      // "2026-06-22" is a Monday.
      const logs: Record<string, ActivityEntry[]> = {
        "2026-06-15": [
          makeMockEntry("1", "2026-06-15", "car", 15),
          makeMockEntry("2", "2026-06-15", "meat_meal", 1),
        ],
        "2026-06-16": [
          makeMockEntry("3", "2026-06-16", "ac_usage", 5),
        ],
        "2026-06-22": [
          makeMockEntry("4", "2026-06-22", "car", 20),
        ],
      };

      const counts = getFrequentActivitiesForDay(logs, 1); // 1 = Monday
      expect(counts["car"]).toBe(2);
      expect(counts["meat_meal"]).toBe(1);
      expect(counts["ac_usage"]).toBeUndefined();
    });
  });

  describe("getSuggestedActivities", () => {
    it("returns empty suggestions if total logs count is under 5", () => {
      const logs: Record<string, ActivityEntry[]> = {
        "2026-06-15": [
          makeMockEntry("1", "2026-06-15", "car", 15),
        ],
      };
      const suggestions = getSuggestedActivities(logs, "2026-06-16");
      expect(suggestions).toEqual([]);
    });

    it("ranks based on day-of-week frequency and calculates average quantities", () => {
      // Mondays (index 1): 2026-06-15, 2026-06-22.
      // Tuesdays (index 2): 2026-06-16.
      // We want to suggest for "2026-06-29" (Monday).
      const logs: Record<string, ActivityEntry[]> = {
        "2026-06-15": [
          makeMockEntry("1", "2026-06-15", "car", 10),
          makeMockEntry("2", "2026-06-15", "meat_meal", 1),
        ],
        "2026-06-16": [
          makeMockEntry("3", "2026-06-16", "ac_usage", 4),
          makeMockEntry("4", "2026-06-16", "food_delivery", 1),
        ],
        "2026-06-22": [
          makeMockEntry("5", "2026-06-22", "car", 20),
        ],
      };

      const suggestions = getSuggestedActivities(logs, "2026-06-29"); // Monday

      // Expected overall count: car = 2, meat_meal = 1, ac_usage = 1, food_delivery = 1
      // Expected day specific (Monday): car = 2, meat_meal = 1, others = 0
      // Score (daySpecific * 3 + overall):
      // - car: 2 * 3 + 2 = 8
      // - meat_meal: 1 * 3 + 1 = 4
      // - ac_usage: 0 * 3 + 1 = 1
      // - food_delivery: 0 * 3 + 1 = 1
      // Ranks should be: car, meat_meal, then either ac_usage/food_delivery
      
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0]?.activityType).toBe("car");
      // Average car quantity = (10 + 20) / 2 = 15
      expect(suggestions[0]?.quantity).toBe(15);
      expect(suggestions[1]?.activityType).toBe("meat_meal");
      expect(suggestions[1]?.quantity).toBe(1);
    });

    it("filters out suggestions that are already logged today", () => {
      // 5 entries logged to satisfy threshold:
      const logs: Record<string, ActivityEntry[]> = {
        "2026-06-15": [
          makeMockEntry("1", "2026-06-15", "car", 10),
          makeMockEntry("2", "2026-06-15", "meat_meal", 1),
          makeMockEntry("3", "2026-06-15", "ac_usage", 2),
          makeMockEntry("4", "2026-06-15", "food_delivery", 1),
        ],
        "2026-06-16": [
          // Today (Tuesday)
          makeMockEntry("5", "2026-06-16", "car", 12),
        ],
      };

      const suggestions = getSuggestedActivities(logs, "2026-06-16");
      // "car" should be excluded because it is already logged in "2026-06-16"
      const types = suggestions.map((s) => s.activityType);
      expect(types).not.toContain("car");
      expect(types).toContain("meat_meal");
    });
  });
});
