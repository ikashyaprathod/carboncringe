import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { GlassCard } from "@/components/shared/GlassCard";

export default function InsightsLoading() {
  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col gap-5 py-4 animate-pulse">
      {/* Header Loading */}
      <div className="flex flex-col gap-2">
        <Skeleton className="h-3 w-28 rounded-full bg-white/5" />
        <Skeleton className="h-8 w-60 rounded-md bg-white/5" />
        <Skeleton className="h-4 w-80 rounded-full bg-white/5" />
      </div>

      {/* Main insights block skeleton */}
      <GlassCard className="p-6 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-full bg-white/5" />
          <Skeleton className="h-6 w-40 rounded-md bg-white/5" />
        </div>
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-full rounded bg-white/5" />
          <Skeleton className="h-4 w-5/6 rounded bg-white/5" />
          <Skeleton className="h-4 w-4/5 rounded bg-white/5" />
        </div>
      </GlassCard>

      {/* Grid of details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlassCard className="p-5 flex flex-col gap-3">
          <Skeleton className="h-4 w-32 rounded-full bg-white/5" />
          <Skeleton className="h-32 w-full rounded-2xl bg-white/5" />
        </GlassCard>
        <GlassCard className="p-5 flex flex-col gap-3">
          <Skeleton className="h-4 w-32 rounded-full bg-white/5" />
          <Skeleton className="h-32 w-full rounded-2xl bg-white/5" />
        </GlassCard>
      </div>
    </div>
  );
}
