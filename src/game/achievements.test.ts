import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ACHIEVEMENTS_CATALOG,
  DISPATCHER_RANKS,
  getDispatcherRank,
  getNextDispatcherRank,
  evaluateAchievements,
  claimAchievementReward,
  claimAllAchievementRewards,
  getUnclaimedCount,
  AchievementGameState,
  PlayerProgressionState,
} from './achievements';
import { BuiltRoute, OwnedTrain, Station, TrainModel } from '../types';

const mockTrainModels: TrainModel[] = [
  {
    id: 'shinkansen-n700s',
    manufacturerId: 'hitachi_kawasaki',
    name: 'Shinkansen N700S Supreme',
    seriesCode: 'N700S',
    category: 'High-Speed Bullet',
    trackType: 'high_speed',
    maxSpeedKmH: 330,
    passengerCapacity: 1323,
    purchasePrice: 42000000,
    dailyMaintenance: 4800,
    reliabilityScore: 99,
    comfortScore: 97,
    acceleration: 'Very High',
    powerType: 'Electric EMU',
    description: 'Supreme bullet train',
    defaultLivery: { baseColor: '#fff', stripeColor: '#00f', accentColor: '#0ff', roofColor: '#666' },
  },
  {
    id: 'vande-bharat-vb2',
    manufacturerId: 'icf_indian_rail',
    name: 'Vande Bharat 2.0',
    seriesCode: 'VB-18',
    category: 'Semi-High Speed',
    trackType: 'express',
    maxSpeedKmH: 180,
    passengerCapacity: 1128,
    purchasePrice: 21000000,
    dailyMaintenance: 2400,
    reliabilityScore: 94,
    comfortScore: 92,
    acceleration: 'Very High',
    powerType: 'Electric EMU',
    description: 'Express train',
    defaultLivery: { baseColor: '#fff', stripeColor: '#00f', accentColor: '#f90', roofColor: '#666' },
  },
];

const mockOwnedTrains: OwnedTrain[] = [
  {
    id: 'train-1',
    modelId: 'vande-bharat-vb2',
    customName: 'VB Express',
    assignedRouteId: 'route-1',
    purchaseDay: 1,
    totalKmRun: 1000,
    conditionPercent: 99,
  },
  {
    id: 'train-2',
    modelId: 'shinkansen-n700s',
    customName: 'Nozomi Supreme',
    assignedRouteId: undefined,
    purchaseDay: 1,
    totalKmRun: 0,
    conditionPercent: 100,
  },
];

const mockStations: Station[] = [
  {
    id: 'ndls',
    name: 'New Delhi',
    code: 'NDLS',
    country: 'India',
    region: 'South Asia',
    regionId: 'south_asia',
    lat: 28.6427,
    lng: 77.2236,
    gauge: '1676mm',
    traction: '25kV',
    description: '',
    isOwned: true,
    acquisitionCost: 0,
    dispatchSlots: [true],
    populationMillions: 33,
    economicTier: 1,
  },
  {
    id: 'bsb',
    name: 'Varanasi',
    code: 'BSB',
    country: 'India',
    region: 'South Asia',
    regionId: 'south_asia',
    lat: 25.3283,
    lng: 82.9994,
    gauge: '1676mm',
    traction: '25kV',
    description: '',
    isOwned: false,
    acquisitionCost: 1500000,
    dispatchSlots: [false],
    populationMillions: 4,
    economicTier: 2,
  },
];

const mockRoutes: BuiltRoute[] = [
  {
    id: 'route-1',
    name: 'Delhi - Varanasi Express',
    corridorId: 'corr-del-bsb',
    stationAId: 'ndls',
    stationBId: 'bsb',
    trackType: 'express',
    trackName: 'Mainline Track 1',
    assignedTrainIds: ['train-1'],
    frequencyDaily: 8,
    departureSlots: [1, 2],
    ticketPrice: 95,
    distanceKm: 759,
    dailyPassengers: 6000,
    dailyRevenue: 240000,
    dailyCost: 110000,
    netProfit: 130000,
    delayRatePercent: 4.2,
    status: 'active',
  },
];

const baseState: AchievementGameState = {
  ownedTrains: mockOwnedTrains,
  trainCatalog: mockTrainModels,
  builtRoutes: mockRoutes,
  stations: mockStations,
  treasury: 28500000,
  totalNetPerDay: 130000,
};

