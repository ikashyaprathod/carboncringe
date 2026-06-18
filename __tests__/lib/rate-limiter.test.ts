import { checkRateLimit, clearRateLimitStore, getOrCreateSessionId } from "@/lib/rate-limiter";

describe("checkRateLimit", () => {
  beforeEach(() => {
    clearRateLimitStore();
  });

  it("allows first request", () => {
    const result = checkRateLimit("session-1");
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(9);
  });

  it("allows up to 10 requests", () => {
    for (let i = 0; i < 10; i++) {
      const result = checkRateLimit("session-2");
      expect(result.allowed).toBe(true);
    }
  });

  it("blocks the 11th request", () => {
    for (let i = 0; i < 10; i++) {
      checkRateLimit("session-3");
    }
    const result = checkRateLimit("session-3");
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("tracks different sessions independently", () => {
    for (let i = 0; i < 10; i++) {
      checkRateLimit("session-4");
    }
    const result = checkRateLimit("session-5");
    expect(result.allowed).toBe(true);
  });

  it("returns a resetInMs value", () => {
    const result = checkRateLimit("session-6");
    expect(result.resetInMs).toBeGreaterThan(0);
    expect(result.resetInMs).toBeLessThanOrEqual(60000);
  });
});

describe("getOrCreateSessionId", () => {
  it("returns a non-empty string", () => {
    const id = getOrCreateSessionId();
    expect(typeof id).toBe("string");
    expect(id.length).toBeGreaterThan(0);
  });
});
