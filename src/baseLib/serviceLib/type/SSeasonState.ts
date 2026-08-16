export interface SSeasonMetrics {
  groupHeat: number;
  producerReputation: number;
  anticipation: number;
  biasPressure: number;
  dramaDebt: number;
  cpHeat: number;
  crisisCount: number;
  lowRankMomentum: number;
}

export interface SSeasonFlow {
  fanPulseEventIndex: number;
  fanPulseStep: number;
  programPlanPromptIndex: number;
  lastCrisisEventIndex: number;
}

export type SSeasonState = SSeasonMetrics & SSeasonFlow;
