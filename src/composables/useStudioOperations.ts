import { computed, type ComputedRef, type Ref } from 'vue';
import type { Character } from '../data/characters';
import { BOND_PROJECT_BASE_COST, FAN_PROGRAM_BASE_COST, RECORDING_INTENSITY_COST } from '../data/gameConfig';
import { SGetBondTraitBonus } from '../baseLib/serviceLib/SCharacterTraits';
import { SGetPairKey } from '../baseLib/serviceLib/SGameFeatures';
import { SCreateRecordingPlan } from '../baseLib/serviceLib/SRecordingStrategy';
import { SRecordBondProject, SRecordFanProgram, SRecordRecordingRun, SRecordReportAction } from '../baseLib/serviceLib/SStudioLedger';
import type { SBondPair } from '../baseLib/serviceLib/type/SBondPair';
import type { SGameEffect } from '../baseLib/serviceLib/type/SGameEffect';
import type { SEpisodeResourceCost } from '../baseLib/serviceLib/type/SEpisodeResources';
import type { SBondProjectKey, SFanProgramKey, SRecordingModeKey, SReportActionKey, SStudioLedger } from '../baseLib/serviceLib/type/SStudioLedger';

interface UseStudioOperationsOptions {
  applyEffect: (effect: SGameEffect) => void;
  averagePopularity: ComputedRef<number>;
  bondMap: Record<string, SBondPair>;
  bondProjectIntensity: Ref<number>;
  budget: Ref<number>;
  characters: Character[];
  eventCandidates: ComputedRef<Character[]>;
  executionIntensity: Ref<number>;
  fanOperationIntensity: Ref<number>;
  focusCharacter: ComputedRef<Character>;
  biasCharacter: ComputedRef<Character>;
  highlightedCharIds: Ref<Set<string>>;
  onBondProjectRecorded: (pair: Character[], intensity: number) => void;
  onFanProgramRecorded: (type: SFanProgramKey, intensity: number) => void;
  recordingMode: Ref<SRecordingModeKey>;
  selectedBondCharacters: ComputedRef<Character[]>;
  showFeedback: (message: string) => void;
  spendBudget: (cost: number) => boolean;
  spendResources: (cost: SEpisodeResourceCost, action: string) => boolean;
  studioLedger: SStudioLedger;
  topCharacter: ComputedRef<Character>;
}

/** Owns the four production workspaces while keeping their effects testable. */
export function useStudioOperations(options: UseStudioOperationsOptions) {
  const recordingPlan = computed(() => SCreateRecordingPlan(SCreateRecordingInput(options)));
  const recordingSuccessModifier = computed(() => recordingPlan.value.successModifier);
  return { applyRecordingControls: () => SApplyRecordingControls(options, recordingPlan.value), handleBondProject: (type: SBondProjectKey) => SHandleBondProject(options, type), handleFanProgram: (type: SFanProgramKey) => SHandleFanProgram(options, type), handleReportAction: (type: SReportActionKey) => SHandleReportAction(options, type), recordingResourceCost: computed(() => recordingPlan.value.resourceCost), recordingPlanMessage: computed(() => recordingPlan.value.message), recordingSuccessModifier };
}

function SCreateRecordingInput(options: UseStudioOperationsOptions) {
  return { characters: options.characters, averagePopularity: options.averagePopularity.value, focusCharacter: options.focusCharacter.value, intensity: options.executionIntensity.value, mode: options.recordingMode.value };
}

function SApplyRecordingControls(options: UseStudioOperationsOptions, plan: ReturnType<typeof SCreateRecordingPlan>) {
  const cost = options.executionIntensity.value * RECORDING_INTENSITY_COST;
  if (options.budget.value < cost) return SCreateSkippedRecording('经费不够卡机位了，这轮先裸剪选项。');
  if (!options.spendResources(plan.resourceCost, '卡机位')) return SCreateSkippedRecording('镜头份不够了，这轮先裸剪选项。');
  options.spendBudget(cost);
  SRecordRecordingRun(options.studioLedger, options.recordingMode.value, cost, options.focusCharacter.value.name);
  options.applyEffect(plan.effect);
  if (plan.highlightedCharacterId) options.highlightedCharIds.value = new Set([plan.highlightedCharacterId]);
  return plan;
}

function SCreateSkippedRecording(message: string) {
  return { message, successModifier: 0 };
}

