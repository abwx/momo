export type SProgramPlanKey = 'FOCUS' | 'ENSEMBLE' | 'UNDERDOG' | 'CP' | 'CRISIS';

export interface SProgramPlan {
  candidateIds: string[];
  investment: number;
  key: SProgramPlanKey;
  matches: number;
  partsDone: number;
  seatTradeoff: string;
  targetParts: number;
  title: string;
}

export interface SProgramPlanOption {
  detail: string;
  investment: number;
  key: SProgramPlanKey;
  payoff: string;
  reason: string;
  risk: string;
  seatTradeoff: string;
  title: string;
}
