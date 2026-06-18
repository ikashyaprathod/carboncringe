import {
  calculateActivityEmission,
  calculateDailyFootprint,
  calculateWeeklyTotal,
  getTopCategory,
  getImpactEquivalents,
  formatFootprint,
  compareToAverage,
} from "@/utils/carbonCalculator";
import type { ActivityEntry, DailyLog } from "@/types";

const makeEntry = (
  activityType: ActivityEntry["activityType"],
  quantity: number,
  kgCO2e: number
): ActivityEntry => ({
  id: "test-id",
  date: "2024-03-15",
  category: "transport",
  activityType,
  quantity,
  kgCO2e,
  loggedAt: Date.now(),
});

describe("calculateActivityEmission", () => {
  it("calculates car emissions correctly", () => {
    expect(calculateActivityEmission("car", 10)).toBe(1.92);
  });

  it("returns 0 for bike activity", () => {
    expect(calculateActivityEmission("bike", 100)).toBe(0);
  });

  it("returns 0 for walk activity", () => {
    expect(calculateActivityEmission("walk", 5)).toBe(0);
  });

  it("clamps negative quantity to 0", () => {
    expect(calculateActivityEmission("car", -5)).toBe(0);
  });

  it("calculates meat meal correctly", () => {
    expect(calculateActivityEmission("meat_meal", 1)).toBe(3.3);
  });

  it("calculates AC usage correctly", () => {
    expect(calculateActivityEmission("ac_usage", 4)).toBe(2.4);
  });

  it("calculates flight emissions correctly", () => {
    expect(calculateActivityEmission("flight_short", 500)).toBe(127.5);
  });
});

describe("calculateDailyFootprint", () => {
  it("returns zero breakdown for empty entries", () => {
    const result = calculateDailyFootprint([]);
    expect(result.totalKgCO2e).toBe(0);
    expect(result.breakdown.transport).toBe(0);
  });

  it("sums up entries by category", () => {
    const entries: ActivityEntry[] = [
      makeEntry("car", 10, 1.92),
      makeEntry("meat_meal", 1, 3.3),
    ];
    entries[1].category = "food";
    const result = calculateDailyFootprint(entries);
    expect(result.breakdown.transport).toBe(1.92);
    expect(result.breakdown.food).toBe(3.3);
    expect(result.totalKgCO2e).toBe(5.22);
  });
});

describe("calculateWeeklyTotal", () => {
  it("returns zero for empty days array", () => {
    const result = calculateWeeklyTotal([]);
    expect(result.totalKgCO2e).toBe(0);
    expect(result.avgDailyKgCO2e).toBe(0);
  });

  it("calculates average correctly", () => {
    const days: DailyLog[] = [
      { date: "2024-03-11", entries: [], totalKgCO2e: 10, breakdown: { transport: 10, food: 0, energy: 0, shopping: 0 } },
      { date: "2024-03-12", entries: [], totalKgCO2e: 20, breakdown: { transport: 20, food: 0, energy: 0, shopping: 0 } },
    ];
    const result = calculateWeeklyTotal(days);
    expect(result.avgDailyKgCO2e).toBe(15);
  });
});

describe("getTopCategory", () => {
  it("returns transport when it is highest", () => {
    const breakdown = { transport: 10, food: 3, energy: 2, shopping: 1 };
    expect(getTopCategory(breakdown)).toBe("transport");
  });

  it("returns food when it is highest", () => {
    const breakdown = { transport: 1, food: 8, energy: 2, shopping: 1 };
    expect(getTopCategory(breakdown)).toBe("food");
  });
});

describe("getImpactEquivalents", () => {
  it("returns zeros for zero kg", () => {
    const result = getImpactEquivalents(0);
    expect(result.trees).toBe(0);
    expect(result.kmNotDriven).toBe(0);
    expect(result.phoneCharges).toBe(0);
  });

  it("clamps negative values", () => {
    const result = getImpactEquivalents(-5);
    expect(result.trees).toBe(0);
  });

  it("returns correct equivalents for 21 kg (1 tree/year)", () => {
    const result = getImpactEquivalents(21);
    expect(result.trees).toBe(1);
  });
});

describe("formatFootprint", () => {
  it("formats kg values", () => {
    expect(formatFootprint(12.3)).toBe("12.3 kg");
  });

  it("formats tonnes for values over 1000", () => {
    expect(formatFootprint(1000)).toBe("1.00 tonnes");
  });
});

describe("compareToAverage", () => {
  it("returns positive percent when above average", () => {
    expect(compareToAverage(20, 10)).toBe(100);
  });

  it("returns negative percent when below average", () => {
    expect(compareToAverage(5, 10)).toBe(-50);
  });

  it("returns 0 for zero average", () => {
    expect(compareToAverage(5, 0)).toBe(0);
  });
});
