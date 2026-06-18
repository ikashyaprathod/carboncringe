import React from "react";
import { render, screen } from "@testing-library/react";
import { CategoryBreakdown } from "@/components/dashboard/CategoryBreakdown";
import type { FootprintBreakdown } from "@/types";

// Mock Recharts to render predictable HTML structures in JSDom
jest.mock("recharts", () => {
  return {
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    BarChart: ({ data, children }: { data: { name: string; value: number }[]; children: React.ReactNode }) => (
      <div data-testid="bar-chart" data-data={JSON.stringify(data)}>
        {children}
      </div>
    ),
    Bar: ({ dataKey }: { dataKey: string }) => <div data-testid="bar" data-key={dataKey} />,
    Cell: ({ fill }: { fill: string }) => <div data-testid="cell" data-fill={fill} />,
    XAxis: () => <div />,
    YAxis: ({ dataKey }: { dataKey: string }) => <div data-testid="y-axis" data-key={dataKey} />,
    Tooltip: () => <div />,
  };
});

describe("CategoryBreakdown", () => {
  const emptyBreakdown: FootprintBreakdown = {
    transport: 0,
    food: 0,
    energy: 0,
    shopping: 0,
  };

  const sampleBreakdown: FootprintBreakdown = {
    transport: 12.5,
    food: 4.2,
    energy: 0,
    shopping: 1.1,
  };

  it("renders empty state placeholder when no emissions logged", () => {
    render(<CategoryBreakdown breakdown={emptyBreakdown} />);
    expect(
      screen.getByText("nothing logged yet — the chart is as empty as your carbon guilt")
    ).toBeInTheDocument();
  });

  it("renders chart element and filters zero values", () => {
    render(<CategoryBreakdown breakdown={sampleBreakdown} />);
    
    // Check that our mock elements are rendered
    const chart = screen.getByTestId("bar-chart");
    expect(chart).toBeInTheDocument();
    
    const dataString = chart.getAttribute("data-data");
    expect(dataString).toBeTruthy();
    
    const parsedData = JSON.parse(dataString!);
    // Zero-value categories (energy: 0) should be filtered out
    expect(parsedData).toHaveLength(3);
    
    // Verify sorted descending order
    expect(parsedData[0].name).toBe("Transport");
    expect(parsedData[0].value).toBe(12.5);
    expect(parsedData[1].name).toBe("Food");
    expect(parsedData[1].value).toBe(4.2);
    expect(parsedData[2].name).toBe("Shopping");
    expect(parsedData[2].value).toBe(1.1);
  });
});
