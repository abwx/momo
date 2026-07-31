export interface GameGoalContext {
  averagePopularity: number;
  budget: number;
  isSeasonComplete: boolean;
  antiFans: number;
  topBondValue: number;
  lowRankGrowth: number;
  cpFans: number;
  soloFans: number;
  groupFans: number;
  publicFans: number;
  topPopularity: number;
  cpHeat: number;
  qteSuccessCount: number;
  bondProjectCount: number;
  fanProgramCount: number;
  focusRecordingCount: number;
}

export interface GameGoalReward {
  budget: number;
  label: string;
}

export interface GameGoal {
  id: string;
  title: string;
  desc: string;
  target: number;
  reward?: GameGoalReward;
  isEndOnly?: boolean;
  getValue: (context: GameGoalContext) => number;
  formatValue: (value: number) => string;
}

export interface GameGoalResult {
  id: string;
  title: string;
  desc: string;
  reward?: GameGoalReward;
  isEndOnly?: boolean;
  value: number;
  target: number;
  progress: number;
  isComplete: boolean;
  isLockedComplete: boolean;
  valueText: string;
}
