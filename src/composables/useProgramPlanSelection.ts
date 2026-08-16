import type { Ref } from 'vue';
import type { Character } from '../data/characters';
import type { GameEvent } from '../data/type/GameEvent';
import type { SGameEffect } from '../baseLib/serviceLib/type/SGameEffect';
import type { SProgramPlan, SProgramPlanKey } from '../baseLib/serviceLib/type/SProgramPlan';
import type { SSeasonState } from '../baseLib/serviceLib/type/SSeasonState';
import { SCreateProgramPlan, SGetProgramPlanAvailability } from '../baseLib/serviceLib/SProgramPlan';

interface UseProgramPlanSelectionOptions {
  applyEffect: (effect: SGameEffect) => void;
  biasCharacterId: Ref<string>;
  budget: Ref<number>;
  characters: Character[];
  currentEventIndex: Ref<number>;
  gameEvents: Ref<GameEvent[]>;
  isPlanPrompt: () => boolean;
  lastScenePairIds: Ref<[string, string] | null>;
  onBlocked: (message: string) => void;
  onSelected: () => void;
  programPlan: Ref<SProgramPlan | null>;
  seasonState: SSeasonState;
}

/** Starts a fan plan through one budget gate shared by the workspace and handler. */
export function useProgramPlanSelection(options: UseProgramPlanSelectionOptions) {
  return { selectProgramPlan: (key: SProgramPlanKey) => _selectProgramPlan(options, key) };
}

function _selectProgramPlan(options: UseProgramPlanSelectionOptions, key: SProgramPlanKey): void {
  const plan = _createProgramPlan(options, key);
  const blockedMessage = _getBlockedMessage(options, plan);
  if (blockedMessage) return options.onBlocked(blockedMessage);
  options.applyEffect({ budgetDelta: -plan.investment });
  options.programPlan.value = plan;
  options.seasonState.programPlanPromptIndex = 0;
  options.onSelected();
}

function _getBlockedMessage(options: UseProgramPlanSelectionOptions, plan: SProgramPlan): string {
  if (!options.isPlanPrompt()) return '当前不是节目计划决策节点。';
  if (options.programPlan.value) return '本季节目计划已经确定，不能重复押注。';
  if (plan.targetParts < 2) return '剩余镜头不足两段，不能开启节目计划。';
  return SGetProgramPlanAvailability(options.budget.value, plan.investment).isAffordable ? '' : '经费不够，暂时无法押这条节目计划。';
}

function _createProgramPlan(options: UseProgramPlanSelectionOptions, key: SProgramPlanKey): SProgramPlan {
  const targetParts = Math.min(3, options.gameEvents.value.length - options.currentEventIndex.value);
  return SCreateProgramPlan(key, options.characters, targetParts, _getPlanCandidateIds(options, key));
}

function _getPlanCandidateIds(options: UseProgramPlanSelectionOptions, key: SProgramPlanKey): string[] {
  if (key === 'FOCUS') return [options.biasCharacterId.value];
  return options.lastScenePairIds.value || [];
}
