/**
 * @fileoverview Hook for managing multiple chat threads with localStorage persistence,
 * max-limit (20 threads), and automatic titles.
 */

"use client";

import { useCallback, useState, useEffect } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { ChatThread, ChatMessage, ChatRole } from "@/types";

const MAX_THREADS = 20;

export function useChatThreads() {
  const [threads, setThreads] = useLocalStorage<ChatThread[]>("cc_chat_threads", []);
  const [activeThreadId, setActiveThreadId] = useLocalStorage<string | null>("cc_active_thread_id", null);
  const [isStreaming, setIsStreaming] = useState(false);

  // Helper to generate a thread title from a message
  const generateTitle = (text: string): string => {
    const cleanText = text.trim();
    if (!cleanText) return "New Conversation";
    const words = cleanText.split(/\s+/);
    if (words.length <= 5) {
      return cleanText;
    }
    const tentative = words.slice(0, 5).join(" ");
    return tentative.length > 25 ? tentative.slice(0, 25) + "..." : tentative + "...";
  };

  // Create thread
  const createThread = useCallback((initialMessage?: string): string => {
    const threadId = crypto.randomUUID();
    const now = Date.now();
    const title = initialMessage ? generateTitle(initialMessage) : "New Conversation";
    
    const newThread: ChatThread = {
      id: threadId,
      title,
      messages: [],
      createdAt: now,
      updatedAt: now,
    };

    setThreads((prev) => {
      // Sort threads by updatedAt descending, cap at 20
      const sorted = [...prev].sort((a, b) => b.updatedAt - a.updatedAt);
      if (sorted.length >= MAX_THREADS) {
        // Remove the oldest updated thread
        sorted.pop();
      }
      return [newThread, ...sorted];
    });

    setActiveThreadId(threadId);
    return threadId;
  }, [setThreads, setActiveThreadId]);

  // Delete thread
  const deleteThread = useCallback((id: string) => {
    setThreads((prev) => {
      const filtered = prev.filter((t) => t.id !== id);
      
      // If we are deleting the active thread, find a new active thread
      if (activeThreadId === id) {
        const remainingSorted = [...filtered].sort((a, b) => b.updatedAt - a.updatedAt);
        if (remainingSorted.length > 0) {
          setActiveThreadId(remainingSorted[0].id);
        } else {
          setActiveThreadId(null);
        }
      }
      return filtered;
    });
  }, [activeThreadId, setThreads, setActiveThreadId]);

  // To prevent rendering with no active thread, we automatically create one if threads are loaded and empty
  const initializeIfEmpty = useCallback(() => {
    if (threads.length === 0) {
      createThread();
    } else if (!activeThreadId || !threads.some((t) => t.id === activeThreadId)) {
      // Set active thread to the most recently updated one
      const sorted = [...threads].sort((a, b) => b.updatedAt - a.updatedAt);
      setActiveThreadId(sorted[0].id);
    }
  }, [threads, activeThreadId, createThread, setActiveThreadId]);

  // Run initialization after client mount when threads loaded
  useEffect(() => {
    const t = setTimeout(() => {
      initializeIfEmpty();
    }, 50);
    return () => clearTimeout(t);
  }, [initializeIfEmpty]);

  // Add message to active thread
  const addMessage = useCallback((role: ChatRole, content: string) => {
    let currentActiveId = activeThreadId;
    
    // Safety check: if no active thread, create one
    if (!currentActiveId) {
      currentActiveId = createThread(role === "user" ? content : undefined);
    }

    const newMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role,
      content,
      timestamp: Date.now(),
    };

    setThreads((prev) => {
      return prev.map((t) => {
        if (t.id === currentActiveId) {
          let messages = [...t.messages, newMessage];
          if (messages.length > 50) {
            messages = messages.slice(-50);
          }
          const isDefaultTitle = t.title === "New Conversation" || t.title === "";
          const newTitle = (role === "user" && isDefaultTitle) ? generateTitle(content) : t.title;
          return {
            ...t,
            title: newTitle,
            messages,
            updatedAt: Date.now(),
          };
        }
        return t;
      });
    });
  }, [activeThreadId, createThread, setThreads]);

  // Update streaming message in active thread
  const updateStreamingMessage = useCallback((id: string, chunk: string, done: boolean = false) => {
    const currentActiveId = activeThreadId;
    if (!currentActiveId) return;

    setThreads((prev) => {
      return prev.map((t) => {
        if (t.id === currentActiveId) {
          const existing = t.messages.find((m) => m.id === id);
          let updatedMessages: ChatMessage[];
          if (!existing) {
            const newMsg: ChatMessage = {
              id,
              role: "assistant",
              content: chunk,
              timestamp: Date.now(),
              isStreaming: !done,
            };
            updatedMessages = [...t.messages, newMsg];
          } else {
            updatedMessages = t.messages.map((m) =>
              m.id === id
                ? { ...m, content: m.content + chunk, isStreaming: !done }
                : m
            );
          }
          if (done && updatedMessages.length > 50) {
            updatedMessages = updatedMessages.slice(-50);
          }
          return {
            ...t,
            messages: updatedMessages,
            updatedAt: Date.now(),
          };
        }
        return t;
      });
    });
    setIsStreaming(!done);
  }, [activeThreadId, setThreads]);

  // Update metadata on an existing message in the active thread
  const updateMessageMetadata = useCallback((
    messageId: string,
    updates: Partial<Pick<ChatMessage, "loggedActivities" | "undoTimeLimit" | "undone">>
  ) => {
    const currentActiveId = activeThreadId;
    if (!currentActiveId) return;

    setThreads((prev) => {
      return prev.map((t) => {
        if (t.id === currentActiveId) {
          return {
            ...t,
            messages: t.messages.map((m) =>
              m.id === messageId ? { ...m, ...updates } : m
            ),
            updatedAt: Date.now(),
          };
        }
        return t;
      });
    });
  }, [activeThreadId, setThreads]);

  // Get current active thread details
  const activeThread = threads.find((t) => t.id === activeThreadId);

  return {
    threads,
    activeThreadId,
    activeThread,
    createThread,
    deleteThread,
    setActiveThreadId,
    addMessage,
    updateStreamingMessage,
    updateMessageMetadata,
    isStreaming,
  };
}
