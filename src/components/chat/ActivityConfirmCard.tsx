/**
 * ActivityConfirmCard component.
 * Displays activities logged via natural language chat and provides a 5-second undo button.
 */

"use client";

import React, { useState, useEffect } from "react";
import { GlassCard } from "@/components/shared/GlassCard";

interface ActivityConfirmCardProps {
  loggedActivities: {
    id: string;
    category: string;
    activityType: string;
    quantity: number;
    kgCO2e: number;
    label: string;
    emoji: string;
  }[];
  undoTimeLimit: number;
  undone?: boolean;
  onUndo: () => void;
}

export function ActivityConfirmCard({
  loggedActivities,
  undoTimeLimit,
  undone,
  onUndo,
}: ActivityConfirmCardProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    if (undone) return;

    const updateTimer = () => {
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((undoTimeLimit - now) / 1000));
      setTimeLeft(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 200);

    return () => clearInterval(interval);
  }, [undoTimeLimit, undone]);

  const canUndo = !undone && timeLeft > 0;

  return (
    <GlassCard className="mt-2.5 p-3 flex flex-col gap-2 border border-[var(--glass-border)] rounded-2xl max-w-sm text-left">
      {undone ? (
        <div className="flex items-center gap-1.5 text-[var(--color-text-secondary)] text-xs animate-pulse">
          <span className="text-sm font-bold" aria-hidden="true">✕</span>
          <span className="font-semibold">logging undone</span>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1 min-w-0">
            <span className="text-[var(--color-text-secondary)] text-[9px] uppercase tracking-wider font-bold">
              activities logged ✓
            </span>
            <div className="flex flex-col gap-1">
              {loggedActivities.map((act) => (
                <div key={act.id} className="flex items-center gap-1.5 text-xs text-[var(--color-text)]">
                  <span className="text-sm" aria-hidden="true">{act.emoji}</span>
                  <span className="font-semibold truncate max-w-[150px]">{act.label}</span>
                  <span className="text-[var(--color-text-secondary)] text-[10px] tabular-nums">
                    ({act.quantity} • {act.kgCO2e === 0 ? "0kg" : `${act.kgCO2e}kg`})
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          {canUndo ? (
            <button
              onClick={onUndo}
              aria-label="Undo logging these activities"
              className="flex-shrink-0 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider border border-[var(--color-roast)]/20 hover:border-[var(--color-roast)]/40 bg-[var(--color-roast)]/10 text-[var(--color-roast)] hover:bg-[var(--color-roast)] hover:text-white rounded-xl transition-all duration-200"
            >
              undo ({timeLeft}s)
            </button>
          ) : (
            <span className="text-xs text-[var(--color-primary)] font-bold flex-shrink-0 mr-1 animate-fade-in" aria-hidden="true">
              ✓
            </span>
          )}
        </div>
      )}
    </GlassCard>
  );
}
