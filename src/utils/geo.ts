export interface LatLng {
  lat: number;
  lng: number;
}

// Approximate distance between two lat/lng coordinates (Haversine formula in km)
export function calculateSegmentDistanceKm(p1: LatLng, p2: LatLng): number {
  const R = 6371; // Earth radius in km
  const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
  const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((p1.lat * Math.PI) / 180) *
      Math.cos((p2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Interpolate position along a multi-point polyline given progress (0.0 to 1.0)
export function interpolatePolyline(path: LatLng[], progress: number): LatLng {
  if (!path || path.length === 0) {
    return { lat: 0, lng: 0 };
  }
  if (path.length === 1) {
    return path[0];
  }

  // Normalize progress to [0, 1]
  const clampedProgress = Math.max(0, Math.min(1, progress));

  // Calculate segment lengths
  const segmentLengths: number[] = [];
  let totalLength = 0;

  for (let i = 0; i < path.length - 1; i++) {
    const len = calculateSegmentDistanceKm(path[i], path[i + 1]);
    segmentLengths.push(len);
    totalLength += len;
  }

  if (totalLength === 0) {
    return path[0];
  }

  const targetDistance = clampedProgress * totalLength;
  let accumulated = 0;

  for (let i = 0; i < segmentLengths.length; i++) {
    const segLen = segmentLengths[i];
    if (accumulated + segLen >= targetDistance || i === segmentLengths.length - 1) {
      const segProgress = segLen > 0 ? (targetDistance - accumulated) / segLen : 0;
      const pA = path[i];
      const pB = path[i + 1];
      return {
        lat: pA.lat + (pB.lat - pA.lat) * segProgress,
        lng: pA.lng + (pB.lng - pA.lng) * segProgress,
      };
    }
    accumulated += segLen;
  }

  return path[path.length - 1];
}

// Calculate compass bearing in degrees (0 = North, 90 = East, 180 = South, 270 = West)
export function calculateBearing(p1: LatLng, p2: LatLng): number {
  const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;
  const lat1 = (p1.lat * Math.PI) / 180;
  const lat2 = (p2.lat * Math.PI) / 180;

  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  const brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
}

