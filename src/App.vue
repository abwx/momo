<script setup lang="ts">
import { ref, reactive, computed, nextTick, onUnmounted } from 'vue';
import { characters as initialCharacters } from './data/characters';
import { breakthroughOpeningEvent, groupShowEvents } from './data/groupShowEvents';
import { groupShowProgram } from './data/groupShowProgram';
import { qteScenarios } from './data/qteScenarios';
import { INITIAL_BUDGET } from './data/gameConfig';
import { SCreateProgramSeasonEvents, SGetProgramMainEventCount, SRandomizeStartingPopularity } from './baseLib/serviceLib/SSeasonSetup';
import { SCreateProgramBranchEvents } from './baseLib/serviceLib/SProgramBranch';
import VcHomeView from './components/app/VcHomeView.vue';
import VcProducerHub from './components/app/VcProducerHub.vue';
import VcChoiceEventPanel from './components/main/VcChoiceEventPanel.vue';
import VcEventStage from './components/main/VcEventStage.vue';
import VcFanWorkspace from './components/main/VcFanWorkspace.vue';
import VcPickTwoEventPanel from './components/main/VcPickTwoEventPanel.vue';
import VcPopularityDashboard from './components/main/VcPopularityDashboard.vue';
import VcQteOverlay from './components/main/VcQteOverlay.vue';
import VcRankingEventPanel from './components/main/VcRankingEventPanel.vue';
import VcRoundResolutionPanel from './components/main/VcRoundResolutionPanel.vue';
import VcRosterView from './components/main/VcRosterView.vue';
import VcSettlementView from './components/main/VcSettlementView.vue';
import VcStudioNav from './components/main/VcStudioNav.vue';
import VcResultModal from './components/main/VcResultModal.vue';
import VcToastHint from './components/main/VcToastHint.vue';
import VcTopControlBar from './components/main/VcTopControlBar.vue';
import VcTrendingManager from './components/main/VcTrendingManager.vue';
import { useAchievements } from './composables/useAchievements';
import { useCapitalIntervention } from './composables/useCapitalIntervention';
import { useEventPresentation } from './composables/useEventPresentation';
import { useGameFeedback } from './composables/useGameFeedback';
import { useGameSession } from './composables/useGameSession';
import { useProducerReport } from './composables/useProducerReport';
import { useProgramPlanSelection } from './composables/useProgramPlanSelection';
import { useQte } from './composables/useQte';
import { useRoundFeedback } from './composables/useRoundFeedback';
import { useRoundResolution } from './composables/useRoundResolution';
import { useSessionPhase } from './composables/useSessionPhase';
import { useSeasonProgression } from './composables/useSeasonProgression';
import { useSeasonSession } from './composables/useSeasonSession';
import { useStudioNavigation } from './composables/useStudioNavigation';
import { useStudioWorkspace } from './composables/useStudioWorkspace';
import { useTrending } from './composables/useTrending';
import type { Character } from './data/characters';
import type { Choice, GameEvent } from './data/type/GameEvent';
import type { GameAchievementResult } from './data/type/GameAchievement';
import type { RoundResolution } from './data/type/RoundResolution';
import type { QTEScenario } from './data/type/QTEScenario';
import type {
  EventHistoryItem,
} from './data/type/SettlementReport';
import type { StudioViewKey } from './data/type/StudioView';
import type { TrendingTopic, TrendingTopicAction } from './data/type/TrendingTopic';
import type { SBondPair } from './baseLib/serviceLib/type/SBondPair';
import type { SFanFactionState } from './baseLib/serviceLib/type/SFanFactionState';
import type { SGameEffect } from './baseLib/serviceLib/type/SGameEffect';
import type { SClassTrackState } from './baseLib/serviceLib/type/SClassTrack';
import type { SStrategicActionHistoryItem } from './baseLib/serviceLib/type/SStrategicActionHistory';
import type { SSeasonState } from './baseLib/serviceLib/type/SSeasonState';
import type { SNextEpisodeHook } from './baseLib/serviceLib/type/SNextEpisodeHook';
import type { SProgramPlan } from './baseLib/serviceLib/type/SProgramPlan';
import type { SNarrativeOutcome } from './baseLib/serviceLib/type/SNarrativeThread';
import type {
  SStudioLedger,
} from './baseLib/serviceLib/type/SStudioLedger';
import {
  S_INITIAL_FAN_FACTIONS,
  SGetTopBond,
} from './baseLib/serviceLib/SGameFeatures';
import {
  SApplyGameEffect,
  SCreateEventPopularityEffect,
} from './baseLib/serviceLib/SGameEffect';
import { SCreateSeasonScore } from './baseLib/serviceLib/SGameScore';
import {
  CAPITAL_BOOST_COST,
  CAPITAL_SUPPRESS_COST,
} from './baseLib/serviceLib/SCapitalIntervention';
import { SCreateClassTrackState, SGetAssessmentStanding, SIsBiasInClass1 } from './baseLib/serviceLib/SClassTrack';
import { SCreateSeasonRecap } from './baseLib/serviceLib/SSeasonRecap';
import { SShouldTriggerCrisis } from './baseLib/serviceLib/SCrisisManager';
import { SCreateSeasonState } from './baseLib/serviceLib/SSeasonState';
import { SCreateGameRandomState, SNextRandom, type SGameRandomState } from './baseLib/serviceLib/SGameRandom';
import { SGetNarrativeOutcomes, SGetProducerIdentity } from './baseLib/serviceLib/SGameNarrative';
import {
  SCreateStudioLedger,
} from './baseLib/serviceLib/SStudioLedger';
import { cloneData } from './utils/cloneData';
import { getRandomValue, setRandomSource, withRandomModifier } from './utils/random';
import { downloadSharePoster } from './utils/sharePoster';

