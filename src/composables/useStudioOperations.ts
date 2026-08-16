import type { ComputedRef, Ref } from 'vue';
import type { Character } from '../data/characters';
import { BOND_PROJECT_BASE_COST, FAN_PROGRAM_BASE_COST } from '../data/gameConfig';
import { SGetBondTraitBonus } from '../baseLib/serviceLib/SCharacterTraits';
import { SGetPairKey } from '../baseLib/serviceLib/SGameFeatures';
import { SRecordBondProject, SRecordFanProgram, SRecordReportAction } from '../baseLib/serviceLib/SStudioLedger';
import type { SBondPair } from '../baseLib/serviceLib/type/SBondPair';
import type { SGameEffect } from '../baseLib/serviceLib/type/SGameEffect';
import type { SEpisodeResourceCost } from '../baseLib/serviceLib/type/SEpisodeResources';
import type { SBondProjectKey, SFanProgramKey, SReportActionKey, SStudioLedger } from '../baseLib/serviceLib/type/SStudioLedger';
import type { SFanPulse } from '../baseLib/serviceLib/type/SFanPulse';

interface UseStudioOperationsOptions {
  applyEffect: (effect: SGameEffect) => void;
  averagePopularity: ComputedRef<number>;
  bondMap: Record<string, SBondPair>;
  budget: Ref<number>;
  characters: Character[];
  biasCharacter: ComputedRef<Character>;
  fanPulse?: ComputedRef<SFanPulse>;
  onBondHook?: (pair: Character[]) => string;
  onFanHook?: (type: SFanProgramKey) => string;
  onPulseHandled?: () => void;
  onBondProjectRecorded: (pair: Character[], intensity: number) => string[];
  onFanProgramRecorded: (type: SFanProgramKey, intensity: number) => string[];
  selectedBondCharacters: ComputedRef<Character[]>;
  showFeedback: (message: string, impactLines?: string[]) => void;
  resolveNegativeTrending?: () => void;
  spendBudget: (cost: number) => boolean;
  spendResources: (cost: SEpisodeResourceCost, action: string) => boolean;
  studioLedger: SStudioLedger;
}

/** Owns production workspace actions while keeping their effects testable. */
export function useStudioOperations(options: UseStudioOperationsOptions) {
  return { handleBondProject: (type: SBondProjectKey) => SHandleBondProject(options, type), handleFanProgram: (type: SFanProgramKey) => SHandleFanProgram(options, type), handleReportAction: (type: SReportActionKey) => SHandleReportAction(options, type) };
}

function SHandleFanProgram(options: UseStudioOperationsOptions, type: SFanProgramKey) {
  const cost = FAN_PROGRAM_BASE_COST[type];
  if (options.budget.value < cost) return options.showFeedback('经费紧，这波控评先缓缓。');
  if (!options.spendResources({ buzz: 1 }, '控评投放')) return;
  if (!options.spendBudget(cost)) return options.showFeedback('经费紧，这波控评先缓缓。');
  SRecordFanProgram(options.studioLedger, type, cost);
  const impactLines = options.onFanProgramRecorded(type, 1);
  const isPulseMatch = SIsProgramPulseMatch(options, type);
  options.applyEffect(SCreateFanEffect(options, type));
  if (type === 'ANTI') options.resolveNegativeTrending?.();
  if (isPulseMatch) SApplyProgramPulseMatch(options);
  const hookLine = options.onFanHook?.(type);
  options.showFeedback(SGetFanMessage(type, options), [
    ...impactLines,
    ...SGetFanImpactLines(type),
    ...SGetProgramPulseLines(isPulseMatch),
    ...(hookLine ? [hookLine] : []),
  ].slice(0, 4));
}

function SGetFanMessage(type: SFanProgramKey, options: UseStudioOperationsOptions): string {
  const bias = options.biasCharacter.value.name;
  return {
    GROUP: '团建物料发出去了，团粉盘抬起来，全员都有曝光。',
    SOLO: `${bias} 直拍铺开，唯粉盘升温，本命席位评分也被托了一把。`,
    CP: '糖点花絮放出来了，CP 粉暴涨，也有人开始审判营业。',
    PUBLIC: '路人切片铺开了，路人盘上来，糊糊也吃到镜头。',
    ANTI: '反黑组上线，黑词被压下去，口碑回了点血。',
  }[type];
}

function SGetFanImpactLines(type: SFanProgramKey): string[] {
  const power = 1;
  if (type === 'GROUP') return [`团粉 +${5 * power}`, `全员热度 +${power}`];
  if (type === 'SOLO') return [`唯粉 +${5 * power}`, `偏心压力 +${2 * power}`];
  if (type === 'CP') return [`CP 粉 +${6 * power}`, `黑词压力 +${power}`];
  if (type === 'PUBLIC') return [`路人盘 +${6 * power}`];
  return [`黑词 ${-6 * power}`, `制作口碑 +${2 * power}`];
}

function SCreateFanEffect(options: UseStudioOperationsOptions, type: SFanProgramKey): SGameEffect {
  const power = 1;
  if (type === 'GROUP') return { popularity: SCreatePopularityEffect(options.characters, power), factions: { groupFans: 5 * power }, season: { groupHeat: 2 * power } };
  if (type === 'SOLO') return { popularity: { [options.biasCharacter.value.id]: 3 * power }, factions: { soloFans: 5 * power }, season: { biasPressure: 2 * power } };
  if (type === 'CP') return { factions: { cpFans: 6 * power, antiFans: power }, season: { cpHeat: 3 * power, anticipation: power } };
  if (type === 'PUBLIC') return SCreatePublicFanEffect(options, power);
  return { factions: { antiFans: -6 * power, publicFans: power }, season: { producerReputation: 2 * power } };
}

