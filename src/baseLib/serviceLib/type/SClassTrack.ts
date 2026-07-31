export type SClassKey = 'CLASS1' | 'CLASS2';

export interface SEpisodeClassResult {
  episodeId: string;
  rankedIds: string[];
  promotedIds: string[];
  demotedIds: string[];
  biasClass: SClassKey;
}

export interface SClassTrackState {
  capacityClass1: number;
  classById: Record<string, SClassKey>;
  assessmentScore: Record<string, number>;
  episodeResults: SEpisodeClassResult[];
}
