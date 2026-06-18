import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ActivitySelector } from "@/components/logging/ActivitySelector";

describe("ActivitySelector", () => {
  const mockOnLog = jest.fn();

  beforeEach(() => {
    mockOnLog.mockClear();
  });

  it("renders all category tabs", () => {
    render(<ActivitySelector onLog={mockOnLog} />);
    
    expect(screen.getByRole("tab", { name: /All/ })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Transport/ })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Food/ })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Energy/ })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Shopping/ })).toBeInTheDocument();
  });

  it("renders buttons for active tab transport", () => {
    render(<ActivitySelector onLog={mockOnLog} />);
    
    // Switch to Transport tab
    fireEvent.click(screen.getByRole("tab", { name: /Transport/ }));
    
    // Expand Transport card
    fireEvent.click(screen.getByRole("button", { name: /Transport/ }));
    
    // Check for Car and Flight buttons
    expect(screen.getByText("Car")).toBeInTheDocument();
    expect(screen.getByText("Short-haul flight")).toBeInTheDocument();
    expect(screen.getByText("Long-haul flight")).toBeInTheDocument();
  });

  it("calls onLog with correct args when button clicked", () => {
    render(<ActivitySelector onLog={mockOnLog} />);
    
    // Switch to Food tab
    fireEvent.click(screen.getByRole("tab", { name: /Food/ }));
    
    // Expand Food card
    fireEvent.click(screen.getByRole("button", { name: /Food/ }));

    // Click the Veggie Meal button
    fireEvent.click(screen.getByText("Veggie meal"));
    
    // Verify callback was triggered
    expect(mockOnLog).toHaveBeenCalledTimes(1);
    expect(mockOnLog).toHaveBeenCalledWith("vegetarian_meal", 1);
  });
});
