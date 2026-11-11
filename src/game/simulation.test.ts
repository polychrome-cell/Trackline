import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  calculateTransitTimeHours, 
  calculateRouteEconomics, 
  formatCurrency, 
  TRACK_SPEED_LIMITS,
  generateInitialFinancialHistory,
  recordDailyFinancialReport,
  calculateFinancialSummary
} from './simulation';
import { TrainModel, OwnedTrain } from '../types';

test('transit time calculations respect track speed caps and weather penalties', () => {
  // 500 km route, train max 320 km/h on high_speed track (cap 350 km/h) -> ~1.71h
  const hsrTime = calculateTransitTimeHours(500, 320, 'high_speed', 0);
  assert.ok(hsrTime > 1.5 && hsrTime < 2.0, `Expected ~1.7h, got ${hsrTime}`);

  // On commuter track (cap 130 km/h), speed should be capped at 130 km/h even with a 320 km/h bullet train!
  const commuterTime = calculateTransitTimeHours(500, 320, 'commuter', 0);
  assert.ok(commuterTime > 3.8 && commuterTime < 4.2, `Expected ~4.0h, got ${commuterTime}`);

  // Bad weather (30% penalty) increases travel time
  const typhoonTime = calculateTransitTimeHours(500, 320, 'high_speed', 30);
  assert.ok(typhoonTime > hsrTime, `Typhoon transit time (${typhoonTime}) must be higher than clear weather (${hsrTime})`);
});

test('currency formatting outputs readable transport simulator notation', () => {
  assert.equal(formatCurrency(25000000), '$25.00M');
  assert.equal(formatCurrency(130000), '$130.0k');
  assert.equal(formatCurrency(-45000), '-$45.0k');
  assert.equal(formatCurrency(-2100000), '-$2.10M');
});

test('route economics calculates passengers, revenues, and costs accurately', () => {
  const dummyModel: TrainModel = {
    id: 'shinkansen-n700s',
    manufacturerId: 'hitachi_kawasaki',
    name: 'Shinkansen N700S Supreme',
    seriesCode: 'N700S',
    category: 'High-Speed Bullet',
    trackType: 'high_speed',
    maxSpeedKmH: 320,
    passengerCapacity: 1323,
    purchasePrice: 38000000,
    dailyMaintenance: 4200,
    reliabilityScore: 98,
    comfortScore: 95,
    acceleration: 'Very High',
    powerType: 'Electric EMU',
    description: 'Premier Tokaido Bullet Train',
    defaultLivery: {
      baseColor: '#ffffff',
      stripeColor: '#0369a1',
      accentColor: '#38bdf8',
      roofColor: '#94a3b8',
    },
  };

  const dummyTrain: OwnedTrain = {
    id: 'train-1',
    modelId: 'shinkansen-n700s',
    customName: 'Nozomi 01',
    purchaseDay: 1,
    totalKmRun: 5000,
    conditionPercent: 96,
  };

  const econ = calculateRouteEconomics({
    distanceKm: 515, // Tokyo - Shin-Osaka distance
    trackType: 'high_speed',
    ticketPrice: 110,
    frequencyDaily: 12, // 12 departures/day
    baseCorridorDemand: 45000,
    assignedTrains: [{ model: dummyModel, train: dummyTrain }],
  });

  assert.ok(econ.dailyPassengers > 5000, `Expected strong ridership, got ${econ.dailyPassengers}`);
  assert.ok(econ.dailyRevenue > 500000, `Expected substantial revenue, got ${econ.dailyRevenue}`);
  assert.ok(econ.dailyOperatingCost > 0, `Expected operational costs`);
  assert.ok(econ.netDailyProfit > 0, `Premier Tokyo-Osaka route with N700S should be profitable`);
  assert.ok(econ.loadFactorPercent > 0 && econ.loadFactorPercent <= 100, `Load factor must be 0-100%`);
});

test('financial history generates accurate 30-day records and slices bounds', () => {
  // Day 21 generation
  const hist = generateInitialFinancialHistory(21, 130000);
  assert.equal(hist.length, 21, `Expected 21 days of history, got ${hist.length}`);
  assert.equal(hist[hist.length - 1].day, 21);
  assert.equal(hist[hist.length - 1].netProfit, 130000);

  // Day 45 generation should cap at 30 days
  const hist45 = generateInitialFinancialHistory(45, 250000);
  assert.equal(hist45.length, 30, `Expected capped 30 days of history, got ${hist45.length}`);
  assert.equal(hist45[hist45.length - 1].day, 45);

  // Appending next day
  const updated = recordDailyFinancialReport(hist45, {
    day: 46,
    ticketRevenue: 400000,
    operatingCosts: 100000,
    trackMaintenance: 20000,
    fleetMaintenance: 10000,
    netProfit: 270000,
    totalPassengersMoved: 4000,
    onTimePerformance: 98,
  });
  assert.equal(updated.length, 30);
  assert.equal(updated[updated.length - 1].day, 46);

  const summary = calculateFinancialSummary(updated);
  assert.ok(summary.totalNet30d > 0);
  assert.ok(summary.averageNet30d > 0);
  assert.equal(summary.maxNet, 270000);
});

