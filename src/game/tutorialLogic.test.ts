import test from 'node:test';
import assert from 'node:assert/strict';
import {
  TUTORIAL_CHAPTERS,
  TUTORIAL_STEPS,
  INITIAL_TUTORIAL_STATE,
  getCurrentStep,
  advanceTutorial,
  previousTutorial,
  startChapter,
  calculateTutorialProgress,
  checkTutorialAction,
} from './tutorialLogic';

test('Tutorial system has 7 defined chapters matching requirements', () => {
  assert.equal(TUTORIAL_CHAPTERS.length, 7);
  assert.equal(TUTORIAL_CHAPTERS[0].title, 'Welcome to Trackline Sim');
  assert.equal(TUTORIAL_CHAPTERS[1].title, 'The Tactical Map');
  assert.equal(TUTORIAL_CHAPTERS[2].title, 'Purchasing Trains');
  assert.equal(TUTORIAL_CHAPTERS[3].title, 'Creating Routes');
  assert.equal(TUTORIAL_CHAPTERS[4].title, 'Managing Services');
  assert.equal(TUTORIAL_CHAPTERS[5].title, 'Finances & Telemetry');
  assert.equal(TUTORIAL_CHAPTERS[6].title, 'Network Expansion');
});

test('Tutorial steps have valid targets, titles, and step indices', () => {
  assert.ok(TUTORIAL_STEPS.length >= 14);
  for (const step of TUTORIAL_STEPS) {
    assert.ok(step.chapterId >= 1 && step.chapterId <= 7);
    assert.ok(step.title.length > 0);
    assert.ok(step.instruction.length > 0);
    assert.ok(step.targetSelector, `Step ${step.title} missing targetSelector`);
  }
});

test('getCurrentStep returns correct step matching chapterId and stepIndex', () => {
  const step = getCurrentStep({
    ...INITIAL_TUTORIAL_STATE,
    currentChapterId: 2,
    currentStepIndex: 1,
  });
  assert.equal(step.chapterId, 2);
  assert.equal(step.stepIndex, 1);
  assert.equal(step.actionRequired, 'select_station');
});

test('advanceTutorial steps sequentially through steps and completes chapters', () => {
  let state = INITIAL_TUTORIAL_STATE;
  assert.equal(state.currentChapterId, 1);
  assert.equal(state.currentStepIndex, 0);

  // Step 1 -> Step 2
  state = advanceTutorial(state);
  assert.equal(state.currentChapterId, 1);
  assert.equal(state.currentStepIndex, 1);

  // Step 2 -> Chapter 2 Step 1
  state = advanceTutorial(state);
  assert.equal(state.currentChapterId, 2);
  assert.equal(state.currentStepIndex, 0);
  assert.ok(state.completedChapterIds.includes(1));

  // Previous returns to earlier step
  state = previousTutorial(state);
  assert.equal(state.currentChapterId, 1);
  assert.equal(state.currentStepIndex, 1);
});

test('calculateTutorialProgress provides accurate percentages and totals', () => {
  const progressStart = calculateTutorialProgress(INITIAL_TUTORIAL_STATE);
  assert.equal(progressStart.currentStepOverall, 1);
  assert.ok(progressStart.totalStepsOverall >= 14);
  assert.ok(progressStart.percent >= 1 && progressStart.percent <= 10);
  assert.equal(progressStart.isComplete, false);

  const completedState = {
    ...INITIAL_TUTORIAL_STATE,
    completedChapterIds: [1, 2, 3, 4, 5, 6, 7],
  };
  const progressComplete = calculateTutorialProgress(completedState);
  assert.equal(progressComplete.isComplete, true);
});

test('startChapter jumps directly to any chapter for replaying from settings', () => {
  const state = startChapter(INITIAL_TUTORIAL_STATE, 5);
  assert.equal(state.isActive, true);
  assert.equal(state.isMinimized, false);
  assert.equal(state.currentChapterId, 5);
  assert.equal(state.currentStepIndex, 0);
});

test('checkTutorialAction correctly identifies required user actions', () => {
  const stationStep = TUTORIAL_STEPS.find((s) => s.actionRequired === 'select_station')!;
  assert.ok(checkTutorialAction(stationStep, 'select_station'));
  assert.equal(checkTutorialAction(stationStep, 'open_fleet_tab'), false);

  const fleetStep = TUTORIAL_STEPS.find((s) => s.actionRequired === 'open_fleet_tab')!;
  assert.ok(checkTutorialAction(fleetStep, 'open_fleet_tab'));
});
