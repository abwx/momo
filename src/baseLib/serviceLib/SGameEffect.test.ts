import { describe, expect, it } from 'vitest';
import type { Character } from '../../data/characters';
import { SApplyGameEffect, SCreateDraftEffect, SCreateEventDraftEffect, SCreateEventFactionEffect, SCreateEventPopularityEffect } from './SGameEffect';
import { SCreateSeasonState } from './SSeasonState';
import type { SBondPair } from './type/SBondPair';
import type { SFanFactionState } from './type/SFanFactionState';

function createCharacter(id: string, popularity = 70): Character {
  return { id, name: id, image: '', personality: '全能担当', popularity, description: '' };
}

function createFactions(): SFanFactionState {
  return { groupFans: 50, soloFans: 50, cpFans: 50, publicFans: 50, antiFans: 50 };
}

describe('SGameEffect', () => {
  it('applies and clamps every canonical state change together', () => {
    const characters = [createCharacter('a', 98), createCharacter('b', 4)];
    const target = { characters, factions: createFactions(), season: SCreateSeasonState(), bondMap: {}, budget: 1000 };

    const result = SApplyGameEffect(target, { popularity: { a: 10, b: -10 }, factions: { antiFans: -80 }, season: { producerReputation: 80 }, budgetDelta: -1400 });

    expect(characters.map(character => character.popularity)).toEqual([100, 0]);
    expect(target.factions.antiFans).toBe(0);
    expect(target.season.producerReputation).toBe(100);
    expect(result.budget).toBe(0);
  });

  it('keeps event actions on a draft until their effect is applied', () => {
    const before = [createCharacter('a')];
    const draft = [createCharacter('a', 82)];

    expect(SCreateDraftEffect(before, draft).popularity).toEqual({ a: 12 });
    expect(before[0].popularity).toBe(70);
  });

  it('makes late-stage event growth harder than low-rank recovery', () => {
    const before = [createCharacter('top', 90), createCharacter('low', 60)];
    const draft = [createCharacter('top', 110), createCharacter('low', 80)];

    expect(SCreateEventDraftEffect(before, draft).popularity).toEqual({ top: 3, low: 15 });
  });

  it('saturates direct rewards for high-popularity members', () => {
    const characters = [createCharacter('top', 91), createCharacter('middle', 78)];

    expect(SCreateEventPopularityEffect(characters, { top: 15, middle: 15 }).popularity).toEqual({ top: 2, middle: 7 });
  });

  it('updates bonds and grants threshold bonuses through the reducer', () => {
    const characters = [createCharacter('a'), createCharacter('b')];
    const target = { characters, factions: createFactions(), season: SCreateSeasonState(), bondMap: {} as Record<string, SBondPair>, budget: 5000 };

    const result = SApplyGameEffect(target, { bond: { pairIds: ['a', 'b'], names: 'a x b', delta: 36, grantPopularityBonus: true } });

    expect(target.bondMap.a__b.value).toBe(36);
    expect(characters.map(character => character.popularity)).toEqual([72, 72]);
    expect(result.bondBonusText).toContain('+2');
  });

  it('rewards task partners with group support instead of CP support', () => {
    const event = { id: 'team-task', type: 'PICK_TWO' as const, pairRole: 'TEAM' as const, title: '', description: '', choices: { action: () => '' } };

    expect(SCreateEventFactionEffect(event).factions).toEqual({ groupFans: 4 });
  });
});
