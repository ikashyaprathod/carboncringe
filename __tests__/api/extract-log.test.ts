/**
 * @jest-environment node
 */

if (typeof global.Request === "undefined") {
  global.Request = globalThis.Request || require("undici").Request;
}
if (typeof global.Response === "undefined") {
  global.Response = globalThis.Response || require("undici").Response;
}
if (typeof global.Headers === "undefined") {
  global.Headers = globalThis.Headers || require("undici").Headers;
}

import { POST } from "@/app/api/extract-log/route";
import { NextRequest } from "next/server";
import type { ExtractedActivity } from "@/types";

jest.mock("@/lib/rate-limiter", () => ({
  checkRateLimit: jest.fn(() => ({ allowed: true, remaining: 10, resetInMs: 1000 })),
}));

describe("POST /api/extract-log", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("returns 400 if message field is missing", async () => {
    const req = new NextRequest("http://localhost:3000/api/extract-log", {
      method: "POST",
      body: JSON.stringify({}),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json() as { error: string };
    expect(data.error).toContain("message field is required");
  });

  it("extracts driving and food delivery details in fallback mode", async () => {
    delete process.env.NVIDIA_API_KEY;

    const req = new NextRequest("http://localhost:3000/api/extract-log", {
      method: "POST",
      body: JSON.stringify({
        message: "drove 20km and ordered food delivery twice today",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json() as {
      detectedActivities: { category: string; activityType: string; quantity: number }[];
      confidence: string;
    };

    expect(data.confidence).toBe("high");
    expect(data.detectedActivities.length).toBe(2);

    const carActivity = data.detectedActivities.find(a => a.activityType === "car");
    expect(carActivity).toBeDefined();
    expect(carActivity?.quantity).toBe(20);

    const deliveryActivity = data.detectedActivities.find(a => a.activityType === "food_delivery");
    expect(deliveryActivity).toBeDefined();
    expect(deliveryActivity?.quantity).toBe(2);
  });

  it("returns empty extraction for completely vague messages", async () => {
    delete process.env.NVIDIA_API_KEY;

    const req = new NextRequest("http://localhost:3000/api/extract-log", {
      method: "POST",
      body: JSON.stringify({
        message: "hello there how are you",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json() as {
      detectedActivities: ExtractedActivity[];
      confidence: string;
    };

    expect(data.confidence).toBe("low");
    expect(data.detectedActivities).toEqual([]);
  });

  it("returns 400 if the body is invalid JSON", async () => {
    const req = new NextRequest("http://localhost:3000/api/extract-log", {
      method: "POST",
      body: "this-is-not-json",
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json() as { error: string };
    expect(data.error).toContain("Invalid JSON body");
  });

  it("returns 400 if message is not a string", async () => {
    const req = new NextRequest("http://localhost:3000/api/extract-log", {
      method: "POST",
      body: JSON.stringify({
        message: 12345,
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json() as { error: string };
    expect(data.error).toContain("message field is required");
  });

  it("falls back to heuristic extraction on API exception", async () => {
    process.env.NVIDIA_API_KEY = "dummy-key";
    
    // Force getClient to throw error by mocking its export or client structure
    const mockCompletionsCreate = jest.fn().mockRejectedValue(new Error("NVIDIA connection failed"));
    jest.mock("@/lib/nvidia", () => ({
      getNvidiaClient: () => ({
        chat: {
          completions: {
            create: mockCompletionsCreate,
          },
        },
      }),
      NVIDIA_MODEL: "nvidia/llama-3.3-nemotron-super-49b-v1.5",
    }));

    const req = new NextRequest("http://localhost:3000/api/extract-log", {
      method: "POST",
      body: JSON.stringify({
        message: "drove 30km today",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json() as {
      detectedActivities: ExtractedActivity[];
      confidence: string;
      note?: string;
    };

    expect(data.confidence).toBe("high");
    expect(data.detectedActivities.length).toBe(1);
    expect(data.detectedActivities[0]?.activityType).toBe("car");
    expect(data.detectedActivities[0]?.quantity).toBe(30);
    expect(data.note).toContain("API Error");
  });
});
