import React, { useState } from 'react';
import { Station, RegionId } from '../types';
import { formatCurrency } from '../game/simulation';

interface StationDirectoryModalProps {
  stations: Station[];
  treasury: number;
  onSelectStation: (stationId: string) => void;
  onAcquireStation: (stationId: string) => void;
  onClose: () => void;
}

export const StationDirectoryModal: React.FC<StationDirectoryModalProps> = ({
  stations,
  treasury,
  onSelectStation,
  onAcquireStation,
  onClose,
}) => {
  const [filterRegion, setFilterRegion] = useState<RegionId | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStations = stations.filter((s) => {
    const matchesRegion = filterRegion === 'all' || s.regionId === filterRegion;
    const matchesQuery =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.country.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRegion && matchesQuery;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-4xl bg-[#0f151c] border border-[#22303d] rounded-lg shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#22303d] flex items-center justify-between bg-[#131b23]">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
              Railway Infrastructure Registry
            </span>
            <h2 className="text-xl font-bold text-white mt-0.5">Station Directory</h2>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Filters & Search */}
        <div className="p-4 border-b border-[#1b252f] bg-[#111820] flex flex-wrap items-center justify-between gap-3">
          {/* Region Tabs */}
          <div className="flex flex-wrap items-center gap-1">
            {[
              { id: 'all', label: 'All Regions' },
              { id: 'south_asia', label: 'South Asia' },
              { id: 'china', label: 'China' },
              { id: 'east_asia', label: 'East Asia' },
              { id: 'southeast_asia', label: 'Southeast Asia' },
              { id: 'world', label: 'Global Corridors' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterRegion(tab.id as RegionId)}
                className={`px-3 py-1 text-xs font-semibold rounded transition-colors cursor-pointer ${
                  filterRegion === tab.id
                    ? 'bg-[#d4f04c] text-[#0d1318]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="Search station or code (e.g. NDLS)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-1.5 bg-[#0c1218] border border-[#22303d] rounded text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#d4f04c]"
            />
          </div>
        </div>

        {/* Station List Table */}
        <div className="p-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredStations.map((station) => (
              <div
                key={station.id}
                className="p-3.5 bg-[#141d26] border border-[#1f2b36] hover:border-[#2f4050] rounded flex flex-col justify-between transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">{station.name}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">
                      {station.code}
                    </span>
                  </div>

                  <div className="text-xs text-slate-400 mt-0.5">
                    {station.country} · {station.region}
                  </div>

                  <div className="mt-2 text-[11px] font-mono text-slate-400">
                    <div>Gauge: <span className="text-slate-300">{station.gauge}</span></div>
                    <div>Traction: <span className="text-slate-300">{station.traction}</span></div>
                    <div>Metropolitan Pop: <span className="text-slate-300">{station.populationMillions}M</span></div>
                  </div>
                </div>

                <div className="mt-4 pt-2.5 border-t border-[#1b252f] flex items-center justify-between">
                  {station.isOwned ? (
                    <span className="text-[11px] font-mono font-bold text-[#d4f04c]">
                      ✓ STATION RIGHTS OWNED
                    </span>
                  ) : (
                    <button
                      onClick={() => onAcquireStation(station.id)}
                      disabled={treasury < station.acquisitionCost}
                      className={`text-xs font-mono font-bold px-2.5 py-1 rounded transition-colors cursor-pointer ${
                        treasury >= station.acquisitionCost
                          ? 'bg-[#d4f04c] text-[#0d1318] hover:bg-[#c2de3e]'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      Acquire ({formatCurrency(station.acquisitionCost)})
                    </button>
                  )}

                  <button
                    onClick={() => {
                      onSelectStation(station.id);
                      onClose();
                    }}
                    className="text-xs font-mono text-sky-400 hover:underline cursor-pointer"
                  >
                    View on Map →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#22303d] bg-[#131b23] flex justify-between items-center text-xs font-mono text-slate-400">
          <span>Total Stations: {filteredStations.length}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