// --- Reactive State ---
const { activeStudioPage, gameState, openEventWorkspace, openFanWorkspace, setGameState } = useGameSession();
const characters = reactive<Character[]>(
  cloneData(initialCharacters).sort((a: Character, b: Character) => a.name.localeCompare(b.name, 'zh-CN'))
);
const initialPopularityMap = reactive<Record<string, number>>({});
const eventHistory: EventHistoryItem[] = reactive([]);
const strategicActionHistory: SStrategicActionHistoryItem[] = reactive([]);
const gameEvents = ref<GameEvent[]>([]);
const currentEventIndex = ref(0);
const highlightedCharIds = ref<Set<string>>(new Set());
const isBreakingNews = ref(false);
const budget = ref(INITIAL_BUDGET);
const seasonState = reactive<SSeasonState>(SCreateSeasonState());
const classTrackState = reactive<SClassTrackState>(SCreateClassTrackState(characters));
const roundResolution = ref<RoundResolution | null>(null);
const randomState = reactive<SGameRandomState>(SCreateGameRandomState());
const fanFactions = reactive<SFanFactionState>({ ...S_INITIAL_FAN_FACTIONS });
const bondMap = reactive<Record<string, SBondPair>>({});
const isGeneratingPoster = ref(false);
const settlementReportId = ref(createReportId());
const studioLedger = reactive<SStudioLedger>(SCreateStudioLedger());
const lastScenePairIds = ref<[string, string] | null>(null);
const nextEpisodeHook = ref<SNextEpisodeHook | null>(null);
const programPlan = ref<SProgramPlan | null>(null);
const biasCharacterId = ref('');

const {
  clearFeedbackTimers,
  notifyToast,
  openDelayedNotice,
  openNoticeModal,
  resultModalMessage,
  resultModalMode,
  resultModalTitle,
  showResultModal,
  showToast,
  toastImpactLines,
  toastMessage,
  toastTitle,
} = useGameFeedback();

setRandomSource(() => SNextRandom(randomState));

const {
  qteActive,
  qteType,
  qteValue,
  qteTarget,
  qteResult,
  qteSuccessCount,
  currentQTEScenario,
  closeQteResult,
  getQteHint,
  startQTE,
  resetQte,
  handleTimingClick,
  handleMash,
  startHold,
  stopHold,
  clearQteTimers,
} = useQte({ scenarios: qteScenarios, onComplete: handleQteComplete });

const programBranchEvents = SCreateProgramBranchEvents(groupShowProgram);
const MAIN_EVENT_TOTAL = SGetProgramMainEventCount(groupShowProgram);

// --- Computed Properties ---
const currentEvent = computed(() => gameEvents.value[currentEventIndex.value] || null);
const mainEventIndex = computed(() => gameEvents.value
  .slice(0, currentEventIndex.value + 1)
  .filter(event => !event.id.startsWith('event-branch-')).length);
