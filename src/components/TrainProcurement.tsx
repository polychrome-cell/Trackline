import React, { useState } from 'react';
import { Manufacturer, TrainModel, OwnedTrain, ManufacturerId, BuiltRoute } from '../types';
import { formatCurrency } from '../game/simulation';

interface TrainProcurementProps {
  manufacturers: Manufacturer[];
  trainCatalog: TrainModel[];
  ownedTrains: OwnedTrain[];
  builtRoutes: BuiltRoute[];
  treasury: number;
  onBuyTrain: (modelId: string, customName: string) => void;
  onMaintainTrain: (trainId: string, cost: number) => void;
  onOpenLiveryEditor: (trainId?: string) => void;
}

export const TrainProcurement: React.FC<TrainProcurementProps> = ({
  manufacturers,
  trainCatalog,
  ownedTrains,
  builtRoutes,
  treasury,
  onBuyTrain,
  onMaintainTrain,
  onOpenLiveryEditor,
}) => {
  const [activeTab, setActiveTab] = useState<'catalog' | 'fleet'>('catalog');
  const [selectedManufacturerId, setSelectedManufacturerId] = useState<ManufacturerId>('hitachi_kawasaki');
  const [purchasingModel, setPurchasingModel] = useState<TrainModel | null>(null);
  const [newTrainName, setNewTrainName] = useState<string>('');

  const selectedManufacturer = manufacturers.find((m) => m.id === selectedManufacturerId) || manufacturers[0];
  const manufacturerTrains = trainCatalog.filter((t) => t.manufacturerId === selectedManufacturerId);

  const handleStartPurchase = (model: TrainModel) => {
    setPurchasingModel(model);
    const count = ownedTrains.filter((t) => t.modelId === model.id).length + 1;
    setNewTrainName(`${model.seriesCode} #${String(count).padStart(2, '0')}`);
  };

  const handleConfirmPurchase = () => {
    if (!purchasingModel) return;
    onBuyTrain(purchasingModel.id, newTrainName || purchasingModel.name);
    setPurchasingModel(null);
  };

  return (
    <div data-tutorial="fleet-content" className="w-full h-full flex flex-col bg-[#0b1014] text-slate-200 overflow-hidden">
      {/* Top Header / View Switcher */}
      <div className="px-6 py-4 border-b border-[#1b252f] bg-[#0e141a] flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
            Rolling Stock Procurement & Fleet Management
          </span>
          <h1 className="text-xl font-bold text-white mt-0.5">
            Train Fleets & Global Manufacturers
          </h1>
        </div>

        {/* Segmented Control: Order New Trains vs Active Fleet */}
        <div className="flex items-center gap-1 bg-[#141c23] p-1 rounded border border-[#22303d]">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-4 py-1.5 text-xs font-semibold rounded transition-colors cursor-pointer ${
              activeTab === 'catalog'
                ? 'bg-[#d4f04c] text-[#0d1318] shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Order New Rolling Stock
          </button>
          <button
            onClick={() => setActiveTab('fleet')}
            className={`px-4 py-1.5 text-xs font-semibold rounded transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'fleet'
                ? 'bg-[#d4f04c] text-[#0d1318] shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Active Fleet</span>
            <span className="px-1.5 py-0.2 bg-black/30 rounded text-[10px] font-mono font-bold">
              {ownedTrains.length}
            </span>
          </button>
        </div>
      </div>

      {activeTab === 'catalog' ? (
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Sidebar: Manufacturer Tabs */}
          <div className="w-full md:w-72 bg-[#0e141a] border-r border-[#1b252f] overflow-y-auto p-3 space-y-1.5">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 px-3 py-1">
              Select Manufacturer
            </div>

            {manufacturers.map((m) => {
              const isSelected = selectedManufacturerId === m.id;
              const modelCount = trainCatalog.filter((t) => t.manufacturerId === m.id).length;

              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedManufacturerId(m.id)}
                  className={`w-full p-3 rounded text-left border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#18232e] border-[#d4f04c] text-white shadow-md'
                      : 'bg-[#121921] border-[#1b252f] text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-base">{m.flag}</span>
                    <span className="text-[10px] font-mono text-slate-500">{modelCount} models</span>
                  </div>
                  <div className="font-bold text-xs text-white mt-1">{m.shortName}</div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">{m.country} · Est. {m.founded}</div>
                </button>
              );
            })}
          </div>

          {/* Right Main Content: Selected Manufacturer Showcase & Catalog Cards */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Manufacturer Profile Card */}
            <div className="p-5 bg-[#121921] border border-[#1f2b36] rounded-lg">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{selectedManufacturer.flag}</span>
                  <div>
                    <h2 className="text-lg font-bold text-white">{selectedManufacturer.name}</h2>
                    <div className="text-xs font-mono text-slate-400">
                      HQ: {selectedManufacturer.headquarters} · Founded {selectedManufacturer.founded}
                    </div>
                  </div>
                </div>

                <div className="text-xs font-mono text-[#d4f04c] bg-[#d4f04c]/10 border border-[#d4f04c]/30 px-3 py-1 rounded">
                  {selectedManufacturer.specialty}
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed mt-3 border-t border-[#1b252f] pt-3">
                {selectedManufacturer.description}
              </p>
            </div>

            {/* Train Catalog Cards */}
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3">
                Available Production Models
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {manufacturerTrains.map((train) => {
                  const canAfford = treasury >= train.purchasePrice;

                  return (
                    <div
                      key={train.id}
                      className="p-5 bg-[#121921] border border-[#1f2b36] hover:border-[#2b3d4f] rounded-lg flex flex-col justify-between transition-all"
                    >
                      <div>
                        {/* Header: Series Code + Category Badge */}
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">
                            {train.seriesCode}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#d4f04c]/15 text-[#d4f04c] font-semibold">
                            {train.category}
                          </span>
                        </div>

                        {/* Train Name */}
                        <h3 className="text-base font-bold text-white mt-2">
                          {train.name}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          {train.description}
                        </p>

                        {/* Train Technical Specs Grid */}
                        <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                          <div className="p-2 bg-[#0c1218] border border-[#1b252f] rounded">
                            <div className="text-[9.5px] font-mono uppercase text-slate-500">Max Speed</div>
                            <div className="text-sm font-bold font-mono text-white mt-0.5">
                              {train.maxSpeedKmH} km/h
                            </div>
                          </div>

                          <div className="p-2 bg-[#0c1218] border border-[#1b252f] rounded">
                            <div className="text-[9.5px] font-mono uppercase text-slate-500">Capacity</div>
                            <div className="text-sm font-bold font-mono text-white mt-0.5">
                              {train.passengerCapacity.toLocaleString()} pax
                            </div>
                          </div>

                          <div className="p-2 bg-[#0c1218] border border-[#1b252f] rounded">
                            <div className="text-[9.5px] font-mono uppercase text-slate-500">Reliability</div>
                            <div className="text-sm font-bold font-mono text-emerald-400 mt-0.5">
                              {train.reliabilityScore}%
                            </div>
                          </div>
                        </div>

                        {/* Power & Track Compatibility */}
                        <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-slate-400 border-t border-[#1b252f] pt-2.5">
                          <span>Power: <strong className="text-slate-300">{train.powerType}</strong></span>
                          <span>Track: <strong className="text-slate-300">{train.trackType.replace('_', ' ').toUpperCase()}</strong></span>
                        </div>
                      </div>

                      {/* Pricing and Order Action */}
                      <div className="mt-5 pt-3 border-t border-[#1b252f] flex items-center justify-between">
                        <div>
                          <div className="text-[10px] font-mono uppercase text-slate-500">
                            Unit Purchase Price
                          </div>
                          <div className="text-lg font-bold font-mono text-white">
                            {formatCurrency(train.purchasePrice)}
                          </div>
                          <div className="text-[10px] font-mono text-slate-400">
                            Maint: {formatCurrency(train.dailyMaintenance)}/day
                          </div>
                        </div>

                        <button
                          onClick={() => handleStartPurchase(train)}
                          disabled={!canAfford}
                          className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                            canAfford
                              ? 'bg-[#d4f04c] hover:bg-[#c2de3e] text-[#0d1318] shadow-md'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          {canAfford ? 'Order Unit →' : 'Insufficient Funds'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Active Fleet Management Tab */
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Owned Rolling Stock Units ({ownedTrains.length})
            </div>
            <button
              onClick={() => onOpenLiveryEditor()}
              className="px-3.5 py-1.5 rounded bg-[#18232e] hover:bg-[#22303d] border border-[#2b3d4f] text-xs font-semibold text-white transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>Open Livery Studio</span>
              <span>🎨</span>
            </button>
          </div>

          {ownedTrains.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ownedTrains.map((train) => {
                const model = trainCatalog.find((m) => m.id === train.modelId);
                const assignedRoute = builtRoutes.find((r) => r.id === train.assignedRouteId);
                if (!model) return null;

                const needsMaintenance = train.conditionPercent < 75;
                const overhaulCost = Math.round(model.purchasePrice * 0.05);

                return (
                  <div
                    key={train.id}
                    className="p-4 bg-[#121921] border border-[#1f2b36] rounded-lg flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-white">{train.customName}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">
                          {model.seriesCode}
                        </span>
                      </div>

                      <div className="text-xs text-slate-400 mt-1 font-semibold">
                        {model.name}
                      </div>

                      {/* Route Assignment Status */}
                      <div className="mt-3 p-2 bg-[#0c1218] border border-[#1b252f] rounded text-xs font-mono">
                        <div className="text-[10px] text-slate-500 uppercase">Assigned Service</div>
                        <div className="font-semibold text-slate-200 truncate mt-0.5">
                          {assignedRoute ? assignedRoute.name : 'Unassigned (In Depot)'}
                        </div>
                      </div>

                      {/* Condition Bar */}
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                          <span className="text-slate-400">Mechanical Condition:</span>
                          <span className={`font-bold ${train.conditionPercent > 80 ? 'text-emerald-400' : train.conditionPercent > 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                            {train.conditionPercent}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              train.conditionPercent > 80 ? 'bg-emerald-500' : train.conditionPercent > 50 ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${train.conditionPercent}%` }}
                          />
                        </div>
                      </div>

                      <div className="mt-2 text-[10px] font-mono text-slate-500">
                        Total Distance Run: {train.totalKmRun.toLocaleString()} km
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#1b252f] flex items-center justify-between gap-2">
                      <button
                        onClick={() => onOpenLiveryEditor(train.id)}
                        className="flex-1 py-1.5 px-2 bg-[#18232e] hover:bg-[#22303d] rounded text-[11px] font-mono text-slate-300 text-center cursor-pointer"
                      >
                        Edit Livery
                      </button>

                      {needsMaintenance && (
                        <button
                          onClick={() => onMaintainTrain(train.id, overhaulCost)}
                          disabled={treasury < overhaulCost}
                          className="flex-1 py-1.5 px-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded text-[11px] font-mono text-center cursor-pointer"
                        >
                          Overhaul ({formatCurrency(overhaulCost)})
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400">
              <div className="text-base font-semibold text-slate-300">Fleet Inventory Empty</div>
              <p className="text-xs text-slate-500 mt-1">
                You haven't procured any rolling stock yet. Switch to the <strong>Order New Rolling Stock</strong> tab to purchase your first train.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Purchase Confirmation Modal */}
      {purchasingModel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#121921] border border-[#22303d] rounded-lg p-6 shadow-2xl text-slate-200 space-y-4">
            <h3 className="text-lg font-bold text-white">
              Confirm Fleet Procurement
            </h3>

            <div>
              <div className="text-sm font-semibold text-slate-200">{purchasingModel.name}</div>
              <div className="text-xs font-mono text-slate-400 mt-0.5">
                {purchasingModel.category} · Max {purchasingModel.maxSpeedKmH} km/h
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                Assign Unit Fleet Call-sign / Custom Name
              </label>
              <input
                type="text"
                value={newTrainName}
                onChange={(e) => setNewTrainName(e.target.value)}
                className="w-full px-3 py-2 bg-[#0c1218] border border-[#22303d] rounded text-white text-sm focus:outline-none focus:border-[#d4f04c]"
              />
            </div>

            <div className="p-3 bg-[#0c1218] border border-[#1b252f] rounded flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Total Purchase Price:</span>
              <span className="text-lg font-bold text-[#d4f04c]">{formatCurrency(purchasingModel.purchasePrice)}</span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setPurchasingModel(null)}
                className="px-4 py-2 rounded bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPurchase}
                className="px-5 py-2 rounded bg-[#d4f04c] hover:bg-[#c2de3e] text-[#0d1318] text-xs font-bold uppercase tracking-wide cursor-pointer"
              >
                Authorize Purchase
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
