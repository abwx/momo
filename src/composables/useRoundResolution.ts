import type { ComputedRef, Ref } from 'vue';
import type { Character } from '../data/characters';
import type { GameEffectTag, GameEvent } from '../data/type/GameEvent';
import type { SClassTrackState } from '../baseLib/serviceLib/type/SClassTrack';
import type { SGameEffect } from '../baseLib/serviceLib/type/SGameEffect';
import type { SNextEpisodeHook } from '../baseLib/serviceLib/type/SNextEpisodeHook';
import type { SProgramPlan } from '../baseLib/serviceLib/type/SProgramPlan';
import type { SSeasonMetrics, SSeasonState } from '../baseLib/serviceLib/type/SSeasonState';
import { SAddAssessmentScores, SCreateClassPopularityDeltas, SCreateEventAssessmentDeltas, SCreateFinaleAssessmentDeltas, SMergeAssessmentDeltas } from '../baseLib/serviceLib/SClassTrack';
import { SCreateEventDraftEffect, SCreateEventFactionEffect, SCreateFactionDraftEffect, type SGameEffectResult } from '../baseLib/serviceLib/SGameEffect';
import { SGetProgramBonus } from '../baseLib/serviceLib/SGameFeatures';
import type { SFanFactionState } from '../baseLib/serviceLib/type/SFanFactionState';
import { SGetNarrativeChoiceHint, SGetNarrativeTagEffect } from '../baseLib/serviceLib/SGameNarrative';
import { SGetCurrentProgramPlanTags, SGetProgramPlanResolution, SRecordProgramPlanPart } from '../baseLib/serviceLib/SProgramPlan';
import { RECORDING_SCENE_COST } from '../data/gameConfig';
import { cloneData } from '../utils/cloneData';

interface UseRoundResolutionOptions {
  applyEffect: (effect: SGameEffect) => SGameEffectResult;
  biasCharacterId: Ref<string>;
  captureScenePair: () => void;
  characters: Character[];
  classTrackState: SClassTrackState;
  currentEvent: ComputedRef<GameEvent | null>;
  currentEventIndex: Ref<number>;
  fanFactions: SFanFactionState;
  getRandomValue: () => number;
  getRankingList: () => Character[];
  getSelectedPair: () => Character[];
  nextEpisodeHook: ComputedRef<SNextEpisodeHook | null>;
  programPlan: Ref<SProgramPlan | null>;
  seasonState: SSeasonState;
  showRoundResult: (result: string, choiceText: string, affectedIds: string[], tags: GameEffectTag[], impactLines: string[]) => void;
}

/** Applies one recording choice and produces its player-facing resolution. */
export function useRoundResolution(options: UseRoundResolutionOptions) {
  return { applyEventResult: (result: string, draft: Character[], tags: GameEffectTag[] = [], choiceText = '本轮出片') => _applyEventResult(options, result, draft, tags, choiceText) };
}

function _applyEventResult(options: UseRoundResolutionOptions, result: string, draft: Character[], tags: GameEffectTag[], choiceText: string) {
  const event = options.currentEvent.value;
  if (!event) return;
  const eventTags = _getProgramPlanTags(options, tags);
  const assessment = _applyEventAssessment(options, event, draft, eventTags);
  _showEventResolution(options, result, choiceText, eventTags, assessment);
}

function _applyEventAssessment(options: UseRoundResolutionOptions, event: GameEvent, draft: Character[], tags: GameEffectTag[]) {
  const hookImpactLines = _applyEpisodeHookBonus(options, event, draft);
  const draftEffect = SCreateEventDraftEffect(options.characters, _createFinaleBiasDraft(options, draft, tags), tags);
  const classPopularity = SCreateClassPopularityDeltas(options.classTrackState, draftEffect.popularity || {});
  const seasonEffect = _createEventSeasonEffect(event, tags);
  const assessment = _createAssessmentDeltas(options, classPopularity, seasonEffect, tags);
  const recording = _applyRecordingEffect(options, event, draftEffect, classPopularity, seasonEffect);
  SAddAssessmentScores(options.classTrackState, assessment.deltas);
  return { ...recording, ...assessment, hookImpactLines, seasonEffect };
}

