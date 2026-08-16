import { describe, expect, it } from 'vitest';
import { groupShowEvents } from './groupShowEvents';
import { groupShowProgram } from './groupShowProgram';

describe('groupShowProgram', () => {
  it('uses four authored episodes in recording order', () => {
    expect(groupShowProgram.map(episode => episode.id)).toEqual([
      'assessment', 'morning', 'duo-stage', 'release',
    ]);
  });

  it('does not repeat a recording node in the main season', () => {
    const scheduledIds = groupShowProgram.flatMap(episode => episode.eventIds);

    expect(new Set(scheduledIds)).toHaveLength(scheduledIds.length);
  });

  it('resolves every scheduled event from the show event library', () => {
    const eventIds = groupShowEvents.map(event => event.id);
    const scheduledIds = groupShowProgram.flatMap(episode => episode.eventIds);

    expect(eventIds).toEqual(expect.arrayContaining(scheduledIds));
  });

  it('keeps ranking nodes aligned to the top-five heat pool', () => {
    const rankingEvents = groupShowEvents.filter(event => event.type === 'RANKING');
    expect(rankingEvents.length).toBeGreaterThan(0);
    rankingEvents.forEach(event => {
      expect(event.description).toContain('热度前五');
    });
  });
});
