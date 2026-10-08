import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import App from "./App";
import type { Vehicle } from "./domain/types";

function makeFleet(): Vehicle[] {
  const fleet: Vehicle[] = [];
  for (let i = 1; i <= 8; i++) {
    fleet.push({
      id: `toyota-${i}`,
      vin: `TOY${i}`,
      make: "Toyota",
      model: "Corolla",
      year: 2023,
      price: 20000 + i,
      dateReceived: "2026-09-01T00:00:00.000Z",
    });
  }
  for (let i = 1; i <= 7; i++) {
    fleet.push({
      id: `honda-${i}`,
      vin: `HON${i}`,
      make: "Honda",
      model: "Civic",
      year: 2022,
      price: 19000 + i,
      dateReceived: "2026-08-01T00:00:00.000Z",
    });
  }
  return fleet; // 15 total: page size 10 -> 2 pages
}

vi.mock("./api/client", () => ({
  api: {
    getVehicles: vi.fn(() => Promise.resolve(makeFleet())),
    getActions: vi.fn(() => Promise.resolve([])),
    postAction: vi.fn(),
  },
}));

describe("App integration", () => {
  it("loads vehicles and shows the first page", async () => {
    render(<App />);

    expect(await screen.findByText(/15 vehicles on lot/i)).toBeInTheDocument();
    expect(screen.getByText("1–10 of 15")).toBeInTheDocument();
    expect(screen.getAllByRole("row")).toHaveLength(11); // 10 data rows + header
  });

  it("filtering by make narrows the table and resets to page 1", async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByText(/15 vehicles on lot/i);

    // Move to page 2 first
    await user.click(screen.getByRole("button", { name: /next/i }));
    expect(screen.getByText("11–15 of 15")).toBeInTheDocument();

    // Filtering should snap back to page 1 with only the matching make
    await user.selectOptions(screen.getByLabelText("Make"), "Honda");

    await waitFor(() => expect(screen.getByText("1–7 of 7")).toBeInTheDocument());
    const rows = screen.getAllByRole("row").slice(1);
    expect(rows).toHaveLength(7);
    rows.forEach((row) => expect(within(row).getByText(/Honda/)).toBeInTheDocument());
  });

  it("clicking a vehicle opens its detail panel", async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByText(/15 vehicles on lot/i);

    await user.click(screen.getByText("TOY1"));

    expect(await screen.findByRole("complementary", { name: /actions for toy1/i })).toBeInTheDocument();
  });
});
