import { computed, ref } from 'vue';
import { describe, expect, it, vi } from 'vitest';
import type { Character } from '../data/characters';
import type { GameEvent } from '../data/type/GameEvent';
import type { SProgramPlan } from '../baseLib/serviceLib/type/SProgramPlan';
import { SCreateClassTrackState } from '../baseLib/serviceLib/SClassTrack';
import { SCreateGameRandomState } from '../baseLib/serviceLib/SGameRandom';
import { SCreateSeasonState } from '../baseLib/serviceLib/SSeasonState';
import { SCreateStudioLedger } from '../baseLib/serviceLib/SStudioLedger';
import { useSeasonSession } from './useSeasonSession';

const characters: Character[] = [{ id: 'alpha', name: 'Alpha', image: '', personality: '成长势', popularity: 60, description: '' }];
const event: GameEvent = { id: 'opening', type: 'CHOICE', title: '', description: '', choices: [] };

describe('useSeasonSession', () => {
  it('resets the season before preparing its opening event', () => {
    const harness = createHarness();
    harness.startSeason('alpha');

    expect(harness.gameEvents.value).toEqual([event]);
    expect(harness.initialPopularityMap.alpha).toBe(60);
    expect(harness.setGameState).toHaveBeenCalledWith('event');
    expect(harness.onResetPresentation).toHaveBeenCalledOnce();
    expect(harness.onPrepareEventPresentation).toHaveBeenCalledOnce();
  });
});

function createHarness() {
  const localCharacters = structuredClone(characters);
  const gameEvents = ref<GameEvent[]>([]);
  const initialPopularityMap: Record<string, number> = {};
  const onPrepareEventPresentation = vi.fn();
  const onResetPresentation = vi.fn();
  const setGameState = vi.fn();
  const { startSeason } = useSeasonSession({ activeEpisodeHook: computed(() => null), activeStudioPage: ref('event'), biasCharacterId: ref(''), bondMap: {}, budget: ref(0), characters: localCharacters, classTrackState: SCreateClassTrackState(localCharacters), createReportId: () => 'REPORT', createSeasonEvents: () => [event], currentEventIndex: ref(0), eventHistory: [], gameEvents, generateTrendingTopic: vi.fn(), getDefaultBiasId: () => 'alpha', getRandomValue: () => 1, initialPopularityMap, isBreakingNews: ref(true), lastScenePairIds: ref(null), nextEpisodeHook: ref(null), onOpenProgramPlan: vi.fn(), onPrepareEventPresentation, onResetFanPulse: vi.fn(), onResetPageScroll: vi.fn(), onResetPresentation, onResetQte: vi.fn(), onResetRoundResolution: vi.fn(), onStartQte: vi.fn(), programPlan: ref<SProgramPlan | null>(null), qteSuccessCount: ref(4), randomState: SCreateGameRandomState(), seasonState: SCreateSeasonState(), setGameState, settlementReportId: ref(''), shouldOpenProgramPlan: () => false, shouldTriggerCrisis: () => false, studioLedger: SCreateStudioLedger(), fanFactions: { groupFans: 1, soloFans: 1, cpFans: 1, publicFans: 1, antiFans: 1 } });
  return { gameEvents, initialPopularityMap, onPrepareEventPresentation, onResetPresentation, setGameState, startSeason };
}
