export type SNextEpisodeHookKey = 'CLEAN' | 'DUO' | 'UNDERDOG';

export interface SNextEpisodeHook {
  characterIds: string[];
  key: SNextEpisodeHookKey;
  targetEventIndex: number;
}
