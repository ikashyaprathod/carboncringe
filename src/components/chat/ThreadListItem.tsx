/**
 * @fileoverview Individual chat thread list item for the multi-chat sidebar.
 */

"use client";

import React, { useMemo } from "react";
import { Trash2, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ChatThread } from "@/types";

interface ThreadListItemProps {
  thread: ChatThread;
  isActive: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ThreadListItem({ thread, isActive, onSelect, onDelete }: ThreadListItemProps) {
  // Compute relative date string
  const relativeTime = useMemo(() => {
    const timestamp = thread.updatedAt || thread.createdAt;
    if (!timestamp) return "";
    const now = Date.now();
    const diffMs = now - timestamp;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHr / 24);

    if (diffSec < 60) return "just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDays === 1) return "yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    
    // Fallback to formatted date if older than a week
    return new Date(timestamp).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  }, [thread.updatedAt, thread.createdAt]);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(thread.id);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.01, x: 2 }}
      whileTap={{ scale: 0.99 }}
      onClick={() => onSelect(thread.id)}
      className={cn(
        "group relative flex items-center justify-between p-3.5 rounded-2xl cursor-pointer transition-all duration-200",
        "border border-transparent select-none",
        isActive
          ? "bg-[rgba(57,255,136,0.08)] border-[rgba(57,255,136,0.25)] text-[var(--color-primary)] shadow-[0_0_15px_rgba(57,255,136,0.05)]"
          : "bg-white/5 hover:bg-white/10 text-[var(--color-text)] hover:border-white/10"
      )}
      role="button"
      aria-pressed={isActive}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(thread.id);
        }
      }}
    >
      <div className="flex items-center gap-2.5 min-w-0 pr-6">
        <MessageSquare
          size={14}
          className={cn(
            "flex-shrink-0 transition-colors",
            isActive ? "text-[var(--color-primary)]" : "text-[var(--color-text-secondary)] group-hover:text-[var(--color-text)]"
          )}
        />
        <div className="flex flex-col min-w-0">
          <span className="font-heading font-semibold text-xs truncate leading-normal">
            {thread.title || "New Conversation"}
          </span>
          <span className="text-[10px] text-[var(--color-text-secondary)] mt-0.5 leading-none">
            {relativeTime}
          </span>
        </div>
      </div>

      <button
        onClick={handleDelete}
        aria-label={`Delete conversation: ${thread.title || "New Conversation"}`}
        className={cn(
          "absolute right-3 p-1.5 rounded-lg text-[var(--color-text-muted)] transition-all",
          "hover:text-[var(--color-roast)] hover:bg-white/5",
          "opacity-100 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100"
        )}
      >
        <Trash2 size={13} aria-hidden="true" />
      </button>
    </motion.div>
  );
}
