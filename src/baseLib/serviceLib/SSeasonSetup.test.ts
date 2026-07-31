import { describe, expect, it } from 'vitest';
import type { Character } from '../../data/characters';
import type { GameEvent } from '../../data/events';
import type { ProgramEpisode } from '../../data/type/ProgramEpisode';
import { setRandomSource } from '../../utils/random';
import { SCreateProgramSeasonEvents, SJitterStartingPopularity } from './SSeasonSetup';

const characters: Character[] = [
  { id: 'a', name: '甲', image: '', personality: '成长势', popularity: 76, description: '' },
  { id: 'b', name: '乙', image: '', personality: '综艺感', popularity: 80, description: '' },
];

const events = [
  { id: 'open', type: 'CHOICE', title: '开场', description: '', choices: [] },
  { id: 'a', type: 'CHOICE', title: 'A', description: '', choices: [] },
  { id: 'b', type: 'CHOICE', title: 'B', description: '', choices: [] },
  { id: 'c', type: 'CHOICE', title: 'C', description: '', choices: [] },
] as GameEvent[];

describe('SSeasonSetup', () => {
  it('jitters starting popularity within bounds', () => {
    setRandomSource(() => 0.99);
    const next = SJitterStartingPopularity(characters, 7);
    expect(next[0].popularity).toBeGreaterThanOrEqual(50);
    expect(next[0].popularity).toBeLessThanOrEqual(95);
    expect(next.map(item => item.popularity)).not.toEqual(characters.map(item => item.popularity));
    setRandomSource();
  });

  it('builds the program in its authored recording order', () => {
    const program: ProgramEpisode[] = [{ id: 'episode-a', title: 'A', summary: '', eventIds: ['a', 'b'], branchEventIds: ['branch-a'] }];
    const season = SCreateProgramSeasonEvents(events[0], events.slice(1), program);

    expect(season.map(event => event.id)).toEqual(['open', 'a', 'b']);
  });
});