const isBranchEvent = computed(() => currentEvent.value?.id.startsWith('event-branch-') || false);

const currentProgramEpisode = computed(() => {
  const eventId = currentEvent.value?.id || '';
  return groupShowProgram.find(episode => episode.eventIds.includes(eventId) || episode.branchEventIds.includes(eventId)) || null;
});

const biasBreakthrough = computed(() => SIsBiasInClass1(classTrackState, biasCharacterId.value));
const finalClassLabel = computed(() => biasBreakthrough.value ? '一班' : '二班');
const biasAssessmentStanding = computed(() => SGetAssessmentStanding(classTrackState, biasCharacterId.value));
const biasAssessmentStatus = computed(() => {
  const standing = biasAssessmentStanding.value;
  const distance = standing.distanceToClass1;
  const projection = standing.rank <= classTrackState.capacityClass1
    ? `线内 +${distance} 分`
    : `线外 ${Math.abs(distance)} 分`;
  return `${finalClassLabel.value} · ${projection}`;
});

const heroCharacters = computed(() => sortedCharacters.value);

function createReportId() {
  return Math.floor(getRandomValue() * 36 ** 9).toString(36).padStart(9, '0').toUpperCase();
}

function openFinalClassConfirmation(episodeId: string) {
  const result = classTrackState.episodeResults.find(item => item.episodeId === episodeId);
  if (!result) return finishSeason();
  resultModalMode.value = 'final';
  resultModalTitle.value = '最终席位确认';
  resultModalMessage.value = `${getClassResultMessage(result)} 赛季结算即将生成。`;
  showResultModal.value = true;
}

function restartToRoster() {
  setGameState('hub');
}

function resetCharactersForNewSeason() {
  const next = SRandomizeStartingPopularity(
    cloneData(initialCharacters).sort((a: Character, b: Character) => a.name.localeCompare(b.name, 'zh-CN'))
  );
  characters.splice(0, characters.length, ...next);
}

function enterRoster() {
  resetCharactersForNewSeason();
  setGameState('roster');
  resetPageScroll();
}

function adjustStartingPopularity(characterId: string, delta: number) {
  const character = characters.find((item) => item.id === characterId);
  if (!character) return;
  character.popularity = Math.min(95, Math.max(50, character.popularity + delta));
}

const sortedCharacters = computed(() => {
  return [...characters].sort((a, b) => b.popularity - a.popularity);
});

const topCharacter = computed(() => sortedCharacters.value[0]!);

const bottomCharacter = computed(() => sortedCharacters.value[sortedCharacters.value.length - 1]!);

const topBond = computed(() => SGetTopBond(bondMap));

const biasCharacter = computed(() => {
  return characters.find(char => char.id === biasCharacterId.value) || topCharacter.value;
});

const hasNegativeTrending = computed(() => trendingQueue.value.some(topic => topic.type === 'NEGATIVE'));

const crisisContext = computed(() => ({
  antiFans: fanFactions.antiFans,
  biasPressure: seasonState.biasPressure,
  cpHeat: seasonState.cpHeat,
  crisisCount: seasonState.crisisCount,
  dramaDebt: seasonState.dramaDebt,
  eventIndex: currentEventIndex.value,
  hasNegativeTrending: hasNegativeTrending.value,
  lastCrisisEventIndex: seasonState.lastCrisisEventIndex,
  popularityGap: topCharacter.value.popularity - bottomCharacter.value.popularity,
}));

const {
  fanPulse,
  fanWatchItems,
  isProgramPlanPrompt,
  latestFactionDeltas,
  nextStudioTask,
  programPlanOptions,
} = useStudioWorkspace({
  biasCharacter,
  characters,
  currentEventIndex,
  eventHistory,
  fanFactions,
  hasNegativeTrending,
  lastScenePairIds,
  programPlan,
  seasonState,
});

const { canIntervene, canResolveEvent, canRunTimedWork } = useSessionPhase({
  activeStudioPage,
  isProgramPlanPrompt,
  qteActive,
  qteResult,
  roundResolution,
  showResultModal,
});

const {
  trendingQueue,
  isAnyTrending,
  generateTrendingTopic,
  getTrendingTopic,
  removeTrendingTopic,
  clearTrendingTopics,
  clearTrendingTimers,
} = useTrending({
  canGenerateTopics: () => gameState.value === 'event',
  getRandomName: getRandomCharacterName,
  onExpire: handleTrendingExpired,
  shouldRunTimer: () => canRunTimedWork.value,
});

