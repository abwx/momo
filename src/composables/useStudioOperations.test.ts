import { computed, reactive, ref } from 'vue';
import { describe, expect, it, vi } from 'vitest';
import type { Character } from '../data/characters';
import { SCreateStudioLedger } from '../baseLib/serviceLib/SStudioLedger';
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
      applyEffect: vi.fn(), averagePopularity: computed(() => 75), bondMap: reactive({}), bondProjectIntensity: ref(1), budget: ref(100000), characters, eventCandidates: computed(() => characters), executionIntensity: ref(2), fanOperationIntensity: ref(2), focusCharacter: computed(() => characters[0]), biasCharacter: computed(() => characters[0]), highlightedCharIds: ref(new Set()), onBondProjectRecorded: vi.fn(), onFanProgramRecorded: vi.fn(), recordingMode: ref('BALANCE'), selectedBondCharacters: computed(() => characters), showFeedback: message => feedback.push(message), spendBudget: vi.fn(() => true), spendResources, studioLedger: reactive(SCreateStudioLedger()), topCharacter: computed(() => characters[1]),
    });

    operations.handleBondProject('STAGE');

    expect(spendResources).toHaveBeenCalledWith({ camera: 1, edit: 1 }, 'CP 营业');
    expect(feedback).toEqual(['CP 营业还差 镜头份 1 / 成片权 1，这期额度不够，先缓一缓。']);
  });
});
