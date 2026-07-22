import type { GameEvent } from './GameEvent';

export interface ProducerTitle {
  name: string;
  color: string;
  grade: string;
  gradeColor: string;
}

export interface ProducerAnalysisItem {
  label: string;
  value: string;
  detail: string;
}

export interface ProducerMedal {
  icon: string;
  title: string;
  desc: string;
}

export interface EventHistoryItem {
  event: GameEvent;
  result: string;
}
