/**
 * @fileoverview Unit tests for useChatThreads hook.
 */

import { renderHook, act } from "@testing-library/react";
import { useChatThreads } from "@/hooks/useChatThreads";

describe("useChatThreads hook", () => {
  let store: Record<string, string> = {};

  beforeAll(() => {
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: jest.fn((key: string) => store[key] || null),
        setItem: jest.fn((key: string, value: string) => {
          store[key] = value.toString();
        }),
        clear: jest.fn(() => {
          store = {};
        }),
        removeItem: jest.fn((key: string) => {
          delete store[key];
        }),
      },
      writable: true,
    });
  });

  beforeEach(() => {
    store = {};
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should initialize a thread if none exist", () => {
    const { result } = renderHook(() => useChatThreads());

    // Wait for the initialization timeout to run
    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(result.current.threads.length).toBe(1);
    expect(result.current.activeThreadId).toBe(result.current.threads[0].id);
    expect(result.current.threads[0].title).toBe("New Conversation");
  });

  it("should support creating a thread", () => {
    const { result } = renderHook(() => useChatThreads());

    act(() => {
      jest.advanceTimersByTime(100);
    });

    let newId: string = "";
    act(() => {
      newId = result.current.createThread();
    });

    expect(result.current.threads.length).toBe(2);
    expect(result.current.activeThreadId).toBe(newId);
  });

  it("should support adding messages and auto-titling", () => {
    const { result } = renderHook(() => useChatThreads());

    act(() => {
      jest.advanceTimersByTime(100);
    });

    act(() => {
      result.current.addMessage("user", "how do i reduce my carbon footprint today?");
    });

    const active = result.current.activeThread;
    expect(active?.messages.length).toBe(1);
    expect(active?.messages[0].content).toBe("how do i reduce my carbon footprint today?");
    expect(active?.title).toBe("how do i reduce my...");
  });

  it("should support deleting threads", () => {
    const { result } = renderHook(() => useChatThreads());

    act(() => {
      jest.advanceTimersByTime(100);
    });

    let threadIdToDelete: string = "";
    act(() => {
      threadIdToDelete = result.current.createThread();
    });

    expect(result.current.threads.length).toBe(2);

    act(() => {
      result.current.deleteThread(threadIdToDelete);
    });

    expect(result.current.threads.length).toBe(1);
    expect(result.current.activeThreadId).not.toBe(threadIdToDelete);
  });

  it("should enforce the maximum limit of 20 threads", () => {
    const { result } = renderHook(() => useChatThreads());

    act(() => {
      jest.advanceTimersByTime(100);
    });

    // Create 25 threads
    for (let i = 0; i < 25; i++) {
      act(() => {
        result.current.createThread(`Message number ${i}`);
      });
    }

    expect(result.current.threads.length).toBe(20);
  });

  it("should support updating message metadata", () => {
    const { result } = renderHook(() => useChatThreads());

    act(() => {
      jest.advanceTimersByTime(100);
    });

    act(() => {
      result.current.addMessage("user", "test query");
    });

    const active = result.current.activeThread;
    const msgId = active?.messages[0]?.id;
    expect(msgId).toBeDefined();

    act(() => {
      result.current.updateMessageMetadata(msgId!, {
        undone: true,
        undoTimeLimit: 12345,
      });
    });

    const updatedActive = result.current.activeThread;
    const msg = updatedActive?.messages.find((m) => m.id === msgId);
    expect(msg?.undone).toBe(true);
    expect(msg?.undoTimeLimit).toBe(12345);
  });
});
