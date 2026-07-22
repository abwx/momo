import { describe, expect, it } from 'vitest';
import { characters as characterSource, type Character } from './characters';
import { event_training_vlog_accident, event_vlog_ranking } from './events';
import type { Choice, RankingGameEvent } from './type/GameEvent';

function createCharacter(id: string, popularity: number): Character {
  return { id, name: id, image: '', personality: characterSource[0].personality, popularity, description: '' };
}

function createCharacters() {
  return [80, 79, 78, 77, 76].map((popularity, index) => createCharacter(`c${index + 1}`, popularity));
}

function getStaticChoice(index: number): Choice {
  if (!Array.isArray(event_training_vlog_accident.choices)) throw new Error('Expected static choices');
  return event_training_vlog_accident.choices[index];
}

describe('game event scoring', () => {
  it('applies ranking event rewards and penalties by submitted order', () => {
    const rankedCharacters = createCharacters();

    (event_vlog_ranking as RankingGameEvent).choices.action(rankedCharacters);

    expect(rankedCharacters.map(char => char.popularity)).toEqual([100, 94, 86, 72, 66]);
  });

  it('applies all-member choice rewards consistently', () => {
    const characters = createCharacters();

    getStaticChoice(0).action(characters);

    expect(characters.map(char => char.popularity)).toEqual([95, 94, 93, 92, 91]);
  });

  it('applies all-member choice penalties consistently', () => {
    const characters = createCharacters();

    getStaticChoice(1).action(characters);

    expect(characters.map(char => char.popularity)).toEqual([72, 71, 70, 69, 68]);
  });
});
