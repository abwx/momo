import { describe, expect, it } from 'vitest';
import { SGetReportAvailability, SShouldTriggerCrisis } from './SCrisisManager';
import type { SCrisisContext } from './type/SCrisisContext';

function createContext(): SCrisisContext {
  return { antiFans: 24, crisisCount: 0, dramaDebt: 0, eventIndex: 2, hasNegativeTrending: false, lastCrisisEventIndex: 0, popularityGap: 8 };
}

describe('SCrisisManager', () => {
  it('limits crisis QTEs to two episodes per season', () => {
    const context = { ...createContext(), antiFans: 36 };
    expect(SShouldTriggerCrisis(context, () => 0)).toBe(true);
    expect(SShouldTriggerCrisis({ ...context, crisisCount: 2 }, () => 0)).toBe(false);
  });

  it('unlocks report actions only for active program risks', () => {
    expect(SGetReportAvailability(createContext()).isAvailable).toBe(false);
    expect(SGetReportAvailability({ ...createContext(), popularityGap: 15 }).canBalance).toBe(true);
    expect(SGetReportAvailability({ ...createContext(), antiFans: 35 }).canClean).toBe(true);
  });
});
