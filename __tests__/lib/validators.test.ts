import { validateAnalyzeRequest, validateChatRequest, validateSuggestionsRequest } from "@/lib/validators";
import type { ActivityEntry } from "@/types";

const validEntry: ActivityEntry = {
  id: "test-id",
  date: "2024-03-15",
  category: "transport",
  activityType: "car",
  quantity: 10,
  kgCO2e: 1.92,
  loggedAt: Date.now(),
};

describe("validateAnalyzeRequest", () => {
  it("accepts a valid request", () => {
    const result = validateAnalyzeRequest({ activities: [validEntry], date: "2024-03-15" });
    expect(result.valid).toBe(true);
    expect(result.data).toBeDefined();
  });

  it("rejects null body", () => {
    const result = validateAnalyzeRequest(null);
    expect(result.valid).toBe(false);
  });

  it("rejects empty activities array", () => {
    const result = validateAnalyzeRequest({ activities: [], date: "2024-03-15" });
    expect(result.valid).toBe(false);
  });

  it("rejects invalid date format", () => {
    const result = validateAnalyzeRequest({ activities: [validEntry], date: "15/03/2024" });
    expect(result.valid).toBe(false);
  });

  it("rejects too many activities", () => {
    const activities = Array(51).fill(validEntry);
    const result = validateAnalyzeRequest({ activities, date: "2024-03-15" });
    expect(result.valid).toBe(false);
  });

  it("rejects invalid activity entry", () => {
    const result = validateAnalyzeRequest({
      activities: [{ id: "x", activityType: "invalid-type" }],
      date: "2024-03-15",
    });
    expect(result.valid).toBe(false);
  });
});

describe("validateChatRequest", () => {
  const validMessages = [{ role: "user" as const, content: "hello" }];

  it("accepts a valid chat request", () => {
    const result = validateChatRequest({
      messages: validMessages,
      currentFootprint: 5.0,
      recentActivities: [],
    });
    expect(result.valid).toBe(true);
  });

  it("rejects negative footprint", () => {
    const result = validateChatRequest({
      messages: validMessages,
      currentFootprint: -1,
      recentActivities: [],
    });
    expect(result.valid).toBe(false);
  });

  it("rejects invalid message role", () => {
    const result = validateChatRequest({
      messages: [{ role: "hacker", content: "evil" }],
      currentFootprint: 5,
      recentActivities: [],
    });
    expect(result.valid).toBe(false);
  });
});

describe("validateSuggestionsRequest", () => {
  it("accepts valid request", () => {
    const result = validateSuggestionsRequest({
      weeklyReport: { totalKgCO2e: 50 },
      completedActionIds: ["walk-short-trips"],
    });
    expect(result.valid).toBe(true);
  });

  it("rejects non-string action ids", () => {
    const result = validateSuggestionsRequest({
      weeklyReport: {},
      completedActionIds: [123],
    });
    expect(result.valid).toBe(false);
  });
});
