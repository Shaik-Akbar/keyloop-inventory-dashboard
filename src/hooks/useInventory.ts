import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client";
import { log } from "../lib/logger";
import type { Vehicle } from "../domain/types";

interface UseInventoryResult {
  vehicles: Vehicle[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useInventory(): UseInventoryResult {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    api
      .getVehicles()
      .then((data) => {
        if (cancelled) return;
        setVehicles(data);
        log("inventory_loaded", { count: data.length });
      })
      .catch((err) => {
        if (cancelled) return;
        setError("Couldn't load inventory. Try again.");
        log("inventory_load_failed", { message: String(err) });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  const refetch = useCallback(() => setReloadToken((t) => t + 1), []);

  return { vehicles, loading, error, refetch };
}
