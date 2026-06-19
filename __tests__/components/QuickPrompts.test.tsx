import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { QuickPrompts } from "@/components/chat/QuickPrompts";
import "@testing-library/jest-dom";

describe("QuickPrompts Component", () => {
  it("renders all four prompt buttons", () => {
    const handleSelect = jest.fn();
    render(<QuickPrompts onSelect={handleSelect} />);

    expect(screen.getByRole("button", { name: /Ask AI: roast my day/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Ask AI: log something for me/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Ask AI: how am I doing this week/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Ask AI: give me one easy win/i })).toBeInTheDocument();
  });

  it("calls onSelect callback with exact prompt text when a button is clicked", () => {
    const handleSelect = jest.fn();
    render(<QuickPrompts onSelect={handleSelect} />);

    const button = screen.getByRole("button", { name: /Ask AI: roast my day/i });
    fireEvent.click(button);

    expect(handleSelect).toHaveBeenCalledWith("roast my day 💀");
  });
});
