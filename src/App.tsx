import { useMemo, useState } from "react";
import { useInventory } from "./hooks/useInventory";
import { filterVehicles, isAgingStock, paginate, sortByDaysInStockDesc, totalPages } from "./domain/inventory";
import type { Vehicle, VehicleFilters } from "./domain/types";
import { FilterBar } from "./components/FilterBar";
import { InventoryTable } from "./components/InventoryTable";
import { Pagination } from "./components/Pagination";
import { ActionLogPanel } from "./components/ActionLogPanel";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { log } from "./lib/logger";

const PAGE_SIZE = 10;

export default function App() {
  const { vehicles, loading, error, refetch } = useInventory();
  const [filters, setFilters] = useState<VehicleFilters>({});
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Vehicle | null>(null);

  const filtered = useMemo(() => filterVehicles(vehicles, filters), [vehicles, filters]);
  const sorted = useMemo(() => sortByDaysInStockDesc(filtered), [filtered]);
  const pageCount = useMemo(() => totalPages(sorted.length, PAGE_SIZE), [sorted.length]);
  const paged = useMemo(() => paginate(sorted, page, PAGE_SIZE), [sorted, page]);
  const agingCount = useMemo(() => vehicles.filter((v) => isAgingStock(v)).length, [vehicles]);

  function handleFilterChange(next: VehicleFilters) {
    setFilters(next);
    setPage(1);
    log("filter_applied", { ...next });
  }

  function handlePageChange(next: number) {
    setPage(next);
    log("page_changed", { page: next });
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header__row">
          <div className="app-header__brand">
            <h1>Vehicle Hub</h1>
          </div>
          <div className="app-header__wordmark">
            keyloop<span className="app-header__wordmark-divider" />
            <span className="app-header__product">FUSION</span>
          </div>
        </div>
        <p className="app-header__subtitle">
          {vehicles.length} vehicles on lot · {agingCount} aging past 90 days
        </p>
      </header>

      <main className="app-main">
        <ErrorBoundary
          fallback={
            <div className="error-state">
              <p>Something went wrong showing the inventory.</p>
              <button type="button" onClick={refetch}>
                Try again
              </button>
            </div>
          }
        >
          {loading && <p className="muted">Loading inventory…</p>}

          {error && (
            <div className="error-state">
              <p>{error}</p>
              <button type="button" onClick={refetch}>
                Retry
              </button>
            </div>
          )}

          {!loading && !error && (
            <>
              <FilterBar vehicles={vehicles} filters={filters} onChange={handleFilterChange} agingCount={agingCount} />
              <InventoryTable vehicles={paged} selectedId={selected?.id ?? null} onSelect={setSelected} />
              <Pagination
                page={page}
                totalPages={pageCount}
                totalItems={sorted.length}
                pageSize={PAGE_SIZE}
                onChange={handlePageChange}
              />
            </>
          )}
        </ErrorBoundary>
      </main>

      {selected && <ActionLogPanel vehicle={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
