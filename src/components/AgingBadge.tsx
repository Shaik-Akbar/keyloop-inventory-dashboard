import { isAgingStock, daysInStock } from "../domain/inventory";
import type { Vehicle } from "../domain/types";

export function AgingBadge({ vehicle }: { vehicle: Vehicle }) {
  const days = daysInStock(vehicle);
  const aging = isAgingStock(vehicle);

  return (
    <span className={aging ? "badge badge--aging" : "badge"}>
      {days}d{aging ? " · aging" : ""}
    </span>
  );
}
