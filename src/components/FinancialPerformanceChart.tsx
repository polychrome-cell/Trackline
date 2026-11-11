import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { DailyFinancialReport, ThemeMode, AccentColor } from '../types';
import { formatCurrency, calculateFinancialSummary } from '../game/simulation';
import { ACCENT_PALETTES } from '../utils/theme';

interface FinancialPerformanceChartProps {
  data: DailyFinancialReport[];
  accentColor?: AccentColor;
  themeMode?: ThemeMode;
}

export const FinancialPerformanceChart: React.FC<FinancialPerformanceChartProps> = ({
  data,
  accentColor = 'lime',
  themeMode = 'dark',
}) => {
  const [timeRange, setTimeRange] = useState<'30d' | '14d' | '7d'>('30d');
  const isDark = themeMode === 'dark';
  const accent = ACCENT_PALETTES[accentColor] || ACCENT_PALETTES.lime;

  // Filter data based on selected time window
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    const count = timeRange === '7d' ? 7 : timeRange === '14d' ? 14 : 30;
    return data.slice(-count);
  }, [data, timeRange]);

  const summary = useMemo(() => {
    return calculateFinancialSummary(chartData);
  }, [chartData]);

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <div className={`p-4 rounded border transition-colors ${
      isDark ? 'bg-[#10171f] border-[#1e2a36]' : 'bg-white border-slate-200 shadow-sm'
    }`}>
      {/* Header with Title and Range Switcher */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
              Operations Telemetry
            </span>
            <span
              className="text-[9px] font-mono px-1.5 py-0.2 rounded font-bold uppercase"
              style={{
                backgroundColor: `${accent.hex}20`,
                color: accent.hex,
                border: `1px solid ${accent.hex}40`,
              }}
            >
              LIVE
            </span>
          </div>
          <h3 className={`text-sm font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'} mt-0.5`}>
            Financial Performance
          </h3>
          <p className="text-[10px] text-slate-400">
            Total daily net profit over operating days
          </p>
        </div>

        {/* Range Buttons (7D, 14D, 30D) */}
        <div className={`flex items-center gap-0.5 p-0.5 rounded border text-[10px] font-mono ${
          isDark ? 'bg-[#0a0f14] border-[#1e2a36]' : 'bg-slate-100 border-slate-300'
        }`}>
          {(['7d', '14d', '30d'] as const).map((range) => (
            <button
              key={range}
              type="button"
              onClick={() => setTimeRange(range)}
              className={`px-2 py-0.5 rounded font-bold uppercase transition-colors cursor-pointer ${
                timeRange === range
                  ? 'text-black shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              style={timeRange === range ? { backgroundColor: accent.hex } : {}}
            >
              {range.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Aggregate KPI Banner */}
      <div className={`grid grid-cols-3 gap-2 mb-3 p-2.5 rounded border ${
        isDark ? 'bg-[#0b1015] border-[#18232e]' : 'bg-slate-50 border-slate-200'
      }`}>
        <div>
          <div className="text-[9px] font-mono text-slate-400 uppercase">Period Total Net</div>
          <div
            className="text-xs font-bold font-mono mt-0.5 tabular-nums"
            style={{ color: summary.totalNet30d >= 0 ? accent.hex : '#f43f5e' }}
          >
            {summary.totalNet30d >= 0 ? `+${formatCurrency(summary.totalNet30d)}` : formatCurrency(summary.totalNet30d)}
          </div>
        </div>

        <div>
          <div className="text-[9px] font-mono text-slate-400 uppercase">Avg / Day</div>
          <div className={`text-xs font-bold font-mono mt-0.5 tabular-nums ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
            {summary.averageNet30d >= 0 ? `+${formatCurrency(summary.averageNet30d)}` : formatCurrency(summary.averageNet30d)}
          </div>
        </div>

        <div>
          <div className="text-[9px] font-mono text-slate-400 uppercase">Peak Day</div>
          <div className={`text-xs font-bold font-mono mt-0.5 tabular-nums ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
            {formatCurrency(summary.maxNet)}
          </div>
        </div>
      </div>

      {/* Recharts Area Chart Container */}
      <div className="w-full h-44 -ml-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 8, right: 10, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id={`netProfitGrad-${accentColor}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={accent.hex} stopOpacity={0.45} />
                <stop offset="95%" stopColor={accent.hex} stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke={isDark ? '#1a2430' : '#e2e8f0'}
              vertical={false}
            />

            <XAxis
              dataKey="day"
              tickFormatter={(d: number) => `D${d}`}
              stroke={isDark ? '#64748b' : '#94a3b8'}
              fontSize={9}
              fontFamily="monospace"
              tickLine={false}
              axisLine={{ stroke: isDark ? '#1e2a36' : '#cbd5e1' }}
            />

            <YAxis
              tickFormatter={(v: number) => {
                if (Math.abs(v) >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
                if (Math.abs(v) >= 1_000) return `$${Math.round(v / 1_000)}k`;
                return `$${v}`;
              }}
              stroke={isDark ? '#64748b' : '#94a3b8'}
              fontSize={8.5}
              fontFamily="monospace"
              tickLine={false}
              axisLine={false}
              domain={['auto', 'auto']}
            />

            <ReferenceLine y={0} stroke={isDark ? '#334155' : '#cbd5e1'} strokeDasharray="2 2" />

            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || payload.length === 0) return null;
                const point = payload[0].payload as DailyFinancialReport;
                return (
                  <div className={`p-2.5 rounded border text-[10px] font-mono shadow-xl ${
                    isDark ? 'bg-[#080d12]/95 border-[#22303d] text-slate-200' : 'bg-white/95 border-slate-300 text-slate-800'
                  } backdrop-blur-sm min-w-[130px]`}>
                    <div className="flex items-center justify-between border-b border-slate-700/50 pb-1 mb-1.5">
                      <span className="font-bold text-slate-400">OPERATING DAY {point.day}</span>
                      <span className="text-[9px] text-emerald-400">{point.onTimePerformance}% OTP</span>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <span className="text-slate-400">Net Profit:</span>
                      <span className="font-bold tabular-nums" style={{ color: accent.hex }}>
                        {point.netProfit >= 0 ? `+${formatCurrency(point.netProfit)}` : formatCurrency(point.netProfit)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-3 text-slate-400 text-[9px] mt-0.5">
                      <span>Ticket Rev:</span>
                      <span className="tabular-nums text-slate-300">{formatCurrency(point.ticketRevenue)}</span>
                    </div>

                    <div className="flex items-center justify-between gap-3 text-slate-400 text-[9px]">
                      <span>Operating:</span>
                      <span className="tabular-nums text-slate-300">
                        {formatCurrency(point.operatingCosts + point.trackMaintenance + point.fleetMaintenance)}
                      </span>
                    </div>
                  </div>
                );
              }}
            />

            <Area
              type="monotone"
              dataKey="netProfit"
              stroke={accent.hex}
              strokeWidth={2}
              fillOpacity={1}
              fill={`url(#netProfitGrad-${accentColor})`}
              activeDot={{
                r: 4.5,
                stroke: isDark ? '#0b1014' : '#ffffff',
                strokeWidth: 2,
                fill: accent.hex,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
