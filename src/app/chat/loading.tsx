import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { GlassCard } from "@/components/shared/GlassCard";

export default function ChatLoading() {
  return (
    <div className="flex h-full gap-0 overflow-hidden animate-pulse">
      {/* Sidebar Skeleton (hidden on mobile) */}
      <div className="hidden lg:flex w-72 xl:w-80 flex-shrink-0 flex-col gap-4 border-r border-[var(--glass-border)] p-4 bg-[#0B0F0D]/60">
        <Skeleton className="h-10 w-full rounded-2xl bg-white/5" />
        <div className="flex flex-col gap-2 mt-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-2xl bg-white/5" />
          ))}
        </div>
      </div>

      {/* Main column */}
      <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden">
        {/* Title bar skeleton */}
        <div className="flex-shrink-0 flex items-center justify-between px-4 lg:px-6 py-3 border-b border-[var(--glass-border)] bg-[#0B0F0D]/60 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <Skeleton className="lg:hidden w-8 h-8 rounded-xl bg-white/5" />
            <div className="flex flex-col gap-1.5">
              <Skeleton className="h-4 w-36 rounded-md bg-white/5" />
              <Skeleton className="h-3.5 w-24 rounded-md bg-white/5" />
            </div>
          </div>
          <Skeleton className="w-8 h-8 rounded-xl bg-white/5" />
        </div>

        {/* Message bubble stream skeleton */}
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
          {[...Array(3)].map((_, i) => {
            const isLeft = i % 2 === 0;
            return (
              <div key={i} className={`flex w-full ${isLeft ? "justify-start" : "justify-end"}`}>
                {isLeft && <Skeleton className="w-7 h-7 rounded-full bg-white/5 mr-2" />}
                <GlassCard className="max-w-[70%] rounded-3xl px-4 py-3 flex flex-col gap-2 border-none bg-white/5">
                  <Skeleton className="h-3 w-48 rounded bg-white/5" />
                  <Skeleton className="h-3 w-32 rounded bg-white/5" />
                </GlassCard>
                {!isLeft && <Skeleton className="w-7 h-7 rounded-full bg-white/5 ml-2" />}
              </div>
            );
          })}
        </div>

        {/* Pinned Input bar skeleton */}
        <div className="flex-shrink-0 border-t border-[var(--glass-border)] bg-[#0B0F0D]/60 backdrop-blur-md px-4 lg:px-6 py-3">
          <div className="max-w-3xl mx-auto">
            <Skeleton className="h-12 w-full rounded-2xl bg-white/5" />
          </div>
        </div>
      </div>
    </div>
  );
}
