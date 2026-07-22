export type QTEType = 'MASH' | 'HOLD' | 'TIMING';

export interface QTEScenario {
  title: string;
  desc: string;
  type: QTEType;
  icon: string;
  successText: string;
  failText: string;
}
