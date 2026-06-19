import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { GlassCard } from "@/components/shared/GlassCard";

export default function ActionsLoading() {
  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col gap-5 py-4 animate-pulse">
      {/* Header Loading */}
      <div className="flex flex-col gap-2">
        <Skeleton className="h-3 w-32 rounded-full bg-white/5" />
        <Skeleton className="h-8 w-64 rounded-md bg-white/5" />
        <Skeleton className="h-4 w-96 rounded-full bg-white/5" />
      </div>

      {/* Recommended actions grid skeleton */}
      <div className="flex flex-col gap-3">
        <Skeleton className="h-4 w-40 rounded-full bg-white/5" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <GlassCard key={i} className="p-5 flex flex-col gap-3 border border-[var(--color-primary)]/10">
              <div className="flex justify-between items-center">
                <Skeleton className="h-8 w-20 rounded-full bg-white/5" />
                <Skeleton className="h-5 w-12 rounded bg-white/5" />
              </div>
              <Skeleton className="h-5 w-40 rounded-md bg-white/5" />
              <Skeleton className="h-3 w-full rounded bg-white/5" />
              <Skeleton className="h-3 w-5/6 rounded bg-white/5" />
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Main actions grid list skeleton */}
      <div className="flex flex-col gap-3 mt-4">
        <Skeleton className="h-4 w-44 rounded-full bg-white/5" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <GlassCard key={i} className="p-4 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <Skeleton className="h-8 w-24 rounded-full bg-white/5" />
                <Skeleton className="h-5 w-12 rounded bg-white/5" />
              </div>
              <Skeleton className="h-4 w-32 rounded-md bg-white/5" />
              <Skeleton className="h-3 w-full rounded bg-white/5" />
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
}
