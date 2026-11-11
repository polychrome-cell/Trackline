/**
 * Pure logic and state management for the Trackline Sim interactive tutorial.
 */

export interface TutorialStep {
  chapterId: number;
  chapterTitle: string;
  stepIndex: number;
  totalStepsInChapter: number;
  title: string;
  instruction: string;
  details?: string;
  targetSelector?: string; // CSS selector of element to highlight
  preferredPosition?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  actionRequired?: 'select_station' | 'open_fleet_tab' | 'open_planner' | 'view_finances' | 'none';
  actionPrompt?: string;
}

export interface TutorialState {
  isActive: boolean;
  isMinimized: boolean;
  currentChapterId: number;
  currentStepIndex: number;
  completedChapterIds: number[];
  hasSeenWelcome: boolean;
  isActionCompleted: boolean;
}

export const TUTORIAL_CHAPTERS: { id: number; title: string; subtitle: string; summary: string }[] = [
  {
    id: 1,
    title: 'Welcome to Trackline Sim',
    subtitle: 'Command Center & Network Mission',
    summary: 'Introduction to railway dispatch operations, international corridors, and executive goals across Asia and beyond.',
  },
  {
    id: 2,
    title: 'The Tactical Map',
    subtitle: 'Navigating Corridors & Stations',
    summary: 'Learn to pan, zoom, inspect terminal hubs, and identify owned vs available franchise stations.',
  },
  {
    id: 3,
    title: 'Purchasing Trains',
    subtitle: 'Global Manufacturers & Rolling Stock',
    summary: 'Explore the rolling stock marketplace, compare speeds and capacities, and acquire train units for your depot.',
  },
  {
    id: 4,
    title: 'Creating Routes',
    subtitle: 'Laying Track & Linking Stations',
    summary: 'Designate destination corridors, choose track engineering specifications, and assign trains from your depot.',
  },
  {
    id: 5,
    title: 'Managing Services',
    subtitle: 'Scheduling, Frequencies & Platform Slots',
    summary: 'Configure departure frequencies, calibrate ticket yields, and manage 10-platform dispatch slots.',
  },
  {
    id: 6,
    title: 'Finances & Telemetry',
    subtitle: 'Daily Ledgers & 30-Day Net Profits',
    summary: 'Inspect daily revenue, operating costs, and the 30-day Financial Performance telemetry chart.',
  },
  {
    id: 7,
    title: 'Network Expansion',
    subtitle: 'Scaling Your High-Speed Empire',
    summary: 'Identify high-demand corridors, acquire station rights across Asia, and scale your bullet train network.',
  },
];

