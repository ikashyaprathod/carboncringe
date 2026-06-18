/**
 * @fileoverview Chat sidebar containing conversation thread list and creation triggers.
 * Inline on desktop, slide-out drawer on mobile.
 */

"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Plus, X, MessageSquareDashed } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { ThreadListItem } from "./ThreadListItem";
import { GlassCard } from "@/components/shared/GlassCard";
import type { ChatThread } from "@/types";

interface ChatSidebarProps {
  threads: ChatThread[];
  activeThreadId: string | null;
  onSelectThread: (id: string) => void;
  onDeleteThread: (id: string) => void;
  onCreateThread: () => void;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export function ChatSidebar({
  threads,
  activeThreadId,
  onSelectThread,
  onDeleteThread,
  onCreateThread,
  isOpen,
  onClose,
  className,
}: ChatSidebarProps) {
  const handleSelect = (id: string) => {
    onSelectThread(id);
    onClose(); // Close mobile drawer when thread is selected
  };

  const handleCreate = () => {
    onCreateThread();
    onClose();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full gap-4">
      {/* Create New Chat Button */}
      <GlassCard
        onClick={handleCreate}
        className="flex items-center gap-2.5 justify-center py-2.5 px-4 bg-[var(--color-primary-glow)] hover:bg-[var(--color-primary-glow)] border border-[var(--color-primary)]/30 text-[var(--color-primary)] cursor-pointer"
        as="button"
        role="button"
        aria-label="Create new conversation"
      >
        <Plus size={15} aria-hidden="true" />
        <span className="font-heading font-extrabold text-xs tracking-wide uppercase">new convo</span>
      </GlassCard>

      {/* Threads List Container */}
      <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2">
        {threads.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 text-center text-[var(--color-text-muted)] flex-1">
            <MessageSquareDashed size={24} className="mb-2 opacity-60" />
            <span className="text-[10px] font-semibold">no active chats</span>
          </div>
        ) : (
          threads.map((thread) => (
            <ThreadListItem
              key={thread.id}
              thread={thread}
              isActive={thread.id === activeThreadId}
              onSelect={handleSelect}
              onDelete={onDeleteThread}
            />
          ))
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (inline, hidden on mobile/tablet) */}
      <div className={cn("hidden lg:flex flex-col w-72 lg:w-80 flex-shrink-0 h-full border-r border-[var(--glass-border)] pr-4", className)}>
        {sidebarContent}
      </div>

      {/* Mobile Drawer (visible only when open on mobile) */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[90] lg:hidden"
              aria-hidden="true"
            />

            {/* Drawer Panel */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-72 max-w-[80vw] bg-[#0b0f0d]/90 backdrop-blur-2xl border-r border-[var(--glass-border)] z-[95] p-6 shadow-2xl flex flex-col gap-5 lg:hidden"
              role="dialog"
              aria-modal="true"
              aria-label="Conversations list"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[var(--glass-border)]">
                <span className="font-heading font-extrabold text-sm flex items-center gap-1.5">
                  💬 Chat History
                </span>
                <button
                  onClick={onClose}
                  aria-label="Close conversations list"
                  className="p-1 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors hover:bg-white/5"
                >
                  <X size={16} aria-hidden="true" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 min-h-0">
                {sidebarContent}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
