/**
 * Streak counter with animated flame and count-up number.
 */

"use client";

import React from "react";
import { GlassCard } from "@/components/shared/GlassCard";
import { cn } from "@/lib/utils";

interface StreakCounterProps {
  currentStreak: number;
  longestStreak: number;
  totalLowImpactDays: number;
}

/**
 * StreakCounter — displays the current consecutive low-impact day streak.
 * Flame icon flickers via CSS animation. Number animates on change.
 *
 * @param currentStreak - Days in current streak
 * @param longestStreak - All-time best streak
 * @param totalLowImpactDays - All-time low-impact days
 */
export const StreakCounter = React.memo(function StreakCounter({
  currentStreak,
  longestStreak,
  totalLowImpactDays,
}: StreakCounterProps) {
  const isActive = currentStreak > 0;

  return (
    <GlassCard
      className="p-5"
      glowColor={isActive ? "rgba(255,217,61,0.15)" : undefined}
      aria-label={`Streak: ${currentStreak} consecutive low-impact days`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[var(--color-text-secondary)] text-xs font-medium uppercase tracking-wider mb-2">
            low-impact streak
          </p>
          <div className="flex items-end gap-2">
            <span
              className={cn(
                "text-5xl font-heading font-extrabold tabular-nums animate-count-up",
                isActive ? "stat-number-celebrate" : "text-[var(--color-text-muted)]"
              )}
              aria-live="polite"
            >
              {currentStreak}
            </span>
            <span className="text-[var(--color-text-secondary)] text-sm mb-1.5">
              {currentStreak === 1 ? "day" : "days"}
            </span>
          </div>
          {!isActive && (
            <p className="text-[var(--color-text-muted)] text-xs mt-1">
              log a day under 5kg to start 🌱
            </p>
          )}
        </div>

        {/* Flame icon */}
        <div className="text-right">
          <span
            className={cn("text-5xl select-none", isActive && "animate-flame")}
            aria-hidden="true"
            role="presentation"
          >
            {isActive ? "🔥" : "🌑"}
          </span>
        </div>
      </div>

      {/* Stats row */}
      <div
        className="flex gap-4 mt-4 pt-4"
        style={{ borderTop: "1px solid var(--glass-border)" }}
      >
        <div>
          <p className="text-[var(--color-text-muted)] text-[10px] uppercase tracking-wider">
            best streak
          </p>
          <p className="text-[var(--color-celebrate)] font-heading font-bold text-lg">
            {longestStreak}d
          </p>
        </div>
        <div>
          <p className="text-[var(--color-text-muted)] text-[10px] uppercase tracking-wider">
            total low-impact
          </p>
          <p className="text-[var(--color-primary)] font-heading font-bold text-lg">
            {totalLowImpactDays}d
          </p>
        </div>
      </div>
    </GlassCard>
  );
});