export const TUTORIAL_STEPS: TutorialStep[] = [
  // Chapter 1: Welcome
  {
    chapterId: 1,
    chapterTitle: 'Welcome to Trackline Sim',
    stepIndex: 0,
    totalStepsInChapter: 2,
    title: 'Welcome, Chief Dispatcher',
    instruction: 'Welcome to Trackline Sim. You are the executive head of an ambitious passenger railway network across Asia.',
    details: 'Your goal is to build high-speed bullet corridors, manage real-world train fleets, calibrate ticket prices, and grow your corporate treasury.',
    targetSelector: '[data-tutorial="header-brand"]',
    preferredPosition: 'bottom',
    actionRequired: 'none',
  },
  {
    chapterId: 1,
    chapterTitle: 'Welcome to Trackline Sim',
    stepIndex: 1,
    totalStepsInChapter: 2,
    title: 'Tactical Command Controls',
    instruction: 'The top navigation bar contains regional filters (South Asia, China, East Asia, Southeast Asia, World) and simulation clock speeds.',
    details: 'You can pause, accelerate time up to 5x, monitor live weather alerts, and open settings or help at any moment.',
    targetSelector: '[data-tutorial="header-controls"]',
    preferredPosition: 'bottom',
    actionRequired: 'none',
  },

  // Chapter 2: The Map
  {
    chapterId: 2,
    chapterTitle: 'The Tactical Map',
    stepIndex: 0,
    totalStepsInChapter: 2,
    title: 'Reading Station Markers & Tracks',
    instruction: 'The map shows real railway corridors with geographic alignments. Lime nodes represent stations you own; amber nodes are open for acquisition.',
    details: 'Station markers automatically adapt their labels based on zoom level to keep the tactical display clean and readable.',
    targetSelector: '[data-tutorial="map-canvas"]',
    preferredPosition: 'right',
    actionRequired: 'none',
  },
  {
    chapterId: 2,
    chapterTitle: 'The Tactical Map',
    stepIndex: 1,
    totalStepsInChapter: 2,
    title: 'Interactive Station Inspection',
    instruction: 'Click on any station marker on the map to inspect its track gauge, electrification traction, and platform capacity.',
    details: 'Try selecting a station on the map (like New Delhi, Mumbai Central, or Tokyo).',
    targetSelector: '[data-tutorial="station-panel"]',
    preferredPosition: 'left',
    actionRequired: 'select_station',
    actionPrompt: 'Click any station on the map or panel to inspect details',
  },

  // Chapter 3: Purchasing Trains
  {
    chapterId: 3,
    chapterTitle: 'Purchasing Trains',
    stepIndex: 0,
    totalStepsInChapter: 2,
    title: 'The Rolling Stock Marketplace',
    instruction: 'A railway cannot operate without trains. Navigate to the Train Procurement tab to browse international rolling stock manufacturers.',
    details: 'Top manufacturers include Hitachi & Kawasaki (Japan), CRRC (China), Alstom (France), Siemens (Germany), ICF (India), and Hyundai Rotem (Korea).',
    targetSelector: '[data-tutorial="tab-fleet"]',
    preferredPosition: 'bottom',
    actionRequired: 'open_fleet_tab',
    actionPrompt: 'Click on the "Train Procurement" navigation tab',
  },
  {
    chapterId: 3,
    chapterTitle: 'Purchasing Trains',
    stepIndex: 1,
    totalStepsInChapter: 2,
    title: 'Comparing Train Specifications',
    instruction: 'Evaluate each train model: top speed (km/h), passenger capacity, reliability percentage, and daily maintenance cost.',
    details: 'Bullet trains like the Shinkansen N700S and CR400BF command premium fares on high-speed rail, while commuter sets offer maximum passenger density.',
    targetSelector: '[data-tutorial="fleet-content"]',
    preferredPosition: 'center',
    actionRequired: 'none',
  },

  // Chapter 4: Creating Routes
  {
    chapterId: 4,
    chapterTitle: 'Creating Routes',
    stepIndex: 0,
    totalStepsInChapter: 2,
    title: 'Inaugurating New Lines',
    instruction: 'To establish regular passenger service, select an owned hub on the map and click "Plan a service from here →".',
    details: 'This opens the Corridor Dispatch & Route Planner, where you choose the destination station along connected trunk corridors.',
    targetSelector: '[data-tutorial="btn-plan-service"]',
    preferredPosition: 'left',
    actionRequired: 'open_planner',
    actionPrompt: 'Click "Plan a service from here →" in the Station Panel',
  },
  {
    chapterId: 4,
    chapterTitle: 'Creating Routes',
    stepIndex: 1,
    totalStepsInChapter: 2,
    title: 'Track Engineering & Fleet Assignment',
    instruction: 'Choose track engineering: High-Speed Rail (350 km/h), Intercity Express (200 km/h), or Commuter (130 km/h).',
    details: 'Then assign an available train from your depot to inaugurate the line. Trains cannot exceed their model speed or the track speed cap.',
    targetSelector: '[data-tutorial="planner-modal-content"]',
    preferredPosition: 'center',
    actionRequired: 'none',
  },

  // Chapter 5: Managing Services
  {
    chapterId: 5,
    chapterTitle: 'Managing Services',
    stepIndex: 0,
    totalStepsInChapter: 2,
    title: 'Dispatch Slots & Platform Utilization',
    instruction: 'Each terminal station provides 10 dispatch platform slots (P1 to P10). Each active departure takes up a platform slot.',
    details: 'Avoid scheduling more runs than your platforms can handle to prevent dispatch bottlenecks and delayed trains.',
    targetSelector: '[data-tutorial="station-dispatch-slots"]',
    preferredPosition: 'left',
    actionRequired: 'none',
  },
  {
    chapterId: 5,
    chapterTitle: 'Managing Services',
    stepIndex: 1,
    totalStepsInChapter: 2,
    title: 'Calibrating Frequencies & Ticket Fares',
    instruction: 'Balance daily departures (4 to 24 runs/day) and ticket pricing ($). Higher frequencies capture more demand, but increase wear and operating expenses.',
    details: 'The Route Planner provides live financial forecasts showing estimated daily ridership, revenue, and net profit before you build.',
    targetSelector: '[data-tutorial="route-forecast-box"]',
    preferredPosition: 'center',
    actionRequired: 'none',
  },

  // Chapter 6: Finances
  {
    chapterId: 6,
    chapterTitle: 'Finances & Telemetry',
    stepIndex: 0,
    totalStepsInChapter: 2,
    title: 'Tracking 30-Day Operational Net Profits',
    instruction: 'In the Station Detail Panel, switch to the "Finances (30D)" tab to inspect your live Recharts financial telemetry.',
    details: 'This visualizes your daily net profit trajectory over the last 7, 14, or 30 operating days.',
    targetSelector: '[data-tutorial="btn-finances-tab"]',
    preferredPosition: 'left',
    actionRequired: 'view_finances',
    actionPrompt: 'Click the "Finances (30D)" tab in the Station Panel',
  },
  {
    chapterId: 6,
    chapterTitle: 'Finances & Telemetry',
    stepIndex: 1,
    totalStepsInChapter: 2,
    title: 'Understanding Revenue & Upkeep',
    instruction: 'Net profit equals gross ticket revenue minus daily operating expenses, track maintenance, and train fleet upkeep.',
    details: 'Weather storms (monsoons, blizzards, typhoons) temporarily reduce speeds and passenger volume, impacting short-term yields.',
    targetSelector: '[data-tutorial="financial-chart-box"]',
    preferredPosition: 'left',
    actionRequired: 'none',
  },

  // Chapter 7: Expansion
  {
    chapterId: 7,
    chapterTitle: 'Network Expansion',
    stepIndex: 0,
    totalStepsInChapter: 2,
    title: 'Acquiring Franchise Rights',
    instruction: 'Expand your company by acquiring rights to strategic hub stations (e.g. Mumbai, Shanghai, Osaka, Seoul, Jakarta).',
    details: 'Each acquired station unlocks connected corridors, additional platform dispatch slots, and access to new passenger markets.',
    targetSelector: '[data-tutorial="station-actions-box"]',
    preferredPosition: 'left',
    actionRequired: 'none',
  },
  {
    chapterId: 7,
    chapterTitle: 'Network Expansion',
    stepIndex: 1,
    totalStepsInChapter: 2,
    title: 'Ready for Dispatch!',
    instruction: 'Congratulations! You have mastered the core operations of Trackline Sim.',
    details: 'You can replay any tutorial chapter anytime from the Settings menu (⚙️) or consult the in-game Help Centre (?) for quick reference.',
    targetSelector: '[data-tutorial="header-brand"]',
    preferredPosition: 'bottom',
    actionRequired: 'none',
  },
];

