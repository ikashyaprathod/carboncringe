import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merges and utility compiles multiple tailwind or custom CSS classes safely.
 *
 * @param inputs - Array of class names or conditional class objects
 * @returns Combined and resolved className string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
