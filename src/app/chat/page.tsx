"use client";

import React, { useCallback, useState } from "react";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { useChatThreads } from "@/hooks/useChatThreads";
import { useFootprint } from "@/hooks/useFootprint";
import { Trash2, History } from "lucide-react";

/**
 * ChatPage — ChatGPT/Claude-style full-viewport layout.
 *
 * Layout tree (no page scroll):
 *   <ConditionalMain> h-[100dvh] overflow-hidden pt-16   ← from layout.tsx
 *     <div> flex h-full                                   ← this page
 *       <ChatSidebar>  hidden lg:flex  fixed left column
 *       <div> flex-1 flex flex-col h-full                ← right area
 *         <header>   shrink-0                            ← title bar
 *         <ChatWindow> flex-1 overflow-y-auto            ← scrollable messages
 *         <footer>   shrink-0                            ← pinned input
 */
export default function ChatPage() {
  const {
    threads,
    activeThreadId,
    activeThread,
    createThread,
    deleteThread,
    setActiveThreadId,
    addMessage,
    updateStreamingMessage,
    isStreaming,
  } = useChatThreads();

  const { today } = useFootprint();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleSend = useCallback(
    async (text: string) => {
      const currentMessages = activeThread?.messages || [];
      addMessage("user", text);
      const streamId = crypto.randomUUID();

      const updatedMessages = [
        ...currentMessages,
        { role: "user" as const, content: text },
      ];

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-session-id": streamId,
          },
          body: JSON.stringify({
            messages: updatedMessages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            currentFootprint: today.totalKgCO2e,
            recentActivities: today.entries.slice(-5),
          }),
        });

        if (!res.ok || !res.body) {
          addMessage("assistant", "ngl something went wrong on my end 😬 try again?");
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            updateStreamingMessage(streamId, "", true);
            break;
          }
          const chunk = decoder.decode(value, { stream: true });
          updateStreamingMessage(streamId, chunk, false);
        }
      } catch {
        addMessage("assistant", "connection dropped mid-roast 💀 refresh and try again?");
      }
    },
    [activeThread, today, addMessage, updateStreamingMessage]
  );

  return (
    /* Full-height flex shell — ConditionalMain already locks the viewport */
    <div className="flex h-full gap-0 overflow-hidden">
      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <ChatSidebar
        threads={threads}
        activeThreadId={activeThreadId}
        onSelectThread={setActiveThreadId}
        onDeleteThread={deleteThread}
        onCreateThread={createThread}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        className="hidden lg:flex w-72 xl:w-80 flex-shrink-0 border-r border-[var(--glass-border)]"
      />

      {/* ── Main column ─────────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden">

        {/* Title bar — shrinks to content, never scrolls */}
        <div className="flex-shrink-0 flex items-center justify-between px-4 lg:px-6 py-3 border-b border-[var(--glass-border)] bg-[#0B0F0D]/60 backdrop-blur-md">
          <div className="flex items-center gap-2">
            {/* Mobile: history drawer trigger */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              aria-label="View history list"
              className="lg:hidden p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors hover:bg-white/5 rounded-xl border border-[var(--glass-border)]"
            >
              <History size={16} aria-hidden="true" />
            </button>
            <div>
              <h1 className="font-heading font-extrabold text-sm sm:text-base text-[var(--color-text)] leading-tight">
                {activeThread?.title || "your carbon bestie 🌍"}
              </h1>
              <p className="text-[var(--color-text-secondary)] text-[10px] sm:text-xs">
                today&apos;s footprint: {today.totalKgCO2e.toFixed(1)} kg CO₂e
              </p>
            </div>
          </div>

          {activeThread && activeThread.messages.length > 0 && (
            <button
              onClick={() => deleteThread(activeThread.id)}
              aria-label="Delete active conversation"
              className="text-[var(--color-text-muted)] hover:text-[var(--color-roast)] transition-colors p-2 rounded-xl hover:bg-white/5 border border-transparent hover:border-[var(--color-roast)]/20"
            >
              <Trash2 size={16} aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Messages — the ONLY scrollable area, fills all remaining space */}
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
          <ChatWindow messages={activeThread?.messages || []} isStreaming={isStreaming} />
        </div>

        {/* Input bar — pinned to bottom, never scrolls out of view */}
        <div className="flex-shrink-0 border-t border-[var(--glass-border)] bg-[#0B0F0D]/60 backdrop-blur-md px-4 lg:px-6 py-3 pb-[max(12px,env(safe-area-inset-bottom))]">
          <div className="max-w-3xl mx-auto">
            <ChatInput onSend={handleSend} disabled={isStreaming} />
          </div>
        </div>

      </div>
    </div>
  );
}
