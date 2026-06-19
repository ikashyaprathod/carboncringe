"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { GlassCard } from "@/components/shared/GlassCard";
import { ImpactEquivalent } from "@/components/dashboard/ImpactEquivalent";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useFootprint } from "@/hooks/useFootprint";
import { CATEGORY_METADATA, GLOBAL_AVG_DAILY_KG } from "@/utils/constants";
import { getImpactEquivalents, formatFootprint } from "@/utils/carbonCalculator";
import type { AISuggestion, WeeklyReport } from "@/types";
import { getTodayKey, getLastNDays } from "@/utils/date";

const FootprintChart = dynamic(
  () => import("@/components/dashboard/FootprintChart").then((m) => m.FootprintChart),
  { ssr: false, loading: () => <div className="h-48 animate-pulse rounded-3xl bg-white/5" /> }
);

/** Insights page — weekly patterns, AI-generated reduction tips */
export default function InsightsPage() {
  const { weekly, topCategory, chartData } = useFootprint();
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const weeklyEquivalents = getImpactEquivalents(weekly.totalKgCO2e);
  const topCatMeta = CATEGORY_METADATA[topCategory];
  const avgVsGlobal = weekly.totalKgCO2e - GLOBAL_AVG_DAILY_KG * 7;

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (weekly.totalKgCO2e === 0) return;
      setLoadingSuggestions(true);
      try {
        const weeklyReport: WeeklyReport = {
          weekStart: getLastNDays(7).at(-1) ?? getTodayKey(),
          weekEnd: getTodayKey(),
          days: [],
          totalKgCO2e: weekly.totalKgCO2e,
          avgDailyKgCO2e: weekly.avgDailyKgCO2e,
          topCategory,
          breakdown: weekly.breakdown,
        };
        const res = await fetch("/api/suggestions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ weeklyReport, completedActionIds: [] }),
        });
        if (res.ok) {
          const data = await res.json() as { suggestions: AISuggestion[] };
          setSuggestions(data.suggestions);
        }
      } finally {
        setLoadingSuggestions(false);
      }
    };
    fetchSuggestions();
  }, [weekly.totalKgCO2e, topCategory, weekly.avgDailyKgCO2e, weekly.breakdown]);

  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col gap-5 py-4">
      <div>
        <h1 className="font-heading font-extrabold text-2xl text-[var(--color-text)]">
          weekly insights
        </h1>
        <p className="text-[var(--color-text-secondary)] text-sm mt-1">
          here&apos;s the tea on your footprint ☕
        </p>
      </div>

      {/* Weekly summary */}
      <GlassCard className="p-5">
        <p className="text-[var(--color-text-secondary)] text-xs uppercase tracking-wider mb-3">
          this week&apos;s summary
        </p>
        <div className="flex items-end gap-2 mb-3">
          <span className="stat-number" style={{ fontSize: "3rem" }}>
            {formatFootprint(weekly.totalKgCO2e)}
          </span>
          <span className="text-[var(--color-text-secondary)] mb-2">total</span>
        </div>
        <p className="text-sm mb-1" style={{ color: avgVsGlobal > 0 ? "var(--color-roast)" : "var(--color-primary)" }}>
          {avgVsGlobal > 0
            ? `${formatFootprint(avgVsGlobal)} above global average this week 💀`
            : `${formatFootprint(Math.abs(avgVsGlobal))} below global average this week 🌱`}
        </p>
        <p className="text-[var(--color-text-secondary)] text-xs">
          avg {formatFootprint(weekly.avgDailyKgCO2e)}/day · global avg {formatFootprint(GLOBAL_AVG_DAILY_KG)}/day
        </p>
      </GlassCard>

      {/* Top category callout */}
      {weekly.totalKgCO2e > 0 && (
        <GlassCard className="p-5" glowColor={topCatMeta.glowColor}>
          <p className="text-[var(--color-text-secondary)] text-xs uppercase tracking-wider mb-2">
            biggest culprit
          </p>
          <div className="flex items-center gap-3">
            <span className="text-3xl" aria-hidden="true">{topCatMeta.emoji}</span>
            <div>
              <p className="font-heading font-bold text-[var(--color-text)]">
                {topCatMeta.label}
              </p>
              <p className="text-xs" style={{ color: topCatMeta.color }}>
                {formatFootprint(weekly.breakdown[topCategory])} this week
              </p>
            </div>
          </div>
        </GlassCard>
      )}

      {/* 7-day chart */}
      <FootprintChart data={chartData} />

      {/* Impact equivalents */}
      {weekly.totalKgCO2e > 0 && (
        <ImpactEquivalent equivalents={weeklyEquivalents} kgCO2e={weekly.totalKgCO2e} period="week" />
      )}

      {/* AI suggestions */}
      <div>
        <p className="text-[var(--color-text-secondary)] text-xs uppercase tracking-wider mb-3">
          ✨ personalized for you
        </p>
        {loadingSuggestions ? (
          <div className="flex items-center justify-center py-8 gap-2">
            <LoadingSpinner size="sm" />
            <span className="text-[var(--color-text-secondary)] text-sm">AI is cooking... 🍳</span>
          </div>
        ) : suggestions.length > 0 ? (
          <div className="flex flex-col gap-3">
            {suggestions.map((s, i) => (
              <GlassCard key={i} className="p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="font-heading font-semibold text-sm text-[var(--color-text)]">
                    {s.title}
                  </p>
                  <span className="text-xs font-bold text-[var(--color-primary)] tabular-nums flex-shrink-0">
                    -{formatFootprint(s.estimatedSavingKgCO2e)}/wk
                  </span>
                </div>
                <p className="text-[var(--color-text-secondary)] text-xs">{s.rationale}</p>
              </GlassCard>
            ))}
          </div>
        ) : (
          <GlassCard className="p-5 text-center">
            <p className="text-[var(--color-text-secondary)] text-sm">
              log some activities first and I&apos;ll cook up personalized tips 🌍
            </p>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
