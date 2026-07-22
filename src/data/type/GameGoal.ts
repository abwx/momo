export interface GameGoalContext {
  averagePopularity: number;
  budget: number;
  antiFans: number;
  topBondValue: number;
  completedWorkspaces: number;
  lowRankGrowth: number;
}

export interface GameGoal {
  id: string;
  title: string;
  desc: string;
  target: number;
  getValue: (context: GameGoalContext) => number;
  formatValue: (value: number) => string;
}

export interface GameGoalResult {
  id: string;
  title: string;
  desc: string;
  value: number;
  target: number;
  progress: number;
  isComplete: boolean;
  valueText: string;
}
