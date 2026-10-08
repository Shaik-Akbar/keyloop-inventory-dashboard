import type { Vehicle, VehicleFilters } from "../domain/types";
import { uniqueMakes, uniqueModels } from "../domain/inventory";

interface FilterBarProps {
  vehicles: Vehicle[];
  filters: VehicleFilters;
  onChange: (filters: VehicleFilters) => void;
  agingCount: number;
}

export function FilterBar({ vehicles, filters, onChange, agingCount }: FilterBarProps) {
  const makes = uniqueMakes(vehicles);
  const models = uniqueModels(vehicles, filters.make);

  return (
    <div className="filter-bar">
      <div className="filter-field">
        <label htmlFor="filter-make">Make</label>
        <select
          id="filter-make"
          value={filters.make ?? ""}
          onChange={(e) =>
            onChange({ ...filters, make: e.target.value || undefined, model: undefined })
          }
        >
          <option value="">All makes</option>
          {makes.map((make) => (
            <option key={make} value={make}>
              {make}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-field">
        <label htmlFor="filter-model">Model</label>
        <select
          id="filter-model"
          value={filters.model ?? ""}
          onChange={(e) => onChange({ ...filters, model: e.target.value || undefined })}
        >
          <option value="">All models</option>
          {models.map((model) => (
            <option key={model} value={model}>
              {model}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-field">
        <span className="filter-field__label" aria-hidden="true">
          Status
        </span>
        <button
          type="button"
          className={filters.agingOnly ? "chip-toggle is-active" : "chip-toggle"}
          aria-pressed={filters.agingOnly ?? false}
          onClick={() => onChange({ ...filters, agingOnly: !filters.agingOnly })}
        >
          Aging stock only
          <span className="chip-toggle__count">{agingCount}</span>
        </button>
      </div>
    </div>
  );
}
