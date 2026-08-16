import { computed, ref } from 'vue';
import { describe, expect, it, vi } from 'vitest';
import type { Character } from '../data/characters';
import type { GameEvent } from '../data/type/GameEvent';
import { SCreateClassTrackState } from '../baseLib/serviceLib/SClassTrack';
import { SApplyGameEffect } from '../baseLib/serviceLib/SGameEffect';
import { SCreateSeasonState } from '../baseLib/serviceLib/SSeasonState';
import { useRoundResolution } from './useRoundResolution';

const characters: Character[] = [
  { id: 'alpha', name: 'Alpha', image: '', personality: '成长势', popularity: 60, description: '' },
  { id: 'beta', name: 'Beta', image: '', personality: '成长势', popularity: 50, description: '' },
];

describe('useRoundResolution', () => {
  it('settles a finale choice through popularity, assessment, and player feedback', () => {
    const harness = createHarness();
    const draft = structuredClone(harness.characters);
    draft[0].popularity += 10;

    harness.applyEventResult('Alpha 接住了舞台。', draft, ['FINALE_AUDIT'], '保留完整高光');

    expect(harness.characters[0].popularity).toBeGreaterThan(60);
    expect(harness.classTrack.assessmentScore.alpha).toBeGreaterThan(6);
    expect(harness.applyEffect).toHaveBeenCalledWith(expect.objectContaining({ budgetDelta: -3500 }));
    expect(harness.showRoundResult).toHaveBeenCalledWith(expect.any(String), '保留完整高光', expect.any(Array), ['FINALE_AUDIT'], expect.arrayContaining([expect.stringContaining('路线结果：触发收官审查'), expect.stringContaining('收官席位赌局')]));
  });
});

function createHarness() {
  const localCharacters = structuredClone(characters);
  const currentEvent = ref<GameEvent>({ id: 'finale', type: 'CHOICE', title: '', description: '', choices: [] });
  const classTrack = SCreateClassTrackState(localCharacters);
  const seasonState = SCreateSeasonState();
  const fanFactions = { groupFans: 60, soloFans: 40, cpFans: 30, publicFans: 50, antiFans: 20 };
  const bondMap = {};
  let budget = 100000;
  const showRoundResult = vi.fn();
  const applyEffect = vi.fn((effect: Parameters<typeof SApplyGameEffect>[1]) => {
    const result = SApplyGameEffect({ characters: localCharacters, factions: fanFactions, season: seasonState, bondMap, budget }, effect);
    budget = result.budget;
    return result;
  });
  const { applyEventResult } = useRoundResolution({ applyEffect, biasCharacterId: ref('alpha'), captureScenePair: () => undefined, characters: localCharacters, classTrackState: classTrack, currentEvent: computed(() => currentEvent.value), currentEventIndex: ref(0), fanFactions, getRandomValue: () => 0.99, getRankingList: () => [], getSelectedPair: () => [], nextEpisodeHook: computed(() => null), programPlan: ref(null), seasonState, showRoundResult });
  return { applyEffect, applyEventResult, characters: localCharacters, classTrack, showRoundResult };
}
