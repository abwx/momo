import { afterEach, describe, expect, it, vi } from 'vitest';
import { setRandomSource } from '../utils/random';
import { useTrending } from './useTrending';

describe('useTrending', () => {
  afterEach(() => {
    setRandomSource();
    vi.useRealTimers();
  });

  it('pauses a topic deadline during a blocking session phase', () => {
    vi.useFakeTimers();
    let shouldRunTimer = true;
    setRandomSource(() => 0.8);
    const trending = useTrending({ canGenerateTopics: () => true, getRandomName: () => 'alpha', onExpire: vi.fn(), shouldRunTimer: () => shouldRunTimer });

    trending.generateTrendingTopic();
    vi.advanceTimersByTime(1000);
    const beforePause = trending.trendingQueue.value[0].timeLeft;
    shouldRunTimer = false;
    vi.advanceTimersByTime(3000);

    expect(trending.trendingQueue.value[0].timeLeft).toBeCloseTo(beforePause);
  });
});
