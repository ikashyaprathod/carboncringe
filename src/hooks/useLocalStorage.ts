/**
 * @fileoverview Generic SSR-safe localStorage hook.
 * Handles JSON serialization and hydration safely.
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { getItem, setItem } from "@/utils/storage";

/**
 * A React hook that syncs state with localStorage.
 * SSR-safe: uses initialValue on the server, reads localStorage on client.
 *
 * @param key - The localStorage key to use
 * @param initialValue - Default value if key is not in storage
 * @returns [value, setValue] tuple like useState
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // Read from localStorage after mount (client-side only)
  useEffect(() => {
    const item = getItem<T>(key);
    if (item !== null) {
      setStoredValue(item);
    }
  }, [key]);

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const next = typeof value === "function" ? (value as (p: T) => T)(prev) : value;
        setItem(key, next);
        return next;
      });
    },
    [key]
  );

  return [storedValue, setValue];
}
