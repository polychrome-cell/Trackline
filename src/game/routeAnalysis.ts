/**
 * Pure logic and calculations for Advanced Route Analysis and Network Density Heatmap.
 */

import { BuiltRoute, TrackType } from '../types';

export type RouteFilterTier = 'all' | 'high_speed' | 'express' | 'commuter';

export interface RouteTierPerformanceSummary {
  tier: TrackType;
  tierLabel: string;
  routeCount: number;
  totalDailyPassengers: number;
  totalDailyRevenue: number;
  totalDailyCost: number;
  totalDailyNetProfit: number;
  avgDailyPassengers: number;
  avgTicketPrice: number;
  avgCostPerPassenger: number;
  avgOperatingMarginPercent: number;
  avgLoadFactorPercent: number;
}

export const REFERENCE_BENCHMARK_ROUTES: BuiltRoute[] = [
  {
    id: 'benchmark-tokyo-osaka',
    name: 'Tokaido Shinkansen (Tokyo - Osaka)',
    corridorId: 'corr-tyo-nko',
    stationAId: 'tyo',
    stationBId: 'nko',
    trackType: 'high_speed',
    trackName: 'Tokaido Bullet Mainline',
    assignedTrainIds: ['train-bm-shinkansen'],
    frequencyDaily: 16,
    departureSlots: [1, 2, 3, 4, 5, 6, 7, 8],
    ticketPrice: 165,
    distanceKm: 515,
    dailyPassengers: 18400,
    dailyRevenue: 3036000,
    dailyCost: 1180000,
    netProfit: 1856000,
    delayRatePercent: 0.8,
    status: 'active',
  },
  {
    id: 'benchmark-beijing-shanghai',
    name: 'Jinghu High-Speed Rail (Beijing - Shanghai)',
    corridorId: 'corr-vnp-aoh',
    stationAId: 'vnp',
    stationBId: 'aoh',
    trackType: 'high_speed',
    trackName: 'Jinghu HSR Dedicated Track',
    assignedTrainIds: ['train-bm-fuxing'],
    frequencyDaily: 12,
    departureSlots: [1, 3, 5, 7, 9],
    ticketPrice: 185,
    distanceKm: 1318,
    dailyPassengers: 15600,
    dailyRevenue: 2886000,
    dailyCost: 1240000,
    netProfit: 1646000,
    delayRatePercent: 1.2,
    status: 'active',
  },
  {
    id: 'benchmark-seoul-busan',
    name: 'Gyeongbu Express (Seoul - Busan)',
    corridorId: 'corr-sel-pus',
    stationAId: 'sel',
    stationBId: 'pus',
    trackType: 'express',
    trackName: 'Gyeongbu Express Track',
    assignedTrainIds: ['train-bm-ktx'],
    frequencyDaily: 10,
    departureSlots: [2, 4, 6, 8],
    ticketPrice: 85,
    distanceKm: 417,
    dailyPassengers: 9200,
    dailyRevenue: 782000,
    dailyCost: 340000,
    netProfit: 442000,
    delayRatePercent: 2.1,
    status: 'active',
  },
  {
    id: 'benchmark-mumbai-suburban',
    name: 'Western Line Commuter (Mumbai - Virar)',
    corridorId: 'corr-bct-vir',
    stationAId: 'bct',
    stationBId: 'adi',
    trackType: 'commuter',
    trackName: 'Western Suburban Quad Track',
    assignedTrainIds: ['train-bm-commuter-1'],
    frequencyDaily: 32,
    departureSlots: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    ticketPrice: 18,
    distanceKm: 98,
    dailyPassengers: 36500,
    dailyRevenue: 657000,
    dailyCost: 245000,
    netProfit: 412000,
    delayRatePercent: 4.8,
    status: 'active',
  },
  {
    id: 'benchmark-tokyo-yamanote',
    name: 'Yamanote Metropolitan Commuter (Tokyo Loop)',
    corridorId: 'corr-tyo-loop',
    stationAId: 'tyo',
    stationBId: 'tyo',
    trackType: 'commuter',
    trackName: 'Inner Circular Commuter Line',
    assignedTrainIds: ['train-bm-commuter-2'],
    frequencyDaily: 40,
    departureSlots: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    ticketPrice: 12,
    distanceKm: 35,
    dailyPassengers: 48000,
    dailyRevenue: 576000,
    dailyCost: 195000,
    netProfit: 381000,
    delayRatePercent: 1.1,
    status: 'active',
  },
];

