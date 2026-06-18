/**
 * @fileoverview Input sanitization utilities.
 * Prevents XSS, prompt injection, and oversized payloads
 * before any user input reaches AI API calls or storage.
 */

/** Maximum character length for user chat messages */
const MAX_CHAT_INPUT_LENGTH = 500;

/** Maximum character length for activity notes */
const MAX_NOTE_LENGTH = 200;

/** Maximum quantity value for any single activity */
const MAX_QUANTITY = 100_000;

/** Minimum quantity value — must be positive */
const MIN_QUANTITY = 0;

/**
 * Sanitizes a raw user text input string.
 * - Strips HTML tags to prevent XSS
 * - Removes potential prompt injection patterns
 * - Trims whitespace
 * - Clamps to max length
 *
 * @param input - Raw string from user input field
 * @param maxLength - Maximum allowed length (defaults to MAX_CHAT_INPUT_LENGTH)
 * @returns Sanitized, safe string
 */
export function sanitizeUserInput(
  input: string,
  maxLength: number = MAX_CHAT_INPUT_LENGTH
): string {
  if (typeof input !== "string") return "";

  return input
    .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, "") // Strip script tags and their contents
    .replace(/<[^>]*>/g, "") // Strip remaining HTML tags
    .replace(/javascript:/gi, "") // Block JS protocol
    .replace(/on\w+\s*=/gi, "") // Strip event handlers
    .replace(/\[INST\]|\[\/INST\]|<s>|<\/s>/gi, "") // Strip LLM injection tokens
    .replace(/system:|assistant:|user:/gi, "") // Strip role injection
    .trim()
    .slice(0, maxLength);
}

/**
 * Sanitizes a numeric quantity value for activity logging.
 * Clamps to valid range and rounds to 1 decimal place.
 *
 * @param quantity - Raw numeric input
 * @returns Safe, clamped number
 */
export function sanitizeQuantity(quantity: unknown): number {
  const num = typeof quantity === "number" ? quantity : parseFloat(String(quantity));
  if (!isFinite(num) || isNaN(num)) return 0;
  return Math.round(Math.min(MAX_QUANTITY, Math.max(MIN_QUANTITY, num)) * 10) / 10;
}

/**
 * Sanitizes an optional activity note.
 * Same as user input but with shorter max length.
 *
 * @param note - Raw note string (may be undefined)
 * @returns Sanitized note or undefined
 */
export function sanitizeNote(note: unknown): string | undefined {
  if (note === undefined || note === null || note === "") return undefined;
  if (typeof note !== "string") return undefined;
  return sanitizeUserInput(note, MAX_NOTE_LENGTH);
}

/**
 * Sanitizes a date string to ensure it's a valid YYYY-MM-DD format.
 * Rejects anything that doesn't match the pattern.
 *
 * @param date - Raw date string
 * @returns Valid date string or today's date as fallback
 */
export function sanitizeDate(date: unknown): string {
  if (typeof date !== "string") return getTodayFallback();
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) return getTodayFallback();

  const parsed = new Date(date);
  if (isNaN(parsed.getTime())) return getTodayFallback();

  // Reject future dates more than 1 day ahead (clock skew tolerance)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (parsed > tomorrow) return getTodayFallback();

  return date;
}

/**
 * Returns today's date as YYYY-MM-DD fallback.
 * Kept internal — use date.ts for general date utilities.
 */
function getTodayFallback(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
