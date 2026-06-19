/**
 * QuickPrompts component.
 * Displays pill-shaped interactive quick prompts on empty chat states.
 */

"use client";

import React from "react";

interface QuickPromptsProps {
  onSelect: (promptText: string) => void;
}

const PROMPTS = [
  "roast my day 💀",
  "log something for me",
  "how am I doing this week?",
  "give me one easy win",
];

export function QuickPrompts({ onSelect }: QuickPromptsProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 mt-4 px-2">
      {PROMPTS.map((prompt) => (
        <button
          key={prompt}
          onClick={() => onSelect(prompt)}
          aria-label={`Ask AI: ${prompt}`}
          className="px-4 py-1.5 rounded-full text-xs font-semibold bg-white/5 hover:bg-white/10 border border-[var(--glass-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] active:scale-95"
        >
          {prompt}
        </button>
      ))}
    </div>
  );
}
