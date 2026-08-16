import { computed, ref } from 'vue';
import { describe, expect, it, vi } from 'vitest';
import type { GameAchievementContext, GameAchievementResult } from '../data/type/GameAchievement';
import { useAchievements } from './useAchievements';

describe('useAchievements', () => {
  it('waits for season completion before showing settlement achievements', () => {
    const isSeasonComplete = ref(false);
    const onCelebrate = vi.fn();
    const achievements = useAchievements({ context: computed(() => createContext(isSeasonComplete.value)), onCelebrate });

    achievements.celebrateNewAchievements();
    isSeasonComplete.value = true;
    achievements.celebrateNewAchievements();

    expect((onCelebrate.mock.calls[0][0] as GameAchievementResult[]).map(item => item.id)).not.toContain('budget-master');
    expect((onCelebrate.mock.calls[1][0] as GameAchievementResult[]).map(item => item.id)).toContain('budget-master');
  });
});

function createContext(isSeasonComplete: boolean): GameAchievementContext {
  return { averagePopularity: 92, topBondValue: 82, qteSuccessCount: 3, budget: 40000, completedEpisodeCount: 4, isSeasonComplete };
}
