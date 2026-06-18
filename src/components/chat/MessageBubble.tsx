/**
 * Chat message bubble — glass style for AI, solid mint for user.
 */

"use client";

import React from "react";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types";

interface MessageBubbleProps {
  message: ChatMessage;
}

/**
 * MessageBubble — renders a single chat message.
 * AI messages: glass with subtle border, slide-up animation.
 * User messages: solid mint gradient fill, right-aligned.
 * Streaming messages show a blinking cursor while isStreaming=true.
 *
 * @param message - The ChatMessage to render
 */
export const MessageBubble = React.memo(function MessageBubble({
  message,
}: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex w-full animate-slide-up",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {/* AI avatar */}
      {!isUser && (
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-sm mr-2 flex-shrink-0 mt-0.5"
          style={{ background: "var(--color-primary-glow)", border: "1px solid rgba(57,255,136,0.3)" }}
          aria-hidden="true"
        >
          🌍
        </div>
      )}

      <div
        className={cn(
          "max-w-[80%] rounded-3xl px-4 py-3 text-sm leading-relaxed",
          isUser
            ? "bg-mint-gradient text-[#0B0F0D] font-medium"
            : "glass-card text-[var(--color-text)]"
        )}
        role={message.role === "assistant" ? "article" : undefined}
        aria-label={isUser ? "Your message" : "AI response"}
      >
        <p className="whitespace-pre-wrap break-words">
          {message.content}
          {message.isStreaming && (
            <span
              className="inline-block w-0.5 h-4 bg-[var(--color-primary)] ml-0.5 animate-pulse"
              aria-hidden="true"
            />
          )}
        </p>
        <p className="text-[10px] mt-1.5 opacity-50 tabular-nums">
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>

      {/* User avatar */}
      {isUser && (
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-sm ml-2 flex-shrink-0 mt-0.5 bg-[var(--color-primary)] text-[#0B0F0D] font-bold"
          aria-hidden="true"
        >
          U
        </div>
      )}
    </div>
  );
});
