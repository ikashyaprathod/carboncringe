/**
 * Reusable glass card component — the foundation of the CarbonCringe design system.
 * Apply this to ALL card surfaces for consistent glassmorphism throughout the app.
 */

"use client";

import React, { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface GlassCardProps<T extends React.ElementType = "div"> {
  children: React.ReactNode;
  className?: string;
  /** Enable subtle parallax tilt on desktop mouse move */
  parallax?: boolean;
  /** Extra glow color on hover — use CSS color string */
  glowColor?: string;
  onClick?: () => void;
  as?: T;
  role?: string;
  "aria-label"?: string;
}

/**
 * GlassCard — the core frosted glass surface component.
 * Wraps content in the standard glass aesthetic with optional hover parallax.
 * Use this everywhere instead of inline glass styles.
 */
export const GlassCard = React.memo(function GlassCard<T extends React.ElementType = "div">({
  children,
  className,
  parallax = false,
  glowColor,
  onClick,
  as,
  ...ariaProps
}: GlassCardProps<T> & Omit<React.ComponentPropsWithoutRef<T>, keyof GlassCardProps<T>>) {
  const Tag = (as || "div") as React.ElementType;
  const MotionTag = motion.create(Tag as React.ElementType);
  const cardRef = useRef<React.ComponentRef<T> | null>(null);
  const [tilt, setTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!parallax || !cardRef.current) return;
    const rect = (cardRef.current as unknown as HTMLElement).getBoundingClientRect();
    const x = (e.clientY - rect.top) / rect.height - 0.5;
    const y = (e.clientX - rect.left) / rect.width - 0.5;
    setTilt({ x: x * 6, y: y * -6 });
  };

  const handleMouseLeave = () => {
    if (!parallax) return;
    setTilt({ x: 0, y: 0 });
  };

  return (
    <MotionTag
      ref={(el: React.ComponentRef<T> | null) => {
        cardRef.current = el;
      }}
      className={cn("glass-card", onClick && "cursor-pointer", className)}
      style={{
        transform: parallax
          ? `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`
          : undefined,
        transition: parallax ? "transform 0.1s ease-out" : undefined,
        ...(glowColor
          ? {
              "--card-glow": glowColor,
            }
          : {}),
      }}
      whileHover={{
        y: onClick || parallax ? -4 : 0,
        transition: { duration: 0.2, type: "spring", stiffness: 300, damping: 20 },
      }}
      whileTap={onClick ? { scale: 0.97 } : undefined}
      onMouseMove={parallax ? handleMouseMove : undefined}
      onMouseLeave={parallax ? handleMouseLeave : undefined}
      onClick={onClick}
      {...ariaProps}
    >
      {children}
    </MotionTag>
  );
}) as <T extends React.ElementType = "div">(
  props: GlassCardProps<T> & Omit<React.ComponentPropsWithoutRef<T>, keyof GlassCardProps<T>>
) => React.ReactElement | null;
