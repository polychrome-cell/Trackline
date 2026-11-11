import { BuiltRoute, OwnedTrain, Station, TrainModel } from '../types';

export type AchievementCategory =
  | 'train_development'
  | 'infrastructure'
  | 'international'
  | 'financial';

export type AchievementTier = 'beginner' | 'intermediate' | 'advanced' | 'master';

export interface AchievementGameState {
  ownedTrains: OwnedTrain[];
  trainCatalog: TrainModel[];
  builtRoutes: BuiltRoute[];
  stations: Station[];
  treasury: number;
  totalNetPerDay: number;
}

export interface AchievementProgress {
  current: number;
  target: number;
  percent: number;
  formattedCurrent: string;
  formattedTarget: string;
}

export interface Achievement {
  id: string;
  title: string;
  category: AchievementCategory;
  categoryLabel: string;
  tier: AchievementTier;
  tierLabel: string;
  description: string;
  icon: string;
  targetValue: number;
  unit: string;
  rewardCash: number;
  rewardPrestige: number;
  perkDescription?: string;
  checkUnlocked: (state: AchievementGameState) => boolean;
  getProgress: (state: AchievementGameState) => AchievementProgress;
}

export interface AchievementRecord {
  unlocked: boolean;
  unlockedAt?: number;
  claimed: boolean;
}

export interface DispatcherRank {
  level: number;
  title: string;
  minPrestige: number;
  icon: string;
  badgeColor: string;
  perks: string[];
}

export interface PlayerProgressionState {
  unlockedRecords: Record<string, AchievementRecord>;
  prestigePoints: number;
  unlockedPerks: string[];
}

export const DISPATCHER_RANKS: DispatcherRank[] = [
  {
    level: 1,
    title: 'Junior Dispatcher',
    minPrestige: 0,
    icon: '🧭',
    badgeColor: '#64748b',
    perks: ['Standard commercial network dispatch clearance', 'Regional track access'],
  },
  {
    level: 2,
    title: 'Line Controller',
    minPrestige: 120,
    icon: '⚡',
    badgeColor: '#38bdf8',
    perks: ['+5% Commuter & Express ticket revenue yield', 'Advanced schedule telemetry'],
  },
  {
    level: 3,
    title: 'Regional Superintendent',
    minPrestige: 350,
    icon: '🚄',
    badgeColor: '#10b981',
    perks: ['-10% Fleet maintenance & depot servicing costs', 'High-density corridor clearance'],
  },
  {
    level: 4,
    title: 'Chief Operations Director',
    minPrestige: 700,
    icon: '⭐',
    badgeColor: '#a855f7',
    perks: ['Priority platform turnaround slots (+6% on-time performance)', 'Multi-train corridor synchronization'],
  },
  {
    level: 5,
    title: 'Trans-Continental Commissioner',
    minPrestige: 1300,
    icon: '🌐',
    badgeColor: '#f59e0b',
    perks: ['-20% Station acquisition licensing fees across all territories', 'Cross-border express rights'],
  },
  {
    level: 6,
    title: 'Global Railway Legend',
    minPrestige: 2100,
    icon: '👑',
    badgeColor: '#d4f04c',
    perks: ['+10% Network-wide passenger demand boost', 'Golden Sovereign honorary dispatcher livery'],
  },
];

