import { describe, expect, it } from 'vitest';
import { characters as characterSource, type Character } from '../../data/characters';
import type { GameEvent } from '../../data/events';
import {
  SApplyBondBonus,
  SApplyFactionReaction,
  SClampFanFactions,
  SGetResultEffectTags,
} from './SGameFeatures';
import type { SFanFactionState } from './type/SFanFactionState';

const choiceEvent: GameEvent = {
  id: 'event-test',
  type: 'CHOICE',
  title: 'test event',
  description: 'test',
  choices: [],
};

function createFactions(): SFanFactionState {
  return { groupFans: 50, soloFans: 50, cpFans: 50, publicFans: 50, antiFans: 50 };
}

function createCharacter(id: string): Character {
  return { id, name: id, image: '', personality: characterSource[0].personality, popularity: 70, description: '' };
}

describe('SGameFeatures', () => {
  it('clamps fan faction values to the valid range', () => {
    const factions = createFactions();
    factions.groupFans = 120;
    factions.antiFans = -10;

    SClampFanFactions(factions);

    expect(factions.groupFans).toBe(100);
    expect(factions.antiFans).toBe(0);
  });

  it('applies structured effect tags without reading result text', () => {
    const factions = createFactions();

    SApplyFactionReaction(factions, 'plain result', choiceEvent, ['GROUP_BOOST', 'ANTI_RISK']);

    expect(factions.groupFans).toBe(57);
    expect(factions.antiFans).toBe(56);
  });

  it('does not derive fallback tags from unrelated result text', () => {
    expect(SGetResultEffectTags('plain result')).toEqual([]);
  });

  it('applies bond bonus only after the bond threshold', () => {
    const pair = [createCharacter('a'), createCharacter('b')];

    SApplyBondBonus(pair, { key: 'a__b', names: 'a x b', value: 36 });

    expect(pair.map(char => char.popularity)).toEqual([74, 74]);
  });

  it('uses the higher bond bonus at the second threshold', () => {
    const pair = [createCharacter('a'), createCharacter('b')];

    SApplyBondBonus(pair, { key: 'a__b', names: 'a x b', value: 72 });

    expect(pair.map(char => char.popularity)).toEqual([78, 78]);
  });
});