test('Achievements catalog has all required categories and well-defined entries', () => {
  assert.ok(ACHIEVEMENTS_CATALOG.length >= 15);
  const categories = new Set(ACHIEVEMENTS_CATALOG.map((a) => a.category));
  assert.ok(categories.has('train_development'));
  assert.ok(categories.has('infrastructure'));
  assert.ok(categories.has('international'));
  assert.ok(categories.has('financial'));

  const tiers = new Set(ACHIEVEMENTS_CATALOG.map((a) => a.tier));
  assert.ok(tiers.has('beginner'));
  assert.ok(tiers.has('intermediate'));
  assert.ok(tiers.has('advanced'));
  assert.ok(tiers.has('master'));

  for (const ach of ACHIEVEMENTS_CATALOG) {
    assert.ok(ach.id);
    assert.ok(ach.title);
    assert.ok(ach.tierLabel);
    assert.ok(ach.rewardCash > 0);
    assert.ok(ach.rewardPrestige > 0);
    const progress = ach.getProgress(baseState);
    assert.ok(progress.target > 0);
    assert.ok(progress.percent >= 0 && progress.percent <= 100);
  }
});

test('Dispatcher rank progression computes current and next ranks accurately', () => {
  assert.equal(DISPATCHER_RANKS.length, 6);
  assert.equal(getDispatcherRank(0).level, 1);
  assert.equal(getDispatcherRank(0).title, 'Junior Dispatcher');

  assert.equal(getDispatcherRank(150).level, 2);
  assert.equal(getDispatcherRank(150).title, 'Line Controller');

  assert.equal(getDispatcherRank(400).level, 3);
  assert.equal(getDispatcherRank(750).level, 4);
  assert.equal(getDispatcherRank(1400).level, 5);
  assert.equal(getDispatcherRank(2500).level, 6);

  const nextFromZero = getNextDispatcherRank(0);
  assert.ok(nextFromZero);
  assert.equal(nextFromZero.level, 2);

  const nextFromMax = getNextDispatcherRank(5000);
  assert.equal(nextFromMax, null);
});

test('evaluateAchievements unlocks beginner achievements with scaled rewards and keeps advanced challenges locked', () => {
  const { updatedRecords, newlyUnlocked } = evaluateAchievements(baseState, {});

  // Player owns trains -> First Train unlocked (beginner)
  assert.ok(updatedRecords['first-train']?.unlocked);
  // Player built Delhi-Varanasi Express -> First Connection unlocked (beginner)
  assert.ok(updatedRecords['first-connection']?.unlocked);
  // Express route has 6,000 pax -> Express Operator unlocked (intermediate)
  assert.ok(updatedRecords['express-fleet']?.unlocked);

  // Speed Pioneer requires an ACTIVE High-Speed route with 6,000 pax; starter route is express -> LOCKED
  assert.equal(updatedRecords['speed-pioneer']?.unlocked, false);
  // Next-Gen requires 3 flagships, player only has 1 -> LOCKED
  assert.equal(updatedRecords['next-generation']?.unlocked, false);
  // Intercity Dual Network requires 2 active routes, player only has 1 -> LOCKED
  assert.equal(updatedRecords['intercity-network']?.unlocked, false);
  // Modern Fleet requires 8 trains, player has 2 -> LOCKED
  assert.equal(updatedRecords['modern-fleet']?.unlocked, false);

  // Newly unlocked should only be the genuine starter achievements (3 achievements)
  assert.equal(newlyUnlocked.length, 3);
  assert.equal(getUnclaimedCount(updatedRecords), 3);
});

test('claimAchievementReward grants scaled modest beginner rewards', () => {
  const { updatedRecords } = evaluateAchievements(baseState, {});
  const progression: PlayerProgressionState = {
    unlockedRecords: updatedRecords,
    prestigePoints: 0,
    unlockedPerks: [],
  };

  const result = claimAchievementReward('first-train', progression);
  assert.equal(result.cashReward, 150000); // Scaled beginner reward
  assert.equal(result.prestigeReward, 15);
  assert.equal(result.updatedProgression.prestigePoints, 15);
  assert.equal(result.updatedProgression.unlockedRecords['first-train'].claimed, true);

  // Trying to claim again returns 0 reward
  const secondResult = claimAchievementReward('first-train', result.updatedProgression);
  assert.equal(secondResult.cashReward, 0);
  assert.equal(secondResult.prestigeReward, 0);
});

test('claimAllAchievementRewards claims starter achievements without premature inflation', () => {
  const { updatedRecords } = evaluateAchievements(baseState, {});
  const progression: PlayerProgressionState = {
    unlockedRecords: updatedRecords,
    prestigePoints: 0,
    unlockedPerks: [],
  };

  const batch = claimAllAchievementRewards(progression);
  assert.equal(batch.claimedCount, 3); // 3 beginner/early achievements
  assert.equal(batch.totalCashReward, 150000 + 150000 + 500000); // $800,000 total (scaled appropriately!)
  assert.equal(batch.totalPrestigeReward, 15 + 20 + 40); // 75 XP total
  assert.equal(batch.updatedProgression.prestigePoints, 75);

  // Unclaimed count should now be 0
  assert.equal(getUnclaimedCount(batch.updatedProgression.unlockedRecords), 0);
});
