/**
 * @fileoverview Generic localStorage CRUD utilities with type safety.
 * All reads are cached in-call; no raw JSON exposed outside this module.
 * SSR-safe: all functions check for `window` before accessing localStorage.
 */

import { STORAGE_KEYS } from "@/utils/constants";

/**
 * Retrieves a typed value from localStorage.
 * Returns `null` if key doesn't exist or JSON parsing fails.
 *
 * @param key - The localStorage key to read from
 * @returns The parsed value or null
 */
export function getItem<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/**
 * Stores a typed value in localStorage as JSON.
 * No-ops silently if localStorage is unavailable (private browsing, quota exceeded).
 *
 * @param key - The localStorage key to write to
 * @param value - The value to serialize and store
 * @returns `true` if successful, `false` on error
 */
export function setItem<T>(key: string, value: T): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

/**
 * Removes a single key from localStorage.
 *
 * @param key - The localStorage key to remove
 */
export function removeItem(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Silently fail — not critical
  }
}

/**
 * Clears all CarbonCringe keys from localStorage.
 * Leaves other app data (non-cc_ prefixed) untouched.
 */
export function clearAllAppData(): void {
  if (typeof window === "undefined") return;
  const carbonCringeKeys = Object.values(STORAGE_KEYS);
  carbonCringeKeys.forEach((key) => {
    removeItem(key);
  });
}

/**
 * Returns the estimated size (in bytes) of all CarbonCringe localStorage data.
 * Useful for quota monitoring.
 *
 * @returns Approximate total bytes used
 */
export function getStorageSize(): number {
  if (typeof window === "undefined") return 0;
  return Object.values(STORAGE_KEYS).reduce((total, key) => {
    const item = window.localStorage.getItem(key);
    return total + (item ? item.length * 2 : 0); // UTF-16 = 2 bytes per char
  }, 0);
}
