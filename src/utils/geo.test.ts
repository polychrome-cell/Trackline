import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateSegmentDistanceKm, interpolatePolyline, calculateBearing } from './geo';

test('calculateSegmentDistanceKm measures realistic distance between cities', () => {
  // Delhi to Mumbai ~1150 km great circle
  const delhi = { lat: 28.6427, lng: 77.2236 };
  const mumbai = { lat: 18.9696, lng: 72.8193 };
  const dist = calculateSegmentDistanceKm(delhi, mumbai);
  assert.ok(dist > 1100 && dist < 1250, `Expected ~1150km, got ${dist}`);
});

test('interpolatePolyline accurately traverses intermediate waypoints', () => {
  const pA = { lat: 0, lng: 0 };
  const pMid = { lat: 10, lng: 0 };
  const pB = { lat: 10, lng: 10 };
  const path = [pA, pMid, pB];

  // At 0% progress -> pA
  const start = interpolatePolyline(path, 0);
  assert.equal(start.lat, 0);
  assert.equal(start.lng, 0);

  // At 50% progress (since both legs are equal length) -> pMid
  const mid = interpolatePolyline(path, 0.5);
  assert.ok(Math.abs(mid.lat - 10) < 0.1);
  assert.ok(Math.abs(mid.lng - 0) < 0.1);

  // At 100% progress -> pB
  const end = interpolatePolyline(path, 1.0);
  assert.equal(end.lat, 10);
  assert.equal(end.lng, 10);
});

test('calculateBearing returns accurate cardinal and intermediate directions', () => {
  // Directly North: (0, 0) to (10, 0) -> 0°
  const north = calculateBearing({ lat: 0, lng: 0 }, { lat: 10, lng: 0 });
  assert.ok(Math.abs(north - 0) < 0.1, `Expected ~0°, got ${north}`);

  // Directly East: (0, 0) to (0, 10) -> 90°
  const east = calculateBearing({ lat: 0, lng: 0 }, { lat: 0, lng: 10 });
  assert.ok(Math.abs(east - 90) < 0.1, `Expected ~90°, got ${east}`);

  // Directly South: (10, 0) to (0, 0) -> 180°
  const south = calculateBearing({ lat: 10, lng: 0 }, { lat: 0, lng: 0 });
  assert.ok(Math.abs(south - 180) < 0.1, `Expected ~180°, got ${south}`);

  // Directly West: (0, 10) to (0, 0) -> 270°
  const west = calculateBearing({ lat: 0, lng: 0 }, { lat: 0, lng: -10 });
  assert.ok(Math.abs(west - 270) < 0.1, `Expected ~270°, got ${west}`);
});

