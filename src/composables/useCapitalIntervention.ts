import { computed, ref, type Ref } from 'vue';
import type { Character } from '../data/characters';
import type { SCapitalIntervention } from '../baseLib/serviceLib/type/SCapitalIntervention';
import type { SClassTrackState } from '../baseLib/serviceLib/type/SClassTrack';
import type { SGameEffect } from '../baseLib/serviceLib/type/SGameEffect';
import type { SStrategicActionHistoryItem } from '../baseLib/serviceLib/type/SStrategicActionHistory';
import { SCreateCapitalInterventionOutcome } from '../baseLib/serviceLib/SCapitalIntervention';
import { SAddAssessmentScores } from '../baseLib/serviceLib/SClassTrack';

interface UseCapitalInterventionOptions {
  applyEffect: (effect: SGameEffect) => void;
  biasCharacterId: Ref<string>;
  budget: Ref<number>;
  characters: Character[];
  canIntervene: () => boolean;
  classTrackState: SClassTrackState;
  currentEventIndex: Ref<number>;
  onFeedback: (message: string, impactLines: string[]) => void;
  onRecord: (action: SStrategicActionHistoryItem) => void;
}

/** Owns one-camera capital actions and keeps their displayed values identical to settlement. */
export function useCapitalIntervention(options: UseCapitalInterventionOptions) {
  const lastActionEventIndex = ref(-1);
  const capitalInterventionAvailable = computed(() => lastActionEventIndex.value !== options.currentEventIndex.value);
  const capitalOutcomes = computed(() => SCreateCapitalOutcomes(options));
  return { capitalInterventionAvailable, capitalOutcomes, handleCapitalIntervention: (id: string, intervention: SCapitalIntervention) => SHandleCapitalIntervention(options, lastActionEventIndex, id, intervention), resetCapitalIntervention: () => lastActionEventIndex.value = -1 };
}

function SCreateCapitalOutcomes(options: UseCapitalInterventionOptions) {
  return Object.fromEntries(options.characters.map(character => [character.id, {
    boost: SCreateCapitalInterventionOutcome(options.classTrackState, character, 'BOOST'),
    suppress: SCreateCapitalInterventionOutcome(options.classTrackState, character, 'SUPPRESS'),
  }]));
}

function SHandleCapitalIntervention(options: UseCapitalInterventionOptions, lastActionEventIndex: Ref<number>, characterId: string, intervention: SCapitalIntervention): void {
  if (!options.canIntervene()) return options.onFeedback('当前节点已结算，不能再执行资本调度。', []);
  const character = options.characters.find(item => item.id === characterId);
  if (!character) return;
  if (SIsBiasSuppression(options, characterId, intervention)) return options.onFeedback('本命不能执行压热操作。', []);
  const outcome = SCreateCapitalInterventionOutcome(options.classTrackState, character, intervention);
  if (!SCanApplyCapitalAction(options, lastActionEventIndex, outcome.cost, outcome.popularityDelta)) return SShowBlockedAction(options, lastActionEventIndex, outcome.cost, outcome.popularityDelta);
  SApplyCapitalAction(options, lastActionEventIndex, character, intervention, outcome);
}

function SIsBiasSuppression(options: UseCapitalInterventionOptions, characterId: string, intervention: SCapitalIntervention): boolean {
  return intervention === 'SUPPRESS' && characterId === options.biasCharacterId.value;
}

function SCanApplyCapitalAction(options: UseCapitalInterventionOptions, lastActionEventIndex: Ref<number>, cost: number, popularityDelta: number): boolean {
  return lastActionEventIndex.value !== options.currentEventIndex.value && options.budget.value >= cost && popularityDelta !== 0;
}

function SShowBlockedAction(options: UseCapitalInterventionOptions, lastActionEventIndex: Ref<number>, cost: number, popularityDelta: number): void {
  options.onFeedback(SGetBlockMessage(options, lastActionEventIndex, cost, popularityDelta), []);
}

function SGetBlockMessage(options: UseCapitalInterventionOptions, lastActionEventIndex: Ref<number>, cost: number, popularityDelta: number): string {
  if (lastActionEventIndex.value === options.currentEventIndex.value) return '本镜已经执行过资本调度。';
  if (options.budget.value < cost) return `经费不足，还差 ¥${(cost - options.budget.value).toLocaleString()}。`;
  return popularityDelta === 0 ? '该成员热度已到边界，无法再调整。' : '暂时无法执行资本调度。';
}

function SApplyCapitalAction(options: UseCapitalInterventionOptions, lastActionEventIndex: Ref<number>, character: Character, intervention: SCapitalIntervention, outcome: ReturnType<typeof SCreateCapitalInterventionOutcome>): void {
  options.applyEffect(outcome.effect);
  SAddAssessmentScores(options.classTrackState, { [character.id]: outcome.seatDelta });
  lastActionEventIndex.value = options.currentEventIndex.value;
  options.onRecord(SCreateStrategicAction(options, character, intervention, outcome));
  options.onFeedback(`${character.name} 热度 ${SFormatDelta(outcome.popularityDelta)}。`, [`席位 ${SFormatDelta(outcome.seatDelta)} 分`, `经费 -¥${outcome.cost.toLocaleString()}`]);
}

function SCreateStrategicAction(options: UseCapitalInterventionOptions, character: Character, intervention: SCapitalIntervention, outcome: ReturnType<typeof SCreateCapitalInterventionOutcome>): SStrategicActionHistoryItem {
  return { characterId: character.id, characterName: character.name, cost: outcome.cost, eventIndex: options.currentEventIndex.value, intervention, popularityDelta: outcome.popularityDelta, seatDelta: outcome.seatDelta };
}

function SFormatDelta(value: number): string {
  return value > 0 ? `+${value}` : `${value}`;
}
