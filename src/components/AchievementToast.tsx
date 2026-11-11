import React, { useEffect } from 'react';
import { Achievement } from '../game/achievements';
import { AccentColor, ThemeMode } from '../types';
import { ACCENT_PALETTES } from '../utils/theme';

interface AchievementToastProps {
  achievement: Achievement | null;
  onClose: () => void;
  onOpenCenter: () => void;
  themeMode: ThemeMode;
  accentColor: AccentColor;
}

export const AchievementToast: React.FC<AchievementToastProps> = ({
  achievement,
  onClose,
  onOpenCenter,
  themeMode,
  accentColor,
}) => {
  const isDark = themeMode === 'dark';
  const accent = ACCENT_PALETTES[accentColor] || ACCENT_PALETTES.lime;

  useEffect(() => {
    if (!achievement) return;
    const timer = setTimeout(() => {
      onClose();
    }, 6000);
    return () => clearTimeout(timer);
  }, [achievement, onClose]);

  if (!achievement) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-bounce-short pointer-events-auto">
      <div
        className={`flex items-center gap-3.5 px-4 py-3 rounded-lg shadow-2xl border backdrop-blur-md max-w-md ${
          isDark
            ? 'bg-[#0e1720]/95 border-[#283848] text-white shadow-black/70'
            : 'bg-white/95 border-slate-300 text-slate-900 shadow-slate-400/40'
        }`}
        style={{ borderLeftWidth: '4px', borderLeftColor: accent.hex }}
      >
        <div className="w-10 h-10 rounded-md bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-2xl shrink-0">
          {achievement.icon || '🏆'}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="text-[10px] font-mono font-bold tracking-wider uppercase px-1.5 py-0.2 rounded"
              style={{ backgroundColor: `${accent.hex}25`, color: accent.hex }}
            >
              Achievement Unlocked!
            </span>
            <span className="text-[11px] text-amber-400 font-mono font-semibold">
              +{achievement.rewardPrestige} XP
            </span>
          </div>
          <div className="text-sm font-bold truncate mt-0.5">{achievement.title}</div>
          <div className="text-xs text-slate-400 truncate">{achievement.description}</div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenCenter();
            }}
            className="px-2.5 py-1 text-xs font-semibold rounded cursor-pointer transition-colors"
            style={{ backgroundColor: accent.hex, color: '#0b1014' }}
          >
            Claim
          </button>
          <button
            type="button"
            onClick={onClose}
            className={`p-1 rounded cursor-pointer transition-colors ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-black hover:bg-slate-200'
            }`}
            title="Dismiss"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};