export const INITIAL_TUTORIAL_STATE: TutorialState = {
  isActive: true,
  isMinimized: false,
  currentChapterId: 1,
  currentStepIndex: 0,
  completedChapterIds: [],
  hasSeenWelcome: false,
  isActionCompleted: false,
};

const STORAGE_KEY_TUTORIAL = 'trackline_sim_tutorial_state_v1';

export function loadTutorialState(): TutorialState {
  if (typeof window === 'undefined' || !window.localStorage) {
    return INITIAL_TUTORIAL_STATE;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TUTORIAL);
    if (!raw) return INITIAL_TUTORIAL_STATE;
    const parsed = JSON.parse(raw);
    return {
      ...INITIAL_TUTORIAL_STATE,
      ...parsed,
      // If completed all, default isActive to false on reload unless user launches it
      isActive: parsed.isActive ?? (parsed.completedChapterIds?.length < TUTORIAL_CHAPTERS.length),
    };
  } catch {
    return INITIAL_TUTORIAL_STATE;
  }
}

export function saveTutorialState(state: TutorialState): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    localStorage.setItem(STORAGE_KEY_TUTORIAL, JSON.stringify(state));
  } catch {
    // Ignore storage quota
  }
}

export function getCurrentStep(state: TutorialState): TutorialStep {
  const match = TUTORIAL_STEPS.find(
    (s) => s.chapterId === state.currentChapterId && s.stepIndex === state.currentStepIndex
  );
  return match || TUTORIAL_STEPS[0];
}

