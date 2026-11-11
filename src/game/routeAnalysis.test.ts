import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generate7DayRouteDemand,
  calculateRouteCostBreakdown,
  calculateCorridorDensity,
  getDensityHeatColor,
  filterRoutesByTier,
  calculateTierPerformanceSummary,
} from './routeAnalysis';
import { BuiltRoute } from '../types';

const sampleRoute: BuiltRoute = {
  id: 'route-test-1',
  name: 'Delhi - Varanasi Vande Bharat Express',
  corridorId: 'corr-del-bsb',
  stationAId: 'ndls',
  stationBId: 'bsb',
  trackType: 'express',
  trackName: 'Gangetic Mainline Express',
  assignedTrainIds: ['train-1'],
  frequencyDaily: 8,
  departureSlots: [1, 2, 5, 8],
  ticketPrice: 95,
  distanceKm: 759,
  dailyPassengers: 6840,
  dailyRevenue: 245000,
  dailyCost: 115000,
  netProfit: 130000,
  delayRatePercent: 4.2,
  status: 'active',
};

test('generate7DayRouteDemand returns exactly 7 chronological daily records', () => {
  const currentDay = 21;
  const history = generate7DayRouteDemand(sampleRoute, currentDay);
  assert.equal(history.length, 7);
  assert.equal(history[0].day, 15);
  assert.equal(history[6].day, 21);

  for (const record of history) {
    assert.ok(record.passengerDemand > 4000, 'Passenger demand should be positive and realistic');
    assert.ok(record.availableCapacity > 0, 'Capacity should be positive');
    assert.ok(record.loadFactorPercent >= 10 && record.loadFactorPercent <= 100);
    assert.ok(record.ticketRevenue > 0);
  }
});

test('calculateRouteCostBreakdown partitions total cost into balanced categories', () => {
  const breakdown = calculateRouteCostBreakdown(sampleRoute);
  assert.equal(breakdown.totalDailyCost, 115000);
  assert.equal(breakdown.categories.length, 5);

  const sumOfCategories = breakdown.categories.reduce((acc, cat) => acc + cat.amount, 0);
  assert.equal(sumOfCategories, 115000, 'Sum of cost categories must match total daily cost');

  const percentSum = breakdown.categories.reduce((acc, cat) => acc + cat.percent, 0);
  assert.ok(percentSum >= 99 && percentSum <= 101, 'Percentage sum should equal ~100%');

  assert.ok(breakdown.costPerPassenger > 0);
  assert.ok(breakdown.costPerTrainKm > 0);
});

test('calculateCorridorDensity calculates saturation percent and heat tiers', () => {
  const density = calculateCorridorDensity('corr-del-bsb', [sampleRoute], 35000);
  assert.equal(density.corridorId, 'corr-del-bsb');
  assert.equal(density.activeRouteCount, 1);
  assert.equal(density.totalDailyPassengers, 6840);
  assert.ok(density.saturationPercent > 0);
  assert.equal(density.heatTier, 'low'); // 6840 is in moderate/low tier (< 12000)

  // Saturated route test
  const highDensityRoute: BuiltRoute = {
    ...sampleRoute,
    dailyPassengers: 75000,
  };
  const peakDensity = calculateCorridorDensity('corr-del-bsb', [highDensityRoute], 35000);
  assert.equal(peakDensity.heatTier, 'peak');
});

test('getDensityHeatColor produces appropriate gradient colors and stroke weights', () => {
  const low = getDensityHeatColor(3000);
  assert.equal(low.strokeWidth, 3);
  assert.ok(low.color.includes('#'));

  const medium = getDensityHeatColor(18000);
  assert.equal(medium.strokeWidth, 4);
  assert.equal(medium.color, '#a3e635'); // Lime

  const high = getDensityHeatColor(42000);
  assert.equal(high.strokeWidth, 5);
  assert.equal(high.color, '#f97316'); // Orange

  const peak = getDensityHeatColor(85000);
  assert.equal(peak.strokeWidth, 6);
  assert.equal(peak.color, '#ef4444'); // Crimson Red
});

test('filterRoutesByTier filters routes accurately by high_speed, express, commuter, or all', () => {
  const routes: BuiltRoute[] = [
    { ...sampleRoute, id: 'r-hs-1', trackType: 'high_speed' },
    { ...sampleRoute, id: 'r-hs-2', trackType: 'high_speed' },
    { ...sampleRoute, id: 'r-exp-1', trackType: 'express' },
    { ...sampleRoute, id: 'r-com-1', trackType: 'commuter' },
  ];

  const all = filterRoutesByTier(routes, 'all');
  assert.equal(all.length, 4);

  const highSpeed = filterRoutesByTier(routes, 'high_speed');
  assert.equal(highSpeed.length, 2);
  assert.ok(highSpeed.every((r) => r.trackType === 'high_speed'));

  const express = filterRoutesByTier(routes, 'express');
  assert.equal(express.length, 1);
  assert.equal(express[0].id, 'r-exp-1');

  const commuter = filterRoutesByTier(routes, 'commuter');
  assert.equal(commuter.length, 1);
  assert.equal(commuter[0].id, 'r-com-1');
});

test('calculateTierPerformanceSummary calculates accurate comparison averages across all 3 tiers', () => {
  const routes: BuiltRoute[] = [
    {
      ...sampleRoute,
      id: 'r-hs',
      trackType: 'high_speed',
      dailyPassengers: 18000,
      dailyRevenue: 3000000,
      dailyCost: 1200000,
      netProfit: 1800000,
      ticketPrice: 165,
    },
    {
      ...sampleRoute,
      id: 'r-exp',
      trackType: 'express',
      dailyPassengers: 7000,
      dailyRevenue: 600000,
      dailyCost: 280000,
      netProfit: 320000,
      ticketPrice: 85,
    },
    {
      ...sampleRoute,
      id: 'r-com',
      trackType: 'commuter',
      dailyPassengers: 40000,
      dailyRevenue: 600000,
      dailyCost: 200000,
      netProfit: 400000,
      ticketPrice: 15,
    },
  ];

  const summary = calculateTierPerformanceSummary(routes);
  assert.ok(summary.high_speed);
  assert.ok(summary.express);
  assert.ok(summary.commuter);

  assert.equal(summary.high_speed.routeCount, 1);
  assert.equal(summary.high_speed.avgDailyPassengers, 18000);
  assert.equal(summary.high_speed.avgTicketPrice, 165);
  assert.equal(summary.high_speed.avgOperatingMarginPercent, 60);

  assert.equal(summary.express.routeCount, 1);
  assert.equal(summary.express.avgDailyPassengers, 7000);
  assert.equal(summary.express.avgTicketPrice, 85);

  assert.equal(summary.commuter.routeCount, 1);
  assert.equal(summary.commuter.avgDailyPassengers, 40000);
  assert.equal(summary.commuter.avgTicketPrice, 15);
  assert.equal(summary.commuter.avgCostPerPassenger, 5); // 200000 / 40000 = 5
});

