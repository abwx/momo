import { computed, ref, type ComputedRef, type Ref } from 'vue';
import type { Character } from '../data/characters';
import type { Choice, GameEvent } from '../data/type/GameEvent';
import { SCreateProgramPlanChoice } from '../baseLib/serviceLib/SProgramPlan';
import { SGetFinaleAssessmentDelta } from '../baseLib/serviceLib/SClassTrack';
import { SGetNarrativeChoiceHint, SGetNarrativeTagEffect } from '../baseLib/serviceLib/SGameNarrative';
import type { SSeasonState } from '../baseLib/serviceLib/type/SSeasonState';
import type { SNextEpisodeHook } from '../baseLib/serviceLib/type/SNextEpisodeHook';
import type { SProgramPlan } from '../baseLib/serviceLib/type/SProgramPlan';

const EVENT_CANDIDATE_LIMIT = 5;

interface UseEventPresentationOptions {
  biasCharacterId: Ref<string>;
  currentEvent: ComputedRef<GameEvent | null>;
  episodeHook: ComputedRef<SNextEpisodeHook | null>;
  programPlan: Ref<SProgramPlan | null>;
  getRandomValue: () => number;
  seasonState: SSeasonState;
  sortedCharacters: ComputedRef<Character[]>;
  topCharacter: ComputedRef<Character>;
}

interface EventPresentationState {
  choiceOptions: Ref<Choice[]>;
  eventCandidates: ComputedRef<Character[]>;
  hookCandidateIds: ComputedRef<string[]>;
  processedDescription: Ref<string>;
  rankingList: Ref<Character[]>;
  selectedPair: Ref<Character[]>;
}

/** Owns event-card state without depending on the season flow or workspace actions. */
export function useEventPresentation(options: UseEventPresentationOptions) {
  const state = SCreateEventPresentationState(options);
  const prepareEventPresentation = () => SPrepareEventPresentation(options, state);
  const toggleSelection = (character: Character) => SToggleSelection(options.currentEvent.value, state.selectedPair, character);
  const updateRankingList = (characters: Character[]) => state.rankingList.value = characters;
  return { ...state, prepareEventPresentation, toggleSelection, updateRankingList };
}

function SCreateEventPresentationState(options: UseEventPresentationOptions): EventPresentationState {
  return { choiceOptions: ref([]), eventCandidates: computed(() => SCreateEventCandidates(options)), hookCandidateIds: computed(() => SGetPriorityCandidateIds(options)), processedDescription: ref(''), rankingList: ref([]), selectedPair: ref([]) };
}

function SCreateEventCandidates(options: UseEventPresentationOptions): Character[] {
  const ids = SGetEventCandidateIds(options);
  return options.sortedCharacters.value.filter(character => ids.has(character.id));
}

function SGetEventCandidateIds(options: UseEventPresentationOptions): Set<string> {
  const heatIds = options.sortedCharacters.value.slice(0, EVENT_CANDIDATE_LIMIT).map(character => character.id);
  const priorityIds = SGetPriorityCandidateIds(options).filter(id => !heatIds.includes(id)).slice(0, EVENT_CANDIDATE_LIMIT);
  const remainingIds = heatIds.filter(id => !priorityIds.includes(id)).slice(0, EVENT_CANDIDATE_LIMIT - priorityIds.length);
  return new Set([...remainingIds, ...priorityIds]);
}

function SGetPriorityCandidateIds(options: UseEventPresentationOptions): string[] {
  const hookIds = options.episodeHook.value?.characterIds || [];
  const planIds = options.programPlan.value?.candidateIds || [];
  return [...new Set([options.biasCharacterId.value, ...hookIds, ...planIds].filter(Boolean))];
}

function SPrepareEventPresentation(options: UseEventPresentationOptions, state: EventPresentationState) {
  state.selectedPair.value = [];
  if (SUsesRankingList(options.currentEvent.value)) state.rankingList.value = [...state.eventCandidates.value];
  SRefreshEventPresentation(options, state);
}

function SUsesRankingList(event: GameEvent | null): boolean {
  return event?.type === 'RANKING' || event?.type === 'PICK_TWO';
}

function SRefreshEventPresentation(options: UseEventPresentationOptions, state: EventPresentationState) {
  const event = options.currentEvent.value;
  if (!event) return SClearEventPresentation(state);
  state.processedDescription.value = SResolveDescription(options, event.description, state.eventCandidates.value);
  state.choiceOptions.value = event.type === 'CHOICE' ? SCreateChoiceOptions(options, event) : [];
}