export function calculateTutorialProgress(state: TutorialState): {
  currentStepOverall: number;
  totalStepsOverall: number;
  percent: number;
  isComplete: boolean;
} {
  const total = TUTORIAL_STEPS.length;
  const currentStep = getCurrentStep(state);
  const currentIndex = TUTORIAL_STEPS.findIndex(
    (s) => s.chapterId === currentStep.chapterId && s.stepIndex === currentStep.stepIndex
  );
  const stepNumber = Math.max(1, currentIndex + 1);
  const percent = Math.round((stepNumber / total) * 100);
  const isComplete = state.completedChapterIds.length >= TUTORIAL_CHAPTERS.length;

  return {
    currentStepOverall: stepNumber,
    totalStepsOverall: total,
    percent,
    isComplete,
  };
}

export function advanceTutorial(state: TutorialState): TutorialState {
  const currentStep = getCurrentStep(state);
  const currentIndex = TUTORIAL_STEPS.findIndex(
    (s) => s.chapterId === currentStep.chapterId && s.stepIndex === currentStep.stepIndex
  );

  // If this is the last step in the chapter, mark chapter as completed
  const nextCompletedChapters = state.completedChapterIds.includes(currentStep.chapterId)
    ? state.completedChapterIds
    : [...state.completedChapterIds, currentStep.chapterId];

  if (currentIndex >= TUTORIAL_STEPS.length - 1) {
    // Finished last step of entire tutorial
    return {
      ...state,
      isActive: false,
      completedChapterIds: TUTORIAL_CHAPTERS.map((c) => c.id),
      isActionCompleted: false,
    };
  }

  const nextStep = TUTORIAL_STEPS[currentIndex + 1];
  return {
    ...state,
    currentChapterId: nextStep.chapterId,
    currentStepIndex: nextStep.stepIndex,
    completedChapterIds: nextCompletedChapters,
    isActionCompleted: false,
  };
}

export function previousTutorial(state: TutorialState): TutorialState {
  const currentStep = getCurrentStep(state);
  const currentIndex = TUTORIAL_STEPS.findIndex(
    (s) => s.chapterId === currentStep.chapterId && s.stepIndex === currentStep.stepIndex
  );

  if (currentIndex <= 0) {
    return state;
  }

  const prevStep = TUTORIAL_STEPS[currentIndex - 1];
  return {
    ...state,
    currentChapterId: prevStep.chapterId,
    currentStepIndex: prevStep.stepIndex,
    isActionCompleted: false,
  };
}

export function startChapter(state: TutorialState, chapterId: number): TutorialState {
  const firstStep = TUTORIAL_STEPS.find((s) => s.chapterId === chapterId) || TUTORIAL_STEPS[0];
  return {
    ...state,
    isActive: true,
    isMinimized: false,
    currentChapterId: firstStep.chapterId,
    currentStepIndex: firstStep.stepIndex,
    isActionCompleted: false,
  };
}

export function checkTutorialAction(
  step: TutorialStep,
  actionType: 'select_station' | 'open_fleet_tab' | 'open_planner' | 'view_finances'
): boolean {
  return step.actionRequired === actionType;
}
