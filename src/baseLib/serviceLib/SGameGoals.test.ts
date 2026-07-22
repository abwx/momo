import { describe, expect, it } from 'vitest';
import { SGetCompletedGameGoalCount, SGetGameGoalResults } from './SGameGoals';
import type { GameGoalContext } from '../../data/type/GameGoal';

const completeContext: GameGoalContext = {
  averagePopularity: 90,
  budget: 32000,
  antiFans: 12,
  topBondValue: 72,
  completedWorkspaces: 4,
  lowRankGrowth: 20,
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
});
