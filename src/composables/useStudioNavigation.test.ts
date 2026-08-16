import { ref } from 'vue';
import { describe, expect, it, vi } from 'vitest';
import { useStudioNavigation } from './useStudioNavigation';

describe('useStudioNavigation', () => {
  it('keeps the player on the fan plan when the decision is pending', () => {
    const onBlocked = vi.fn();
    const activeStudioPage = ref<'event' | 'fans'>('fans');
    const navigation = useStudioNavigation({ activeStudioPage, canOpenDashboard: () => false, isPlanPrompt: () => true, onBlocked, onNavigate: vi.fn() });

    navigation.setActiveStudioPage('event');

    expect(activeStudioPage.value).toBe('fans');
    expect(onBlocked).toHaveBeenCalledWith('请先选择节目计划，或明确跳过本次押注。');
  });
});
