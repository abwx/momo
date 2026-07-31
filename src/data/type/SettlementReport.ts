import type { GameEffectTag, GameEvent } from './GameEvent';

export interface ProducerTitle {
  name: string;
  color: string;
  grade: string;
  gradeColor: string;
}

export interface EventHistoryItem {
  event: GameEvent;
  result: string;
  effectTags?: GameEffectTag[];
}
