import { describe, expect, it } from 'vitest';
import { SGetNarrativeOutcomes, SGetNarrativeTagEffect, SGetNarrativeThreads, SGetProducerIdentity } from './SGameNarrative';
import { SCreateSeasonState } from './SSeasonState';
import { SCreateStudioLedger } from './SStudioLedger';

describe('SGameNarrative', () => {
  it('shows a heated drama line before its follow-up is resolved', () => {
    const state = SCreateSeasonState();
    state.dramaDebt = 8;

    expect(SGetNarrativeThreads(state)).toContainEqual(expect.objectContaining({ key: 'drama', stage: 'HEATED' }));
    expect(SGetNarrativeTagEffect(['DRAMA_SETTLE'])).toMatchObject({ dramaDebt: -8 });
  });

  it('assigns a producer identity from actual season behavior', () => {
    const state = SCreateSeasonState();
    const ledger = SCreateStudioLedger();
    ledger.recordingModes.FOCUS = 4;

    expect(SGetProducerIdentity(state, ledger).title).toBe('本命操盘手');
  });

  it('records a distinct settlement outcome for an unresolved failure route', () => {
    const state = SCreateSeasonState();
    const history = [{ event: { id: 'followup-drama-collapse', type: 'CHOICE' as const, title: '', description: '', choices: [] }, result: '' }];

    expect(SGetNarrativeOutcomes(state, history, null, 0)).toHaveLength(1);
  });
});