const {
  closePopularityDashboard,
  setActiveStudioPage,
  showPopularityDashboard,
  togglePopularityDashboard,
} = useStudioNavigation({
  activeStudioPage,
  canOpenDashboard: () => canIntervene.value,
  isPlanPrompt: () => isProgramPlanPrompt.value,
  onBlocked: showStudioFeedback,
  onNavigate: resetPageScroll,
});

const activeEpisodeHook = computed(() => nextEpisodeHook.value?.targetEventIndex === currentEventIndex.value
  ? nextEpisodeHook.value
  : null);

const activeEpisodeHookMessage = computed(() => getEpisodeHookMessage(activeEpisodeHook.value));

const selectedPairBond = computed(() => {
  if (selectedPair.value.length !== 2) return null;
  const [char1, char2] = selectedPair.value;
  return bondMap[[char1.id, char2.id].sort().join('__')] || null;
});

const averagePopularity = computed(() => {
  return Math.round(characters.reduce((sum, char) => sum + char.popularity, 0) / characters.length);
});

const seasonScore = computed(() => {
  return SCreateSeasonScore(characters, fanFactions, seasonState, budget.value);
});

const producerIdentity = computed(() => SGetProducerIdentity(seasonState));

const narrativeOutcomes = computed<SNarrativeOutcome[]>(() => {
  return SGetNarrativeOutcomes(seasonState, eventHistory, topBond.value, getLowRankGrowth());
});

const seasonRecap = computed(() => SCreateSeasonRecap({
  eventHistory,
  fanFactions,
  narrativeOutcomes: narrativeOutcomes.value,
  seasonState,
}));

const {
  choiceOptions,
  hookCandidateIds,
  prepareEventPresentation,
  processedDescription,
  rankingList,
  selectedPair,
  toggleSelection,
  updateRankingList,
} = useEventPresentation({
  biasCharacterId,
  currentEvent,
  episodeHook: activeEpisodeHook,
  programPlan,
  getRandomValue,
  seasonState,
  sortedCharacters,
  topCharacter,
});

const {
  prepareEvent,
  prepareNextEvent,
  startSeason,
} = useSeasonSession({
  activeEpisodeHook,
  activeStudioPage,
  biasCharacterId,
  bondMap,
  budget,
  characters,
  classTrackState,
  createReportId,
  createSeasonEvents: () => SCreateProgramSeasonEvents(breakthroughOpeningEvent, groupShowEvents, groupShowProgram),
  currentEventIndex,
  eventHistory,
  gameEvents,
  generateTrendingTopic,
  getDefaultBiasId: () => topCharacter.value?.id || '',
  getRandomValue,
  initialPopularityMap,
  isBreakingNews,
  lastScenePairIds,
  nextEpisodeHook,
  onOpenProgramPlan: openProgramPlanPrompt,
  onPrepareEventPresentation: prepareEventPresentation,
  onResetFanPulse: resetFanPulseForEvent,
  onResetPageScroll: resetPageScroll,
  onResetPresentation: resetSeasonPresentation,
  onResetQte: resetQte,
  onResetRoundResolution: () => roundResolution.value = null,
  onStartQte: startQTE,
  programPlan,
  qteSuccessCount,
  randomState,
  seasonState,
  setGameState,
  settlementReportId,
  shouldOpenProgramPlan,
  shouldTriggerCrisis: () => SShouldTriggerCrisis(crisisContext.value, getRandomValue),
  studioLedger,
  fanFactions,
});

const { nextEvent } = useSeasonProgression({
  biasCharacterId,
  branchEvents: programBranchEvents,
  characters,
  classTrackState,
  currentEventIndex,
  eventHistory,
  gameEvents,
  onFinishSeason: finishSeason,
  onOpenFinalClassConfirmation: openFinalClassConfirmation,
  onPrepareNextEvent: prepareNextEvent,
  onShowClassResult: showClassResult,
  program: groupShowProgram,
  seasonState,
});

const achievementContext = computed(() => {
  return {
    averagePopularity: averagePopularity.value,
    topBondValue: topBond.value?.value || 0,
    qteSuccessCount: qteSuccessCount.value,
    budget: budget.value,
    completedEpisodeCount: getCompletedEpisodeCount(),
    isSeasonComplete: gameState.value === 'end',
  };
});

