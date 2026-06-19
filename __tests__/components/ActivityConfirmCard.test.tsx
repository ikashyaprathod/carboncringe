import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { ActivityConfirmCard } from "@/components/chat/ActivityConfirmCard";
import "@testing-library/jest-dom";

describe("ActivityConfirmCard Component", () => {
  const mockLoggedActivities = [
    {
      id: "entry-1",
      category: "food",
      activityType: "meat_meal",
      quantity: 2,
      kgCO2e: 6.6,
      label: "Meat Meal",
      emoji: "🥩",
    },
  ];

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("renders activities list correctly", () => {
    render(
      <ActivityConfirmCard
        loggedActivities={mockLoggedActivities}
        undoTimeLimit={Date.now() + 5000}
        undone={false}
        onUndo={jest.fn()}
      />
    );

    expect(screen.getByText("Meat Meal")).toBeInTheDocument();
    expect(screen.getByText("(2 • 6.6kg)")).toBeInTheDocument();
    expect(screen.getByText("🥩")).toBeInTheDocument();
  });

  it("displays the countdown timer correctly and updates over time", () => {
    const timeLimit = Date.now() + 5000;
    render(
      <ActivityConfirmCard
        loggedActivities={mockLoggedActivities}
        undoTimeLimit={timeLimit}
        undone={false}
        onUndo={jest.fn()}
      />
    );

    expect(screen.getByRole("button", { name: "Undo logging these activities" })).toHaveTextContent("undo (5s)");

    // Fast-forward 2 seconds
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(screen.getByRole("button", { name: "Undo logging these activities" })).toHaveTextContent("undo (3s)");
  });

  it("calls onUndo when the undo button is clicked", () => {
    const mockOnUndo = jest.fn();
    render(
      <ActivityConfirmCard
        loggedActivities={mockLoggedActivities}
        undoTimeLimit={Date.now() + 5000}
        undone={false}
        onUndo={mockOnUndo}
      />
    );

    const undoButton = screen.getByRole("button", { name: "Undo logging these activities" });
    fireEvent.click(undoButton);
    expect(mockOnUndo).toHaveBeenCalledTimes(1);
  });

  it("renders undone state when undone is true", () => {
    render(
      <ActivityConfirmCard
        loggedActivities={mockLoggedActivities}
        undoTimeLimit={Date.now() + 5000}
        undone={true}
        onUndo={jest.fn()}
      />
    );

    expect(screen.getByText("logging undone")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("hides the undo button after the timer expires", () => {
    const timeLimit = Date.now() + 5000;
    render(
      <ActivityConfirmCard
        loggedActivities={mockLoggedActivities}
        undoTimeLimit={timeLimit}
        undone={false}
        onUndo={jest.fn()}
      />
    );

    expect(screen.getByRole("button", { name: "Undo logging these activities" })).toBeInTheDocument();

    // Fast-forward 6 seconds (beyond 5s limit)
    act(() => {
      jest.advanceTimersByTime(6000);
    });

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getByText("✓")).toBeInTheDocument();
  });
});
