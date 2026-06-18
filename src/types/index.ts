/**
 * @fileoverview All shared TypeScript interfaces and types for CarbonCringe.
 * Zero `any` types — strict mode enforced throughout.
 */

// ─── Activity & Logging ───────────────────────────────────────────────────────

/** Top-level activity categories tracked by the app */
export type ActivityCategory = "transport" | "food" | "energy" | "shopping";

/** Specific activity types within each category */
export type TransportActivity =
  | "car"
  | "bus"
  | "bike"
  | "walk"
  | "flight_short"
  | "flight_long";

export type FoodActivity =
  | "meat_meal"
  | "vegetarian_meal"
  | "vegan_meal"
  | "food_delivery";

export type EnergyActivity = "ac_usage" | "electric_appliance" | "heating";

export type ShoppingActivity =
  | "online_order"
  | "fast_fashion"
  | "secondhand"
  | "grocery";

export type ActivityType =
  | TransportActivity
  | FoodActivity
  | EnergyActivity
  | ShoppingActivity;

/**
 * A single logged activity entry.
 * Stored in localStorage keyed by date.
 */
export interface ActivityEntry {
  /** Unique identifier for this entry */
  id: string;
  /** ISO date string — YYYY-MM-DD */
  date: string;
  /** Top-level category */
  category: ActivityCategory;
  /** Specific activity type */
  activityType: ActivityType;
  /** Quantity (km, hours, count — depends on activity) */
  quantity: number;
  /** Calculated CO2e in kg at time of logging */
  kgCO2e: number;
  /** Unix timestamp when logged */
  loggedAt: number;
  /** Optional user note */
  note?: string;
}

/** Aggregated daily log — all entries for one date */
export interface DailyLog {
  /** ISO date string — YYYY-MM-DD */
  date: string;
  /** All entries logged for this day */
  entries: ActivityEntry[];
  /** Total CO2e for the day in kg */
  totalKgCO2e: number;
  /** Breakdown by category */
  breakdown: FootprintBreakdown;
}

/** Weekly aggregated report */
export interface WeeklyReport {
  /** Start date of the week — YYYY-MM-DD */
  weekStart: string;
  /** End date of the week — YYYY-MM-DD */
  weekEnd: string;
  /** Daily logs for the week */
  days: DailyLog[];
  /** Total CO2e for the week in kg */
  totalKgCO2e: number;
  /** Average daily CO2e */
  avgDailyKgCO2e: number;
  /** Category with the highest contribution */
  topCategory: ActivityCategory;
  /** Per-category totals */
  breakdown: FootprintBreakdown;
}

// ─── Footprint & Calculations ─────────────────────────────────────────────────

/** Carbon footprint broken down by category */
export interface FootprintBreakdown {
  transport: number;
  food: number;
  energy: number;
  shopping: number;
}

/** Relatable impact equivalents for a given CO2e value */
export interface ImpactEquivalent {
  /** Number of trees needed to absorb this CO2 in a year */
  trees: number;
  /** Equivalent km not driven in a car */
  kmNotDriven: number;
  /** Equivalent number of smartphone charges */
  phoneCharges: number;
  /** Hours of Netflix streaming equivalent */
  netflixHours: number;
}

/** Emission factor lookup — kg CO2e per unit */
export interface EmissionFactor {
  /** Activity type key */
  activityType: ActivityType;
  /** kg CO2e per unit (km, meal, hour, order) */
  kgCO2ePerUnit: number;
  /** Human-readable unit label */
  unit: string;
  /** Short description of what the factor represents */
  description: string;
}

// ─── AI & Chat ────────────────────────────────────────────────────────────────

/** Role in a chat conversation */
export type ChatRole = "user" | "assistant" | "system";

/** A single chat message */
export interface ChatMessage {
  /** Unique ID for React keys */
  id: string;
  /** Who sent this message */
  role: ChatRole;
  /** Message content — may be streaming (partial) */
  content: string;
  /** Unix timestamp */
  timestamp: number;
  /** Whether this message is currently streaming */
  isStreaming?: boolean;
}

/** A conversation thread consisting of multiple messages */
export interface ChatThread {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

/** AI-generated footprint analysis result */
export interface AIInsight {
  /** Short roast/celebration headline */
  headline: string;
  /** Longer explanation in relatable terms */
  explanation: string;
  /** One specific actionable tip */
  actionableTip: string;
  /** Overall vibe — roast or celebration */
  tone: "roast" | "celebrate" | "neutral";
  /** Which category was called out */
  highlightedCategory?: ActivityCategory;
}

/** A personalized suggestion from the AI */
export interface AISuggestion {
  /** Short title for the action */
  title: string;
  /** Why this matters for this user */
  rationale: string;
  /** Category it targets */
  category: ActivityCategory;
  /** Estimated weekly CO2e saving in kg */
  estimatedSavingKgCO2e: number;
}

// ─── Streak & Gamification ────────────────────────────────────────────────────

/** Streak tracking data */
export interface StreakData {
  /** Current consecutive low-impact days */
  currentStreak: number;
  /** All-time best streak */
  longestStreak: number;
  /** Date of last low-impact day — YYYY-MM-DD */
  lastLowImpactDate: string | null;
  /** Total low-impact days ever */
  totalLowImpactDays: number;
}

// ─── Actions Library ──────────────────────────────────────────────────────────

/** Effort level to adopt an action */
export type EffortLevel = "easy" | "medium" | "hard";

/** Impact magnitude of an action */
export type ImpactLevel = "low" | "medium" | "high";

/** A bite-sized habit from the actions library */
export interface ActionItem {
  /** Unique slug ID */
  id: string;
  /** Short action title */
  title: string;
  /** Longer description with context */
  description: string;
  /** Which category it targets */
  category: ActivityCategory;
  /** How hard it is to adopt */
  effort: EffortLevel;
  /** How much impact it has */
  impact: ImpactLevel;
  /** Estimated weekly CO2e saving in kg */
  estimatedWeeklySavingKgCO2e: number;
  /** Fun GenZ tip string */
  tip: string;
  /** Whether this is AI-recommended for the current user */
  isAIRecommended?: boolean;
}

/** User's completion state for an action */
export interface ActionCompletion {
  /** Action ID */
  actionId: string;
  /** Whether the user has checked this off */
  completed: boolean;
  /** Date completed — YYYY-MM-DD */
  completedDate?: string;
}

// ─── API Request / Response Types ─────────────────────────────────────────────

/** Request body for /api/analyze */
export interface AnalyzeRequest {
  activities: ActivityEntry[];
  date: string;
}

/** Response from /api/analyze */
export interface AnalyzeResponse {
  insight: AIInsight;
  totalKgCO2e: number;
  equivalents: ImpactEquivalent;
}

/** Request body for /api/chat */
export interface ChatRequest {
  messages: Pick<ChatMessage, "role" | "content">[];
  currentFootprint: number;
  recentActivities: ActivityEntry[];
}

/** Request body for /api/suggestions */
export interface SuggestionsRequest {
  weeklyReport: WeeklyReport;
  completedActionIds: string[];
}

/** Response from /api/suggestions */
export interface SuggestionsResponse {
  suggestions: AISuggestion[];
}

// ─── UI State Types ───────────────────────────────────────────────────────────

/** Toast notification */
export interface ToastNotification {
  id: string;
  message: string;
  type: "success" | "error" | "info" | "roast";
  durationMs?: number;
}

/** Rate limiter result */
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetInMs: number;
}

/** Validation result from lib/validators */
export interface ValidationResult<T> {
  valid: boolean;
  data?: T;
  error?: string;
}
