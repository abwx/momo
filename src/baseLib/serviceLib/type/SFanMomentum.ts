import type { GameEventType } from '../../../data/type/GameEvent';
import type { SFanFactionState } from './SFanFactionState';
import type { SRecordingModeKey } from './SStudioLedger';

export interface SFanMomentumContext {
  eventType: GameEventType | null;
  fanFactions: SFanFactionState;
  recordingMode: SRecordingModeKey;
}
