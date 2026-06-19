import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { GlassCard } from "@/components/shared/GlassCard";

export default function LogLoading() {
  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col gap-5 py-4 animate-pulse">
      {/* Header Loading */}
      <div className="flex flex-col gap-2">
        <Skeleton className="h-3 w-32 rounded-full bg-white/5" />
        <Skeleton className="h-8 w-64 rounded-md bg-white/5" />
        <Skeleton className="h-4 w-96 rounded-full bg-white/5" />
      </div>

      {/* Smart Suggestions Skeleton */}
      <GlassCard className="p-4 flex flex-col gap-3">
        <Skeleton className="h-4 w-56 rounded-full bg-white/5" />
        <div className="flex flex-wrap gap-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-44 rounded-full bg-white/5" />
          ))}
        </div>
      </GlassCard>

      {/* Category tabs skeleton */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-8 w-24 rounded-full bg-white/5 flex-shrink-0" />
        ))}
      </div>

      {/* Cards list skeleton */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <GlassCard key={i} className="p-4 flex flex-col gap-3">
            <Skeleton className="h-4 w-28 rounded-full bg-white/5" />
            <Skeleton className="h-8 w-20 rounded-md bg-white/5" />
            <Skeleton className="h-10 w-full rounded-2xl bg-white/5" />
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
