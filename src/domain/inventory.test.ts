import { describe, expect, it } from "vitest";
import {
  AGING_THRESHOLD_DAYS,
  daysInStock,
  filterVehicles,
  isAgingStock,
  paginate,
  sortByDaysInStockDesc,
  totalPages,
  uniqueMakes,
  uniqueModels,
} from "./inventory";
import type { Vehicle } from "./types";

const NOW = new Date("2026-01-01T00:00:00.000Z");

function vehicle(overrides: Partial<Vehicle>): Vehicle {
  return {
    id: "v1",
    vin: "VIN000001",
    make: "Toyota",
    model: "Corolla",
    year: 2023,
    price: 24000,
    dateReceived: "2025-12-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("daysInStock", () => {
  it("counts whole days between dateReceived and now", () => {
    const v = vehicle({ dateReceived: "2025-12-01T00:00:00.000Z" });
    expect(daysInStock(v, NOW)).toBe(31);
  });
});

describe("isAgingStock", () => {
  it("is false exactly at the threshold (90 days is not yet aging)", () => {
    const received = new Date(NOW.getTime() - AGING_THRESHOLD_DAYS * 86_400_000);
    const v = vehicle({ dateReceived: received.toISOString() });
    expect(isAgingStock(v, NOW)).toBe(false);
  });

  it("is true one day past the threshold (91 days)", () => {
    const received = new Date(NOW.getTime() - (AGING_THRESHOLD_DAYS + 1) * 86_400_000);
    const v = vehicle({ dateReceived: received.toISOString() });
    expect(isAgingStock(v, NOW)).toBe(true);
  });

  it("is false for a vehicle received today", () => {
    const v = vehicle({ dateReceived: NOW.toISOString() });
    expect(isAgingStock(v, NOW)).toBe(false);
  });
});

describe("filterVehicles", () => {
  const fleet: Vehicle[] = [
    vehicle({ id: "1", make: "Toyota", model: "Corolla", dateReceived: "2025-12-20T00:00:00.000Z" }),
    vehicle({ id: "2", make: "Toyota", model: "Camry", dateReceived: "2025-08-01T00:00:00.000Z" }),
    vehicle({ id: "3", make: "Honda", model: "Civic", dateReceived: "2025-07-01T00:00:00.000Z" }),
  ];

  it("filters by make", () => {
    const result = filterVehicles(fleet, { make: "Toyota" }, NOW);
    expect(result.map((v) => v.id)).toEqual(["1", "2"]);
  });

  it("filters by model", () => {
    const result = filterVehicles(fleet, { model: "Civic" }, NOW);
    expect(result.map((v) => v.id)).toEqual(["3"]);
  });

  it("filters to aging stock only", () => {
    const result = filterVehicles(fleet, { agingOnly: true }, NOW);
    expect(result.map((v) => v.id)).toEqual(["2", "3"]);
  });

  it("combines filters", () => {
    const result = filterVehicles(fleet, { make: "Toyota", agingOnly: true }, NOW);
    expect(result.map((v) => v.id)).toEqual(["2"]);
  });

  it("returns the full list when no filters are set", () => {
    expect(filterVehicles(fleet, {}, NOW)).toHaveLength(3);
  });
});

describe("sortByDaysInStockDesc", () => {
  it("orders the oldest stock first without mutating the input", () => {
    const fleet: Vehicle[] = [
      vehicle({ id: "newest", dateReceived: "2025-12-25T00:00:00.000Z" }),
      vehicle({ id: "oldest", dateReceived: "2025-01-01T00:00:00.000Z" }),
      vehicle({ id: "middle", dateReceived: "2025-09-01T00:00:00.000Z" }),
    ];
    const original = [...fleet];

    const sorted = sortByDaysInStockDesc(fleet, NOW);

    expect(sorted.map((v) => v.id)).toEqual(["oldest", "middle", "newest"]);
    expect(fleet).toEqual(original);
  });
});

describe("totalPages", () => {
  it("divides evenly", () => {
    expect(totalPages(12, 6)).toBe(2);
  });

  it("rounds up a partial last page", () => {
    expect(totalPages(13, 6)).toBe(3);
  });

  it("is never less than 1, even for an empty list", () => {
    expect(totalPages(0, 6)).toBe(1);
  });
});

describe("paginate", () => {
  const items = Array.from({ length: 13 }, (_, i) => i + 1); // [1..13]

  it("returns a full page", () => {
    expect(paginate(items, 1, 6)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it("returns the next page", () => {
    expect(paginate(items, 2, 6)).toEqual([7, 8, 9, 10, 11, 12]);
  });

  it("returns a partial final page", () => {
    expect(paginate(items, 3, 6)).toEqual([13]);
  });

  it("returns an empty array past the last page", () => {
    expect(paginate(items, 4, 6)).toEqual([]);
  });
});

describe("uniqueMakes / uniqueModels", () => {
  const fleet: Vehicle[] = [
    vehicle({ id: "1", make: "Toyota", model: "Corolla" }),
    vehicle({ id: "2", make: "Toyota", model: "Camry" }),
    vehicle({ id: "3", make: "Honda", model: "Civic" }),
  ];

  it("lists sorted unique makes", () => {
    expect(uniqueMakes(fleet)).toEqual(["Honda", "Toyota"]);
  });

  it("lists models scoped to a make", () => {
    expect(uniqueModels(fleet, "Toyota")).toEqual(["Camry", "Corolla"]);
  });

  it("lists all models when no make is given", () => {
    expect(uniqueModels(fleet)).toEqual(["Camry", "Civic", "Corolla"]);
  });
});
