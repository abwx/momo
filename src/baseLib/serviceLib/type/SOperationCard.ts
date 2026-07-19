import type { Character } from '../../../data/characters';
import type { SFanFactionState } from './SFanFactionState';

export type SOperationCardKind = 'BUFF' | 'PR' | 'CP' | 'BALANCE';

export interface SOperationCard {
  id: string;
  name: string;
  kind: SOperationCardKind;
  cost: number;
  desc: string;
  apply: (characters: Character[], factions: SFanFactionState) => string;
}
