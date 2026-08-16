import type { Ref } from 'vue';
import type { Character } from '../data/characters';
import type { GameEvent } from '../data/type/GameEvent';
import type { ProgramEpisode } from '../data/type/ProgramEpisode';
import type { EventHistoryItem } from '../data/type/SettlementReport';
import { SApplyEpisodeAssessment, SGetEpisodeAwaitingBranch, SGetJustCompletedEpisode, SReshuffleClasses } from '../baseLib/serviceLib/SClassTrack';
import { SGetEpisodeBranchEvent } from '../baseLib/serviceLib/SProgramBranch';
import type { SClassTrackState } from '../baseLib/serviceLib/type/SClassTrack';
import type { SSeasonState } from '../baseLib/serviceLib/type/SSeasonState';

interface UseSeasonProgressionOptions {
  biasCharacterId: Ref<string>;
  branchEvents: GameEvent[];
  characters: Character[];
  classTrackState: SClassTrackState;
  currentEventIndex: Ref<number>;
  eventHistory: EventHistoryItem[];
  gameEvents: Ref<GameEvent[]>;
  onFinishSeason: () => void;
  onOpenFinalClassConfirmation: (episodeId: string) => void;
  onPrepareNextEvent: () => void;
  onShowClassResult: (episodeId: string) => void;
  program: ProgramEpisode[];
  seasonState: SSeasonState;
}

/** Advances authored recording nodes, inserts one branch per episode, and settles class movement. */
export function useSeasonProgression(options: UseSeasonProgressionOptions) {
  return { nextEvent: () => SAdvanceSeason(options) };
}

function SAdvanceSeason(options: UseSeasonProgressionOptions) {
  SInsertPendingBranch(options);
  const episode = SGetJustCompletedEpisode(options.program, options.eventHistory, options.classTrackState.episodeResults);
  options.currentEventIndex.value += 1;
  if (episode) SSettleEpisode(options, episode);
  SContinueOrFinish(options, episode);
}

function SInsertPendingBranch(options: UseSeasonProgressionOptions) {
  const episode = SGetEpisodeAwaitingBranch(options.program, options.eventHistory, options.classTrackState.episodeResults);
  if (!episode) return;
  const branch = SGetEpisodeBranchEvent(episode, options.classTrackState, options.seasonState, options.biasCharacterId.value, options.branchEvents);
  options.gameEvents.value.splice(options.currentEventIndex.value + 1, 0, branch);
}

function SSettleEpisode(options: UseSeasonProgressionOptions, episode: ProgramEpisode) {
  SApplyEpisodeAssessment(options.classTrackState, options.characters);
  SReshuffleClasses(options.classTrackState, episode.id, options.biasCharacterId.value);
}

function SContinueOrFinish(options: UseSeasonProgressionOptions, episode: ProgramEpisode | null) {
  if (options.currentEventIndex.value < options.gameEvents.value.length) return SPrepareFollowingEvent(options, episode);
  if (episode) return options.onOpenFinalClassConfirmation(episode.id);
  options.onFinishSeason();
}

function SPrepareFollowingEvent(options: UseSeasonProgressionOptions, episode: ProgramEpisode | null) {
  options.onPrepareNextEvent();
  if (episode) options.onShowClassResult(episode.id);
}
