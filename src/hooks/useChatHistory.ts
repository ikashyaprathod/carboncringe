/**
 * @fileoverview Chat history hook with localStorage persistence and streaming support.
 */

"use client";

import { useCallback, useState } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { STORAGE_KEYS } from "@/utils/constants";
import type { ChatMessage, ChatRole } from "@/types";

/**
 * Hook for managing the AI chat conversation.
 * Persists history to localStorage and supports streaming message updates.
 *
 * @returns Chat state and helpers: messages, addMessage, updateStreamingMessage, clearHistory, isStreaming
 */
export function useChatHistory() {
  const [messages, setMessages] = useLocalStorage<ChatMessage[]>(
    STORAGE_KEYS.CHAT_HISTORY,
    []
  );
  const [isStreaming, setIsStreaming] = useState(false);

  /**
   * Adds a complete, static message to the chat history.
   *
   * @param role - "user" or "assistant"
   * @param content - The message text
   * @returns The created ChatMessage
   */
  const addMessage = useCallback(
    (role: ChatRole, content: string): ChatMessage => {
      const message: ChatMessage = {
        id: crypto.randomUUID(),
        role,
        content,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, message]);
      return message;
    },
    [setMessages]
  );

  /**
   * Appends a streaming AI message. Creates the message on first call,
   * then appends chunks to it on subsequent calls.
   *
   * @param id - Stable ID for this streaming message
   * @param chunk - Text chunk to append
   * @param done - Set true on the final chunk to mark streaming complete
   */
  const updateStreamingMessage = useCallback(
    (id: string, chunk: string, done: boolean = false) => {
      setMessages((prev) => {
        const existing = prev.find((m) => m.id === id);
        if (!existing) {
          const newMsg: ChatMessage = {
            id,
            role: "assistant",
            content: chunk,
            timestamp: Date.now(),
            isStreaming: !done,
          };
          return [...prev, newMsg];
        }
        return prev.map((m) =>
          m.id === id
            ? { ...m, content: m.content + chunk, isStreaming: !done }
            : m
        );
      });
      setIsStreaming(!done);
    },
    [setMessages]
  );

  /** Clears all chat history from state and localStorage. */
  const clearHistory = useCallback(() => {
    setMessages([]);
  }, [setMessages]);

  return { messages, addMessage, updateStreamingMessage, clearHistory, isStreaming };
}
