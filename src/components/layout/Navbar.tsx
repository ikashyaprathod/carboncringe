/**
 * Floating glass pill navbar — iOS Dynamic Island inspired.
 * Centered, rounded-full, glass effect, not full-width.
 */

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, MessageCircle, Lightbulb, Zap, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { GlassCard } from "@/components/shared/GlassCard";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/log", label: "Log", icon: BookOpen },
  { href: "/chat", label: "Chat", icon: MessageCircle },
  { href: "/insights", label: "Insights", icon: Lightbulb },
  { href: "/actions", label: "Actions", icon: Zap },
] as const;

/**
 * Navbar — floating glass pill fixed at top of the page.
 * Shows logo + desktop nav links. On mobile, shows drawer menu.
 */
export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const toggleDrawer = () => setIsOpen((prev) => !prev);
  const closeDrawer = () => setIsOpen(false);

  return (
    <>
      <header className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4">
        <nav
          className="glass-pill flex items-center gap-1 px-3 py-2"
          aria-label="Main navigation"
        >
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-[var(--color-primary)] rounded-full px-2 py-1"
            aria-label="CarbonCringe home"
          >
            <span className="text-lg" aria-hidden="true">🌍</span>
            <span className="font-heading font-extrabold text-sm text-[var(--color-text)]">
              CarbonCringe
            </span>
          </Link>

          {/* Nav links — hidden on mobile */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
              const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-label={label}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200",
                    isActive
                      ? "bg-[var(--color-primary-glow)] text-[var(--color-primary)]"
                      : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-white/5"
                  )}
                >
                  <Icon size={13} aria-hidden="true" />
                  {label}
                </Link>
              );
            })}
          </div>

          {/* Hamburger Menu Trigger for Mobile */}
          <button
            onClick={toggleDrawer}
            aria-label="Toggle navigation menu"
            aria-expanded={isOpen}
            className="md:hidden ml-2 p-1.5 rounded-full hover:bg-white/10 text-[var(--color-text)] transition-colors focus-visible:outline-2 focus-visible:outline-[var(--color-primary)]"
          >
            <Menu size={16} aria-hidden="true" />
          </button>
        </nav>
      </header>

      {/* Slide-in Navigation Drawer for Mobile */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeDrawer}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[99] md:hidden"
              aria-hidden="true"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-72 max-w-[80vw] bg-[#0b0f0d]/90 backdrop-blur-2xl border-l border-[var(--glass-border)] z-[100] p-6 shadow-2xl flex flex-col gap-6 md:hidden"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation drawer"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[var(--glass-border)]">
                <span className="font-heading font-extrabold text-lg flex items-center gap-2">
                  <span>🌍</span> CarbonCringe
                </span>
                <button
                  onClick={closeDrawer}
                  aria-label="Close menu"
                  className="p-1.5 rounded-full hover:bg-white/10 text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
                >
                  <X size={18} aria-hidden="true" />
                </button>
              </div>

              {/* Drawer Links */}
              <div className="flex flex-col gap-3">
                {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                  const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={closeDrawer}
                      aria-label={label}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <GlassCard
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 border-none",
                          isActive
                            ? "bg-[var(--color-primary-glow)] text-[var(--color-primary)] border border-[var(--color-primary)]/30"
                            : "bg-white/5 hover:bg-white/10 text-[var(--color-text)]"
                        )}
                        as="div"
                      >
                        <Icon size={18} className="flex-shrink-0" />
                        <span className="font-heading font-bold text-sm">{label}</span>
                      </GlassCard>
                    </Link>
                  );
                })}
              </div>

              {/* Drawer Footer */}
              <div className="mt-auto text-center text-[10px] text-[var(--color-text-secondary)] font-medium">
                no cap, track your footprint 🍃
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