const { celebrateNewAchievements, queueAchievementCelebration, resetAchievements, showQueuedAchievementCelebration } = useAchievements({
  context: achievementContext,
  onCelebrate: showAchievementCelebration,
});

const { continueRound, triggerFeedback } = useRoundFeedback({
  activeStudioPage,
  celebrateNewAchievements,
  characters,
  closePopularityDashboard,
  currentEvent,
  eventHistory,
  getActiveEpisodeHook: () => Boolean(activeEpisodeHook.value),
  getSelectedPair: () => selectedPair.value,
  highlightedCharIds,
  nextEvent,
  nextEpisodeHook,
  onResetPageScroll: resetPageScroll,
  roundResolution,
});

function getLowRankGrowth() {
  return Math.max(...characters.map(char => getCharacterGrowth(char)));
}

function getCharacterGrowth(char: Character) {
  return char.popularity - (initialPopularityMap[char.id] || char.popularity);
}

function getCompletedEpisodeCount() {
  return classTrackState.episodeResults.length;
}

function applySimulationEffect(effect: SGameEffect) {
  const result = SApplyGameEffect({ characters, factions: fanFactions, season: seasonState, bondMap, budget: budget.value }, effect);
  budget.value = result.budget;
  return result;
}

const { capitalInterventionAvailable, capitalOutcomes, handleCapitalIntervention, resetCapitalIntervention } = useCapitalIntervention({
  applyEffect: applySimulationEffect,
  biasCharacterId,
  budget,
  canIntervene: () => canIntervene.value,
  characters,
  classTrackState,
  currentEventIndex,
  onFeedback: showStudioFeedback,
  onRecord: action => strategicActionHistory.push(action),
});

const { selectProgramPlan } = useProgramPlanSelection({
  applyEffect: applySimulationEffect,
  biasCharacterId,
  budget,
  characters,
  currentEventIndex,
  gameEvents,
  isPlanPrompt: () => isProgramPlanPrompt.value,
  lastScenePairIds,
  onBlocked: message => showStudioFeedback(message),
  onSelected: startSelectedProgramPlan,
  programPlan,
  seasonState,
});

function createPopularityEffect(targets: Character[], value: number): Record<string, number> {
  return Object.fromEntries(targets.map(character => [character.id, value]));
}

const { applyEventResult } = useRoundResolution({
  applyEffect: applySimulationEffect,
  biasCharacterId,
  captureScenePair,
  characters,
  classTrackState,
  currentEvent,
  currentEventIndex,
  fanFactions,
  getRandomValue,
  getRankingList: () => rankingList.value,
  getSelectedPair: () => selectedPair.value,
  nextEpisodeHook: activeEpisodeHook,
  programPlan,
  seasonState,
  showRoundResult: triggerFeedback,
});

// --- Hot Search Logic ---
function getRandomCharacterName() {
  return characters[Math.floor(getRandomValue() * characters.length)].name;
}

function handleTrendingExpired(topic: TrendingTopic) {
  const char = characters.find(character => character.name === topic.name);
  if (char) applySimulationEffect({ popularity: { [char.id]: -8 }, factions: { antiFans: 3 }, season: { producerReputation: -4 } });
  showStudioFeedback(`舆论失控，${topic.name} 的负面话题已扩散。`);
}

function handleTrending(topicId: string, action: TrendingTopicAction) {
  const topic = getTrendingTopic(topicId);
  if (!topic) return;

  if (budget.value < topic.cost) {
    notifyToast(`经费紧，压这条热搜还差 ¥${topic.cost.toLocaleString()}`);
    return;
  }
  applySimulationEffect({ budgetDelta: -topic.cost });
  const char = characters.find(c => c.name === topic.name);
  
  if (char) {
    if (action === 'BUY' && topic.type === 'POSITIVE') {
      applySimulationEffect({ ...SCreateEventPopularityEffect(characters, { [char.id]: 15 }), season: { groupHeat: 5, anticipation: 3 } });
      showStudioFeedback(`${char.name} 喜提热搜高位。`);
    } else if (action === 'KILL' && topic.type === 'NEGATIVE') {
      applySimulationEffect({ ...SCreateEventPopularityEffect(characters, { [char.id]: 5 }), factions: { antiFans: -5 }, season: { producerReputation: 2 } });
      showStudioFeedback(`经费砸到位，${char.name} 的黑词被压下去了。`);
    }
  }

  removeTrendingTopic(topicId);
}

