/**
 * @fileoverview Hook for managing chat operations (sending messages, streaming AI roasts, NL activity extraction, and undo tracking).
 */

import { useCallback } from "react";
import type { ChatThread, ActivityEntry, ActivityType, ChatMessage, ChatRole } from "@/types";
import { getTodayKey } from "@/utils/date";
import { ACTIVITY_METADATA } from "@/utils/constants";
import { sanitizeUserInput } from "@/lib/sanitize";

interface LoggedActivityMetadata {
  id: string;
  category: string;
  activityType: ActivityType;
  quantity: number;
  kgCO2e: number;
  label: string;
  emoji: string;
}

export interface UseChatHandlerProps {
  activeThread: ChatThread | undefined;
  today: { totalKgCO2e: number; entries: ActivityEntry[] };
  addMessage: (role: ChatRole, content: string) => void;
  updateStreamingMessage: (id: string, chunk: string, done?: boolean) => void;
  updateMessageMetadata: (
    messageId: string,
    updates: Partial<Pick<ChatMessage, "loggedActivities" | "undoTimeLimit" | "undone">>
  ) => void;
  logActivity: (activityType: ActivityType, quantity: number, note?: string) => ActivityEntry;
  removeActivity: (id: string, date: string) => void;
}

/**
 * Checks if a string contains any keywords that suggest carbon activity logging.
 *
 * @param text - User input message
 */
function hasLoggableKeywords(text: string): boolean {
  const keywords = [
    "drove", "drive", "driving", "car", "km", "miles", "mile", "flight", "fly", "flying", "flew", "bus", "ride", "walk", "walked", "bike", "biked", "cycle", "cycling", "travel", "commute",
    "eat", "ate", "eating", "meal", "beef", "meat", "chicken", "vegetarian", "vegan", "burger", "steak", "order", "ordered", "delivery", "deliver", "food",
    "ac", "a/c", "air conditioning", "heater", "heating", "electricity", "appliance", "power", "run", "ran",
    "buy", "bought", "shopping", "fashion", "clothes", "dress", "shirt", "jeans", "secondhand", "thrift", "grocery", "groceries"
  ];
  const lower = text.toLowerCase();
  return keywords.some((k) => lower.includes(k));
}

/**
 * Hook to manage chat message submissions and activity confirmations.
 *
 * @param props - Custom hooks and state dependencies from page
 */
export function useChatHandler({
  activeThread,
  today,
  addMessage,
  updateStreamingMessage,
  updateMessageMetadata,
  logActivity,
  removeActivity,
}: UseChatHandlerProps) {

  /** Handles reverting logged activities from a message */
  const handleUndoLog = useCallback(
    (messageId: string) => {
      const msg = activeThread?.messages.find((m) => m.id === messageId);
      if (!msg || !msg.loggedActivities || msg.undone) return;

      const dateKey = getTodayKey();
      for (const act of msg.loggedActivities) {
        removeActivity(act.id, dateKey);
      }

      updateMessageMetadata(messageId, { undone: true });
    },
    [activeThread, removeActivity, updateMessageMetadata]
  );

  /** Helper to call the natural language log extraction endpoint */
  const extractActivities = useCallback(
    async (text: string): Promise<LoggedActivityMetadata[]> => {
      const loggedActsMetadata: LoggedActivityMetadata[] = [];
      if (!hasLoggableKeywords(text)) return loggedActsMetadata;

      try {
        const extractRes = await fetch("/api/extract-log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text }),
        });

        if (extractRes.ok) {
          const extractData = (await extractRes.json()) as {
            detectedActivities: { category: string; activityType: ActivityType; quantity: number; unit: string }[];
            confidence: "high" | "low";
          };

          if (extractData.confidence === "high" && extractData.detectedActivities.length > 0) {
            for (const act of extractData.detectedActivities) {
              const entry = logActivity(act.activityType, act.quantity);
              const meta = ACTIVITY_METADATA[act.activityType];

              loggedActsMetadata.push({
                id: entry.id,
                category: act.category,
                activityType: act.activityType,
                quantity: act.quantity,
                kgCO2e: entry.kgCO2e,
                label: meta.label,
                emoji: meta.emoji,
              });
            }
          }
        }
      } catch (err) {
        console.error("NL logging extraction failed:", err);
      }

      return loggedActsMetadata;
    },
    [logActivity]
  );

  /** Helper to call the chat completion endpoint and stream the result */
  const streamAIResponse = useCallback(
    async (
      streamId: string,
      updatedMessages: { role: ChatRole; content: string }[],
      footprint: number,
      recentEntries: ActivityEntry[],
      loggedActsMetadata: LoggedActivityMetadata[]
    ) => {
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-session-id": streamId,
          },
          body: JSON.stringify({
            messages: updatedMessages,
            currentFootprint: footprint,
            recentActivities: recentEntries.slice(-5),
          }),
        });

        if (!res.ok || !res.body) {
          addMessage("assistant", "something went wrong on my end. try again.");
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            updateStreamingMessage(streamId, "", true);
            if (loggedActsMetadata.length > 0) {
              updateMessageMetadata(streamId, {
                loggedActivities: loggedActsMetadata,
                undoTimeLimit: Date.now() + 5000,
              });
            }
            break;
          }
          const chunk = decoder.decode(value, { stream: true });
          updateStreamingMessage(streamId, chunk, false);
        }
      } catch {
        addMessage("assistant", "connection dropped. refresh and try again.");
      }
    },
    [addMessage, updateStreamingMessage, updateMessageMetadata]
  );

  /** Primary handler to process sending user inputs */
  const handleSend = useCallback(
    async (text: string) => {
      const sanitizedText = sanitizeUserInput(text, 500);
      if (!sanitizedText) return;

      const currentMessages = activeThread?.messages || [];
      addMessage("user", sanitizedText);
      const streamId = crypto.randomUUID();

      const updatedMessages = [
        ...currentMessages.map((m) => ({ role: m.role, content: m.content })),
        { role: "user" as ChatRole, content: sanitizedText },
      ];

      // 1. Perform Natural Language logging extraction check
      const loggedActsMetadata = await extractActivities(sanitizedText);

      // 2. Recalculate footprint & entries dynamically for the chat call
      let newFootprint = today.totalKgCO2e;
      const newEntries = [...today.entries];
      const todayKey = getTodayKey();

      if (loggedActsMetadata.length > 0) {
        for (const meta of loggedActsMetadata) {
          newFootprint += meta.kgCO2e;
          newEntries.push({
            id: meta.id,
            date: todayKey,
            category: meta.category,
            activityType: meta.activityType,
            quantity: meta.quantity,
            kgCO2e: meta.kgCO2e,
            loggedAt: Date.now(),
          } as ActivityEntry);
        }
      }

      // 3. Initiate AI completion streaming response
      await streamAIResponse(streamId, updatedMessages, newFootprint, newEntries, loggedActsMetadata);
    },
    [activeThread, today, addMessage, extractActivities, streamAIResponse]
  );

  return {
    handleUndoLog,
    handleSend,
  };
}
