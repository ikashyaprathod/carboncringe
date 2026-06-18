/**
 * Chat input bar with glass styling, debounced send, and keyboard support.
 */

"use client";

import React, { useRef, useCallback } from "react";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { sanitizeUserInput } from "@/lib/sanitize";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

/**
 * ChatInput — glass-styled textarea with send button.
 * Sends on Enter (Shift+Enter for newline). Sanitizes input before sending.
 *
 * @param onSend - Called with sanitized message string
 * @param disabled - Disable during AI streaming
 * @param placeholder - Input placeholder text
 */
export function ChatInput({
  onSend,
  disabled = false,
  placeholder = "ask your carbon bestie anything...",
}: ChatInputProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(() => {
    const raw = inputRef.current?.value ?? "";
    const clean = sanitizeUserInput(raw.trim());
    if (!clean || disabled) return;
    onSend(clean);
    if (inputRef.current) inputRef.current.value = "";
  }, [onSend, disabled]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="glass-pill flex items-end gap-2 px-4 py-3">
      <textarea
        ref={inputRef}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={placeholder}
        rows={1}
        aria-label="Chat message input"
        aria-multiline="true"
        maxLength={500}
        className={cn(
          "flex-1 bg-transparent text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]",
          "text-sm resize-none outline-none leading-relaxed",
          "max-h-32 overflow-y-auto",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        style={{ scrollbarWidth: "none" }}
      />
      <button
        onClick={handleSend}
        disabled={disabled}
        aria-label="Send message"
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
          "transition-all duration-200 focus-visible:outline-2 focus-visible:outline-[var(--color-primary)]",
          disabled
            ? "bg-white/5 text-[var(--color-text-muted)] cursor-not-allowed"
            : "bg-[var(--color-primary)] text-[#0B0F0D] hover:scale-105 active:scale-95"
        )}
      >
        <Send size={14} aria-hidden="true" />
      </button>
    </div>
  );
}
