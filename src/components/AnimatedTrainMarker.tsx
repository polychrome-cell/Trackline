import React, { useState } from 'react';
import { TrackType } from '../types';

interface AnimatedTrainMarkerProps {
  id: string;
  name: string;
  trainName?: string;
  trackType: TrackType;
  color: string;
  bearing: number;
  progressPercent: number;
  speedKmH?: number;
}

export const AnimatedTrainMarker: React.FC<AnimatedTrainMarkerProps> = ({
  name,
  trainName,
  trackType,
  color,
  bearing,
  progressPercent,
  speedKmH = 220,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Speed label based on track type
  const displaySpeed =
    trackType === 'high_speed'
      ? Math.max(280, speedKmH)
      : trackType === 'express'
      ? Math.min(220, Math.max(160, speedKmH))
      : 120;

  return (
    <div
      className="relative flex items-center justify-center cursor-pointer select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: '40px',
        height: '40px',
      }}
    >
      {/* 1. Animated Rotational Train Body (Oriented to track bearing) */}
      <div
        className="relative flex items-center justify-center transition-transform duration-300 ease-linear pointer-events-auto"
        style={{
          transform: `rotate(${Math.round(bearing)}deg)`,
        }}
      >
        {/* Forward Headlight Beam (SVG Gradient Cone projecting in front of train) */}
        <div className="absolute -top-7 left-1/2 -translate-x-1/2 pointer-events-none opacity-80 animate-pulse">
          <svg width="28" height="26" viewBox="0 0 28 26" fill="none">
            <defs>
              <linearGradient id={`headlight-${color.replace('#', '')}`} x1="14" y1="26" x2="14" y2="0" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
                <stop offset="40%" stopColor={color} stopOpacity="0.45" />
                <stop offset="100%" stopColor={color} stopOpacity="0" />
              </linearGradient>
            </defs>
            <polygon points="14,26 0,0 28,0" fill={`url(#headlight-${color.replace('#', '')})`} />
          </svg>
        </div>

        {/* Pulse Aura */}
        <div
          className="absolute w-7 h-7 rounded-full animate-ping opacity-30 pointer-events-none"
          style={{ backgroundColor: color }}
        />

        {/* SVG High-Speed Train Nose / Cab Icon */}
        <svg
          width="26"
          height="32"
          viewBox="0 0 26 32"
          fill="none"
          className="drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)] filter"
        >
          {/* Main Aerodynamic Train Shell */}
          <path
            d="M13 2 C9 2 6 7 6 12 L6 26 C6 28.5 8 30 13 30 C18 30 20 28.5 20 26 L20 12 C20 7 17 2 13 2 Z"
            fill="#0f172a"
            stroke="#ffffff"
            strokeWidth="1.5"
          />

          {/* Color Accent Speed Stripes */}
          <path
            d="M9 10 L9 26 M17 10 L17 26"
            stroke={color}
            strokeWidth="1.8"
            strokeLinecap="round"
          />

          {/* Aerodynamic Windshield */}
          <path
            d="M8.5 8 C10 6 16 6 17.5 8 L17 12 C15 11 11 11 9 12 Z"
            fill={color}
            opacity="0.95"
          />

          {/* Dual High-Intensity Front LED Headlights */}
          <circle cx="9.5" cy="4" r="1.5" fill="#ffffff" />
          <circle cx="16.5" cy="4" r="1.5" fill="#ffffff" />

          {/* Roof Ridge & Pantograph Line */}
          <line x1="13" y1="12" x2="13" y2="24" stroke="#ffffff" strokeWidth="1" strokeDasharray="2 2" opacity="0.7" />
        </svg>

        {/* Small speed ripple dot */}
        <div
          className="absolute -bottom-1 w-2 h-2 rounded-full border border-white/60 shadow-sm"
          style={{ backgroundColor: color }}
        />
      </div>

      {/* 2. Tactical Hover Telemetry Tooltip (Always upright, does not rotate with bearing) */}
      {isHovered && (
        <div className="absolute -top-14 left-1/2 -translate-x-1/2 z-30 pointer-events-none whitespace-nowrap">
          <div className="bg-[#0b1016]/95 border border-[#2a3c4e] text-white px-2.5 py-1.5 rounded-lg shadow-2xl backdrop-blur-md flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5 text-[10px] font-mono">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
              <span className="font-bold text-slate-200">{trainName || name}</span>
            </div>
            <div className="flex items-center justify-between gap-3 text-[9px] font-mono text-slate-400">
              <span className="text-emerald-400 font-semibold">{displaySpeed} km/h</span>
              <span>{Math.round(progressPercent)}% En Route</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
