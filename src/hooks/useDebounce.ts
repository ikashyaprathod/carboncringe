/**
 * @fileoverview Debounce hook — delays updating a value until input has settled.
 */

"use client";

import { useState, useEffect } from "react";

/**
 * Returns a debounced version of the provided value.
 * The debounced value only updates after the specified delay has elapsed
 * without any new changes to the input value.
 *
 * @param value - The value to debounce
 * @param delay - Debounce delay in milliseconds (default: 500ms)
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
