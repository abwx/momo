import type { EventHistoryItem } from '../../../data/type/SettlementReport';
import type { SFanFactionState } from './SFanFactionState';
import type { SNarrativeOutcome } from './SNarrativeThread';
import type { SSeasonState } from './SSeasonState';

export interface SSeasonRecapItem {
  label: string;
  title: string;
  detail: string;
}

export interface SSeasonRecap {
  route: SSeasonRecapItem;
  choice: SSeasonRecapItem;
  gain: SSeasonRecapItem;
  cost: SSeasonRecapItem;
}

export interface SSeasonRecapContext {
  eventHistory: EventHistoryItem[];
  fanFactions: SFanFactionState;
  narrativeOutcomes: SNarrativeOutcome[];
  seasonState: SSeasonState;
}
