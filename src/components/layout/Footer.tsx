/**
 * Minimal footer with disclaimer and links.
 * Hidden on /chat to prevent overflow on the full-height chat layout.
 */

"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Footer — minimal glass-bordered footer with emissions disclaimer.
 * Returns null on the /chat page to keep the chat layout scroll-free.
 */
export function Footer() {
  const pathname = usePathname();

  // Chat page uses a full-viewport flex layout — footer would cause overflow
  if (pathname === "/chat") return null;

  return (
    <footer className="mt-16 pb-24 md:pb-8 px-4 text-center">
      <div
        className="max-w-2xl mx-auto pt-6"
        style={{ borderTop: "1px solid var(--glass-border)" }}
      >
        <p className="text-[var(--color-text-muted)] text-xs leading-relaxed">
          ⚠️ Emission factors are estimates based on global averages (DEFRA 2023, Poore &amp; Nemecek 2018, IEA).
          Actual values vary by location, provider, and individual behaviour.
        </p>
        <div className="flex items-center justify-center gap-4 mt-3">
          <Link
            href="/"
            className="text-[var(--color-text-secondary)] text-xs hover:text-[var(--color-primary)] transition-colors focus-visible:outline-2 focus-visible:outline-[var(--color-primary)]"
          >
            🌍 CarbonCringe
          </Link>
          <span className="text-[var(--color-text-muted)] text-xs">
            made with anxiety about the climate 💚
          </span>
        </div>
      </div>
    </footer>
  );
}
