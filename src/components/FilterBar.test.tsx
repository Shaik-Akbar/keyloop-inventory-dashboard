import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { FilterBar } from "./FilterBar";
import type { Vehicle } from "../domain/types";

const vehicles: Vehicle[] = [
  { id: "1", vin: "V1", make: "Toyota", model: "Corolla", year: 2023, price: 20000, dateReceived: "2026-01-01" },
  { id: "2", vin: "V2", make: "Toyota", model: "Camry", year: 2023, price: 25000, dateReceived: "2026-01-01" },
  { id: "3", vin: "V3", make: "Honda", model: "Civic", year: 2022, price: 19000, dateReceived: "2026-01-01" },
];

describe("FilterBar", () => {
  it("lists makes derived from the vehicles it's given", () => {
    render(<FilterBar vehicles={vehicles} filters={{}} onChange={() => {}} agingCount={0} />);
    expect(screen.getByRole("option", { name: "Toyota" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Honda" })).toBeInTheDocument();
  });

  it("scopes model options to the selected make", () => {
    render(<FilterBar vehicles={vehicles} filters={{ make: "Toyota" }} onChange={() => {}} agingCount={0} />);
    expect(screen.getByRole("option", { name: "Corolla" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Camry" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "Civic" })).not.toBeInTheDocument();
  });

  it("selecting a make resets the model filter", async () => {
    const onChange = vi.fn();
    render(<FilterBar vehicles={vehicles} filters={{ model: "Civic" }} onChange={onChange} agingCount={0} />);

    await userEvent.selectOptions(screen.getByLabelText("Make"), "Toyota");

    expect(onChange).toHaveBeenCalledWith({ make: "Toyota", model: undefined });
  });

  it("selecting a model keeps the existing make", async () => {
    const onChange = vi.fn();
    render(<FilterBar vehicles={vehicles} filters={{ make: "Toyota" }} onChange={onChange} agingCount={0} />);

    await userEvent.selectOptions(screen.getByLabelText("Model"), "Camry");

    expect(onChange).toHaveBeenCalledWith({ make: "Toyota", model: "Camry" });
  });

  it("toggles aging-only on click and reflects state via aria-pressed", async () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <FilterBar vehicles={vehicles} filters={{}} onChange={onChange} agingCount={2} />,
    );

    const toggle = screen.getByRole("button", { name: /aging stock only/i });
    expect(toggle).toHaveAttribute("aria-pressed", "false");

    await userEvent.click(toggle);
    expect(onChange).toHaveBeenCalledWith({ agingOnly: true });

    rerender(<FilterBar vehicles={vehicles} filters={{ agingOnly: true }} onChange={onChange} agingCount={2} />);
    expect(screen.getByRole("button", { name: /aging stock only/i })).toHaveAttribute("aria-pressed", "true");
  });

  it("shows the aging count on the toggle", () => {
    render(<FilterBar vehicles={vehicles} filters={{}} onChange={() => {}} agingCount={5} />);
    expect(screen.getByText("5")).toBeInTheDocument();
  });
});
