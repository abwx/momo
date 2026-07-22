import { describe, expect, it } from 'vitest';
import type { GameEvent } from '../../data/events';
import { SGetFollowUpEventId, SInsertFollowUpEvent } from './SGameEventChain';

const baseEvent: GameEvent = {
  id: 'event-base',
  type: 'CHOICE',
  title: '基础事件',
  description: '测试',
  choices: [],
};

const followUpEvent: GameEvent = {
  ...baseEvent,
  id: 'followup-test',
};

describe('SGameEventChain', () => {
  it('prioritizes public crisis follow-up when anti fans are high', () => {
    expect(SGetFollowUpEventId({
      eventType: 'CHOICE',
      recordingMode: 'BALANCE',
      antiFans: 58,
      topBondValue: 0,
      lowRankGrowth: 0,
    })).toBe('followup-public-crisis');
  });

  it('inserts a follow-up event only once', () => {
    const events = [baseEvent];

    SInsertFollowUpEvent(events, 0, followUpEvent);
    SInsertFollowUpEvent(events, 0, followUpEvent);

    expect(events.map(event => event.id)).toEqual(['event-base', 'followup-test']);
  });
});
