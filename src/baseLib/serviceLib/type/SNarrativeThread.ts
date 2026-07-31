export type SNarrativeThreadStage = 'SEEDED' | 'HEATED' | 'RESOLVED';

export interface SNarrativeThread {
  key: string;
  title: string;
  stage: SNarrativeThreadStage;
  detail: string;
}

export interface SNarrativeOutcome {
  title: string;
  detail: string;
}