function SHandleFanProgram(options: UseStudioOperationsOptions, type: SFanProgramKey) {
  const cost = FAN_PROGRAM_BASE_COST[type] * options.fanOperationIntensity.value;
  if (options.budget.value < cost) return options.showFeedback('经费紧，这波控评先缓缓。');
  if (!options.spendResources({ buzz: 1 }, '控评投放')) return;
  if (!options.spendBudget(cost)) return options.showFeedback('经费紧，这波控评先缓缓。');
  SRecordFanProgram(options.studioLedger, type, cost);
  options.onFanProgramRecorded(type, options.fanOperationIntensity.value);
  options.applyEffect(SCreateFanEffect(options, type));
  options.showFeedback(SGetFanMessage(type));
}

function SCreateFanEffect(options: UseStudioOperationsOptions, type: SFanProgramKey): SGameEffect {
  const power = options.fanOperationIntensity.value;
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

function SGetFanMessage(type: SFanProgramKey): string {
  return { GROUP: '团建物料发出去了，团粉盘抬起来，全员都有曝光。', SOLO: '本命直拍铺开，唯粉盘升温，推子彻底站上了。', CP: '糖点花絮放出来了，CP 粉暴涨，也有人开始审判营业。', PUBLIC: '路人切片铺开了，路人盘上来，糊糊也吃到镜头。', ANTI: '反黑组上线，黑词被压下去，口碑回了点血。' }[type];
}

function SHandleBondProject(options: UseStudioOperationsOptions, type: SBondProjectKey) {
  const pair = options.selectedBondCharacters.value;
  if (pair.length !== 2) return options.showFeedback('先锁两位成员，再开嗑。');
  const cost = BOND_PROJECT_BASE_COST[type] * options.bondProjectIntensity.value;
  if (options.budget.value < cost) return options.showFeedback('经费紧，这波营业排不上了。');
  if (!options.spendResources({ camera: 1, edit: 1 }, 'CP 营业')) return;
  if (!options.spendBudget(cost)) return options.showFeedback('经费紧，这波营业排不上了。');
  SRecordBondProject(options.studioLedger, type, cost, pair.map(character => character.name).join(' × '));
  options.onBondProjectRecorded(pair, options.bondProjectIntensity.value);
  SApplyBondProject(options, type, pair);
}

function SApplyBondProject(options: UseStudioOperationsOptions, type: SBondProjectKey, pair: Character[]) {
  const bonus = SGetBondBonus(pair, type, options.bondProjectIntensity.value);
  options.applyEffect(SCreateBondEffect(pair, type, bonus, options.bondProjectIntensity.value));
  const value = options.bondMap[SGetPairKey(pair[0], pair[1])]?.value || 0;
  options.showFeedback(`${pair[0].name} × ${pair[1].name} 这波营业到位，嗑点拉到 ${value}。`);
}

function SGetBondBonus(pair: Character[], type: SBondProjectKey, intensity: number): number {
  return ((type === 'STAGE' ? 3 : 2) + SGetBondTraitBonus(pair, type)) * intensity;
}

function SCreateBondEffect(pair: Character[], type: SBondProjectKey, bonus: number, intensity: number): SGameEffect {
  const traitBonus = SGetBondTraitBonus(pair, type);
  return { popularity: SCreatePopularityEffect(pair, bonus), factions: { cpFans: (type === 'LIVE' ? 5 : 3) * intensity }, season: { cpHeat: 2 * intensity, anticipation: intensity }, bond: { pairIds: [pair[0].id, pair[1].id], names: `${pair[0].name} x ${pair[1].name}`, delta: 18 + traitBonus * 4 } };
}

function SHandleReportAction(options: UseStudioOperationsOptions, type: SReportActionKey) {
  const cost = 10000;
  if (options.budget.value < cost) return options.showFeedback('经费紧，复盘会先停一下。');
  if (!options.spendResources({ edit: 1 }, '复盘纠偏')) return;
  if (!options.spendBudget(cost)) return options.showFeedback('经费紧，复盘会先停一下。');
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
  return '舆情复盘做完，黑词压下去一点，口碑回稳。';
}

function SCreatePopularityEffect(characters: Character[], value: number): Record<string, number> {
  return Object.fromEntries(characters.map(character => [character.id, value]));
}
