import React, { useState, useMemo } from 'react';
import {
  ACHIEVEMENTS_CATALOG,
  Achievement,
  AchievementCategory,
  AchievementGameState,
  DISPATCHER_RANKS,
  getDispatcherRank,
  getNextDispatcherRank,
  getUnclaimedCount,
  PlayerProgressionState,
} from '../game/achievements';
import { AccentColor, ThemeMode } from '../types';
import { ACCENT_PALETTES, playTacticalSound } from '../utils/theme';

interface AchievementCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: AchievementGameState;
  progression: PlayerProgressionState;
  onClaimReward: (achievementId: string) => void;
  onClaimAll: () => void;
  themeMode: ThemeMode;
  accentColor: AccentColor;
  audioFeedback: boolean;
}

export const AchievementCenterModal: React.FC<AchievementCenterModalProps> = ({
  isOpen,
  onClose,
  gameState,
  progression,
  onClaimReward,
  onClaimAll,
  themeMode,
  accentColor,
  audioFeedback,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'unclaimed' | 'in_progress' | 'completed'>('all');
  const [showRanksDrawer, setShowRanksDrawer] = useState<boolean>(false);

  const isDark = themeMode === 'dark';
  const accent = ACCENT_PALETTES[accentColor] || ACCENT_PALETTES.lime;

  const currentRank = useMemo(
    () => getDispatcherRank(progression.prestigePoints),
    [progression.prestigePoints]
  );

  const nextRank = useMemo(
    () => getNextDispatcherRank(progression.prestigePoints),
    [progression.prestigePoints]
  );

  const rankProgressPercent = useMemo(() => {
    if (!nextRank) return 100;
    const currentBase = currentRank.minPrestige;
    const target = nextRank.minPrestige;
    const delta = target - currentBase;
    if (delta <= 0) return 100;
    const progress = progression.prestigePoints - currentBase;
    return Math.min(100, Math.max(0, Math.round((progress / delta) * 100)));
  }, [currentRank, nextRank, progression.prestigePoints]);

  const unclaimedCount = useMemo(
    () => getUnclaimedCount(progression.unlockedRecords),
    [progression.unlockedRecords]
  );

  const totalUnlockedCount = useMemo(() => {
    return Object.values(progression.unlockedRecords).filter((r) => r.unlocked).length;
  }, [progression.unlockedRecords]);

  const filteredAchievements = useMemo(() => {
    return ACHIEVEMENTS_CATALOG.filter((ach) => {
      // Category filter
      if (selectedCategory !== 'all' && ach.category !== selectedCategory) {
        return false;
      }

      const record = progression.unlockedRecords[ach.id];
      const isUnlocked = record?.unlocked || ach.checkUnlocked(gameState);
      const isClaimed = !!record?.claimed;

      // Status filter
      if (filterStatus === 'unclaimed') {
        return isUnlocked && !isClaimed;
      }
      if (filterStatus === 'in_progress') {
        return !isUnlocked;
      }
      if (filterStatus === 'completed') {
        return isUnlocked;
      }

      return true;
    });
  }, [selectedCategory, filterStatus, progression.unlockedRecords, gameState]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div
        className={`w-full max-w-5xl max-h-[92vh] flex flex-col rounded-xl border shadow-2xl overflow-hidden ${
          isDark ? 'bg-[#0d141c] border-[#22303d] text-slate-100' : 'bg-white border-slate-300 text-slate-900'
        }`}
      >
        {/* Top Header & Close */}
        <div
          className={`px-6 py-4 border-b flex items-center justify-between shrink-0 ${
            isDark ? 'bg-[#111923] border-[#22303d]' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-xl shadow-inner border"
              style={{
                backgroundColor: `${accent.hex}18`,
                borderColor: `${accent.hex}40`,
                color: accent.hex,
              }}
            >
              🏆
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-mono font-extrabold text-base sm:text-lg tracking-wide uppercase">
                  Dispatcher Achievement Centre
                </h2>
                <span
                  className="text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold border"
                  style={{
                    backgroundColor: `${accent.hex}20`,
                    borderColor: `${accent.hex}60`,
                    color: accent.hex,
                  }}
                >
                  Milestones & Progression
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Complete network expansion milestones, earn Prestige XP, and unlock operational career perks.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {unclaimedCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  playTacticalSound('confirm', audioFeedback);
                  onClaimAll();
                }}
                className="px-3.5 py-1.5 rounded text-xs font-mono font-bold tracking-wider uppercase transition-all shadow-md cursor-pointer animate-pulse"
                style={{ backgroundColor: accent.hex, color: '#0b1014' }}
              >
                Claim All ({unclaimedCount})
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                playTacticalSound('click', audioFeedback);
                onClose();
              }}
              className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                isDark
                  ? 'border-slate-700 bg-slate-800/60 hover:bg-slate-700 text-slate-300 hover:text-white'
                  : 'border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-black'
              }`}
              title="Close (Esc)"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Dispatcher Rank Progress & Career Perk Card */}
        <div
          className={`px-6 py-4 border-b shrink-0 ${
            isDark ? 'bg-[#141d27] border-[#22303d]' : 'bg-slate-100 border-slate-200'
          }`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
            {/* Rank Identity */}
            <div className="lg:col-span-5 flex items-center gap-3.5">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl border shadow-md"
                style={{
                  backgroundColor: `${currentRank.badgeColor}20`,
                  borderColor: currentRank.badgeColor,
                }}
              >
                {currentRank.icon}
              </div>
              <div>
                <div className="text-[11px] font-mono tracking-wider uppercase text-slate-400 flex items-center gap-2">
                  <span>DISPATCHER RANK LEVEL {currentRank.level}</span>
                  <span className="text-slate-600">•</span>
                  <button
                    type="button"
                    onClick={() => {
                      playTacticalSound('click', audioFeedback);
                      setShowRanksDrawer(!showRanksDrawer);
                    }}
                    className="underline hover:text-white cursor-pointer font-bold text-[10px]"
                    style={{ color: accent.hex }}
                  >
                    {showRanksDrawer ? 'Hide All Ranks' : 'View Rank Ladder'}
                  </button>
                </div>
                <div className="text-base sm:text-lg font-bold font-mono tracking-tight" style={{ color: currentRank.badgeColor }}>
                  {currentRank.title}
                </div>
                <div className="text-xs text-slate-400">
                  {totalUnlockedCount} of {ACHIEVEMENTS_CATALOG.length} milestones unlocked
                </div>
              </div>
            </div>

            {/* Prestige XP Progress Bar */}
            <div className="lg:col-span-4 flex flex-col justify-center">
              <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                <span className="font-semibold text-slate-300">
                  Prestige: <span className="font-bold text-amber-400">{progression.prestigePoints.toLocaleString()} XP</span>
                </span>
                <span className="text-slate-400 text-[11px]">
                  {nextRank ? `Next: ${nextRank.title} (${nextRank.minPrestige} XP)` : 'MAX RANK ACHIEVED'}
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full overflow-hidden bg-black/40 border border-slate-700">
                <div
                  className="h-full transition-all duration-500 rounded-full"
                  style={{
                    width: `${rankProgressPercent}%`,
                    backgroundColor: accent.hex,
                  }}
                />
              </div>
              <div className="text-[11px] text-slate-400 mt-1 flex justify-between font-mono">
                <span>{rankProgressPercent}% progress</span>
                {nextRank && (
                  <span>
                    {(nextRank.minPrestige - progression.prestigePoints).toLocaleString()} XP to rank up
                  </span>
                )}
              </div>
            </div>

            {/* Active Rank Perks Summary */}
            <div
              className={`lg:col-span-3 p-2.5 rounded-lg border text-xs ${
                isDark ? 'bg-[#0e1720] border-[#22303d]' : 'bg-white border-slate-300'
              }`}
            >
              <div className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-400 flex items-center justify-between">
                <span>ACTIVE OPERATIONAL PERKS</span>
                <span className="text-emerald-400">✓ ACTIVE</span>
              </div>
              <div className="text-[11px] mt-1 text-slate-300 line-clamp-2 leading-relaxed">
                {currentRank.perks[0]}
              </div>
            </div>
          </div>

          {/* Expandable Rank Ladder Drawer */}
          {showRanksDrawer && (
            <div
              className={`mt-4 pt-4 border-t grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 ${
                isDark ? 'border-slate-800' : 'border-slate-300'
              }`}
            >
              {DISPATCHER_RANKS.map((rk) => {
                const isCurrent = rk.level === currentRank.level;
                const isReached = progression.prestigePoints >= rk.minPrestige;
                return (
                  <div
                    key={rk.level}
                    className={`p-2.5 rounded-lg border text-xs flex flex-col justify-between ${
                      isCurrent
                        ? isDark
                          ? 'bg-[#1b2633] border-amber-400/70 shadow-sm'
                          : 'bg-amber-50 border-amber-400 shadow-sm'
                        : isReached
                        ? isDark
                          ? 'bg-[#0e1620] border-slate-700 opacity-90'
                          : 'bg-white border-slate-300 opacity-90'
                        : isDark
                        ? 'bg-[#0a0f14] border-slate-800 opacity-50'
                        : 'bg-slate-200 border-slate-300 opacity-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-lg">{rk.icon}</span>
                        <span className="text-[10px] font-mono font-bold text-slate-400">
                          LVL {rk.level}
                        </span>
                      </div>
                      <div className="font-bold text-xs mt-1" style={{ color: rk.badgeColor }}>
                        {rk.title}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                        {rk.minPrestige} XP
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-300 mt-2 line-clamp-2 leading-tight">
                      {rk.perks[0]}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Filter Navigation Tabs */}
        <div
          className={`px-6 py-3 border-b flex flex-wrap items-center justify-between gap-3 shrink-0 ${
            isDark ? 'bg-[#0f1721] border-[#22303d]' : 'bg-slate-50 border-slate-200'
          }`}
        >
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { id: 'all', label: 'ALL MILESTONES', count: ACHIEVEMENTS_CATALOG.length },
              {
                id: 'train_development',
                label: 'TRAIN DEVELOPMENT',
                count: ACHIEVEMENTS_CATALOG.filter((a) => a.category === 'train_development').length,
              },
              {
                id: 'infrastructure',
                label: 'RAILWAY INFRASTRUCTURE',
                count: ACHIEVEMENTS_CATALOG.filter((a) => a.category === 'infrastructure').length,
              },
              {
                id: 'international',
                label: 'INTERNATIONAL EXPANSION',
                count: ACHIEVEMENTS_CATALOG.filter((a) => a.category === 'international').length,
              },
              {
                id: 'financial',
                label: 'FINANCIAL MASTERY',
                count: ACHIEVEMENTS_CATALOG.filter((a) => a.category === 'financial').length,
              },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  playTacticalSound('click', audioFeedback);
                  setSelectedCategory(cat.id as AchievementCategory | 'all');
                }}
                className={`px-3 py-1.5 rounded text-xs font-mono font-bold tracking-wider uppercase transition-colors cursor-pointer border ${
                  selectedCategory === cat.id
                    ? isDark
                      ? 'bg-[#1b2633] text-white'
                      : 'bg-white text-slate-900 shadow-sm'
                    : isDark
                    ? 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/40'
                    : 'border-transparent text-slate-600 hover:text-black hover:bg-slate-200'
                }`}
                style={
                  selectedCategory === cat.id
                    ? { borderColor: `${accent.hex}70`, color: accent.hex }
                    : {}
                }
              >
                {cat.label} ({cat.count})
              </button>
            ))}
          </div>

          {/* Status Segment Filter */}
          <div
            className={`flex items-center p-1 rounded border text-xs font-mono ${
              isDark ? 'bg-[#141c24] border-[#22303d]' : 'bg-slate-200 border-slate-300'
            }`}
          >
            {[
              { id: 'all', label: 'All' },
              { id: 'unclaimed', label: `Ready (${unclaimedCount})` },
              { id: 'in_progress', label: 'In Progress' },
              { id: 'completed', label: 'Completed' },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => {
                  playTacticalSound('click', audioFeedback);
                  setFilterStatus(st.id as typeof filterStatus);
                }}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  filterStatus === st.id
                    ? isDark
                      ? 'bg-[#22303d] text-white font-bold'
                      : 'bg-white text-slate-900 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Achievement Grid Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {filteredAchievements.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <div className="text-4xl mb-3">🔍</div>
              <div className="text-base font-bold font-mono">No achievements match your filter</div>
              <div className="text-xs text-slate-500 mt-1">
                Try selecting "ALL MILESTONES" or clearing status filters.
              </div>
            </div>
          ) : (
            filteredAchievements.map((ach) => {
              const record = progression.unlockedRecords[ach.id];
              const isUnlocked = record?.unlocked || ach.checkUnlocked(gameState);
              const isClaimed = !!record?.claimed;
              const progress = ach.getProgress(gameState);

              return (
                <div
                  key={ach.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isClaimed
                      ? isDark
                        ? 'bg-[#0e1620]/70 border-[#1f2b38] opacity-80'
                        : 'bg-slate-50 border-slate-200 opacity-80'
                      : isUnlocked
                      ? isDark
                        ? 'bg-[#152230] border-amber-500/50 shadow-lg shadow-black/40'
                        : 'bg-amber-50/70 border-amber-300 shadow-md'
                      : isDark
                      ? 'bg-[#111922] border-[#22303d]'
                      : 'bg-white border-slate-200'
                  }`}
                  style={
                    isUnlocked && !isClaimed
                      ? { borderLeftWidth: '5px', borderLeftColor: accent.hex }
                      : {}
                  }
                >
                  {/* Left: Icon & Description */}
                  <div className="flex items-start gap-4 flex-1">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 border shadow-inner ${
                        isUnlocked
                          ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                          : isDark
                          ? 'bg-slate-800/50 border-slate-700 text-slate-400'
                          : 'bg-slate-100 border-slate-300 text-slate-500'
                      }`}
                    >
                      {ach.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className="text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold border"
                          style={{
                            backgroundColor: isDark ? '#1a2634' : '#e2e8f0',
                            borderColor: isDark ? '#2a3b4e' : '#cbd5e1',
                            color: isDark ? '#94a3b8' : '#475569',
                          }}
                        >
                          {ach.categoryLabel}
                        </span>

                        <span
                          className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded font-extrabold border ${
                            ach.tier === 'beginner'
                              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                              : ach.tier === 'intermediate'
                              ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-400'
                              : ach.tier === 'advanced'
                              ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                              : 'bg-purple-500/15 border-purple-500/40 text-purple-300'
                          }`}
                        >
                          {ach.tierLabel}
                        </span>

                        <h3 className="font-bold text-sm sm:text-base tracking-tight font-mono">
                          {ach.title}
                        </h3>

                        {isClaimed && (
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            ✓ Claimed
                          </span>
                        )}

                        {isUnlocked && !isClaimed && (
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                            Ready to Claim
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {ach.description}
                      </p>

                      {ach.perkDescription && (
                        <div className="text-[11px] text-cyan-400 mt-1 flex items-center gap-1 font-mono">
                          <span>✨ Perk:</span>
                          <span>{ach.perkDescription}</span>
                        </div>
                      )}

                      {/* Progress Bar */}
                      <div className="mt-3 max-w-md">
                        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
                          <span>Progress: {progress.formattedCurrent} / {progress.formattedTarget}</span>
                          <span className="font-bold text-slate-300">{progress.percent}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full overflow-hidden bg-black/40 border border-slate-700/60">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${progress.percent}%`,
                              backgroundColor: isUnlocked ? accent.hex : '#64748b',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Rewards & Claim Action */}
                  <div className="flex md:flex-col items-center md:items-end justify-between gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                    <div className="flex items-center md:flex-col md:items-end gap-2 text-xs font-mono">
                      <div className="font-bold text-emerald-400">
                        {ach.rewardCash >= 1000000
                          ? `+$${(ach.rewardCash / 1000000).toFixed(1)}M`
                          : `+$${(ach.rewardCash / 1000).toFixed(0)}k`}{' '}
                        Treasury
                      </div>
                      <div className="text-amber-400 font-semibold text-[11px]">
                        +{ach.rewardPrestige} Prestige XP
                      </div>
                    </div>

                    <div>
                      {isClaimed ? (
                        <button
                          type="button"
                          disabled
                          className={`px-3 py-1.5 rounded text-xs font-mono font-semibold uppercase opacity-60 cursor-default border ${
                            isDark ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-slate-200 border-slate-300 text-slate-600'
                          }`}
                        >
                          ✓ Claimed
                        </button>
                      ) : isUnlocked ? (
                        <button
                          type="button"
                          onClick={() => {
                            playTacticalSound('confirm', audioFeedback);
                            onClaimReward(ach.id);
                          }}
                          className="px-4 py-2 rounded text-xs font-mono font-bold tracking-wider uppercase transition-all shadow-lg cursor-pointer transform hover:scale-105"
                          style={{ backgroundColor: accent.hex, color: '#0b1014' }}
                        >
                          Claim Reward
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled
                          className={`px-3 py-1.5 rounded text-xs font-mono font-medium uppercase opacity-50 cursor-not-allowed border ${
                            isDark ? 'bg-slate-900 border-slate-800 text-slate-500' : 'bg-slate-100 border-slate-300 text-slate-400'
                          }`}
                        >
                          In Progress
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info bar */}
        <div
          className={`px-6 py-3 border-t flex items-center justify-between text-xs font-mono shrink-0 ${
            isDark ? 'bg-[#111923] border-[#22303d] text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
          }`}
        >
          <div>
            Total Prestige: <span className="font-bold text-amber-400">{progression.prestigePoints} XP</span> · Career Rank: <span className="font-bold text-white">{currentRank.title}</span>
          </div>
          <div>
            Trackline Sim · Dynamic Fleet & Network Expansion System
          </div>
        </div>
      </div>
    </div>
  );
};
