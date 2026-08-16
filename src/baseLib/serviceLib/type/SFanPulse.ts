import type { Character } from '../../../data/characters';
import type { GameEffectTag } from '../../../data/type/GameEvent';
import type { SBondProjectKey, SFanProgramKey } from './SStudioLedger';
import type { SFanFactionState } from './SFanFactionState';
import type { SSeasonState } from './SSeasonState';

export interface SFanPulse {
  id: string;
  phase: 'OPEN' | 'FOLLOW_UP' | 'RESOLVED';
  program: SFanProgramKey;
  programHint: string;
  pairIds: [string, string];
  project: SBondProjectKey;
  projectHint: string;
  quote: string;
  title: string;
}

export interface SFanPulseContext {
  biasCharacter: Character;
  characters: Character[];
  factions: SFanFactionState;
  hasNegativeTrending: boolean;
  lastTags: GameEffectTag[];
  scenePairIds?: [string, string] | null;
  season: SSeasonState;
  step: number;
}
