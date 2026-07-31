import { describe, expect, it } from 'vitest';
import type { Character } from '../data/characters';
import { SCreateClassTrackState } from '../baseLib/serviceLib/SClassTrack';
import { SCreateGameRandomState } from '../baseLib/serviceLib/SGameRandom';
import { SCreateEpisodeResources } from '../baseLib/serviceLib/SGameResources';
import { SCreateSeasonState } from '../baseLib/serviceLib/SSeasonState';
import { SCreateStudioLedger } from '../baseLib/serviceLib/SStudioLedger';
import { createGameSaveData, restoreGameSaveCollections, type GameSaveSource } from './gameSave';

const characters = [{ id: 'member', name: 'Member', image: '', personality: '成长势', popularity: 80, description: '' }] as Character[];

describe('gameSave', () => {
  it('writes the class track into version nine saves', () => {
    const classTrackState = SCreateClassTrackState(characters);
    const saveData = createGameSaveData(createSaveSource(classTrackState));

    expect(saveData.version).toBe(9);
    expect(saveData.classTrackState.classById).toEqual({ member: 'CLASS1' });
  });

  it('restores the saved class track state', () => {
    const sourceTrack = SCreateClassTrackState(characters);
    sourceTrack.assessmentScore.member = 12;
    const saveData = createGameSaveData(createSaveSource(sourceTrack));
    const restoredTrack = SCreateClassTrackState(characters);

    restoreGameSaveCollections(createRestoreTarget(restoredTrack), saveData);

    expect(restoredTrack.assessmentScore.member).toBe(12);
  });
});

function createSaveSource(classTrackState: ReturnType<typeof SCreateClassTrackState>): GameSaveSource {
  return {
    gameState: 'event', currentEventIndex: 0, gameEvents: [], eventHistory: [], characters,
    initialPopularityMap: { member: 80 }, budget: 100000, fanFactions: { groupFans: 60, soloFans: 40, cpFans: 30, publicFans: 50, antiFans: 20 }, bondMap: {}, studioLedger: SCreateStudioLedger(), qteSuccessCount: 0,
    activeStudioPage: 'event', recordingMode: 'BALANCE', focusCharacterId: 'member', biasCharacterId: 'member', executionIntensity: 1, fanOperationIntensity: 1, bondProjectIntensity: 1, settlementReportId: 'TEST', activeGoalIds: [], completedGoalIds: new Set(), claimedGoalIds: new Set(), randomState: SCreateGameRandomState(), seasonState: SCreateSeasonState(), episodeResources: SCreateEpisodeResources(), classTrackState,
  };
}

function createRestoreTarget(classTrackState: ReturnType<typeof SCreateClassTrackState>) {
  return { characters: [...characters], classTrackState, initialPopularityMap: {}, bondMap: {}, fanFactions: { groupFans: 0, soloFans: 0, cpFans: 0, publicFans: 0, antiFans: 0 }, studioLedger: SCreateStudioLedger(), eventHistory: [], eventMap: new Map() };
}