/**
 * Filter routes by service tier (high_speed, express, commuter, or all).
 */
export function filterRoutesByTier(
  routes: BuiltRoute[],
  tier: RouteFilterTier
): BuiltRoute[] {
  if (tier === 'all') {
    return routes;
  }
  return routes.filter((r) => r.trackType === tier);
}

/**
 * Calculates aggregated comparative performance statistics across all 3 service tiers.
 */
export function calculateTierPerformanceSummary(
  routes: BuiltRoute[]
): Record<TrackType, RouteTierPerformanceSummary> {
  const tiers: TrackType[] = ['high_speed', 'express', 'commuter'];
  const labels: Record<TrackType, string> = {
    high_speed: 'High-Speed (250–350 km/h)',
    express: 'Express (160–200 km/h)',
    commuter: 'Commuter (High Frequency)',
  };

  const result: Partial<Record<TrackType, RouteTierPerformanceSummary>> = {};

  for (const t of tiers) {
    const matching = routes.filter((r) => r.trackType === t);
    const count = matching.length;
    const totalPax = matching.reduce((s, r) => s + r.dailyPassengers, 0);
    const totalRev = matching.reduce((s, r) => s + r.dailyRevenue, 0);
    const totalCost = matching.reduce((s, r) => s + r.dailyCost, 0);
    const totalNet = matching.reduce((s, r) => s + r.netProfit, 0);

    const avgPax = count > 0 ? Math.round(totalPax / count) : 0;
    const avgFare = count > 0 ? Math.round(matching.reduce((s, r) => s + r.ticketPrice, 0) / count) : 0;
    const avgCostPerPax = totalPax > 0 ? Number((totalCost / totalPax).toFixed(2)) : 0;
    const avgMargin = totalRev > 0 ? Math.round((totalNet / totalRev) * 100) : 0;
    const avgLoadFactor = count > 0
      ? Math.round(
          matching.reduce((s, r) => {
            const cap = Math.max(1, r.frequencyDaily * 750);
            return s + Math.min(100, (r.dailyPassengers / cap) * 100);
          }, 0) / count
        )
      : 0;

    result[t] = {
      tier: t,
      tierLabel: labels[t],
      routeCount: count,
      totalDailyPassengers: totalPax,
      totalDailyRevenue: totalRev,
      totalDailyCost: totalCost,
      totalDailyNetProfit: totalNet,
      avgDailyPassengers: avgPax,
      avgTicketPrice: avgFare,
      avgCostPerPassenger: avgCostPerPax,
      avgOperatingMarginPercent: avgMargin,
      avgLoadFactorPercent: avgLoadFactor,
    };
  }

  return result as Record<TrackType, RouteTierPerformanceSummary>;
}

export interface DayDemandRecord {
  day: number;
  dayLabel: string;
  passengerDemand: number;
  availableCapacity: number;
  loadFactorPercent: number;
  ticketRevenue: number;
  netProfit: number;
}

export interface CostCategory {
  id: string;
  name: string;
  amount: number;
  percent: number;
  icon: string;
  description: string;
}

export interface RouteCostBreakdown {
  totalDailyCost: number;
  costPerPassenger: number;
  costPerTrainKm: number;
  categories: CostCategory[];
}

