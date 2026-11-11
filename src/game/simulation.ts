import { TrackType, WeatherCondition, EconomicShift, TrainModel, OwnedTrain } from '../types';

export const TRACK_SPEED_LIMITS: Record<TrackType, number> = {
  high_speed: 350,
  express: 200,
  commuter: 130,
};

export const TRACK_BASE_MAINTENANCE_PER_KM_DAY: Record<TrackType, number> = {
  high_speed: 140, // $/km/day
  express: 75,
  commuter: 40,
};

export const TRACK_CONSTRUCTION_COST_PER_KM: Record<TrackType, number> = {
  high_speed: 180000, // $180k / km
  express: 95000,
  commuter: 45000,
};

export const BENCHMARK_FARE_PER_KM: Record<TrackType, number> = {
  high_speed: 0.22, // $/km
  express: 0.12,
  commuter: 0.06,
};

/**
 * Calculates one-way transit duration in hours given distance, train speed, track cap, and weather.
 */
export function calculateTransitTimeHours(
  distanceKm: number,
  trainMaxSpeed: number,
  trackType: TrackType,
  weatherPenaltyPercent: number = 0
): number {
  if (distanceKm <= 0) return 0;
  const trackCap = TRACK_SPEED_LIMITS[trackType] || 160;
  const baseSpeed = Math.min(trainMaxSpeed, trackCap);
  const effectiveSpeed = Math.max(30, baseSpeed * (1 - weatherPenaltyPercent / 100));
  const rawHours = distanceKm / effectiveSpeed;
  // Add 0.15h (9 mins) station dwell & acceleration buffer
  return Number((rawHours + 0.15).toFixed(2));
}

/**
 * Evaluates route passenger load, volume, ticket revenue, and costs.
 */
export function calculateRouteEconomics(params: {
  distanceKm: number;
  trackType: TrackType;
  ticketPrice: number;
  frequencyDaily: number;
  baseCorridorDemand: number;
  assignedTrains: { model: TrainModel; train: OwnedTrain }[];
  weather?: WeatherCondition;
  economicShift?: EconomicShift;
}): {
  dailyPassengers: number;
  dailyRevenue: number;
  dailyOperatingCost: number;
  dailyTrackMaintenance: number;
  dailyFleetMaintenance: number;
  netDailyProfit: number;
  loadFactorPercent: number;
  delayRatePercent: number;
  totalDailyCapacity: number;
} {
  const {
    distanceKm,
    trackType,
    ticketPrice,
    frequencyDaily,
    baseCorridorDemand,
    assignedTrains,
    weather,
    economicShift,
  } = params;

  if (assignedTrains.length === 0 || frequencyDaily <= 0) {
    const trackMaint = distanceKm * TRACK_BASE_MAINTENANCE_PER_KM_DAY[trackType];
    return {
      dailyPassengers: 0,
      dailyRevenue: 0,
      dailyOperatingCost: 0,
      dailyTrackMaintenance: trackMaint,
      dailyFleetMaintenance: 0,
      netDailyProfit: -trackMaint,
      loadFactorPercent: 0,
      delayRatePercent: 0,
      totalDailyCapacity: 0,
    };
  }

  // Aggregate train specs
  const avgCapacity = assignedTrains.reduce((sum, t) => sum + t.model.passengerCapacity, 0) / assignedTrains.length;
  const avgComfort = assignedTrains.reduce((sum, t) => sum + t.model.comfortScore, 0) / assignedTrains.length;
  const avgReliability = assignedTrains.reduce((sum, t) => sum + t.model.reliabilityScore * (t.train.conditionPercent / 100), 0) / assignedTrains.length;
  const totalFleetDailyMaint = assignedTrains.reduce((sum, t) => sum + t.model.dailyMaintenance, 0);

  // Maximum physical passengers that can be carried per day
  const totalDailyCapacity = Math.round(avgCapacity * frequencyDaily);

  // Price sensitivity calculation
  const benchmarkPrice = Math.max(10, distanceKm * BENCHMARK_FARE_PER_KM[trackType]);
  const priceRatio = ticketPrice / benchmarkPrice; // 1.0 = normal, 1.5 = expensive, 0.8 = cheap
  
  // Demand elasticity curve (smooth logistic response)
  const priceMultiplier = Math.max(0.1, Math.min(2.0, 1 / (1 + Math.exp(3.0 * (priceRatio - 1.1)))));

  // Frequency convenience factor: higher daily departures capture a larger share of corridor travelers
  // 6 departures = 50% capture, 12 = 80%, 20+ = 95%
  const frequencyCapture = Math.min(0.98, Math.max(0.2, 1 - Math.exp(-0.14 * frequencyDaily)));

  // Comfort and reliability boost
  const serviceQualityFactor = 0.85 + (avgComfort / 100) * 0.2 + (avgReliability / 100) * 0.15;

  // Regional economic factor
  const economicMultiplier = economicShift ? economicShift.demandMultiplier : 1.0;

  // Weather demand factor
  const weatherDemandMultiplier = weather ? 1 + (weather.demandShiftPercent / 100) : 1.0;

  // Potential interested passenger market
  const potentialPassengers = baseCorridorDemand * 
    frequencyCapture * 
    priceMultiplier * 
    serviceQualityFactor * 
    economicMultiplier * 
    weatherDemandMultiplier;

  // Carried passengers cannot exceed physical fleet seat capacity
  const actualPassengers = Math.round(Math.min(totalDailyCapacity, Math.max(0, potentialPassengers)));
  const loadFactorPercent = totalDailyCapacity > 0 ? Math.round((actualPassengers / totalDailyCapacity) * 100) : 0;

  const dailyRevenue = Math.round(actualPassengers * ticketPrice);

  // Operating costs: track maintenance, energy/crew per run, fleet wear
  const trackMaintMultiplier = economicShift ? economicShift.maintenanceMultiplier : 1.0;
  const dailyTrackMaintenance = Math.round(distanceKm * TRACK_BASE_MAINTENANCE_PER_KM_DAY[trackType] * trackMaintMultiplier);

  // Energy & crew cost per km per departure
  const energyCrewCostPerRun = distanceKm * (trackType === 'high_speed' ? 1.4 : trackType === 'express' ? 0.9 : 0.6);
  const dailyOperatingCost = Math.round(energyCrewCostPerRun * frequencyDaily);

  const totalCost = dailyOperatingCost + dailyTrackMaintenance + totalFleetDailyMaint;
  const netDailyProfit = dailyRevenue - totalCost;

  // Weather and reliability delay probability
  const baseDelayPercent = Math.max(1, 100 - avgReliability);
  const weatherDelayRisk = weather ? weather.delayRiskPercent : 0;
  const delayRatePercent = Number(Math.min(65, baseDelayPercent * 0.4 + weatherDelayRisk).toFixed(1));

  return {
    dailyPassengers: actualPassengers,
    dailyRevenue,
    dailyOperatingCost,
    dailyTrackMaintenance,
    dailyFleetMaintenance: totalFleetDailyMaint,
    netDailyProfit,
    loadFactorPercent,
    delayRatePercent,
    totalDailyCapacity,
  };
}

