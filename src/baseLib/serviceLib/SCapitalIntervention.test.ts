import { describe, expect, it } from 'vitest';
import {
  CAPITAL_BOOST_COST,
  CAPITAL_SUPPRESS_COST,
  SCreateCapitalInterventionOutcome,
  SGetCapitalInterventionCost,
} from './SCapitalIntervention';
import { SCreateClassTrackState } from './SClassTrack';

const characters = [
  { id: 'member-a', name: 'A', image: '', personality: '成长势' as const, popularity: 80, description: '' },
  { id: 'member-b', name: 'B', image: '', personality: '综艺感' as const, popularity: 70, description: '' },
];

describe('SCapitalIntervention', () => {
  it('creates a paid heat boost for the selected member', () => {
    const state = SCreateClassTrackState(characters, 1);

    expect(SCreateCapitalInterventionOutcome(state, characters[0], 'BOOST').effect).toEqual({
      budgetDelta: -CAPITAL_BOOST_COST,
      popularity: { 'member-a': 6 },
    });
  });

  it('creates a paid heat suppression for the selected member', () => {
    const state = SCreateClassTrackState(characters, 1);

    expect(SGetCapitalInterventionCost('SUPPRESS')).toBe(CAPITAL_SUPPRESS_COST);
    expect(SCreateCapitalInterventionOutcome(state, characters[0], 'SUPPRESS').effect.popularity).toEqual({ 'member-a': -6 });
  });

  it('uses the effective boundary delta for popularity and seats', () => {
    const state = SCreateClassTrackState(characters, 1);
    const nearMax = { ...characters[0], popularity: 98 };
    const nearMin = { ...characters[1], popularity: 2 };

    expect(SCreateCapitalInterventionOutcome(state, nearMax, 'BOOST')).toMatchObject({ popularityDelta: 2, seatDelta: 1, cost: 6700 });
    expect(SCreateCapitalInterventionOutcome(state, nearMin, 'SUPPRESS')).toMatchObject({ popularityDelta: -2, seatDelta: -1, cost: 5400 });
  });
});
