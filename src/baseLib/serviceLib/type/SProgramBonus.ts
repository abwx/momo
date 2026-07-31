import type { Character } from '../../../data/characters';
import type { SFanFactionState } from './SFanFactionState';

export interface SProgramBonus {
  id: string;
  name: string;
  apply: (characters: Character[], factions: SFanFactionState) => string;
}
