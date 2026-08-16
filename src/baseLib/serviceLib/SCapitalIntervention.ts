import type { SGameEffect } from './type/SGameEffect';
import type { SCapitalIntervention } from './type/SCapitalIntervention';
import type { SCapitalInterventionOutcome } from './type/SCapitalInterventionOutcome';
import type { SClassTrackState } from './type/SClassTrack';
import type { Character } from '../../data/characters';
import { SCreateEventAssessmentDeltas } from './SClassTrack';

export const CAPITAL_BOOST_COST = 20000;
export const CAPITAL_SUPPRESS_COST = 16000;
export const CAPITAL_BOOST_DELTA = 6;
export const CAPITAL_SUPPRESS_DELTA = -6;

/** Returns the fixed budget needed for a targeted capital intervention. */
export function SGetCapitalInterventionCost(intervention: SCapitalIntervention): number {
  return intervention === 'BOOST' ? CAPITAL_BOOST_COST : CAPITAL_SUPPRESS_COST;
}

/** Creates the real, clamped cost and score outcome before a capital action is offered. */
export function SCreateCapitalInterventionOutcome(state: SClassTrackState, character: Character, intervention: SCapitalIntervention): SCapitalInterventionOutcome {
  const popularityDelta = SGetEffectivePopularityDelta(character.popularity, intervention);
  const cost = SGetEffectiveCost(intervention, popularityDelta);
  return { cost, popularityDelta, seatDelta: SGetSeatDelta(state, character.id, popularityDelta), effect: SCreateOutcomeEffect(character.id, popularityDelta, cost) };
}

function SGetEffectivePopularityDelta(popularity: number, intervention: SCapitalIntervention): number {
  const requested = intervention === 'BOOST' ? CAPITAL_BOOST_DELTA : CAPITAL_SUPPRESS_DELTA;
  return requested > 0 ? Math.min(requested, 100 - popularity) : -Math.min(-requested, popularity);
}

function SGetEffectiveCost(intervention: SCapitalIntervention, popularityDelta: number): number {
  const requestedDelta = intervention === 'BOOST' ? CAPITAL_BOOST_DELTA : CAPITAL_SUPPRESS_DELTA;
  const baseCost = SGetCapitalInterventionCost(intervention);
  return Math.ceil(baseCost * Math.abs(popularityDelta / requestedDelta) / 100) * 100;
}

function SGetSeatDelta(state: SClassTrackState, characterId: string, popularityDelta: number): number {
  if (popularityDelta > 0) return SCreateEventAssessmentDeltas(state, { [characterId]: popularityDelta })[characterId] || 0;
  return popularityDelta < 0 ? -Math.max(1, Math.round(Math.abs(popularityDelta) / 3)) : 0;
}

function SCreateOutcomeEffect(characterId: string, popularityDelta: number, cost: number): SGameEffect {
  return { popularity: { [characterId]: popularityDelta }, budgetDelta: -cost };
}
