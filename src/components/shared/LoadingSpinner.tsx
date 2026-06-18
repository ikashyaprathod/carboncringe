/**
 * Branded loading spinner with mint glow animation.
 */

import React from "react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}

const sizeClasses = { sm: "h-4 w-4", md: "h-8 w-8", lg: "h-12 w-12" };

/**
 * LoadingSpinner — animated mint ring spinner with aria-label support.
 *
 * @param size - "sm" | "md" | "lg"
 * @param label - Screen reader label (defaults to "Loading...")
 */
export function LoadingSpinner({
  size = "md",
  className,
  label = "Loading...",
}: LoadingSpinnerProps) {
  return (
    <div
      role="status"
      aria-label={label}
      className={cn("flex items-center justify-center", className)}
    >
      <div
        className={cn(
          "rounded-full border-2 border-transparent animate-spin",
          sizeClasses[size]
        )}
        style={{
          borderTopColor: "var(--color-primary)",
          borderRightColor: "rgba(57,255,136,0.3)",
          boxShadow: "0 0 12px rgba(57,255,136,0.3)",
        }}
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}
