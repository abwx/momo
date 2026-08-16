import { describe, expect, it } from 'vitest';
import { useGameSession } from './useGameSession';

describe('useGameSession', () => {
  it('owns page and studio workspace transitions', () => {
    const session = useGameSession();

    session.setGameState('event');
    session.openFanWorkspace();

    expect(session.gameState.value).toBe('event');
    expect(session.activeStudioPage.value).toBe('fans');

    session.openEventWorkspace();

    expect(session.activeStudioPage.value).toBe('event');
  });
});
