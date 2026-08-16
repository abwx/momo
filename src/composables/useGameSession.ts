import { ref } from 'vue';
import type { StudioViewKey } from '../data/type/StudioView';

export type GameState = 'home' | 'hub' | 'roster' | 'event' | 'end';

/** Owns top-level page navigation separately from the in-session interaction phase. */
export function useGameSession() {
  const activeStudioPage = ref<StudioViewKey>('event');
  const gameState = ref<GameState>('home');
  return {
    activeStudioPage,
    gameState,
    openEventWorkspace: () => activeStudioPage.value = 'event',
    openFanWorkspace: () => activeStudioPage.value = 'fans',
    setGameState: (state: GameState) => gameState.value = state,
  };
}