export const ACHIEVEMENTS_CATALOG: Achievement[] = [
  // ==========================================
  // --- A. TRAIN DEVELOPMENT ---
  // ==========================================
  {
    id: 'first-train',
    title: 'First Train',
    category: 'train_development',
    categoryLabel: 'Train Development',
    tier: 'beginner',
    tierLabel: 'NOVICE',
    description: 'Purchase or commission your first train into active service.',
    icon: '🚂',
    targetValue: 1,
    unit: 'train',
    rewardCash: 150000,
    rewardPrestige: 15,
    perkDescription: 'Initial fleet roster telemetry.',
    checkUnlocked: (state) => state.ownedTrains.length >= 1,
    getProgress: (state) => {
      const current = state.ownedTrains.length;
      return {
        current,
        target: 1,
        percent: Math.min(100, Math.round((current / 1) * 100)),
        formattedCurrent: `${current}`,
        formattedTarget: '1 train',
      };
    },
  },
  {
    id: 'express-fleet',
    title: 'Express Operator',
    category: 'train_development',
    categoryLabel: 'Train Development',
    tier: 'intermediate',
    tierLabel: 'CHALLENGE',
    description: 'Operate an active regional express route moving at least 4,000 daily passengers.',
    icon: '🚆',
    targetValue: 4000,
    unit: 'passengers/day',
    rewardCash: 500000,
    rewardPrestige: 40,
    perkDescription: '+5% passenger load factor on regional express corridors.',
    checkUnlocked: (state) => {
      return state.builtRoutes.some(
        (r) => r.trackType === 'express' && r.status === 'active' && r.dailyPassengers >= 4000
      );
    },
    getProgress: (state) => {
      const best = state.builtRoutes
        .filter((r) => r.trackType === 'express')
        .reduce((max, r) => Math.max(max, r.dailyPassengers), 0);
      return {
        current: best,
        target: 4000,
        percent: Math.min(100, Math.round((best / 4000) * 100)),
        formattedCurrent: `${best.toLocaleString()} pax/day`,
        formattedTarget: '4,000 pax/day',
      };
    },
  },
  {
    id: 'speed-pioneer',
    title: 'High-Speed Pioneer',
    category: 'train_development',
    categoryLabel: 'Train Development',
    tier: 'advanced',
    tierLabel: 'EXPERT',
    description: 'Operate an active High-Speed Line (300+ km/h track) with an assigned bullet train moving at least 6,000 passengers daily.',
    icon: '⚡',
    targetValue: 6000,
    unit: 'passengers/day',
    rewardCash: 2000000,
    rewardPrestige: 90,
    perkDescription: 'High-speed corridor priority dispatch rights.',
    checkUnlocked: (state) => {
      return state.builtRoutes.some((r) => {
        if (r.trackType !== 'high_speed' || r.status !== 'active' || r.dailyPassengers < 6000) return false;
        return r.assignedTrainIds.some((tid) => {
          const t = state.ownedTrains.find((ot) => ot.id === tid);
          const m = state.trainCatalog.find((tc) => tc.id === t?.modelId);
          return m && (m.trackType === 'high_speed' || m.maxSpeedKmH >= 300);
        });
      });
    },
    getProgress: (state) => {
      const hsrRoutes = state.builtRoutes.filter((r) => r.trackType === 'high_speed');
      const best = hsrRoutes.reduce((max, r) => Math.max(max, r.dailyPassengers), 0);
      return {
        current: best,
        target: 6000,
        percent: Math.min(100, Math.round((best / 6000) * 100)),
        formattedCurrent: `${best.toLocaleString()} pax/day`,
        formattedTarget: '6,000 pax/day (HSR)',
      };
    },
  },
  {
    id: 'next-generation',
    title: 'Next-Gen Flagships',
    category: 'train_development',
    categoryLabel: 'Train Development',
    tier: 'advanced',
    tierLabel: 'EXPERT',
    description: 'Procure and own at least 3 next-generation flagship trainsets capable of 330+ km/h (e.g. CR400AF Fuxing, N700S Supreme, or Avelia Horizon).',
    icon: '🚅',
    targetValue: 3,
    unit: 'flagships',
    rewardCash: 3500000,
    rewardPrestige: 140,
    perkDescription: '+4% passenger comfort rating on flagship lines.',
    checkUnlocked: (state) => {
      const count = state.ownedTrains.filter((t) => {
        const model = state.trainCatalog.find((m) => m.id === t.modelId);
        return model && model.maxSpeedKmH >= 330;
      }).length;
      return count >= 3;
    },
    getProgress: (state) => {
      const count = state.ownedTrains.filter((t) => {
        const model = state.trainCatalog.find((m) => m.id === t.modelId);
        return model && model.maxSpeedKmH >= 330;
      }).length;
      return {
        current: count,
        target: 3,
        percent: Math.min(100, Math.round((count / 3) * 100)),
        formattedCurrent: `${count} flagships`,
        formattedTarget: '3 flagships (330+ km/h)',
      };
    },
  },
  {
    id: 'modern-fleet',
    title: 'Modern Fleet Expansion',
    category: 'train_development',
    categoryLabel: 'Train Development',
    tier: 'master',
    tierLabel: 'LEGENDARY',
    description: 'Procure and operate at least 8 active trains with an average fleet condition rating above 85%.',
    icon: '🏢',
    targetValue: 8,
    unit: 'trains',
    rewardCash: 5000000,
    rewardPrestige: 200,
    perkDescription: '-5% bulk procurement discount on future train orders.',
    checkUnlocked: (state) => {
      if (state.ownedTrains.length < 8) return false;
      const avgCondition =
        state.ownedTrains.reduce((sum, t) => sum + t.conditionPercent, 0) / state.ownedTrains.length;
      return avgCondition >= 85;
    },
    getProgress: (state) => {
      const count = state.ownedTrains.length;
      const avgCondition = count > 0
        ? Math.round(state.ownedTrains.reduce((sum, t) => sum + t.conditionPercent, 0) / count)
        : 0;
      return {
        current: count,
        target: 8,
        percent: Math.min(100, Math.round((count / 8) * 100)),
        formattedCurrent: `${count} trains (${avgCondition}% avg cond)`,
        formattedTarget: '8 trains (>85% cond)',
      };
    },
  },
  {
    id: 'railway-legend',
    title: 'Fleet Diversity Titan',
    category: 'train_development',
    categoryLabel: 'Train Development',
    tier: 'master',
    tierLabel: 'LEGENDARY',
    description: 'Operate an extensive fleet of at least 12 trains sourced from 4 or more global manufacturers.',
    icon: '🎖️',
    targetValue: 12,
    unit: 'trains',
    rewardCash: 7500000,
    rewardPrestige: 280,
    perkDescription: 'Global manufacturer preferred client tier (-10% maintenance).',
    checkUnlocked: (state) => {
      if (state.ownedTrains.length < 12) return false;
      const mfrs = new Set(
        state.ownedTrains.map((t) => {
          const m = state.trainCatalog.find((tc) => tc.id === t.modelId);
          return m?.manufacturerId;
        }).filter(Boolean)
      );
      return mfrs.size >= 4;
    },
    getProgress: (state) => {
      const count = state.ownedTrains.length;
      const mfrs = new Set(
        state.ownedTrains.map((t) => {
          const m = state.trainCatalog.find((tc) => tc.id === t.modelId);
          return m?.manufacturerId;
        }).filter(Boolean)
      );
      return {
        current: count,
        target: 12,
        percent: Math.min(100, Math.round((count / 12) * 100)),
        formattedCurrent: `${count}/12 trains (${mfrs.size}/4 mfrs)`,
        formattedTarget: '12 trains across 4 manufacturers',
      };
    },
  },

  // ==========================================
  // --- B. RAILWAY INFRASTRUCTURE ---
  // ==========================================
  {
    id: 'first-connection',
    title: 'First Connection',
    category: 'infrastructure',
    categoryLabel: 'Railway Infrastructure',
    tier: 'beginner',
    tierLabel: 'NOVICE',
    description: 'Establish and commission your first commercial railway route.',
    icon: '🛤️',
    targetValue: 1,
    unit: 'route',
    rewardCash: 150000,
    rewardPrestige: 20,
    perkDescription: 'Unlocks corridor density telemetry.',
    checkUnlocked: (state) => state.builtRoutes.length >= 1,
    getProgress: (state) => {
      const current = state.builtRoutes.length;
      return {
        current,
        target: 1,
        percent: current >= 1 ? 100 : 0,
        formattedCurrent: `${current}`,
        formattedTarget: '1 route',
      };
    },
  },
  {
    id: 'intercity-network',
    title: 'Intercity Dual Network',
    category: 'infrastructure',
    categoryLabel: 'Railway Infrastructure',
    tier: 'intermediate',
    tierLabel: 'CHALLENGE',
    description: 'Operate at least 2 active routes generating positive net profit simultaneously.',
    icon: '🏙️',
    targetValue: 2,
    unit: 'routes',
    rewardCash: 600000,
    rewardPrestige: 60,
    perkDescription: '+4% commuter passenger retention.',
    checkUnlocked: (state) => {
      const activeProfitable = state.builtRoutes.filter(
        (r) => r.status === 'active' && r.netProfit > 0
      );
      return activeProfitable.length >= 2;
    },
    getProgress: (state) => {
      const count = state.builtRoutes.filter((r) => r.status === 'active' && r.netProfit > 0).length;
      return {
        current: count,
        target: 2,
        percent: Math.min(100, Math.round((count / 2) * 100)),
        formattedCurrent: `${count} routes`,
        formattedTarget: '2 profitable routes',
      };
    },
  },
  {
    id: 'high-speed-infrastructure',
    title: 'High-Speed Trunk Corridor',
    category: 'infrastructure',
    categoryLabel: 'Railway Infrastructure',
    tier: 'advanced',
    tierLabel: 'EXPERT',
    description: 'Construct and operate high-speed rail track spanning at least 500 km.',
    icon: '⚡',
    targetValue: 500,
    unit: 'km',
    rewardCash: 2500000,
    rewardPrestige: 110,
    perkDescription: '+10% ticket pricing threshold on dedicated HSR track.',
    checkUnlocked: (state) => {
      const hsrKm = state.builtRoutes
        .filter((r) => r.trackType === 'high_speed')
        .reduce((sum, r) => sum + r.distanceKm, 0);
      return hsrKm >= 500;
    },
    getProgress: (state) => {
      const hsrKm = state.builtRoutes
        .filter((r) => r.trackType === 'high_speed')
        .reduce((sum, r) => sum + r.distanceKm, 0);
      return {
        current: hsrKm,
        target: 500,
        percent: Math.min(100, Math.round((hsrKm / 500) * 100)),
        formattedCurrent: `${hsrKm.toLocaleString()} km`,
        formattedTarget: '500 km of HSR',
      };
    },
  },
  {
    id: 'speed-network',
    title: 'High-Speed Trunk Network',
    category: 'infrastructure',
    categoryLabel: 'Railway Infrastructure',
    tier: 'master',
    tierLabel: 'LEGENDARY',
    description: 'Operate 4 or more dedicated high-speed routes simultaneously.',
    icon: '🌐',
    targetValue: 4,
    unit: 'HSR routes',
    rewardCash: 5500000,
    rewardPrestige: 220,
    perkDescription: 'Automated high-speed track switch prioritization.',
    checkUnlocked: (state) => {
      return state.builtRoutes.filter((r) => r.trackType === 'high_speed' && r.status === 'active').length >= 4;
    },
    getProgress: (state) => {
      const count = state.builtRoutes.filter((r) => r.trackType === 'high_speed' && r.status === 'active').length;
      return {
        current: count,
        target: 4,
        percent: Math.min(100, Math.round((count / 4) * 100)),
        formattedCurrent: `${count}`,
        formattedTarget: '4 HSR routes',
      };
    },
  },
  {
    id: 'national-network',
    title: 'Trans-National Grid',
    category: 'infrastructure',
    categoryLabel: 'Railway Infrastructure',
    tier: 'advanced',
    tierLabel: 'EXPERT',
    description: 'Connect or acquire at least 6 stations into your operational railway network.',
    icon: '🗺️',
    targetValue: 6,
    unit: 'stations',
    rewardCash: 3000000,
    rewardPrestige: 130,
    perkDescription: 'Regional hub synchronization privileges.',
    checkUnlocked: (state) => {
      const connectedStationIds = new Set<string>();
      state.stations.filter((s) => s.isOwned).forEach((s) => connectedStationIds.add(s.id));
      state.builtRoutes.forEach((r) => {
        connectedStationIds.add(r.stationAId);
        connectedStationIds.add(r.stationBId);
      });
      return connectedStationIds.size >= 6;
    },
    getProgress: (state) => {
      const connectedStationIds = new Set<string>();
      state.stations.filter((s) => s.isOwned).forEach((s) => connectedStationIds.add(s.id));
      state.builtRoutes.forEach((r) => {
        connectedStationIds.add(r.stationAId);
        connectedStationIds.add(r.stationBId);
      });
      const current = connectedStationIds.size;
      return {
        current,
        target: 6,
        percent: Math.min(100, Math.round((current / 6) * 100)),
        formattedCurrent: `${current}`,
        formattedTarget: '6 stations',
      };
    },
  },
  {
    id: 'railway-empire',
    title: 'Grand Railway Empire',
    category: 'infrastructure',
    categoryLabel: 'Railway Infrastructure',
    tier: 'master',
    tierLabel: 'LEGENDARY',
    description: 'Build an extensive interconnected network spanning over 3,500 total kilometers of active track.',
    icon: '🏛️',
    targetValue: 3500,
    unit: 'km',
    rewardCash: 7000000,
    rewardPrestige: 260,
    perkDescription: '+8% network brand value multiplier.',
    checkUnlocked: (state) => {
      const totalKm = state.builtRoutes.reduce((sum, r) => sum + r.distanceKm, 0);
      return totalKm >= 3500;
    },
    getProgress: (state) => {
      const totalKm = state.builtRoutes.reduce((sum, r) => sum + r.distanceKm, 0);
      return {
        current: totalKm,
        target: 3500,
        percent: Math.min(100, Math.round((totalKm / 3500) * 100)),
        formattedCurrent: `${totalKm.toLocaleString()} km`,
        formattedTarget: '3,500 km',
      };
    },
  },

  // ==========================================
  // --- C. INTERNATIONAL EXPANSION ---
  // ==========================================
  {
    id: 'beyond-borders',
    title: 'Beyond Borders',
    category: 'international',
    categoryLabel: 'International Expansion',
    tier: 'intermediate',
    tierLabel: 'CHALLENGE',
    description: 'Expand operations to operate active routes or stations in 2 or more countries.',
    icon: '🛂',
    targetValue: 2,
    unit: 'countries',
    rewardCash: 1500000,
    rewardPrestige: 90,
    perkDescription: 'Cross-border customs fast-track clearance.',
    checkUnlocked: (state) => {
      const countries = new Set<string>();
      const stationMap = new Map(state.stations.map((s) => [s.id, s]));
      state.stations.filter((s) => s.isOwned).forEach((s) => countries.add(s.country));
      state.builtRoutes.forEach((r) => {
        const sA = stationMap.get(r.stationAId);
        const sB = stationMap.get(r.stationBId);
        if (sA) countries.add(sA.country);
        if (sB) countries.add(sB.country);
      });
      return countries.size >= 2;
    },
    getProgress: (state) => {
      const countries = new Set<string>();
      const stationMap = new Map(state.stations.map((s) => [s.id, s]));
      state.stations.filter((s) => s.isOwned).forEach((s) => countries.add(s.country));
      state.builtRoutes.forEach((r) => {
        const sA = stationMap.get(r.stationAId);
        const sB = stationMap.get(r.stationBId);
        if (sA) countries.add(sA.country);
        if (sB) countries.add(sB.country);
      });
      const current = countries.size;
      return {
        current,
        target: 2,
        percent: Math.min(100, Math.round((current / 2) * 100)),
        formattedCurrent: `${current} countries`,
        formattedTarget: '2 countries',
      };
    },
  },
  {
    id: 'continental-gateway',
    title: 'Continental Gateway',
    category: 'international',
    categoryLabel: 'International Expansion',
    tier: 'advanced',
    tierLabel: 'EXPERT',
    description: 'Establish operational routes or owned hubs in at least 3 distinct geographic regions.',
    icon: '🌏',
    targetValue: 3,
    unit: 'regions',
    rewardCash: 4000000,
    rewardPrestige: 180,
    perkDescription: 'Multi-regional dispatch coordination clearance.',
    checkUnlocked: (state) => {
      const regions = new Set<string>();
      const stationMap = new Map(state.stations.map((s) => [s.id, s]));
      state.stations.filter((s) => s.isOwned).forEach((s) => regions.add(s.regionId));
      state.builtRoutes.forEach((r) => {
        const sA = stationMap.get(r.stationAId);
        const sB = stationMap.get(r.stationBId);
        if (sA) regions.add(sA.regionId);
        if (sB) regions.add(sB.regionId);
      });
      return regions.size >= 3;
    },
    getProgress: (state) => {
      const regions = new Set<string>();
      const stationMap = new Map(state.stations.map((s) => [s.id, s]));
      state.stations.filter((s) => s.isOwned).forEach((s) => regions.add(s.regionId));
      state.builtRoutes.forEach((r) => {
        const sA = stationMap.get(r.stationAId);
        const sB = stationMap.get(r.stationBId);
        if (sA) regions.add(sA.regionId);
        if (sB) regions.add(sB.regionId);
      });
      const current = regions.size;
      return {
        current,
        target: 3,
        percent: Math.min(100, Math.round((current / 3) * 100)),
        formattedCurrent: `${current} regions`,
        formattedTarget: '3 regions',
      };
    },
  },
  {
    id: 'global-rail-operator',
    title: 'Global Rail Operator',
    category: 'international',
    categoryLabel: 'International Expansion',
    tier: 'master',
    tierLabel: 'LEGENDARY',
    description: 'Operate active routes across 4 or more regional territories with at least 5 active routes.',
    icon: '🛰️',
    targetValue: 4,
    unit: 'territories',
    rewardCash: 8500000,
    rewardPrestige: 320,
    perkDescription: 'Global international consortium leadership.',
    checkUnlocked: (state) => {
      if (state.builtRoutes.length < 5) return false;
      const regions = new Set<string>();
      const stationMap = new Map(state.stations.map((s) => [s.id, s]));
      state.stations.filter((s) => s.isOwned).forEach((s) => regions.add(s.regionId));
      state.builtRoutes.forEach((r) => {
        const sA = stationMap.get(r.stationAId);
        const sB = stationMap.get(r.stationBId);
        if (sA) regions.add(sA.regionId);
        if (sB) regions.add(sB.regionId);
      });
      return regions.size >= 4;
    },
    getProgress: (state) => {
      const regions = new Set<string>();
      const stationMap = new Map(state.stations.map((s) => [s.id, s]));
      state.stations.filter((s) => s.isOwned).forEach((s) => regions.add(s.regionId));
      state.builtRoutes.forEach((r) => {
        const sA = stationMap.get(r.stationAId);
        const sB = stationMap.get(r.stationBId);
        if (sA) regions.add(sA.regionId);
        if (sB) regions.add(sB.regionId);
      });
      const current = regions.size;
      return {
        current,
        target: 4,
        percent: Math.min(100, Math.round((current / 4) * 100)),
        formattedCurrent: `${current} territories (${state.builtRoutes.length}/5 routes)`,
        formattedTarget: '4 territories & 5 routes',
      };
    },
  },

  // ==========================================
  // --- D. FINANCIAL MASTERY ---
  // ==========================================
  {
    id: 'capital-reserves',
    title: 'Treasury Expansion',
    category: 'financial',
    categoryLabel: 'Financial Mastery',
    tier: 'intermediate',
    tierLabel: 'CHALLENGE',
    description: 'Grow operational treasury reserves beyond $40,000,000 through successful network expansion.',
    icon: '💰',
    targetValue: 40000000,
    unit: 'USD',
    rewardCash: 1200000,
    rewardPrestige: 75,
    perkDescription: '+2% interest return on treasury bank reserves.',
    checkUnlocked: (state) => state.treasury >= 40000000,
    getProgress: (state) => {
      const current = state.treasury;
      return {
        current,
        target: 40000000,
        percent: Math.min(100, Math.round((current / 40000000) * 100)),
        formattedCurrent: `$${(current / 1000000).toFixed(2)}M`,
        formattedTarget: '$40.0M',
      };
    },
  },
  {
    id: 'daily-profit-king',
    title: 'Daily Profit King',
    category: 'financial',
    categoryLabel: 'Financial Mastery',
    tier: 'advanced',
    tierLabel: 'EXPERT',
    description: 'Achieve a daily net profit exceeding $250,000/day across active commercial routes.',
    icon: '📈',
    targetValue: 250000,
    unit: 'USD/day',
    rewardCash: 3000000,
    rewardPrestige: 150,
    perkDescription: 'Corporate tax optimization credit (-4% operational taxes).',
    checkUnlocked: (state) => state.totalNetPerDay >= 250000,
    getProgress: (state) => {
      const current = Math.max(0, state.totalNetPerDay);
      return {
        current,
        target: 250000,
        percent: Math.min(100, Math.round((current / 250000) * 100)),
        formattedCurrent: `$${(current / 1000).toFixed(0)}k/day`,
        formattedTarget: '$250k/day',
      };
    },
  },
  {
    id: 'transportation-mogul',
    title: 'Transportation Mogul',
    category: 'financial',
    categoryLabel: 'Financial Mastery',
    tier: 'master',
    tierLabel: 'LEGENDARY',
    description: 'Accumulate over $60,000,000 in treasury capital and generate over $500,000/day net profit.',
    icon: '💎',
    targetValue: 60000000,
    unit: 'USD',
    rewardCash: 9000000,
    rewardPrestige: 320,
    perkDescription: '+15% institutional investor equity credit.',
    checkUnlocked: (state) => state.treasury >= 60000000 && state.totalNetPerDay >= 500000,
    getProgress: (state) => {
      const tPct = Math.min(100, Math.round((state.treasury / 60000000) * 100));
      const pPct = Math.min(100, Math.round((state.totalNetPerDay / 500000) * 100));
      const overall = Math.round((tPct + pPct) / 2);
      return {
        current: state.treasury,
        target: 60000000,
        percent: Math.min(100, overall),
        formattedCurrent: `$${(state.treasury / 1000000).toFixed(1)}M · $${(state.totalNetPerDay / 1000).toFixed(0)}k/day`,
        formattedTarget: '$60M & $500k/day',
      };
    },
  },
];

