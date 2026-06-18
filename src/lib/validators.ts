/**
 * @fileoverview Request validators for all API routes.
 * Validates shape and types of incoming request bodies
 * without Zod — uses typed guard functions for zero extra dependencies.
 */

import type {
  AnalyzeRequest,
  ChatRequest,
  SuggestionsRequest,
  ValidationResult,
  ActivityEntry,
  ActivityCategory,
  ActivityType,
} from "@/types";

// ─── Type Guards ──────────────────────────────────────────────────────────────

/** Valid activity categories */
const VALID_CATEGORIES: readonly ActivityCategory[] = [
  "transport",
  "food",
  "energy",
  "shopping",
];

/** Valid activity types */
const VALID_ACTIVITY_TYPES: readonly ActivityType[] = [
  "car", "bus", "bike", "walk", "flight_short", "flight_long",
  "meat_meal", "vegetarian_meal", "vegan_meal", "food_delivery",
  "ac_usage", "electric_appliance", "heating",
  "online_order", "fast_fashion", "secondhand", "grocery",
];

/**
 * Checks if a value is a valid ActivityCategory.
 * @param value - Value to check
 */
function isActivityCategory(value: unknown): value is ActivityCategory {
  return VALID_CATEGORIES.includes(value as ActivityCategory);
}

/**
 * Checks if a value is a valid ActivityType.
 * @param value - Value to check
 */
function isActivityType(value: unknown): value is ActivityType {
  return VALID_ACTIVITY_TYPES.includes(value as ActivityType);
}

/**
 * Checks if an object is a valid ActivityEntry.
 * @param value - Value to validate
 */
function isActivityEntry(value: unknown): value is ActivityEntry {
  if (typeof value !== "object" || value === null) return false;
  const obj = value as Record<string, unknown>;

  return (
    typeof obj["id"] === "string" &&
    typeof obj["date"] === "string" &&
    isActivityCategory(obj["category"]) &&
    isActivityType(obj["activityType"]) &&
    typeof obj["quantity"] === "number" &&
    obj["quantity"] >= 0 &&
    typeof obj["kgCO2e"] === "number" &&
    obj["kgCO2e"] >= 0 &&
    typeof obj["loggedAt"] === "number"
  );
}

// ─── Route Validators ─────────────────────────────────────────────────────────

/**
 * Validates the request body for POST /api/analyze.
 *
 * @param body - Raw parsed request body
 * @returns ValidationResult with typed data or error message
 */
export function validateAnalyzeRequest(
  body: unknown
): ValidationResult<AnalyzeRequest> {
  if (typeof body !== "object" || body === null) {
    return { valid: false, error: "Request body must be a JSON object" };
  }

  const obj = body as Record<string, unknown>;

  if (!Array.isArray(obj["activities"])) {
    return { valid: false, error: "activities must be an array" };
  }

  if (obj["activities"].length === 0) {
    return { valid: false, error: "activities array cannot be empty" };
  }

  if (obj["activities"].length > 50) {
    return { valid: false, error: "activities array cannot exceed 50 entries" };
  }

  for (const entry of obj["activities"]) {
    if (!isActivityEntry(entry)) {
      return { valid: false, error: "One or more activity entries are invalid" };
    }
  }

  if (typeof obj["date"] !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(obj["date"])) {
    return { valid: false, error: "date must be a string in YYYY-MM-DD format" };
  }

  return {
    valid: true,
    data: {
      activities: obj["activities"] as ActivityEntry[],
      date: obj["date"],
    },
  };
}

/**
 * Validates the request body for POST /api/chat.
 *
 * @param body - Raw parsed request body
 * @returns ValidationResult with typed data or error message
 */
export function validateChatRequest(
  body: unknown
): ValidationResult<ChatRequest> {
  if (typeof body !== "object" || body === null) {
    return { valid: false, error: "Request body must be a JSON object" };
  }

  const obj = body as Record<string, unknown>;

  if (!Array.isArray(obj["messages"])) {
    return { valid: false, error: "messages must be an array" };
  }

  if (obj["messages"].length > 50) {
    return { valid: false, error: "messages array cannot exceed 50 entries" };
  }

  for (const msg of obj["messages"]) {
    if (typeof msg !== "object" || msg === null) {
      return { valid: false, error: "Each message must be an object" };
    }
    const m = msg as Record<string, unknown>;
    if (!["user", "assistant", "system"].includes(m["role"] as string)) {
      return { valid: false, error: "Message role must be user, assistant, or system" };
    }
    if (typeof m["content"] !== "string" || m["content"].length > 2000) {
      return { valid: false, error: "Message content must be a string under 2000 chars" };
    }
  }

  if (
    typeof obj["currentFootprint"] !== "number" ||
    obj["currentFootprint"] < 0
  ) {
    return { valid: false, error: "currentFootprint must be a non-negative number" };
  }

  if (!Array.isArray(obj["recentActivities"])) {
    return { valid: false, error: "recentActivities must be an array" };
  }

  return {
    valid: true,
    data: {
      messages: obj["messages"] as ChatRequest["messages"],
      currentFootprint: obj["currentFootprint"],
      recentActivities: obj["recentActivities"] as ActivityEntry[],
    },
  };
}

/**
 * Validates the request body for POST /api/suggestions.
 *
 * @param body - Raw parsed request body
 * @returns ValidationResult with typed data or error message
 */
export function validateSuggestionsRequest(
  body: unknown
): ValidationResult<SuggestionsRequest> {
  if (typeof body !== "object" || body === null) {
    return { valid: false, error: "Request body must be a JSON object" };
  }

  const obj = body as Record<string, unknown>;

  if (typeof obj["weeklyReport"] !== "object" || obj["weeklyReport"] === null) {
    return { valid: false, error: "weeklyReport must be an object" };
  }

  if (!Array.isArray(obj["completedActionIds"])) {
    return { valid: false, error: "completedActionIds must be an array" };
  }

  for (const id of obj["completedActionIds"]) {
    if (typeof id !== "string") {
      return { valid: false, error: "Each completedActionId must be a string" };
    }
  }

  return {
    valid: true,
    data: {
      weeklyReport: obj["weeklyReport"] as SuggestionsRequest["weeklyReport"],
      completedActionIds: obj["completedActionIds"] as string[],
    },
  };
}
