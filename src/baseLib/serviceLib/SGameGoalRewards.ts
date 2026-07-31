import type { GameGoalResult, GameGoalReward } from '../../data/type/GameGoal';

/** Returns a goal reward only once after its completion condition is met. */
export function SGetClaimableGoalReward(goal: GameGoalResult | undefined, claimedGoalIds: Set<string>): GameGoalReward | null {
  if (!goal || !goal.isComplete || claimedGoalIds.has(goal.id)) return null;
  return goal.reward || null;
}
