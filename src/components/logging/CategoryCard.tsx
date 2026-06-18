/**
 * Category card — expandable card showing all activities for one category.
 */

"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { QuickLogButton } from "@/components/logging/QuickLogButton";
import { CATEGORY_METADATA, ACTIVITY_METADATA } from "@/utils/constants";
import { cn } from "@/lib/utils";
import type { ActivityCategory, ActivityType } from "@/types";

interface CategoryCardProps {
  category: ActivityCategory;
  onLog: (activityType: ActivityType, quantity: number) => void;
}

/**
 * CategoryCard — expandable glass card for one emission category.
 * Shows category summary and a list of quick-log buttons on expand.
 *
 * @param category - Which category to show
 * @param onLog - Callback for when an activity is logged
 */
export function CategoryCard({ category, onLog }: CategoryCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const meta = CATEGORY_METADATA[category];

  const activities = (
    Object.entries(ACTIVITY_METADATA) as [ActivityType, typeof ACTIVITY_METADATA[ActivityType]][]
  ).filter(([, m]) => m.category === category);

  return (
    <GlassCard className="overflow-hidden">
      <button
        onClick={() => setIsOpen((o) => !o)}
        aria-expanded={isOpen}
        aria-controls={`category-${category}-activities`}
        className={cn(
          "w-full flex items-center justify-between p-4 text-left",
          "focus-visible:outline-2 focus-visible:outline-[var(--color-primary)] rounded-2xl"
        )}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
            style={{ background: meta.glowColor }}
            aria-hidden="true"
          >
            {meta.emoji}
          </div>
          <div>
            <p className="font-heading font-bold text-[var(--color-text)]">{meta.label}</p>
            <p className="text-[var(--color-text-secondary)] text-xs">{meta.description}</p>
          </div>
        </div>
        <ChevronDown
          size={18}
          className={cn(
            "text-[var(--color-text-secondary)] transition-transform duration-200",
            isOpen && "rotate-180"
          )}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          id={`category-${category}-activities`}
          className="px-4 pb-4 flex flex-col gap-2 animate-slide-up"
        >
          {activities.map(([type, actMeta]) => (
            <QuickLogButton
              key={type}
              activityType={type}
              quantity={actMeta.defaultQuantity}
              onLog={onLog}
            />
          ))}
        </div>
      )}
    </GlassCard>
  );
}
