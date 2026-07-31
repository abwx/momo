import type { GameEffectTag } from '../../../data/type/GameEvent';
import type { SFanFactionState } from './SFanFactionState';
import type { SSeasonState } from './SSeasonState';

export interface SBondEffect {
  pairIds: [string, string];
  names: string;
  delta: number;
  grantPopularityBonus?: boolean;
}

export interface SGameEffect {
  popularity?: Record<string, number>;
  factions?: Partial<SFanFactionState>;
  season?: Partial<SSeasonState>;
  budgetDelta?: number;
  bond?: SBondEffect;
  tags?: GameEffectTag[];
}