function _applyRecordingEffect(options: UseRoundResolutionOptions, event: GameEvent, draftEffect: SGameEffect, popularity: Record<string, number>, season: Partial<SSeasonMetrics>) {
  const recordingCost = _getRecordingCost(event);
  const applied = options.applyEffect({ ...draftEffect, popularity, factions: SCreateEventFactionEffect(event, draftEffect.tags).factions, season, bond: _createSelectedPairBond(options), budgetDelta: -recordingCost });
  return { applied, recordingCost };
}

function _createAssessmentDeltas(options: UseRoundResolutionOptions, popularity: Record<string, number>, seasonEffect: Partial<SSeasonMetrics>, tags: GameEffectTag[]) {
  const finale = SCreateFinaleAssessmentDeltas(options.classTrackState, options.biasCharacterId.value, options.seasonState.biasPressure + (seasonEffect.biasPressure || 0), tags.includes('FINALE_AUDIT'));
  return { deltas: SMergeAssessmentDeltas(SCreateEventAssessmentDeltas(options.classTrackState, popularity), finale), finale };
}

function _showEventResolution(options: UseRoundResolutionOptions, result: string, choiceText: string, tags: GameEffectTag[], assessment: ReturnType<typeof _applyEventAssessment>) {
  const plan = _resolveProgramPlan(options, tags);
  const planResult = plan ? options.applyEffect(plan.effect) : null;
  const programBonus = _resolveProgramBonus(options);
  const message = _createEventMessage(result, assessment.applied.bondBonusText, plan?.message || '', programBonus.message);
  options.captureScenePair();
  options.showRoundResult(message, choiceText, [...assessment.applied.affectedIds, ...(planResult?.affectedIds || []), ...programBonus.affectedIds], tags, [..._getChoiceImpactLines(tags), ..._getAssessmentImpactLines(options, assessment.deltas, assessment.seasonEffect, assessment.finale, assessment.recordingCost), ...assessment.hookImpactLines, ...(plan ? [plan.impact] : [])]);
}

function _getChoiceImpactLines(tags: GameEffectTag[]): string[] {
  const hint = SGetNarrativeChoiceHint(tags);
  return hint ? [`路线结果：${hint}`] : [];
}

function _getProgramPlanTags(options: UseRoundResolutionOptions, tags: GameEffectTag[]): GameEffectTag[] {
  const plan = options.programPlan.value;
  const planTags = plan ? SGetCurrentProgramPlanTags(plan) : [];
  if (!plan || planTags.some(tag => tags.includes(tag))) return tags;
  return _shouldMatchProgramPlan(options, plan) ? [...tags, planTags[0]] : tags;
}

function _shouldMatchProgramPlan(options: UseRoundResolutionOptions, plan: SProgramPlan): boolean {
  const event = options.currentEvent.value;
  const pair = options.getSelectedPair();
  const rankingList = options.getRankingList();
  if (!event) return false;
  if (event.type === 'PICK_TWO') return plan.key === 'ENSEMBLE' || pair.some(character => plan.candidateIds.includes(character.id));
  return event.type === 'RANKING' && (plan.key === 'ENSEMBLE' || plan.candidateIds.includes(rankingList[0]?.id || ''));
}

function _resolveProgramPlan(options: UseRoundResolutionOptions, tags: GameEffectTag[]) {
  const plan = options.programPlan.value;
  if (!plan) return null;
  const effect = SRecordProgramPlanPart(plan, tags);
  if (!effect) return null;
  options.programPlan.value = null;
  return { effect, impact: plan.matches >= 2 ? `粉圈计划抵中，合作款 +${effect.budgetDelta?.toLocaleString()}` : '粉圈计划落空，广场质疑加重', message: SGetProgramPlanResolution(plan) };
}

function _applyEpisodeHookBonus(options: UseRoundResolutionOptions, event: GameEvent, draft: Character[]): string[] {
  const hook = options.nextEpisodeHook.value;
  if (!hook || hook.key === 'CLEAN' || event.type === 'CHOICE') return [];
  const selected = event.type === 'RANKING' ? options.getRankingList().slice(0, 2) : options.getSelectedPair();
  const selectedIds = selected.map(character => character.id);
  if (!_shouldRewardEpisodeHook(hook, selectedIds)) return [];
  draft.filter(character => hook.characterIds.includes(character.id)).forEach(character => character.popularity += 3);
  return ['粉盘候补接住机位：额外热度 +3'];
}

