import { describe, expect, it } from 'vitest';
import type { Character } from '../../data/characters';
import { SGetFanPulse } from './SFanPulse';

const characters: Character[] = [
  { id: 'top', name: 'Top', image: '', personality: '综艺感', popularity: 88, description: '' },
  { id: 'bias', name: 'Bias', image: '', personality: '成长势', popularity: 70, description: '' },
  { id: 'low', name: 'Low', image: '', personality: '快乐担', popularity: 60, description: '' },
];

function createContext(tags: string[] = []) {
  return { biasCharacter: characters[1], characters, factions: { groupFans: 60, soloFans: 48, cpFans: 36, publicFans: 52, antiFans: 24 }, hasNegativeTrending: false, lastTags: tags as [], scenePairIds: null, step: 0, season: { groupHeat: 0, producerReputation: 0, anticipation: 0, biasPressure: 0, dramaDebt: 0, cpHeat: 0, crisisCount: 0, fanPulseEventIndex: -1, fanPulseStep: 0, programPlanPromptIndex: 0, lastCrisisEventIndex: -1, lowRankMomentum: 0 } };
}

describe('SFanPulse', () => {
  it('turns a focus escalation into a group-facing follow-up and pair suggestion', () => {
    const pulse = SGetFanPulse(createContext(['FOCUS_ESCALATE']));
    expect(pulse.program).toBe('GROUP');
    expect(pulse.pairIds).toContain('bias');
    expect(pulse.project).toBe('VLOG');
  });

  it('prioritizes crisis handling when a negative tag is the latest feedback', () => {
    const pulse = SGetFanPulse(createContext(['DRAMA_ESCALATE']));
    expect(pulse.program).toBe('ANTI');
    expect(pulse.project).toBe('VLOG');
  });

  it('prioritizes an active negative hot topic over a growth opportunity', () => {
    const pulse = SGetFanPulse({ ...createContext(), hasNegativeTrending: true });
    expect(pulse.program).toBe('ANTI');
  });

  it('moves to a follow-up brief after the first feedback is handled', () => {
    const pulse = SGetFanPulse({ ...createContext(['UNDERDOG_SPOTLIGHT']), step: 1 });
    expect(pulse.phase).toBe('FOLLOW_UP');
    expect(pulse.program).toBe('GROUP');
  });

  it('keeps a just-filmed pair as the next suggested duo', () => {
    const pulse = SGetFanPulse({ ...createContext(), scenePairIds: ['bias', 'low'] });
    expect(pulse.pairIds).toEqual(['bias', 'low']);
  });
});
