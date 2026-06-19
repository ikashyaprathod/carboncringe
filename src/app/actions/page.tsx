"use client";

import React, { useCallback, useMemo, useState, useEffect } from "react";
import { ActionCard } from "@/components/actions/ActionCard";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useActivityLog } from "@/hooks/useActivityLog";
import { ACTIONS_LIBRARY, CATEGORY_METADATA, STORAGE_KEYS } from "@/utils/constants";
import { getTodayKey } from "@/utils/date";
import { cn } from "@/lib/utils";
import type { ActivityCategory, ActionCompletion, FootprintBreakdown } from "@/types";

type FilterCategory = ActivityCategory | "all";

interface RankedItem {
  id: string;
  reason: string;
}

/** Simple Actions Library — curated habits with checkbox tracking and AI personalization */
export default function ActionsPage() {
  const [completions, setCompletions] = useLocalStorage<ActionCompletion[]>(
    STORAGE_KEYS.ACTION_COMPLETIONS,
    []
  );
  const { log } = useActivityLog();
  const [filter, setFilter] = useState<FilterCategory>("all");
  const [rankedActions, setRankedActions] = useState<RankedItem[]>([]);

  // Check if the user has logged any activities historically
  const hasLoggedActivities = useMemo(() => {
    return Object.values(log).some((entries) => entries && entries.length > 0);
  }, [log]);

  // Calculate user's actual historical category breakdown totals
  const totalBreakdown = useMemo((): FootprintBreakdown => {
    const breakdown: FootprintBreakdown = { transport: 0, food: 0, energy: 0, shopping: 0 };
    Object.values(log).forEach((entries) => {
      if (!entries) return;
      entries.forEach((e) => {
        breakdown[e.category] = (breakdown[e.category] || 0) + e.kgCO2e;
      });
    });
    return breakdown;
  }, [log]);

  // Fetch AI ranking when history breakdown updates
  useEffect(() => {
    if (!hasLoggedActivities) {
      setRankedActions([]);
      return;
    }

    const fetchRanking = async () => {
      try {
        const res = await fetch("/api/personalize", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ breakdown: totalBreakdown }),
        });
        if (res.ok) {
          const data = await res.json() as { rankedActions: RankedItem[] };
          setRankedActions(data.rankedActions);
        }
      } catch (err) {
        console.error("Personalization failed:", err);
      }
    };

    fetchRanking();
  }, [hasLoggedActivities, totalBreakdown]);

  const completedIds = useMemo(
    () => new Set(completions.filter((c) => c.completed).map((c) => c.actionId)),
    [completions]
  );

  // Sort actions based on rankedActions array (top 3 AI recommendations prioritized first)
  const sortedActions = useMemo(() => {
    if (rankedActions.length === 0) return ACTIONS_LIBRARY;
    return [...ACTIONS_LIBRARY].sort((a, b) => {
      const idxA = rankedActions.findIndex((r) => r.id === a.id);
      const idxB = rankedActions.findIndex((r) => r.id === b.id);
      if (idxA === -1 && idxB === -1) return 0;
      if (idxA === -1) return 1;
      if (idxB === -1) return -1;
      return idxA - idxB;
    });
  }, [rankedActions]);

  const filteredActions = useMemo(
    () =>
      sortedActions.filter(
        (a) => filter === "all" || a.category === filter
      ),
    [sortedActions, filter]
  );

  // Enrich the action object with recommendation and reason details for display
  const enrichedActions = useMemo(() => {
    return filteredActions.map((action) => {
      const rankedItem = rankedActions.find((r) => r.id === action.id);
      const isTop3 = rankedActions.slice(0, 3).some((r) => r.id === action.id);
      return {
        ...action,
        isAIRecommended: isTop3,
        aiReason: isTop3 ? rankedItem?.reason : undefined,
      };
    });
  }, [filteredActions, rankedActions]);

  const handleToggle = useCallback(
    (id: string) => {
      setCompletions((prev) => {
        const existing = prev.find((c) => c.actionId === id);
        if (existing) {
          return prev.map((c) =>
            c.actionId === id ? { ...c, completed: !c.completed } : c
          );
        }
        return [...prev, { actionId: id, completed: true, completedDate: getTodayKey() }];
      });
    },
    [setCompletions]
  );

  const completedCount = completedIds.size;
  const totalCount = ACTIONS_LIBRARY.length;
  const progress = Math.round((completedCount / totalCount) * 100);

  const FILTER_OPTIONS: FilterCategory[] = ["all", "transport", "food", "energy", "shopping"];

  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col gap-5 py-4">
      {/* Header */}
      <div>
        <h1 className="font-heading font-extrabold text-2xl text-[var(--color-text)]">
          simple actions
        </h1>
        <p className="text-[var(--color-text-secondary)] text-sm mt-1">
          {completedCount === 0
            ? "pick 1-2 to start. small steps, real impact 🌱"
            : `you've adopted ${completedCount}/${totalCount} habits — that's actually${completedCount > 5 ? " unhinged in a good way" : " solid"} 🔥`}
        </p>
      </div>

      {/* Progress bar */}
      <div className="glass-card p-4">
        <div className="flex justify-between text-xs mb-2">
          <span className="text-[var(--color-text-secondary)] font-medium">habits adopted</span>
          <span className="font-bold text-[var(--color-primary)] tabular-nums">
            {completedCount}/{totalCount}
          </span>
        </div>
        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg, #39FF88, #7AFCD6)",
            }}
            role="progressbar"
            aria-valuenow={completedCount}
            aria-valuemin={0}
            aria-valuemax={totalCount}
            aria-label={`${completedCount} of ${totalCount} habits adopted`}
          />
        </div>
      </div>

      {/* Zero State / Prompt Banner for Personalization */}
      {!hasLoggedActivities && (
        <div className="glass-card p-4 text-center border-dashed border-[var(--color-primary)]/40 bg-[var(--color-primary-glow)]/5">
          <p className="text-[var(--color-text-secondary)] text-sm font-medium leading-relaxed">
            log a few activities and I&apos;ll personalize this list for you 👀
          </p>
        </div>
      )}

      {/* Category filter */}
      <div
        className="flex gap-2 overflow-x-auto pb-1"
        role="tablist"
        aria-label="Filter by category"
      >
        {FILTER_OPTIONS.map((cat) => {
          const isActive = filter === cat;
          const meta = cat !== "all" ? CATEGORY_METADATA[cat] : null;
          return (
            <button
              key={cat}
              role="tab"
              aria-selected={isActive}
              onClick={() => setFilter(cat)}
              className={cn(
                "flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200",
                "focus-visible:outline-2 focus-visible:outline-[var(--color-primary)]",
                isActive
                  ? "bg-[var(--color-primary)] text-[#0B0F0D]"
                  : "bg-white/5 text-[var(--color-text-secondary)] hover:bg-white/10"
              )}
            >
              {meta ? `${meta.emoji} ${meta.label}` : "🌍 All"}
            </button>
          );
        })}
      </div>

      {/* Action cards */}
      <div
        className="flex flex-col gap-3"
        role="list"
        aria-label="Available actions"
      >
        {enrichedActions.map((action) => (
          <ActionCard
            key={action.id}
            action={action}
            completed={completedIds.has(action.id)}
            onToggle={handleToggle}
          />
        ))}
      </div>
    </div>
  );
}
