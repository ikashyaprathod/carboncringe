/**
 * Activity selector — tabbed category selector + activity list.
 */

"use client";

import React, { useState } from "react";
import { CategoryCard } from "@/components/logging/CategoryCard";
import { CATEGORY_METADATA } from "@/utils/constants";
import { cn } from "@/lib/utils";
import type { ActivityCategory, ActivityType } from "@/types";

interface ActivitySelectorProps {
  onLog: (activityType: ActivityType, quantity: number) => void;
}

const CATEGORIES: ActivityCategory[] = ["transport", "food", "energy", "shopping"];

/**
 * ActivitySelector — tab strip to filter categories + expanded CategoryCards.
 * "All" tab shows all categories at once.
 *
 * @param onLog - Callback when an activity is logged
 */
export function ActivitySelector({ onLog }: ActivitySelectorProps) {
  const [activeTab, setActiveTab] = useState<ActivityCategory | "all">("all");
  const visibleCategories =
    activeTab === "all" ? CATEGORIES : CATEGORIES.filter((c) => c === activeTab);

  return (
    <div className="flex flex-col gap-4">
      {/* Tab strip */}
      <div
        className="flex gap-2 overflow-x-auto pb-1 no-scrollbar"
        role="tablist"
        aria-label="Activity categories"
      >
        <button
          role="tab"
          aria-selected={activeTab === "all"}
          onClick={() => setActiveTab("all")}
          className={cn(
            "flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200",
            "focus-visible:outline-2 focus-visible:outline-[var(--color-primary)]",
            activeTab === "all"
              ? "bg-[var(--color-primary)] text-[#0B0F0D]"
              : "bg-white/5 text-[var(--color-text-secondary)] hover:bg-white/10"
          )}
        >
          All 🌍
        </button>

        {CATEGORIES.map((cat) => {
          const meta = CATEGORY_METADATA[cat];
          const isActive = activeTab === cat;
          return (
            <button
              key={cat}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(cat)}
              className={cn(
                "flex-shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200",
                "focus-visible:outline-2 focus-visible:outline-[var(--color-primary)]",
                isActive
                  ? "text-[#0B0F0D]"
                  : "bg-white/5 text-[var(--color-text-secondary)] hover:bg-white/10"
              )}
              style={isActive ? { backgroundColor: meta.color } : {}}
            >
              <span aria-hidden="true">{meta.emoji}</span>
              {meta.label}
            </button>
          );
        })}
      </div>

      {/* Category cards */}
      <div
        className="w-full grid grid-cols-1 md:grid-cols-2 gap-4"
        role="tabpanel"
        aria-label={`${activeTab} activities`}
      >
        {visibleCategories.map((cat) => (
          <CategoryCard key={cat} category={cat} onLog={onLog} />
        ))}
      </div>
    </div>
  );
}
