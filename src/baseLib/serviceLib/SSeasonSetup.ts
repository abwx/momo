import type { Character } from '../../data/characters';
import type { GameEvent } from '../../data/type/GameEvent';
import type { ProgramEpisode } from '../../data/type/ProgramEpisode';
import { getRandomValue } from '../../utils/random';

const POPULARITY_MIN = 55;
const POPULARITY_MAX = 90;

/** 每季开局：全员热度独立随机，不沿用静态表，避免像现实排名。 */
export function SRandomizeStartingPopularity(characters: Character[]): Character[] {
  return characters.map(character => ({
    ...character,
    popularity: SRandomPopularity(),
  }));
}

/** 按节目单生成整季录制顺序，避免题材和时间线跳切。 */
export function SCreateProgramSeasonEvents(
  openingEvent: GameEvent,
  events: GameEvent[],
  program: ProgramEpisode[],
): GameEvent[] {
  const eventMap = new Map(events.map(event => [event.id, event]));
  return [openingEvent, ...program.flatMap(episode => SGetEpisodeEvents(episode, eventMap))];
}

/** Counts authored nodes only; conditional branches are intentionally excluded. */
export function SGetProgramMainEventCount(program: ProgramEpisode[]): number {
  return 1 + program.reduce((count, episode) => count + episode.eventIds.length, 0);
}

function SGetEpisodeEvents(episode: ProgramEpisode, eventMap: Map<string, GameEvent>): GameEvent[] {
  return episode.eventIds.map(eventId => SGetProgramEvent(episode.id, eventId, eventMap));
}

function SGetProgramEvent(episodeId: string, eventId: string, eventMap: Map<string, GameEvent>): GameEvent {
  const event = eventMap.get(eventId);
  if (!event) throw new Error(`Missing event "${eventId}" in program "${episodeId}".`);
  return event;
}

function SRandomPopularity(): number {
  return POPULARITY_MIN + Math.floor(getRandomValue() * (POPULARITY_MAX - POPULARITY_MIN + 1));
}
