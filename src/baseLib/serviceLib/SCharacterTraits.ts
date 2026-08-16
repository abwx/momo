import type { Character } from '../../data/characters';
import { CHARACTER_TRAIT_MAP } from '../../data/characterTraits';
import type { CharacterTraitKey } from '../../data/type/CharacterTrait';
import type { SBondProjectKey } from './type/SStudioLedger';

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
