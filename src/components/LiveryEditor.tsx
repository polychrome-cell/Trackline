import React, { useState } from 'react';
import { LiveryDesign, OwnedTrain, TrainModel } from '../types';
import { PRESET_LIVERIES } from '../data/railwayData';

interface LiveryEditorProps {
  currentLivery: LiveryDesign;
  ownedTrains: OwnedTrain[];
  trainCatalog: TrainModel[];
  targetTrainId?: string;
  onSaveLivery: (livery: LiveryDesign, applyToTrainId?: string) => void;
  onClose: () => void;
}

export const LiveryEditor: React.FC<LiveryEditorProps> = ({
  currentLivery,
  ownedTrains,
  trainCatalog,
  targetTrainId,
  onSaveLivery,
  onClose,
}) => {
  const [livery, setLivery] = useState<LiveryDesign>({ ...currentLivery });
  const [applyScope, setApplyScope] = useState<'all' | 'single'>(targetTrainId ? 'single' : 'all');
  const [selectedTrainId, setSelectedTrainId] = useState<string>(targetTrainId || (ownedTrains[0]?.id || ''));

  // Quick Presets Handler
  const handleApplyPreset = (preset: LiveryDesign) => {
    setLivery({
      ...preset,
      id: livery.id, // keep active ID
      companyBrandText: livery.companyBrandText || preset.companyBrandText,
    });
  };

  const handleSave = () => {
    onSaveLivery(livery, applyScope === 'single' ? selectedTrainId : undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-5xl bg-[#0e141a] border border-[#22303d] rounded-xl shadow-2xl flex flex-col max-h-[94vh] overflow-hidden text-slate-200">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-[#1b252f] flex items-center justify-between bg-[#121921]">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
              Custom Fleet Design Studio
            </span>
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mt-0.5">
              <span>Rolling Stock Livery & Paint Workshop</span>
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

        {/* Main Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* 1. Interactive 2D Train Side Profile Canvas */}
          <div className="p-6 bg-[#080c0f] border border-[#1b252f] rounded-lg shadow-inner flex flex-col items-center justify-center relative overflow-hidden">
            {/* Ambient workshop overhead lighting */}
            <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

            {/* High-Fidelity SVG Train Side View */}
            <svg
              className="w-full max-w-3xl h-44 drop-shadow-2xl"
              viewBox="0 0 880 200"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                {/* Windshield Reflection */}
                <linearGradient id="glassReflect" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
                  <stop offset="60%" stopColor="#0f172a" stopOpacity="0.9" />
                </linearGradient>

                {/* Metallic Body Gradient */}
                <linearGradient id="bodySheen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
                  <stop offset="40%" stopColor="#ffffff" stopOpacity="0.0" />
                  <stop offset="100%" stopColor="#000000" stopOpacity="0.3" />
                </linearGradient>
              </defs>

              {/* Rails and Ballast Ground */}
              <g className="rails">
                <rect x="0" y="172" width="880" height="6" fill="#475569" />
                <rect x="0" y="178" width="880" height="12" fill="#1e293b" />
                {/* Sleepers */}
                {Array.from({ length: 44 }).map((_, i) => (
                  <rect key={i} x={i * 20} y="176" width="10" height="16" fill="#334155" />
                ))}
              </g>

              {/* High-Speed Bogies & Wheels (Undercarriage) */}
              <g className="bogies">
                {/* Bogie 1 (Front) */}
                <rect x="140" y="152" width="100" height="18" rx="4" fill={livery.skirtColor} />
                <circle cx="160" cy="166" r="11" fill="#334155" stroke="#64748b" strokeWidth="2.5" />
                <circle cx="160" cy="166" r="4" fill="#94a3b8" />
                <circle cx="220" cy="166" r="11" fill="#334155" stroke="#64748b" strokeWidth="2.5" />
                <circle cx="220" cy="166" r="4" fill="#94a3b8" />

                {/* Bogie 2 (Rear) */}
                <rect x="680" y="152" width="100" height="18" rx="4" fill={livery.skirtColor} />
                <circle cx="700" cy="166" r="11" fill="#334155" stroke="#64748b" strokeWidth="2.5" />
                <circle cx="700" cy="166" r="4" fill="#94a3b8" />
                <circle cx="760" cy="166" r="11" fill="#334155" stroke="#64748b" strokeWidth="2.5" />
                <circle cx="760" cy="166" r="4" fill="#94a3b8" />
              </g>

              {/* Undercarriage Aerodynamic Skirt */}
              <path
                d="M 60 155 Q 120 155 140 155 L 240 155 L 680 155 L 780 155 Q 830 155 850 150 L 850 142 L 50 142 Z"
                fill={livery.skirtColor}
              />

              {/* Main Train Carbody Shell */}
              {/* Bullet Aerodynamic Nose (Left: Front Nose Cone) to Tail (Right) */}
              <path
                d="M 40 142 Q 40 120 70 95 Q 120 65 200 65 L 830 65 Q 855 65 855 85 L 855 142 Z"
                fill={livery.baseColor}
              />
              {/* Sheen Overlay */}
              <path
                d="M 40 142 Q 40 120 70 95 Q 120 65 200 65 L 830 65 Q 855 65 855 85 L 855 142 Z"
                fill="url(#bodySheen)"
              />

              {/* Roof Fairing & Catenary Pantograph */}
              <g className="roof-and-pantograph">
                <path d="M 180 65 Q 220 58 260 58 L 810 58 Q 840 58 845 65 Z" fill={livery.roofColor} />
                {/* Pantograph */}
                <path d="M 620 58 L 640 32 L 670 32 L 650 58" stroke="#94a3b8" strokeWidth="2.5" fill="none" />
                <line x1="630" y1="32" x2="680" y2="32" stroke="#e2e8f0" strokeWidth="3" />
              </g>

              {/* Livery Pattern Layer */}
              <g className="livery-patterns">
                {livery.pattern === 'speed_stripe' && (
                  <>
                    {/* Primary Speed Stripe */}
                    <path
                      d="M 45 125 Q 75 110 130 102 L 855 102 L 855 114 L 130 114 Q 75 122 45 133 Z"
                      fill={livery.primaryStripe}
                    />
                    {/* Secondary Accent Stripe */}
                    <path
                      d="M 50 136 Q 80 124 135 118 L 855 118 L 855 123 L 135 123 Q 80 129 50 140 Z"
                      fill={livery.secondaryStripe}
                    />
                  </>
                )}

                {livery.pattern === 'aerowave' && (
                  <>
                    {/* Sweeping Aerodynamic Wave */}
                    <path
                      d="M 40 135 Q 90 90 220 85 Q 400 80 855 120 L 855 138 Q 400 98 220 102 Q 90 108 40 142 Z"
                      fill={livery.primaryStripe}
                    />
                    <path
                      d="M 70 140 Q 150 115 300 112 Q 550 108 855 138 L 855 144 Q 550 114 300 118 Q 150 122 70 144 Z"
                      fill={livery.secondaryStripe}
                    />
                  </>
                )}

                {livery.pattern === 'dual_chevron' && (
                  <>
                    {/* Sharp Geometric Arrow Flash */}
                    <polygon
                      points="120,70 150,70 210,135 180,135"
                      fill={livery.primaryStripe}
                    />
                    <polygon
                      points="155,70 185,70 245,135 215,135"
                      fill={livery.secondaryStripe}
                    />
                    <rect x="230" y="100" width="625" height="12" fill={livery.primaryStripe} />
                  </>
                )}

                {livery.pattern === 'two_tone' && (
                  <path
                    d="M 40 115 Q 100 100 200 95 L 855 95 L 855 142 L 40 142 Z"
                    fill={livery.primaryStripe}
                    opacity="0.85"
                  />
                )}

                {livery.pattern === 'minimalist' && (
                  <rect x="180" y="70" width="675" height="4" fill={livery.primaryStripe} />
                )}
              </g>

              {/* Nose Cone Accent Cap */}
              <path
                d="M 40 142 Q 40 130 52 118 Q 62 108 72 105 L 72 142 Z"
                fill={livery.noseConeColor}
              />

              {/* Aerodynamic Cockpit Windshield */}
              <path
                d="M 76 96 Q 105 76 145 74 L 140 86 Q 108 88 82 103 Z"
                fill="url(#glassReflect)"
                stroke="#334155"
                strokeWidth="1.2"
              />

              {/* Passenger Windows Row */}
              <g className="passenger-windows" fill={livery.windowTint} stroke="#1e293b" strokeWidth="0.8">
                {Array.from({ length: 18 }).map((_, i) => (
                  <rect
                    key={i}
                    x={210 + i * 35}
                    y="76"
                    width="22"
                    height="14"
                    rx="2.5"
                  />
                ))}
              </g>

              {/* Company Brand Lettering on Bodyshell */}
              <text
                x="440"
                y="132"
                textAnchor="middle"
                className="font-mono tracking-widest font-extrabold text-[12px]"
                fill={livery.primaryStripe === '#ffffff' ? '#0f172a' : '#ffffff'}
                style={{ letterSpacing: '0.22em' }}
              >
                {livery.companyBrandText || 'TRACKLINE EXPRESS'}
              </text>

              {/* Brand Emblem */}
              <g transform="translate(180, 115)">
                {livery.emblemShape === 'wings' && (
                  <path d="M -12 0 Q 0 -8 12 0 Q 0 -4 -12 0" fill={livery.primaryStripe} stroke="#ffffff" strokeWidth="0.5" />
                )}
                {livery.emblemShape === 'arrow' && (
                  <polygon points="-8,-5 6,0 -8,5 -4,0" fill={livery.primaryStripe} stroke="#ffffff" strokeWidth="0.5" />
                )}
                {livery.emblemShape === 'diamond' && (
                  <polygon points="0,-6 6,0 0,6 -6,0" fill={livery.secondaryStripe} stroke="#ffffff" strokeWidth="0.5" />
                )}
                {livery.emblemShape === 'circle' && (
                  <circle cx="0" cy="0" r="5" fill={livery.secondaryStripe} stroke="#ffffff" strokeWidth="0.5" />
                )}
              </g>
            </svg>

            {/* Live Model Indicator */}
            <div className="text-[11px] font-mono text-slate-400 mt-2">
              Visual Preview: Aerodynamic High-Speed Bullet EMU · 1:1 Scale Vector Profile
            </div>
          </div>

          {/* 2. Quick Presets Bar */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
              Featured Official Livery Presets
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {PRESET_LIVERIES.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleApplyPreset(preset)}
                  className="p-2.5 bg-[#121921] hover:bg-[#18232e] border border-[#1f2b36] hover:border-slate-500 rounded text-left transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div className="text-xs font-bold text-white truncate">{preset.name}</div>
                  <div className="flex items-center gap-1.5 mt-2">
                    <div className="w-3.5 h-3.5 rounded-full border border-black/40" style={{ backgroundColor: preset.baseColor }} />
                    <div className="w-3.5 h-3.5 rounded-full border border-black/40" style={{ backgroundColor: preset.primaryStripe }} />
                    <div className="w-3.5 h-3.5 rounded-full border border-black/40" style={{ backgroundColor: preset.secondaryStripe }} />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Deep Color Customizer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#121921] p-5 rounded-lg border border-[#1f2b36]">
            {/* Color Layer Controls */}
            <div className="space-y-4">
              <div className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Primary Body & Stripe Finishes
              </div>

              {/* Base Body Color */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-300">Base Carbody Color</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={livery.baseColor}
                    onChange={(e) => setLivery({ ...livery, baseColor: e.target.value })}
                    className="w-8 h-8 rounded border-0 cursor-pointer bg-transparent"
                  />
                  <span className="text-xs font-mono text-slate-400">{livery.baseColor}</span>
                </div>
              </div>

              {/* Primary Stripe Color */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-300">Primary Racing Stripe</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={livery.primaryStripe}
                    onChange={(e) => setLivery({ ...livery, primaryStripe: e.target.value })}
                    className="w-8 h-8 rounded border-0 cursor-pointer bg-transparent"
                  />
                  <span className="text-xs font-mono text-slate-400">{livery.primaryStripe}</span>
                </div>
              </div>

              {/* Secondary Accent Stripe */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-300">Secondary Accent Stripe</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={livery.secondaryStripe}
                    onChange={(e) => setLivery({ ...livery, secondaryStripe: e.target.value })}
                    className="w-8 h-8 rounded border-0 cursor-pointer bg-transparent"
                  />
                  <span className="text-xs font-mono text-slate-400">{livery.secondaryStripe}</span>
                </div>
              </div>

              {/* Roof Fairing Color */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-300">Roof & Pantograph Fairing</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={livery.roofColor}
                    onChange={(e) => setLivery({ ...livery, roofColor: e.target.value })}
                    className="w-8 h-8 rounded border-0 cursor-pointer bg-transparent"
                  />
                  <span className="text-xs font-mono text-slate-400">{livery.roofColor}</span>
                </div>
              </div>

              {/* Nose Cone Accent */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-300">Front Nose Cone Cap</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={livery.noseConeColor}
                    onChange={(e) => setLivery({ ...livery, noseConeColor: e.target.value })}
                    className="w-8 h-8 rounded border-0 cursor-pointer bg-transparent"
                  />
                  <span className="text-xs font-mono text-slate-400">{livery.noseConeColor}</span>
                </div>
              </div>
            </div>

            {/* Pattern & Branding Controls */}
            <div className="space-y-4">
              <div className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Pattern Geometry & Corporate Identity
              </div>

              {/* Pattern Selector */}
              <div>
                <label className="block text-xs text-slate-300 mb-1.5 font-medium">
                  Stripe Geometry Style
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['speed_stripe', 'aerowave', 'dual_chevron', 'two_tone', 'minimalist'] as const).map((pat) => (
                    <button
                      key={pat}
                      onClick={() => setLivery({ ...livery, pattern: pat })}
                      className={`px-3 py-1.5 rounded text-xs font-semibold capitalize border text-left transition-colors cursor-pointer ${
                        livery.pattern === pat
                          ? 'bg-[#1e2a36] border-[#d4f04c] text-white'
                          : 'bg-[#141c23] border-[#1f2b36] text-slate-400 hover:text-white'
                      }`}
                    >
                      {pat.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Corporate Brand Text */}
              <div>
                <label className="block text-xs text-slate-300 mb-1 font-medium">
                  Bodyshell Operator Name
                </label>
                <input
                  type="text"
                  maxLength={24}
                  value={livery.companyBrandText}
                  onChange={(e) => setLivery({ ...livery, companyBrandText: e.target.value.toUpperCase() })}
                  placeholder="e.g. SHINKANSEN EXPRESS"
                  className="w-full px-3 py-2 bg-[#0c1218] border border-[#22303d] rounded text-white text-xs font-mono tracking-wider focus:outline-none focus:border-[#d4f04c]"
                />
              </div>

              {/* Emblem Shape */}
              <div>
                <label className="block text-xs text-slate-300 mb-1.5 font-medium">
                  Fleet Emblem Motif
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['wings', 'arrow', 'diamond', 'circle'] as const).map((shape) => (
                    <button
                      key={shape}
                      onClick={() => setLivery({ ...livery, emblemShape: shape })}
                      className={`py-1.5 rounded text-xs font-semibold capitalize border text-center transition-colors cursor-pointer ${
                        livery.emblemShape === shape
                          ? 'bg-[#1e2a36] border-[#d4f04c] text-white'
                          : 'bg-[#141c23] border-[#1f2b36] text-slate-400'
                      }`}
                    >
                      {shape}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 4. Application Scope Selection */}
          <div className="bg-[#121921] p-4 rounded-lg border border-[#1f2b36] flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-white">Application Target</div>
              <div className="text-xs text-slate-400">
                Choose whether to apply this livery to your entire fleet or a specific trainset.
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs font-mono cursor-pointer">
                <input
                  type="radio"
                  name="applyScope"
                  checked={applyScope === 'all'}
                  onChange={() => setApplyScope('all')}
                  className="accent-[#d4f04c]"
                />
                <span>All Company Trains</span>
              </label>

              {ownedTrains.length > 0 && (
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 text-xs font-mono cursor-pointer">
                    <input
                      type="radio"
                      name="applyScope"
                      checked={applyScope === 'single'}
                      onChange={() => setApplyScope('single')}
                      className="accent-[#d4f04c]"
                    />
                    <span>Specific Train:</span>
                  </label>

                  <select
                    value={selectedTrainId}
                    onChange={(e) => {
                      setSelectedTrainId(e.target.value);
                      setApplyScope('single');
                    }}
                    className="px-2 py-1 bg-[#0c1218] border border-[#22303d] rounded text-xs text-white"
                  >
                    {ownedTrains.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.customName}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-[#1b252f] bg-[#121921] flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 rounded bg-[#d4f04c] hover:bg-[#c2de3e] text-[#0d1318] text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer"
          >
            Save & Paint Rolling Stock →
          </button>
        </div>
      </div>
    </div>
  );
};
