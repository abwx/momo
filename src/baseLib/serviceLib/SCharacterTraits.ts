import type { Character } from '../../data/characters';
import { CHARACTER_TRAIT_MAP, CHARACTER_TRAITS } from '../../data/characterTraits';
import type { CharacterTrait, CharacterTraitKey } from '../../data/type/CharacterTrait';
import type { SBondProjectKey, SRecordingModeKey } from './type/SStudioLedger';

export function SGetCharacterTraits(characterId: string): CharacterTrait[] {
  return SGetCharacterTraitKeys(characterId).map(key => CHARACTER_TRAITS[key]);
}

export function SGetCharacterTraitNames(characterId: string): string {
  return SGetCharacterTraits(characterId).map(trait => trait.name).join(' / ');
}

export function SGetRecordingTraitBonus(character: Character, mode: SRecordingModeKey): number {
  if (mode === 'FOCUS' && SHasTrait(character.id, 'STAGE_CORE')) return 1;
  if (mode === 'DRAMA' && SHasTrait(character.id, 'VARIETY_SPARK')) return 1;
  if (mode === 'BALANCE' && SHasTrait(character.id, 'GROWTH_CURVE')) return 1;
  return 0;
}

export function SGetDramaAntiReduction(character: Character): number {
  return SHasTrait(character.id, 'PR_SHIELD') ? 1 : 0;
}

export function SGetBondTraitBonus(pair: Character[], type: SBondProjectKey): number {
  const cpBonus = pair.filter(char => SHasTrait(char.id, 'CP_MAGNET')).length;
  const vlogBonus = type === 'VLOG' ? pair.filter(char => SHasTrait(char.id, 'VARIETY_SPARK')).length : 0;
  return cpBonus + vlogBonus;
}

function SGetCharacterTraitKeys(characterId: string): CharacterTraitKey[] {
  return CHARACTER_TRAIT_MAP[characterId] || [];
}

function SHasTrait(characterId: string, trait: CharacterTraitKey): boolean {
  return SGetCharacterTraitKeys(characterId).includes(trait);
}
