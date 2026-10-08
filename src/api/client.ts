import { correlationId, log } from "../lib/logger";
import type { Vehicle, VehicleAction } from "../domain/types";

const BASE_URL = "/api";

export class ApiError extends Error {
  readonly status: number;
  readonly correlationId: string;

  constructor(message: string, status: number, correlationId: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.correlationId = correlationId;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const id = correlationId();

  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "X-Correlation-Id": id,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = new ApiError(`Request to ${path} failed with ${response.status}`, response.status, id);
      log("api_error", { path, correlationId: id, status: response.status });
      throw error;
    }

    return (await response.json()) as T;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    const error = new ApiError(`Network error calling ${path}`, 0, id);
    log("api_error", { path, correlationId: id, message: String(err) });
    throw error;
  }
}

export const api = {
  getVehicles(): Promise<Vehicle[]> {
    return request<Vehicle[]>("/vehicles");
  },

  getActions(vehicleId: string): Promise<VehicleAction[]> {
    return request<VehicleAction[]>(`/actions?vehicleId=${encodeURIComponent(vehicleId)}`);
  },

  postAction(vehicleId: string, note: string): Promise<VehicleAction> {
    return request<VehicleAction>("/actions", {
      method: "POST",
      body: JSON.stringify({
        vehicleId,
        note,
        createdAt: new Date().toISOString(),
      }),
    });
  },
};
