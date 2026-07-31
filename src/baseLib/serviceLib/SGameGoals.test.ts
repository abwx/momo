import { describe, expect, it } from 'vitest';
import { SCreateGameGoalIds, SGetCompletedGameGoalCount, SGetGameGoalResults } from './SGameGoals';
import { GAME_GOALS } from '../../data/gameGoals';
import type { GameGoalContext } from '../../data/type/GameGoal';
import { setRandomSource } from '../../utils/random';

const completeContext: GameGoalContext = {
  averagePopularity: 90,
  budget: 32000,
  isSeasonComplete: false,
  antiFans: 12,
  topBondValue: 72,
  lowRankGrowth: 20,
  cpFans: 60,
  soloFans: 60,
  groupFans: 80,
  publicFans: 65,
  topPopularity: 95,
  cpHeat: 10,
  qteSuccessCount: 3,
  bondProjectCount: 3,
  fanProgramCount: 4,
  focusRecordingCount: 3,
};

function createContext(patch: Partial<GameGoalContext> = {}): GameGoalContext {
  return { ...completeContext, ...patch };
}

describe('SGameGoals', () => {
  it('marks goals complete when the context reaches their target', () => {
    const results = SGetGameGoalResults(['avg-popularity-86', 'anti-control-80'], completeContext);

    expect(results.map(result => result.isComplete)).toEqual([true, true]);
  });

  it('caps progress at 100 and keeps incomplete progress below 100', () => {
    const context = createContext({ averagePopularity: 43, budget: 60000 });
    const results = SGetGameGoalResults(['avg-popularity-86', 'budget-saver-30000'], context);

    expect(results.map(result => result.progress)).toEqual([50, 100]);
  });

  it('counts only completed goals', () => {
    const context = createContext({ topBondValue: 40 });
    const results = SGetGameGoalResults(['top-bond-70', 'low-rank-growth-18'], context);

    expect(SGetCompletedGameGoalCount(results)).toBe(1);
  });

  it('holds end-only goals until the season is complete', () => {
    const activeResult = SGetGameGoalResults(['budget-saver-30000'], completeContext)[0];
    const settlementResult = SGetGameGoalResults(['budget-saver-30000'], createContext({ isSeasonComplete: true }))[0];

    expect(activeResult.isComplete).toBe(false);
    expect(settlementResult.isComplete).toBe(true);
  });

  it('keeps a completed season goal available after the underlying value drops', () => {
    const result = SGetGameGoalResults(['avg-popularity-86'], createContext({ averagePopularity: 80 }), new Set(['avg-popularity-86']))[0];

    expect(result.isComplete).toBe(true);
    expect(result.isLockedComplete).toBe(true);
    expect(result.progress).toBe(100);
  });

  it('draws four random goals from a pool without the workspace loop goal', () => {
    setRandomSource(() => 0.42);
    expect(GAME_GOALS.some(goal => goal.id === 'workspace-loop-4')).toBe(false);
    expect(GAME_GOALS.length).toBeGreaterThanOrEqual(10);
    expect(SCreateGameGoalIds()).toHaveLength(4);
    setRandomSource();
  });
});
