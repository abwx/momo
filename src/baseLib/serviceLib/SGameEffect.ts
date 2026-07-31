import type { Character } from '../../data/characters';
import type { GameEffectTag, GameEvent } from '../../data/type/GameEvent';
import type { SBondPair } from './type/SBondPair';
import type { SFanFactionState } from './type/SFanFactionState';
import type { SGameEffect } from './type/SGameEffect';
import type { SSeasonState } from './type/SSeasonState';
import { SClampFanFactions } from './SGameFeatures';
import { SClampSeasonState } from './SSeasonState';

const POPULARITY_MIN = 0;
const POPULARITY_MAX = 100;

export interface SGameEffectTarget {
  characters: Character[];
  factions: SFanFactionState;
  season: SSeasonState;
  bondMap: Record<string, SBondPair>;
  budget: number;
}

export interface SGameEffectResult {
  budget: number;
  affectedIds: string[];
  bondBonusText: string;
}

/** Applies every business consequence through one clamped state boundary. */
export function SApplyGameEffect(target: SGameEffectTarget, effect: SGameEffect): SGameEffectResult {
  const affectedIds = SApplyPopularity(target.characters, effect.popularity);
  SApplyRecord(target.factions, effect.factions);
  SApplyRecord(target.season, effect.season);
  const bondBonusText = SApplyBondEffect(target, effect, affectedIds);
  SClampFanFactions(target.factions);
  SClampSeasonState(target.season);
  return { budget: SApplyBudget(target.budget, effect.budgetDelta), affectedIds, bondBonusText };
}

export function SCreateDraftEffect(before: Character[], after: Character[], tags: GameEffectTag[] = []): SGameEffect {
  return { popularity: SGetPopularityDelta(before, after), tags };
}

/** Reduces event windfalls at high popularity while keeping low-rank recovery viable. */
export function SCreateEventDraftEffect(before: Character[], after: Character[], tags: GameEffectTag[] = []): SGameEffect {
  const effect = SCreateDraftEffect(before, after, tags);
  return { ...effect, popularity: SNormalizeEventPopularity(before, effect.popularity || {}) };
}

/** Applies late-season popularity saturation to direct interactive rewards. */
export function SCreateEventPopularityEffect(before: Character[], popularity: Record<string, number>, tags: GameEffectTag[] = []): SGameEffect {
  return { popularity: SNormalizeEventPopularity(before, popularity), tags };
}

export function SCreateFactionDraftEffect(before: SFanFactionState, after: SFanFactionState): Partial<SFanFactionState> {
  return Object.keys(after).reduce((effect, key) => SAddFactionDelta(effect, before, after, key as keyof SFanFactionState), {} as Partial<SFanFactionState>);
}

export function SCreateEventFactionEffect(event: GameEvent, tags: GameEffectTag[] = []): SGameEffect {
  const factions = SCreateEventFactions(event);
  return { factions: SAddTagFactions(factions, tags), tags };
}

function SCreateEventFactions(event: GameEvent): Partial<SFanFactionState> {
  if (event.type === 'PICK_TWO') return event.pairRole === 'TEAM' ? { groupFans: 4 } : { cpFans: 5 };
  return event.type === 'RANKING' ? { soloFans: 4 } : {};
}

function SApplyPopularity(characters: Character[], popularity: Record<string, number> = {}): string[] {
  return characters.flatMap(character => SApplyCharacterPopularity(character, popularity[character.id] || 0));
}

function SApplyCharacterPopularity(character: Character, delta: number): string[] {
  if (!delta) return [];
  character.popularity = SClampPopularity(character.popularity + delta);
  return [character.id];
}

function SApplyRecord<T extends object>(target: T, effect: Partial<T> = {}): void {
  const values = target as Record<string, number>;
  Object.entries(effect).forEach(([key, delta]) => values[key] += Number(delta) || 0);
}

