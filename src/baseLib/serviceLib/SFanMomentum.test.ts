import { describe, expect, it } from 'vitest';
import { SGetFanMomentumModifier } from './SFanMomentum';

const fanFactions = { groupFans: 62, soloFans: 48, cpFans: 36, publicFans: 52, antiFans: 24 };

describe('SGetFanMomentumModifier', () => {
  it('rewards a healthy fan ecosystem', () => {
    const modifier = SGetFanMomentumModifier({ eventType: 'CHOICE', fanFactions, recordingMode: 'BALANCE' });

    expect(modifier).toBeCloseTo(0.0079);
  });

  it('adds CP support for pair events and caps volatile ecosystems', () => {
    const pairModifier = SGetFanMomentumModifier({ eventType: 'PICK_TWO', fanFactions: { ...fanFactions, cpFans: 75 }, recordingMode: 'BALANCE' });
    const hostileModifier = SGetFanMomentumModifier({ eventType: 'CHOICE', fanFactions: { groupFans: 0, soloFans: 0, cpFans: 0, publicFans: 0, antiFans: 100 }, recordingMode: 'BALANCE' });

    expect(pairModifier).toBeGreaterThan(0.04);
    expect(hostileModifier).toBe(-0.12);
  });
});
