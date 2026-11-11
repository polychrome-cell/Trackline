import React, { useState } from 'react';
import { Station, Corridor, BuiltRoute, ThemeMode, AccentColor, DailyFinancialReport } from '../types';
import { formatCurrency } from '../game/simulation';
import { ACCENT_PALETTES } from '../utils/theme';
import { FinancialPerformanceChart } from './FinancialPerformanceChart';

interface StationDetailPanelProps {
  station: Station | null;
  allStations: Station[];
  corridors: Corridor[];
  builtRoutes: BuiltRoute[];
  day: number;
  netPerDay: number;
  treasury: number;
  onOpenPlanner: () => void;
  onAcquireStation: (stationId: string) => void;
  onOpenStationDirectory: () => void;
  themeMode?: ThemeMode;
  accentColor?: AccentColor;
  financialHistory?: DailyFinancialReport[];
  onTabChange?: (tab: 'station' | 'finance') => void;
  onAnalyzeRoute?: (routeId: string) => void;
}

export const StationDetailPanel: React.FC<StationDetailPanelProps> = ({
  station,
  allStations,
  corridors,
  builtRoutes,
  day,
  netPerDay,
  treasury,
  onOpenPlanner,
  onAcquireStation,
  onOpenStationDirectory,
  themeMode = 'dark',
  accentColor = 'lime',
  financialHistory = [],
  onTabChange,
  onAnalyzeRoute,
}) => {
  const [activeViewTab, setActiveViewTab] = useState<'station' | 'finance'>('station');
  const isDark = themeMode === 'dark';
  const accent = ACCENT_PALETTES[accentColor] || ACCENT_PALETTES.lime;
  const ownedStationsCount = allStations.filter((s) => s.isOwned).length;
  const activeRoutesCount = builtRoutes.length;

  // Filter corridors connected to the active station
  const connectedCorridors = station
    ? corridors.filter((c) => c.stationAId === station.id || c.stationBId === station.id)
    : [];

  return (
    <div
      data-tutorial="station-panel"
      className={`w-full lg:w-[420px] h-full flex flex-col ${
        isDark ? 'bg-[#0d1318] border-[#1b252f] text-slate-200' : 'bg-slate-100 border-slate-300 text-slate-800'
      } border-l overflow-y-auto select-none`}
    >
      {/* Top Header: NETWORK OVERVIEW · DAY X */}
      <div className={`p-5 border-b ${isDark ? 'border-[#1b252f]' : 'border-slate-300'}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-sm font-bold tracking-wider uppercase ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
            Network Overview
          </h2>
          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
            <span>DAY {day}</span>
            <span>·</span>
            <span className="font-semibold" style={{ color: accent.hex }}>LOCAL SAVE</span>
          </div>
        </div>

        {/* 3 Metric Tiles (Stations, Routes, Net / Day) */}
        <div className="grid grid-cols-3 gap-2">
          <div className={`p-3 rounded border ${
            isDark ? 'bg-[#131b22] border-[#1f2b36]' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="text-[10px] font-mono tracking-wider uppercase text-slate-400">
              Stations
            </div>
            <div className={`text-xl font-bold font-mono mt-1 tabular-nums ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {ownedStationsCount}
            </div>
          </div>

          <div className={`p-3 rounded border ${
            isDark ? 'bg-[#131b22] border-[#1f2b36]' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="text-[10px] font-mono tracking-wider uppercase text-slate-400">
              Routes
            </div>
            <div className={`text-xl font-bold font-mono mt-1 tabular-nums ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {activeRoutesCount}
            </div>
          </div>

          <div className={`p-3 rounded border ${
            isDark ? 'bg-[#131b22] border-[#1f2b36]' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="text-[10px] font-mono tracking-wider uppercase text-slate-400">
              Net / Day
            </div>
            <div
              className="text-xl font-bold font-mono mt-1 tabular-nums"
              style={{ color: netPerDay >= 0 ? accent.hex : '#f43f5e' }}
            >
              {netPerDay >= 0 ? `+${formatCurrency(netPerDay)}` : formatCurrency(netPerDay)}
            </div>
          </div>
        </div>

        {/* Treasury Status */}
        <div className="mt-3 flex items-center justify-between text-xs font-mono text-slate-400 px-1">
          <span>CORPORATE TREASURY:</span>
          <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{formatCurrency(treasury)}</span>
        </div>

        {/* Sub-Panel Mode Switcher (Station Details vs Financial Performance) */}
        <div className={`mt-3.5 grid grid-cols-2 p-1 rounded border text-xs font-mono font-semibold ${
          isDark ? 'bg-[#0a0f14] border-[#1e2a36]' : 'bg-white border-slate-300 shadow-xs'
        }`}>
          <button
            type="button"
            onClick={() => {
              setActiveViewTab('station');
              onTabChange?.('station');
            }}
            className={`py-1.5 px-2 rounded transition-colors text-center cursor-pointer ${
              activeViewTab === 'station'
                ? isDark
                  ? 'bg-[#1b2530] text-white shadow-xs font-bold'
                  : 'bg-slate-200 text-slate-900 shadow-xs font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
            style={activeViewTab === 'station' ? { borderBottom: `2px solid ${accent.hex}` } : {}}
          >
            Station Specs
          </button>
          <button
            type="button"
            data-tutorial="btn-finances-tab"
            onClick={() => {
              setActiveViewTab('finance');
              onTabChange?.('finance');
            }}
            className={`py-1.5 px-2 rounded transition-colors text-center cursor-pointer flex items-center justify-center gap-1.5 ${
              activeViewTab === 'finance'
                ? isDark
                  ? 'bg-[#1b2530] text-white shadow-xs font-bold'
                  : 'bg-slate-200 text-slate-900 shadow-xs font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
            style={activeViewTab === 'finance' ? { borderBottom: `2px solid ${accent.hex}` } : {}}
          >
            <span>Finances (30D)</span>
            <span
              className="text-[9px] px-1 rounded-full font-bold"
              style={{ backgroundColor: `${accent.hex}30`, color: accent.hex }}
            >
              30d
            </span>
          </button>
        </div>
      </div>

      {/* View 1: Financial Performance Chart (Recharts) */}
      {activeViewTab === 'finance' ? (
        <div data-tutorial="financial-chart-box" className="p-4 flex-1 flex flex-col space-y-4">
          <FinancialPerformanceChart
            data={financialHistory}
            accentColor={accentColor}
            themeMode={themeMode}
          />

          {/* Additional Financial Breakdown Table */}
          <div className={`p-3.5 rounded border ${
            isDark ? 'bg-[#10171f] border-[#1e2a36]' : 'bg-white border-slate-200'
          }`}>
            <div className="text-[10.5px] font-mono uppercase tracking-wider text-slate-400 mb-2">
              Recent Daily Ledgers
            </div>

            <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
              {[...financialHistory].reverse().slice(0, 7).map((entry) => (
                <div
                  key={entry.day}
                  className={`flex items-center justify-between p-2 rounded text-xs font-mono ${
                    isDark ? 'bg-[#0a0f14]/60' : 'bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-400">Day {entry.day}</span>
                    <span className="text-[10px] text-slate-500">{entry.onTimePerformance}% OTP</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-slate-400">{formatCurrency(entry.ticketRevenue)}</span>
                    <span
                      className="font-bold tabular-nums"
                      style={{ color: entry.netProfit >= 0 ? accent.hex : '#f43f5e' }}
                    >
                      {entry.netProfit >= 0 ? `+${formatCurrency(entry.netProfit)}` : formatCurrency(entry.netProfit)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* View 2: Selected Station Detailed Card */
        station ? (
          <div className="p-5 flex-1 flex flex-col space-y-4">
            {/* Embedded Mini Financial Performance Chart right inside the Station View */}
            <FinancialPerformanceChart
              data={financialHistory}
              accentColor={accentColor}
              themeMode={themeMode}
            />

            <div>
              {/* Breadcrumb + Status Tag */}
              <div className="flex items-center justify-between">
                <span className="text-[10.5px] font-mono uppercase tracking-wider text-slate-400">
                  IN {station.country.toUpperCase()} · {station.region.toUpperCase()}
                </span>
                {station.isOwned ? (
                  <span 
                    className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded border"
                    style={{
                      backgroundColor: `${accent.hex}20`,
                      borderColor: `${accent.hex}60`,
                      color: accent.hex,
                    }}
                  >
                    OWNED
                  </span>
                ) : (
                  <span className="text-[10px] font-mono uppercase font-bold text-amber-500 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
                    AVAILABLE
                  </span>
                )}
              </div>

              {/* Station Title */}
              <h1 className={`text-2xl font-bold tracking-tight mt-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {station.name}
              </h1>
              <div className="text-xs text-slate-400 mt-0.5">
                {station.name} · National Terminal Hub
              </div>
              <div className="text-[11px] font-mono text-slate-500 mt-1">
                MAP ID · <span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{station.code}</span>
              </div>

              {/* Description */}
              <p className={`text-xs leading-relaxed mt-2.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                {station.description}
              </p>
            </div>

            {/* Track Gauge & Traction Info Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className={`p-3 rounded border ${
                isDark ? 'bg-[#131b22] border-[#1f2b36]' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  Track Gauge
                </div>
                <div className={`text-xs font-semibold mt-1 leading-snug ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                  {station.gauge}
                </div>
              </div>

              <div className={`p-3 rounded border ${
                isDark ? 'bg-[#131b22] border-[#1f2b36]' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  Traction
                </div>
                <div className={`text-xs font-semibold mt-1 leading-snug ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                  {station.traction}
                </div>
              </div>
            </div>

            {/* Location Coordinates */}
            <div className={`flex items-center justify-between text-xs font-mono text-slate-400 border-b ${
              isDark ? 'border-[#1b252f]' : 'border-slate-300'
            } pb-2.5`}>
              <span className="text-[10.5px] uppercase">Station Location</span>
              <span className={isDark ? 'text-slate-200' : 'text-slate-800'}>
                {station.lat.toFixed(4)}° N · {station.lng.toFixed(4)}° E
              </span>
            </div>

            {/* Dispatch Slots (P1 to P10 Buttons) */}
            <div data-tutorial="station-dispatch-slots">
              <div className="text-[10.5px] font-mono uppercase tracking-wider text-slate-400 mb-2">
                Dispatch Slots · Game
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {station.dispatchSlots.map((inUse, idx) => (
                  <div
                    key={idx}
                    className={`py-1.5 text-center text-xs font-mono rounded border transition-colors ${
                      inUse
                        ? 'font-bold'
                        : isDark
                        ? 'bg-[#141c23] text-slate-400 border-[#22303d]'
                        : 'bg-white text-slate-500 border-slate-200'
                    }`}
                    style={inUse ? {
                      backgroundColor: `${accent.hex}25`,
                      borderColor: `${accent.hex}70`,
                      color: accent.hex,
                    } : {}}
                    title={inUse ? `Platform ${idx + 1}: Service Scheduled` : `Platform ${idx + 1}: Clear`}
                  >
                    P{idx + 1}
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons (Plan a service from here / Acquire) */}
            <div data-tutorial="station-actions-box" className="space-y-2 pt-1">
              {station.isOwned ? (
                <button
                  data-tutorial="btn-plan-service"
                  onClick={onOpenPlanner}
                  className="w-full py-3 px-4 rounded active:scale-[0.99] text-[#0d1318] font-bold text-sm tracking-wide transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  style={{ backgroundColor: accent.hex }}
                >
                  Plan a service from here →
                </button>
              ) : (
                <button
                  onClick={() => onAcquireStation(station.id)}
                  disabled={treasury < station.acquisitionCost}
                  className={`w-full py-3 px-4 rounded font-bold text-sm tracking-wide transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                    treasury >= station.acquisitionCost
                      ? 'text-[#0d1318]'
                      : isDark ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  }`}
                  style={treasury >= station.acquisitionCost ? { backgroundColor: accent.hex } : {}}
                >
                  Acquire Station Rights ({formatCurrency(station.acquisitionCost)})
                </button>
              )}

              <button
                onClick={onOpenStationDirectory}
                className={`w-full py-2 px-4 rounded text-xs font-semibold tracking-wide border transition-all cursor-pointer ${
                  isDark 
                    ? 'bg-[#131b22] hover:bg-[#1a2530] text-slate-300 border-[#22313f]' 
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300 shadow-sm'
                }`}
              >
                Open station directory
              </button>
            </div>

            {/* Connected Rail Corridors List */}
            <div className="pt-1">
              <div className="text-[10.5px] font-mono uppercase tracking-wider text-slate-400 mb-2">
                Connected Rail Corridors
              </div>

              <div className="space-y-2">
                {connectedCorridors.length > 0 ? (
                  connectedCorridors.map((c) => {
                    const otherStationId = c.stationAId === station.id ? c.stationBId : c.stationAId;
                    const otherStation = allStations.find((s) => s.id === otherStationId);
                    const isBuilt = builtRoutes.some((r) => r.corridorId === c.id);

                    return (
                      <div
                        key={c.id}
                        className={`p-3 rounded border transition-colors ${
                          isDark 
                            ? 'bg-[#131b22] border-[#1f2b36] hover:border-[#2f4050]' 
                            : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className={`text-xs font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                              {c.name}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                              {otherStation?.name} · {c.distanceKm} km · {c.standardGauge}
                            </div>
                          </div>

                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border`}
                            style={isBuilt ? {
                              backgroundColor: `${accent.hex}20`,
                              borderColor: `${accent.hex}60`,
                              color: accent.hex,
                            } : {
                              backgroundColor: isDark ? '#1e293b' : '#e2e8f0',
                              borderColor: isDark ? '#334155' : '#cbd5e1',
                              color: isDark ? '#94a3b8' : '#64748b',
                            }}
                          >
                            {isBuilt ? 'ACTIVE' : 'OPEN'}
                          </span>
                        </div>

                        {isBuilt && onAnalyzeRoute && (
                          (() => {
                            const activeRoute = builtRoutes.find(
                              (r) => r.corridorId === c.id
                            );
                            if (!activeRoute) return null;
                            return (
                              <button
                                type="button"
                                onClick={() => onAnalyzeRoute(activeRoute.id)}
                                className="mt-2.5 w-full py-1.5 px-3 rounded text-[11px] font-mono font-bold flex items-center justify-between border transition-all cursor-pointer hover:scale-[1.01]"
                                style={{
                                  backgroundColor: `${accent.hex}18`,
                                  borderColor: `${accent.hex}50`,
                                  color: accent.hex,
                                }}
                              >
                                <span className="flex items-center gap-1.5">
                                  <span>📊</span>
                                  <span>Advanced Route Analysis</span>
                                </span>
                                <span className="text-[10px]">Inspect Telemetry →</span>
                              </button>
                            );
                          })()
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-xs text-slate-500 py-3 text-center">
                    No trunk corridors registered yet
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400 my-auto">
            <div className={`text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>No Station Selected</div>
            <p className="text-xs mt-1 text-slate-500">
              Click any station node on the map to inspect specifications, platform slots, and corridors.
            </p>
          </div>
        )
      )}
    </div>
  );
};
