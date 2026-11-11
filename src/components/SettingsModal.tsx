import React from 'react';
import { AppSettings, ThemeMode, AccentColor } from '../types';
import { ACCENT_PALETTES, playTacticalSound } from '../utils/theme';
import { TutorialState, TUTORIAL_CHAPTERS } from '../game/tutorialLogic';

interface SettingsModalProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onClose: () => void;
  onResetGame: () => void;
  tutorialState?: TutorialState;
  onReplayTutorialChapter?: (chapterId: number) => void;
  onRestartTutorial?: () => void;
  onOpenHelpCenter?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onClose,
  onResetGame,
  tutorialState,
  onReplayTutorialChapter,
  onRestartTutorial,
  onOpenHelpCenter,
}) => {
  const currentAccent = ACCENT_PALETTES[settings.accentColor] || ACCENT_PALETTES.lime;
  const isDark = settings.themeMode === 'dark';

  const handleSelectTheme = (mode: ThemeMode) => {
    playTacticalSound('click', settings.audioFeedback);
    onUpdateSettings({ themeMode: mode });
  };

  const handleSelectAccent = (color: AccentColor) => {
    playTacticalSound('click', settings.audioFeedback);
    onUpdateSettings({ accentColor: color });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm select-none animate-in fade-in duration-150">
      <div className={`w-full max-w-xl max-h-[92vh] flex flex-col rounded-lg shadow-2xl border ${
        isDark ? 'bg-[#0f1720] border-[#22303d] text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
      } overflow-hidden`}>
        {/* Modal Header */}
        <div className={`px-6 py-4 flex items-center justify-between border-b ${
          isDark ? 'border-[#1e2a36] bg-[#0c131a]' : 'border-slate-200 bg-white'
        }`}>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
              Trackline Sim // System Console
            </div>
            <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
              <span>Settings & Visual Appearance</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded" style={{
                backgroundColor: `${currentAccent.hex}25`,
                color: currentAccent.hex,
                border: `1px solid ${currentAccent.hex}50`,
              }}>
                v2.4
              </span>
            </h2>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded text-sm transition-colors cursor-pointer ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
            }`}
            title="Close Settings"
          >
            ✕
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* 1. Theme Mode Switcher */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                Display Theme Mode
              </label>
              <span className="text-[11px] font-mono text-slate-500">
                Selected: {isDark ? 'Tactical Dark' : 'Daytime Dispatcher'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Dark Mode Card */}
              <button
                type="button"
                onClick={() => handleSelectTheme('dark')}
                className={`p-3.5 rounded border text-left transition-all cursor-pointer flex flex-col gap-2 ${
                  isDark
                    ? 'border-2 shadow-md bg-[#0a0f14]'
                    : 'bg-white border-slate-300 hover:border-slate-400'
                }`}
                style={isDark ? { borderColor: currentAccent.hex } : {}}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold font-mono ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    Tactical Dark
                  </span>
                  <span className="text-xs">🌙</span>
                </div>
                <div className="h-7 w-full bg-[#0d1318] rounded flex items-center px-2 gap-1.5 border border-[#1e2a36]">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: currentAccent.hex }} />
                  <div className="w-6 h-1 bg-slate-700 rounded" />
                  <div className="w-12 h-1 bg-slate-800 rounded" />
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">
                  Nighttime control room palette with deep contrast and glowing rail vectors.
                </p>
              </button>

              {/* Light Mode Card */}
              <button
                type="button"
                onClick={() => handleSelectTheme('light')}
                className={`p-3.5 rounded border text-left transition-all cursor-pointer flex flex-col gap-2 ${
                  !isDark
                    ? 'border-2 shadow-md bg-white'
                    : 'bg-[#121a22] border-[#22303d] hover:border-slate-600'
                }`}
                style={!isDark ? { borderColor: currentAccent.hex } : {}}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold font-mono ${!isDark ? 'text-slate-900' : 'text-slate-200'}`}>
                    Daytime Dispatcher
                  </span>
                  <span className="text-xs">☀️</span>
                </div>
                <div className="h-7 w-full bg-slate-100 rounded flex items-center px-2 gap-1.5 border border-slate-300">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: currentAccent.hex }} />
                  <div className="w-6 h-1 bg-slate-400 rounded" />
                  <div className="w-12 h-1 bg-slate-300 rounded" />
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">
                  High-illumination daytime cartography for bright environments.
                </p>
              </button>
            </div>
          </div>

          {/* 2. Accent Color Palette Selector */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                Accent Highlight Color
              </label>
              <span className="text-[11px] font-mono font-bold" style={{ color: currentAccent.hex }}>
                {currentAccent.label} ({currentAccent.hex})
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {(Object.keys(ACCENT_PALETTES) as AccentColor[]).map((colKey) => {
                const item = ACCENT_PALETTES[colKey];
                const isSelected = settings.accentColor === colKey;

                return (
                  <button
                    key={colKey}
                    type="button"
                    onClick={() => handleSelectAccent(colKey)}
                    className={`p-2.5 rounded border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? isDark ? 'bg-[#141f2a] shadow-md' : 'bg-white shadow-md'
                        : isDark ? 'bg-[#10171f] border-[#22303d] hover:border-slate-600' : 'bg-slate-100 border-slate-200 hover:border-slate-300'
                    }`}
                    style={isSelected ? { borderColor: item.hex, borderWidth: '2px' } : {}}
                  >
                    <div className="relative flex items-center justify-center">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-transform"
                        style={{ backgroundColor: item.hex }}
                      >
                        {isSelected && (
                          <span className="text-black text-xs font-bold font-mono">✓</span>
                        )}
                      </div>
                    </div>
                    <span className={`text-[11px] font-mono font-bold truncate max-w-full ${
                      isSelected ? (isDark ? 'text-white' : 'text-slate-900') : 'text-slate-400'
                    }`}>
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Operations & Map Preferences */}
          <div>
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 block mb-2.5">
              Operations & Map Radar Preferences
            </label>

            <div className={`space-y-3 p-3.5 rounded border ${
              isDark ? 'bg-[#0d141b] border-[#1e2a36]' : 'bg-white border-slate-200'
            }`}>
              {/* Reference Corridors Switch */}
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-xs font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                    Show Inactive Reference Corridors
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Render national railway trunk tracks even before you acquire or build routes on them.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    playTacticalSound('click', settings.audioFeedback);
                    onUpdateSettings({ showReferenceCorridors: !settings.showReferenceCorridors });
                  }}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    settings.showReferenceCorridors ? 'bg-emerald-500' : 'bg-slate-600'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                      settings.showReferenceCorridors ? 'left-6' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              {/* Sound Effects Switch */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-700/40">
                <div>
                  <div className={`text-xs font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                    Tactical Audio Feedback
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Play operational chime and dispatch sounds upon route creation and fleet procurement.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const nextVal = !settings.audioFeedback;
                    playTacticalSound('confirm', nextVal);
                    onUpdateSettings({ audioFeedback: nextVal });
                  }}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    settings.audioFeedback ? 'bg-emerald-500' : 'bg-slate-600'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                      settings.audioFeedback ? 'left-6' : 'left-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* 4. Interactive Tutorial & Training Academy */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div>
                <h3 className={`text-xs font-bold uppercase tracking-wider font-mono ${
                  isDark ? 'text-slate-200' : 'text-slate-800'
                }`}>
                  04. Training Academy & Tutorial
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Replay step-by-step interactive chapters or access the Dispatcher Knowledge Base.
                </p>
              </div>
              {tutorialState && (
                <span
                  className="text-[10px] font-mono px-2 py-0.5 rounded font-bold"
                  style={{
                    backgroundColor: `${currentAccent.hex}20`,
                    color: currentAccent.hex,
                    border: `1px solid ${currentAccent.hex}50`,
                  }}
                >
                  {tutorialState.completedChapterIds.length} / {TUTORIAL_CHAPTERS.length} Done
                </span>
              )}
            </div>

            <div className={`p-4 rounded border space-y-3 ${
              isDark ? 'bg-[#121a22] border-[#1e2a36]' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-700/40">
                <div>
                  <div className={`text-xs font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                    First-Time Interactive Tutorial
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Step-by-step interactive guide with element spotlighting and interactive actions.
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {onRestartTutorial && (
                    <button
                      type="button"
                      onClick={() => {
                        onRestartTutorial();
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded text-xs font-mono font-bold text-slate-900 shadow-sm transition-all cursor-pointer"
                      style={{ backgroundColor: currentAccent.hex }}
                    >
                      Start Full Tutorial ↻
                    </button>
                  )}
                  {onOpenHelpCenter && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenHelpCenter();
                      }}
                      className={`px-3 py-1.5 rounded text-xs font-mono font-semibold border transition-colors cursor-pointer ${
                        isDark ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700' : 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      Help Manual 📖
                    </button>
                  )}
                </div>
              </div>

              {/* Individual Chapter Replay Buttons */}
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-2">
                  Replay Individual Chapters:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {TUTORIAL_CHAPTERS.map((ch) => {
                    const isCompleted = tutorialState?.completedChapterIds.includes(ch.id);
                    return (
                      <button
                        key={ch.id}
                        type="button"
                        onClick={() => {
                          if (onReplayTutorialChapter) {
                            onReplayTutorialChapter(ch.id);
                            onClose();
                          }
                        }}
                        className={`px-2.5 py-1.5 rounded text-left border transition-colors cursor-pointer flex items-center justify-between ${
                          isDark
                            ? 'bg-[#0e1620] hover:bg-[#18232e] border-[#1f2b36] text-slate-300 hover:text-white'
                            : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900'
                        }`}
                      >
                        <div className="truncate pr-2">
                          <span className="text-[9px] font-mono font-bold text-slate-500 mr-1.5">
                            CH.{ch.id}
                          </span>
                          <span className="text-xs font-medium">{ch.title}</span>
                        </div>
                        {isCompleted ? (
                          <span className="text-[9px] text-emerald-400 font-bold shrink-0">✓</span>
                        ) : (
                          <span className="text-[10px] text-slate-500 shrink-0">▶</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* 5. Franchise Reset Option */}
          <div className="pt-2">
            <div className={`p-3.5 rounded border border-rose-900/40 bg-rose-950/20 flex items-center justify-between`}>
              <div>
                <div className="text-xs font-bold text-rose-400">Reset Railway Simulation</div>
                <div className="text-[10px] text-slate-400">
                  Restore default initial franchise data, treasury capital, and starter network.
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (confirm('Are you sure you want to reset the simulation back to initial franchise setup?')) {
                    onResetGame();
                    onClose();
                  }
                }}
                className="px-3 py-1.5 bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-mono font-bold rounded transition-colors cursor-pointer"
              >
                Reset Franchise
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className={`px-6 py-3.5 flex items-center justify-end border-t ${
          isDark ? 'border-[#1e2a36] bg-[#0c131a]' : 'border-slate-200 bg-white'
        }`}>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-mono font-bold rounded text-slate-900 shadow-md transition-all cursor-pointer"
            style={{ backgroundColor: currentAccent.hex }}
          >
            Done & Apply
          </button>
        </div>
      </div>
    </div>
  );
};