export const INITIAL_PROGRESSION_STATE: PlayerProgressionState = {
  unlockedRecords: {},
  prestigePoints: 0,
  unlockedPerks: [],
};

/**
 * Determine the current Dispatcher Rank based on accumulated prestige points
 */
export function getDispatcherRank(prestige: number): DispatcherRank {
  for (let i = DISPATCHER_RANKS.length - 1; i >= 0; i--) {
    if (prestige >= DISPATCHER_RANKS[i].minPrestige) {
      return DISPATCHER_RANKS[i];
    }
  }
  return DISPATCHER_RANKS[0];
}

/**
 * Determine the next Dispatcher Rank to reach, or null if at max rank
 */
export function getNextDispatcherRank(prestige: number): DispatcherRank | null {
  for (let i = 0; i < DISPATCHER_RANKS.length; i++) {
    if (prestige < DISPATCHER_RANKS[i].minPrestige) {
      return DISPATCHER_RANKS[i];
    }
  }
  return null;
}

/**
 * Evaluate all achievements against the current game state.
 * Returns updated records and a list of newly unlocked achievements for toasts.
 */
export function evaluateAchievements(
  state: AchievementGameState,
  currentRecords: Record<string, AchievementRecord>
): { updatedRecords: Record<string, AchievementRecord>; newlyUnlocked: Achievement[] } {
  const updatedRecords = { ...currentRecords };
  const newlyUnlocked: Achievement[] = [];
  const now = Date.now();

  for (const ach of ACHIEVEMENTS_CATALOG) {
    const existing = updatedRecords[ach.id];
    const isUnlocked = existing?.unlocked || ach.checkUnlocked(state);

    if (isUnlocked) {
      if (!existing || !existing.unlocked) {
        newlyUnlocked.push(ach);
        updatedRecords[ach.id] = {
          unlocked: true,
          unlockedAt: now,
          claimed: false,
        };
      }
    } else {
      if (!existing) {
        updatedRecords[ach.id] = {
          unlocked: false,
          claimed: false,
        };
      }
    }
  }

  return { updatedRecords, newlyUnlocked };
}

