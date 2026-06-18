import { getCurrentStreak, getLongestStreak, isLowImpactDay } from "@/utils/streak";
import type { DailyLog } from "@/types";

const makeLog = (date: string, totalKgCO2e: number): DailyLog => ({
  date,
  entries: [],
  totalKgCO2e,
  breakdown: { transport: 0, food: 0, energy: 0, shopping: totalKgCO2e },
});

describe("isLowImpactDay", () => {
  it("returns true for day below 5 kg", () => {
    expect(isLowImpactDay(makeLog("2024-03-15", 4.9))).toBe(true);
  });

  it("returns false for day at exactly 5 kg", () => {
    expect(isLowImpactDay(makeLog("2024-03-15", 5.0))).toBe(false);
  });

  it("returns false for high emission day", () => {
    expect(isLowImpactDay(makeLog("2024-03-15", 20))).toBe(false);
  });
});

describe("getLongestStreak", () => {
  it("returns 0 for empty logs", () => {
    expect(getLongestStreak([])).toBe(0);
  });

  it("returns 3 for 3 consecutive low-impact days", () => {
    const logs = [
      makeLog("2024-03-13", 2),
      makeLog("2024-03-14", 3),
      makeLog("2024-03-15", 4),
    ];
    expect(getLongestStreak(logs)).toBe(3);
  });

  it("resets streak on high emission day", () => {
    const logs = [
      makeLog("2024-03-13", 2),
      makeLog("2024-03-14", 20), // breaks streak
      makeLog("2024-03-15", 3),
    ];
    expect(getLongestStreak(logs)).toBe(1);
  });

  it("handles non-consecutive dates", () => {
    const logs = [
      makeLog("2024-03-13", 2),
      makeLog("2024-03-15", 3), // gap on 14th
    ];
    expect(getLongestStreak(logs)).toBe(1);
  });
});
