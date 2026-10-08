import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { InventoryTable } from "./InventoryTable";
import type { Vehicle } from "../domain/types";

function daysAgoIso(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString();
}

const vehicles: Vehicle[] = [
  {
    id: "aging",
    vin: "VIN_AGING",
    make: "Honda",
    model: "Civic",
    year: 2022,
    price: 19000,
    dateReceived: daysAgoIso(120),
  },
  {
    id: "fresh",
    vin: "VIN_FRESH",
    make: "Toyota",
    model: "Corolla",
    year: 2024,
    price: 25000,
    dateReceived: daysAgoIso(10),
  },
];

describe("InventoryTable", () => {
  it("shows an aging badge only for stock older than 90 days", () => {
    render(<InventoryTable vehicles={vehicles} selectedId={null} onSelect={() => {}} />);

    // InventoryTable renders rows in the order it's given — sorting is the caller's job.
    const rows = screen.getAllByRole("row").slice(1); // skip header row
    expect(rows[0]).toHaveTextContent("aging");
    expect(rows[1]).not.toHaveTextContent("aging");
  });

  it("renders an empty state when no vehicles match", () => {
    render(<InventoryTable vehicles={[]} selectedId={null} onSelect={() => {}} />);
    expect(screen.getByText(/no vehicles match/i)).toBeInTheDocument();
  });

  it("calls onSelect with the clicked vehicle", async () => {
    const onSelect = vi.fn();
    render(<InventoryTable vehicles={vehicles} selectedId={null} onSelect={onSelect} />);

    await userEvent.click(screen.getByText("VIN_AGING"));

    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: "aging" }));
  });
});
