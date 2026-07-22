import { describe, expect, it } from 'vitest';
import { SGetGameAchievementResults, SGetNewAchievementIds, SGetTotalAchievementCount } from './SGameAchievements';
import type { GameAchievementContext } from '../../data/type/GameAchievement';

const completeContext: GameAchievementContext = {
  averagePopularity: 92,
  completedGoalCount: 3,
  topBondValue: 82,
  qteSuccessCount: 3,
  budget: 40000,
  completedWorkspaces: 4,
  followUpEventCount: 2,
};

describe('SGameAchievements', () => {
  it('unlocks achievements from the current game context', () => {
    const results = SGetGameAchievementResults(new Set(), completeContext);

    expect(results.every(result => result.isUnlocked)).toBe(true);
  });

  it('marks only newly unlocked achievements as new', () => {
    const results = SGetGameAchievementResults(new Set(['first-s-grade']), completeContext);

    expect(SGetNewAchievementIds(results)).not.toContain('first-s-grade');
  });

  it('reports the configured achievement count', () => {
    expect(SGetTotalAchievementCount()).toBe(7);
  });
});
