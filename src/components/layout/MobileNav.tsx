/**
 * Floating glass tab bar for mobile — fixed at bottom, rounded-full pill.
 */

"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, MessageCircle, Lightbulb, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const TAB_ITEMS = [
  { href: "/", label: "Home", icon: LayoutDashboard },
  { href: "/log", label: "Log", icon: BookOpen },
  { href: "/chat", label: "Chat", icon: MessageCircle },
  { href: "/insights", label: "Insights", icon: Lightbulb },
  { href: "/actions", label: "Actions", icon: Zap },
] as const;

/**
 * MobileNav — floating glass pill tab bar fixed at the bottom of mobile screens.
 * Hidden on desktop (md: breakpoint and above).
 */
export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden fixed bottom-4 left-0 right-0 z-50 flex justify-center px-4"
      aria-label="Mobile navigation"
    >
      <div className="glass-pill flex items-center gap-1 px-3 py-2">
        {TAB_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-full transition-all duration-200",
                isActive
                  ? "text-[var(--color-primary)]"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
              )}
            >
              <div
                className={cn(
                  "p-1.5 rounded-full transition-all duration-200",
                  isActive && "bg-[var(--color-primary-glow)] shadow-[0_0_12px_var(--color-primary-glow)]"
                )}
              >
                <Icon size={18} aria-hidden="true" />
              </div>
              <span className="text-[9px] font-semibold">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
