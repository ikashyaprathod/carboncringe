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

import { POST } from "@/app/api/personalize/route";
import { NextRequest } from "next/server";
import { checkRateLimit } from "@/lib/rate-limiter";

jest.mock("@/lib/rate-limiter", () => ({
  checkRateLimit: jest.fn(() => ({ allowed: true, remaining: 10, resetInMs: 1000 })),
}));

describe("POST /api/personalize", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("returns 400 if breakdown is missing", async () => {
    const req = new NextRequest("http://localhost:3000/api/personalize", {
      method: "POST",
      body: JSON.stringify({}),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json() as { error: string };
    expect(data.error).toContain("breakdown field is required");
  });

  it("returns 400 if breakdown has invalid categories", async () => {
    const req = new NextRequest("http://localhost:3000/api/personalize", {
      method: "POST",
      body: JSON.stringify({
        breakdown: { transport: "invalid", food: 5, energy: 2, shopping: 1 },
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json() as { error: string };
    expect(data.error).toContain("must be a number");
  });

  it("returns ranked actions fallback list when NVIDIA_API_KEY is not set", async () => {
    delete process.env.NVIDIA_API_KEY;

    const req = new NextRequest("http://localhost:3000/api/personalize", {
      method: "POST",
      body: JSON.stringify({
        breakdown: { transport: 10, food: 2, energy: 3, shopping: 1 },
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json() as { rankedActions: { id: string; reason: string }[] };
    expect(data.rankedActions).toBeDefined();
    expect(data.rankedActions.length).toBeGreaterThan(0);
    
    // Transport is the highest category, so transport items should be ranked first in static fallback
    const transportReasons = data.rankedActions
      .slice(0, 5)
      .map(item => item.reason.toLowerCase());
    
    // Check that at least one of the top ranked items has transport reason
    const hasTransport = transportReasons.some(r => r.includes("transport"));
    expect(hasTransport).toBe(true);
  });
});
