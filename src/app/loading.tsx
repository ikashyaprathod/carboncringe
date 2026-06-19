import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { GlassCard } from "@/components/shared/GlassCard";

export default function RootLoading() {
  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col gap-5 py-4 animate-pulse">
      {/* Hero card loading state */}
      <GlassCard className="p-6 text-center flex flex-col items-center gap-3">
        <Skeleton className="h-4 w-32 rounded-full bg-white/5" />
        <Skeleton className="h-16 w-48 rounded-2xl bg-white/5" />
        <Skeleton className="h-4 w-64 rounded-full bg-white/5" />
      </GlassCard>

      {/* Quick stats loading state */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <GlassCard key={i} className="p-4 flex flex-col gap-2">
            <Skeleton className="h-3 w-20 rounded-full bg-white/5" />
            <Skeleton className="h-8 w-28 rounded-md bg-white/5" />
            <Skeleton className="h-3.5 w-full rounded-full bg-white/5" />
          </GlassCard>
        ))}
      </div>

      {/* Charts loading state */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GlassCard className="p-5 flex flex-col gap-4">
          <Skeleton className="h-4 w-40 rounded-full bg-white/5" />
          <Skeleton className="h-48 w-full rounded-2xl bg-white/5" />
        </GlassCard>
        <GlassCard className="p-5 flex flex-col gap-4">
          <Skeleton className="h-4 w-40 rounded-full bg-white/5" />
          <Skeleton className="h-48 w-full rounded-2xl bg-white/5" />
        </GlassCard>
      </div>
    </div>
  );
}
