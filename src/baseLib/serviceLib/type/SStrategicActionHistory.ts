import type { SCapitalIntervention } from './SCapitalIntervention';

export interface SStrategicActionHistoryItem {
  characterId: string;
  characterName: string;
  cost: number;
  eventIndex: number;
  intervention: SCapitalIntervention;
  popularityDelta: number;
  seatDelta: number;
}