/**
 * Format currency in millions or thousands cleanly for transport simulators
 */
export function formatCurrency(amount: number): string {
  if (Math.abs(amount) >= 1_000_000) {
    const millions = amount / 1_000_000;
    return `${amount < 0 ? '-' : ''}$${Math.abs(millions).toFixed(2)}M`;
  }
  if (Math.abs(amount) >= 1_000) {
    const thousands = amount / 1_000;
    return `${amount < 0 ? '-' : ''}$${Math.abs(thousands).toFixed(1)}k`;
  }
  return `${amount < 0 ? '-' : ''}$${Math.abs(amount).toFixed(0)}`;
}

import { DailyFinancialReport } from '../types';

/**
 * Generates historical daily financial reports over the last 30 days.
 */
export function generateInitialFinancialHistory(
  currentDay: number,
  currentNetProfit: number = 130000
): DailyFinancialReport[] {
  const history: DailyFinancialReport[] = [];
  const startDay = Math.max(1, currentDay - 29);

  for (let d = startDay; d <= currentDay; d++) {
    // Ramp up from early launch days to current performance
    const progress = currentDay > startDay ? (d - startDay) / (currentDay - startDay) : 1;
    // Base curve ramping from 35% of current profit up to 100%
    const baseFactor = 0.35 + 0.65 * Math.pow(progress, 0.7);
    
    // Deterministic pseudo-random variation based on day number
    const sineVariation = Math.sin(d * 1.7) * 0.08 + Math.cos(d * 0.9) * 0.05;
    const dayNet = Math.round(currentNetProfit * (baseFactor + sineVariation));
    
    const revenue = Math.round(dayNet * 1.88 + 50000);
    const opCost = Math.round(revenue - dayNet);
    const trackMaint = Math.round(opCost * 0.45);
    const fleetMaint = Math.round(opCost * 0.15);
    const operatingCosts = opCost - trackMaint - fleetMaint;

    history.push({
      day: d,
      ticketRevenue: revenue,
      operatingCosts,
      trackMaintenance: trackMaint,
      fleetMaintenance: fleetMaint,
      netProfit: d === currentDay ? currentNetProfit : dayNet,
      totalPassengersMoved: Math.round(revenue / 95),
      onTimePerformance: Number((95 + Math.sin(d * 2.3) * 3).toFixed(1)),
    });
  }

  return history.slice(-30);
}

/**
 * Appends a daily report and maintains exactly the last 30 days
 */
export function recordDailyFinancialReport(
  history: DailyFinancialReport[],
  report: DailyFinancialReport
): DailyFinancialReport[] {
  const next = [...history.filter((h) => h.day !== report.day), report];
  return next.slice(-30);
}

/**
 * Calculates aggregate 30-day stats
 */
export function calculateFinancialSummary(history: DailyFinancialReport[]): {
  totalNet30d: number;
  averageNet30d: number;
  maxNet: number;
  minNet: number;
  positiveDaysCount: number;
} {
  if (history.length === 0) {
    return {
      totalNet30d: 0,
      averageNet30d: 0,
      maxNet: 0,
      minNet: 0,
      positiveDaysCount: 0,
    };
  }

  const totalNet30d = history.reduce((sum, h) => sum + h.netProfit, 0);
  const averageNet30d = Math.round(totalNet30d / history.length);
  const maxNet = Math.max(...history.map((h) => h.netProfit));
  const minNet = Math.min(...history.map((h) => h.netProfit));
  const positiveDaysCount = history.filter((h) => h.netProfit > 0).length;

  return {
    totalNet30d,
    averageNet30d,
    maxNet,
    minNet,
    positiveDaysCount,
  };
}

