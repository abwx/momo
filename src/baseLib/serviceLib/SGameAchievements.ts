import { GAME_ACHIEVEMENTS } from '../../data/gameAchievements';
import type { GameAchievement, GameAchievementContext, GameAchievementResult } from '../../data/type/GameAchievement';

export function SGetGameAchievementResults(unlockedIds: Set<string>, context: GameAchievementContext): GameAchievementResult[] {
  return GAME_ACHIEVEMENTS.map(achievement => SCreateAchievementResult(achievement, unlockedIds, context));
}

export function SGetNewAchievementIds(results: GameAchievementResult[]): string[] {
  return results.filter(result => result.isNew).map(result => result.id);
}

export function SGetTotalAchievementCount(): number {
  return GAME_ACHIEVEMENTS.length;
}

function SCreateAchievementResult(achievement: GameAchievement, unlockedIds: Set<string>, context: GameAchievementContext): GameAchievementResult {
  const isUnlockedNow = achievement.isUnlocked(context);
  const isUnlocked = unlockedIds.has(achievement.id) || isUnlockedNow;
  return { ...achievement, isUnlocked, isNew: isUnlockedNow && !unlockedIds.has(achievement.id) };
}
