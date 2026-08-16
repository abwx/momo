import { ref } from 'vue';
import { describe, expect, it, vi } from 'vitest';
import type { Character } from '../data/characters';
import type { GameEvent } from '../data/type/GameEvent';
import { useRoundFeedback } from './useRoundFeedback';

const characters: Character[] = [{ id: 'alpha', name: 'Alpha', image: '', personality: '成长势', popularity: 60, description: '' }];
const event: GameEvent = { id: 'event', type: 'CHOICE', title: '标题', description: '', choices: [] };

describe('useRoundFeedback', () => {
  it('records a round before advancing to the next event', () => {
    const nextEvent = vi.fn();
    const history: Array<{ event: GameEvent; result: string }> = [];
    const feedback = useRoundFeedback({ activeStudioPage: ref('event'), celebrateNewAchievements: vi.fn(), characters, closePopularityDashboard: vi.fn(), currentEvent: ref(event), eventHistory: history, getActiveEpisodeHook: () => false, getSelectedPair: () => [], highlightedCharIds: ref(new Set()), nextEvent, nextEpisodeHook: ref(null), onResetPageScroll: vi.fn(), roundResolution: ref(null) });

    feedback.triggerFeedback('Alpha 获得高光', '保留完整镜头', ['alpha']);
    feedback.continueRound();

    expect(history).toHaveLength(1);
    expect(nextEvent).toHaveBeenCalledOnce();
  });
});