export interface CorridorDensityInfo {
  corridorId: string;
  activeRouteCount: number;
  totalDailyPassengers: number;
  saturationPercent: number;
  heatTier: 'low' | 'medium' | 'high' | 'peak';
}

/**
 * Generate 7-day realistic daily passenger demand history for a route.
 */
export function generate7DayRouteDemand(
  route: BuiltRoute,
  currentDay: number
): DayDemandRecord[] {
  const records: DayDemandRecord[] = [];
  const startDay = Math.max(1, currentDay - 6);

  // Train capacity calculation: frequency * average capacity or baseline
  const estimatedCapacityPerRun = route.dailyPassengers > 0 && route.frequencyDaily > 0
    ? Math.round(route.dailyPassengers / (route.frequencyDaily * 0.78))
    : 650;
  const totalCapacity = estimatedCapacityPerRun * Math.max(1, route.frequencyDaily);

  for (let d = startDay; d <= currentDay; d++) {
    // Generate slight day-to-day fluctuations (±6%) with weekday vs weekend demand patterns
    const dayOfWeek = (d % 7); // 0 = Sun, 6 = Sat
    const weekendMultiplier = dayOfWeek === 0 || dayOfWeek === 6 ? 1.08 : 0.98;
    const daySeedVariance = 1 + (((d * 17) % 11) - 5) * 0.015;
    const multiplier = weekendMultiplier * daySeedVariance;

    const pax = Math.round(route.dailyPassengers * multiplier);
    const rev = Math.round(pax * route.ticketPrice);
    const loadFactor = Math.min(100, Math.round((pax / totalCapacity) * 100));
    const cost = route.dailyCost;
    const net = rev - cost;

    records.push({
      day: d,
      dayLabel: `Day ${d}`,
      passengerDemand: pax,
      availableCapacity: totalCapacity,
      loadFactorPercent: loadFactor,
      ticketRevenue: rev,
      netProfit: net,
    });
  }

  return records;
}

/**
 * Detailed operational cost breakdown for a railway route.
 */
export function calculateRouteCostBreakdown(route: BuiltRoute): RouteCostBreakdown {
  const totalCost = Math.max(1000, route.dailyCost);
  const totalKm = route.distanceKm * Math.max(1, route.frequencyDaily);
  const pax = Math.max(1, route.dailyPassengers);

  // Calibrate engineering-accurate operational expense ratios
  // Traction electricity (38-44%), Track maintenance (24-28%), Fleet servicing (16-20%), Platform dispatch fees (8-10%), Staff (5-7%)
  const powerAmount = Math.round(totalCost * 0.42);
  const trackAmount = Math.round(totalCost * 0.26);
  const fleetAmount = Math.round(totalCost * 0.18);
  const platformAmount = Math.round(totalCost * 0.09);
  const staffAmount = totalCost - (powerAmount + trackAmount + fleetAmount + platformAmount);

  const categories: CostCategory[] = [
    {
      id: 'traction_power',
      name: 'Traction Electricity & Energy',
      amount: powerAmount,
      percent: Math.round((powerAmount / totalCost) * 100),
      icon: '⚡',
      description: '25 kV AC overhead catenary electrical draw, regenerative braking offset & substation loads.',
    },
    {
      id: 'track_infrastructure',
      name: 'Track & Catenary Upkeep',
      amount: trackAmount,
      percent: Math.round((trackAmount / totalCost) * 100),
      icon: '🛤️',
      description: 'Continuous welded rail grinding, ballast tamping, switch maintenance & cab signaling wear.',
    },
    {
      id: 'rolling_stock_depot',
      name: 'Rolling Stock Depot Servicing',
      amount: fleetAmount,
      percent: Math.round((fleetAmount / totalCost) * 100),
      icon: '🚆',
      description: 'Bogie overhauls, wheel turning, pantograph inspections, HVAC filter cleaning & cabin sanitization.',
    },
    {
      id: 'platform_slots',
      name: 'Platform Slot & Terminal Access',
      amount: platformAmount,
      percent: Math.round((platformAmount / totalCost) * 100),
      icon: '🚉',
      description: 'Terminal dwell rights, platform dispatch fees, switch tower interlock usage & station maintenance.',
    },
    {
      id: 'crew_operations',
      name: 'Dispatch, Crew & Ticketing',
      amount: staffAmount,
      percent: Math.round((staffAmount / totalCost) * 100),
      icon: '👨‍✈️',
      description: 'Train operators, onboard conductors, OCC route controllers & digital reservation ticketing fees.',
    },
  ];

  return {
    totalDailyCost: totalCost,
    costPerPassenger: Number((totalCost / pax).toFixed(2)),
    costPerTrainKm: Number((totalCost / totalKm).toFixed(2)),
    categories,
  };
}

