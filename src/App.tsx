/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
import { 
  Station, 
  Corridor, 
  BuiltRoute, 
  OwnedTrain, 
  LiveryDesign, 
  RegionId, 
  EconomicShift,
  AppSettings,
} from './types';
import { 
  INITIAL_STATIONS, 
  INITIAL_CORRIDORS, 
  MANUFACTURERS, 
  TRAIN_CATALOG, 
  PRESET_LIVERIES, 
  INITIAL_WEATHER_CONDITIONS, 
  ECONOMIC_EVENTS_CATALOG 
} from './data/railwayData';
import { 
  formatCurrency, 
  generateInitialFinancialHistory, 
  recordDailyFinancialReport 
} from './game/simulation';
import { NetworkMap } from './components/NetworkMap';
import { StationDetailPanel } from './components/StationDetailPanel';
import { RoutePlannerModal } from './components/RoutePlannerModal';
import { TrainProcurement } from './components/TrainProcurement';
import { LiveryEditor } from './components/LiveryEditor';
import { WeatherEconomyDrawer } from './components/WeatherEconomyDrawer';
import { StationDirectoryModal } from './components/StationDirectoryModal';
import { SettingsModal } from './components/SettingsModal';
import { TutorialOverlay } from './components/TutorialOverlay';
import { HelpCenterModal } from './components/HelpCenterModal';
import { AdvancedRouteAnalysisModal } from './components/AdvancedRouteAnalysisModal';
import { 
  TutorialState, 
  loadTutorialState, 
  saveTutorialState, 
  getCurrentStep, 
  startChapter, 
  INITIAL_TUTORIAL_STATE 
} from './game/tutorialLogic';
import { AchievementCenterModal } from './components/AchievementCenterModal';
import { AchievementToast } from './components/AchievementToast';
import {
  Achievement,
  PlayerProgressionState,
  evaluateAchievements,
  claimAchievementReward,
  claimAllAchievementRewards,
  loadProgressionState,
  saveProgressionState,
  getUnclaimedCount,
  getDispatcherRank,
} from './game/achievements';
import { 
  loadSavedSettings, 
  saveSettings, 
  ACCENT_PALETTES, 
  playTacticalSound 
} from './utils/theme';

const GOOGLE_MAPS_API_KEY =
  (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) ||
  (typeof process !== 'undefined'
    ? process.env?.GOOGLE_MAPS_API_KEY || process.env?.VITE_GOOGLE_MAPS_API_KEY || ''
    : '') ||
  '';

