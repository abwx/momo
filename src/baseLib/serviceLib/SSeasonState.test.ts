import { describe, expect, it } from 'vitest';
import { SClampSeasonState, SCreateSeasonState } from './SSeasonState';

describe('SSeasonState', () => {
  it('clamps scores without corrupting the flow indices', () => {
    const state = SCreateSeasonState();
    state.groupHeat = 128;
    state.fanPulseEventIndex = 152;
    state.fanPulseStep = 152;
    state.lastCrisisEventIndex = -4;

    SClampSeasonState(state);

    expect(state.groupHeat).toBe(100);
    expect(state.fanPulseEventIndex).toBe(152);
    expect(state.fanPulseStep).toBe(152);
    expect(state.lastCrisisEventIndex).toBe(-4);
  });
});
