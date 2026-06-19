/**
 * Action card — glass card with checkbox, effort/impact badges, and hover lift.
 */

"use client";

import React, { useCallback } from "react";
import { GlassCard } from "@/components/shared/GlassCard";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { CATEGORY_METADATA, formatFootprint } from "@/utils";
import type { ActionItem } from "@/types";

interface ActionCardProps {
  action: ActionItem & { aiReason?: string };
  completed: boolean;
  onToggle: (id: string) => void;
}

const EFFORT_STYLES = {
  easy: { label: "easy", color: "var(--color-primary)", bg: "var(--color-primary-glow)" },
  medium: { label: "medium", color: "var(--color-celebrate)", bg: "var(--color-celebrate-glow)" },
  hard: { label: "hard", color: "var(--color-roast)", bg: "var(--color-roast-glow)" },
} as const;

const IMPACT_STYLES = {
  low: { label: "low impact", color: "var(--color-text-secondary)" },
  medium: { label: "med impact", color: "var(--color-celebrate)" },
  high: { label: "high impact", color: "var(--color-primary)" },
} as const;

/**
 * ActionCard — glass card showing a single action item with checkbox and badges.
 * Checking it marks the action complete; lifts and glows on hover.
 *
 * @param action - The ActionItem to display
 * @param completed - Whether this action is checked off
 * @param onToggle - Called with action.id when checkbox is toggled
 */
export const ActionCard = React.memo(function ActionCard({
  action,
  completed,
  onToggle,
}: ActionCardProps) {
  const catMeta = CATEGORY_METADATA[action.category];
  const effortStyle = EFFORT_STYLES[action.effort];
  const impactStyle = IMPACT_STYLES[action.impact];

  const handleToggle = useCallback(() => onToggle(action.id), [action.id, onToggle]);

  return (
    <GlassCard
      className={cn(
        "p-4 transition-all duration-300",
        completed && "opacity-60",
        action.isAIRecommended && !completed && "border border-[var(--color-primary)]/40 shadow-[0_0_15px_rgba(57,255,136,0.1)]"
      )}
      parallax
    >
      <div className="flex items-start gap-3">
        <Checkbox
          id={`action-${action.id}`}
          checked={completed}
          onCheckedChange={handleToggle}
          aria-label={`Mark "${action.title}" as ${completed ? "incomplete" : "complete"}`}
          className="mt-0.5 flex-shrink-0 border-[var(--glass-border)] data-[state=checked]:bg-[var(--color-primary)] data-[state=checked]:border-[var(--color-primary)]"
        />

        <div className="flex-1 min-w-0">
          {/* Header row */}
          <div className="flex flex-col gap-1.5 mb-1.5">
            <div className="flex items-start justify-between gap-2">
              <label
                htmlFor={`action-${action.id}`}
                className={cn(
                  "font-heading font-semibold text-sm text-[var(--color-text)] cursor-pointer leading-tight",
                  completed && "line-through text-[var(--color-text-secondary)]"
                )}
              >
                {action.title}
              </label>
              <span
                className="text-xs font-bold tabular-nums flex-shrink-0"
                style={{ color: "var(--color-primary)" }}
              >
                -{formatFootprint(action.estimatedWeeklySavingKgCO2e)}/wk
              </span>
            </div>

            {action.isAIRecommended && (
              <div>
                <span className="badge-mint inline-flex items-center gap-1 py-0.5 px-2 text-[9px] uppercase tracking-wider font-extrabold font-heading">
                  ✨ recommended for you
                </span>
              </div>
            )}
          </div>

          {/* Description */}
          <p className="text-[var(--color-text-secondary)] text-xs leading-relaxed mb-2">
            {action.description}
          </p>

          {/* AI Reason */}
          {action.isAIRecommended && action.aiReason && (
            <div className="mb-2 p-2.5 rounded-xl bg-white/5 border border-white/10 text-[10px] text-[var(--color-text-secondary)] leading-normal">
              <span className="text-[var(--color-primary)] font-bold font-heading">vibe check: </span>
              {action.aiReason}
            </div>
          )}

          {/* Tip */}
          <p className="text-[10px] italic mb-3" style={{ color: catMeta.color }}>
            {action.tip}
          </p>

          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{ color: effortStyle.color, background: effortStyle.bg }}
            >
              {effortStyle.label}
            </span>
            <span
              className="text-[10px] font-semibold"
              style={{ color: impactStyle.color }}
            >
              {impactStyle.label}
            </span>
            <span
              className="text-[10px] ml-auto"
              style={{ color: catMeta.color }}
            >
              {catMeta.emoji} {catMeta.label}
            </span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
});
