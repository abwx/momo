import { describe, expect, it } from 'vitest';
import { SGetClaimableGoalReward } from './SGameGoalRewards';

const goal = { id: 'goal', title: '目标', desc: '', target: 1, value: 1, progress: 100, isComplete: true, isLockedComplete: false, valueText: '1', reward: { budget: 6000, label: '测试预算' } };

describe('SGetClaimableGoalReward', () => {
  it('returns a reward once for a completed goal', () => {
    expect(SGetClaimableGoalReward(goal, new Set())).toEqual({ budget: 6000, label: '测试预算' });
    expect(SGetClaimableGoalReward(goal, new Set(['goal']))).toBeNull();
  });
});
