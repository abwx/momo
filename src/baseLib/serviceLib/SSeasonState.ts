import type { SSeasonMetrics, SSeasonState } from './type/SSeasonState';

const MIN_SCORE = 0;
const MAX_SCORE = 100;

export function SCreateSeasonState(): SSeasonState {
  return { groupHeat: 50, producerReputation: 50, anticipation: 20, biasPressure: 0, dramaDebt: 0, cpHeat: 0, crisisCount: 0, fanPulseEventIndex: -1, fanPulseStep: 0, programPlanPromptIndex: 0, lastCrisisEventIndex: 0, lowRankMomentum: 0 };
}

export function SResetSeasonState(state: SSeasonState): void {
  Object.assign(state, SCreateSeasonState());
}

export function SClampSeasonState(state: SSeasonState): void {
  SGetScoreKeys().forEach(key => SClampSeasonValue(state, key));
}

function SGetScoreKeys(): Array<keyof SSeasonMetrics> {
  return ['groupHeat', 'producerReputation', 'anticipation', 'biasPressure', 'dramaDebt', 'cpHeat', 'crisisCount', 'lowRankMomentum'];
}

function SClampSeasonValue(state: SSeasonState, key: keyof SSeasonMetrics): void {
  state[key] = Math.max(MIN_SCORE, Math.min(MAX_SCORE, state[key]));
}
