/** The player-visible consequence of one completed recording decision. */
export interface RoundResolution {
  choiceText: string;
  result: string;
  affectedNames: string[];
  impactLines: string[];
}