/**
 * Claims a single achievement's cash and prestige rewards
 */
export function claimAchievementReward(
  achievementId: string,
  progression: PlayerProgressionState
): {
  updatedProgression: PlayerProgressionState;
  cashReward: number;
  prestigeReward: number;
  achievementTitle: string;
} {
  const ach = ACHIEVEMENTS_CATALOG.find((a) => a.id === achievementId);
  if (!ach) {
    return {
      updatedProgression: progression,
      cashReward: 0,
      prestigeReward: 0,
      achievementTitle: '',
    };
  }

  const record = progression.unlockedRecords[achievementId];
  if (!record || !record.unlocked || record.claimed) {
    return {
      updatedProgression: progression,
      cashReward: 0,
      prestigeReward: 0,
      achievementTitle: ach.title,
    };
  }

  const newRecords = {
    ...progression.unlockedRecords,
    [achievementId]: {
      ...record,
      claimed: true,
    },
  };

  const newPrestige = progression.prestigePoints + ach.rewardPrestige;
  const newPerks = ach.perkDescription && !progression.unlockedPerks.includes(ach.perkDescription)
    ? [...progression.unlockedPerks, ach.perkDescription]
    : progression.unlockedPerks;

  return {
    updatedProgression: {
      unlockedRecords: newRecords,
      prestigePoints: newPrestige,
      unlockedPerks: newPerks,
    },
    cashReward: ach.rewardCash,
    prestigeReward: ach.rewardPrestige,
    achievementTitle: ach.title,
  };
}