/**
 * Calculates passenger density for a corridor based on active routes and baseline demand.
 */
export function calculateCorridorDensity(
  corridorId: string,
  builtRoutes: BuiltRoute[],
  baseDemand: number
): CorridorDensityInfo {
  const routesOnCorridor = builtRoutes.filter((r) => r.corridorId === corridorId);
  const activeRouteCount = routesOnCorridor.length;

  let totalDailyPassengers = 0;
  for (const r of routesOnCorridor) {
    totalDailyPassengers += r.dailyPassengers;
  }

  // If no active routes are running, use 25% of baseline potential for reference
  const effectivePax = totalDailyPassengers > 0 ? totalDailyPassengers : Math.round(baseDemand * 0.25);
  const saturationPercent = Math.min(100, Math.round((effectivePax / Math.max(1, baseDemand)) * 100));

  let heatTier: 'low' | 'medium' | 'high' | 'peak' = 'low';
  if (effectivePax >= 60000) {
    heatTier = 'peak';
  } else if (effectivePax >= 30000) {
    heatTier = 'high';
  } else if (effectivePax >= 12000) {
    heatTier = 'medium';
  } else {
    heatTier = 'low';
  }

  return {
    corridorId,
    activeRouteCount,
    totalDailyPassengers: effectivePax,
    saturationPercent,
    heatTier,
  };
}

/**
 * Returns color-coded heat intensity styling for the Network Density overlay.
 * Low: Cool Blue -> Cyan -> Lime -> Orange -> Crimson (Peak High)
 */
export function getDensityHeatColor(
  paxDaily: number,
  isDark = true
): { color: string; glow: string; label: string; strokeWidth: number } {
  if (paxDaily >= 60000) {
    // Ultra High / Peak Saturation (Crimson Red)
    return {
      color: '#ef4444',
      glow: 'rgba(239, 68, 68, 0.65)',
      label: 'Peak Density (>60k pax)',
      strokeWidth: 6,
    };
  }

  if (paxDaily >= 30000) {
    // High Density (Orange / Hot Amber)
    return {
      color: '#f97316',
      glow: 'rgba(249, 115, 22, 0.55)',
      label: 'High Density (30k-60k pax)',
      strokeWidth: 5,
    };
  }

  if (paxDaily >= 12000) {
    // Medium Density (Neon Lime / Yellow-Green)
    return {
      color: '#a3e635',
      glow: 'rgba(163, 230, 53, 0.45)',
      label: 'Medium Density (12k-30k pax)',
      strokeWidth: 4,
    };
  }

  if (paxDaily >= 5000) {
    // Moderate / Low-Medium Density (Cyan)
    return {
      color: '#06b6d4',
      glow: 'rgba(6, 182, 212, 0.4)',
      label: 'Moderate Density (5k-12k pax)',
      strokeWidth: 3.5,
    };
  }

  // Low Density (Cool Blue / Royal Navy)
  return {
    color: isDark ? '#3b82f6' : '#2563eb',
    glow: 'rgba(59, 130, 246, 0.3)',
    label: 'Low Density (<5k pax)',
    strokeWidth: 3,
  };
}
