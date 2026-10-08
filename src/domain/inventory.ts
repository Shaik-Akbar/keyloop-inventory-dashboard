import type { Vehicle, VehicleFilters } from "./types";

export const AGING_THRESHOLD_DAYS = 90;

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export function daysInStock(vehicle: Vehicle, now: Date = new Date()): number {
  const received = new Date(vehicle.dateReceived).getTime();
  return Math.floor((now.getTime() - received) / MS_PER_DAY);
}

export function isAgingStock(vehicle: Vehicle, now: Date = new Date()): boolean {
  return daysInStock(vehicle, now) > AGING_THRESHOLD_DAYS;
}

export function filterVehicles(
  vehicles: Vehicle[],
  filters: VehicleFilters,
  now: Date = new Date(),
): Vehicle[] {
  return vehicles.filter((vehicle) => {
    if (filters.make && vehicle.make !== filters.make) return false;
    if (filters.model && vehicle.model !== filters.model) return false;
    if (filters.agingOnly && !isAgingStock(vehicle, now)) return false;
    return true;
  });
}

export function sortByDaysInStockDesc(vehicles: Vehicle[], now: Date = new Date()): Vehicle[] {
  return [...vehicles].sort((a, b) => daysInStock(b, now) - daysInStock(a, now));
}

export function uniqueMakes(vehicles: Vehicle[]): string[] {
  return [...new Set(vehicles.map((v) => v.make))].sort();
}

export function uniqueModels(vehicles: Vehicle[], make?: string): string[] {
  const pool = make ? vehicles.filter((v) => v.make === make) : vehicles;
  return [...new Set(pool.map((v) => v.model))].sort();
}

export function totalPages(itemCount: number, pageSize: number): number {
  return Math.max(1, Math.ceil(itemCount / pageSize));
}

export function paginate<T>(items: T[], page: number, pageSize: number): T[] {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}
