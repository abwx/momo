import { describe, expect, it } from 'vitest';
import type { GameEvent } from '../../data/events';
import {
  SApplyFactionReaction,
  SClampFanFactions,
  SGetResultEffectTags,
} from './SGameFeatures';
import type { SFanFactionState } from './type/SFanFactionState';

const choiceEvent: GameEvent = {
  id: 'event-test',
  type: 'CHOICE',
  title: '测试事件',
  description: '测试',
  choices: [],
};

function createFactions(): SFanFactionState {
  return {
    groupFans: 50,
    soloFans: 50,
    cpFans: 50,
    publicFans: 50,
    antiFans: 50,
  };
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

    SApplyFactionReaction(factions, '普通结果', choiceEvent, ['GROUP_BOOST', 'ANTI_RISK']);

    expect(factions.groupFans).toBe(57);
    expect(factions.antiFans).toBe(56);
  });

  it('derives fallback tags for legacy result text', () => {
    expect(SGetResultEffectTags('全员高光但也有负面争议')).toEqual(['GROUP_BOOST', 'ANTI_RISK']);
  });
});
