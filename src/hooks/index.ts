/**
 * @fileoverview Barrel export for all custom React hooks.
 * Import hooks from "@/hooks" instead of individual file paths
 * for cleaner, more maintainable import statements.
 *
 * @example
 * import { useFootprint, useActivityLog } from "@/hooks";
 */

export { useActivityLog } from "./useActivityLog";
export { useChatHistory } from "./useChatHistory";
export { useChatThreads } from "./useChatThreads";
export { useDebounce } from "./useDebounce";
export { useFootprint } from "./useFootprint";
export { useLocalStorage } from "./useLocalStorage";
export { useStreak } from "./useStreak";
