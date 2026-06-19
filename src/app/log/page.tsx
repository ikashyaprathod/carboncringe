"use client";

import React, { useMemo } from "react";
import { ActivitySelector } from "@/components/logging/ActivitySelector";
import { SmartSuggestions } from "@/components/logging/SmartSuggestions";
import { GlassCard } from "@/components/shared/GlassCard";
import { useActivityLog } from "@/hooks/useActivityLog";
import { formatDisplayDate } from "@/utils/date";
import { ACTIVITY_METADATA, GLOBAL_AVG_DAILY_KG, LOW_IMPACT_THRESHOLD_KG } from "@/utils/constants";
import { Trash2 } from "lucide-react";
import { getTodayKey } from "@/utils/date";
import { calculateDailyFootprint, formatFootprint } from "@/utils/carbonCalculator";
import type { ActivityType } from "@/types";

/** Activity logging page */
export default function LogPage() {
  const { log, logActivity, removeActivity, getTodayActivities } = useActivityLog();
  const todayActivities = getTodayActivities();
  
  const todayTotalKg = useMemo(() => {
    const { totalKgCO2e } = calculateDailyFootprint(todayActivities);
    return totalKgCO2e;
  }, [todayActivities]);
  const todayKey = getTodayKey();

  const handleLog = (activityType: ActivityType, quantity: number) => {
    logActivity(activityType, quantity);
  };

  const sortedEntries = useMemo(
    () => [...todayActivities].sort((a, b) => b.loggedAt - a.loggedAt),
    [todayActivities]
  );

  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col gap-5 py-4">
      {/* Header */}
      <div>
        <p className="text-[var(--color-text-secondary)] text-xs uppercase tracking-widest mb-1">
          {formatDisplayDate(todayKey, "long")}
        </p>
        <h1 className="font-heading font-extrabold text-2xl text-[var(--color-text)]">
          log your activities
        </h1>
        <p className="text-[var(--color-text-secondary)] text-sm mt-1">
          tap once to log. no tedious forms, just vibes 💨
        </p>
      </div>

      {/* Live emission preview */}
      {todayActivities.length > 0 && (
        <GlassCard className="p-4 flex items-center justify-between">
          <div>
            <p className="text-[var(--color-text-secondary)] text-xs uppercase tracking-wider">
              today so far
            </p>
            <p
              className="font-heading font-extrabold text-3xl tabular-nums"
              style={{
                  color: todayTotalKg < LOW_IMPACT_THRESHOLD_KG
                  ? "var(--color-primary)"
                  : todayTotalKg > GLOBAL_AVG_DAILY_KG
                  ? "var(--color-roast)"
                  : "var(--color-celebrate)",
              }}
              aria-live="polite"
              aria-label={`${formatFootprint(todayTotalKg)} CO2e today`}
            >
              {formatFootprint(todayTotalKg)}
            </p>
          </div>
          <span className="text-3xl" aria-hidden="true">
            {todayTotalKg < LOW_IMPACT_THRESHOLD_KG ? "🌱" : todayTotalKg > GLOBAL_AVG_DAILY_KG ? "🔥" : "👀"}
          </span>
        </GlassCard>
      )}

      {/* Smart Suggestions */}
      <SmartSuggestions logs={log} onLogConfirm={handleLog} />

      {/* Activity selector */}
      <ActivitySelector onLog={handleLog} />

      {/* Today's logged entries */}
      {sortedEntries.length > 0 && (
        <div>
          <p className="text-[var(--color-text-secondary)] text-xs uppercase tracking-wider mb-3">
            logged today ({sortedEntries.length})
          </p>
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4" role="list" aria-label="Today's logged activities">
            {sortedEntries.map((entry) => {
              const meta = ACTIVITY_METADATA[entry.activityType as ActivityType];
              return (
                <div
                  key={entry.id}
                  role="listitem"
                  className="glass-card px-4 py-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg" aria-hidden="true">{meta.emoji}</span>
                    <div>
                      <p className="text-[var(--color-text)] text-sm font-semibold">{meta.label}</p>
                      <p className="text-[var(--color-text-secondary)] text-[10px]">
                        {entry.quantity} {entry.activityType.includes("meal") || entry.activityType.includes("delivery") || entry.activityType.includes("order") || entry.activityType.includes("fashion") || entry.activityType.includes("secondhand") || entry.activityType.includes("grocery") ? "×" : "km/hrs"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className="text-xs font-bold tabular-nums"
                      style={{ color: entry.kgCO2e === 0 ? "var(--color-primary)" : "var(--color-text-secondary)" }}
                    >
                      {entry.kgCO2e === 0 ? "0 🌱" : `${entry.kgCO2e} kg`}
                    </span>
                    <button
                      onClick={() => removeActivity(entry.id, entry.date)}
                      aria-label={`Remove ${meta.label} entry`}
                      className="text-[var(--color-text-muted)] hover:text-[var(--color-roast)] transition-colors p-1"
                    >
                      <Trash2 size={14} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {sortedEntries.length === 0 && (
        <div className="text-center py-8">
          <p className="text-[var(--color-text-muted)] text-sm">
            nothing logged yet — the planet is nervously watching 👀
          </p>
        </div>
      )}
    </div>
  );
}
