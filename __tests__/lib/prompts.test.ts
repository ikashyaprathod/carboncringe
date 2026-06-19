import {
  buildSystemPrompt,
  buildRoastPrompt,
  buildInsightsPrompt,
  buildSuggestionsPrompt,
  buildChatContextPrompt,
} from "@/lib/prompts";
import type { ActivityEntry, WeeklyReport } from "@/types";

describe("Prompt Builders", () => {
  it("builds the system persona prompt containing tone rules", () => {
    const prompt = buildSystemPrompt();
    expect(prompt).toContain("You are CarbonCringe's AI companion.");
    expect(prompt).toContain("Dry, sarcastic, and understated humor.");
    expect(prompt).toContain("BANNED PHRASES:");
  });

  it("builds the roast analysis prompt with logged activities", () => {
    const entries: ActivityEntry[] = [
      {
        id: "1",
        date: "2026-06-18",
        category: "transport",
        activityType: "car",
        quantity: 15,
        kgCO2e: 2.88,
        loggedAt: Date.now(),
      },
    ];
    const prompt = buildRoastPrompt(2.88, entries, "transport");
    expect(prompt).toContain("Today's carbon footprint: 2.9 kg CO2e");
    expect(prompt).toContain("car (15 km) = 2.88 kg CO2e");
    expect(prompt).toContain("Biggest category: Transport 🚗");
  });

  it("builds the weekly insights template", () => {
    const report: WeeklyReport = {
      totalKgCO2e: 45.5,
      avgDailyKgCO2e: 6.5,
      breakdown: { transport: 20, food: 15, energy: 5, shopping: 5.5 },
      topCategory: "transport",
      days: [
        {
          date: "2026-06-18",
          entries: [],
          totalKgCO2e: 6.5,
          breakdown: { transport: 2, food: 2, energy: 1, shopping: 1.5 },
        },
      ],
    };
    const prompt = buildInsightsPrompt(report);
    expect(prompt).toContain("Total: 45.5 kg CO2e");
    expect(prompt).toContain("Daily average: 6.5 kg CO2e");
    expect(prompt).toContain("Transport: 20.0 kg");
  });

  it("builds suggestions prompt requesting JSON format output", () => {
    const report: WeeklyReport = {
      totalKgCO2e: 45.5,
      avgDailyKgCO2e: 6.5,
      breakdown: { transport: 20, food: 15, energy: 5, shopping: 5.5 },
      topCategory: "transport",
      days: [],
    };
    const prompt = buildSuggestionsPrompt(report, ["123"]);
    expect(prompt).toContain("My average: 6.5 kg CO2e/day");
    expect(prompt).toContain("Already doing: 123");
    expect(prompt).toContain("Format as JSON array:");
  });

  it("builds chat context text correctly", () => {
    const entries: ActivityEntry[] = [
      {
        id: "1",
        date: "2026-06-18",
        category: "food",
        activityType: "meat_meal",
        quantity: 1,
        kgCO2e: 7.7,
        loggedAt: Date.now(),
      },
    ];
    const prompt = buildChatContextPrompt(7.7, entries);
    expect(prompt).toContain("User's footprint today is 7.7 kg CO2e");
    expect(prompt).toContain("meat meal (1 meal)");
  });
});
