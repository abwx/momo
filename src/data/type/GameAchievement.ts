export interface GameAchievementContext {
  averagePopularity: number;
  completedGoalCount: number;
  topBondValue: number;
  qteSuccessCount: number;
  budget: number;
  completedWorkspaces: number;
  followUpEventCount: number;
}

export interface GameAchievement {
  id: string;
  title: string;
  desc: string;
  isUnlocked: (context: GameAchievementContext) => boolean;
}

export interface GameAchievementResult {
  id: string;
  title: string;
  desc: string;
  isUnlocked: boolean;
  isNew: boolean;
}