function handleIgnoreTrending(topicId: string) {
  const topic = getTrendingTopic(topicId);
  if (topic?.type === 'NEGATIVE') handleTrendingExpired(topic);
  removeTrendingTopic(topicId);
}

function getEpisodeHookMessage(hook: SNextEpisodeHook | null): string {
  if (!hook) return '';
  if (hook.key === 'CLEAN') return '下期舆情已压住，不会触发突发危机。';
  const names = hook.characterIds.map(id => characters.find(character => character.id === id)?.name).filter(Boolean);
  return hook.key === 'DUO' ? `${names.join(' × ')} 会留在下期候补机位。` : `${names[0] || '低位成员'} 已进入下期候补机位。`;
}

function showStudioFeedback(message: string, impactLines: string[] = []) {
  notifyToast(message, 2800, '操盘回响', impactLines);
}

// --- Game Flow Methods ---
function resetPageScroll() {
  nextTick(() => window.scrollTo({ top: 0, behavior: 'auto' }));
}

function handleQteComplete(success: boolean, scenario: QTEScenario) {
  if (success) {
    const bonus = scenario.type === 'TIMING' ? 8 : 5;
    applySimulationEffect({ ...SCreateEventPopularityEffect(characters, createPopularityEffect(characters, bonus)), factions: { groupFans: 5, publicFans: 4 }, season: { producerReputation: 5, groupHeat: 4 } });
    queueAchievementCelebration();
  } else {
    const penalty = 3;
    applySimulationEffect({ popularity: createPopularityEffect(characters, -penalty), factions: { antiFans: 6 }, season: { producerReputation: -5, dramaDebt: 2 } });
  }
}

function shouldOpenProgramPlan(): boolean {
  return !programPlan.value && eventHistory.length > 0 && eventHistory.length % 3 === 0
    && gameEvents.value.length - currentEventIndex.value >= 2;
}

function openProgramPlanPrompt(): void {
  seasonState.programPlanPromptIndex = currentEventIndex.value;
  resetFanPulseForEvent();
  openFanWorkspace();
  setGameState('event');
}

function finishSeason() {
  setGameState('end');
  clearTrendingTopics();
  celebrateNewAchievements();
}

function showClassResult(episodeId: string) {
  const result = classTrackState.episodeResults.find(item => item.episodeId === episodeId);
  if (!result) return;
  openNoticeModal(getClassResultMessage(result), '班级热报');
}

function getClassResultMessage(result: SClassTrackState['episodeResults'][number]): string {
  return `本期试录结束，席位重新安排。升班：${getCharacterNames(result.promotedIds)}。降班：${getCharacterNames(result.demotedIds)}。本命目前在${result.biasClass === 'CLASS1' ? '一班' : '二班'}。`;
}

function getCharacterNames(ids: string[]): string {
  const names = ids.map(id => characters.find(character => character.id === id)?.name).filter(Boolean);
  return names.length ? names.join('、') : '本期无变动';
}

function startGame(selectedBiasId = '') {
  resetAchievements();
  strategicActionHistory.length = 0;
  resetCapitalIntervention();
  startSeason(selectedBiasId);
}

function showAchievementCelebration(achievements: GameAchievementResult[]): void {
  if (!achievements.length) return;
  openDelayedNotice(getAchievementMessage(achievements), '成就解锁', 260);
}

function getAchievementMessage(achievements: GameAchievementResult[]): string {
  const content = achievements.map(item => `【${item.title}】${item.desc}`).join('\n');
  return `本季已解锁 ${achievements.length} 项成就。\n${content}`;
}

function closeQteResultAndCelebrate(): void {
  closeQteResult();
  showQueuedAchievementCelebration();
}

function confirmResultModal() {
  const mode = resultModalMode.value;
  showResultModal.value = false;
  if (mode === 'final') {
    finishSeason();
    resetPageScroll();
    return;
  }
}

function selectChoice(choice: Choice) {
  if (!canResolveEvent.value) return;
  const draft = cloneData(characters);
  const result = withRandomModifier(0, () => choice.action(draft));
  applyEventResult(`【本轮出片】${result}`, draft, choice.effectTags || [], choice.text);
}

