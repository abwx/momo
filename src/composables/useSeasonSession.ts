import type { ComputedRef, Ref } from 'vue';
import type { Character } from '../data/characters';
import type { GameEvent } from '../data/type/GameEvent';
import type { EventHistoryItem } from '../data/type/SettlementReport';
import type { StudioViewKey } from '../data/type/StudioView';
import type { SClassTrackState } from '../baseLib/serviceLib/type/SClassTrack';
import type { SGameRandomState } from '../baseLib/serviceLib/SGameRandom';
import type { SNextEpisodeHook } from '../baseLib/serviceLib/type/SNextEpisodeHook';
import type { SProgramPlan } from '../baseLib/serviceLib/type/SProgramPlan';
import type { SSeasonState } from '../baseLib/serviceLib/type/SSeasonState';
import type { SFanFactionState } from '../baseLib/serviceLib/type/SFanFactionState';
import type { SStudioLedger } from '../baseLib/serviceLib/type/SStudioLedger';
import { INITIAL_BUDGET } from '../data/gameConfig';
import { SResetClassTrackState } from '../baseLib/serviceLib/SClassTrack';
import { SResetFanFactions } from '../baseLib/serviceLib/SGameFeatures';
import { SCreateGameRandomState } from '../baseLib/serviceLib/SGameRandom';
import { SResetSeasonState } from '../baseLib/serviceLib/SSeasonState';
import { SResetStudioLedger } from '../baseLib/serviceLib/SStudioLedger';

interface UseSeasonSessionOptions {
  activeEpisodeHook: ComputedRef<SNextEpisodeHook | null>;
  activeStudioPage: Ref<StudioViewKey>;
  biasCharacterId: Ref<string>;
  bondMap: Record<string, unknown>;
  budget: Ref<number>;
  characters: Character[];
  classTrackState: SClassTrackState;
  createReportId: () => string;
  createSeasonEvents: () => GameEvent[];
  currentEventIndex: Ref<number>;
  eventHistory: EventHistoryItem[];
  gameEvents: Ref<GameEvent[]>;
  generateTrendingTopic: () => void;
  getDefaultBiasId: () => string;
  getRandomValue: () => number;
  isBreakingNews: Ref<boolean>;
  initialPopularityMap: Record<string, number>;
  lastScenePairIds: Ref<[string, string] | null>;
  nextEpisodeHook: Ref<SNextEpisodeHook | null>;
  onPrepareEventPresentation: () => void;
  onResetPageScroll: () => void;
  onResetPresentation: () => void;
  onResetQte: () => void;
  onResetRoundResolution: () => void;
  onResetFanPulse: () => void;
  onOpenProgramPlan: () => void;
  onStartQte: () => void;
  programPlan: Ref<SProgramPlan | null>;
  qteSuccessCount: Ref<number>;
  randomState: SGameRandomState;
  seasonState: SSeasonState;
  setGameState: (state: 'event') => void;
  settlementReportId: Ref<string>;
  shouldOpenProgramPlan: () => boolean;
  shouldTriggerCrisis: () => boolean;
  studioLedger: SStudioLedger;
  fanFactions: SFanFactionState;
}

/** Owns season initialization and preparation of each recording event. */
export function useSeasonSession(options: UseSeasonSessionOptions) {
  return { prepareEvent: (allowTrending = true) => _prepareEvent(options, allowTrending), prepareNextEvent: () => _prepareNextEvent(options), startSeason: (selectedBiasId = '') => _startSeason(options, selectedBiasId) };
}

function _startSeason(options: UseSeasonSessionOptions, selectedBiasId: string) {
  _resetSeasonState(options, selectedBiasId);
  _prepareEvent(options, false);
  options.onResetPageScroll();
}

function _resetSeasonState(options: UseSeasonSessionOptions, selectedBiasId: string) {
  Object.assign(options.randomState, SCreateGameRandomState());
  SResetSeasonState(options.seasonState);
  options.lastScenePairIds.value = null;
  options.nextEpisodeHook.value = null;
  options.programPlan.value = null;
  options.onResetPresentation();
  _resetSeasonCollections(options, selectedBiasId);
}

function _resetSeasonCollections(options: UseSeasonSessionOptions, selectedBiasId: string) {
  _copyInitialPopularity(options);
  _clearBondMap(options.bondMap);
  options.gameEvents.value = options.createSeasonEvents();
  options.currentEventIndex.value = 0;
  options.eventHistory.length = 0;
  options.setGameState('event');
  options.activeStudioPage.value = 'event';
  _resetSeasonResources(options, selectedBiasId);
}

function _copyInitialPopularity(options: UseSeasonSessionOptions) {
  options.characters.forEach(character => options.initialPopularityMap[character.id] = character.popularity);
}

function _clearBondMap(bondMap: Record<string, unknown>) {
  Object.keys(bondMap).forEach(key => delete bondMap[key]);
}

function _resetSeasonResources(options: UseSeasonSessionOptions, selectedBiasId: string) {
  SResetClassTrackState(options.classTrackState, options.characters);
  options.budget.value = INITIAL_BUDGET;
  options.qteSuccessCount.value = 0;
  SResetStudioLedger(options.studioLedger);
  SResetFanFactions(options.fanFactions);
  options.biasCharacterId.value = selectedBiasId || options.getDefaultBiasId();
  options.settlementReportId.value = options.createReportId();
}

function _prepareEvent(options: UseSeasonSessionOptions, allowTrending: boolean) {
  options.onResetFanPulse();
  options.onResetRoundResolution();
  options.isBreakingNews.value = false;
  options.onResetQte();
  _prepareEventPressure(options, allowTrending);
  options.onPrepareEventPresentation();
}

function _prepareEventPressure(options: UseSeasonSessionOptions, allowTrending: boolean) {
  const isCleanEpisode = options.activeEpisodeHook.value?.key === 'CLEAN';
  if (allowTrending && !isCleanEpisode && options.getRandomValue() < 0.4) options.generateTrendingTopic();
  if (!isCleanEpisode && options.shouldTriggerCrisis()) _startCrisis(options);
}

function _startCrisis(options: UseSeasonSessionOptions) {
  options.seasonState.crisisCount += 1;
  options.seasonState.lastCrisisEventIndex = options.currentEventIndex.value + 1;
  options.isBreakingNews.value = true;
  options.onStartQte();
}

function _prepareNextEvent(options: UseSeasonSessionOptions) {
  if (options.shouldOpenProgramPlan()) return options.onOpenProgramPlan();
  _prepareEvent(options, true);
  options.setGameState('event');
}
