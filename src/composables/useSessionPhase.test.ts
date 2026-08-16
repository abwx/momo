import { ref } from 'vue';
import { describe, expect, it } from 'vitest';
import { useSessionPhase } from './useSessionPhase';

describe('useSessionPhase', () => {
  it('keeps the session locked while a QTE result is awaiting acknowledgement', () => {
    const qteResult = ref<string | null>('危机处理完成');
    const phase = useSessionPhase({ activeStudioPage: ref('event'), isProgramPlanPrompt: ref(false), qteActive: ref(false), qteResult, roundResolution: ref(null), showResultModal: ref(false) });

    expect(phase.sessionPhase.value).toBe('QTE');
    expect(phase.canResolveEvent.value).toBe(false);
    expect(phase.canIntervene.value).toBe(false);
    expect(phase.canRunTimedWork.value).toBe(false);
  });
});
