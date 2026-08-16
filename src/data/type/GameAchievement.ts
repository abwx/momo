export interface GameAchievementContext {
  averagePopularity: number;
  topBondValue: number;
  qteSuccessCount: number;
  budget: number;
  completedEpisodeCount: number;
  isSeasonComplete: boolean;
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
