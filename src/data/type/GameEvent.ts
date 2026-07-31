import type { Character } from '../characters';

export type GameEventType = 'CHOICE' | 'PICK_TWO' | 'RANKING';
export type PickTwoRole = 'DUO_STAGE' | 'TEAM';

export type GameEffectTag =
  | 'GROUP_BOOST'
  | 'ANTI_RISK'
  | 'PUBLIC_BOOST'
  | 'DRAMA_ESCALATE'
  | 'DRAMA_SETTLE'
  | 'FOCUS_ESCALATE'
  | 'FOCUS_SETTLE'
  | 'CP_ESCALATE'
  | 'CP_SETTLE'
  | 'UNDERDOG_SPOTLIGHT'
  | 'FINALE_AUDIT';

export type Choice = {
  text: string;
  preview?: string;
  action: (characters: Character[]) => string;
  effectTags?: GameEffectTag[];
};

export type ChoiceList = Choice[] | ((candidates: Character[]) => Choice[]);

export type PickTwoChoices = {
  action: (char1: Character, char2: Character, characters?: Character[]) => string;
};

export type RankingChoices = {
  action: (rankedChars: Character[]) => string;
};

export type ChoiceGameEvent = {
  id: string;
  type: 'CHOICE';
  title: string;
  description: string;
  choices: ChoiceList;
};

export type PickTwoGameEvent = {
  id: string;
  type: 'PICK_TWO';
  pairRole?: PickTwoRole;
  title: string;
  description: string;
  choices: PickTwoChoices;
};

export type RankingGameEvent = {
  id: string;
  type: 'RANKING';
  title: string;
  description: string;
  choices: RankingChoices;
};

export type GameEvent = ChoiceGameEvent | PickTwoGameEvent | RankingGameEvent;
