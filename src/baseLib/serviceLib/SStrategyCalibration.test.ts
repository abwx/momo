import { describe, expect, it } from 'vitest';
import type { Character } from '../../data/characters';
import { SAddAssessmentScores, SCreateClassTrackState, SGetFinaleAssessmentDelta, SIsBiasInClass1, SReshuffleClasses } from './SClassTrack';
import { SCreateSeasonScore } from './SGameScore';
import { SCreateSeasonState } from './SSeasonState';

const characters = Array.from({ length: 9 }, (_, index) => ({
  id: `member-${index + 1}`, name: `Member ${index + 1}`, image: '', personality: '成长势', popularity: 90 - index, description: '',
})) as Character[];

describe('season strategy calibration', () => {
  it('lets three routes settle with distinct seat and audit tradeoffs', () => {
    const highlight = SRunHighlightRoute();
    const ensemble = SRunEnsembleRoute();
    const comeback = SRunClass2ComebackRoute();

    expect([highlight.grade, ensemble.grade, comeback.grade]).not.toContain('F');
    expect(highlight.auditDelta).toBeLessThan(0);
    expect(ensemble.biasInClass1).toBe(false);
    expect(comeback.biasInClass1).toBe(true);
  });
});

function SRunHighlightRoute() {
  const season = { ...SCreateSeasonState(), groupHeat: 82, anticipation: 54, producerReputation: 31, biasPressure: 18, dramaDebt: 12 };
  const score = SCreateSeasonScore(characters, { groupFans: 55, soloFans: 86, cpFans: 42, publicFans: 58, antiFans: 46 }, season, 22000);
  return { grade: score.grade, auditDelta: SGetFinaleAssessmentDelta(season.biasPressure), biasInClass1: true };
}

function SRunEnsembleRoute() {
  const season = { ...SCreateSeasonState(), groupHeat: 64, producerReputation: 82, anticipation: 30, biasPressure: 2, lowRankMomentum: 12 };
  const score = SCreateSeasonScore(characters, { groupFans: 88, soloFans: 44, cpFans: 46, publicFans: 84, antiFans: 12 }, season, 56000);
  return { grade: score.grade, auditDelta: SGetFinaleAssessmentDelta(season.biasPressure), biasInClass1: false };
}

function SRunClass2ComebackRoute() {
  const state = SCreateClassTrackState(characters);
  SAddAssessmentScores(state, { 'member-8': 20, 'member-1': 1 });
  SReshuffleClasses(state, 'release', 'member-8');
  const season = { ...SCreateSeasonState(), groupHeat: 58, producerReputation: 61, lowRankMomentum: 34, biasPressure: 6 };
  const score = SCreateSeasonScore(characters, { groupFans: 72, soloFans: 52, cpFans: 40, publicFans: 70, antiFans: 25 }, season, 38000);
  return { grade: score.grade, auditDelta: SGetFinaleAssessmentDelta(season.biasPressure), biasInClass1: SIsBiasInClass1(state, 'member-8') };
}
