/**
 * Chat window — scrollable message list with aria-live streaming support.
 */

"use client";

import React, { useEffect, useRef } from "react";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import type { ChatMessage } from "@/types";

interface ChatWindowProps {
  messages: ChatMessage[];
  isStreaming: boolean;
}

/**
 * ChatWindow — auto-scrolling message list.
 * Uses aria-live="polite" for screen reader streaming announcements.
 *
 * @param messages - Array of ChatMessage objects to display
 * @param isStreaming - True while AI is generating a response
 */
export function ChatWindow({ messages, isStreaming }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new message or streaming update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const isEmpty = messages.length === 0;

  return (
    <div
      className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4"
      aria-live="polite"
      aria-label="Chat conversation"
      role="log"
    >
      {isEmpty && (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-16 gap-3">
          <span className="text-5xl" aria-hidden="true">🌍</span>
          <p className="font-heading font-bold text-[var(--color-text)] text-lg">
            hey bestie, i&apos;m your carbon roast buddy
          </p>
          <p className="text-[var(--color-text-secondary)] text-sm max-w-xs">
            ask me about your footprint, get a roast, or find out how to actually make a dent 💚
          </p>
        </div>
      )}

      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}

      {/* Typing indicator — shown when waiting for first token */}
      {isStreaming && messages[messages.length - 1]?.role !== "assistant" && (
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-sm"
            style={{ background: "var(--color-primary-glow)" }}
            aria-hidden="true"
          >
            🌍
          </div>
          <div className="glass-card px-4 py-3 flex items-center gap-2">
            <LoadingSpinner size="sm" label="AI is thinking..." />
            <span className="text-[var(--color-text-secondary)] text-xs">thinking...</span>
          </div>
        </div>
      )}

      <div ref={bottomRef} aria-hidden="true" />
    </div>
  );
}
