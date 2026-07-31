import { describe, expect, it } from 'vitest';
import type { Character } from '../../data/characters';
import { SCreateSeasonScore, SGetSeasonGrade } from './SGameScore';
import { SCreateSeasonState } from './SSeasonState';
import type { SFanFactionState } from './type/SFanFactionState';

function createCharacters(popularity: number): Character[] {
  return [{ id: 'a', name: 'a', image: '', personality: '全能担当', popularity, description: '' }];
}

describe('SGameScore', () => {
  it('grades the complete season state instead of popularity alone', () => {
    const season = SCreateSeasonState();
    const factions: SFanFactionState = { groupFans: 50, soloFans: 50, cpFans: 50, publicFans: 100, antiFans: 0 };
    season.groupHeat = 100;
    season.producerReputation = 100;

    const score = SCreateSeasonScore(createCharacters(100), factions, season, 100000);

    expect(score.total).toBe(100);
    expect(score.grade).toBe('SSS');
    expect(score.items).toHaveLength(7);
  });

  it('reserves high grades for consistently strong seasons', () => {
    const season = SCreateSeasonState();
    const factions: SFanFactionState = { groupFans: 50, soloFans: 50, cpFans: 50, publicFans: 85, antiFans: 15 };
    season.groupHeat = 85;
    season.producerReputation = 85;

    const score = SCreateSeasonScore(createCharacters(85), factions, season, 85000);

    expect(score.total).toBe(85);
    expect(score.grade).toBe('A');
  });

  it('recognizes aggressive, steady, and ensemble routes without removing their tradeoffs', () => {
    const aggressive = SCreateSeasonState();
    aggressive.groupHeat = 92; aggressive.anticipation = 70; aggressive.dramaDebt = 14;
    const steady = SCreateSeasonState();
    steady.groupHeat = 78; steady.producerReputation = 92;
    const ensemble = SCreateSeasonState();
    ensemble.groupHeat = 76; ensemble.producerReputation = 76;
    const factions = { groupFans: 60, soloFans: 50, cpFans: 50, publicFans: 90, antiFans: 10 };
    const ensembleFactions = { groupFans: 94, soloFans: 50, cpFans: 50, publicFans: 84, antiFans: 20 };

    const aggressiveScore = SCreateSeasonScore(createCharacters(88), factions, aggressive, 70000);
    const steadyScore = SCreateSeasonScore(createCharacters(82), factions, steady, 70000);
    const ensembleScore = SCreateSeasonScore(createCharacters(82), ensembleFactions, ensemble, 70000);

    expect(aggressiveScore.items.find(item => item.key === 'route')?.value).toBeGreaterThanOrEqual(90);
    expect(steadyScore.items.find(item => item.key === 'route')?.value).toBeGreaterThanOrEqual(90);
    expect(ensembleScore.items.find(item => item.key === 'route')?.value).toBeGreaterThanOrEqual(90);
    expect([aggressiveScore.grade, steadyScore.grade, ensembleScore.grade]).toEqual(['A', 'A', 'A']);
  });

  it('treats unresolved drama debt as a cost instead of a route reward', () => {
    const resolved = SCreateSeasonState();
    const unresolved = SCreateSeasonState();
    const factions = { groupFans: 60, soloFans: 50, cpFans: 50, publicFans: 82, antiFans: 20 };

    resolved.groupHeat = 88; resolved.anticipation = 68; resolved.producerReputation = 74;
    unresolved.groupHeat = 88; unresolved.anticipation = 68; unresolved.producerReputation = 74; unresolved.dramaDebt = 18;

    const resolvedRoute = SCreateSeasonScore(createCharacters(82), factions, resolved, 70000).items.find(item => item.key === 'route')?.value || 0;
    const unresolvedRoute = SCreateSeasonScore(createCharacters(82), factions, unresolved, 70000).items.find(item => item.key === 'route')?.value || 0;

    expect(unresolvedRoute).toBeLessThan(resolvedRoute);
  });

  it('uses a complete grade ladder with rare S-tier results', () => {
    expect(SGetSeasonGrade(96)).toBe('SSS');
    expect(SGetSeasonGrade(91)).toBe('SS');
    expect(SGetSeasonGrade(86)).toBe('S');
    expect(SGetSeasonGrade(85)).toBe('A');
    expect(SGetSeasonGrade(72)).toBe('B');
    expect(SGetSeasonGrade(64)).toBe('C');
    expect(SGetSeasonGrade(54)).toBe('D');
    expect(SGetSeasonGrade(53)).toBe('F');
  });
});
