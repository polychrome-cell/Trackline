import { AccentColor, ThemeMode, AppSettings } from '../types';

export interface AccentConfig {
  id: AccentColor;
  label: string;
  hex: string;
  badgeHex: string;
  secondaryHex: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  glowClass: string;
  ringClass: string;
}

export const ACCENT_PALETTES: Record<AccentColor, AccentConfig> = {
  lime: {
    id: 'lime',
    label: 'Neon Lime',
    hex: '#d4f04c',
    badgeHex: '#d4f04c',
    secondaryHex: '#a3e635',
    bgClass: 'bg-[#d4f04c]',
    textClass: 'text-[#d4f04c]',
    borderClass: 'border-[#d4f04c]',
    glowClass: 'shadow-[0_0_12px_rgba(212,240,76,0.6)]',
    ringClass: 'ring-[#d4f04c]',
  },
  cyan: {
    id: 'cyan',
    label: 'Cyber Blue',
    hex: '#38bdf8',
    badgeHex: '#0284c7',
    secondaryHex: '#0ea5e9',
    bgClass: 'bg-[#38bdf8]',
    textClass: 'text-[#38bdf8]',
    borderClass: 'border-[#38bdf8]',
    glowClass: 'shadow-[0_0_12px_rgba(56,189,248,0.6)]',
    ringClass: 'ring-[#38bdf8]',
  },
  navy: {
    id: 'navy',
    label: 'Royal Navy',
    hex: '#3b82f6',
    badgeHex: '#1d4ed8',
    secondaryHex: '#60a5fa',
    bgClass: 'bg-[#3b82f6]',
    textClass: 'text-[#3b82f6]',
    borderClass: 'border-[#3b82f6]',
    glowClass: 'shadow-[0_0_12px_rgba(59,130,246,0.6)]',
    ringClass: 'ring-[#3b82f6]',
  },
  purple: {
    id: 'purple',
    label: 'Electric Purple',
    hex: '#c084fc',
    badgeHex: '#9333ea',
    secondaryHex: '#e879f9',
    bgClass: 'bg-[#c084fc]',
    textClass: 'text-[#c084fc]',
    borderClass: 'border-[#c084fc]',
    glowClass: 'shadow-[0_0_12px_rgba(192,132,252,0.6)]',
    ringClass: 'ring-[#c084fc]',
  },
  pink: {
    id: 'pink',
    label: 'Hot Pink',
    hex: '#fb7185',
    badgeHex: '#e11d48',
    secondaryHex: '#f43f5e',
    bgClass: 'bg-[#fb7185]',
    textClass: 'text-[#fb7185]',
    borderClass: 'border-[#fb7185]',
    glowClass: 'shadow-[0_0_12px_rgba(251,113,133,0.6)]',
    ringClass: 'ring-[#fb7185]',
  },
  emerald: {
    id: 'emerald',
    label: 'Jade Emerald',
    hex: '#34d399',
    badgeHex: '#059669',
    secondaryHex: '#10b981',
    bgClass: 'bg-[#34d399]',
    textClass: 'text-[#34d399]',
    borderClass: 'border-[#34d399]',
    glowClass: 'shadow-[0_0_12px_rgba(52,211,153,0.6)]',
    ringClass: 'ring-[#34d399]',
  },
  amber: {
    id: 'amber',
    label: 'Solar Amber',
    hex: '#fbbf24',
    badgeHex: '#d97706',
    secondaryHex: '#f59e0b',
    bgClass: 'bg-[#fbbf24]',
    textClass: 'text-[#fbbf24]',
    borderClass: 'border-[#fbbf24]',
    glowClass: 'shadow-[0_0_12px_rgba(251,191,36,0.6)]',
    ringClass: 'ring-[#fbbf24]',
  },
};

export const DEFAULT_SETTINGS: AppSettings = {
  themeMode: 'dark',
  accentColor: 'lime',
  showReferenceCorridors: true,
  audioFeedback: false,
};

export function loadSavedSettings(): AppSettings {
  try {
    const raw = localStorage.getItem('railway_sim_settings');
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem('railway_sim_settings', JSON.stringify(settings));
  } catch {
    // Ignore localStorage errors
  }
}

// Lightweight tactical dispatch audio blips using Web Audio API
export function playTacticalSound(type: 'click' | 'confirm' | 'alert' | 'route', enabled: boolean): void {
  if (!enabled || typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.05);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === 'confirm') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(659.25, now + 0.08);
      osc.frequency.setValueAtTime(783.99, now + 0.16);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === 'route') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    }
  } catch {
    // Ignore audio context errors
  }
}
