export type CharacterTraitKey =
  | 'STAGE_CORE'
  | 'VARIETY_SPARK'
  | 'CP_MAGNET'
  | 'PUBLIC_FAVOR'
  | 'PR_SHIELD'
  | 'GROWTH_CURVE';

export interface CharacterTrait {
  key: CharacterTraitKey;
  name: string;
  desc: string;
}
