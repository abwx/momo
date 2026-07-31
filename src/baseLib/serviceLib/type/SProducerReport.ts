import type { Character } from '../../../data/characters';
import type { ProducerTitle } from '../../../data/type/SettlementReport';
import type { SSeasonScore } from './SSeasonScore';

export interface SProducerReportContext {
  averagePopularity: number;
  seasonScore: SSeasonScore;
  topCharacter: Character;
  bottomCharacter: Character;
}

export type { ProducerTitle };
