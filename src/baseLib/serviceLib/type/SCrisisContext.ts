export interface SCrisisContext {
  antiFans: number;
  crisisCount: number;
  dramaDebt: number;
  eventIndex: number;
  hasNegativeTrending: boolean;
  lastCrisisEventIndex: number;
  popularityGap: number;
}

export interface SReportAvailability {
  canBalance: boolean;
  canClean: boolean;
  isAvailable: boolean;
  reason: string;
}
