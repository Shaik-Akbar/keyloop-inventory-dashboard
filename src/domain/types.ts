export interface Vehicle {
  id: string;
  vin: string;
  make: string;
  model: string;
  year: number;
  price: number;
  dateReceived: string; // ISO date
  photoUrl?: string;
}

export interface VehicleAction {
  id: string;
  vehicleId: string;
  note: string;
  createdAt: string; // ISO datetime
}

export interface VehicleFilters {
  make?: string;
  model?: string;
  agingOnly?: boolean;
}
