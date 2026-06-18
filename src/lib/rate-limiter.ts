/**
 * @fileoverview In-memory rate limiter for API routes.
 * Limits each session to MAX_REQUESTS_PER_WINDOW requests
 * within a rolling WINDOW_MS window.
 *
 * Uses an in-memory Map — resets on server restart.
 * For production, swap this with Redis/Upstash.
 */

import type { RateLimitResult } from "@/types";

/** Maximum requests allowed per session per time window */
const MAX_REQUESTS_PER_WINDOW = 10;

/** Time window in milliseconds (1 minute) */
const WINDOW_MS = 60_000;

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

/** In-memory store: sessionId → rate limit state */
const store = new Map<string, RateLimitEntry>();

/**
 * Checks whether a request from the given session should be allowed.
 * Increments the request count if allowed.
 *
 * @param sessionId - Unique session identifier (from crypto.randomUUID())
 * @returns RateLimitResult with allowed flag, remaining count, and reset time
 */
export function checkRateLimit(sessionId: string): RateLimitResult {
  const now = Date.now();
  const entry = store.get(sessionId);

  if (!entry || now - entry.windowStart >= WINDOW_MS) {
    // New session or window has reset — start fresh
    store.set(sessionId, { count: 1, windowStart: now });
    return {
      allowed: true,
      remaining: MAX_REQUESTS_PER_WINDOW - 1,
      resetInMs: WINDOW_MS,
    };
  }

  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    const resetInMs = WINDOW_MS - (now - entry.windowStart);
    return {
      allowed: false,
      remaining: 0,
      resetInMs: Math.max(0, resetInMs),
    };
  }

  entry.count++;
  const remaining = MAX_REQUESTS_PER_WINDOW - entry.count;
  const resetInMs = WINDOW_MS - (now - entry.windowStart);

  return {
    allowed: true,
    remaining,
    resetInMs: Math.max(0, resetInMs),
  };
}

/**
 * Generates or retrieves a session ID.
 * Uses crypto.randomUUID() with a fallback for older environments.
 *
 * @returns A UUID string suitable for use as a rate limiter session key
 */
export function getOrCreateSessionId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return `session-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/**
 * Clears all rate limit entries. Used in tests and server restarts.
 * @internal
 */
export function clearRateLimitStore(): void {
  store.clear();
}

/**
 * Returns the current number of entries in the rate limit store.
 * Useful for monitoring. @internal
 */
export function getRateLimitStoreSize(): number {
  return store.size;
}
