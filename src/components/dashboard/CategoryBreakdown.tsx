/**
 * Category breakdown chart — Recharts PieChart/BarChart by emission category.
 * Uses Recharts with gradient fills and glass tooltip.
 */

"use client";

import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { GlassCard } from "@/components/shared/GlassCard";
import { CATEGORY_METADATA } from "@/utils/constants";
import type { FootprintBreakdown } from "@/types";

interface CategoryBreakdownProps {
  breakdown: FootprintBreakdown;
}

interface TooltipPayload {
  value: number;
  name: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  if (!item) return null;
  return (
    <div className="glass-card px-3 py-2 text-xs">
      <p className="text-[var(--color-text)] font-semibold">{item.name}</p>
      <p className="text-[var(--color-primary)]">{item.value.toFixed(2)} kg CO₂e</p>
    </div>
  );
}

/**
 * CategoryBreakdown — horizontal bar chart of CO2e by category.
 * Uses Recharts with custom glass tooltip and category brand colors.
 *
 * @param breakdown - FootprintBreakdown with per-category kg CO2e
 */
export const CategoryBreakdown = React.memo(function CategoryBreakdown({
  breakdown,
}: CategoryBreakdownProps) {
  const data = (["transport", "food", "energy", "shopping"] as const)
    .map((cat) => ({
      name: CATEGORY_METADATA[cat].label,
      value: breakdown[cat],
      color: CATEGORY_METADATA[cat].color,
      emoji: CATEGORY_METADATA[cat].emoji,
    }))
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value);

  const isEmpty = data.length === 0;

  return (
    <GlassCard className="p-5" aria-label="Carbon footprint by category">
      <p className="text-[var(--color-text-secondary)] text-xs font-medium uppercase tracking-wider mb-4">
        by category
      </p>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center h-32 gap-2">
          <span className="text-3xl" aria-hidden="true">📊</span>
          <p className="text-[var(--color-text-secondary)] text-sm text-center">
            nothing logged yet — the chart is as empty as your carbon guilt
          </p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={data} layout="vertical" margin={{ left: 0, right: 16, top: 0, bottom: 0 }}>
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: "var(--color-text-secondary)", fontSize: 11 }}
              width={72}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
            <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={22}>
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </GlassCard>
  );
});
