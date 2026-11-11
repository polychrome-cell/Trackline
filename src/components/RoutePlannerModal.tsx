import React, { useState, useMemo } from 'react';
import { Station, Corridor, TrackType, OwnedTrain, TrainModel, BuiltRoute, WeatherCondition, EconomicShift } from '../types';
import { 
  calculateTransitTimeHours, 
  calculateRouteEconomics, 
  formatCurrency, 
  TRACK_CONSTRUCTION_COST_PER_KM, 
  TRACK_SPEED_LIMITS,
  BENCHMARK_FARE_PER_KM 
} from '../game/simulation';

interface RoutePlannerModalProps {
  originStation: Station;
  allStations: Station[];
  corridors: Corridor[];
  ownedTrains: OwnedTrain[];
  trainCatalog: TrainModel[];
  treasury: number;
  activeWeather?: WeatherCondition;
  activeEconomicShift?: EconomicShift;
  onClose: () => void;
  onConfirmBuildRoute: (route: BuiltRoute, constructionCost: number) => void;
}

export const RoutePlannerModal: React.FC<RoutePlannerModalProps> = ({
  originStation,
  allStations,
  corridors,
  ownedTrains,
  trainCatalog,
  treasury,
  activeWeather,
  activeEconomicShift,
  onClose,
  onConfirmBuildRoute,
}) => {
  // Find connected stations from corridors
  const eligibleCorridors = useMemo(() => {
    return corridors.filter((c) => c.stationAId === originStation.id || c.stationBId === originStation.id);
  }, [corridors, originStation.id]);

  const [selectedCorridorId, setSelectedCorridorId] = useState<string>(
    eligibleCorridors[0]?.id || ''
  );

  const selectedCorridor = useMemo(() => {
    return eligibleCorridors.find((c) => c.id === selectedCorridorId) || eligibleCorridors[0];
  }, [eligibleCorridors, selectedCorridorId]);

  const destStation = useMemo(() => {
    if (!selectedCorridor) return null;
    const destId = selectedCorridor.stationAId === originStation.id ? selectedCorridor.stationBId : selectedCorridor.stationAId;
    return allStations.find((s) => s.id === destId) || null;
  }, [selectedCorridor, originStation.id, allStations]);

  const [trackType, setTrackType] = useState<TrackType>('high_speed');
  const [lineName, setLineName] = useState<string>(
    destStation ? `${originStation.name} - ${destStation.name} Express` : 'New Intercity Line'
  );
  const [selectedTrainId, setSelectedTrainId] = useState<string>(
    ownedTrains.find((t) => !t.assignedRouteId)?.id || (ownedTrains[0]?.id || '')
  );
  const [frequencyDaily, setFrequencyDaily] = useState<number>(10); // departures per day
  const [selectedSlots, setSelectedSlots] = useState<number[]>([1, 2, 4, 6, 8]);

  const distanceKm = selectedCorridor?.distanceKm || 500;
  const defaultFare = Math.round(distanceKm * BENCHMARK_FARE_PER_KM[trackType]);
  const [ticketPrice, setTicketPrice] = useState<number>(defaultFare);

  // Update line name and ticket price whenever corridor or track type changes
  React.useEffect(() => {
    if (destStation) {
      const typeLabel = trackType === 'high_speed' ? 'Shinkansen / Bullet' : trackType === 'express' ? 'Express Trunk' : 'Commuter Line';
      setLineName(`${originStation.name} - ${destStation.name} ${typeLabel}`);
      setTicketPrice(Math.round(distanceKm * BENCHMARK_FARE_PER_KM[trackType]));
    }
  }, [selectedCorridorId, trackType, destStation, originStation.name, distanceKm]);

  // Selected train and model
  const assignedTrain = useMemo(() => {
    const t = ownedTrains.find((train) => train.id === selectedTrainId);
    if (!t) return null;
    const m = trainCatalog.find((model) => model.id === t.modelId);
    return m ? { train: t, model: m } : null;
  }, [selectedTrainId, ownedTrains, trainCatalog]);

  // Track Construction Cost
  const constructionCost = Math.round(distanceKm * TRACK_CONSTRUCTION_COST_PER_KM[trackType]);

  // Economics Preview
  const economics = useMemo(() => {
    return calculateRouteEconomics({
      distanceKm,
      trackType,
      ticketPrice,
      frequencyDaily,
      baseCorridorDemand: selectedCorridor?.baseDailyDemand || 35000,
      assignedTrains: assignedTrain ? [assignedTrain] : [],
      weather: activeWeather,
      economicShift: activeEconomicShift,
    });
  }, [distanceKm, trackType, ticketPrice, frequencyDaily, selectedCorridor, assignedTrain, activeWeather, activeEconomicShift]);

  // Transit Duration
  const trainSpeed = assignedTrain ? assignedTrain.model.maxSpeedKmH : TRACK_SPEED_LIMITS[trackType];
  const transitHours = calculateTransitTimeHours(
    distanceKm, 
    trainSpeed, 
    trackType, 
    activeWeather ? activeWeather.speedImpactPercent : 0
  );
  const durationHours = Math.floor(transitHours);
  const durationMins = Math.round((transitHours - durationHours) * 60);

  const canAfford = treasury >= constructionCost;
  const hasAssignedTrain = Boolean(assignedTrain);

  const handleBuild = () => {
    if (!destStation || !selectedCorridor) return;

    const newRoute: BuiltRoute = {
      id: `route-${Date.now()}`,
      name: lineName,
      corridorId: selectedCorridor.id,
      stationAId: originStation.id,
      stationBId: destStation.id,
      trackType,
      trackName: `${lineName} (${trackType.replace('_', ' ').toUpperCase()})`,
      assignedTrainIds: assignedTrain ? [assignedTrain.train.id] : [],
      frequencyDaily,
      departureSlots: selectedSlots,
      ticketPrice,
      distanceKm,
      dailyPassengers: economics.dailyPassengers,
      dailyRevenue: economics.dailyRevenue,
      dailyCost: economics.dailyOperatingCost + economics.dailyTrackMaintenance + economics.dailyFleetMaintenance,
      netProfit: economics.netDailyProfit,
      delayRatePercent: economics.delayRatePercent,
      status: 'active',
    };

    onConfirmBuildRoute(newRoute, constructionCost);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div data-tutorial="planner-modal-content" className="w-full max-w-4xl bg-[#0f151c] border border-[#22303d] rounded-lg shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-slate-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#22303d] flex items-center justify-between bg-[#131b23]">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
              Corridor Operations & Dispatch
            </span>
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mt-0.5">
              <span>Plan Railway Route from</span>
              <span className="text-[#d4f04c]">{originStation.name}</span>
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Step 1: Destination Corridor Selection */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
              01. Select Destination Station & Corridor
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {eligibleCorridors.map((c) => {
                const otherStationId = c.stationAId === originStation.id ? c.stationBId : c.stationAId;
                const otherStation = allStations.find((s) => s.id === otherStationId);
                const isSelected = selectedCorridorId === c.id;

                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCorridorId(c.id)}
                    className={`p-3 rounded text-left border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#1a2530] border-[#d4f04c] text-white shadow-md'
                        : 'bg-[#121921] border-[#1f2b36] text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <div className="font-bold text-sm text-white">{otherStation?.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {c.distanceKm} km · {c.standardGauge}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1 truncate">{c.name}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Track Type Selection (High-Speed vs Express vs Commuter) */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
              02. Select Track Engineering Specification (Multiple Tracks Allowed)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* High Speed Track */}
              <button
                type="button"
                onClick={() => setTrackType('high_speed')}
                className={`p-4 rounded border text-left transition-all cursor-pointer ${
                  trackType === 'high_speed'
                    ? 'bg-[#1a2530] border-[#d4f04c] ring-1 ring-[#d4f04c]'
                    : 'bg-[#121921] border-[#1f2b36] hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white">High-Speed Rail (HSR)</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#d4f04c]/20 text-[#d4f04c] font-bold">
                    350 km/h
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  Dedicated ballastless track, overhead catenary & cab signaling. Maximum speed & premium fare yields.
                </p>
                <div className="text-[11px] font-mono text-slate-300 mt-2">
                  Cost: ${TRACK_CONSTRUCTION_COST_PER_KM.high_speed / 1000}k / km
                </div>
              </button>

              {/* Express Track */}
              <button
                type="button"
                onClick={() => setTrackType('express')}
                className={`p-4 rounded border text-left transition-all cursor-pointer ${
                  trackType === 'express'
                    ? 'bg-[#1a2530] border-[#38bdf8] ring-1 ring-[#38bdf8]'
                    : 'bg-[#121921] border-[#1f2b36] hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white">Intercity Express Track</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-400 font-bold">
                    200 km/h
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  Continuous welded rail for semi-high-speed and intercity express sets (e.g. Vande Bharat, KTX-Eum).
                </p>
                <div className="text-[11px] font-mono text-slate-300 mt-2">
                  Cost: ${TRACK_CONSTRUCTION_COST_PER_KM.express / 1000}k / km
                </div>
              </button>

              {/* Commuter Track */}
              <button
                type="button"
                onClick={() => setTrackType('commuter')}
                className={`p-4 rounded border text-left transition-all cursor-pointer ${
                  trackType === 'commuter'
                    ? 'bg-[#1a2530] border-[#a3e635] ring-1 ring-[#a3e635]'
                    : 'bg-[#121921] border-[#1f2b36] hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white">Local / Commuter Track</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-lime-500/20 text-lime-400 font-bold">
                    130 km/h
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  Dense quadruple-track local corridor optimized for high station density, rapid boarding, and steady flow.
                </p>
                <div className="text-[11px] font-mono text-slate-300 mt-2">
                  Cost: ${TRACK_CONSTRUCTION_COST_PER_KM.commuter / 1000}k / km
                </div>
              </button>
            </div>
          </div>

          {/* Step 3: Custom Line Name */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
              03. Designate Route / Line Service Name
            </label>
            <input
              type="text"
              value={lineName}
              onChange={(e) => setLineName(e.target.value)}
              placeholder="e.g. Tokaido Shinkansen Super Express"
              className="w-full px-4 py-2.5 bg-[#121921] border border-[#22303d] rounded text-white text-sm font-semibold focus:outline-none focus:border-[#d4f04c]"
            />
          </div>

          {/* Step 4: Assign Train Fleet */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400">
                04. Assign Train from Fleet
              </label>
              <span className="text-xs text-slate-400 font-mono">
                Fleet Units in Depot: {ownedTrains.filter((t) => !t.assignedRouteId).length}
              </span>
            </div>

            {ownedTrains.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {ownedTrains.map((train) => {
                  const model = trainCatalog.find((m) => m.id === train.modelId);
                  if (!model) return null;
                  const isSelected = selectedTrainId === train.id;

                  return (
                    <button
                      key={train.id}
                      onClick={() => setSelectedTrainId(train.id)}
                      className={`p-3 rounded border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#1a2530] border-[#d4f04c] text-white'
                          : 'bg-[#121921] border-[#1f2b36] text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-white">{train.customName}</span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {train.conditionPercent}% Cond
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-300 mt-1 font-semibold">
                        {model.name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {model.maxSpeedKmH} km/h · {model.passengerCapacity} seats
                      </div>
                      {train.assignedRouteId && (
                        <div className="text-[9px] text-amber-400 font-mono mt-1">
                          ⚠️ Reassigning from existing route
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded text-amber-300 text-xs">
                You have no trains in your fleet. Please visit the <strong>Train Procurement</strong> tab to purchase rolling stock from international manufacturers.
              </div>
            )}
          </div>

          {/* Step 5: Timetable Frequency & Ticket Fare Sliders */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#121921] p-4 rounded border border-[#1f2b36]">
            {/* Daily Frequency */}
            <div>
              <div className="flex items-center justify-between text-xs font-mono mb-2">
                <span className="text-slate-400 uppercase">Daily Departures:</span>
                <span className="text-white font-bold">{frequencyDaily} runs / day</span>
              </div>
              <input
                type="range"
                min="4"
                max="24"
                step="2"
                value={frequencyDaily}
                onChange={(e) => setFrequencyDaily(Number(e.target.value))}
                className="w-full accent-[#d4f04c] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                <span>4 runs (Off-peak)</span>
                <span>12 runs (Hourly)</span>
                <span>24 runs (Rapid shuttle)</span>
              </div>
            </div>

            {/* Ticket Price */}
            <div>
              <div className="flex items-center justify-between text-xs font-mono mb-2">
                <span className="text-slate-400 uppercase">Single Ticket Price:</span>
                <span className="text-[#d4f04c] font-bold">${ticketPrice} USD</span>
              </div>
              <input
                type="range"
                min={Math.max(10, Math.round(defaultFare * 0.4))}
                max={Math.round(defaultFare * 2.5)}
                step="2"
                value={ticketPrice}
                onChange={(e) => setTicketPrice(Number(e.target.value))}
                className="w-full accent-[#d4f04c] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                <span>Budget (${Math.round(defaultFare * 0.6)})</span>
                <span>Market Standard (${defaultFare})</span>
                <span>Premium (${Math.round(defaultFare * 1.8)})</span>
              </div>
            </div>
          </div>

          {/* Step 6: Route Economic Forecast Box */}
          <div data-tutorial="route-forecast-box" className="bg-[#141d26] p-4 rounded border border-[#243444]">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-3">
              Route Feasibility & Financial Forecast
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-2.5 bg-[#0e151c] rounded border border-[#1b252f]">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Transit Time</div>
                <div className="text-lg font-bold font-mono text-white mt-0.5">
                  {durationHours}h {durationMins}m
                </div>
                <div className="text-[9.5px] text-slate-500 font-mono">@ max {trainSpeed} km/h</div>
              </div>

              <div className="p-2.5 bg-[#0e151c] rounded border border-[#1b252f]">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Daily Ridership</div>
                <div className="text-lg font-bold font-mono text-[#d4f04c] mt-0.5">
                  {economics.dailyPassengers.toLocaleString()}
                </div>
                <div className="text-[9.5px] text-slate-500 font-mono">{economics.loadFactorPercent}% load factor</div>
              </div>

              <div className="p-2.5 bg-[#0e151c] rounded border border-[#1b252f]">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Daily Revenue</div>
                <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5">
                  {formatCurrency(economics.dailyRevenue)}
                </div>
                <div className="text-[9.5px] text-slate-500 font-mono">Gross receipts</div>
              </div>

              <div className="p-2.5 bg-[#0e151c] rounded border border-[#1b252f]">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Net Profit / Day</div>
                <div className={`text-lg font-bold font-mono mt-0.5 ${economics.netDailyProfit >= 0 ? 'text-[#d4f04c]' : 'text-rose-400'}`}>
                  {economics.netDailyProfit >= 0 ? `+${formatCurrency(economics.netDailyProfit)}` : formatCurrency(economics.netDailyProfit)}
                </div>
                <div className="text-[9.5px] text-slate-500 font-mono">After track & ops costs</div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-[#22303d] bg-[#131b23] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-xs font-mono text-slate-400">
              TRACK CONSTRUCTION CAPITAL EXPENDITURE:
            </div>
            <div className={`text-lg font-bold font-mono ${canAfford ? 'text-white' : 'text-rose-400'}`}>
              {formatCurrency(constructionCost)}
              {!canAfford && (
                <span className="text-xs text-rose-400 ml-2 font-normal font-sans">
                  (Insufficient funds: Treasury has {formatCurrency(treasury)})
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs tracking-wide transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleBuild}
              disabled={!canAfford || !hasAssignedTrain}
              className={`flex-1 sm:flex-none px-6 py-2.5 rounded font-bold text-xs uppercase tracking-wider transition-all shadow-lg cursor-pointer ${
                canAfford && hasAssignedTrain
                  ? 'bg-[#d4f04c] hover:bg-[#c2de3e] text-[#0d1318]'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              Construct & Inaugurate Line →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
