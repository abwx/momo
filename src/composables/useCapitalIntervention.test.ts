import { reactive, ref } from 'vue';
import { describe, expect, it, vi } from 'vitest';
import type { Character } from '../data/characters';
import { SCreateClassTrackState } from '../baseLib/serviceLib/SClassTrack';
import { SApplyGameEffect } from '../baseLib/serviceLib/SGameEffect';
import { SCreateSeasonState } from '../baseLib/serviceLib/SSeasonState';
import { useCapitalIntervention } from './useCapitalIntervention';

describe('useCapitalIntervention', () => {
  it('records the effective edge outcome and locks the current camera segment', () => {
    const harness = createHarness(98);

    harness.handleCapitalIntervention('bias', 'BOOST');

    expect(harness.characters[0].popularity).toBe(100);
    expect(harness.budget.value).toBe(93300);
    expect(harness.actions[0]).toMatchObject({ popularityDelta: 2, seatDelta: 1, cost: 6700 });
    expect(harness.capitalInterventionAvailable.value).toBe(false);
  });

  it('rejects suppression of the bias member before any cost is applied', () => {
    const harness = createHarness(70);

    harness.handleCapitalIntervention('bias', 'SUPPRESS');

    expect(harness.characters[0].popularity).toBe(70);
    expect(harness.budget.value).toBe(100000);
    expect(harness.actions).toHaveLength(0);
    expect(harness.feedback).toContain('本命不能执行压热操作。');
  });

  it('rejects capital actions after the recording node is settled', () => {
    const harness = createHarness(70, false);

    harness.handleCapitalIntervention('bias', 'BOOST');

    expect(harness.budget.value).toBe(100000);
    expect(harness.actions).toHaveLength(0);
    expect(harness.feedback).toContain('当前节点已结算，不能再执行资本调度。');
  });
});

function createHarness(popularity: number, canIntervene = true) {
  const characters = reactive<Character[]>([{ id: 'bias', name: 'Bias', image: '', personality: '成长势', popularity, description: '' }]);
  const budget = ref(100000);
  const feedback: string[] = [];
  const actions: object[] = [];
  const classTrackState = reactive(SCreateClassTrackState(characters));
  const currentEventIndex = ref(0);
  const season = reactive(SCreateSeasonState());
  const applyEffect = vi.fn(effect => SApplyGameEffect({ characters, factions: { groupFans: 0, soloFans: 0, cpFans: 0, publicFans: 0, antiFans: 0 }, season, bondMap: {}, budget: budget.value }, effect));
  const capital = useCapitalIntervention({ applyEffect: effect => { budget.value = applyEffect(effect).budget; }, biasCharacterId: ref('bias'), budget, canIntervene: () => canIntervene, characters, classTrackState, currentEventIndex, onFeedback: message => feedback.push(message), onRecord: action => actions.push(action) });
  return { ...capital, actions, budget, characters, feedback };
}
