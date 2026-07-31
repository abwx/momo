import type { Character } from '../data/characters';
import type { GameEffectTag, GameEvent } from '../data/events';
import type { SFanFactionState } from '../baseLib/serviceLib/type/SFanFactionState';
import type { SBondPair } from '../baseLib/serviceLib/type/SBondPair';
import type {
  SRecordingModeKey,
  SStudioLedger,
} from '../baseLib/serviceLib/type/SStudioLedger';
import type { EventHistoryItem } from '../data/type/SettlementReport';
import type { StudioViewKey } from '../data/type/StudioView';
import type { SGameRandomState } from '../baseLib/serviceLib/SGameRandom';
import type { SSeasonState } from '../baseLib/serviceLib/type/SSeasonState';
import type { SEpisodeResources } from '../baseLib/serviceLib/type/SEpisodeResources';
import type { SClassTrackState } from '../baseLib/serviceLib/type/SClassTrack';
import { cloneData } from './cloneData';

const GAME_SAVE_KEY = 'momo.producer.save.v1';

export interface GameSaveData {
  version: 9;
  savedAt: number;
  gameState: 'event' | 'end';
  currentEventIndex: number;
  eventIds: string[];
  eventHistory: { eventId: string; result: string; effectTags?: GameEffectTag[] }[];
  characters: Pick<Character, 'id' | 'popularity'>[];
  initialPopularityMap: Record<string, number>;
  budget: number;
  fanFactions: SFanFactionState;
  bondMap: Record<string, SBondPair>;
  studioLedger: SStudioLedger;
  qteSuccessCount: number;
  activeStudioPage: StudioViewKey;
  recordingMode: SRecordingModeKey;
  focusCharacterId: string;
  biasCharacterId?: string;
  executionIntensity: number;
  fanOperationIntensity: number;
  bondProjectIntensity: number;
  settlementReportId: string;
  activeGoalIds?: string[];
  completedGoalIds?: string[];
  claimedGoalIds?: string[];
  randomState?: SGameRandomState;
  seasonState?: SSeasonState;
  episodeResources?: SEpisodeResources;
  classTrackState: SClassTrackState;
}

export interface GameSaveSource {
  gameState: GameSaveData['gameState'];
  currentEventIndex: number;
  gameEvents: GameEvent[];
  eventHistory: EventHistoryItem[];
  characters: Character[];
  initialPopularityMap: Record<string, number>;
  budget: number;
  fanFactions: SFanFactionState;
  bondMap: Record<string, SBondPair>;
  studioLedger: SStudioLedger;
  qteSuccessCount: number;
  activeStudioPage: StudioViewKey;
  recordingMode: SRecordingModeKey;
  focusCharacterId: string;
  biasCharacterId: string;
  executionIntensity: number;
  fanOperationIntensity: number;
  bondProjectIntensity: number;
  settlementReportId: string;
  activeGoalIds: string[];
  completedGoalIds: Set<string>;
  claimedGoalIds: Set<string>;
  randomState: SGameRandomState;
  seasonState: SSeasonState;
  episodeResources: SEpisodeResources;
  classTrackState: SClassTrackState;
}

export interface GameSaveRestoreTarget {
  characters: Character[];
  initialPopularityMap: Record<string, number>;
  bondMap: Record<string, SBondPair>;
  fanFactions: SFanFactionState;
  studioLedger: SStudioLedger;
  eventHistory: EventHistoryItem[];
  eventMap: Map<string, GameEvent>;
  classTrackState: SClassTrackState;
}

export function createGameSaveData(source: GameSaveSource): GameSaveData {
  return {
    version: 9,
    savedAt: Date.now(),
    gameState: source.gameState,
    currentEventIndex: source.currentEventIndex,
    eventIds: source.gameEvents.map(event => event.id),
    eventHistory: source.eventHistory.map(item => ({ eventId: item.event.id, result: item.result, effectTags: item.effectTags })),
    characters: source.characters.map(char => ({ id: char.id, popularity: char.popularity })),
    initialPopularityMap: { ...source.initialPopularityMap },
    budget: source.budget,
    fanFactions: { ...source.fanFactions },
    bondMap: { ...source.bondMap },
    studioLedger: cloneData(source.studioLedger),
    qteSuccessCount: source.qteSuccessCount,
    activeStudioPage: source.activeStudioPage,
    recordingMode: source.recordingMode,
    focusCharacterId: source.focusCharacterId,
    biasCharacterId: source.biasCharacterId,
    executionIntensity: source.executionIntensity,
    fanOperationIntensity: source.fanOperationIntensity,
    bondProjectIntensity: source.bondProjectIntensity,
    settlementReportId: source.settlementReportId,
    activeGoalIds: [...source.activeGoalIds],
    completedGoalIds: [...source.completedGoalIds],
    claimedGoalIds: [...source.claimedGoalIds],
    randomState: { ...source.randomState },
    seasonState: { ...source.seasonState },
    episodeResources: { ...source.episodeResources },
    classTrackState: cloneData(source.classTrackState),
  };
}

export function restoreGameSaveCollections(target: GameSaveRestoreTarget, saveData: GameSaveData): void {
  restoreCharacterPopularity(target.characters, saveData);
  restoreRecord(target.initialPopularityMap, saveData.initialPopularityMap);
  restoreRecord(target.bondMap, saveData.bondMap);
  Object.assign(target.fanFactions, saveData.fanFactions);
  Object.assign(target.studioLedger, saveData.studioLedger);
  Object.assign(target.classTrackState, cloneData(saveData.classTrackState));
  restoreEventHistory(target.eventHistory, target.eventMap, saveData);
}

export function readGameSave(): GameSaveData | null {
  const rawSave = _readRawSave();
  return rawSave ? _parseSave(rawSave) : null;
}

export function writeGameSave(data: GameSaveData): void {
  try {
    localStorage.setItem(GAME_SAVE_KEY, JSON.stringify(data));
  } catch {
    return;
  }
}

export function clearGameSave(): void {
  try {
    localStorage.removeItem(GAME_SAVE_KEY);
  } catch {
    return;
  }
}

function _readRawSave(): string | null {
  try {
    return localStorage.getItem(GAME_SAVE_KEY);
  } catch {
    return null;
  }
}

function _parseSave(rawSave: string): GameSaveData | null {
  try {
    const saveData = JSON.parse(rawSave) as GameSaveData;
    return saveData.version === 9 ? saveData : null;
  } catch {
    return null;
  }
}

function restoreCharacterPopularity(characters: Character[], saveData: GameSaveData): void {
  saveData.characters.forEach(savedChar => {
    const character = characters.find(char => char.id === savedChar.id);
    if (character) character.popularity = savedChar.popularity;
  });
}

function restoreEventHistory(eventHistory: EventHistoryItem[], eventMap: Map<string, GameEvent>, saveData: GameSaveData): void {
  eventHistory.length = 0;
  saveData.eventHistory.forEach(item => {
    const event = eventMap.get(item.eventId);
    if (event) eventHistory.push({ event, result: item.result, effectTags: item.effectTags });
  });
}

function restoreRecord<T>(target: Record<string, T>, source: Record<string, T>): void {
  Object.keys(target).forEach(key => delete target[key]);
  Object.assign(target, source);
}
