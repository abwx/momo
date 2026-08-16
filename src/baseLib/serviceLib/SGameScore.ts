import type { Character } from '../../data/characters';
import type { SFanFactionState } from './type/SFanFactionState';
import type { SSeasonScore, SSeasonScoreItem } from './type/SSeasonScore';
import type { SSeasonState } from './type/SSeasonState';

export function SCreateSeasonScore(characters: Character[], factions: SFanFactionState, season: SSeasonState, budget: number): SSeasonScore {
  const items = SCreateScoreItems(characters, factions, season, budget);
  const total = Math.round(items.reduce((sum, item) => sum + item.contribution, 0));
  const rawGrade = SGetSeasonGrade(total);
  const cap = SGetGradeCap(factions, season, budget);
  return { total, grade: SLimitGrade(rawGrade, cap.grade), rawGrade, gradeCap: cap.grade, gradeCapReason: cap.reason, items };
}

function SCreateScoreItems(characters: Character[], factions: SFanFactionState, season: SSeasonState, budget: number): SSeasonScoreItem[] {
  const popularity = SGetAveragePopularity(characters);
  return [
    SCreateItem('popularity', '成员热度', popularity, 0.28),
    SCreateItem('groupHeat', '节目热度', season.groupHeat, 0.17),
    SCreateItem('reputation', '制作口碑', season.producerReputation, 0.15),
    SCreateItem('public', '路人好感', factions.publicFans, 0.12),
    SCreateItem('stability', '粉圈稳定', 100 - factions.antiFans, 0.1),
    SCreateItem('budget', '预算健康', Math.min(100, budget / 1000), 0.08),
    SCreateItem('route', '路线完成度', SGetRouteScore(characters, factions, season), 0.1),
  ];
}

function SGetRouteScore(characters: Character[], factions: SFanFactionState, season: SSeasonState): number {
  return Math.max(SGetAggressiveScore(factions, season), SGetSteadyScore(factions, season), SGetEnsembleScore(characters, factions));
}

function SGetAggressiveScore(factions: SFanFactionState, season: SSeasonState): number {
  return season.groupHeat * 0.6 + season.anticipation * 0.5 + season.producerReputation * 0.25 - factions.antiFans * 0.2 - season.dramaDebt * 0.5;
}

function SGetSteadyScore(factions: SFanFactionState, season: SSeasonState): number {
  return (season.producerReputation + factions.publicFans + 100 - factions.antiFans) / 3;
}

function SGetEnsembleScore(characters: Character[], factions: SFanFactionState): number {
  const gap = Math.max(...characters.map(char => char.popularity)) - Math.min(...characters.map(char => char.popularity));
  return (factions.groupFans + factions.publicFans + Math.max(0, 100 - gap * 2)) / 3;
}

function SCreateItem(key: string, label: string, value: number, weight: number): SSeasonScoreItem {
  const safeValue = Math.max(0, Math.min(100, Math.round(value)));
  return { key, label, value: safeValue, weight, contribution: safeValue * weight };
}

function SGetAveragePopularity(characters: Character[]): number {
  return characters.reduce((sum, character) => sum + character.popularity, 0) / characters.length;
}

export function SGetSeasonGrade(total: number): string {
  if (total >= 96) return 'SSS';
  if (total >= 91) return 'SS';
  if (total >= 86) return 'S';
  if (total >= 80) return 'A';
  if (total >= 72) return 'B';
  if (total >= 64) return 'C';
  if (total >= 54) return 'D';
  return 'F';
}

function SGetGradeCap(factions: SFanFactionState, season: SSeasonState, budget: number) {
  const unresolvedRisk = Math.max(season.biasPressure, season.dramaDebt, season.cpHeat);
  if (factions.antiFans >= 40 || unresolvedRisk >= 16 || budget < 10000) return SCreateGradeCap('B', '舆情、叙事或经费已失控');
  if (factions.antiFans >= 24 || unresolvedRisk >= 10 || budget < 20000) return SCreateGradeCap('A', '需先压住基线以上的负面、偏心或过度营业');
  if (factions.antiFans >= 18 || unresolvedRisk >= 6 || budget < 35000) return SCreateGradeCap('S', '制作稳定度仍有明显短板');
  if (factions.antiFans >= 12 || unresolvedRisk >= 3 || budget < 50000) return SCreateGradeCap('SS', '制作稳定度尚未达到满分标准');
  return SCreateGradeCap('SSS', '');
}

function SCreateGradeCap(grade: string, reason: string) {
  return { grade, reason };
}

function SLimitGrade(rawGrade: string, gradeCap: string): string {
  return SGetGradeIndex(rawGrade) > SGetGradeIndex(gradeCap) ? gradeCap : rawGrade;
}

function SGetGradeIndex(grade: string): number {
  return ['F', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS'].indexOf(grade);
}
