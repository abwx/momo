import { computed, reactive, ref } from 'vue';
import { describe, expect, it, vi } from 'vitest';
import type { Character } from '../data/characters';
import { SCreateStudioLedger } from '../baseLib/serviceLib/SStudioLedger';
import type { SFanPulse } from '../baseLib/serviceLib/type/SFanPulse';
import { useStudioOperations } from './useStudioOperations';

const characters: Character[] = [
  { id: 'guan-junchen', name: '官俊臣', image: '', personality: '多面少年', popularity: 70, description: '' },
  { id: 'chen-yiheng', name: '陈奕恒', image: '', personality: '综艺感', popularity: 80, description: '' },
];

describe('useStudioOperations', () => {
  it('keeps the resource shortage feedback when a bond project cannot start', () => {
    const feedback: string[] = [];
    const spendResources = vi.fn((_cost, action: string) => {
      feedback.push(`${action}还差 镜头份 1 / 成片权 1，这期额度不够，先缓一缓。`);
      return false;
    });
    const operations = useStudioOperations({
      applyEffect: vi.fn(), averagePopularity: computed(() => 75), bondMap: reactive({}), budget: ref(100000), characters, biasCharacter: computed(() => characters[0]), onBondProjectRecorded: vi.fn(() => []), onFanProgramRecorded: vi.fn(() => []), selectedBondCharacters: computed(() => characters), showFeedback: message => feedback.push(message), spendBudget: vi.fn(() => true), spendResources, studioLedger: reactive(SCreateStudioLedger()),
    });

    operations.handleBondProject('STAGE');

    expect(spendResources).toHaveBeenCalledWith({ camera: 1, edit: 1 }, 'CP 营业');
    expect(feedback).toEqual(['CP 营业还差 镜头份 1 / 成片权 1，这期额度不够，先缓一缓。']);
  });

  it('records a solo fan run and reports its decision cost', () => {
    const ledger = reactive(SCreateStudioLedger());
    const applyEffect = vi.fn();
    const showFeedback = vi.fn();
    const onFanProgramRecorded = vi.fn(() => ['assessment +2']);
    const operations = useStudioOperations({
      applyEffect, averagePopularity: computed(() => 75), bondMap: reactive({}), budget: ref(100000), characters, biasCharacter: computed(() => characters[0]), onBondProjectRecorded: vi.fn(() => []), onFanProgramRecorded, selectedBondCharacters: computed(() => characters), showFeedback, spendBudget: vi.fn(() => true), spendResources: vi.fn(() => true), studioLedger: ledger,
    });

    operations.handleFanProgram('SOLO');

    expect(ledger.fanPrograms.SOLO).toBe(1);
    expect(applyEffect).toHaveBeenCalledWith(expect.objectContaining({ season: { biasPressure: 2 } }));
    expect(onFanProgramRecorded).toHaveBeenCalledWith('SOLO', 1);
    expect(showFeedback.mock.calls[0][1]).toContain('偏心压力 +2');
  });

  it('uses the fan response to clear a live negative topic and advance the brief', () => {
    const advancePulse = vi.fn();
    const resolveNegativeTrending = vi.fn();
    const pulse: SFanPulse = { id: 'crisis', phase: 'OPEN', title: '', quote: '', program: 'ANTI', programHint: '', pairIds: ['guan-junchen', 'chen-yiheng'], project: 'VLOG', projectHint: '' };
    const operations = useStudioOperations({
      applyEffect: vi.fn(), averagePopularity: computed(() => 75), bondMap: reactive({}), budget: ref(100000), characters, biasCharacter: computed(() => characters[0]), fanPulse: computed(() => pulse), onBondProjectRecorded: vi.fn(() => []), onFanProgramRecorded: vi.fn(() => []), selectedBondCharacters: computed(() => characters), showFeedback: vi.fn(), spendBudget: vi.fn(() => true), spendResources: vi.fn(() => true), studioLedger: reactive(SCreateStudioLedger()), onPulseHandled: advancePulse, resolveNegativeTrending,
    });

    operations.handleFanProgram('ANTI');

    expect(resolveNegativeTrending).toHaveBeenCalledOnce();
    expect(advancePulse).toHaveBeenCalledOnce();
  });
});
