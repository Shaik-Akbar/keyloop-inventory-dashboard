import type { Vehicle } from "../domain/types";
import { AgingBadge } from "./AgingBadge";

interface InventoryTableProps {
  vehicles: Vehicle[];
  selectedId: string | null;
  onSelect: (vehicle: Vehicle) => void;
}

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export function InventoryTable({ vehicles, selectedId, onSelect }: InventoryTableProps) {
  if (vehicles.length === 0) {
    return <p className="empty-state">No vehicles match these filters.</p>;
  }

  return (
    <table className="inventory-table">
      <thead>
        <tr>
          <th>Vehicle</th>
          <th>VIN</th>
          <th>Price</th>
          <th>In stock</th>
          <th aria-hidden="true" />
        </tr>
      </thead>
      <tbody>
        {vehicles.map((vehicle) => (
          <tr
            key={vehicle.id}
            className={vehicle.id === selectedId ? "is-selected" : undefined}
            onClick={() => onSelect(vehicle)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect(vehicle);
              }
            }}
            tabIndex={0}
          >
            <td>
              <span className="vehicle-name">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </span>
            </td>
            <td className="mono muted">{vehicle.vin}</td>
            <td className="tabular">{currency.format(vehicle.price)}</td>
            <td>
              <AgingBadge vehicle={vehicle} />
            </td>
            <td className="col-affordance" aria-hidden="true">
              ›
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