onUnmounted(() => {
  clearFeedbackTimers();
  clearQteTimers();
  clearTrendingTimers();
});

function handlePickTwo() {
  if (!canResolveEvent.value) return;
  const event = currentEvent.value;
  if (!event || event.type !== 'PICK_TWO') return;
  if (selectedPair.value.length !== 2) return;
  const draft = cloneData(characters);
  const [first, second] = selectedPair.value.map(character => draft.find(item => item.id === character.id)!);
  const result = withRandomModifier(0, () => event.choices.action(first, second, draft));
  applyEventResult(`【本轮出片】${result}`, draft, [], getPairChoiceText(event));
}

function getPairChoiceText(event: Extract<GameEvent, { type: 'PICK_TWO' }>): string {
  const label = event.pairRole === 'TEAM' ? '本镜执行组' : '舞台搭档';
  return `${label}：${selectedPair.value.map(character => character.name).join(' × ')}`;
}

function handleRanking() {
  if (!canResolveEvent.value) return;
  const event = currentEvent.value;
  if (!event || event.type !== 'RANKING') return;
  const draft = rankingList.value.map(character => cloneData(character));
  const result = withRandomModifier(0, () => event.choices.action(draft));
  applyEventResult(`【本轮出片】${result}`, draft, [], `镜头顺位：${rankingList.value.map(character => character.name).join(' / ')}`);
}

function startSelectedProgramPlan(): void {
  openEventWorkspace();
  prepareEvent();
}

function skipProgramPlan(): void {
  seasonState.programPlanPromptIndex = 0;
  openEventWorkspace();
  prepareEvent();
}

function resetFanPulseForEvent() {
  if (seasonState.fanPulseEventIndex === currentEventIndex.value) return;
  seasonState.fanPulseEventIndex = currentEventIndex.value;
  seasonState.fanPulseStep = 0;
}

function resetSeasonPresentation(): void {
  highlightedCharIds.value = new Set();
  closePopularityDashboard();
}

function captureScenePair() {
  if (selectedPair.value.length !== 2) return;
  lastScenePairIds.value = [selectedPair.value[0].id, selectedPair.value[1].id];
}


function handleSharePoster() {
  isGeneratingPoster.value = true;
  downloadSharePoster({
    title: producerTitle.value.name,
    grade: producerTitle.value.grade,
    topCharacters: sortedCharacters.value,
    factions: fanFactions,
    recap: seasonRecap.value,
    topBond: topBond.value,
    biasName: biasCharacter.value.name,
    biasBreakthrough: biasBreakthrough.value,
    finalClassLabel: finalClassLabel.value,
  });
  setTimeout(() => isGeneratingPoster.value = false, 400);
}

const { producerTitle } = useProducerReport({
  averagePopularity,
  seasonScore,
  topCharacter,
  bottomCharacter,
});

</script>

