import React from "react";
import { render, screen } from "@testing-library/react";
import { StreakCounter } from "@/components/dashboard/StreakCounter";

describe("StreakCounter", () => {
  it("renders zero streak state correctly", () => {
    render(
      <StreakCounter
        currentStreak={0}
        longestStreak={0}
        totalLowImpactDays={0}
      />
    );

    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.getByText("🌑")).toBeInTheDocument();
    expect(screen.getByText("log a day under 5kg to start 🌱")).toBeInTheDocument();
  });

  it("renders active streak state correctly", () => {
    render(
      <StreakCounter
        currentStreak={5}
        longestStreak={10}
        totalLowImpactDays={15}
      />
    );

    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("🔥")).toBeInTheDocument();
    expect(screen.queryByText("log a day under 5kg to start 🌱")).not.toBeInTheDocument();
    
    // Check best streak and total low impact text
    expect(screen.getByText("10d")).toBeInTheDocument();
    expect(screen.getByText("15d")).toBeInTheDocument();
  });
});
