import { GAME_GOALS } from '../../data/gameGoals';
import type { GameGoal, GameGoalContext, GameGoalResult } from '../../data/type/GameGoal';
import { shuffleList } from '../../utils/random';

export function SCreateGameGoalIds(count = 3): string[] {
  return shuffleList(GAME_GOALS).slice(0, count).map(goal => goal.id);
}

export function SGetGameGoalResults(ids: string[], context: GameGoalContext): GameGoalResult[] {
  return ids.map(id => SCreateGameGoalResult(id, context)).filter(Boolean) as GameGoalResult[];
}

export function SGetCompletedGameGoalCount(results: GameGoalResult[]): number {
  return results.filter(result => result.isComplete).length;
}

function SCreateGameGoalResult(id: string, context: GameGoalContext): GameGoalResult | null {
  const goal = GAME_GOALS.find(item => item.id === id);
  if (!goal) return null;
  return SBuildGameGoalResult(goal, Math.max(0, goal.getValue(context)));
}

function SBuildGameGoalResult(goal: GameGoal, value: number): GameGoalResult {
  const progress = Math.min(100, Math.round((value / goal.target) * 100));
  return { ...goal, value, progress, isComplete: value >= goal.target, valueText: goal.formatValue(value) };
}
