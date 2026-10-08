import { useState } from "react";
import type { Vehicle } from "../domain/types";

// Fallback illustration for when a vehicle has no photoUrl, or the photo
// fails to load (e.g. a Wikimedia Commons file gets renamed/deleted) — the
// seam the real backend/CDN would sit behind later stays intact either way.
const PALETTE = [
  { bg: "#eef0ff", fg: "#5457c9" },
  { bg: "#eafaf2", fg: "#2f9e6b" },
  { bg: "#fff2e8", fg: "#c2703a" },
  { bg: "#feeef0", fg: "#c0506a" },
  { bg: "#eefaf9", fg: "#2a9792" },
  { bg: "#f3f0fe", fg: "#7a5bc9" },
];

function paletteFor(vehicle: Vehicle) {
  let hash = 0;
  for (let i = 0; i < vehicle.vin.length; i++) hash = (hash * 31 + vehicle.vin.charCodeAt(i)) >>> 0;
  return PALETTE[hash % PALETTE.length];
}

function VehicleIllustration({ vehicle }: { vehicle: Vehicle }) {
  const { bg, fg } = paletteFor(vehicle);
  return (
    <div className="vehicle-photo__illustration" style={{ background: bg }}>
      <svg viewBox="0 0 160 90" role="img" aria-label={`Illustration of a ${vehicle.make} ${vehicle.model}`}>
        <ellipse cx="80" cy="74" rx="62" ry="5" fill={fg} opacity="0.12" />
        <path
          d="M20 62 L26 40 Q30 32 40 31 L62 29 Q68 22 78 22 L96 22 Q104 22 108 29 L122 31 Q134 32 138 42 L140 62 Z"
          fill={fg}
          opacity="0.9"
        />
        <path d="M60 31 L66 42 L104 42 L98 31 Z" fill={bg} />
        <line x1="84" y1="31" x2="84" y2="42" stroke={fg} strokeWidth="2" opacity="0.9" />
        <circle cx="46" cy="63" r="11" fill="#1a1c22" />
        <circle cx="46" cy="63" r="4.5" fill={bg} />
        <circle cx="114" cy="63" r="11" fill="#1a1c22" />
        <circle cx="114" cy="63" r="4.5" fill={bg} />
        <rect x="18" y="58" width="8" height="4" rx="1.5" fill={fg} />
      </svg>
    </div>
  );
}

export function VehiclePhoto({ vehicle }: { vehicle: Vehicle }) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="vehicle-photo">
      {vehicle.photoUrl && !failed ? (
        <img
          className="vehicle-photo__img"
          src={vehicle.photoUrl}
          alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        <VehicleIllustration vehicle={vehicle} />
      )}
      <span className="vehicle-photo__tag">{vehicle.year}</span>
    </div>
  );
}
