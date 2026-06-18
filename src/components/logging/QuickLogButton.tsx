/**
 * One-tap activity log button with satisfying pop animation.
 */

"use client";

import React, { useState, useCallback } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { ACTIVITY_METADATA, EMISSION_FACTORS } from "@/utils/constants";
import { calculateActivityEmission } from "@/utils/carbonCalculator";
import type { ActivityType } from "@/types";

interface QuickLogButtonProps {
  activityType: ActivityType;
  quantity: number;
  onLog: (activityType: ActivityType, quantity: number) => void;
  disabled?: boolean;
}

/**
 * QuickLogButton — one-tap button that logs an activity with visual feedback.
 * Shows a satisfying pop animation + checkmark on tap.
 *
 * @param activityType - The activity to log
 * @param quantity - The quantity to log
 * @param onLog - Callback called with (activityType, quantity) on tap
 * @param disabled - Whether the button is disabled
 */
export const QuickLogButton = React.memo(function QuickLogButton({
  activityType,
  quantity,
  onLog,
  disabled = false,
}: QuickLogButtonProps) {
  const [justLogged, setJustLogged] = useState(false);
  const meta = ACTIVITY_METADATA[activityType];
  const kgCO2e = calculateActivityEmission(activityType, quantity);
  const isGreen = kgCO2e === 0;

  const handleClick = useCallback(() => {
    if (disabled || justLogged) return;
    onLog(activityType, quantity);
    setJustLogged(true);
    setTimeout(() => setJustLogged(false), 1500);
  }, [activityType, quantity, onLog, disabled, justLogged]);

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      aria-label={`Log ${meta.label}: ${quantity} ${EMISSION_FACTORS[activityType].unit} = ${kgCO2e} kg CO₂e`}
      aria-pressed={justLogged}
      className={cn(
        "relative w-full flex items-center justify-between px-4 py-3 rounded-2xl border transition-all duration-200",
        "focus-visible:outline-2 focus-visible:outline-[var(--color-primary)]",
        "active:scale-95",
        justLogged
          ? "bg-[var(--color-primary-glow)] border-[var(--color-primary)]"
          : "bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/20",
        disabled && "opacity-40 cursor-not-allowed"
      )}
    >
      <div className="flex items-center gap-2.5">
        <span className="text-xl" aria-hidden="true">{meta.emoji}</span>
        <div className="text-left">
          <p className="text-[var(--color-text)] text-sm font-semibold leading-tight">
            {meta.label}
          </p>
          <p className="text-[var(--color-text-secondary)] text-[10px]">
            {quantity} {EMISSION_FACTORS[activityType].unit}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span
          className="text-xs font-bold tabular-nums"
          style={{ color: isGreen ? "var(--color-primary)" : "var(--color-text-secondary)" }}
        >
          {isGreen ? "0 kg 🌱" : `${kgCO2e} kg`}
        </span>
        {justLogged && (
          <div className="animate-pop-in">
            <Check size={16} className="text-[var(--color-primary)]" aria-hidden="true" />
          </div>
        )}
      </div>
    </button>
  );
});
