import { describe, expect, it } from 'vitest';
import { SClampFanFactions, SGetProgramBonus } from './SGameFeatures';
import type { SFanFactionState } from './type/SFanFactionState';

function createFactions(): SFanFactionState {
  return { groupFans: 50, soloFans: 50, cpFans: 50, publicFans: 50, antiFans: 50 };
}

describe('SGameFeatures', () => {
  it('clamps fan faction values to the valid range', () => {
    const factions = createFactions();
    factions.groupFans = 120;
    factions.antiFans = -10;
    SClampFanFactions(factions);
    expect(factions.groupFans).toBe(100);
    expect(factions.antiFans).toBe(0);
  });

  it('rewards a program bonus after every fourth event', () => {
    expect(SGetProgramBonus(2, () => 0)).toBeNull();
    expect(SGetProgramBonus(3, () => 0)?.id).toBe('practice-cam');
    expect(SGetProgramBonus(7, () => 0.99)?.id).toBe('cp-cut');
  });
});
