import type { Character } from '../../data/characters';
import { SGetDramaAntiReduction, SGetRecordingTraitBonus } from './SCharacterTraits';
import type { SGameEffect } from './type/SGameEffect';
import type { SRecordingModeKey } from './type/SStudioLedger';
import type { SRecordingPlan, SRecordingPlanInput } from './type/SRecordingPlan';

/** Builds the recording effects, resource cost, and outcome modifier for one event. */
export function SCreateRecordingPlan(input: SRecordingPlanInput): SRecordingPlan {
  const effect = SCreateRecordingEffect(input);
  return { effect, message: SGetRecordingMessage(input), resourceCost: SGetRecordingResourceCost(input.mode), successModifier: SGetRecordingSuccessModifier(input), highlightedCharacterId: SGetHighlightedCharacterId(input.mode, input.focusCharacter) };
}

export function SGetRecordingResourceCost(mode: SRecordingModeKey) {
  if (mode === 'FOCUS') return { camera: 2, edit: 1 };
  if (mode === 'DRAMA') return { camera: 1, edit: 2 };
  return { camera: 1, edit: 1 };
}

function SCreateRecordingEffect(input: SRecordingPlanInput): SGameEffect {
  if (input.mode === 'FOCUS') return SCreateFocusEffect(input);
  if (input.mode === 'DRAMA') return SCreateDramaEffect(input);
  return SCreateBalanceEffect(input);
}

function SCreateBalanceEffect(input: SRecordingPlanInput): SGameEffect {
  const targets = input.characters.filter(character => character.popularity < input.averagePopularity);
  return { popularity: SCreateBalancePopularity(targets, input.intensity), factions: { groupFans: input.intensity }, season: { groupHeat: input.intensity, producerReputation: input.intensity, lowRankMomentum: input.intensity } };
}

function SCreateBalancePopularity(characters: Character[], intensity: number): Record<string, number> {
  const baseBonus = Math.max(1, Math.ceil(intensity / 2));
  return Object.fromEntries(characters.map(character => [character.id, baseBonus + SGetRecordingTraitBonus(character, 'BALANCE')]));
}

function SCreateFocusEffect(input: SRecordingPlanInput): SGameEffect {
  const bonus = SGetRecordingTraitBonus(input.focusCharacter, 'FOCUS') * input.intensity;
  return { popularity: { [input.focusCharacter.id]: input.intensity * 2 + bonus }, factions: { soloFans: input.intensity }, season: { groupHeat: input.intensity, biasPressure: input.intensity * 2, producerReputation: -1 } };
}

function SCreateDramaEffect(input: SRecordingPlanInput): SGameEffect {
  const bonus = SGetRecordingTraitBonus(input.focusCharacter, 'DRAMA') * input.intensity;
  return { popularity: { [input.focusCharacter.id]: input.intensity * 3 + bonus }, factions: { publicFans: input.intensity * 2, antiFans: SGetDramaAntiIncrease(input) }, season: { groupHeat: input.intensity * 3, anticipation: input.intensity * 2, dramaDebt: input.intensity * 2, producerReputation: -input.intensity } };
}

function SGetDramaAntiIncrease(input: SRecordingPlanInput): number {
  const baseIncrease = Math.max(1, input.intensity - 1);
  return Math.max(0, baseIncrease - SGetDramaAntiReduction(input.focusCharacter));
}

function SGetRecordingSuccessModifier(input: SRecordingPlanInput): number {
  const traitBonus = SGetRecordingTraitBonus(input.focusCharacter, input.mode) * 0.01;
  return Math.min(0.18, SGetRecordingBaseModifier(input.mode) * input.intensity + traitBonus);
}

function SGetRecordingBaseModifier(mode: SRecordingModeKey): number {
  if (mode === 'DRAMA') return 0.05;
  if (mode === 'FOCUS') return 0.035;
  return 0.015;
}

function SGetHighlightedCharacterId(mode: SRecordingModeKey, focusCharacter: Character): string | undefined {
  return mode === 'BALANCE' ? undefined : focusCharacter.id;
}

function SGetRecordingMessage(input: SRecordingPlanInput): string {
  if (input.mode === 'FOCUS') return `机位锁死 ${input.focusCharacter.name}，个人高光额外放大。`;
  if (input.mode === 'DRAMA') return `抓马剪法拉满，${input.focusCharacter.name} 讨论度暴涨，黑词也会跟着涨。`;
  return '剪法切到「群像」，糊糊这波能吃到补镜头。';
}
