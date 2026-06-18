/**
 * ConditionalMain — switches <main> layout classes per route.
 * Chat page gets a true full-viewport fixed-height shell (no page scroll).
 * All other pages keep the normal scrollable layout.
 */

"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface ConditionalMainProps {
  children: React.ReactNode;
}

export function ConditionalMain({ children }: ConditionalMainProps) {
  const pathname = usePathname();
  const isChat = pathname === "/chat";

  return (
    <main
      className={cn(
        "w-full",
        isChat
          ? // Chat: fixed viewport height, no scroll, no padding — chat page owns its insets
            "h-[100dvh] overflow-hidden pt-16"
          : // All other pages: normal scrollable layout with top/bottom padding
            "min-h-screen px-4 sm:px-6 lg:px-8 pt-20 pb-28 md:pb-8"
      )}
    >
      {children}
    </main>
  );
}
