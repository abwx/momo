import { describe, expect, it } from 'vitest';
import type { Character } from '../../data/characters';
import type { EventHistoryItem } from '../../data/type/SettlementReport';
import { SAddAssessmentScores, SApplyEpisodeAssessment, SCreateClassPopularityDeltas, SCreateEventAssessmentDeltas, SCreateFinaleAssessmentDeltas, SCreateClassTrackState, SGetAssessmentStanding, SGetClassMultiplier, SGetJustCompletedEpisode, SReshuffleClasses } from './SClassTrack';

const characters = Array.from({ length: 9 }, (_, index) => ({ id: `member-${index + 1}`, name: `Member ${index + 1}`, image: '', personality: '成长势', popularity: 90 - index, description: '' })) as Character[];

describe('SClassTrack', () => {
  it('places the opening top seven in class one', () => {
    const state = SCreateClassTrackState(characters);

    expect(Object.values(state.classById).filter(value => value === 'CLASS1')).toHaveLength(7);
    expect(state.classById['member-8']).toBe('CLASS2');
  });

  it('reshuffles promotion and demotion from assessment rankings', () => {
    const state = SCreateClassTrackState(characters);
    SAddAssessmentScores(state, { 'member-8': 20, 'member-1': 1 });
    const result = SReshuffleClasses(state, 'assessment', 'member-8');

    expect(result.promotedIds).toContain('member-8');
    expect(result.demotedIds).toContain('member-7');
    expect(result.biasClass).toBe('CLASS1');
  });

  it('reduces class two popularity returns and detects one unfinished episode', () => {
    const state = SCreateClassTrackState(characters);
    const program = [{ id: 'assessment', title: '', summary: '', eventIds: ['one', 'two'], branchEventIds: ['branch'] }];
    const history: EventHistoryItem[] = [{ event: { id: 'one', type: 'CHOICE', title: '', description: '', choices: [] }, result: '' }];

    expect(SGetClassMultiplier(state, 'member-8')).toBe(0.85);
    expect(SGetJustCompletedEpisode(program, history, [])).toBeNull();
  });

  it('returns an episode exactly once after its last node completes', () => {
    const program = [{ id: 'assessment', title: '', summary: '', eventIds: ['one'], branchEventIds: ['branch'] }];
    const history: EventHistoryItem[] = [
      { event: { id: 'one', type: 'CHOICE', title: '', description: '', choices: [] }, result: '' },
      { event: { id: 'branch', type: 'CHOICE', title: '', description: '', choices: [] }, result: '' },
    ];

    expect(SGetJustCompletedEpisode(program, history, [])?.id).toBe('assessment');
    expect(SGetJustCompletedEpisode(program, history, [{ episodeId: 'assessment', rankedIds: [], promotedIds: [], demotedIds: [], biasClass: 'CLASS1' }])).toBeNull();
  });

  it('applies the class two multiplier to assessment gains', () => {
    const state = SCreateClassTrackState(characters);
    const eventDeltas = SCreateEventAssessmentDeltas(state, { 'member-1': 10, 'member-8': 10 });
    const popularityDeltas = SCreateClassPopularityDeltas(state, { 'member-1': 10, 'member-8': 10 });
    expect(eventDeltas).toEqual({ 'member-1': 3, 'member-8': 3 });
    expect(popularityDeltas).toEqual({ 'member-1': 10, 'member-8': 8.5 });
  });

  it('reports the score and distance to the class one cutoff', () => {
    const state = SCreateClassTrackState(characters);
    SAddAssessmentScores(state, { 'member-1': 20, 'member-8': 12, 'member-9': 8 });

    expect(SGetAssessmentStanding(state, 'member-8')).toMatchObject({ score: 20, rank: 2, cutoffScore: 9, distanceToClass1: 11 });
  });

  it('carries part of prior scores forward and gives class two a catch-up baseline', () => {
    const state = SCreateClassTrackState(characters);
    SAddAssessmentScores(state, { 'member-1': 20, 'member-8': 10 });
    SApplyEpisodeAssessment(state, characters);

    expect(state.assessmentScore['member-1']).toBe(16);
    expect(state.assessmentScore['member-8']).toBe(14);
  });

  it('applies the final audit penalty to an overexposed bias', () => {
    const state = SCreateClassTrackState(characters);

    expect(SCreateFinaleAssessmentDeltas(state, 'member-1', 0, true)).toEqual({ 'member-1': 5 });
    expect(SCreateFinaleAssessmentDeltas(state, 'member-1', 12, true)).toEqual({ 'member-1': -4 });
    expect(SCreateFinaleAssessmentDeltas(state, 'member-1', 12, false)).toEqual({});
  });

  it('slows a class one leader while keeping a class two catch-up route', () => {
    const state = SCreateClassTrackState(characters);
    SAddAssessmentScores(state, { 'member-1': 20 });

    expect(SCreateEventAssessmentDeltas(state, { 'member-1': 20, 'member-8': 20 }))
      .toEqual({ 'member-1': 2, 'member-8': 5 });
  });
});
