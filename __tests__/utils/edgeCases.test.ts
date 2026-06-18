/**
 * @fileoverview Edge-case tests targeting score gaps:
 * - carbonCalculator boundary values
 * - validator message content length edge
 * - rate limiter exact boundary behavior
 * - barrel index exports are valid
 */

import {
  calculateActivityEmission,
  getImpactEquivalents,
  compareToAverage,
  formatFootprint,
  getTopCategory,
} from "@/utils/carbonCalculator";
import { GLOBAL_AVG_DAILY_KG, LOW_IMPACT_THRESHOLD_KG, EMISSION_FACTORS } from "@/utils/constants";
import { validateChatRequest } from "@/lib/validators";

// ─── carbonCalculator edge cases ─────────────────────────────────────────────

describe("calculateActivityEmission — edge cases", () => {
  it("returns 0 for zero quantity", () => {
    expect(calculateActivityEmission("car", 0)).toBe(0);
  });

  it("clamps negative quantity to 0", () => {
    expect(calculateActivityEmission("car", -10)).toBe(0);
  });

  it("returns 0 for zero-emission activities (bike, walk)", () => {
    expect(calculateActivityEmission("bike", 100)).toBe(0);
    expect(calculateActivityEmission("walk", 50)).toBe(0);
  });

  it("rounds to 2 decimal places", () => {
    // car: 0.192 × 3 = 0.576 → 0.58
    const result = calculateActivityEmission("car", 3);
    expect(result).toBe(0.58);
  });

  it("uses EMISSION_FACTORS constants — car matches defined factor", () => {
    const expected = Math.round(EMISSION_FACTORS.car.kgCO2ePerUnit * 10 * 100) / 100;
    expect(calculateActivityEmission("car", 10)).toBe(expected);
  });
});

describe("compareToAverage — uses GLOBAL_AVG_DAILY_KG constant", () => {
  it("returns 0 when footprint equals global average", () => {
    expect(compareToAverage(GLOBAL_AVG_DAILY_KG)).toBe(0);
  });

  it("returns negative percentage when below average (good)", () => {
    expect(compareToAverage(LOW_IMPACT_THRESHOLD_KG)).toBeLessThan(0);
  });

  it("returns positive percentage when above average (bad)", () => {
    expect(compareToAverage(GLOBAL_AVG_DAILY_KG * 2)).toBeGreaterThan(0);
  });

  it("returns 0 when averageKg is 0 (division guard)", () => {
    expect(compareToAverage(10, 0)).toBe(0);
  });
});

describe("formatFootprint", () => {
  it("formats kg under 1000 as decimal string", () => {
    expect(formatFootprint(12.3)).toBe("12.3 kg");
  });

  it("converts to tonnes when >= 1000", () => {
    expect(formatFootprint(1000)).toBe("1.00 tonnes");
    expect(formatFootprint(2500)).toBe("2.50 tonnes");
  });

  it("handles zero", () => {
    expect(formatFootprint(0)).toBe("0.0 kg");
  });
});

describe("getImpactEquivalents — zero guard", () => {
  it("returns all zeros for 0 kg", () => {
    const eq = getImpactEquivalents(0);
    expect(eq.trees).toBe(0);
    expect(eq.kmNotDriven).toBe(0);
    expect(eq.phoneCharges).toBe(0);
    expect(eq.netflixHours).toBe(0);
  });

  it("clamps negative to 0", () => {
    const eq = getImpactEquivalents(-5);
    expect(eq.trees).toBe(0);
  });
});

describe("getTopCategory", () => {
  it("returns the category with highest value", () => {
    const breakdown = { transport: 1.0, food: 5.5, energy: 2.0, shopping: 0.5 };
    expect(getTopCategory(breakdown)).toBe("food");
  });

  it("returns transport when all values are equal (stable default)", () => {
    const breakdown = { transport: 3, food: 3, energy: 3, shopping: 3 };
    // transport is the starting accumulator — ties resolve to first entry
    expect(getTopCategory(breakdown)).toBe("transport");
  });
});

// ─── validator edge cases ─────────────────────────────────────────────────────

describe("validateChatRequest — message content length boundary", () => {
  it("accepts a message with exactly 2000 characters", () => {
    const result = validateChatRequest({
      messages: [{ role: "user", content: "a".repeat(2000) }],
      currentFootprint: 5,
      recentActivities: [],
    });
    expect(result.valid).toBe(true);
  });

  it("rejects a message with 2001 characters", () => {
    const result = validateChatRequest({
      messages: [{ role: "user", content: "a".repeat(2001) }],
      currentFootprint: 5,
      recentActivities: [],
    });
    expect(result.valid).toBe(false);
  });

  it("accepts exactly 50 messages (boundary)", () => {
    const messages = Array(50).fill({ role: "user", content: "hi" });
    const result = validateChatRequest({
      messages,
      currentFootprint: 5,
      recentActivities: [],
    });
    expect(result.valid).toBe(true);
  });

  it("rejects 51 messages (over limit)", () => {
    const messages = Array(51).fill({ role: "user", content: "hi" });
    const result = validateChatRequest({
      messages,
      currentFootprint: 5,
      recentActivities: [],
    });
    expect(result.valid).toBe(false);
  });
});
