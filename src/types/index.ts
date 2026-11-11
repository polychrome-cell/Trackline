export type RegionId = 'all' | 'south_asia' | 'china' | 'east_asia' | 'southeast_asia' | 'world';

export type TrackType = 'high_speed' | 'express' | 'commuter';

export interface Station {
  id: string;
  name: string;
  code: string;
  country: string;
  region: 'South Asia' | 'China' | 'East Asia' | 'Southeast Asia' | 'Global Corridors';
  regionId: RegionId;
  lat: number;
  lng: number;
  gauge: string; // e.g. "1,676 mm · broad gauge", "1,435 mm · standard gauge"
  traction: string; // e.g. "25 kV AC electric"
  description: string;
  isOwned: boolean;
  acquisitionCost: number;
  dispatchSlots: boolean[]; // 10 slots (P1 to P10) true = in use, false = available
  populationMillions: number;
  economicTier: 1 | 2 | 3; // 1 = Megacity, 2 = Major Hub, 3 = Regional Capital
}

export interface Corridor {
  id: string;
  stationAId: string;
  stationBId: string;
  name: string;
  distanceKm: number;
  standardGauge: string;
  supportedTrackTypes: TrackType[];
  description: string;
  baseDailyDemand: number;
  waypoints?: { lat: number; lng: number }[]; // Real geographic alignment points along actual rail corridors
}

export type ThemeMode = 'dark' | 'light';

export type AccentColor = 
  | 'lime'     // #d4f04c - Neon Lime
  | 'cyan'     // #38bdf8 - Cyber Blue
  | 'navy'     // #3b82f6 - Royal Navy
  | 'purple'   // #a855f7 - Electric Purple
  | 'pink'     // #f43f5e - Hot Pink
  | 'emerald'  // #10b981 - Jade Emerald
  | 'amber';   // #f59e0b - Solar Amber

export interface AppSettings {
  themeMode: ThemeMode;
  accentColor: AccentColor;
  showReferenceCorridors: boolean;
  audioFeedback: boolean;
}


export interface BuiltRoute {
  id: string;
  name: string;
  corridorId: string;
  stationAId: string;
  stationBId: string;
  trackType: TrackType;
  trackName: string; // e.g. "Tokaido High-Speed Line 1"
  assignedTrainIds: string[];
  frequencyDaily: number; // e.g. 6 to 24 departures/day
  departureSlots: number[]; // Array of slot indices 1-10
  ticketPrice: number; // in USD
  distanceKm: number;
  dailyPassengers: number;
  dailyRevenue: number;
  dailyCost: number;
  netProfit: number;
  delayRatePercent: number;
  status: 'active' | 'suspended';
}

export type ManufacturerId = 
  | 'hitachi_kawasaki'
  | 'crrc'
  | 'alstom'
  | 'siemens'
  | 'hyundai_rotem'
  | 'icf_indian_rail'
  | 'stadler';

export interface Manufacturer {
  id: ManufacturerId;
  name: string;
  shortName: string;
  country: string;
  headquarters: string;
  flag: string;
  founded: number;
  specialty: string;
  description: string;
}

export interface TrainModel {
  id: string;
  manufacturerId: ManufacturerId;
  name: string;
  seriesCode: string;
  category: 'High-Speed Bullet' | 'Regional Express' | 'Intercity Commuter' | 'Semi-High Speed';
  trackType: TrackType;
  maxSpeedKmH: number;
  passengerCapacity: number;
  purchasePrice: number;
  dailyMaintenance: number;
  reliabilityScore: number; // 0-100
  comfortScore: number; // 0-100
  acceleration: 'Very High' | 'High' | 'Medium';
  powerType: 'Electric EMU' | 'Dual-Mode Electric' | 'Diesel-Electric';
  description: string;
  defaultLivery: {
    baseColor: string;
    stripeColor: string;
    accentColor: string;
    roofColor: string;
  };
}

export interface OwnedTrain {
  id: string;
  modelId: string;
  customName: string;
  assignedRouteId?: string;
  purchaseDay: number;
  totalKmRun: number;
  conditionPercent: number;
  customLiveryId?: string;
}

export interface LiveryDesign {
  id: string;
  name: string;
  baseColor: string;
  primaryStripe: string;
  secondaryStripe: string;
  roofColor: string;
  skirtColor: string;
  noseConeColor: string;
  windowTint: string;
  pattern: 'aerowave' | 'speed_stripe' | 'dual_chevron' | 'two_tone' | 'minimalist';
  companyBrandText: string;
  emblemShape: 'wings' | 'arrow' | 'diamond' | 'circle';
  isDefault?: boolean;
}

export type WeatherType = 'clear' | 'monsoon' | 'typhoon' | 'blizzard' | 'fog' | 'heatwave';

export interface WeatherCondition {
  type: WeatherType;
  title: string;
  affectedRegion: RegionId | 'all';
  severity: number; // 0.1 to 1.0
  speedImpactPercent: number; // e.g. -20% speed
  delayRiskPercent: number; // e.g. +15% delay risk
  demandShiftPercent: number; // e.g. -10% passenger volume
  description: string;
  activeForDays: number;
}

export interface EconomicShift {
  id: string;
  headline: string;
  region: RegionId | 'all';
  demandMultiplier: number;
  maintenanceMultiplier: number;
  daysRemaining: number;
  description: string;
  positive: boolean;
}

export interface DailyFinancialReport {
  day: number;
  ticketRevenue: number;
  operatingCosts: number;
  trackMaintenance: number;
  fleetMaintenance: number;
  netProfit: number;
  totalPassengersMoved: number;
  onTimePerformance: number;
}
