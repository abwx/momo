import type { Character } from '../../data/characters';
import type { GameEvent } from '../../data/events';
import type { ProgramEpisode } from '../../data/type/ProgramEpisode';
import { getRandomValue } from '../../utils/random';

const POPULARITY_JITTER = 7;

/** 每季开局：在默认热度上下浮动，避免每局前五永远同一批。 */
export function SJitterStartingPopularity(characters: Character[], amplitude = POPULARITY_JITTER): Character[] {
  return characters.map(character => ({
    ...character,
    popularity: SClampPopularity(character.popularity + SRandomDelta(amplitude)),
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

function SGetEpisodeEvents(episode: ProgramEpisode, eventMap: Map<string, GameEvent>): GameEvent[] {
  return episode.eventIds.map(eventId => SGetProgramEvent(episode.id, eventId, eventMap));
}

function SGetProgramEvent(episodeId: string, eventId: string, eventMap: Map<string, GameEvent>): GameEvent {
  const event = eventMap.get(eventId);
  if (!event) throw new Error(`Missing event "${eventId}" in program "${episodeId}".`);
  return event;
}

function SRandomDelta(amplitude: number): number {
  return Math.floor(getRandomValue() * (amplitude * 2 + 1)) - amplitude;
}

function SClampPopularity(value: number): number {
  return Math.min(95, Math.max(50, Math.round(value)));
}
