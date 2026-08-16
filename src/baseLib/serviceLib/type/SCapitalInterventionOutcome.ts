import type { SGameEffect } from './SGameEffect';

export interface SCapitalInterventionOutcome {
  cost: number;
  popularityDelta: number;
  seatDelta: number;
  effect: SGameEffect;
}
