import type { SFanFactionState } from '../../baseLib/serviceLib/type/SFanFactionState';

export interface FanWatchItem {
  changes: string[];
  factionDeltas: Partial<SFanFactionState>;
  summary: string;
  title: string;
}