/**
 * Claim all ready-to-claim achievements in a single batch
 */
export function claimAllAchievementRewards(progression: PlayerProgressionState): {
  updatedProgression: PlayerProgressionState;
  totalCashReward: number;
  totalPrestigeReward: number;
  claimedCount: number;
} {
  let totalCash = 0;
  let totalPrestige = 0;
  let claimedCount = 0;
  const newRecords = { ...progression.unlockedRecords };
  const newPerks = [...progression.unlockedPerks];

  for (const ach of ACHIEVEMENTS_CATALOG) {
    const record = newRecords[ach.id];
    if (record && record.unlocked && !record.claimed) {
      newRecords[ach.id] = { ...record, claimed: true };
      totalCash += ach.rewardCash;
      totalPrestige += ach.rewardPrestige;
      claimedCount++;
      if (ach.perkDescription && !newPerks.includes(ach.perkDescription)) {
        newPerks.push(ach.perkDescription);
      }
    }
  }

  return {
    updatedProgression: {
      unlockedRecords: newRecords,
      prestigePoints: progression.prestigePoints + totalPrestige,
      unlockedPerks: newPerks,
    },
    totalCashReward: totalCash,
    totalPrestigeReward: totalPrestige,
    claimedCount,
  };
}

/**
 * Count how many achievements are completed and waiting to be claimed
 */
export function getUnclaimedCount(records: Record<string, AchievementRecord>): number {
  return Object.values(records).filter((r) => r.unlocked && !r.claimed).length;
}

/**
 * Persistence helpers with graceful fallback
 */
const STORAGE_KEY = 'trackline_progression_v1';

export function loadProgressionState(): PlayerProgressionState {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return INITIAL_PROGRESSION_STATE;
    const parsed = JSON.parse(data);
    return {
      unlockedRecords: parsed.unlockedRecords || {},
      prestigePoints: typeof parsed.prestigePoints === 'number' ? parsed.prestigePoints : 0,
      unlockedPerks: Array.isArray(parsed.unlockedPerks) ? parsed.unlockedPerks : [],
    };
  } catch {
    return INITIAL_PROGRESSION_STATE;
  }
}

export function saveProgressionState(state: PlayerProgressionState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota or access issues
  }
}