function SCreatePublicFanEffect(options: UseStudioOperationsOptions, power: number): SGameEffect {
  const targets = options.characters.filter(character => character.popularity < 78);
  return { popularity: SCreatePopularityEffect(targets, power), factions: { publicFans: 6 * power }, season: { lowRankMomentum: 2 * power, producerReputation: power } };
}

function SHandleBondProject(options: UseStudioOperationsOptions, type: SBondProjectKey) {
  const pair = options.selectedBondCharacters.value;
  if (pair.length !== 2) return options.showFeedback('先锁两位成员，再开嗑。');
  const cost = BOND_PROJECT_BASE_COST[type];
  if (options.budget.value < cost) return options.showFeedback('经费紧，这波营业排不上了。');
  if (!options.spendResources({ camera: 1, edit: 1 }, 'CP 营业')) return;
  if (!options.spendBudget(cost)) return options.showFeedback('经费紧，这波营业排不上了。');
  SRecordBondProject(options.studioLedger, type, cost, pair.map(character => character.name).join(' × '));
  const impactLines = options.onBondProjectRecorded(pair, 1);
  SApplyBondProject(options, type, pair, impactLines, SIsPairPulseMatch(options, type, pair));
}

function SApplyBondProject(options: UseStudioOperationsOptions, type: SBondProjectKey, pair: Character[], impactLines: string[], isPulseMatch: boolean) {
  const bonus = SGetBondBonus(pair, type);
  options.applyEffect(SCreateBondEffect(pair, type, bonus));
  if (isPulseMatch) SApplyPairPulseMatch(options, pair);
  const hookLine = options.onBondHook?.(pair);
  const value = options.bondMap[SGetPairKey(pair[0], pair[1])]?.value || 0;
  options.showFeedback(`${pair[0].name} × ${pair[1].name} 这波营业到位。`, [
    ...impactLines,
    `嗑点 -> ${value}`,
    `两人热度 +${bonus}`,
    ...(isPulseMatch ? ['顺着热评拍，广场好感 +2'] : []),
    ...(hookLine ? [hookLine] : []),
  ].slice(0, 4));
}

function SIsProgramPulseMatch(options: UseStudioOperationsOptions, type: SFanProgramKey): boolean {
  const pulse = options.fanPulse?.value;
  return Boolean(pulse && pulse.phase !== 'RESOLVED' && pulse.program === type);
}

function SGetProgramPulseLines(isPulseMatch: boolean): string[] {
  return isPulseMatch ? ['顺着热评剪，路人好感 +2'] : [];
}

function SApplyProgramPulseMatch(options: UseStudioOperationsOptions): void {
  options.applyEffect({ factions: { publicFans: 2 }, season: { producerReputation: 1 } });
  options.onPulseHandled?.();
}

function SIsPairPulseMatch(options: UseStudioOperationsOptions, type: SBondProjectKey, pair: Character[]): boolean {
  const pulse = options.fanPulse?.value;
  return Boolean(pulse && pulse.phase !== 'RESOLVED' && pulse.project === type && SSamePair(pulse.pairIds, pair.map(character => character.id)));
}

function SSamePair(left: string[], right: string[]): boolean {
  return [...left].sort().join('__') === [...right].sort().join('__');
}

function SApplyPairPulseMatch(options: UseStudioOperationsOptions, pair: Character[]): void {
  options.applyEffect({ popularity: SCreatePopularityEffect(pair, 1), factions: { publicFans: 2 } });
  options.onPulseHandled?.();
}

function SGetBondBonus(pair: Character[], type: SBondProjectKey): number {
  return (type === 'STAGE' ? 3 : 2) + SGetBondTraitBonus(pair, type);
}

function SCreateBondEffect(pair: Character[], type: SBondProjectKey, bonus: number): SGameEffect {
  const traitBonus = SGetBondTraitBonus(pair, type);
  return { popularity: SCreatePopularityEffect(pair, bonus), factions: { cpFans: type === 'LIVE' ? 5 : 3 }, season: { cpHeat: 2, anticipation: 1 }, bond: { pairIds: [pair[0].id, pair[1].id], names: `${pair[0].name} x ${pair[1].name}`, delta: 18 + traitBonus * 4 } };
}

function SHandleReportAction(options: UseStudioOperationsOptions, type: SReportActionKey) {
  const cost = 10000;
  if (options.budget.value < cost) return options.showFeedback('经费紧，现场纠偏先缓一缓。');
  if (!options.spendResources({ edit: 1 }, '现场纠偏')) return;
  if (!options.spendBudget(cost)) return options.showFeedback('经费紧，现场纠偏先缓一缓。');
  SRecordReportAction(options.studioLedger, type, cost);
  options.applyEffect(SCreateReportEffect(options, type));
  options.showFeedback(SGetReportMessage(type));
}

function SCreateReportEffect(options: UseStudioOperationsOptions, type: SReportActionKey): SGameEffect {
  if (type === 'BALANCE') return { popularity: SCreatePopularityEffect(options.characters.filter(character => character.popularity < options.averagePopularity.value), 4), season: { lowRankMomentum: 4, producerReputation: 2 } };
  return { factions: { antiFans: -8 }, season: { producerReputation: 4 } };
}

function SGetReportMessage(type: SReportActionKey): string {
  if (type === 'BALANCE') return '补镜头会议开完了，糊糊这波也吃到戏份。';
  return '舆情处理完成，黑词压下去一点，口碑回稳。';
}

function SCreatePopularityEffect(characters: Character[], value: number): Record<string, number> {
  return Object.fromEntries(characters.map(character => [character.id, value]));
}
