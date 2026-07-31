import type { Character } from '../../../data/characters';
import type { SGameEffect } from './SGameEffect';
import type { SEpisodeResourceCost } from './SEpisodeResources';
import type { SRecordingModeKey } from './SStudioLedger';

export interface SRecordingPlanInput {
  characters: Character[];
  averagePopularity: number;
  focusCharacter: Character;
  intensity: number;
  mode: SRecordingModeKey;
}

export interface SRecordingPlan {
  effect: SGameEffect;
  highlightedCharacterId?: string;
  message: string;
  resourceCost: SEpisodeResourceCost;
  successModifier: number;
}