function _shouldRewardEpisodeHook(hook: SNextEpisodeHook, selectedIds: string[]): boolean {
  return hook.key === 'UNDERDOG' ? hook.characterIds.some(id => selectedIds.includes(id)) : hook.characterIds.every(id => selectedIds.includes(id));
}

function _createFinaleBiasDraft(options: UseRoundResolutionOptions, draft: Character[], tags: GameEffectTag[]): Character[] {
  if (!tags.includes('FINALE_AUDIT')) return draft;
  const bias = draft.find(character => character.id === options.biasCharacterId.value);
  if (bias) bias.popularity += 10;
  return draft;
}

function _createSelectedPairBond(options: UseRoundResolutionOptions): SGameEffect['bond'] | undefined {
  const event = options.currentEvent.value;
  const pair = options.getSelectedPair();
  if (!event || event.type !== 'PICK_TWO' || pair.length !== 2) return undefined;
  return { pairIds: [pair[0].id, pair[1].id], names: `${pair[0].name} x ${pair[1].name}`, delta: event.pairRole === 'TEAM' ? 10 : 18, grantPopularityBonus: event.pairRole !== 'TEAM' };
}

function _createEventSeasonEffect(event: GameEvent, tags: GameEffectTag[]): Partial<SSeasonMetrics> {
  const effect = SGetNarrativeTagEffect(tags);
  const heat = event.type === 'PICK_TWO' ? 4 : event.type === 'RANKING' ? 3 : 2;
  const reputation = tags.includes('ANTI_RISK') ? 4 : 1;
  return { ...effect, groupHeat: (effect.groupHeat || 0) + heat + (tags.includes('GROUP_BOOST') ? 3 : 0), producerReputation: (effect.producerReputation || 0) + reputation, anticipation: (effect.anticipation || 0) + (tags.includes('PUBLIC_BOOST') ? 2 : 0) };
}

function _resolveProgramBonus(options: UseRoundResolutionOptions) {
  const bonus = SGetProgramBonus(options.currentEventIndex.value, options.getRandomValue);
  if (!bonus) return { message: '', affectedIds: [] };
  const characters = cloneData(options.characters);
  const factions = { ...options.fanFactions };
  const summary = bonus.apply(characters, factions);
  const applied = options.applyEffect({ ...SCreateEventDraftEffect(options.characters, characters), factions: SCreateFactionDraftEffect(options.fanFactions, factions) });
  return { message: `节目组掉落「${bonus.name}」：${summary}`, affectedIds: applied.affectedIds };
}

function _createEventMessage(result: string, bondBonusText: string, planMessage: string, bonusMessage: string): string {
  return [result, bondBonusText, planMessage, bonusMessage].filter(Boolean).join(' ');
}

function _getAssessmentImpactLines(options: UseRoundResolutionOptions, deltas: Record<string, number>, seasonEffect: Partial<SSeasonMetrics>, finale: Record<string, number>, recordingCost: number): string[] {
  const biasDelta = deltas[options.biasCharacterId.value] || 0;
  const biasScore = options.classTrackState.assessmentScore[options.biasCharacterId.value] || 0;
  const lines = [`制作成本 -¥${recordingCost.toLocaleString()}`, `本命席位评分 ${_formatDelta(biasDelta)} -> ${biasScore} 分`];
  if (options.getSelectedPair().length === 2) lines.push(`搭档片段评分 ${_formatPairDelta(options, deltas)}`);
  if (seasonEffect.biasPressure) lines.push(`偏心压力 ${_formatDelta(seasonEffect.biasPressure)}`);
  if (finale[options.biasCharacterId.value]) lines.push(`收官席位赌局 ${_formatDelta(finale[options.biasCharacterId.value])}`);
  return lines.slice(0, 4);
}

function _getRecordingCost(event: GameEvent): number {
  return RECORDING_SCENE_COST[event.type];
}

function _formatPairDelta(options: UseRoundResolutionOptions, deltas: Record<string, number>): string {
  return _formatDelta(options.getSelectedPair().reduce((total, character) => total + (deltas[character.id] || 0), 0));
}

function _formatDelta(value: number): string {
  return `${value >= 0 ? '+' : ''}${value}`;
}
