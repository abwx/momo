import { describe, expect, it } from 'vitest';
import type { Character } from '../../data/characters';
import { groupShowProgram } from '../../data/groupShowProgram';
import { SCreateClassTrackState } from './SClassTrack';
import { SCreateProgramBranchEvents, SGetEpisodeBranchEvent } from './SProgramBranch';
import { SCreateSeasonState } from './SSeasonState';

const characters = Array.from({ length: 9 }, (_, index) => ({
  id: `member-${index + 1}`, name: `Member ${index + 1}`, image: '', personality: '成长势', popularity: 90 - index, description: '',
})) as Character[];

describe('SProgramBranch', () => {
  it('keeps three persisted branch variants for every episode', () => {
    const branchEvents = SCreateProgramBranchEvents(groupShowProgram);

    expect(branchEvents).toHaveLength(groupShowProgram.length * 3);
    expect(branchEvents.map(event => event.id)).toContain('event-branch-release-pressure');
  });

  it('uses class two before pressure, then pressure before the class one branch', () => {
    const branchEvents = SCreateProgramBranchEvents(groupShowProgram);
    const state = SCreateClassTrackState(characters);
    const seasonState = SCreateSeasonState();
    seasonState.biasPressure = 18;

    expect(SGetEpisodeBranchEvent(groupShowProgram[0], state, seasonState, 'member-8', branchEvents).id).toBe('event-branch-assessment-class2');
    expect(SGetEpisodeBranchEvent(groupShowProgram[0], state, seasonState, 'member-1', branchEvents).id).toBe('event-branch-assessment-pressure');

    seasonState.biasPressure = 11;
    expect(SGetEpisodeBranchEvent(groupShowProgram[0], state, seasonState, 'member-1', branchEvents).id).toBe('event-branch-assessment-class1');
  });
});
