/**
 * SmartSuggestions component.
 * Suggests likely activities for today based on historical patterns in localStorage logs.
 */

"use client";

import React, { useState, useMemo } from "react";
import { Check, X } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { getSuggestedActivities } from "@/utils/patternDetector";
import { getTodayKey } from "@/utils/date";
import { ACTIVITY_METADATA, EMISSION_FACTORS } from "@/utils/constants";
import type { ActivityEntry, ActivityType } from "@/types";

interface SmartSuggestionsProps {
  /** Full activity logs from localStorage */
  logs: Record<string, ActivityEntry[]>;
  /** Callback when user confirms a suggestion */
  onLogConfirm: (activityType: ActivityType, quantity: number) => void;
}

export function SmartSuggestions({ logs, onLogConfirm }: SmartSuggestionsProps) {
  const todayKey = getTodayKey();
  
  // Track skipped activity types for this session/day
  const [skippedTypes, setSkippedTypes] = useState<Set<ActivityType>>(new Set());

  // Calculate suggestions based on logs
  const suggestions = useMemo(() => {
    return getSuggestedActivities(logs, todayKey);
  }, [logs, todayKey]);

  // Compute total entries count to determine if we should show suggestions info or tips
  const totalEntriesCount = useMemo(() => {
    return Object.values(logs).reduce((sum, entries) => sum + entries.length, 0);
  }, [logs]);

  // Filter out skipped suggestions
  const activeSuggestions = useMemo(() => {
    return suggestions.filter((s) => !skippedTypes.has(s.activityType));
  }, [suggestions, skippedTypes]);

  // If there aren't enough logs, show onboarding message
  if (totalEntriesCount < 5) {
    return (
      <GlassCard className="p-4 flex flex-col items-center justify-center text-center gap-1.5 border border-dashed border-[var(--glass-border)]">
        <span className="text-2xl" aria-hidden="true">🔮</span>
        <p className="text-[var(--color-text)] text-sm font-semibold">
          predictive recommendations locked
        </p>
        <p className="text-[var(--color-text-secondary)] text-xs max-w-sm">
          log a few more days and i&apos;ll start predicting your patterns 👀
        </p>
      </GlassCard>
    );
  }

  // If all suggestions are handled, hide the card
  if (activeSuggestions.length === 0) {
    return null;
  }

  const handleSkip = (type: ActivityType) => {
    setSkippedTypes((prev) => {
      const next = new Set(prev);
      next.add(type);
      return next;
    });
  };

  const handleConfirm = (type: ActivityType, quantity: number) => {
    onLogConfirm(type, quantity);
  };

  return (
    <div className="flex flex-col gap-2">
      <p className="text-[var(--color-text-secondary)] text-xs uppercase tracking-wider">
        based on your patterns, you probably did these today:
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {activeSuggestions.map((s) => {
          const meta = ACTIVITY_METADATA[s.activityType];
          const factor = EMISSION_FACTORS[s.activityType];
          const isZeroEmissions = s.kgCO2e === 0;

          return (
            <GlassCard
              key={s.activityType}
              className="p-3.5 flex items-center justify-between gap-3 animate-slide-up"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-base flex-shrink-0" aria-hidden="true">
                    {meta.emoji}
                  </span>
                  <p className="text-[var(--color-text)] text-xs font-semibold truncate">
                    {meta.label}
                  </p>
                </div>
                <p className="text-[var(--color-text-secondary)] text-[10px] mt-0.5">
                  {s.quantity} {factor.unit} •{" "}
                  <span
                    className="font-bold tabular-nums"
                    style={{
                      color: isZeroEmissions
                        ? "var(--color-primary)"
                        : "var(--color-text-secondary)",
                    }}
                  >
                    {isZeroEmissions ? "0 🌱" : `${s.kgCO2e} kg`}
                  </span>
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => handleConfirm(s.activityType, s.quantity)}
                  aria-label={`Confirm logging ${s.quantity} ${factor.unit} of ${meta.label}`}
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 border border-[var(--glass-border)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-[#0B0F0D] transition-colors duration-200"
                >
                  <Check size={14} aria-hidden="true" />
                </button>
                <button
                  onClick={() => handleSkip(s.activityType)}
                  aria-label={`Skip suggested ${meta.label}`}
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 border border-[var(--glass-border)] text-[var(--color-roast)] hover:bg-[var(--color-roast)] hover:text-white transition-colors duration-200"
                >
                  <X size={14} aria-hidden="true" />
                </button>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
