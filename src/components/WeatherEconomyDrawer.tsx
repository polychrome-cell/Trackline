import React from 'react';
import { WeatherCondition, EconomicShift } from '../types';

interface WeatherEconomyDrawerProps {
  weather: WeatherCondition;
  economicShifts: EconomicShift[];
  isOpen: boolean;
  onClose: () => void;
  onNextWeatherEvent?: () => void;
}

export const WeatherEconomyDrawer: React.FC<WeatherEconomyDrawerProps> = ({
  weather,
  economicShifts,
  isOpen,
  onClose,
  onNextWeatherEvent,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl bg-[#0f151c] border border-[#22303d] rounded-lg shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#22303d] flex items-center justify-between bg-[#131b23]">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
              Meteorological & Macroeconomic Intelligence
            </span>
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mt-0.5">
              <span>Dynamic Weather & Regional Shifts</span>
            </h2>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Active Weather Radar Card */}
          <div className="p-5 bg-[#141d26] border border-[#233342] rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">
                  {weather.type === 'clear' ? '☀️' : weather.type === 'monsoon' ? '🌧️' : weather.type === 'typhoon' ? '🌀' : weather.type === 'blizzard' ? '❄️' : '🌡️'}
                </span>
                <div>
                  <h3 className="text-base font-bold text-white">{weather.title}</h3>
                  <div className="text-xs font-mono text-slate-400">
                    Affected Zone: {weather.affectedRegion.toUpperCase()} · Active for {weather.activeForDays} days
                  </div>
                </div>
              </div>

              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                weather.severity > 0.6 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}>
                {weather.severity > 0.6 ? 'Severe Weather' : 'Moderate Weather'}
              </span>
            </div>

            <p className="text-xs text-slate-300 mt-3 leading-relaxed">
              {weather.description}
            </p>

            {/* Impact Telemetry Meters */}
            <div className="grid grid-cols-3 gap-2.5 mt-4 text-center">
              <div className="p-2.5 bg-[#0e141a] border border-[#1b252f] rounded">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Speed Limit Impact</div>
                <div className={`text-base font-bold font-mono mt-0.5 ${weather.speedImpactPercent > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {weather.speedImpactPercent > 0 ? `-${weather.speedImpactPercent}%` : 'Normal (100%)'}
                </div>
              </div>

              <div className="p-2.5 bg-[#0e141a] border border-[#1b252f] rounded">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Delay Risk</div>
                <div className={`text-base font-bold font-mono mt-0.5 ${weather.delayRiskPercent > 10 ? 'text-rose-400' : 'text-slate-300'}`}>
                  +{weather.delayRiskPercent}%
                </div>
              </div>

              <div className="p-2.5 bg-[#0e141a] border border-[#1b252f] rounded">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Demand Shift</div>
                <div className={`text-base font-bold font-mono mt-0.5 ${weather.demandShiftPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {weather.demandShiftPercent >= 0 ? `+${weather.demandShiftPercent}%` : `${weather.demandShiftPercent}%`}
                </div>
              </div>
            </div>

            {onNextWeatherEvent && (
              <div className="mt-3 text-right">
                <button
                  onClick={onNextWeatherEvent}
                  className="text-xs font-mono text-[#d4f04c] hover:underline cursor-pointer"
                >
                  Simulate Next Weather System →
                </button>
              </div>
            )}
          </div>

          {/* Regional Economic Shifts List */}
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3">
              Regional Economic Trends & Catalysts
            </div>

            <div className="space-y-3">
              {economicShifts.map((shift) => (
                <div
                  key={shift.id}
                  className="p-4 bg-[#121921] border border-[#1f2b36] rounded-lg"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">{shift.headline}</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                      shift.positive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {shift.positive ? 'Economic Surge' : 'Supply Challenge'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                    {shift.description}
                  </p>

                  <div className="mt-3 flex items-center justify-between text-xs font-mono text-slate-400 border-t border-[#1b252f] pt-2">
                    <span>Region: <strong className="text-slate-200">{shift.region.toUpperCase()}</strong></span>
                    <span>Passenger Demand: <strong className={shift.demandMultiplier >= 1.0 ? 'text-emerald-400' : 'text-rose-400'}>{Math.round((shift.demandMultiplier - 1) * 100)}%</strong></span>
                    <span>Duration: <strong className="text-slate-200">{shift.daysRemaining} days remaining</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#22303d] bg-[#131b23] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
          >
            Close Intelligence Center
          </button>
        </div>
      </div>
    </div>
  );
};