<template>
  <div class="container">
    <VcHomeView
      v-if="gameState === 'home'"
      :hero-characters="heroCharacters"
      @enter-roster="setGameState('hub')"
    />

    <VcProducerHub
      v-if="gameState === 'hub'"
      :character-count="characters.length"
      :average-popularity="averagePopularity"
      @enter-roster="enterRoster"
      @back-home="setGameState('home')"
    />

    <VcRosterView
      v-if="gameState === 'roster'"
      :characters="characters"
      :average-popularity="averagePopularity"
      @start-game="startGame"
      @adjust-popularity="adjustStartingPopularity"
    />

    <div v-if="gameState === 'event' && currentEvent" class="game-view">
      <VcQteOverlay
        :active="qteActive"
        :scenario="currentQTEScenario"
        :qte-type="qteType"
        :qte-value="qteValue"
        :qte-target="qteTarget"
        :qte-result="qteResult"
        :hint="getQteHint()"
        @mash="handleMash"
        @timing-click="handleTimingClick"
        @hold-start="startHold"
        @hold-stop="stopHold"
        @close-result="closeQteResultAndCelebrate"
      />

      <VcTopControlBar
        :main-event-index="mainEventIndex"
        :main-event-total="MAIN_EVENT_TOTAL"
        :is-branch-event="isBranchEvent"
        :bias-assessment-score="biasAssessmentStanding.score"
        :bias-assessment-status="biasAssessmentStatus"
        :budget="budget"
        :bias-character="biasCharacter"
        :dashboard-open="showPopularityDashboard"
        :has-trending="isAnyTrending"
        @toggle-dashboard="togglePopularityDashboard"
      />

      <VcStudioNav
        :active-studio-page="activeStudioPage"
        :locked-page="isProgramPlanPrompt ? 'fans' : null"
        :locked-message="isProgramPlanPrompt ? nextStudioTask : ''"
        @change-page="setActiveStudioPage"
      />

      <VcTrendingManager
        :topics="trendingQueue"
        :budget="budget"
        @ignore-topic="handleIgnoreTrending"
        @handle-topic="handleTrending"
      />

      <div class="event-layout">
        <VcPopularityDashboard
          :show="showPopularityDashboard"
          :sorted-characters="sortedCharacters"
          :highlighted-char-ids="highlightedCharIds"
          :trending-queue="trendingQueue"
          :budget="budget"
          :capital-boost-cost="CAPITAL_BOOST_COST"
          :capital-suppress-cost="CAPITAL_SUPPRESS_COST"
          :capital-intervention-phase="canIntervene"
          :capital-intervention-available="capitalInterventionAvailable"
          :capital-outcomes="capitalOutcomes"
          :bias-character-id="biasCharacterId"
          :bias-assessment-status="biasAssessmentStatus"
          @close="closePopularityDashboard"
          @capital-intervention="handleCapitalIntervention"
        />

        <VcFanWorkspace
          v-if="activeStudioPage === 'fans'"
          :fan-factions="fanFactions"
          :pulse="fanPulse"
          :is-plan-prompt="isProgramPlanPrompt"
          :plan="programPlan"
          :plan-options="programPlanOptions"
          :watch-items="fanWatchItems"
          :faction-deltas="latestFactionDeltas"
          :next-studio-task="nextStudioTask"
          :budget="budget"
          @select-plan="selectProgramPlan"
          @skip-plan="skipProgramPlan"
        />

        <VcEventStage
          v-if="activeStudioPage === 'event'"
          :is-breaking-news="isBreakingNews"
          :hook-message="activeEpisodeHookMessage"
          :plan-title="programPlan?.title"
          :plan-progress="programPlan ? `${programPlan.partsDone}/${programPlan.targetParts} · 命中 ${programPlan.matches}/2` : ''"
          :title="currentEvent.title"
          :description="processedDescription"
          :episode-title="currentProgramEpisode?.title || '开录日: 主题曲定位'"
        >
            <VcRoundResolutionPanel
              v-if="roundResolution"
              :resolution="roundResolution"
              @continue="continueRound"
            />

            <VcChoiceEventPanel
              v-else-if="currentEvent.type === 'CHOICE'"
              :choices="choiceOptions"
              @select-choice="selectChoice"
            />

            <VcPickTwoEventPanel
              v-else-if="currentEvent.type === 'PICK_TWO'"
              :candidates="rankingList"
              :hook-candidate-ids="hookCandidateIds"
              :selected-pair="selectedPair"
              :selected-pair-bond-value="selectedPairBond?.value || 0"
              :pair-role="currentEvent.pairRole"
              @toggle-selection="toggleSelection"
              @submit="handlePickTwo"
            />

            <VcRankingEventPanel
              v-else-if="currentEvent.type === 'RANKING'"
              :ranking-list="rankingList"
              :hook-candidate-ids="hookCandidateIds"
              @update:ranking-list="updateRankingList"
              @submit="handleRanking"
            />
        </VcEventStage>
      </div>
    </div>

    <VcResultModal
      :show="showResultModal"
      :message="resultModalMessage"
      :title="resultModalTitle"
      @confirm="confirmResultModal"
    />

    <VcToastHint
      :show="showToast"
      :message="toastMessage"
      :title="toastTitle"
      :impact-lines="toastImpactLines"
    />

    <VcSettlementView
      v-if="gameState === 'end'"
      :producer-title="producerTitle"
      :is-generating-poster="isGeneratingPoster"
      :producer-identity="producerIdentity"
      :season-recap="seasonRecap"
      :strategic-action-history="strategicActionHistory"
      :bias-name="biasCharacter.name"
      :bias-breakthrough="biasBreakthrough"
      :final-class-label="finalClassLabel"
      @share-poster="handleSharePoster"
      @restart="restartToRoster"
    />

  </div>
</template>
