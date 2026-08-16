import type { GameEffectTag } from '../../../data/type/GameEvent';
import type { SFanFactionState } from './SFanFactionState';
import type { SSeasonMetrics } from './SSeasonState';

export interface SBondEffect {
  pairIds: [string, string];
  names: string;
  delta: number;
  grantPopularityBonus?: boolean;
}

export interface SGameEffect {
  popularity?: Record<string, number>;
  factions?: Partial<SFanFactionState>;
  season?: Partial<SSeasonMetrics>;
  budgetDelta?: number;
  bond?: SBondEffect;
  tags?: GameEffectTag[];
}
