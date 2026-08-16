import { computed, ref, type ComputedRef, type Ref } from 'vue';
import type { GameAchievementContext, GameAchievementResult } from '../data/type/GameAchievement';
import { SGetGameAchievementResults, SGetNewAchievementIds } from '../baseLib/serviceLib/SGameAchievements';

interface UseAchievementsOptions {
  context: ComputedRef<GameAchievementContext>;
  onCelebrate: (achievements: GameAchievementResult[]) => void;
}

/** Owns per-season achievement state, including deferred QTE notifications. */
export function useAchievements(options: UseAchievementsOptions) {
  const unlockedIds = ref<Set<string>>(new Set());
  const pendingAchievements = ref<GameAchievementResult[]>([]);
  const results = computed(() => SGetGameAchievementResults(unlockedIds.value, options.context.value));
  return {
    celebrateNewAchievements: () => _celebrateNewAchievements(options, results.value, unlockedIds),
    queueAchievementCelebration: () => pendingAchievements.value = _unlockNewAchievements(results.value, unlockedIds),
    resetAchievements: () => _resetAchievements(unlockedIds, pendingAchievements),
    showQueuedAchievementCelebration: () => _showQueuedAchievements(options, pendingAchievements),
  };
}

function _celebrateNewAchievements(options: UseAchievementsOptions, results: GameAchievementResult[], unlockedIds: Ref<Set<string>>): void {
  options.onCelebrate(_unlockNewAchievements(results, unlockedIds));
}

function _unlockNewAchievements(results: GameAchievementResult[], unlockedIds: Ref<Set<string>>): GameAchievementResult[] {
  const newIds = SGetNewAchievementIds(results);
  if (!newIds.length) return [];
  unlockedIds.value = new Set([...unlockedIds.value, ...newIds]);
  return results.filter(result => newIds.includes(result.id));
}

function _resetAchievements(unlockedIds: Ref<Set<string>>, pendingAchievements: Ref<GameAchievementResult[]>): void {
  unlockedIds.value = new Set();
  pendingAchievements.value = [];
}

function _showQueuedAchievements(options: UseAchievementsOptions, pendingAchievements: Ref<GameAchievementResult[]>): void {
  options.onCelebrate(pendingAchievements.value);
  pendingAchievements.value = [];
}
