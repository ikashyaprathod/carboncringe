"use client";

import React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { BookOpen, MessageCircle } from "lucide-react";
import { useFootprint } from "@/hooks/useFootprint";
import { useStreak } from "@/hooks/useStreak";
import { QuickStats } from "@/components/dashboard/QuickStats";
import { StreakCounter } from "@/components/dashboard/StreakCounter";
import { ImpactEquivalent } from "@/components/dashboard/ImpactEquivalent";
import { GlassCard } from "@/components/shared/GlassCard";
import { Skeleton } from "@/components/ui/skeleton";
import { LOW_IMPACT_THRESHOLD_KG, GLOBAL_AVG_DAILY_KG } from "@/utils/constants";
import { formatFootprint } from "@/utils/carbonCalculator";
import { motion } from "framer-motion";

// Lazy-load charts for bundle splitting and SSR compatibility
const FootprintChart = dynamic(
  () => import("@/components/dashboard/FootprintChart").then((m) => m.FootprintChart),
  { ssr: false, loading: () => <Skeleton className="h-48 w-full rounded-3xl bg-white/5" /> }
);

const CategoryBreakdown = dynamic(
  () => import("@/components/dashboard/CategoryBreakdown").then((m) => m.CategoryBreakdown),
  { ssr: false, loading: () => <Skeleton className="h-48 w-full rounded-3xl bg-white/5" /> }
);

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 180, damping: 20 } },
};

/** Dashboard — the main home page showing today's footprint and weekly trends */
export default function DashboardPage() {
  const { today, weekly, todayEquivalents, todayVsAverage, chartData } = useFootprint();
  const streak = useStreak();

  const isGreatDay = today.totalKgCO2e < LOW_IMPACT_THRESHOLD_KG && today.entries.length > 0;
  const isBadDay = today.totalKgCO2e > GLOBAL_AVG_DAILY_KG;

  return (
    <motion.div
      className="max-w-7xl mx-auto w-full flex flex-col gap-5 py-4"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Hero card — today's footprint */}
      <motion.div variants={itemVariants}>
        <GlassCard
          className="p-6 text-center"
          glowColor={isGreatDay ? "rgba(57,255,136,0.12)" : isBadDay ? "rgba(255,107,107,0.08)" : undefined}
          parallax
        >
          <p className="text-[var(--color-text-secondary)] text-xs font-medium uppercase tracking-widest mb-3">
            today&apos;s damage
          </p>
          <div className="flex items-end justify-center gap-2 mb-2">
            <span
              className={
                isGreatDay ? "stat-number" : isBadDay ? "stat-number-roast" : "stat-number-celebrate"
              }
              style={{ fontSize: "clamp(3rem, 15vw, 5rem)" }}
              aria-label={`${formatFootprint(today.totalKgCO2e)} today`}
            >
              {formatFootprint(today.totalKgCO2e)}
            </span>
          </div>
          <p className="text-[var(--color-text-secondary)] text-sm">
            {today.entries.length === 0
              ? "nothing logged yet... living guilt-free today? 👀"
              : isGreatDay
              ? "okay bestie that's actually clean energy 🌱"
              : isBadDay
              ? `${Math.abs(todayVsAverage)}% above the global average 💀`
              : `${Math.abs(todayVsAverage)}% ${todayVsAverage < 0 ? "below" : "above"} global average`}
          </p>
        </GlassCard>
      </motion.div>

      {/* Quick stats */}
      <motion.div variants={itemVariants}>
        <QuickStats
          todayKg={today.totalKgCO2e}
          weeklyKg={weekly.totalKgCO2e}
          vsAveragePercent={todayVsAverage}
          streakDays={streak.currentStreak}
        />
      </motion.div>

      {/* 7-day chart */}
      <motion.div variants={itemVariants}>
        <FootprintChart data={chartData} />
      </motion.div>

      {/* Category breakdown + streak side by side on md+ */}
      <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-4">
        <CategoryBreakdown breakdown={weekly.breakdown} />
        <StreakCounter
          currentStreak={streak.currentStreak}
          longestStreak={streak.longestStreak}
          totalLowImpactDays={streak.totalLowImpactDays}
        />
      </motion.div>

      {/* Impact equivalents */}
      {today.totalKgCO2e > 0 && (
        <motion.div variants={itemVariants}>
          <ImpactEquivalent equivalents={todayEquivalents} kgCO2e={today.totalKgCO2e} period="today" />
        </motion.div>
      )}

      {/* CTA buttons */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3 mt-2">
        <Link
          href="/log"
          className="btn-primary-glow flex items-center justify-center gap-2 py-3 px-4 text-sm font-bold"
          aria-label="Log an activity"
        >
          <BookOpen size={16} aria-hidden="true" />
          log activity
        </Link>
        <Link
          href="/chat"
          className="glass-card flex items-center justify-center gap-2 py-3 px-4 text-sm font-semibold text-[var(--color-text)] hover:border-[var(--color-primary)]"
          aria-label="Chat with AI companion"
        >
          <MessageCircle size={16} aria-hidden="true" />
          chat with AI
        </Link>
      </motion.div>
    </motion.div>
  );
}
