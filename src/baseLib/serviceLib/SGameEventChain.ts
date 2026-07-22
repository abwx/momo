import type { GameEvent, GameEventType } from '../../data/events';
import type { SRecordingModeKey } from './type/SStudioLedger';

export interface SEventChainContext {
  eventType: GameEventType;
  recordingMode: SRecordingModeKey;
  antiFans: number;
  topBondValue: number;
  lowRankGrowth: number;
}

export function SGetFollowUpEventId(context: SEventChainContext): string {
  if (context.antiFans >= 58) return 'followup-public-crisis';
  if (context.eventType === 'PICK_TWO' && context.topBondValue >= 36) return 'followup-cp-afterglow';
  if (context.recordingMode === 'DRAMA') return 'followup-drama-backlash';
  if (context.lowRankGrowth >= 12) return 'followup-low-rank-spotlight';
  return '';
}

export function SInsertFollowUpEvent(events: GameEvent[], index: number, event: GameEvent): void {
  if (events.some(item => item.id === event.id)) return;
  events.splice(index + 1, 0, event);
}
