import React, { useState } from 'react';
import { ThemeMode, AccentColor } from '../types';
import { ACCENT_PALETTES, playTacticalSound } from '../utils/theme';
import { TUTORIAL_CHAPTERS, TutorialState } from '../game/tutorialLogic';

interface HelpCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  tutorialState: TutorialState;
  onReplayChapter: (chapterId: number) => void;
  onRestartFullTutorial: () => void;
  themeMode?: ThemeMode;
  accentColor?: AccentColor;
  audioFeedback?: boolean;
}

type HelpTopic = 'tutorial' | 'tracks' | 'fleet' | 'economics' | 'weather' | 'platforms';

export const HelpCenterModal: React.FC<HelpCenterModalProps> = ({
  isOpen,
  onClose,
  tutorialState,
  onReplayChapter,
  onRestartFullTutorial,
  themeMode = 'dark',
  accentColor = 'lime',
  audioFeedback = true,
}) => {
  const [activeTopic, setActiveTopic] = useState<HelpTopic>('tutorial');
  const isDark = themeMode === 'dark';
  const accent = ACCENT_PALETTES[accentColor] || ACCENT_PALETTES.lime;

  if (!isOpen) return null;

  const handleSelectTopic = (topic: HelpTopic) => {
    playTacticalSound('click', audioFeedback);
    setActiveTopic(topic);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none animate-in fade-in duration-150">
      <div
        className={`w-full max-w-4xl max-h-[90vh] flex flex-col rounded-lg shadow-2xl border ${
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
            <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
              Trackline Sim // Operating Manual & Knowledge Base
            </div>
            <h2 className="text-lg font-bold tracking-tight flex items-center gap-2 mt-0.5">
              <span>Dispatcher Help Centre</span>
              <span
                className="text-xs font-mono px-2 py-0.5 rounded font-semibold"
                style={{
                  backgroundColor: `${accent.hex}25`,
                  color: accent.hex,
                  border: `1px solid ${accent.hex}50`,
                }}
              >
                Docs v2.4
              </span>
            </h2>
          </div>

          <button
            onClick={() => {
              playTacticalSound('click', audioFeedback);
              onClose();
            }}
            className={`p-1.5 rounded text-sm transition-colors cursor-pointer ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
            }`}
            title="Close Help Centre"
          >
            ✕
          </button>
        </div>

        {/* Content Area: Sidebar + Topic Viewer */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Navigation Sidebar */}
          <div
            className={`w-full md:w-64 border-r overflow-y-auto p-3 space-y-1 shrink-0 ${
              isDark ? 'bg-[#0a1017] border-[#1b2632]' : 'bg-white border-slate-200'
            }`}
          >
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 px-3 py-1">
              Knowledge Base
            </div>

            {[
              { id: 'tutorial', label: '🎓 Training & Chapters', icon: '🎓' },
              { id: 'tracks', label: '🛤️ Track Types & Speed', icon: '🛤️' },
              { id: 'fleet', label: '🚆 Rolling Stock & Fleet', icon: '🚆' },
              { id: 'economics', label: '📈 Revenue & Yields', icon: '📈' },
              { id: 'weather', label: '🌦️ Weather & OTP', icon: '🌦️' },
              { id: 'platforms', label: '🚉 Platform Slots', icon: '🚉' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelectTopic(item.id as HelpTopic)}
                className={`w-full text-left px-3 py-2 rounded text-xs font-mono transition-colors cursor-pointer flex items-center justify-between ${
                  activeTopic === item.id
                    ? isDark
                      ? 'bg-[#18232e] text-white font-bold shadow-xs'
                      : 'bg-slate-100 text-slate-900 font-bold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                style={activeTopic === item.id ? { borderLeft: `3px solid ${accent.hex}` } : {}}
              >
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* Topic Detail View */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {activeTopic === 'tutorial' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white">Interactive Player Training Academy</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Replay any of the 7 interactive guided tutorial chapters at any time.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onRestartFullTutorial();
                      onClose();
                    }}
                    className="px-3.5 py-1.5 rounded text-xs font-mono font-bold text-slate-900 shadow-sm transition-all cursor-pointer"
                    style={{ backgroundColor: accent.hex }}
                  >
                    Restart Full Tutorial ↻
                  </button>
                </div>

                <div className="space-y-2 pt-2">
                  {TUTORIAL_CHAPTERS.map((ch) => {
                    const isCompleted = tutorialState.completedChapterIds.includes(ch.id);
                    return (
                      <div
                        key={ch.id}
                        className={`p-3.5 rounded border flex items-center justify-between transition-colors ${
                          isDark ? 'bg-[#111922] border-[#1f2b36]' : 'bg-white border-slate-200 shadow-sm'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                              Chapter {ch.id}
                            </span>
                            {isCompleted && (
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold">
                                COMPLETED ✓
                              </span>
                            )}
                          </div>
                          <div className="text-sm font-bold text-white mt-0.5">{ch.title}</div>
                          <div className="text-xs text-slate-400 mt-0.5">{ch.summary}</div>
                        </div>

                        <button
                          onClick={() => {
                            onReplayChapter(ch.id);
                            onClose();
                          }}
                          className={`px-3 py-1.5 rounded text-xs font-mono font-semibold border transition-all cursor-pointer ${
                            isDark
                              ? 'bg-[#18232e] hover:bg-[#22313f] text-slate-200 border-[#2b3d4f]'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                          }`}
                        >
                          Play Chapter →
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTopic === 'tracks' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-white">Track Types, Engineering & Gauges</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Operating speeds depend on track engineering standards and rolling stock ratings.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className={`p-4 rounded border ${isDark ? 'bg-[#111922] border-[#1f2b36]' : 'bg-white border-slate-200'}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-white">High-Speed Rail</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#d4f04c]/20 text-[#d4f04c] font-bold">
                        350 km/h
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-2 leading-relaxed">
                      Continuous welded ballastless track with in-cab automated signaling. Requires electric catenary power and dedicated right-of-way.
                    </div>
                    <div className="mt-3 text-[11px] font-mono text-slate-300 border-t border-slate-800 pt-2">
                      Cost: $120k / km
                    </div>
                  </div>

                  <div className={`p-4 rounded border ${isDark ? 'bg-[#111922] border-[#1f2b36]' : 'bg-white border-slate-200'}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-white">Intercity Express</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-400 font-bold">
                        200 km/h
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-2 leading-relaxed">
                      Continuous welded rail on concrete sleepers. Ideal for semi-high-speed trainsets (e.g. Vande Bharat, KTX-Eum) across regional mainlines.
                    </div>
                    <div className="mt-3 text-[11px] font-mono text-slate-300 border-t border-slate-800 pt-2">
                      Cost: $55k / km
                    </div>
                  </div>

                  <div className={`p-4 rounded border ${isDark ? 'bg-[#111922] border-[#1f2b36]' : 'bg-white border-slate-200'}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-white">Commuter / Local</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-lime-500/20 text-lime-400 font-bold">
                        130 km/h
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-2 leading-relaxed">
                      High-frequency multi-track urban corridors built for rapid acceleration, frequent stops, and high passenger volume.
                    </div>
                    <div className="mt-3 text-[11px] font-mono text-slate-300 border-t border-slate-800 pt-2">
                      Cost: $25k / km
                    </div>
                  </div>
                </div>

                <div className={`p-4 rounded border ${isDark ? 'bg-[#0d141b] border-[#1e2a36]' : 'bg-slate-100 border-slate-300'}`}>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    Track Gauge Standards
                  </h4>
                  <ul className="text-xs text-slate-300 mt-2 space-y-1.5 leading-relaxed">
                    <li>• <strong>Standard Gauge (1,435 mm):</strong> Used by Shinkansen (Japan), CRH/HSR (China), KTX (Korea), Whoosh (Indonesia).</li>
                    <li>• <strong>Broad Gauge (1,676 mm):</strong> Used across India, Pakistan, Bangladesh, and Sri Lanka.</li>
                    <li>• <strong>Metre Gauge (1,000 mm):</strong> Common across historic Southeast Asian national networks (Thailand, Malaysia, Vietnam).</li>
                  </ul>
                </div>
              </div>
            )}

            {activeTopic === 'fleet' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-white">Rolling Stock Procurement & Fleet Upkeep</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Manage train condition, international manufacturers, and depot maintenance.
                  </p>
                </div>

                <div className="space-y-3 text-xs leading-relaxed text-slate-300">
                  <p>
                    Every train in your fleet degrades in condition over operating kilometers. Regular maintenance preserves a train&apos;s condition above 90%, preventing mechanical failures and service cancellations.
                  </p>

                  <div className={`p-4 rounded border grid grid-cols-2 gap-4 ${isDark ? 'bg-[#111922] border-[#1f2b36]' : 'bg-white border-slate-200'}`}>
                    <div>
                      <div className="font-bold text-white font-mono uppercase text-[11px]">Speed Matching Rule</div>
                      <div className="text-slate-400 mt-1">
                        A train running on a route will travel at <code>min(Train Max Speed, Track Speed Cap)</code>. Running a 350 km/h train on commuter track caps it at 130 km/h.
                      </div>
                    </div>
                    <div>
                      <div className="font-bold text-white font-mono uppercase text-[11px]">Depot Overhauls</div>
                      <div className="text-slate-400 mt-1">
                        Perform routine depot servicing in the Active Fleet tab. Keeping trains above 95% condition guarantees 99%+ on-time dispatch rates.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTopic === 'economics' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-white">Route Revenue, Fares & Financial Modeling</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    How daily passenger volume, ticket yields, and net profits are calculated.
                  </p>
                </div>

                <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                  <div className={`p-4 rounded border font-mono ${isDark ? 'bg-[#0d141b] border-[#1e2a36]' : 'bg-slate-100 border-slate-300'}`}>
                    <div className="text-[#d4f04c] font-bold">Daily Net Profit = Ticket Revenue − (Operating + Track Maintenance + Fleet Maintenance)</div>
                  </div>

                  <ul className="space-y-2">
                    <li>• <strong>Ticket Pricing:</strong> Setting fares too high reduces load factors; setting fares too low leaves revenue on the table. The market price guideline provides optimal yields.</li>
                    <li>• <strong>Departure Frequencies:</strong> 8–12 runs/day capture maximum peak and business travel demand. Higher frequencies require sufficient platform dispatch slots.</li>
                    <li>• <strong>30-Day Ledger Telemetry:</strong> Check the Station Detail Panel &apos;Finances (30D)&apos; chart to inspect daily fluctuations caused by seasonal demand and weather shifts.</li>
                  </ul>
                </div>
              </div>
            )}

            {activeTopic === 'weather' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-white">Dynamic Weather & On-Time Performance (OTP)</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Mitigate seasonal typhoons, summer monsoons, and winter blizzards.
                  </p>
                </div>

                <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                  <p>
                    Weather fronts sweep across Asian transit regions in real time. Click the weather indicator in the top command bar to inspect active atmospheric hazards:
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    <div className={`p-3 rounded border ${isDark ? 'bg-[#111922] border-[#1f2b36]' : 'bg-white border-slate-200'}`}>
                      <div className="font-bold text-amber-400 font-mono">Monsoons & Typhoons</div>
                      <div className="text-slate-400 mt-1">Waterlogging and crosswinds impose a 15–25% speed restriction and reduce discretionary passenger travel.</div>
                    </div>
                    <div className={`p-3 rounded border ${isDark ? 'bg-[#111922] border-[#1f2b36]' : 'bg-white border-slate-200'}`}>
                      <div className="font-bold text-sky-400 font-mono">Blizzards & Snowdrifts</div>
                      <div className="text-slate-400 mt-1">Freezing catenaries in northern corridors increase delay risks. Electric rotary plows and de-icing keep tracks open.</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTopic === 'platforms' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-white">Platform Dispatch Slots & Terminal Management</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Managing 10-platform capacity (P1 to P10) at central terminals.
                  </p>
                </div>

                <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                  <p>
                    Every station hub has 10 dedicated platform dispatch slots (P1 to P10).
                  </p>
                  <ul className="space-y-1.5">
                    <li>• In the Station Detail Panel, green slots represent scheduled train departures.</li>
                    <li>• Grey slots are vacant platforms ready for new corridor services.</li>
                    <li>• When scheduling new routes, ensure both origin and destination terminals have vacant platform slots.</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          className={`px-6 py-3.5 flex items-center justify-between border-t ${
            isDark ? 'border-[#1e2a36] bg-[#0c131a]' : 'border-slate-200 bg-white'
          }`}
        >
          <div className="text-[11px] font-mono text-slate-400">
            Tutorial Completion: {tutorialState.completedChapterIds.length} / {TUTORIAL_CHAPTERS.length} Chapters
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-1.5 text-xs font-mono font-bold rounded text-slate-900 shadow-md transition-all cursor-pointer"
            style={{ backgroundColor: accent.hex }}
          >
            Close Manual
          </button>
        </div>
      </div>
    </div>
  );
};