function SApplyBondEffect(target: SGameEffectTarget, effect: SGameEffect, affectedIds: string[]): string {
  if (!effect.bond) return '';
  const { pairIds, names, delta, grantPopularityBonus } = effect.bond;
  const key = [...pairIds].sort().join('__');
  const value = Math.min(100, (target.bondMap[key]?.value || 0) + delta);
  target.bondMap[key] = { key, names, value };
  return grantPopularityBonus ? SApplyBondPopularity(target.characters, pairIds, names, value, affectedIds) : '';
}

function SApplyBondPopularity(characters: Character[], pairIds: string[], names: string, value: number, affectedIds: string[]): string {
  const bonus = value >= 72 ? 4 : value >= 36 ? 2 : 0;
  if (!bonus) return '';
  characters.filter(char => pairIds.includes(char.id)).forEach(char => SApplyBondBonus(char, bonus, affectedIds));
  return `${names} 化学反应升温，双方人气额外 +${bonus}。`;
}

function SApplyBondBonus(character: Character, bonus: number, affectedIds: string[]): void {
  character.popularity = SClampPopularity(character.popularity + bonus);
  affectedIds.push(character.id);
}

function SApplyBudget(budget: number, delta = 0): number {
  return Math.max(0, budget + delta);
}

function SClampPopularity(value: number): number {
  return Math.max(POPULARITY_MIN, Math.min(POPULARITY_MAX, value));
}

function SGetPopularityDelta(before: Character[], after: Character[]): Record<string, number> {
  return after.reduce((delta, character) => SAddCharacterDelta(delta, before, character), {} as Record<string, number>);
}

function SNormalizeEventPopularity(before: Character[], popularity: Record<string, number>): Record<string, number> {
  return Object.fromEntries(Object.entries(popularity).map(([id, delta]) => [id, SGetEventDelta(before, id, delta)]));
}

function SGetEventDelta(before: Character[], id: string, delta: number): number {
  if (delta <= 0) return Math.floor(delta * 1.15);
  const popularity = before.find(character => character.id === id)?.popularity || 0;
  const multiplier = popularity >= 90 ? 0.15 : popularity >= 80 ? 0.3 : popularity >= 70 ? 0.5 : popularity >= 55 ? 0.75 : 1;
  return Math.max(1, Math.floor(delta * multiplier));
}

function SAddCharacterDelta(delta: Record<string, number>, before: Character[], character: Character): Record<string, number> {
  const original = before.find(item => item.id === character.id);
  const value = character.popularity - (original?.popularity || character.popularity);
  if (value) delta[character.id] = value;
  return delta;
}

function SAddFactionDelta(effect: Partial<SFanFactionState>, before: SFanFactionState, after: SFanFactionState, key: keyof SFanFactionState): Partial<SFanFactionState> {
  const delta = after[key] - before[key];
  if (delta) effect[key] = delta;
  return effect;
}

function SAddTagFactions(factions: Partial<SFanFactionState>, tags: GameEffectTag[]): Partial<SFanFactionState> {
  if (tags.includes('GROUP_BOOST')) factions.groupFans = (factions.groupFans || 0) + 7;
  if (tags.includes('ANTI_RISK')) factions.antiFans = (factions.antiFans || 0) - 6;
  if (tags.includes('PUBLIC_BOOST')) factions.publicFans = (factions.publicFans || 0) + 5;
  if (tags.includes('DRAMA_ESCALATE')) factions.antiFans = (factions.antiFans || 0) + 7;
  if (tags.includes('DRAMA_SETTLE')) factions.antiFans = (factions.antiFans || 0) - 9;
  if (tags.includes('FOCUS_ESCALATE')) factions.soloFans = (factions.soloFans || 0) + 5;
  if (tags.includes('FOCUS_SETTLE')) factions.groupFans = (factions.groupFans || 0) + 5;
  if (tags.includes('CP_ESCALATE')) factions.cpFans = (factions.cpFans || 0) + 8;
  if (tags.includes('CP_SETTLE')) factions.groupFans = (factions.groupFans || 0) + 4;
  if (tags.includes('UNDERDOG_SPOTLIGHT')) factions.publicFans = (factions.publicFans || 0) + 5;
  return factions;
}
