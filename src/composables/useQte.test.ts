import { afterEach, describe, expect, it, vi } from 'vitest';
import { useQte } from './useQte';

const HOLD_SCENARIO = { title: '稳住镜头', desc: '', type: 'HOLD' as const, icon: '', successText: '成功', failText: '失败' };

describe('useQte', () => {
  afterEach(() => vi.useRealTimers());

  it('settles a hold scenario once when duplicate starts arrive', () => {
    vi.useFakeTimers();
    const onComplete = vi.fn();
    const qte = useQte({ scenarios: [HOLD_SCENARIO], onComplete });

    qte.startQTE();
    qte.startHold();
    qte.startHold();
    vi.advanceTimersByTime(2000);

    expect(onComplete).toHaveBeenCalledOnce();
    expect(qte.qteSuccessCount.value).toBe(1);
  });

  it('does not restart an active or acknowledged scenario', () => {
    const onComplete = vi.fn();
    const qte = useQte({ scenarios: [HOLD_SCENARIO], onComplete });

    qte.startQTE();
    qte.startQTE();
    qte.startHold();
    qte.stopHold();
    qte.startQTE();

    expect(onComplete).toHaveBeenCalledOnce();
    expect(qte.qteResult.value).toBe(HOLD_SCENARIO.failText);
  });
});