export default function App() {
  // Application & Theme Settings
  const [settings, setSettings] = useState<AppSettings>(loadSavedSettings);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isHelpCenterOpen, setIsHelpCenterOpen] = useState<boolean>(false);
  const [tutorialState, setTutorialState] = useState<TutorialState>(loadTutorialState);
  const [analyzedRouteId, setAnalyzedRouteId] = useState<string | null>(null);
  const [showDensityOverlay, setShowDensityOverlay] = useState<boolean>(false);
  const [progression, setProgression] = useState<PlayerProgressionState>(loadProgressionState);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState<boolean>(false);
  const [toastAchievement, setToastAchievement] = useState<Achievement | null>(null);

  useEffect(() => {
    saveTutorialState(tutorialState);
  }, [tutorialState]);

  useEffect(() => {
    saveProgressionState(progression);
  }, [progression]);

  useEffect(() => {
    saveSettings(settings);
    if (settings.themeMode === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [settings]);

  const accent = ACCENT_PALETTES[settings.accentColor] || ACCENT_PALETTES.lime;
  const isDark = settings.themeMode === 'dark';

  // Google Maps Quota Handling
  const [quotaExceeded, setQuotaExceeded] = useState<boolean>(false);

  useEffect(() => {
    const handleQuota = () => setQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuota);
  }, []);

  // --- CORE GAME STATE ---
  const [stations, setStations] = useState<Station[]>(INITIAL_STATIONS);
  const [corridors] = useState<Corridor[]>(INITIAL_CORRIDORS);
  const [manufacturers] = useState(MANUFACTURERS);
  const [trainCatalog] = useState(TRAIN_CATALOG);

  // Starter Fleet matching screenshot setup (1 starter route, 2 trains)
  const [ownedTrains, setOwnedTrains] = useState<OwnedTrain[]>([
    {
      id: 'train-starter-1',
      modelId: 'vande-bharat-vb2',
      customName: 'Vande Bharat #01 (Pioneer)',
      assignedRouteId: 'route-delhi-varanasi',
      purchaseDay: 1,
      totalKmRun: 1518,
      conditionPercent: 98,
    },
    {
      id: 'train-starter-2',
      modelId: 'shinkansen-n700s',
      customName: 'Nozomi Supreme #01',
      assignedRouteId: undefined,
      purchaseDay: 1,
      totalKmRun: 0,
      conditionPercent: 100,
    },
  ]);

  // Starter Route (Delhi - Varanasi Vande Bharat, +0.13M/day net profit)
  const [builtRoutes, setBuiltRoutes] = useState<BuiltRoute[]>([
    {
      id: 'route-delhi-varanasi',
      name: 'Delhi - Varanasi Vande Bharat Express',
      corridorId: 'corr-del-bsb',
      stationAId: 'ndls',
      stationBId: 'bsb',
      trackType: 'express',
      trackName: 'Gangetic Mainline Express Track 1',
      assignedTrainIds: ['train-starter-1'],
      frequencyDaily: 8,
      departureSlots: [1, 2, 5, 8],
      ticketPrice: 95,
      distanceKm: 759,
      dailyPassengers: 6840,
      dailyRevenue: 245000,
      dailyCost: 115000,
      netProfit: 130000, // +$0.13M/day matching screenshot
      delayRatePercent: 4.2,
      status: 'active',
    },
  ]);

  // Player Financial Treasury & Time
  const [treasury, setTreasury] = useState<number>(28500000); // $28.5M starting capital
  const [day, setDay] = useState<number>(21); // Day 21
  const [hour, setHour] = useState<number>(14);
  const [simSpeed, setSimSpeed] = useState<0 | 1 | 2 | 5>(1);
  const [simTimeCounter, setSimTimeCounter] = useState<number>(0);

  // Active View Navigation
  const [activeTab, setActiveTab] = useState<'map' | 'fleet' | 'livery'>('map');
  const [selectedRegion, setSelectedRegion] = useState<RegionId>('all');
  const [selectedStationId, setSelectedStationId] = useState<string>('ndls'); // Delhi selected by default

  // Modals & Panels State
  const [isPlannerOpen, setIsPlannerOpen] = useState<boolean>(false);
  const [isLiveryEditorOpen, setIsLiveryEditorOpen] = useState<boolean>(false);
  const [targetTrainForLivery, setTargetTrainForLivery] = useState<string | undefined>(undefined);
  const [isWeatherDrawerOpen, setIsWeatherDrawerOpen] = useState<boolean>(false);
  const [isStationDirectoryOpen, setIsStationDirectoryOpen] = useState<boolean>(false);

  // Weather & Economy State
  const [weatherIndex, setWeatherIndex] = useState<number>(0);
  const activeWeather = INITIAL_WEATHER_CONDITIONS[weatherIndex] || INITIAL_WEATHER_CONDITIONS[0];
  const [economicShifts] = useState<EconomicShift[]>(ECONOMIC_EVENTS_CATALOG);
  const activeEconomicShift = economicShifts[0];

  // Company Livery Design
  const [currentLivery, setCurrentLivery] = useState<LiveryDesign>(PRESET_LIVERIES[0]);

  // Selected Station Object
  const selectedStation = useMemo(() => {
    return stations.find((s) => s.id === selectedStationId) || stations[0];
  }, [stations, selectedStationId]);

  // Selected Route Object for Advanced Route Analysis Modal
  const analyzedRoute = useMemo(() => {
    if (!analyzedRouteId) return null;
    return builtRoutes.find((r) => r.id === analyzedRouteId) || null;
  }, [analyzedRouteId, builtRoutes]);

  // Calculate Net Profit Per Day Across All Active Routes
  const totalNetPerDay = useMemo(() => {
    return builtRoutes.reduce((sum, route) => sum + route.netProfit, 0);
  }, [builtRoutes]);

  // 30-Day Daily Financial History for Recharts Performance Chart
  const [financialHistory, setFinancialHistory] = useState(() =>
    generateInitialFinancialHistory(21, 130000)
  );

  // Smooth Train Movement Animation Ticker (Fluid 10 FPS coordinate interpolation)
  useEffect(() => {
    if (simSpeed === 0) return;

    const animInterval = setInterval(() => {
      setSimTimeCounter((prev) => prev + 0.015 * simSpeed);
    }, 100);

    return () => clearInterval(animInterval);
  }, [simSpeed]);

  // Hourly Simulation Game Clock Hook
  useEffect(() => {
    if (simSpeed === 0) return;

    const intervalMs = 1200 / simSpeed;
    const interval = setInterval(() => {
      setHour((prevHour) => {
        if (prevHour >= 23) {
          // New day tick!
          setDay((prevDay) => {
            const nextDay = prevDay + 1;
            setTreasury((prevTreasury) => prevTreasury + totalNetPerDay);

            // Record into 30-day financial history
            const dayReport = {
              day: nextDay,
              ticketRevenue: Math.round(totalNetPerDay * 1.88 + 50000),
              operatingCosts: Math.round(totalNetPerDay * 0.4),
              trackMaintenance: Math.round(totalNetPerDay * 0.3),
              fleetMaintenance: Math.round(totalNetPerDay * 0.18),
              netProfit: totalNetPerDay,
              totalPassengersMoved: Math.round(totalNetPerDay / 19),
              onTimePerformance: Number((95 + Math.random() * 4).toFixed(1)),
            };
            setFinancialHistory((prevHist) => recordDailyFinancialReport(prevHist, dayReport));

            return nextDay;
          });
          return 0;
        }
        return prevHour + 1;
      });
    }, intervalMs);

    return () => clearInterval(interval);
  }, [simSpeed, totalNetPerDay]);

  // Handle Route Construction
  const handleConfirmBuildRoute = (newRoute: BuiltRoute, constructionCost: number) => {
    playTacticalSound('route', settings.audioFeedback);
    setTreasury((prev) => prev - constructionCost);
    setBuiltRoutes((prev) => [...prev, newRoute]);

    // Mark train as assigned
    if (newRoute.assignedTrainIds.length > 0) {
      const trainId = newRoute.assignedTrainIds[0];
      setOwnedTrains((prev) =>
        prev.map((t) => (t.id === trainId ? { ...t, assignedRouteId: newRoute.id } : t))
      );
    }

    // Mark destination station as owned
    setStations((prev) =>
      prev.map((s) => {
        if (s.id === newRoute.stationBId) {
          return { ...s, isOwned: true };
        }
        return s;
      })
    );

    setIsPlannerOpen(false);
  };

  // Handle Acquiring Station Rights
  const handleAcquireStation = (stationId: string) => {
    const target = stations.find((s) => s.id === stationId);
    if (!target || target.isOwned || treasury < target.acquisitionCost) return;

    playTacticalSound('confirm', settings.audioFeedback);
    setTreasury((prev) => prev - target.acquisitionCost);
    setStations((prev) =>
      prev.map((s) => (s.id === stationId ? { ...s, isOwned: true } : s))
    );
  };

  // Handle Buying a Train
  const handleBuyTrain = (modelId: string, customName: string) => {
    const model = trainCatalog.find((m) => m.id === modelId);
    if (!model || treasury < model.purchasePrice) return;

    playTacticalSound('confirm', settings.audioFeedback);
    setTreasury((prev) => prev - model.purchasePrice);
    const newTrain: OwnedTrain = {
      id: `train-${Date.now()}`,
      modelId: model.id,
      customName,
      assignedRouteId: undefined,
      purchaseDay: day,
      totalKmRun: 0,
      conditionPercent: 100,
    };
    setOwnedTrains((prev) => [...prev, newTrain]);
  };

  // Handle Train Overhaul
  const handleMaintainTrain = (trainId: string, cost: number) => {
    if (treasury < cost) return;
    playTacticalSound('click', settings.audioFeedback);
    setTreasury((prev) => prev - cost);
    setOwnedTrains((prev) =>
      prev.map((t) => (t.id === trainId ? { ...t, conditionPercent: 100 } : t))
    );
  };

  // Handle Saving Livery
  const handleSaveLivery = (newLivery: LiveryDesign, targetTrainId?: string) => {
    playTacticalSound('confirm', settings.audioFeedback);
    setCurrentLivery(newLivery);
    if (targetTrainId) {
      setOwnedTrains((prev) =>
        prev.map((t) => (t.id === targetTrainId ? { ...t, customLiveryId: newLivery.id } : t))
      );
    }
  };

  // Next Weather Event Cycle
  const handleNextWeatherEvent = () => {
    setWeatherIndex((prev) => (prev + 1) % INITIAL_WEATHER_CONDITIONS.length);
  };

  // Reset Game Simulation
  const handleResetGame = () => {
    setStations(INITIAL_STATIONS);
    setOwnedTrains([
      {
        id: 'train-starter-1',
        modelId: 'vande-bharat-vb2',
        customName: 'Vande Bharat #01 (Pioneer)',
        assignedRouteId: 'route-delhi-varanasi',
        purchaseDay: 1,
        totalKmRun: 1518,
        conditionPercent: 98,
      },
    ]);
    setBuiltRoutes([
      {
        id: 'route-delhi-varanasi',
        name: 'Delhi - Varanasi Vande Bharat Express',
        corridorId: 'corr-del-bsb',
        stationAId: 'ndls',
        stationBId: 'bsb',
        trackType: 'express',
        trackName: 'Gangetic Mainline Express Track 1',
        assignedTrainIds: ['train-starter-1'],
        frequencyDaily: 8,
        departureSlots: [1, 2, 5, 8],
        ticketPrice: 95,
        distanceKm: 759,
        dailyPassengers: 6840,
        dailyRevenue: 245000,
        dailyCost: 115000,
        netProfit: 130000,
        delayRatePercent: 4.2,
        status: 'active',
      },
    ]);
    setTreasury(28500000);
    setDay(1);
    setHour(8);
    setSelectedStationId('ndls');
    setFinancialHistory(generateInitialFinancialHistory(1, 130000));
  };

  // Interactive Tutorial Action Handlers
  const handleSelectStation = (id: string) => {
    playTacticalSound('click', settings.audioFeedback);
    setSelectedStationId(id);
    const step = getCurrentStep(tutorialState);
    if (tutorialState.isActive && step.actionRequired === 'select_station') {
      setTutorialState((prev) => ({ ...prev, isActionCompleted: true }));
      playTacticalSound('confirm', settings.audioFeedback);
    }
  };

  // Periodic & Event-Driven Achievements Evaluation
  useEffect(() => {
    const gameState = {
      ownedTrains,
      trainCatalog,
      builtRoutes,
      stations,
      treasury,
      totalNetPerDay,
    };
    const { updatedRecords, newlyUnlocked } = evaluateAchievements(gameState, progression.unlockedRecords);

    // Detect if newly unlocked or state changed
    let hasChanges = false;
    for (const key of Object.keys(updatedRecords)) {
      if (
        !progression.unlockedRecords[key] ||
        progression.unlockedRecords[key].unlocked !== updatedRecords[key].unlocked
      ) {
        hasChanges = true;
        break;
      }
    }

    if (hasChanges) {
      setProgression((prev) => ({
        ...prev,
        unlockedRecords: updatedRecords,
      }));
      if (newlyUnlocked.length > 0) {
        setToastAchievement(newlyUnlocked[0]);
        playTacticalSound('confirm', settings.audioFeedback);
      }
    }
  }, [
    ownedTrains,
    trainCatalog,
    builtRoutes,
    stations,
    treasury,
    totalNetPerDay,
    progression.unlockedRecords,
    settings.audioFeedback,
  ]);

  const handleClaimAchievementReward = (achievementId: string) => {
    const result = claimAchievementReward(achievementId, progression);
    if (result.cashReward > 0) {
      setTreasury((prev) => prev + result.cashReward);
      setProgression(result.updatedProgression);
      playTacticalSound('confirm', settings.audioFeedback);
    }
  };

  const handleClaimAllAchievements = () => {
    const result = claimAllAchievementRewards(progression);
    if (result.totalCashReward > 0) {
      setTreasury((prev) => prev + result.totalCashReward);
      setProgression(result.updatedProgression);
      playTacticalSound('confirm', settings.audioFeedback);
    }
  };

  const handleSwitchTab = (tab: 'map' | 'fleet') => {
    playTacticalSound('click', settings.audioFeedback);
    setActiveTab(tab);
    const step = getCurrentStep(tutorialState);
    if (tutorialState.isActive && tab === 'fleet' && step.actionRequired === 'open_fleet_tab') {
      setTutorialState((prev) => ({ ...prev, isActionCompleted: true }));
      playTacticalSound('confirm', settings.audioFeedback);
    }
  };

  const handleOpenPlanner = () => {
    setIsPlannerOpen(true);
    const step = getCurrentStep(tutorialState);
    if (tutorialState.isActive && step.actionRequired === 'open_planner') {
      setTutorialState((prev) => ({ ...prev, isActionCompleted: true }));
      playTacticalSound('confirm', settings.audioFeedback);
    }
  };

  const handleStationPanelTabChange = (tab: 'station' | 'finance') => {
    const step = getCurrentStep(tutorialState);
    if (tutorialState.isActive && tab === 'finance' && step.actionRequired === 'view_finances') {
      setTutorialState((prev) => ({ ...prev, isActionCompleted: true }));
      playTacticalSound('confirm', settings.audioFeedback);
    }
  };

  const handleReplayTutorialChapter = (chapterId: number) => {
    setTutorialState((prev) => startChapter(prev, chapterId));
  };

  const handleRestartTutorial = () => {
    setTutorialState({
      ...INITIAL_TUTORIAL_STATE,
      isActive: true,
      isMinimized: false,
      currentChapterId: 1,
      currentStepIndex: 0,
      completedChapterIds: [],
    });
  };

  return (
    <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
      <div className={`w-screen h-screen flex flex-col ${
        isDark ? 'bg-[#0b1014] text-slate-100' : 'bg-slate-100 text-slate-900'
      } font-sans overflow-hidden select-none`}>
        {/* Google Maps Quota Banner if exceeded */}
        {quotaExceeded && (
          <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
            <span>
              Google Maps Platform quota reached. If you are the app owner, visit{' '}
              <a
                href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-semibold text-amber-950 hover:text-amber-800"
              >
                maps developer site
              </a>{' '}
              for instructions to update your account.
            </span>
          </div>
        )}

        {/* Top Tactical Navigation & Control Bar */}
        <header className={`h-16 px-6 border-b flex items-center justify-between gap-6 shrink-0 z-30 ${
          isDark ? 'bg-[#0e141a] border-[#1b252f]' : 'bg-white border-slate-300 shadow-sm'
        }`}>
          {/* Left Zone: Title Lockup & Regional Header */}
          <div data-tutorial="header-brand" className="flex items-center gap-6 shrink-0">
            <div className="whitespace-nowrap shrink-0">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg tracking-wider font-mono" style={{ color: accent.hex }}>
                  TRACKLINE SIM
                </span>
                <span className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border font-semibold ${
                  isDark ? 'border-slate-700 bg-slate-800/80 text-slate-300' : 'border-slate-300 bg-slate-100 text-slate-700'
                }`}>
                  DISPATCH
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                <span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                  {selectedRegion === 'world' ? 'Global Network' : 'Asian Rail Network'}
                </span>
                <span>·</span>
                <span className="hidden sm:inline text-[11px] text-slate-400">Corridors & Stations</span>
              </div>
            </div>

            {/* Region Tabs */}
            <div className={`hidden xl:flex items-center gap-1 p-1 rounded border ${
              isDark ? 'bg-[#141c23] border-[#22303d]' : 'bg-slate-100 border-slate-300'
            }`}>
              {[
                { id: 'all', label: 'ALL NETWORK' },
                { id: 'south_asia', label: 'SOUTH ASIA' },
                { id: 'china', label: 'CHINA' },
                { id: 'east_asia', label: 'EAST ASIA' },
                { id: 'southeast_asia', label: 'SOUTHEAST ASIA' },
                { id: 'world', label: 'EXPAND TO WORLD' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    playTacticalSound('click', settings.audioFeedback);
                    setSelectedRegion(tab.id as RegionId);
                  }}
                  className={`px-3 py-1 text-[11px] font-mono font-bold tracking-wider rounded transition-colors cursor-pointer ${
                    selectedRegion === tab.id
                      ? isDark 
                        ? 'bg-[#1e2a36] shadow-sm' 
                        : 'bg-white shadow-sm text-slate-900'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  style={selectedRegion === tab.id ? { color: accent.hex, borderColor: `${accent.hex}40` } : {}}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Center / Right Zone: View Switcher Tabs + Settings Button + Clock */}
          <div data-tutorial="header-controls" className="flex items-center gap-3">
            {/* Main App Navigation Tabs */}
            <div className={`flex items-center gap-1 p-1 rounded border ${
              isDark ? 'bg-[#141c23] border-[#22303d]' : 'bg-slate-100 border-slate-300'
            }`}>
              <button
                onClick={() => handleSwitchTab('map')}
                className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors cursor-pointer ${
                  activeTab === 'map' ? 'text-[#0d1318] font-bold' : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
                style={activeTab === 'map' ? { backgroundColor: accent.hex } : {}}
              >
                Network Radar
              </button>
              <button
                data-tutorial="tab-fleet"
                onClick={() => handleSwitchTab('fleet')}
                className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors cursor-pointer ${
                  activeTab === 'fleet' ? 'text-[#0d1318] font-bold' : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
                style={activeTab === 'fleet' ? { backgroundColor: accent.hex } : {}}
              >
                Train Procurement ({ownedTrains.length})
              </button>
              <button
                onClick={() => {
                  playTacticalSound('click', settings.audioFeedback);
                  setIsLiveryEditorOpen(true);
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors cursor-pointer flex items-center gap-1.5 ${
                  isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Livery Studio</span>
                <span>🎨</span>
              </button>
            </div>

            {/* Dynamic Weather & Economy Status Button */}
            <button
              onClick={() => {
                playTacticalSound('click', settings.audioFeedback);
                setIsWeatherDrawerOpen(true);
              }}
              className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono border transition-colors cursor-pointer ${
                isDark ? 'bg-[#141c23] hover:bg-[#1a2530] border-[#22303d]' : 'bg-slate-100 hover:bg-slate-200 border-slate-300'
              }`}
            >
              <span>{activeWeather.type === 'clear' ? '☀️' : activeWeather.type === 'monsoon' ? '🌧️' : '🌀'}</span>
              <span className={`truncate max-w-[130px] ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {activeWeather.title}
              </span>
            </button>

            {/* Simulation Clock & Speed Controls */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded border font-mono text-xs ${
              isDark ? 'bg-[#141c23] border-[#22303d]' : 'bg-slate-100 border-slate-300'
            }`}>
              <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {String(hour).padStart(2, '0')}:00
              </span>

              <div className="flex items-center gap-1 ml-1 pl-2 border-l border-slate-700">
                <button
                  onClick={() => setSimSpeed(simSpeed === 0 ? 1 : 0)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                    simSpeed === 0 ? 'bg-amber-500 text-black' : 'text-slate-400 hover:text-white'
                  }`}
                  title={simSpeed === 0 ? 'Resume' : 'Pause'}
                >
                  {simSpeed === 0 ? 'PAUSED' : '⏸'}
                </button>
                <button
                  onClick={() => setSimSpeed(1)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                    simSpeed === 1 ? 'text-black' : 'text-slate-400 hover:text-white'
                  }`}
                  style={simSpeed === 1 ? { backgroundColor: accent.hex } : {}}
                >
                  1x
                </button>
                <button
                  onClick={() => setSimSpeed(2)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                    simSpeed === 2 ? 'text-black' : 'text-slate-400 hover:text-white'
                  }`}
                  style={simSpeed === 2 ? { backgroundColor: accent.hex } : {}}
                >
                  2x
                </button>
                <button
                  onClick={() => setSimSpeed(5)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                    simSpeed === 5 ? 'text-black' : 'text-slate-400 hover:text-white'
                  }`}
                  style={simSpeed === 5 ? { backgroundColor: accent.hex } : {}}
                >
                  5x
                </button>
              </div>
            </div>

            {/* Achievements & Progression Center Button */}
            <button
              type="button"
              data-tutorial="header-achievements"
              onClick={() => {
                playTacticalSound('click', settings.audioFeedback);
                setIsAchievementsOpen(true);
              }}
              className={`px-2.5 py-1.5 rounded border transition-colors cursor-pointer flex items-center gap-1.5 relative ${
                isDark 
                  ? 'bg-[#141c23] hover:bg-[#1a2530] border-[#22303d] text-slate-300 hover:text-white' 
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700 hover:text-slate-900'
              }`}
              title={`Dispatcher Achievements & Career Ranks (${getDispatcherRank(progression.prestigePoints).title})`}
            >
              <span className="text-sm">🏆</span>
              <span className="text-xs font-mono font-bold hidden sm:inline">Achievements</span>
              {getUnclaimedCount(progression.unlockedRecords) > 0 && (
                <span
                  className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-extrabold animate-pulse shadow-sm"
                  style={{ backgroundColor: accent.hex, color: '#0b1014' }}
                >
                  {getUnclaimedCount(progression.unlockedRecords)}
                </span>
              )}
            </button>

            {/* Help Centre & Operating Manual Button */}
            <button
              type="button"
              onClick={() => {
                playTacticalSound('click', settings.audioFeedback);
                setIsHelpCenterOpen(true);
              }}
              className={`p-2 rounded border transition-colors cursor-pointer flex items-center justify-center ${
                isDark 
                  ? 'bg-[#141c23] hover:bg-[#1a2530] border-[#22303d] text-slate-300 hover:text-white' 
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700 hover:text-slate-900'
              }`}
              title="Dispatcher Knowledge Base & Tutorial Replay (?)"
            >
              <span className="text-xs font-mono font-bold leading-none px-0.5">?</span>
            </button>

            {/* Dedicated Settings Button */}
            <button
              type="button"
              onClick={() => {
                playTacticalSound('click', settings.audioFeedback);
                setIsSettingsOpen(true);
              }}
              className={`p-2 rounded border transition-colors cursor-pointer flex items-center justify-center ${
                isDark 
                  ? 'bg-[#141c23] hover:bg-[#1a2530] border-[#22303d] text-slate-300 hover:text-white' 
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700 hover:text-slate-900'
              }`}
              title="Settings & Display Theme"
            >
              <span className="text-base leading-none">⚙️</span>
            </button>
          </div>
        </header>

        {/* Main View Area */}
        <main className="flex-1 flex overflow-hidden relative">
          {activeTab === 'map' ? (
            <>
              {/* Left & Center: Full Geographic Tactical Network Map */}
              <div data-tutorial="map-canvas" className="flex-1 relative h-full flex flex-col">
                {/* Regional instruction badge */}
                <div className="absolute top-4 right-6 z-20 hidden sm:block">
                  <span 
                    className="px-3 py-1.5 rounded text-xs font-mono border backdrop-blur-sm shadow-md"
                    style={{
                      backgroundColor: isDark ? 'rgba(14, 20, 26, 0.92)' : 'rgba(255, 255, 255, 0.92)',
                      borderColor: `${accent.hex}40`,
                      color: accent.hex,
                    }}
                  >
                    Click a station to inspect or acquire it
                  </span>
                </div>

                {/* Tactical Network Map Canvas with Real Geographic Routes & Zoom-Aware Labels */}
                <NetworkMap
                  stations={stations}
                  corridors={corridors}
                  builtRoutes={builtRoutes}
                  selectedStationId={selectedStationId}
                  onSelectStation={handleSelectStation}
                  selectedRegion={selectedRegion}
                  simTime={simTimeCounter}
                  themeMode={settings.themeMode}
                  accentColor={settings.accentColor}
                  showReferenceCorridors={settings.showReferenceCorridors}
                  showDensityOverlay={showDensityOverlay}
                  onToggleDensityOverlay={setShowDensityOverlay}
                  onSelectRoute={(routeId) => setAnalyzedRouteId(routeId)}
                />
              </div>

              {/* Right: Station Detail & Network Overview Sidebar */}
              <StationDetailPanel
                station={selectedStation}
                allStations={stations}
                corridors={corridors}
                builtRoutes={builtRoutes}
                day={day}
                netPerDay={totalNetPerDay}
                treasury={treasury}
                onOpenPlanner={handleOpenPlanner}
                onAcquireStation={handleAcquireStation}
                onOpenStationDirectory={() => setIsStationDirectoryOpen(true)}
                themeMode={settings.themeMode}
                accentColor={settings.accentColor}
                financialHistory={financialHistory}
                onTabChange={handleStationPanelTabChange}
                onAnalyzeRoute={(routeId) => setAnalyzedRouteId(routeId)}
              />
            </>
          ) : (
            /* Train Procurement & Fleet Management View */
            <TrainProcurement
              manufacturers={manufacturers}
              trainCatalog={trainCatalog}
              ownedTrains={ownedTrains}
              builtRoutes={builtRoutes}
              treasury={treasury}
              onBuyTrain={handleBuyTrain}
              onMaintainTrain={handleMaintainTrain}
              onOpenLiveryEditor={(trainId) => {
                setTargetTrainForLivery(trainId);
                setIsLiveryEditorOpen(true);
              }}
            />
          )}
        </main>

        {/* Route Construction & Timetable Planner Modal */}
        {isPlannerOpen && selectedStation && (
          <RoutePlannerModal
            originStation={selectedStation}
            allStations={stations}
            corridors={corridors}
            ownedTrains={ownedTrains}
            trainCatalog={trainCatalog}
            treasury={treasury}
            activeWeather={activeWeather}
            activeEconomicShift={activeEconomicShift}
            onClose={() => setIsPlannerOpen(false)}
            onConfirmBuildRoute={handleConfirmBuildRoute}
          />
        )}

        {/* Train Livery Studio Modal */}
        {isLiveryEditorOpen && (
          <LiveryEditor
            currentLivery={currentLivery}
            ownedTrains={ownedTrains}
            trainCatalog={trainCatalog}
            targetTrainId={targetTrainForLivery}
            onSaveLivery={handleSaveLivery}
            onClose={() => {
              setIsLiveryEditorOpen(false);
              setTargetTrainForLivery(undefined);
            }}
          />
        )}

        {/* Weather & Macroeconomics Drawer */}
        <WeatherEconomyDrawer
          weather={activeWeather}
          economicShifts={economicShifts}
          isOpen={isWeatherDrawerOpen}
          onClose={() => setIsWeatherDrawerOpen(false)}
          onNextWeatherEvent={handleNextWeatherEvent}
        />

        {/* Station Directory Browser */}
        {isStationDirectoryOpen && (
          <StationDirectoryModal
            stations={stations}
            treasury={treasury}
            onSelectStation={(id) => {
              playTacticalSound('click', settings.audioFeedback);
              setSelectedStationId(id);
              setActiveTab('map');
            }}
            onAcquireStation={handleAcquireStation}
            onClose={() => setIsStationDirectoryOpen(false)}
          />
        )}

        {/* Application Settings Modal (Dark/Light mode & Accent colors) */}
        {isSettingsOpen && (
          <SettingsModal
            settings={settings}
            onUpdateSettings={(updated) => {
              setSettings((prev) => ({ ...prev, ...updated }));
            }}
            onClose={() => setIsSettingsOpen(false)}
            onResetGame={handleResetGame}
            tutorialState={tutorialState}
            onReplayTutorialChapter={handleReplayTutorialChapter}
            onRestartTutorial={handleRestartTutorial}
            onOpenHelpCenter={() => setIsHelpCenterOpen(true)}
          />
        )}

        {/* Dispatcher Help Centre & Knowledge Base Modal */}
        <HelpCenterModal
          isOpen={isHelpCenterOpen}
          onClose={() => setIsHelpCenterOpen(false)}
          tutorialState={tutorialState}
          onReplayChapter={handleReplayTutorialChapter}
          onRestartFullTutorial={handleRestartTutorial}
          themeMode={settings.themeMode}
          accentColor={settings.accentColor}
          audioFeedback={settings.audioFeedback}
        />

        {/* Advanced Route Performance & Cost Analysis Modal */}
        {analyzedRoute && (
          <AdvancedRouteAnalysisModal
            route={analyzedRoute}
            allRoutes={builtRoutes}
            allStations={stations}
            allCorridors={corridors}
            assignedTrains={analyzedRoute.assignedTrainIds.map((tid) => {
              const t = ownedTrains.find((ot) => ot.id === tid);
              const m = trainCatalog.find((tc) => tc.id === t?.modelId);
              return { train: t!, model: m! };
            }).filter((item) => item.train && item.model)}
            currentDay={day}
            onClose={() => setAnalyzedRouteId(null)}
            onSelectRoute={(routeId) => setAnalyzedRouteId(routeId)}
            themeMode={settings.themeMode}
            accentColor={settings.accentColor}
            audioFeedback={settings.audioFeedback}
          />
        )}

        {/* Interactive First-Time Player Tutorial Overlay */}
        <TutorialOverlay
          tutorialState={tutorialState}
          onUpdateTutorialState={setTutorialState}
          themeMode={settings.themeMode}
          accentColor={settings.accentColor}
          audioFeedback={settings.audioFeedback}
          onOpenHelpCenter={() => setIsHelpCenterOpen(true)}
        />

        {/* Dispatcher Achievement Centre Modal */}
        <AchievementCenterModal
          isOpen={isAchievementsOpen}
          onClose={() => setIsAchievementsOpen(false)}
          gameState={{
            ownedTrains,
            trainCatalog,
            builtRoutes,
            stations,
            treasury,
            totalNetPerDay,
          }}
          progression={progression}
          onClaimReward={handleClaimAchievementReward}
          onClaimAll={handleClaimAllAchievements}
          themeMode={settings.themeMode}
          accentColor={settings.accentColor}
          audioFeedback={settings.audioFeedback}
        />

        {/* Achievement Toast Banner */}
        <AchievementToast
          achievement={toastAchievement}
          onClose={() => setToastAchievement(null)}
          onOpenCenter={() => {
            setToastAchievement(null);
            setIsAchievementsOpen(true);
          }}
          themeMode={settings.themeMode}
          accentColor={settings.accentColor}
        />
      </div>
    </APIProvider>
  );
}
