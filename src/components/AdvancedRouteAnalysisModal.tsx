import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { BuiltRoute, Station, OwnedTrain, TrainModel, ThemeMode, AccentColor, TrackType, Corridor } from '../types';
import { formatCurrency } from '../game/simulation';
import { ACCENT_PALETTES, playTacticalSound } from '../utils/theme';
import {
  generate7DayRouteDemand,
  calculateRouteCostBreakdown,
  filterRoutesByTier,
  calculateTierPerformanceSummary,
  RouteFilterTier,
  REFERENCE_BENCHMARK_ROUTES,
} from '../game/routeAnalysis';

interface AdvancedRouteAnalysisModalProps {
  route: BuiltRoute;
  allRoutes?: BuiltRoute[];
  allStations?: Station[];
  allCorridors?: Corridor[];
  assignedTrains: { train: OwnedTrain; model: TrainModel }[];
  currentDay: number;
  onClose: () => void;
  onSelectRoute?: (routeId: string) => void;
  themeMode?: ThemeMode;
  accentColor?: AccentColor;
  audioFeedback?: boolean;
}

export const AdvancedRouteAnalysisModal: React.FC<AdvancedRouteAnalysisModalProps> = ({
  route,
  allRoutes = [],
  allStations = [],
  allCorridors = [],
  assignedTrains,
  currentDay,
  onClose,
  onSelectRoute,
  themeMode = 'dark',
  accentColor = 'lime',
  audioFeedback = true,
}) => {
  const isDark = themeMode === 'dark';
  const accent = ACCENT_PALETTES[accentColor] || ACCENT_PALETTES.lime;

  // Filter & comparison mode state
  const [selectedTierFilter, setSelectedTierFilter] = useState<RouteFilterTier>('all');
  const [activeRouteId, setActiveRouteId] = useState<string>(route.id);
  const [analysisMode, setAnalysisMode] = useState<'route_telemetry' | 'tier_comparison'>('route_telemetry');
  const [activeMetricTab, setActiveMetricTab] = useState<'demand' | 'costs'>('demand');

  // Combine player-built routes with standard Asian benchmark reference routes
  const combinedRoutes = useMemo(() => {
    const playerRoutes = allRoutes && allRoutes.length > 0 ? allRoutes : [route];
    const playerIds = new Set(playerRoutes.map((r) => r.id));
    const benchmarks = REFERENCE_BENCHMARK_ROUTES.filter((br) => !playerIds.has(br.id));
    return [...playerRoutes, ...benchmarks];
  }, [allRoutes, route]);

  // Filter routes according to the active service tier filter
  const filteredRoutes = useMemo(() => {
    return filterRoutesByTier(combinedRoutes, selectedTierFilter);
  }, [combinedRoutes, selectedTierFilter]);

  // Active route object (falls back to first filtered route if previous selection is filtered out)
  const currentRoute = useMemo(() => {
    const found = filteredRoutes.find((r) => r.id === activeRouteId);
    if (found) return found;
    return filteredRoutes[0] || route;
  }, [filteredRoutes, activeRouteId, route]);

  // Lookup stations for active route
  const originStation = useMemo(() => {
    return allStations.find((s) => s.id === currentRoute.stationAId);
  }, [allStations, currentRoute.stationAId]);

  const destinationStation = useMemo(() => {
    return allStations.find((s) => s.id === currentRoute.stationBId);
  }, [allStations, currentRoute.stationBId]);

  // Generate 7-day passenger demand telemetry for the active route
  const demandHistory = useMemo(() => {
    return generate7DayRouteDemand(currentRoute, currentDay);
  }, [currentRoute, currentDay]);

  // Calculate detailed operational expense breakdown for the active route
  const costBreakdown = useMemo(() => {
    return calculateRouteCostBreakdown(currentRoute);
  }, [currentRoute]);

  // Calculate 3-tier comparative performance benchmarks across all routes
  const tierSummary = useMemo(() => {
    return calculateTierPerformanceSummary(combinedRoutes);
  }, [combinedRoutes]);

  // Prepare comparative chart data for the Tier Comparison view
  const comparativeChartData = useMemo(() => {
    return [
      {
        tier: 'High-Speed',
        ridershipPax: tierSummary.high_speed.avgDailyPassengers,
        revenueUsd: tierSummary.high_speed.totalDailyRevenue / 1000,
        netProfitUsd: tierSummary.high_speed.totalDailyNetProfit / 1000,
        marginPercent: tierSummary.high_speed.avgOperatingMarginPercent,
        avgFare: tierSummary.high_speed.avgTicketPrice,
        costPerPax: tierSummary.high_speed.avgCostPerPassenger,
      },
      {
        tier: 'Express',
        ridershipPax: tierSummary.express.avgDailyPassengers,
        revenueUsd: tierSummary.express.totalDailyRevenue / 1000,
        netProfitUsd: tierSummary.express.totalDailyNetProfit / 1000,
        marginPercent: tierSummary.express.avgOperatingMarginPercent,
        avgFare: tierSummary.express.avgTicketPrice,
        costPerPax: tierSummary.express.avgCostPerPassenger,
      },
      {
        tier: 'Commuter',
        ridershipPax: tierSummary.commuter.avgDailyPassengers,
        revenueUsd: tierSummary.commuter.totalDailyRevenue / 1000,
        netProfitUsd: tierSummary.commuter.totalDailyNetProfit / 1000,
        marginPercent: tierSummary.commuter.avgOperatingMarginPercent,
        avgFare: tierSummary.commuter.avgTicketPrice,
        costPerPax: tierSummary.commuter.avgCostPerPassenger,
      },
    ];
  }, [tierSummary]);

  // Overall KPIs for current route
  const operatingMarginPercent = currentRoute.dailyRevenue > 0
    ? Math.round((currentRoute.netProfit / currentRoute.dailyRevenue) * 100)
    : 0;

  const totalCapacity = useMemo(() => {
    if (demandHistory.length > 0) {
      return demandHistory[demandHistory.length - 1].availableCapacity;
    }
    return Math.round(currentRoute.dailyPassengers / 0.78);
  }, [demandHistory, currentRoute.dailyPassengers]);

  const loadFactor = Math.min(100, Math.round((currentRoute.dailyPassengers / totalCapacity) * 100));

  // Determine tier styling badge
  const getTierBadge = (type: TrackType) => {
    switch (type) {
      case 'high_speed':
        return {
          label: 'HIGH-SPEED',
          bg: 'bg-purple-950/60 border-purple-500/50 text-purple-300',
          indicator: '⚡',
        };
      case 'express':
        return {
          label: 'EXPRESS',
          bg: 'bg-cyan-950/60 border-cyan-500/50 text-cyan-300',
          indicator: '🚄',
        };
      case 'commuter':
        return {
          label: 'COMMUTER',
          bg: 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300',
          indicator: '🚆',
        };
    }
  };

  const currentBadge = getTierBadge(currentRoute.trackType);
  const isPlayerOwned = allRoutes.some((r) => r.id === currentRoute.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none animate-in fade-in duration-150">
      <div
        className={`w-full max-w-5xl max-h-[92vh] flex flex-col rounded-lg shadow-2xl border ${
          isDark ? 'bg-[#0f1720] border-[#22303d] text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
        } overflow-hidden`}
      >
        {/* Header */}
        <div
          className={`px-6 py-4 flex items-center justify-between border-b ${
            isDark ? 'border-[#1e2a36] bg-[#0c131a]' : 'border-slate-200 bg-white'
          }`}
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                Corridor Telemetry & Route Intelligence
              </span>
              <span
                className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase border flex items-center gap-1 ${currentBadge.bg}`}
              >
                <span>{currentBadge.indicator}</span>
                <span>{currentBadge.label} · {currentRoute.distanceKm} KM</span>
              </span>
              {isPlayerOwned ? (
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  PLAYER ACTIVE
                </span>
              ) : (
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase bg-slate-800 text-slate-400 border border-slate-700">
                  NETWORK BENCHMARK
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2 mt-0.5">
              <span>{currentRoute.name}</span>
            </h2>
            <div className="text-xs text-slate-400 mt-0.5">
              {originStation?.name || 'Origin Hub'} ➔ {destinationStation?.name || 'Destination Hub'} · {currentRoute.frequencyDaily} Daily Runs · ${currentRoute.ticketPrice} Single Fare
            </div>
          </div>

          <button
            onClick={() => {
              playTacticalSound('click', audioFeedback);
              onClose();
            }}
            className={`p-1.5 rounded text-sm transition-colors cursor-pointer ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
            }`}
            title="Close Route Analysis"
          >
            ✕
          </button>
        </div>

        {/* Filter Toolbar: Toggle between High-Speed, Express, and Commuter routes */}
        <div
          className={`px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 border-b ${
            isDark ? 'bg-[#090e13] border-[#18232e]' : 'bg-slate-100 border-slate-200'
          }`}
        >
          {/* Service Tier Filter Tabs */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 hidden sm:inline">
              SERVICE TIER:
            </span>
            <div className="flex items-center gap-1 bg-black/40 p-0.5 rounded border border-slate-800">
              <button
                type="button"
                onClick={() => {
                  playTacticalSound('click', audioFeedback);
                  setSelectedTierFilter('all');
                }}
                className={`px-3 py-1 text-xs font-mono rounded font-semibold transition-all cursor-pointer ${
                  selectedTierFilter === 'all'
                    ? 'bg-slate-700 text-white shadow-sm'
                    : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ALL ({combinedRoutes.length})
              </button>

              <button
                type="button"
                onClick={() => {
                  playTacticalSound('click', audioFeedback);
                  setSelectedTierFilter('high_speed');
                  const hsRoutes = combinedRoutes.filter((r) => r.trackType === 'high_speed');
                  if (hsRoutes.length > 0 && currentRoute.trackType !== 'high_speed') {
                    setActiveRouteId(hsRoutes[0].id);
                  }
                }}
                className={`px-3 py-1 text-xs font-mono rounded font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  selectedTierFilter === 'high_speed'
                    ? 'bg-purple-900/90 text-purple-200 border border-purple-500/60 shadow-sm'
                    : isDark ? 'text-purple-400 hover:text-purple-200' : 'text-purple-700 hover:text-purple-900'
                }`}
              >
                <span>⚡ HIGH-SPEED</span>
                <span className="text-[10px] opacity-80">
                  ({combinedRoutes.filter((r) => r.trackType === 'high_speed').length})
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playTacticalSound('click', audioFeedback);
                  setSelectedTierFilter('express');
                  const expRoutes = combinedRoutes.filter((r) => r.trackType === 'express');
                  if (expRoutes.length > 0 && currentRoute.trackType !== 'express') {
                    setActiveRouteId(expRoutes[0].id);
                  }
                }}
                className={`px-3 py-1 text-xs font-mono rounded font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  selectedTierFilter === 'express'
                    ? 'bg-cyan-900/90 text-cyan-200 border border-cyan-500/60 shadow-sm'
                    : isDark ? 'text-cyan-400 hover:text-cyan-200' : 'text-cyan-700 hover:text-cyan-900'
                }`}
              >
                <span>🚄 EXPRESS</span>
                <span className="text-[10px] opacity-80">
                  ({combinedRoutes.filter((r) => r.trackType === 'express').length})
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playTacticalSound('click', audioFeedback);
                  setSelectedTierFilter('commuter');
                  const comRoutes = combinedRoutes.filter((r) => r.trackType === 'commuter');
                  if (comRoutes.length > 0 && currentRoute.trackType !== 'commuter') {
                    setActiveRouteId(comRoutes[0].id);
                  }
                }}
                className={`px-3 py-1 text-xs font-mono rounded font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  selectedTierFilter === 'commuter'
                    ? 'bg-emerald-900/90 text-emerald-200 border border-emerald-500/60 shadow-sm'
                    : isDark ? 'text-emerald-400 hover:text-emerald-200' : 'text-emerald-700 hover:text-emerald-900'
                }`}
              >
                <span>🚆 COMMUTER</span>
                <span className="text-[10px] opacity-80">
                  ({combinedRoutes.filter((r) => r.trackType === 'commuter').length})
                </span>
              </button>
            </div>
          </div>

          {/* Analysis View Mode: Single Route Telemetry vs 3-Tier Performance Comparison */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                playTacticalSound('click', audioFeedback);
                setAnalysisMode('route_telemetry');
              }}
              className={`px-3 py-1 text-xs font-mono rounded border transition-all cursor-pointer ${
                analysisMode === 'route_telemetry'
                  ? 'bg-[#182633] border-slate-400 text-white font-bold shadow-sm'
                  : isDark ? 'bg-transparent border-transparent text-slate-400 hover:text-white' : 'bg-transparent border-transparent text-slate-600'
              }`}
            >
              📈 Route Telemetry
            </button>

            <button
              type="button"
              onClick={() => {
                playTacticalSound('click', audioFeedback);
                setAnalysisMode('tier_comparison');
              }}
              className={`px-3 py-1 text-xs font-mono rounded border transition-all cursor-pointer flex items-center gap-1.5 ${
                analysisMode === 'tier_comparison'
                  ? 'bg-amber-950/80 border-amber-400 text-amber-300 font-bold shadow-sm ring-1 ring-amber-400/40'
                  : isDark ? 'bg-transparent border-transparent text-slate-400 hover:text-white' : 'bg-transparent border-transparent text-slate-600'
              }`}
            >
              <span>⚖️ Tier Comparison</span>
              <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-400 font-bold uppercase">
                COMPARE
              </span>
            </button>
          </div>
        </div>

        {/* Horizontal Route Selection Rail for the Filtered Tier */}
        {analysisMode === 'route_telemetry' && (
          <div
            className={`px-6 py-2 border-b overflow-x-auto flex items-center gap-2 ${
              isDark ? 'bg-[#0c1218] border-[#18232e]' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <span className="text-[9px] font-mono uppercase text-slate-500 whitespace-nowrap">
              {selectedTierFilter === 'all' ? 'ROUTES' : selectedTierFilter.replace('_', ' ').toUpperCase()} ({filteredRoutes.length}):
            </span>
            {filteredRoutes.map((r) => {
              const isSelected = r.id === currentRoute.id;
              const isPlayerRoute = allRoutes?.some((ar) => ar.id === r.id);
              const tierColor =
                r.trackType === 'high_speed'
                  ? 'text-purple-400 border-purple-500/40 bg-purple-950/40'
                  : r.trackType === 'express'
                  ? 'text-cyan-400 border-cyan-500/40 bg-cyan-950/40'
                  : 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40';

              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => {
                    playTacticalSound('click', audioFeedback);
                    setActiveRouteId(r.id);
                    onSelectRoute?.(r.id);
                  }}
                  className={`px-2.5 py-1 rounded text-xs font-mono border whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                    isSelected
                      ? 'ring-1 ring-white/80 border-white text-white font-bold bg-[#17222e]'
                      : isDark
                      ? 'border-[#22303d] text-slate-300 hover:border-slate-500 bg-[#101720]'
                      : 'border-slate-300 text-slate-700 hover:border-slate-400 bg-white'
                  }`}
                >
                  <span className={`text-[8.5px] px-1 py-0.2 rounded font-bold uppercase border ${tierColor}`}>
                    {r.trackType === 'high_speed' ? 'HSR' : r.trackType === 'express' ? 'EXP' : 'COM'}
                  </span>
                  <span>{r.name}</span>
                  {isPlayerRoute && (
                    <span className="text-[8px] font-bold text-amber-400 px-1 py-0.2 rounded bg-amber-950/60 border border-amber-600/40">
                      OWNED
                    </span>
                  )}
                  <span className="text-[10px] font-mono text-emerald-400 tabular-nums">
                    +{formatCurrency(r.netProfit)}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Scrollable Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {analysisMode === 'route_telemetry' ? (
            <>
              {/* Top KPI Metric Cards for Active Route */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className={`p-3.5 rounded border ${isDark ? 'bg-[#121a22] border-[#1e2a36]' : 'bg-white border-slate-200 shadow-sm'}`}>
                  <div className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">Daily Ridership</div>
                  <div className="text-xl font-bold font-mono mt-1 text-white tabular-nums">
                    {currentRoute.dailyPassengers.toLocaleString()} <span className="text-xs font-normal text-slate-400">pax</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 font-mono">
                    {loadFactor}% load factor ({totalCapacity.toLocaleString()} cap)
                  </div>
                </div>

                <div className={`p-3.5 rounded border ${isDark ? 'bg-[#121a22] border-[#1e2a36]' : 'bg-white border-slate-200 shadow-sm'}`}>
                  <div className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">Daily Gross Revenue</div>
                  <div className="text-xl font-bold font-mono mt-1 text-emerald-400 tabular-nums">
                    {formatCurrency(currentRoute.dailyRevenue)}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 font-mono">
                    ${currentRoute.ticketPrice} avg yield / ticket
                  </div>
                </div>

                <div className={`p-3.5 rounded border ${isDark ? 'bg-[#121a22] border-[#1e2a36]' : 'bg-white border-slate-200 shadow-sm'}`}>
                  <div className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">Daily Operational Cost</div>
                  <div className="text-xl font-bold font-mono mt-1 text-rose-400 tabular-nums">
                    {formatCurrency(currentRoute.dailyCost)}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 font-mono">
                    ${costBreakdown.costPerPassenger} / passenger
                  </div>
                </div>

                <div className={`p-3.5 rounded border ${isDark ? 'bg-[#121a22] border-[#1e2a36]' : 'bg-white border-slate-200 shadow-sm'}`}>
                  <div className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">Net Operating Profit</div>
                  <div
                    className="text-xl font-bold font-mono mt-1 tabular-nums"
                    style={{ color: currentRoute.netProfit >= 0 ? accent.hex : '#f43f5e' }}
                  >
                    {currentRoute.netProfit >= 0 ? `+${formatCurrency(currentRoute.netProfit)}` : formatCurrency(currentRoute.netProfit)}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 font-mono">
                    {operatingMarginPercent}% Operating Margin
                  </div>
                </div>
              </div>

              {/* Sub-Tabs: 7-Day Passenger Demand Line Graph vs Operational Cost Breakdown */}
              <div className="flex items-center gap-2 border-b border-slate-700/50 pb-2">
                <button
                  type="button"
                  onClick={() => {
                    playTacticalSound('click', audioFeedback);
                    setActiveMetricTab('demand');
                  }}
                  className={`px-3.5 py-1.5 rounded text-xs font-mono font-bold transition-colors cursor-pointer flex items-center gap-2 ${
                    activeMetricTab === 'demand'
                      ? 'text-slate-900 shadow-sm'
                      : 'text-slate-400 hover:text-white bg-[#141c23]'
                  }`}
                  style={activeMetricTab === 'demand' ? { backgroundColor: accent.hex } : {}}
                >
                  <span>📈 7-Day Passenger Demand Graph</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playTacticalSound('click', audioFeedback);
                    setActiveMetricTab('costs');
                  }}
                  className={`px-3.5 py-1.5 rounded text-xs font-mono font-bold transition-colors cursor-pointer flex items-center gap-2 ${
                    activeMetricTab === 'costs'
                      ? 'text-slate-900 shadow-sm'
                      : 'text-slate-400 hover:text-white bg-[#141c23]'
                  }`}
                  style={activeMetricTab === 'costs' ? { backgroundColor: accent.hex } : {}}
                >
                  <span>⚙️ Operational Costs Breakdown</span>
                </button>
              </div>

              {/* VIEW A: 7-Day Passenger Demand Line Graph */}
              {activeMetricTab === 'demand' && (
                <div className={`p-4 rounded-lg border ${isDark ? 'bg-[#10171f] border-[#1e2a36]' : 'bg-white border-slate-200 shadow-sm'} space-y-4`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white tracking-tight">
                        Daily Passenger Demand vs Seating Capacity (Last 7 Days)
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Track daily passenger booking volumes against trainset capacity and daily gross revenue.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-[10px]">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: accent.hex }} />
                        <span className="text-slate-300">Demand</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-0.5 bg-slate-500" />
                        <span className="text-slate-400">Capacity Ceiling</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                        <span className="text-emerald-400">Revenue</span>
                      </span>
                    </div>
                  </div>

                  {/* Recharts Dual-Axis Line Graph */}
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={demandHistory} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e2936' : '#e2e8f0'} />
                        <XAxis
                          dataKey="dayLabel"
                          tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 11, fontFamily: 'monospace' }}
                          axisLine={{ stroke: isDark ? '#334155' : '#cbd5e1' }}
                        />
                        <YAxis
                          yAxisId="left"
                          tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 10, fontFamily: 'monospace' }}
                          axisLine={{ stroke: isDark ? '#334155' : '#cbd5e1' }}
                          tickFormatter={(val) => `${(val / 1000).toFixed(1)}k`}
                        />
                        <YAxis
                          yAxisId="right"
                          orientation="right"
                          tick={{ fill: '#34d399', fontSize: 10, fontFamily: 'monospace' }}
                          axisLine={{ stroke: '#059669' }}
                          tickFormatter={(val) => `$${Math.round(val / 1000)}k`}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: isDark ? '#0b1015' : '#ffffff',
                            borderColor: isDark ? '#334155' : '#cbd5e1',
                            borderRadius: '6px',
                            fontFamily: 'monospace',
                            fontSize: '11px',
                          }}
                          formatter={(value: any, name: any) => {
                            if (name === 'ticketRevenue') return [`$${Number(value).toLocaleString()}`, 'Daily Revenue'];
                            if (name === 'passengerDemand') return [`${Number(value).toLocaleString()} pax`, 'Passenger Demand'];
                            if (name === 'availableCapacity') return [`${Number(value).toLocaleString()} seats`, 'Capacity Ceiling'];
                            return [value, name];
                          }}
                        />
                        <Legend
                          wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace', paddingTop: '8px' }}
                        />
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="passengerDemand"
                          name="Passenger Demand"
                          stroke={accent.hex}
                          strokeWidth={2.5}
                          dot={{ r: 3, fill: accent.hex }}
                          activeDot={{ r: 5 }}
                        />
                        <Line
                          yAxisId="left"
                          type="stepAfter"
                          dataKey="availableCapacity"
                          name="Capacity Ceiling"
                          stroke="#64748b"
                          strokeWidth={1.5}
                          strokeDasharray="4 4"
                          dot={false}
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="ticketRevenue"
                          name="Daily Revenue"
                          stroke="#34d399"
                          strokeWidth={2}
                          dot={{ r: 2.5, fill: '#34d399' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* 7-Day Performance pills */}
                  <div className="grid grid-cols-7 gap-2 pt-2 border-t border-slate-800">
                    {demandHistory.map((d) => (
                      <div
                        key={d.day}
                        className={`p-2 rounded border text-center font-mono ${
                          d.day === currentDay
                            ? 'bg-[#182633] border-slate-400'
                            : isDark ? 'bg-[#0c1218] border-[#18232e]' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="text-[9px] text-slate-400 uppercase">{d.dayLabel}</div>
                        <div className="text-xs font-bold text-white mt-0.5">{d.passengerDemand.toLocaleString()}</div>
                        <div className="text-[9px] text-emerald-400 mt-0.5">{d.loadFactorPercent}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* VIEW B: Operational Costs Breakdown */}
              {activeMetricTab === 'costs' && (
                <div className={`p-4 rounded-lg border ${isDark ? 'bg-[#10171f] border-[#1e2a36]' : 'bg-white border-slate-200 shadow-sm'} space-y-4`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white tracking-tight">
                        Operational Expense Breakdown & Unit Economics
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Categorized operational overhead, power draw, maintenance, and platform fees for this corridor.
                      </p>
                    </div>
                    <div className="text-xs font-mono font-bold text-rose-400">
                      Total / Day: {formatCurrency(costBreakdown.totalDailyCost)}
                    </div>
                  </div>

                  {/* Proportional Stacked Percentage Bar */}
                  <div className="w-full h-4 rounded-full overflow-hidden flex bg-slate-800">
                    {costBreakdown.categories.map((cat, idx) => {
                      const colors = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899'];
                      return (
                        <div
                          key={cat.id}
                          className="h-full transition-all"
                          style={{
                            width: `${cat.percent}%`,
                            backgroundColor: colors[idx % colors.length],
                          }}
                          title={`${cat.name}: ${cat.percent}% (${formatCurrency(cat.amount)})`}
                        />
                      );
                    })}
                  </div>

                  {/* Detailed 5 Category Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    {costBreakdown.categories.map((cat) => (
                      <div
                        key={cat.id}
                        className={`p-3 rounded border flex items-start justify-between ${
                          isDark ? 'bg-[#0d141b] border-[#18232e]' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-xl leading-none mt-0.5">{cat.icon}</span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white">{cat.name}</span>
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-bold">
                                {cat.percent}% of total
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                              {cat.description}
                            </p>
                          </div>
                        </div>

                        <div className="text-right font-mono whitespace-nowrap pl-2">
                          <div className="text-xs font-bold text-white">{formatCurrency(cat.amount)}</div>
                          <div className="text-[9px] text-slate-500 mt-0.5">/ operating day</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Unit Economics Metrics */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                    <div className={`p-3 rounded border ${isDark ? 'bg-[#0c1218] border-[#18232e]' : 'bg-slate-50 border-slate-200'}`}>
                      <div className="text-[10px] font-mono uppercase text-slate-400">Cost Per Passenger Carried</div>
                      <div className="text-base font-bold font-mono text-white mt-1">
                        ${costBreakdown.costPerPassenger} USD
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                        Net margin per ticket: ${(currentRoute.ticketPrice - costBreakdown.costPerPassenger).toFixed(2)}
                      </div>
                    </div>

                    <div className={`p-3 rounded border ${isDark ? 'bg-[#0c1218] border-[#18232e]' : 'bg-slate-50 border-slate-200'}`}>
                      <div className="text-[10px] font-mono uppercase text-slate-400">Cost Per Train-Kilometer</div>
                      <div className="text-base font-bold font-mono text-white mt-1">
                        ${costBreakdown.costPerTrainKm} USD / km
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                        {currentRoute.distanceKm} km route × {currentRoute.frequencyDaily} runs/day
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Assigned Rolling Stock Units */}
              <div className={`p-4 rounded-lg border ${isDark ? 'bg-[#10171f] border-[#1e2a36]' : 'bg-white border-slate-200 shadow-sm'} space-y-3`}>
                <div className="text-xs font-mono uppercase tracking-wider text-slate-400">
                  Assigned Rolling Stock Units ({assignedTrains.length})
                </div>

                {assignedTrains.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {assignedTrains.map(({ train, model }) => (
                      <div
                        key={train.id}
                        className={`p-3 rounded border flex items-center justify-between ${
                          isDark ? 'bg-[#0b1015] border-[#18232e]' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-white">{train.customName}</span>
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-bold">
                              {model.seriesCode}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {model.name} · Max {model.maxSpeedKmH} km/h · {model.passengerCapacity} seats
                          </div>
                        </div>
                        <div className="text-right font-mono">
                          <div className={`text-xs font-bold ${train.conditionPercent > 90 ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {train.conditionPercent}% Cond
                          </div>
                          <div className="text-[9px] text-slate-500">{train.totalKmRun.toLocaleString()} km run</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 font-mono py-2">No rolling stock currently assigned.</div>
                )}
              </div>
            </>
          ) : (
            /* VIEW C: 3-Tier Performance Comparison Matrix (High-Speed vs Express vs Commuter) */
            <div className="space-y-6">
              {/* Introduction Banner */}
              <div className={`p-4 rounded-lg border ${isDark ? 'bg-[#10171f] border-[#1e2a36]' : 'bg-white border-slate-200 shadow-sm'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                      <span>⚖️ Service Tier Economics & Benchmark Comparison</span>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                        HIGH-SPEED vs EXPRESS vs COMMUTER
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Compare operational margins, passenger load dynamics, ticket yield, and cost efficiency across all three railway service categories.
                    </p>
                  </div>
                </div>
              </div>

              {/* 3 Tier Side-by-Side Comparative Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. HIGH-SPEED */}
                <div className="p-4 rounded-lg border bg-[#140d21] border-purple-500/40 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase bg-purple-900/60 text-purple-200 border border-purple-500/50 flex items-center gap-1">
                        <span>⚡</span>
                        <span>HIGH-SPEED RAIL</span>
                      </span>
                      <span className="text-[11px] font-mono text-purple-300 font-bold">
                        {tierSummary.high_speed.routeCount} Lines
                      </span>
                    </div>

                    <div className="text-xs text-purple-200 font-semibold">250–350 km/h Bullet Corridors</div>
                    <p className="text-[11px] text-slate-300 mt-1">
                      Premium long-distance trunk lines connecting megacities with highest ticket yields and low travel times.
                    </p>

                    <div className="mt-4 space-y-2 font-mono text-xs border-t border-purple-800/60 pt-3">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Avg Ridership:</span>
                        <span className="text-white font-bold">{tierSummary.high_speed.avgDailyPassengers.toLocaleString()} pax/day</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Avg Ticket Fare:</span>
                        <span className="text-purple-300 font-bold">${tierSummary.high_speed.avgTicketPrice} USD</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Cost / Passenger:</span>
                        <span className="text-rose-300 font-bold">${tierSummary.high_speed.avgCostPerPassenger}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Operating Margin:</span>
                        <span className="text-emerald-400 font-bold">{tierSummary.high_speed.avgOperatingMarginPercent}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Fleet Load Factor:</span>
                        <span className="text-white font-bold">{tierSummary.high_speed.avgLoadFactorPercent}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-purple-800/40 text-[10px] font-mono text-purple-300">
                    ⚡ High CAPEX, maximum intercity prestige & profit yield.
                  </div>
                </div>

                {/* 2. EXPRESS */}
                <div className="p-4 rounded-lg border bg-[#091a24] border-cyan-500/40 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase bg-cyan-900/60 text-cyan-200 border border-cyan-500/50 flex items-center gap-1">
                        <span>🚄</span>
                        <span>REGIONAL EXPRESS</span>
                      </span>
                      <span className="text-[11px] font-mono text-cyan-300 font-bold">
                        {tierSummary.express.routeCount} Lines
                      </span>
                    </div>

                    <div className="text-xs text-cyan-200 font-semibold">160–200 km/h Mainline Express</div>
                    <p className="text-[11px] text-slate-300 mt-1">
                      Balanced regional spine linking primary hubs and secondary capitals with steady daily passenger flows.
                    </p>

                    <div className="mt-4 space-y-2 font-mono text-xs border-t border-cyan-800/60 pt-3">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Avg Ridership:</span>
                        <span className="text-white font-bold">{tierSummary.express.avgDailyPassengers.toLocaleString()} pax/day</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Avg Ticket Fare:</span>
                        <span className="text-cyan-300 font-bold">${tierSummary.express.avgTicketPrice} USD</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Cost / Passenger:</span>
                        <span className="text-rose-300 font-bold">${tierSummary.express.avgCostPerPassenger}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Operating Margin:</span>
                        <span className="text-emerald-400 font-bold">{tierSummary.express.avgOperatingMarginPercent}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Fleet Load Factor:</span>
                        <span className="text-white font-bold">{tierSummary.express.avgLoadFactorPercent}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-cyan-800/40 text-[10px] font-mono text-cyan-300">
                    🚄 Balanced operational cost, highly dependable daily spine.
                  </div>
                </div>

                {/* 3. COMMUTER */}
                <div className="p-4 rounded-lg border bg-[#0a1e16] border-emerald-500/40 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase bg-emerald-900/60 text-emerald-200 border border-emerald-500/50 flex items-center gap-1">
                        <span>🚆</span>
                        <span>SUBURBAN COMMUTER</span>
                      </span>
                      <span className="text-[11px] font-mono text-emerald-300 font-bold">
                        {tierSummary.commuter.routeCount} Lines
                      </span>
                    </div>

                    <div className="text-xs text-emerald-200 font-semibold">High-Density Urban Shuttle</div>
                    <p className="text-[11px] text-slate-300 mt-1">
                      Frequent daily departures moving massive commuter volumes at affordable fares with maximum asset rotation.
                    </p>

                    <div className="mt-4 space-y-2 font-mono text-xs border-t border-emerald-800/60 pt-3">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Avg Ridership:</span>
                        <span className="text-white font-bold">{tierSummary.commuter.avgDailyPassengers.toLocaleString()} pax/day</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Avg Ticket Fare:</span>
                        <span className="text-emerald-300 font-bold">${tierSummary.commuter.avgTicketPrice} USD</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Cost / Passenger:</span>
                        <span className="text-rose-300 font-bold">${tierSummary.commuter.avgCostPerPassenger}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Operating Margin:</span>
                        <span className="text-emerald-400 font-bold">{tierSummary.commuter.avgOperatingMarginPercent}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Fleet Load Factor:</span>
                        <span className="text-white font-bold">{tierSummary.commuter.avgLoadFactorPercent}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-emerald-800/40 text-[10px] font-mono text-emerald-300">
                    🚆 Highest passenger volume, lowest cost per passenger.
                  </div>
                </div>
              </div>

              {/* Comparative Bar Chart: Ridership & Operating Margin by Tier */}
              <div className={`p-4 rounded-lg border ${isDark ? 'bg-[#10171f] border-[#1e2a36]' : 'bg-white border-slate-200 shadow-sm'} space-y-4`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight">
                      Comparative Tier Metrics: Average Daily Ridership & Operating Margins
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Direct side-by-side performance comparison across High-Speed, Express, and Commuter routes.
                    </p>
                  </div>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={comparativeChartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e2936' : '#e2e8f0'} />
                      <XAxis
                        dataKey="tier"
                        tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 11, fontFamily: 'monospace' }}
                        axisLine={{ stroke: isDark ? '#334155' : '#cbd5e1' }}
                      />
                      <YAxis
                        yAxisId="left"
                        tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 10, fontFamily: 'monospace' }}
                        axisLine={{ stroke: isDark ? '#334155' : '#cbd5e1' }}
                        tickFormatter={(val) => `${Math.round(val / 1000)}k pax`}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        tick={{ fill: '#34d399', fontSize: 10, fontFamily: 'monospace' }}
                        axisLine={{ stroke: '#059669' }}
                        tickFormatter={(val) => `${val}%`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: isDark ? '#0b1015' : '#ffffff',
                          borderColor: isDark ? '#334155' : '#cbd5e1',
                          borderRadius: '6px',
                          fontFamily: 'monospace',
                          fontSize: '11px',
                        }}
                        formatter={(value: any, name: any) => {
                          if (name === 'ridershipPax') return [`${Number(value).toLocaleString()} pax`, 'Avg Ridership'];
                          if (name === 'marginPercent') return [`${value}%`, 'Operating Margin'];
                          if (name === 'avgFare') return [`$${value}`, 'Avg Ticket Yield'];
                          if (name === 'costPerPax') return [`$${value}`, 'Cost Per Passenger'];
                          return [value, name];
                        }}
                      />
                      <Legend
                        wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace', paddingTop: '8px' }}
                      />
                      <Bar
                        yAxisId="left"
                        dataKey="ridershipPax"
                        name="Avg Daily Ridership (pax)"
                        fill="#38bdf8"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        yAxisId="right"
                        dataKey="marginPercent"
                        name="Operating Margin (%)"
                        fill="#34d399"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          className={`px-6 py-3.5 flex items-center justify-between border-t ${
            isDark ? 'border-[#1e2a36] bg-[#0c131a]' : 'border-slate-200 bg-white'
          }`}
        >
          <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
            <span>Route ID:</span>
            <span className="text-white font-semibold">{currentRoute.id}</span>
            <span>·</span>
            <span className="uppercase text-slate-300 font-bold">{currentBadge.label}</span>
          </div>

          <button
            onClick={() => {
              playTacticalSound('click', audioFeedback);
              onClose();
            }}
            className="px-5 py-2 text-xs font-mono font-bold rounded text-slate-900 shadow-md transition-all cursor-pointer"
            style={{ backgroundColor: accent.hex }}
          >
            Done Analyzing
          </button>
        </div>
      </div>
    </div>
  );
};
