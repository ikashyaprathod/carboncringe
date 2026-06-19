/**
 * Impact equivalents card — translates CO2 kg into relatable comparisons.
 */

"use client";

import React from "react";
import { GlassCard } from "@/components/shared/GlassCard";
import type { ImpactEquivalent as ImpactEquivalentType } from "@/types";
import { formatFootprint } from "@/utils";

interface ImpactEquivalentProps {
  equivalents: ImpactEquivalentType;
  kgCO2e: number;
  period?: "today" | "week";
}

/**
 * ImpactEquivalent — makes CO2 numbers tangible via relatable comparisons.
 * "Your week = X trees needed for a year" etc.
 *
 * @param equivalents - Pre-calculated impact equivalents
 * @param kgCO2e - The raw kg CO2e value
 * @param period - "today" or "week"
 */
export const ImpactEquivalent = React.memo(function ImpactEquivalent({
  equivalents,
  kgCO2e,
  period = "today",
}: ImpactEquivalentProps) {
  const items = [
    {
      emoji: "🌳",
      label: "trees needed",
      value: equivalents.trees.toFixed(1),
      detail: "to absorb this in a year",
    },
    {
      emoji: "🚗",
      label: "km not driven",
      value: equivalents.kmNotDriven.toLocaleString(),
      detail: "equivalent in car emissions",
    },
    {
      emoji: "📱",
      label: "phone charges",
      value: equivalents.phoneCharges.toLocaleString(),
      detail: "equivalent energy",
    },
    {
      emoji: "🎬",
      label: "Netflix hours",
      value: equivalents.netflixHours.toLocaleString(),
      detail: "of streaming equivalent",
    },
  ];

  return (
    <GlassCard className="p-5" aria-label="Impact equivalents">
      <div className="mb-4">
        <p className="text-[var(--color-text-secondary)] text-xs font-medium uppercase tracking-wider">
          {period === "today" ? "today's impact" : "this week's impact"}
        </p>
        <p className="text-[var(--color-text-muted)] text-sm mt-0.5">
          {formatFootprint(kgCO2e)} CO₂e is equivalent to…
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex flex-col gap-0.5"
            aria-label={`${item.value} ${item.label} — ${item.detail}`}
          >
            <div className="flex items-center gap-1.5">
              <span className="text-xl" aria-hidden="true">{item.emoji}</span>
              <span className="font-heading font-bold text-lg text-[var(--color-text)] tabular-nums">
                {item.value}
              </span>
            </div>
            <p className="text-[var(--color-text-secondary)] text-[11px] pl-8">
              {item.label}
            </p>
          </div>
        ))}
      </div>
    </GlassCard>
  );
});
