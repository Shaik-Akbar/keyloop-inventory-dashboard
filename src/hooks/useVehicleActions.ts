import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client";
import { log } from "../lib/logger";
import type { VehicleAction } from "../domain/types";

interface UseVehicleActionsResult {
  actions: VehicleAction[];
  loading: boolean;
  error: string | null;
  submitting: boolean;
  addAction: (note: string) => Promise<boolean>;
}

export function useVehicleActions(vehicleId: string | null): UseVehicleActionsResult {
  const [actions, setActions] = useState<VehicleAction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!vehicleId) {
      setActions([]);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    api
      .getActions(vehicleId)
      .then((data) => {
        if (cancelled) return;
        setActions(data.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
      })
      .catch((err) => {
        if (cancelled) return;
        setError("Couldn't load activity for this vehicle.");
        log("api_error", { scope: "useVehicleActions", message: String(err) });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [vehicleId]);

  const addAction = useCallback(
    async (note: string): Promise<boolean> => {
      if (!vehicleId || !note.trim()) return false;
      setSubmitting(true);
      try {
        const created = await api.postAction(vehicleId, note.trim());
        setActions((prev) => [created, ...prev]);
        log("action_logged", { vehicleId });
        return true;
      } catch (err) {
        log("action_log_failed", { vehicleId, message: String(err) });
        setError("Couldn't save that action. Try again.");
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [vehicleId],
  );

  return { actions, loading, error, submitting, addAction };
}
