import type { SSeasonState } from './type/SSeasonState';

const MIN_SCORE = 0;
const MAX_SCORE = 100;

export function SCreateSeasonState(): SSeasonState {
  return { groupHeat: 50, producerReputation: 50, anticipation: 20, biasPressure: 0, dramaDebt: 0, cpHeat: 0, crisisCount: 0, lastCrisisEventIndex: 0, lowRankMomentum: 0 };
}

export function SResetSeasonState(state: SSeasonState): void {
  Object.assign(state, SCreateSeasonState());
}

export function SClampSeasonState(state: SSeasonState): void {
  Object.keys(state).forEach(key => SClampSeasonValue(state, key as keyof SSeasonState));
}

function SClampSeasonValue(state: SSeasonState, key: keyof SSeasonState): void {
  state[key] = Math.max(MIN_SCORE, Math.min(MAX_SCORE, state[key]));
}
