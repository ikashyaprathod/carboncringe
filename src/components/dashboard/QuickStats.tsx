/**
 * Quick stats row — today's CO2, weekly total, vs. global average.
 */

"use client";

import React from "react";
import { GlassCard } from "@/components/shared/GlassCard";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface QuickStatsProps {
  todayKg: number;
  weeklyKg: number;
  vsAveragePercent: number;
  streakDays: number;
}

/**
 * QuickStats — three flex cards with today's CO2, weekly total, and vs-average comparison.
 *
 * @param todayKg - Today's CO2e in kg
 * @param weeklyKg - This week's total CO2e in kg
 * @param vsAveragePercent - % above/below global average (negative = good)
 * @param streakDays - Current streak count
 */
export const QuickStats = React.memo(function QuickStats({
  todayKg,
  weeklyKg,
  vsAveragePercent,
  streakDays,
}: QuickStatsProps) {
  const trendIcon =
    vsAveragePercent < 0 ? TrendingDown : vsAveragePercent > 0 ? TrendingUp : Minus;
  const TrendIcon = trendIcon;
  const trendColor =
    vsAveragePercent < -10
      ? "var(--color-primary)"
      : vsAveragePercent > 20
      ? "var(--color-roast)"
      : "var(--color-celebrate)";

  const stats = [
    {
      label: "today's damage",
      value: todayKg.toFixed(1),
      unit: "kg CO₂e",
      color: todayKg < 5 ? "var(--color-primary)" : todayKg > 13.5 ? "var(--color-roast)" : "var(--color-celebrate)",
    },
    {
      label: "this week",
      value: weeklyKg.toFixed(1),
      unit: "kg CO₂e",
      color: "var(--color-secondary)",
    },
    {
      label: streakDays > 0 ? `${streakDays} day streak 🔥` : "vs. average",
      value:
        streakDays > 0
          ? `${streakDays}`
          : vsAveragePercent > 0
          ? `+${vsAveragePercent}%`
          : `${vsAveragePercent}%`,
      unit: streakDays > 0 ? "days clean" : "global avg",
      color: streakDays > 0 ? "var(--color-celebrate)" : trendColor,
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3" role="list" aria-label="Carbon footprint summary">
      {stats.map((stat) => (
        <GlassCard
          key={stat.label}
          className="p-4 flex flex-col gap-1"
          role="listitem"
          aria-label={`${stat.label}: ${stat.value} ${stat.unit}`}
        >
          <p className="text-[var(--color-text-secondary)] text-[10px] font-medium uppercase tracking-wider">
            {stat.label}
          </p>
          <p
            className="text-2xl sm:text-3xl font-heading font-extrabold tabular-nums leading-none"
            style={{ color: stat.color }}
          >
            {stat.value}
          </p>
          <div className="flex items-center gap-1">
            {stat.label === "vs. average" && streakDays === 0 && (
              <TrendIcon size={11} style={{ color: trendColor }} aria-hidden="true" />
            )}
            <p className="text-[var(--color-text-muted)] text-[10px]">{stat.unit}</p>
          </div>
        </GlassCard>
      ))}
    </div>
  );
});
