import { computed, type ComputedRef, type Ref } from 'vue';
import type { Character } from '../data/characters';
import type { GameEvent } from '../data/events';
import type { EventHistoryItem } from '../data/type/SettlementReport';
import { SCreateGameRandomState, SNextRandom, type SGameRandomState } from '../baseLib/serviceLib/SGameRandom';
import { SCreateEpisodeResources } from '../baseLib/serviceLib/SGameResources';
import { SCreateSeasonState } from '../baseLib/serviceLib/SSeasonState';
import { SCreateGameGoalIds } from '../baseLib/serviceLib/SGameGoals';
import type { SBondPair } from '../baseLib/serviceLib/type/SBondPair';
import type { SFanFactionState } from '../baseLib/serviceLib/type/SFanFactionState';
import type { SEpisodeResources } from '../baseLib/serviceLib/type/SEpisodeResources';
import type { SSeasonState } from '../baseLib/serviceLib/type/SSeasonState';
import type { SClassTrackState } from '../baseLib/serviceLib/type/SClassTrack';
import type { SRecordingModeKey, SStudioLedger } from '../baseLib/serviceLib/type/SStudioLedger';
import type { StudioViewKey } from '../data/type/StudioView';
import { SNormalizeStudioView } from '../data/type/StudioView';
import { createGameSaveData, restoreGameSaveCollections, type GameSaveData } from '../utils/gameSave';
import { setRandomSource } from '../utils/random';

interface UseGameSaveStateOptions {
  activeGoalIds: Ref<string[]>;
  activeStudioPage: Ref<StudioViewKey>;
  bondMap: Record<string, SBondPair>;
  bondProjectIntensity: Ref<number>;
  budget: Ref<number>;
  claimedGoalIds: Ref<Set<string>>;
  completedGoalIds: Ref<Set<string>>;
  characters: Character[];
  classTrackState: SClassTrackState;
  currentEventIndex: Ref<number>;
  episodeResources: SEpisodeResources;
  executionIntensity: Ref<number>;
  eventHistory: EventHistoryItem[];
  eventMap: ComputedRef<Map<string, GameEvent>>;
  fanFactions: SFanFactionState;
  fanOperationIntensity: Ref<number>;
  focusCharacterId: Ref<string>;
  biasCharacterId: Ref<string>;
  gameEvents: Ref<GameEvent[]>;
  getSavableState: () => GameSaveData['gameState'] | null;
  initialPopularityMap: Record<string, number>;
  qteSuccessCount: Ref<number>;
  randomState: SGameRandomState;
  recordingMode: Ref<SRecordingModeKey>;
  restoreGameState: (state: GameSaveData['gameState']) => void;
  seasonState: SSeasonState;
  settlementReportId: Ref<string>;
  studioLedger: SStudioLedger;
}

/** Maps the reactive season state to the persisted save-data contract. */
export function useGameSaveState(options: UseGameSaveStateOptions) {
  const saveSnapshot = computed(() => SCreateSaveSnapshot(options));
  return { restoreSaveState: (saveData: GameSaveData) => SRestoreSaveState(options, saveData), saveSnapshot };
}

function SCreateSaveSnapshot(options: UseGameSaveStateOptions): GameSaveData | null {
  const gameState = options.getSavableState();
  return gameState ? createGameSaveData(SCreateSaveSource(options, gameState)) : null;
}

function SCreateSaveSource(options: UseGameSaveStateOptions, gameState: GameSaveData['gameState']) {
  return { gameState, currentEventIndex: options.currentEventIndex.value, gameEvents: options.gameEvents.value, eventHistory: options.eventHistory, characters: options.characters, classTrackState: options.classTrackState, initialPopularityMap: options.initialPopularityMap, budget: options.budget.value, fanFactions: options.fanFactions, bondMap: options.bondMap, studioLedger: options.studioLedger, qteSuccessCount: options.qteSuccessCount.value, activeStudioPage: options.activeStudioPage.value, recordingMode: options.recordingMode.value, focusCharacterId: options.focusCharacterId.value, biasCharacterId: options.biasCharacterId.value, executionIntensity: options.executionIntensity.value, fanOperationIntensity: options.fanOperationIntensity.value, bondProjectIntensity: options.bondProjectIntensity.value, settlementReportId: options.settlementReportId.value, activeGoalIds: options.activeGoalIds.value, completedGoalIds: options.completedGoalIds.value, claimedGoalIds: options.claimedGoalIds.value, randomState: options.randomState, seasonState: options.seasonState, episodeResources: options.episodeResources };
}

function SRestoreSaveState(options: UseGameSaveStateOptions, saveData: GameSaveData): void {
  SRestoreScalarState(options, saveData);
  SRestoreGameSystems(options, saveData);
  SRestoreCollections(options, saveData);
}

function SRestoreScalarState(options: UseGameSaveStateOptions, saveData: GameSaveData): void {
  options.restoreGameState(saveData.gameState);
  options.currentEventIndex.value = saveData.currentEventIndex;
  options.budget.value = saveData.budget;
  options.qteSuccessCount.value = saveData.qteSuccessCount;
  options.activeStudioPage.value = SNormalizeStudioView(saveData.activeStudioPage);
  options.recordingMode.value = saveData.recordingMode;
  options.focusCharacterId.value = saveData.focusCharacterId;
  options.biasCharacterId.value = saveData.biasCharacterId || saveData.focusCharacterId;
  options.executionIntensity.value = saveData.executionIntensity;
  options.bondProjectIntensity.value = saveData.bondProjectIntensity;
  options.fanOperationIntensity.value = saveData.fanOperationIntensity;
  options.settlementReportId.value = saveData.settlementReportId;
}

function SRestoreGameSystems(options: UseGameSaveStateOptions, saveData: GameSaveData): void {
  options.activeGoalIds.value = saveData.activeGoalIds || SCreateGameGoalIds();
  options.completedGoalIds.value = new Set(saveData.completedGoalIds || []);
  options.claimedGoalIds.value = new Set(saveData.claimedGoalIds || []);
  Object.assign(options.randomState, saveData.randomState || SCreateGameRandomState());
  Object.assign(options.seasonState, saveData.seasonState || SCreateSeasonState());
  Object.assign(options.episodeResources, saveData.episodeResources || SCreateEpisodeResources());
  setRandomSource(() => SNextRandom(options.randomState));
}

function SRestoreCollections(options: UseGameSaveStateOptions, saveData: GameSaveData): void {
  restoreGameSaveCollections({ characters: options.characters, classTrackState: options.classTrackState, initialPopularityMap: options.initialPopularityMap, bondMap: options.bondMap, fanFactions: options.fanFactions, studioLedger: options.studioLedger, eventHistory: options.eventHistory, eventMap: options.eventMap.value }, saveData);
}