function SClearEventPresentation(state: EventPresentationState) {
  state.choiceOptions.value = [];
  state.processedDescription.value = '';
}

function SResolveDescription(options: UseEventPresentationOptions, description: string, candidates: Character[]): string {
  if (!description.includes('${random_char}')) return description;
  const index = Math.floor(options.getRandomValue() * Math.max(candidates.length, 1));
  return description.replaceAll('${random_char}', (candidates[index] || options.topCharacter.value).name);
}

function SCreateChoiceOptions(options: UseEventPresentationOptions, event: Extract<GameEvent, { type: 'CHOICE' }>): Choice[] {
  const authoredChoices = typeof event.choices === 'function' ? event.choices(options.sortedCharacters.value) : event.choices;
  return [...authoredChoices, ...SCreateContextualChoices(options)].map(choice => SCreateChoicePreview(options, choice));
}

function SCreateContextualChoices(options: UseEventPresentationOptions): Choice[] {
  const planChoices = SCreatePlanChoices(options);
  return planChoices.length ? planChoices : SCreateHookChoices(options);
}

function SCreatePlanChoices(options: UseEventPresentationOptions): Choice[] {
  const plan = options.programPlan.value;
  return plan ? [SCreateProgramPlanChoice(plan, options.sortedCharacters.value)] : [];
}

function SCreateHookChoices(options: UseEventPresentationOptions): Choice[] {
  const hook = options.episodeHook.value;
  if (!hook || hook.key === 'CLEAN') return [];
  const pair = hook.characterIds.map(id => options.sortedCharacters.value.find(item => item.id === id)).filter(Boolean) as Character[];
  return hook.key === 'UNDERDOG' ? SCreateUnderdogHookChoice(pair[0]) : SCreateDuoHookChoice(pair);
}

function SCreateUnderdogHookChoice(character?: Character): Choice[] {
  if (!character) return [];
  return [{ text: `【兑现上期安利】让 ${character.name} 接住本期机位。`, effectTags: ['PUBLIC_BOOST', 'UNDERDOG_SPOTLIGHT'], action: characters => SApplyHookPopularity(characters, [character.id], 7, `${character.name} 接住了上期安利，路人开始追问下一段。`) }];
}

function SCreateDuoHookChoice(pair: Character[]): Choice[] {
  if (pair.length !== 2) return [];
  const names = pair.map(character => character.name).join(' × ');
  return [{ text: `【接住上一期热评】把 ${names} 的素材拍完整。`, effectTags: ['CP_SETTLE', 'PUBLIC_BOOST'], action: characters => SApplyHookPopularity(characters, pair.map(character => character.id), 4, `${names} 的互动被拍完整，热评不再只靠脑补。`) }];
}

function SApplyHookPopularity(characters: Character[], ids: string[], value: number, result: string): string {
  characters.filter(character => ids.includes(character.id)).forEach(character => character.popularity += value);
  return result;
}

function SCreateChoicePreview(options: UseEventPresentationOptions, choice: Choice): Choice {
  const preview = [choice.preview, SGetEffectPreview(choice), SGetFinalePreview(options, choice)].filter(Boolean).join(' · ');
  return preview ? { ...choice, preview } : choice;
}

function SGetEffectPreview(choice: Choice): string {
  const hint = SGetNarrativeChoiceHint(choice.effectTags);
  return hint ? `预计：${hint}` : '';
}

function SGetFinalePreview(options: UseEventPresentationOptions, choice: Choice): string {
  if (!choice.effectTags?.includes('FINALE_AUDIT')) return '';
  const pressure = options.seasonState.biasPressure + (SGetNarrativeTagEffect(choice.effectTags).biasPressure || 0);
  const delta = SGetFinaleAssessmentDelta(pressure);
  return `收官审查：偏心压力 ${pressure}，本命席位评分 ${SFormatDelta(delta)}`;
}

function SFormatDelta(value: number): string {
  return `${value >= 0 ? '+' : ''}${value}`;
}

function SToggleSelection(event: GameEvent | null, selectedPair: Ref<Character[]>, character: Character) {
  if (event?.type !== 'PICK_TWO') return;
  const index = selectedPair.value.findIndex(item => item.id === character.id);
  if (index > -1) return selectedPair.value.splice(index, 1);
  if (selectedPair.value.length < 2) selectedPair.value.push(character);
}
