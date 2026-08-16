import { reactive, ref } from 'vue';
import { describe, expect, it, vi } from 'vitest';
import type { Character } from '../data/characters';
import type { GameEvent } from '../data/type/GameEvent';
import type { SProgramPlan } from '../baseLib/serviceLib/type/SProgramPlan';
import { useProgramPlanSelection } from './useProgramPlanSelection';

describe('useProgramPlanSelection', () => {
  it('uses the shared budget gate before creating a plan', () => {
    const harness = createHarness(3000);

    harness.selectProgramPlan('FOCUS');

    expect(harness.onBlocked).toHaveBeenCalledOnce();
    expect(harness.onBlocked).toHaveBeenCalledWith('经费不够，暂时无法押这条节目计划。');
    expect(harness.applyEffect).not.toHaveBeenCalled();
    expect(harness.plan.value).toBeNull();
  });

  it('rejects plan selection outside the offered decision window', () => {
    const harness = createHarness(10000, false);

    harness.selectProgramPlan('FOCUS');

    expect(harness.onBlocked).toHaveBeenCalledOnce();
    expect(harness.onBlocked).toHaveBeenCalledWith('当前不是节目计划决策节点。');
    expect(harness.plan.value).toBeNull();
  });

  it('deducts the plan investment and returns to the event flow', () => {
    const harness = createHarness(10000);

    harness.selectProgramPlan('FOCUS');

    expect(harness.applyEffect).toHaveBeenCalledWith({ budgetDelta: -4000 });
    expect(harness.plan.value?.key).toBe('FOCUS');
    expect(harness.onSelected).toHaveBeenCalledOnce();
  });
});

function createHarness(budgetValue: number, isPlanPrompt = true) {
  const plan = ref<SProgramPlan | null>(null);
  const applyEffect = vi.fn();
  const onBlocked = vi.fn();
  const onSelected = vi.fn();
  const characters = reactive<Character[]>([{ id: 'bias', name: 'Bias', image: '', personality: '成长势', popularity: 70, description: '' }]);
  const gameEvents = ref<GameEvent[]>([
    { id: 'event-1', type: 'CHOICE', title: '', description: '', choices: [] },
    { id: 'event-2', type: 'CHOICE', title: '', description: '', choices: [] },
  ]);
  const selection = useProgramPlanSelection({ applyEffect, biasCharacterId: ref('bias'), budget: ref(budgetValue), characters, currentEventIndex: ref(0), gameEvents, isPlanPrompt: () => isPlanPrompt, lastScenePairIds: ref(null), onBlocked, onSelected, programPlan: plan, seasonState: reactive({ groupHeat: 0, producerReputation: 0, anticipation: 0, biasPressure: 0, dramaDebt: 0, cpHeat: 0, crisisCount: 0, fanPulseEventIndex: -1, fanPulseStep: 0, programPlanPromptIndex: 4, lastCrisisEventIndex: 0, lowRankMomentum: 0 }) });
  return { ...selection, applyEffect, onBlocked, onSelected, plan };
}
