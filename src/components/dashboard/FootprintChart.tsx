/**
 * 7-day footprint line chart with gradient fill and glass tooltip.
 * Lazy-loaded via dynamic import in parent page for bundle splitting.
 */

"use client";

import React from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { GlassCard } from "@/components/shared/GlassCard";
import { formatDisplayDate } from "@/utils/date";
import { GLOBAL_AVG_DAILY_KG } from "@/utils/constants";

interface ChartDataPoint {
  date: string;
  total: number;
}

interface FootprintChartProps {
  data: ChartDataPoint[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length || !label) return null;
  const value = payload[0]?.value ?? 0;
  const isGood = value < 5;
  return (
    <div className="glass-card px-3 py-2 text-xs min-w-[110px]">
      <p className="text-[var(--color-text-secondary)]">{formatDisplayDate(label, "relative")}</p>
      <p
        className="font-heading font-bold text-base"
        style={{ color: isGood ? "var(--color-primary)" : value > 13.5 ? "var(--color-roast)" : "var(--color-celebrate)" }}
      >
        {value.toFixed(1)} kg
      </p>
    </div>
  );
}

/**
 * FootprintChart — 7-day area chart with gradient fill.
 * Shows global average as a reference line for comparison.
 *
 * @param data - Array of {date, total} for the last 7 days (oldest first)
 */
export const FootprintChart = React.memo(function FootprintChart({
  data,
}: FootprintChartProps) {
  const isEmpty = data.every((d) => d.total === 0);

  return (
    <GlassCard className="p-5" aria-label="7-day carbon footprint chart">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[var(--color-text-secondary)] text-xs font-medium uppercase tracking-wider">
          7-day trend
        </p>
        <p className="text-[var(--color-text-muted)] text-[10px]">
          avg line = global avg ({GLOBAL_AVG_DAILY_KG} kg/day)
        </p>
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center h-40 gap-2">
          <span className="text-3xl" aria-hidden="true">📈</span>
          <p className="text-[var(--color-text-secondary)] text-sm text-center">
            start logging to see your trend
          </p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={data} margin={{ left: -20, right: 4, top: 4, bottom: 0 }}>
            <defs>
              <linearGradient id="footprintGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#39FF88" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#39FF88" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tickFormatter={(d: string) => formatDisplayDate(d, "short")}
              tick={{ fill: "var(--color-text-secondary)", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "var(--color-text-secondary)", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `${v}kg`}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              y={GLOBAL_AVG_DAILY_KG}
              stroke="rgba(255,107,107,0.4)"
              strokeDasharray="4 4"
            />
            <Area
              type="monotone"
              dataKey="total"
              stroke="#39FF88"
              strokeWidth={2}
              fill="url(#footprintGradient)"
              dot={{ fill: "#39FF88", r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: "#39FF88", stroke: "rgba(57,255,136,0.3)", strokeWidth: 4 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </GlassCard>
  );
});
