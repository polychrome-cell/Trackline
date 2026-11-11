import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  TutorialState,
  TUTORIAL_CHAPTERS,
  getCurrentStep,
  calculateTutorialProgress,
  advanceTutorial,
  previousTutorial,
  startChapter,
} from '../game/tutorialLogic';
import { ThemeMode, AccentColor } from '../types';
import { ACCENT_PALETTES, playTacticalSound } from '../utils/theme';

interface TutorialOverlayProps {
  tutorialState: TutorialState;
  onUpdateTutorialState: (updater: (prev: TutorialState) => TutorialState) => void;
  themeMode?: ThemeMode;
  accentColor?: AccentColor;
  audioFeedback?: boolean;
  onOpenHelpCenter?: () => void;
}

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({
  tutorialState,
  onUpdateTutorialState,
  themeMode = 'dark',
  accentColor = 'lime',
  audioFeedback = true,
  onOpenHelpCenter,
}) => {
  const isDark = themeMode === 'dark';
  const accent = ACCENT_PALETTES[accentColor] || ACCENT_PALETTES.lime;
  const currentStep = getCurrentStep(tutorialState);
  const progress = calculateTutorialProgress(tutorialState);
  const currentChapter = TUTORIAL_CHAPTERS.find((c) => c.id === currentStep.chapterId) || TUTORIAL_CHAPTERS[0];

  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardPosition, setCardPosition] = useState<{ top: number; left: number }>({ top: 120, left: 30 });

  // Update target bounding box dynamically on window resize or step change
  const updateTargetRect = useCallback(() => {
    if (!tutorialState.isActive || tutorialState.isMinimized) {
      setTargetRect(null);
      return;
    }

    if (!currentStep.targetSelector) {
      setTargetRect(null);
      return;
    }

    const elem = document.querySelector(currentStep.targetSelector);
    if (elem) {
      const rect = elem.getBoundingClientRect();
      // Only set if element is visible and has dimensions
      if (rect.width > 0 && rect.height > 0) {
        setTargetRect({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        });

        // Compute ideal floating card position
        const padding = 16;
        const cardWidth = 380;
        const cardHeight = 260;
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        let top = rect.bottom + padding;
        let left = rect.left;

        if (currentStep.preferredPosition === 'bottom') {
          top = rect.bottom + padding;
          left = Math.min(Math.max(padding, rect.left + rect.width / 2 - cardWidth / 2), windowWidth - cardWidth - padding);
        } else if (currentStep.preferredPosition === 'top') {
          top = Math.max(padding, rect.top - cardHeight - padding);
          left = Math.min(Math.max(padding, rect.left + rect.width / 2 - cardWidth / 2), windowWidth - cardWidth - padding);
        } else if (currentStep.preferredPosition === 'left') {
          top = Math.min(Math.max(padding, rect.top), windowHeight - cardHeight - padding);
          left = Math.max(padding, rect.left - cardWidth - padding);
        } else if (currentStep.preferredPosition === 'right') {
          top = Math.min(Math.max(padding, rect.top), windowHeight - cardHeight - padding);
          left = Math.min(rect.right + padding, windowWidth - cardWidth - padding);
        } else {
          // Center preference
          top = Math.max(padding, windowHeight / 2 - cardHeight / 2);
          left = Math.max(padding, windowWidth / 2 - cardWidth / 2);
        }

        // Clamp to screen boundaries
        top = Math.max(padding, Math.min(top, windowHeight - cardHeight - padding));
        left = Math.max(padding, Math.min(left, windowWidth - cardWidth - padding));

        setCardPosition({ top, left });
        return;
      }
    }

    // Fallback: floating in upper left center
    setTargetRect(null);
    setCardPosition({ top: 90, left: 24 });
  }, [tutorialState.isActive, tutorialState.isMinimized, currentStep]);

  useEffect(() => {
    updateTargetRect();
    const handleResize = () => updateTargetRect();
    const handleScroll = () => updateTargetRect();
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, true);

    const interval = setInterval(updateTargetRect, 600);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll, true);
      clearInterval(interval);
    };
  }, [updateTargetRect]);

  const handleNext = () => {
    playTacticalSound('click', audioFeedback);
    onUpdateTutorialState((prev) => advanceTutorial(prev));
  };

  const handlePrevious = () => {
    playTacticalSound('click', audioFeedback);
    onUpdateTutorialState((prev) => previousTutorial(prev));
  };

  const handleSkip = () => {
    playTacticalSound('click', audioFeedback);
    onUpdateTutorialState((prev) => ({
      ...prev,
      isActive: false,
    }));
  };

  const handleToggleMinimize = () => {
    playTacticalSound('click', audioFeedback);
    onUpdateTutorialState((prev) => ({
      ...prev,
      isMinimized: !prev.isMinimized,
    }));
  };

  if (!tutorialState.isActive) {
    return null;
  }

  // Minimized floating launcher widget
  if (tutorialState.isMinimized) {
    return (
      <div className="fixed bottom-4 left-4 z-50 animate-in fade-in duration-200">
        <button
          type="button"
          onClick={handleToggleMinimize}
          className={`flex items-center gap-2.5 px-3.5 py-2 rounded-lg border shadow-xl backdrop-blur-md cursor-pointer transition-all hover:scale-105 ${
            isDark ? 'bg-[#0f1720]/95 border-[#22303d] text-white' : 'bg-white/95 border-slate-300 text-slate-900'
          }`}
          style={{ borderColor: accent.hex }}
        >
          <span
            className="w-2.5 h-2.5 rounded-full animate-ping"
            style={{ backgroundColor: accent.hex }}
          />
          <div className="text-left font-mono">
            <div className="text-[9px] uppercase tracking-wider text-slate-400">Tutorial in Progress</div>
            <div className="text-xs font-bold flex items-center gap-1.5">
              <span>Ch. {currentStep.chapterId}: {currentChapter.title}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded" style={{ backgroundColor: `${accent.hex}25`, color: accent.hex }}>
                {progress.percent}%
              </span>
            </div>
          </div>
          <span className="text-xs text-slate-400 ml-1">↗</span>
        </button>
      </div>
    );
  }

  const isFirstStep = currentStep.chapterId === 1 && currentStep.stepIndex === 0;
  const isLastStep = progress.currentStepOverall === progress.totalStepsOverall;

  return (
    <div className="fixed inset-0 z-40 pointer-events-none select-none">
      {/* Dimmed Background Overlay */}
      <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px] transition-opacity duration-300 pointer-events-auto" />

      {/* Target Element Spotlight Cutout & Glowing Halo */}
      {targetRect && (
        <div
          className="absolute transition-all duration-300 pointer-events-none z-45"
          style={{
            top: targetRect.top - 6,
            left: targetRect.left - 6,
            width: targetRect.width + 12,
            height: targetRect.height + 12,
          }}
        >
          {/* Glowing Border Box */}
          <div
            className="w-full h-full rounded-lg border-2 animate-pulse"
            style={{
              borderColor: accent.hex,
              boxShadow: `0 0 20px ${accent.hex}80, inset 0 0 12px ${accent.hex}30`,
            }}
          />

          {/* Tactical Target Reticle Corners */}
          <div className="absolute -top-1.5 -left-1.5 w-3 h-3 border-t-2 border-l-2" style={{ borderColor: accent.hex }} />
          <div className="absolute -top-1.5 -right-1.5 w-3 h-3 border-t-2 border-r-2" style={{ borderColor: accent.hex }} />
          <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 border-b-2 border-l-2" style={{ borderColor: accent.hex }} />
          <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 border-b-2 border-r-2" style={{ borderColor: accent.hex }} />
        </div>
      )}

      {/* Floating Tactical Instruction Card */}
      <div
        ref={cardRef}
        className={`absolute z-50 pointer-events-auto w-[360px] sm:w-[400px] rounded-lg border shadow-2xl transition-all duration-300 ${
          isDark ? 'bg-[#0e1620] border-[#22313f] text-slate-100' : 'bg-white border-slate-300 text-slate-900 shadow-xl'
        }`}
        style={{
          top: cardPosition.top,
          left: cardPosition.left,
        }}
      >
        {/* Card Header with Progress Bar */}
        <div
          className={`px-4 py-3 border-b flex items-center justify-between ${
            isDark ? 'bg-[#090f15] border-[#1b2632]' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <span
              className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded tracking-wider"
              style={{
                backgroundColor: `${accent.hex}25`,
                color: accent.hex,
                border: `1px solid ${accent.hex}50`,
              }}
            >
              Chapter {currentStep.chapterId} of 7
            </span>
            <span className="text-xs font-mono text-slate-400">
              {progress.currentStepOverall}/{progress.totalStepsOverall}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Minimize button */}
            <button
              type="button"
              onClick={handleToggleMinimize}
              className={`p-1 rounded text-xs transition-colors cursor-pointer ${
                isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
              }`}
              title="Minimize to corner"
            >
              −
            </button>
            {/* Close / Skip button */}
            <button
              type="button"
              onClick={handleSkip}
              className={`p-1 rounded text-xs transition-colors cursor-pointer ${
                isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
              }`}
              title="Close Tutorial (Can be resumed anytime from Settings)"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Step Progress Bar */}
        <div className="w-full h-1 bg-slate-800">
          <div
            className="h-full transition-all duration-300"
            style={{ width: `${progress.percent}%`, backgroundColor: accent.hex }}
          />
        </div>

        {/* Card Body */}
        <div className="p-4 space-y-3">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
              {currentChapter.subtitle}
            </div>
            <h3 className={`text-base font-bold tracking-tight mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {currentStep.title}
            </h3>
          </div>

          <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
            {currentStep.instruction}
          </p>

          {currentStep.details && (
            <p className={`text-[11px] leading-relaxed p-2.5 rounded border ${
              isDark ? 'bg-[#0a1017] border-[#18232e] text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}>
              💡 <span className="font-medium">{currentStep.details}</span>
            </p>
          )}

          {/* Interactive Action Prompt Banner */}
          {currentStep.actionRequired && currentStep.actionRequired !== 'none' && (
            <div
              className={`p-2.5 rounded border flex items-center justify-between text-xs font-mono transition-all ${
                tutorialState.isActionCompleted
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                  : 'bg-amber-500/15 border-amber-500/40 text-amber-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">
                  {tutorialState.isActionCompleted ? '✓' : '⚡'}
                </span>
                <span className="text-[11px]">
                  {tutorialState.isActionCompleted
                    ? 'Action completed! Ready to advance.'
                    : currentStep.actionPrompt || 'Complete required action on screen'}
                </span>
              </div>
              {tutorialState.isActionCompleted && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  DONE
                </span>
              )}
            </div>
          )}
        </div>

        {/* Card Footer Controls */}
        <div
          className={`px-4 py-3 border-t flex items-center justify-between gap-3 ${
            isDark ? 'bg-[#090f15] border-[#1b2632]' : 'bg-slate-50 border-slate-200'
          }`}
        >
          {/* Left Action: Skip Tutorial / Open Help */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSkip}
              className="text-[11px] font-mono text-slate-400 hover:text-white transition-colors cursor-pointer underline"
            >
              Skip
            </button>
            {onOpenHelpCenter && (
              <>
                <span className="text-slate-600">·</span>
                <button
                  type="button"
                  onClick={onOpenHelpCenter}
                  className="text-[11px] font-mono text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Help Manual
                </button>
              </>
            )}
          </div>

          {/* Right Actions: Back and Next / Finish */}
          <div className="flex items-center gap-2">
            {!isFirstStep && (
              <button
                type="button"
                onClick={handlePrevious}
                className={`px-3 py-1.5 text-xs font-mono font-semibold rounded border transition-colors cursor-pointer ${
                  isDark ? 'bg-[#141d26] border-[#22303d] text-slate-300 hover:text-white' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                ← Back
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="px-4 py-1.5 text-xs font-mono font-bold rounded shadow-md transition-all cursor-pointer text-slate-900"
              style={{
                backgroundColor: accent.hex,
              }}
            >
              {isLastStep ? 'Finish & Dispatch →' : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
