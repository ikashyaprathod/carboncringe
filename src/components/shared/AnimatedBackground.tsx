/**
 * Animated background mesh with floating gradient orbs.
 * CSS-only animation — no JavaScript for the motion itself.
 * Respects prefers-reduced-motion automatically via globals.css.
 */

import React from "react";

/**
 * AnimatedBackground — renders the floating orb gradient mesh background.
 * Place this as a fixed full-screen element behind all page content.
 * Single instance in layout.tsx — not repeated per page.
 */
export function AnimatedBackground() {
  return (
    <div
      className="fixed inset-0 -z-10 overflow-hidden"
      aria-hidden="true"
      role="presentation"
    >
      {/* Base dark background */}
      <div className="absolute inset-0 bg-[#0B0F0D]" />

      {/* Hero radial gradient — top center mint bloom */}
      <div className="absolute inset-0 bg-hero-gradient opacity-60" />

      {/* Orb 1 — top-left mint */}
      <div
        className="animate-orb-1 absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full opacity-65"
        style={{
          background:
            "radial-gradient(circle, rgba(57,255,136,0.35) 0%, transparent 70%)",
          filter: "blur(120px)",
        }}
      />

      {/* Orb 2 — top-right aqua */}
      <div
        className="animate-orb-2 absolute -top-32 right-[-100px] h-[700px] w-[500px] rounded-full opacity-55"
        style={{
          background:
            "radial-gradient(circle, rgba(122,252,214,0.30) 0%, transparent 70%)",
          filter: "blur(140px)",
        }}
      />

      {/* Orb 3 — bottom-left purple */}
      <div
        className="animate-orb-3 absolute bottom-[-100px] -left-32 h-[500px] w-[500px] rounded-full opacity-50"
        style={{
          background:
            "radial-gradient(circle, rgba(139,92,246,0.28) 0%, transparent 70%)",
          filter: "blur(130px)",
        }}
      />

      {/* Orb 4 — bottom-right emerald */}
      <div
        className="animate-orb-1 absolute bottom-[-100px] right-[-100px] h-[450px] w-[450px] rounded-full opacity-50"
        style={{
          animationDelay: "8s",
          background:
            "radial-gradient(circle, rgba(34,197,94,0.28) 0%, transparent 70%)",
          filter: "blur(120px)",
        }}
      />

      {/* Noise texture overlay for depth */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
          backgroundSize: "128px",
        }}
      />
    </div>
  );
}
