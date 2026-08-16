import { describe, expect, it } from 'vitest';
import { SGetNarrativeChoiceHint, SGetNarrativeOutcomes, SGetNarrativeTagEffect, SGetNarrativeThreads, SGetProducerIdentity } from './SGameNarrative';
import { SCreateSeasonState } from './SSeasonState';

describe('SGameNarrative', () => {
  it('shows a heated drama line before its follow-up is resolved', () => {
    const state = SCreateSeasonState();
    state.dramaDebt = 8;

    expect(SGetNarrativeThreads(state)).toContainEqual(expect.objectContaining({ key: 'drama', stage: 'HEATED' }));
    expect(SGetNarrativeTagEffect(['DRAMA_SETTLE'])).toMatchObject({ dramaDebt: -8 });
  });

  it('assigns a producer identity from actual season behavior', () => {
    const state = SCreateSeasonState();
    state.biasPressure = 16;

    expect(SGetProducerIdentity(state).title).toBe('本命操盘手');
  });

  it('records a settlement outcome for a sustained bias route', () => {
    const state = SCreateSeasonState();
    state.biasPressure = 8;

    expect(SGetNarrativeOutcomes(state, [], null, 0)).toHaveLength(1);
  });

  it('shows concrete decision costs for narrative choices', () => {
    expect(SGetNarrativeChoiceHint(['FOCUS_ESCALATE'])).toContain('偏心压力 +6');
  });
});
