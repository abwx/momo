import { ref, watch, type ComputedRef, type Ref } from 'vue';
import type { GameEvent } from '../data/events';
import { clearGameSave, readGameSave, writeGameSave, type GameSaveData } from '../utils/gameSave';

interface UseGamePersistenceOptions {
  eventMap: ComputedRef<Map<string, GameEvent>>;
  gameEvents: Ref<GameEvent[]>;
  onDiscard: () => void;
  onRestore: () => void;
  restoreSaveState: (saveData: GameSaveData) => void;
  saveSnapshot: ComputedRef<GameSaveData | null>;
}

/** Persists the current season and restores only saves with known event ids. */
export function useGamePersistence(options: UseGamePersistenceOptions) {
  const savedGame = ref<GameSaveData | null>(null);
  watch(options.saveSnapshot, () => SPersistSnapshot(options.saveSnapshot, savedGame), { deep: true });
  return { continueSavedGame: () => SContinueSavedGame(options, savedGame), discardSavedGame: () => SDiscardSavedGame(options, savedGame), initializeSavedGame: () => { savedGame.value = readGameSave(); }, savedGame };
}

function SPersistSnapshot(snapshot: ComputedRef<GameSaveData | null>, savedGame: Ref<GameSaveData | null>) {
  if (!snapshot.value) return;
  writeGameSave(snapshot.value);
  savedGame.value = readGameSave();
}

function SContinueSavedGame(options: UseGamePersistenceOptions, savedGame: Ref<GameSaveData | null>) {
  const saveData = savedGame.value;
  if (saveData && SRestoreSavedGame(options, saveData)) return;
  SDiscardSavedGame(options, savedGame);
}

function SRestoreSavedGame(options: UseGamePersistenceOptions, saveData: GameSaveData): boolean {
  const events = saveData.eventIds.map(id => options.eventMap.value.get(id));
  if (events.some(event => !event)) return false;
  options.gameEvents.value = events as GameEvent[];
  options.restoreSaveState(saveData);
  options.onRestore();
  return true;
}

function SDiscardSavedGame(options: UseGamePersistenceOptions, savedGame: Ref<GameSaveData | null>) {
  clearGameSave();
  savedGame.value = null;
  options.onDiscard();
}
