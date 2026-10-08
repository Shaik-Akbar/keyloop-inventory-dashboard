import { useState } from "react";
import type { Vehicle } from "../domain/types";
import { useVehicleActions } from "../hooks/useVehicleActions";
import { daysInStock, isAgingStock } from "../domain/inventory";
import { VehiclePhoto } from "./VehiclePhoto";

interface ActionLogPanelProps {
  vehicle: Vehicle;
  onClose: () => void;
}

const dateTime = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" });

export function ActionLogPanel({ vehicle, onClose }: ActionLogPanelProps) {
  const { actions, loading, error, submitting, addAction } = useVehicleActions(vehicle.id);
  const [note, setNote] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ok = await addAction(note);
    if (ok) setNote("");
  }

  return (
    <aside className="action-panel" aria-label={`Actions for ${vehicle.vin}`}>
      <button type="button" className="icon-button action-panel__close" onClick={onClose} aria-label="Close">
        ×
      </button>

      <VehiclePhoto vehicle={vehicle} />

      <div className="action-panel__meta">
        <h2>
          {vehicle.year} {vehicle.make} {vehicle.model}
        </h2>
        <p className="mono muted">{vehicle.vin}</p>
        <p className="muted">
          {daysInStock(vehicle)} days in stock
          {isAgingStock(vehicle) ? " — aging stock" : ""}
        </p>
      </div>

      <form className="action-form" onSubmit={handleSubmit}>
        <label htmlFor="action-note">Log a follow-up action</label>
        <textarea
          id="action-note"
          placeholder="e.g. Price reduction planned"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          required
        />
        <button type="submit" disabled={submitting || note.trim().length === 0}>
          {submitting ? "Saving…" : "Save action"}
        </button>
      </form>

      {error && <p className="error-text">{error}</p>}

      <div className="action-log">
        <h3>History</h3>
        {loading && <p className="muted">Loading…</p>}
        {!loading && actions.length === 0 && <p className="muted">No actions logged yet.</p>}
        <ul>
          {actions.map((action) => (
            <li key={action.id}>
              <span className="action-log__time">{dateTime.format(new Date(action.createdAt))}</span>
              <span>{action.note}</span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
