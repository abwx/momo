<script setup lang="ts">
import { ref, reactive, computed, nextTick, onMounted, onUnmounted, watch } from 'vue';
import { characters as initialCharacters } from './data/characters';
import { eventPool } from './data/events';
import { breakthroughOpeningEvent, groupShowEvents } from './data/groupShowEvents';
import { groupShowProgram } from './data/groupShowProgram';
import { followUpEvents } from './data/followUpEvents';
import { qteScenarios } from './data/qteScenarios';
import {
  BOND_PROJECT_BASE_COST,
  FAN_PROGRAM_BASE_COST,
  INITIAL_BUDGET,
  MAX_OPERATION_LEVEL,
  RECORDING_INTENSITY_COST,
} from './data/gameConfig';
import { SCreateProgramSeasonEvents, SJitterStartingPopularity } from './baseLib/serviceLib/SSeasonSetup';
import { SCreateProgramBranchEvents, SGetEpisodeBranchEvent } from './baseLib/serviceLib/SProgramBranch';
import VcHomeView from './components/app/VcHomeView.vue';
import VcProducerHub from './components/app/VcProducerHub.vue';
import VcBondWorkspace from './components/main/VcBondWorkspace.vue';
import VcChoiceEventPanel from './components/main/VcChoiceEventPanel.vue';
import VcDanmakuLayer from './components/main/VcDanmakuLayer.vue';
import VcEventStage from './components/main/VcEventStage.vue';
import VcFanWorkspace from './components/main/VcFanWorkspace.vue';
import VcGameGoalsPanel from './components/main/VcGameGoalsPanel.vue';
import VcLiveCockpit from './components/main/VcLiveCockpit.vue';
import VcPickTwoEventPanel from './components/main/VcPickTwoEventPanel.vue';
import VcPopularityDashboard from './components/main/VcPopularityDashboard.vue';
import VcQteOverlay from './components/main/VcQteOverlay.vue';
import VcRankingEventPanel from './components/main/VcRankingEventPanel.vue';
import VcReportWorkspace from './components/main/VcReportWorkspace.vue';
import VcRosterView from './components/main/VcRosterView.vue';
import VcSettlementView from './components/main/VcSettlementView.vue';
import VcStudioNav from './components/main/VcStudioNav.vue';
import VcResultModal from './components/main/VcResultModal.vue';
import VcToastHint from './components/main/VcToastHint.vue';
import VcTopControlBar from './components/main/VcTopControlBar.vue';
import VcTrendingManager from './components/main/VcTrendingManager.vue';
import { useDanmaku } from './composables/useDanmaku';
import { useGamePersistence } from './composables/useGamePersistence';
import { useGameSaveState } from './composables/useGameSaveState';
import { useProducerReport } from './composables/useProducerReport';
import { useQte } from './composables/useQte';
import { useStudioOperations } from './composables/useStudioOperations';
import { useTrending } from './composables/useTrending';
import type { Character } from './data/characters';
import type { Choice, GameEffectTag, GameEvent } from './data/events';
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
import type { SSeasonState } from './baseLib/serviceLib/type/SSeasonState';
import type { SEpisodeResourceCost, SEpisodeResources } from './baseLib/serviceLib/type/SEpisodeResources';
import type { SNarrativeOutcome, SNarrativeThread } from './baseLib/serviceLib/type/SNarrativeThread';
import type {
  SBondProjectKey,
  SFanProgramKey,
  SRecordingModeKey,
  SReportActionKey,
  SStudioLedger,
} from './baseLib/serviceLib/type/SStudioLedger';
import {
  SGetFanFactionSummary,
  SGetPairKey,
  SGetProgramBonus,
  SGetTopBond,
  SResetFanFactions,
} from './baseLib/serviceLib/SGameFeatures';
import {
  SApplyGameEffect,
  SCreateEventDraftEffect,
  SCreateEventFactionEffect,
  SCreateEventPopularityEffect,
  SCreateFactionDraftEffect,
} from './baseLib/serviceLib/SGameEffect';
import { SCreateSeasonScore } from './baseLib/serviceLib/SGameScore';
import { SAddAssessmentScores, SApplyEpisodeAssessment, SCreateBiasAssessmentDeltas, SCreateClassPopularityDeltas, SCreateClassTrackState, SCreateEventAssessmentDeltas, SCreateFinaleAssessmentDeltas, SCreatePairAssessmentDeltas, SCreateRecordingAssessmentDeltas, SGetAssessmentStanding, SGetClassRoster, SGetEpisodeAwaitingBranch, SGetFinaleAssessmentDelta, SGetJustCompletedEpisode, SIsBiasInClass1, SMergeAssessmentDeltas, SResetClassTrackState, SReshuffleClasses } from './baseLib/serviceLib/SClassTrack';
import { SCreateSeasonRecap } from './baseLib/serviceLib/SSeasonRecap';
import { SGetFanMomentumModifier } from './baseLib/serviceLib/SFanMomentum';
import { SGetReportAvailability, SShouldTriggerCrisis } from './baseLib/serviceLib/SCrisisManager';
import { SCreateSeasonState, SResetSeasonState } from './baseLib/serviceLib/SSeasonState';
import { SCreateGameRandomState, SNextRandom, type SGameRandomState } from './baseLib/serviceLib/SGameRandom';
import { SCanSpendEpisodeResources, SCreateEpisodeResources, SGetResourceCostText, SResetEpisodeResources, SSpendEpisodeResources } from './baseLib/serviceLib/SGameResources';
import { SGetNarrativeOutcomes, SGetNarrativeResolutionEffect, SGetNarrativeTagEffect, SGetNarrativeThreads, SGetProducerIdentity } from './baseLib/serviceLib/SGameNarrative';
import {
  SCreateGameGoalIds,
  SGetCompletedGameGoalCount,
  SGetGameGoalResults,
} from './baseLib/serviceLib/SGameGoals';
import { SGetClaimableGoalReward } from './baseLib/serviceLib/SGameGoalRewards';
import {
  SGetGameAchievementResults,
  SGetNewAchievementIds,
  SGetTotalAchievementCount,
} from './baseLib/serviceLib/SGameAchievements';
import {
  SCreateStudioLedger,
  SGetStudioClosure,
  SResetStudioLedger,
} from './baseLib/serviceLib/SStudioLedger';
import { readAchievementIds, writeAchievementIds } from './utils/achievementSave';
import { cloneData } from './utils/cloneData';
import { getRandomValue, setRandomSource, shuffleList, withRandomModifier } from './utils/random';
import { downloadSharePoster } from './utils/sharePoster';

// --- Reactive State ---
type GameState = 'home' | 'hub' | 'roster' | 'event' | 'end';
const gameState = ref<GameState>('home');
const characters = reactive<Character[]>(
  cloneData(initialCharacters).sort((a: Character, b: Character) => a.name.localeCompare(b.name, 'zh-CN'))
);
const initialPopularityMap = reactive<Record<string, number>>({});
const eventHistory: EventHistoryItem[] = reactive([]);
const gameEvents = ref<GameEvent[]>([]);
const currentEventIndex = ref(0);
const showResultModal = ref(false);
const resultModalMessage = ref('');
const resultModalTitle = ref('粉圈热报');
const resultModalMode = ref<'notice' | 'final'>('notice');
const showToast = ref(false);
const toastMessage = ref('');
const toastTitle = ref('粉圈热报');
const toastImpactLines = ref<string[]>([]);
const activeStudioPage = ref<StudioViewKey>('event');
const activeGoalIds = ref<string[]>([]);
const completedGoalIds = ref<Set<string>>(new Set());
const claimedGoalIds = ref<Set<string>>(new Set());
const unlockedAchievementIds = ref<Set<string>>(new Set());
const highlightedCharIds = ref<Set<string>>(new Set());
const isBreakingNews = ref(false);
const budget = ref(INITIAL_BUDGET);
const seasonState = reactive<SSeasonState>(SCreateSeasonState());
const classTrackState = reactive<SClassTrackState>(SCreateClassTrackState(characters));
const episodeResources = reactive<SEpisodeResources>(SCreateEpisodeResources());
const randomState = reactive<SGameRandomState>(SCreateGameRandomState());
const showDanmaku = ref(true);
const reduceMotion = ref(false);
const fanFactions = reactive<SFanFactionState>({
  groupFans: 62,
  soloFans: 48,
  cpFans: 36,
  publicFans: 52,
  antiFans: 24,
});
const bondMap = reactive<Record<string, SBondPair>>({});
const isGeneratingPoster = ref(false);
const settlementReportId = ref(createReportId());
const studioLedger = reactive<SStudioLedger>(SCreateStudioLedger());
const selectedBondIds = ref<string[]>([]);
const recordingMode = ref<SRecordingModeKey>('BALANCE');
const focusCharacterId = ref('');
const biasCharacterId = ref('');
const executionIntensity = ref(2);
const fanOperationIntensity = ref(2);
const bondProjectIntensity = ref(2);
let toastTimer: number | null = null;

setRandomSource(() => SNextRandom(randomState));

const {
  trendingQueue,
  isAnyTrending,
  generateTrendingTopic,
  getTrendingTopic,
  removeTrendingTopic,
  clearTrendingTopics,
  clearTrendingTimers,
} = useTrending({
  isActive: () => gameState.value === 'event',
  getRandomName: getRandomCharacterName,
  onExpire: handleTrendingExpired,
});

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

const showPopularityDashboard = ref(false);

const {
  danmakus,
  addDanmaku,
  triggerEventDanmaku,
  clearDanmakuTimers,
} = useDanmaku({
  isActive: () => gameState.value === 'event',
  getRandomName: getRandomCharacterName,
});

// For PICK_TWO event
const selectedPair = ref<Character[]>([]);

// Candidates for the current event (Top 5 by popularity)
const eventCandidates = computed(() => sortedCharacters.value.slice(0, 5));

// For RANKING event
const choiceOptions = ref<Choice[]>([]);
const processedDescription = ref('');
const rankingList = ref<Character[]>([]);
const programBranchEvents = SCreateProgramBranchEvents(groupShowProgram);

// --- Computed Properties ---
const currentEvent = computed(() => gameEvents.value[currentEventIndex.value] || null);

const currentProgramEpisode = computed(() => {
  const eventId = currentEvent.value?.id || '';
  return groupShowProgram.find(episode => episode.eventIds.includes(eventId) || episode.branchEventIds.includes(eventId)) || null;
});

const biasBreakthrough = computed(() => SIsBiasInClass1(classTrackState, biasCharacterId.value));
const finalClassLabel = computed(() => biasBreakthrough.value ? '一班' : '二班');
const classRoster = computed(() => SGetClassRoster(classTrackState, characters));
const biasAssessmentStanding = computed(() => SGetAssessmentStanding(classTrackState, biasCharacterId.value));
const biasAssessmentStatus = computed(() => {
  const standing = biasAssessmentStanding.value;
  const distance = standing.distanceToClass1;
  if (standing.rank <= classTrackState.capacityClass1) return `第 ${standing.rank} 名 · 高于一班线 ${distance} 分`;
  return `第 ${standing.rank} 名 · 距一班线 ${Math.abs(distance)} 分`;
});

const heroCharacters = computed(() => sortedCharacters.value);

function createReportId() {
  return Math.floor(getRandomValue() * 36 ** 9).toString(36).padStart(9, '0').toUpperCase();
}

function notifyToast(message: string, duration = 2200, title = '粉圈热报', impactLines: string[] = []) {
  if (toastTimer) window.clearTimeout(toastTimer);
  toastMessage.value = message;
  toastTitle.value = title;
  toastImpactLines.value = impactLines;
  showToast.value = true;
  toastTimer = window.setTimeout(() => showToast.value = false, duration);
}

function openNoticeModal(message: string, title = '粉圈热报') {
  resultModalMode.value = 'notice';
  resultModalTitle.value = title;
  resultModalMessage.value = message;
  showResultModal.value = true;
}

function openFinalClassConfirmation(episodeId: string) {
  const result = classTrackState.episodeResults.find(item => item.episodeId === episodeId);
  if (!result) return finishSeason();
  resultModalMode.value = 'final';
  resultModalTitle.value = '最终席位确认';
  resultModalMessage.value = `${getClassResultMessage(result)} 赛季结算即将生成。`;
  showResultModal.value = true;
}

function togglePopularityDashboard() {
  showPopularityDashboard.value = !showPopularityDashboard.value;
}

function closePopularityDashboard() {
  showPopularityDashboard.value = false;
}

function restartToRoster() {
  gameState.value = 'hub';
}

function resetCharactersForNewSeason() {
  const next = SJitterStartingPopularity(
    cloneData(initialCharacters).sort((a: Character, b: Character) => a.name.localeCompare(b.name, 'zh-CN'))
  );
  characters.splice(0, characters.length, ...next);
}

function enterRoster() {
  resetCharactersForNewSeason();
  gameState.value = 'roster';
  resetPageScroll();
}

function adjustStartingPopularity(characterId: string, delta: number) {
  const character = characters.find((item) => item.id === characterId);
  if (!character) return;
  character.popularity = Math.min(95, Math.max(50, character.popularity + delta));
}

function toggleDanmaku() {
  showDanmaku.value = !showDanmaku.value;
}

function toggleReduceMotion() {
  reduceMotion.value = !reduceMotion.value;
}

const sortedCharacters = computed(() => {
  return [...characters].sort((a, b) => b.popularity - a.popularity);
});

const topCharacter = computed(() => sortedCharacters.value[0]!);

const bottomCharacter = computed(() => sortedCharacters.value[sortedCharacters.value.length - 1]!);

const topBond = computed(() => SGetTopBond(bondMap));

const hasNegativeTrending = computed(() => trendingQueue.value.some(topic => topic.type === 'NEGATIVE'));

const crisisContext = computed(() => ({
  antiFans: fanFactions.antiFans,
  crisisCount: seasonState.crisisCount,
  dramaDebt: seasonState.dramaDebt,
  eventIndex: currentEventIndex.value,
  hasNegativeTrending: hasNegativeTrending.value,
  lastCrisisEventIndex: seasonState.lastCrisisEventIndex,
  popularityGap: topCharacter.value.popularity - bottomCharacter.value.popularity,
}));

const reportAvailability = computed(() => SGetReportAvailability(crisisContext.value));

const fanFactionSummary = computed(() => SGetFanFactionSummary(fanFactions));

const selectedPairBond = computed(() => {
  if (selectedPair.value.length !== 2) return null;
  const [char1, char2] = selectedPair.value;
  return bondMap[[char1.id, char2.id].sort().join('__')] || null;
});

const selectedBondCharacters = computed(() => {
  return selectedBondIds.value.map(id => characters.find(char => char.id === id)).filter(Boolean) as Character[];
});

const bondCandidateList = computed(() => sortedCharacters.value.slice(0, 8));

const selectedBondValue = computed(() => {
  if (selectedBondCharacters.value.length !== 2) return 0;
  return getBondValue(selectedBondCharacters.value[0], selectedBondCharacters.value[1]);
});

const averagePopularity = computed(() => {
  return Math.round(characters.reduce((sum, char) => sum + char.popularity, 0) / characters.length);
});

const seasonScore = computed(() => {
  return SCreateSeasonScore(characters, fanFactions, seasonState, budget.value);
});

const narrativeThreads = computed<SNarrativeThread[]>(() => SGetNarrativeThreads(seasonState));

const producerIdentity = computed(() => SGetProducerIdentity(seasonState, studioLedger));

const narrativeOutcomes = computed<SNarrativeOutcome[]>(() => {
  return SGetNarrativeOutcomes(seasonState, eventHistory, topBond.value, getLowRankGrowth());
});

const seasonRecap = computed(() => SCreateSeasonRecap({
  eventHistory,
  fanFactions,
  narrativeOutcomes: narrativeOutcomes.value,
  seasonState,
}));

const focusCharacter = computed(() => {
  return characters.find(char => char.id === focusCharacterId.value) || topCharacter.value;
});

const biasCharacter = computed(() => {
  return characters.find(char => char.id === biasCharacterId.value) || focusCharacter.value;
});

const {
  applyRecordingControls,
  handleBondProject,
  handleFanProgram,
  handleReportAction,
  recordingPlanMessage,
  recordingResourceCost,
  recordingSuccessModifier,
} = useStudioOperations({
  applyEffect: applySimulationEffect,
  averagePopularity,
  bondMap,
  bondProjectIntensity,
  budget,
  characters,
  eventCandidates,
  executionIntensity,
  fanOperationIntensity,
  focusCharacter,
  biasCharacter,
  highlightedCharIds,
  recordingMode,
  selectedBondCharacters,
  showFeedback: showStudioFeedback,
  onBondProjectRecorded: addBondAssessmentScores,
  onFanProgramRecorded: addFanAssessmentScores,
  spendBudget,
  spendResources: spendEpisodeResources,
  studioLedger,
  topCharacter,
});

const fanMomentumModifier = computed(() => SGetFanMomentumModifier({
  eventType: currentEvent.value?.type || null,
  fanFactions,
  recordingMode: recordingMode.value,
}));

const recordingModeLabels: Record<SRecordingModeKey, string> = {
  BALANCE: '群像',
  FOCUS: '高光',
  DRAMA: '抓马',
};

const recordingReady = computed(() => {
  const budgetCost = executionIntensity.value * RECORDING_INTENSITY_COST;
  return budget.value >= budgetCost && SCanSpendEpisodeResources(episodeResources, recordingResourceCost.value);
});

const effectiveRecordingModifier = computed(() => (recordingReady.value ? recordingSuccessModifier.value : 0));
const effectiveEventModifier = computed(() => effectiveRecordingModifier.value + fanMomentumModifier.value);

function formatModifier(modifier: number): string {
  return `${modifier >= 0 ? '+' : ''}${Math.round(modifier * 100)}%`;
}

const studioClosure = computed(() => {
  return SGetStudioClosure(studioLedger, averagePopularity.value, fanFactionSummary.value, topBond.value);
});

const gameGoalContext = computed(() => {
  return {
    averagePopularity: averagePopularity.value,
    budget: budget.value,
    isSeasonComplete: gameState.value === 'end',
    antiFans: fanFactions.antiFans,
    topBondValue: topBond.value?.value || 0,
    lowRankGrowth: getLowRankGrowth(),
    cpFans: fanFactions.cpFans,
    soloFans: fanFactions.soloFans,
    groupFans: fanFactions.groupFans,
    publicFans: fanFactions.publicFans,
    topPopularity: topCharacter.value.popularity,
    cpHeat: seasonState.cpHeat,
    qteSuccessCount: qteSuccessCount.value,
    bondProjectCount: sumLedgerCounts(studioLedger.bondProjects),
    fanProgramCount: sumLedgerCounts(studioLedger.fanPrograms),
    focusRecordingCount: studioLedger.recordingModes.FOCUS,
  };
});

function sumLedgerCounts(counts: Record<string, number>) {
  return Object.values(counts).reduce((total, value) => total + value, 0);
}

const currentGoalResults = computed(() => SGetGameGoalResults(activeGoalIds.value, gameGoalContext.value));

const gameGoalResults = computed(() => SGetGameGoalResults(activeGoalIds.value, gameGoalContext.value, completedGoalIds.value));

const completedGameGoalCount = computed(() => {
  return SGetCompletedGameGoalCount(gameGoalResults.value);
});

watch(currentGoalResults, results => {
  const newlyCompleted = results.filter(goal => goal.isComplete && !completedGoalIds.value.has(goal.id));
  if (!newlyCompleted.length) return;
  completedGoalIds.value = new Set([...completedGoalIds.value, ...newlyCompleted.map(goal => goal.id)]);
}, { immediate: true });

function claimGoalReward(goalId: string) {
  const goal = gameGoalResults.value.find(item => item.id === goalId);
  const reward = SGetClaimableGoalReward(goal, claimedGoalIds.value);
  if (!reward) return;
  claimedGoalIds.value = new Set([...claimedGoalIds.value, goalId]);
  applySimulationEffect({ budgetDelta: reward.budget, season: { producerReputation: 1 } });
  showStudioFeedback(`${reward.label}到账，经费 +¥${reward.budget.toLocaleString()}。`);
}

const achievementContext = computed(() => {
  return {
    averagePopularity: averagePopularity.value,
    completedGoalCount: completedGameGoalCount.value,
    topBondValue: topBond.value?.value || 0,
    qteSuccessCount: qteSuccessCount.value,
    budget: budget.value,
    completedEpisodeCount: getCompletedEpisodeCount(),
  };
});

const achievementResults = computed(() => {
  return SGetGameAchievementResults(unlockedAchievementIds.value, achievementContext.value);
});

const achievementCount = computed(() => unlockedAchievementIds.value.size);

const totalAchievementCount = computed(() => SGetTotalAchievementCount());

const hasSavedGame = computed(() => Boolean(savedGame.value));

const savedGameLabel = computed(() => {
  if (!savedGame.value) return '';
  return new Date(savedGame.value.savedAt).toLocaleString('zh-CN', { hour12: false });
});

const eventMap = computed(() => {
  return new Map([breakthroughOpeningEvent, ...eventPool, ...groupShowEvents, ...programBranchEvents, ...followUpEvents].map(event => [event.id, event]));
});

const { restoreSaveState, saveSnapshot } = useGameSaveState({
  activeGoalIds,
  activeStudioPage,
  bondMap,
  bondProjectIntensity,
  budget,
  claimedGoalIds,
  completedGoalIds,
  characters,
  classTrackState,
  currentEventIndex,
  episodeResources,
  eventHistory,
  eventMap,
  executionIntensity,
  fanFactions,
  fanOperationIntensity,
  focusCharacterId,
  biasCharacterId,
  gameEvents,
  getSavableState: () => gameState.value === 'event' || gameState.value === 'end' ? gameState.value : null,
  initialPopularityMap,
  qteSuccessCount,
  randomState,
  recordingMode,
  restoreGameState: state => gameState.value = state,
  seasonState,
  settlementReportId,
  studioLedger,
});

const {
  continueSavedGame,
  discardSavedGame,
  initializeSavedGame,
  savedGame,
} = useGamePersistence({
  eventMap,
  gameEvents,
  onDiscard: () => notifyToast('本地存档已清掉。'),
  onRestore: () => {
    triggerEventDanmaku();
    prepareEvent(false, false);
    notifyToast('已接上上次的录制进度。');
  },
  restoreSaveState,
  saveSnapshot,
});

function changeExecutionIntensity(delta: number) {
  executionIntensity.value = clampLevel(executionIntensity.value + delta);
}

function setExecutionIntensity(value: number) {
  executionIntensity.value = clampLevel(value);
}

function setFocusCharacter(characterId: string) {
  focusCharacterId.value = characterId;
}

function setRecordingMode(mode: SRecordingModeKey) {
  recordingMode.value = mode;
}

function setActiveStudioPage(page: StudioViewKey) {
  if (page === 'report' && !reportAvailability.value.isAvailable) return;
  activeStudioPage.value = page;
  resetPageScroll();
}

function changeFanOperationIntensity(delta: number) {
  fanOperationIntensity.value = clampLevel(fanOperationIntensity.value + delta);
}

function setFanOperationIntensity(value: number) {
  fanOperationIntensity.value = clampLevel(value);
}

function changeBondProjectIntensity(delta: number) {
  bondProjectIntensity.value = clampLevel(bondProjectIntensity.value + delta);
}

function setBondProjectIntensity(value: number) {
  bondProjectIntensity.value = clampLevel(value);
}

function clampLevel(value: number) {
  return Math.max(1, Math.min(MAX_OPERATION_LEVEL, value));
}

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

function spendEpisodeResources(cost: SEpisodeResourceCost, action: string): boolean {
  if (SSpendEpisodeResources(episodeResources, cost)) return true;
  showStudioFeedback(`${action}还差 ${SGetResourceCostText(cost)}，这期额度不够，先缓一缓。`);
  return false;
}

function createPopularityEffect(targets: Character[], value: number): Record<string, number> {
  return Object.fromEntries(targets.map(character => [character.id, value]));
}

// --- Hot Search Logic ---
function getRandomCharacterName() {
  return characters[Math.floor(getRandomValue() * characters.length)].name;
}

function handleTrendingExpired(topic: TrendingTopic) {
  const char = characters.find(character => character.name === topic.name);
  if (char) applySimulationEffect({ popularity: { [char.id]: -8 }, factions: { antiFans: 3 }, season: { producerReputation: -4 } });
  addDanmaku(`舆论失控，${topic.name} 的负面话题已扩散。`);
}

function handleTrending(topicId: string, action: TrendingTopicAction) {
  const topic = getTrendingTopic(topicId);
  if (!topic) return;

  if (budget.value < topic.cost) {
    notifyToast(`经费紧，压这条热搜还差 ¥${topic.cost.toLocaleString()}`);
    return;
  }
  if (!spendEpisodeResources({ buzz: 1 }, '上热搜')) return;

  applySimulationEffect({ budgetDelta: -topic.cost });
  const char = characters.find(c => c.name === topic.name);
  
  if (char) {
    if (action === 'BUY' && topic.type === 'POSITIVE') {
      applySimulationEffect({ ...SCreateEventPopularityEffect(characters, { [char.id]: 15 }), season: { groupHeat: 5, anticipation: 3 } });
      addDanmaku(`${char.name} 喜提热搜高位。`);
    } else if (action === 'KILL' && topic.type === 'NEGATIVE') {
      applySimulationEffect({ ...SCreateEventPopularityEffect(characters, { [char.id]: 5 }), factions: { antiFans: -5 }, season: { producerReputation: 2 } });
      addDanmaku(`经费砸到位，${char.name} 的黑词被压下去了。`);
    }
  }

  removeTrendingTopic(topicId);
}

function handleIgnoreTrending(topicId: string) {
  removeTrendingTopic(topicId);
}

function spendBudget(cost: number) {
  if (budget.value < cost) return false;
  applySimulationEffect({ budgetDelta: -cost });
  return true;
}

function showStudioFeedback(message: string) {
  notifyToast(message);
}

// --- Game Flow Methods ---
function resetPageScroll() {
  nextTick(() => window.scrollTo({ top: 0, behavior: 'auto' }));
}

function startGame(selectedBiasId = '') {
  Object.assign(randomState, SCreateGameRandomState());
  SResetSeasonState(seasonState);
  // 记录初始人气，用于结算对比。
  characters.forEach(c => {
    initialPopularityMap[c.id] = c.popularity;
  });
  SResetClassTrackState(classTrackState, characters);
  
  gameEvents.value = SCreateProgramSeasonEvents(breakthroughOpeningEvent, groupShowEvents, groupShowProgram);
  
  currentEventIndex.value = 0;
  eventHistory.length = 0;
  gameState.value = 'event';
  activeStudioPage.value = 'event';
  selectedBondIds.value = [];
  recordingMode.value = 'FOCUS';
  executionIntensity.value = 2;
  budget.value = INITIAL_BUDGET;
  qteSuccessCount.value = 0;
  activeGoalIds.value = SCreateGameGoalIds();
  completedGoalIds.value = new Set();
  claimedGoalIds.value = new Set();
  SResetStudioLedger(studioLedger);
  Object.keys(bondMap).forEach(key => delete bondMap[key]);
  SResetFanFactions(fanFactions);
  biasCharacterId.value = selectedBiasId || topCharacter.value?.id || '';
  focusCharacterId.value = biasCharacterId.value;
  settlementReportId.value = createReportId();
  
  triggerEventDanmaku();
  prepareEvent(false);
  resetPageScroll();
}

function prepareEvent(allowTrending = true, resetResources = true) {
  selectedPair.value = [];
  isBreakingNews.value = false;
  resetQte();
  if (resetResources) SResetEpisodeResources(episodeResources);
  if (biasCharacterId.value) focusCharacterId.value = biasCharacterId.value;

  if (allowTrending && getRandomValue() < 0.4) {
    generateTrendingTopic();
  }

  const isSudden = SShouldTriggerCrisis(crisisContext.value, getRandomValue);

  if (isSudden) {
    seasonState.crisisCount += 1;
    seasonState.lastCrisisEventIndex = currentEventIndex.value + 1;
    isBreakingNews.value = true;
    startQTE();
  }

  if (currentEvent.value?.type === 'RANKING' || currentEvent.value?.type === 'PICK_TWO') {
    rankingList.value = [...eventCandidates.value];
  }

  refreshPreparedEventContent();
}

function refreshPreparedEventContent() {
  const event = currentEvent.value;
  if (!event) {
    choiceOptions.value = [];
    processedDescription.value = '';
    return;
  }

  processedDescription.value = SResolveEventDescription(event.description, eventCandidates.value);
  if (event.type !== 'CHOICE') {
    choiceOptions.value = [];
    return;
  }
  const rawChoices = typeof event.choices === 'function' ? event.choices(eventCandidates.value) : event.choices;
  choiceOptions.value = shuffleList(rawChoices).map(createChoicePreview);
}

function createChoicePreview(choice: Choice): Choice {
  if (!choice.effectTags?.includes('FINALE_AUDIT')) return choice;
  const projectedPressure = seasonState.biasPressure + (SGetNarrativeTagEffect(choice.effectTags).biasPressure || 0);
  const assessmentDelta = SGetFinaleAssessmentDelta(projectedPressure);
  return { ...choice, preview: `当前偏心压力 ${projectedPressure}，收官审查预计使本命考核 ${formatDelta(assessmentDelta)} 分，可能影响一班席位。` };
}

function SResolveEventDescription(description: string, candidates: Character[]) {
  if (!description.includes('${random_char}')) return description;
  const pick = candidates[Math.floor(getRandomValue() * Math.max(candidates.length, 1))] || topCharacter.value;
  return description.replaceAll('${random_char}', pick.name);
}

function handleQteComplete(success: boolean, scenario: QTEScenario) {
  if (success) {
    const bonus = scenario.type === 'TIMING' ? 8 : 5;
    applySimulationEffect({ ...SCreateEventPopularityEffect(characters, createPopularityEffect(characters, bonus)), factions: { groupFans: 5, publicFans: 4 }, season: { producerReputation: 5, groupHeat: 4 } });
    addDanmaku('这就是制作人的实力。');
  } else {
    const penalty = 3;
    applySimulationEffect({ popularity: createPopularityEffect(characters, -penalty), factions: { antiFans: 6 }, season: { producerReputation: -5, dramaDebt: 2 } });
    addDanmaku('刚才那段有点危险。');
  }
}

function nextEvent() {
  insertEpisodeBranchAfterFixedNodes();
  const completedEpisode = SGetJustCompletedEpisode(groupShowProgram, eventHistory, classTrackState.episodeResults);
  currentEventIndex.value++;
  if (completedEpisode) {
    SApplyEpisodeAssessment(classTrackState, characters);
    SReshuffleClasses(classTrackState, completedEpisode.id, biasCharacterId.value);
  }
  if (currentEventIndex.value < gameEvents.value.length) {
    prepareNextEvent();
    if (completedEpisode) showClassResult(completedEpisode.id);
    return;
  }
  if (completedEpisode) return openFinalClassConfirmation(completedEpisode.id);
  finishSeason();
}

function insertEpisodeBranchAfterFixedNodes() {
  const episode = SGetEpisodeAwaitingBranch(groupShowProgram, eventHistory, classTrackState.episodeResults);
  if (!episode) return;
  const branchEvent = SGetEpisodeBranchEvent(episode, classTrackState, seasonState, biasCharacterId.value, programBranchEvents);
  gameEvents.value.splice(currentEventIndex.value + 1, 0, branchEvent);
}

function prepareNextEvent() {
  prepareEvent();
  gameState.value = 'event';
}

function finishSeason() {
  gameState.value = 'end';
  clearTrendingTopics();
  unlockAchievements();
}

function showClassResult(episodeId: string) {
  const result = classTrackState.episodeResults.find(item => item.episodeId === episodeId);
  if (!result) return;
  openNoticeModal(getClassResultMessage(result), '班级热报');
}

function getClassResultMessage(result: SClassTrackState['episodeResults'][number]): string {
  return `本期考核结束，座位重新安排。升班：${getCharacterNames(result.promotedIds)}。降班：${getCharacterNames(result.demotedIds)}。本命目前在${result.biasClass === 'CLASS1' ? '一班' : '二班'}。`;
}

function getCharacterNames(ids: string[]): string {
  const names = ids.map(id => characters.find(character => character.id === id)?.name).filter(Boolean);
  return names.length ? names.join('、') : '本期无变动';
}

function unlockAchievements() {
  const newAchievementIds = SGetNewAchievementIds(achievementResults.value);
  if (!newAchievementIds.length) return;
  unlockedAchievementIds.value = new Set([...unlockedAchievementIds.value, ...newAchievementIds]);
  writeAchievementIds([...unlockedAchievementIds.value]);
}

// --- Event Handlers ---
function applyEventResult(result: string, draft: Character[], tags: GameEffectTag[] = [], recordingDeltas: Record<string, number> = {}) {
  const event = currentEvent.value;
  if (!event) return;
  const eventEffect = SCreateEventFactionEffect(event, tags);
  const draftEffect = SCreateEventDraftEffect(characters, createFinaleBiasDraft(draft, tags), tags);
  const classPopularity = SCreateClassPopularityDeltas(classTrackState, draftEffect.popularity || {});
  const seasonEffect = createEventSeasonEffect(event, tags);
  const finaleAssessmentDeltas = SCreateFinaleAssessmentDeltas(
    classTrackState,
    biasCharacterId.value,
    seasonState.biasPressure + (seasonEffect.biasPressure || 0),
    tags.includes('FINALE_AUDIT'),
  );
  const assessmentDeltas = SMergeAssessmentDeltas(
    SCreateEventAssessmentDeltas(classTrackState, classPopularity),
    recordingDeltas,
    finaleAssessmentDeltas,
  );
  const applied = applySimulationEffect({ ...draftEffect, popularity: classPopularity, factions: eventEffect.factions, season: seasonEffect, bond: createSelectedPairBond() });
  SAddAssessmentScores(classTrackState, assessmentDeltas);
  applySimulationEffect({ season: SGetNarrativeResolutionEffect(event.id) });
  const eventResult = applied.bondBonusText ? `${result} ${applied.bondBonusText}` : result;
  const message = `${eventResult}${applyProgramBonus()}`;
  triggerFeedback(message, applied.affectedIds, tags, getAssessmentImpactLines(assessmentDeltas, seasonEffect, finaleAssessmentDeltas));
}

/** Routes the finale's personal ending to the selected bias instead of the current popularity leader. */
function createFinaleBiasDraft(draft: Character[], tags: GameEffectTag[]): Character[] {
  if (!tags.includes('FINALE_AUDIT')) return draft;
  const bias = draft.find(character => character.id === biasCharacterId.value);
  if (bias) bias.popularity += 10;
  return draft;
}

function applyProgramBonus(): string {
  const bonus = SGetProgramBonus(currentEventIndex.value, getRandomValue);
  if (!bonus) return '';
  const characterDraft = cloneData(characters);
  const factionDraft: SFanFactionState = { ...fanFactions };
  const summary = bonus.apply(characterDraft, factionDraft);
  const effect = SCreateEventDraftEffect(characters, characterDraft);
  applySimulationEffect({ ...effect, factions: SCreateFactionDraftEffect(fanFactions, factionDraft) });
  return ` 节目组掉落「${bonus.name}」：${summary}`;
}

function createEventSeasonEffect(event: GameEvent, tags: GameEffectTag[]): Partial<SSeasonState> {
  return addEventSeasonEffect(SGetNarrativeTagEffect(tags), event, tags);
}

function addEventSeasonEffect(effect: Partial<SSeasonState>, event: GameEvent, tags: GameEffectTag[]): Partial<SSeasonState> {
  const heat = event.type === 'PICK_TWO' ? 4 : event.type === 'RANKING' ? 3 : 2;
  const reputation = tags.includes('ANTI_RISK') ? 4 : 1;
  return { ...effect, groupHeat: (effect.groupHeat || 0) + heat + (tags.includes('GROUP_BOOST') ? 3 : 0), producerReputation: (effect.producerReputation || 0) + reputation, anticipation: (effect.anticipation || 0) + (tags.includes('PUBLIC_BOOST') ? 2 : 0) };
}

function createSelectedPairBond(): SGameEffect['bond'] | undefined {
  const event = currentEvent.value;
  if (selectedPair.value.length !== 2) return undefined;
  if (!event || event.type !== 'PICK_TWO') return undefined;
  const [first, second] = selectedPair.value;
  const isTeam = event.pairRole === 'TEAM';
  return { pairIds: [first.id, second.id], names: `${first.name} x ${second.name}`, delta: isTeam ? 10 : 18, grantPopularityBonus: !isTeam };
}

function triggerFeedback(result: string, affectedIds: string[] = [], effectTags: GameEffectTag[] = [], impactLines: string[] = []) {
  const event = currentEvent.value;
  if (!event) return;
  const finalResult = result;

  // 记录历史。
  eventHistory.push({ event, result: finalResult, effectTags });
  
  // 识别受影响成员。
  const highlightedIds = new Set(affectedIds);
  characters.forEach(c => {
    if (finalResult.includes(c.name)) {
      highlightedIds.add(c.id);
    }
  });
  // PICK_TWO 事件同时高亮选中的两位成员。
  if (selectedPair.value.length > 0) {
    selectedPair.value.forEach(c => highlightedIds.add(c.id));
  }

  highlightedCharIds.value = highlightedIds;
  addDanmaku(`粉圈热报：${finalResult.slice(0, 20)}...`);
  notifyToast(finalResult, 3200, '本轮回响', impactLines);
  activeStudioPage.value = 'event';
  nextEvent();
  resetPageScroll();
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

function getAssessmentImpactLines(deltas: Record<string, number>, seasonEffect: Partial<SSeasonState>, finaleDeltas: Record<string, number>): string[] {
  const biasDelta = deltas[biasCharacterId.value] || 0;
  const biasScore = classTrackState.assessmentScore[biasCharacterId.value] || 0;
  const lines = [`本命考核 ${formatDelta(biasDelta)} -> ${biasScore} 分`];
  if (selectedPair.value.length === 2) lines.push(`搭档考核 ${formatPairDelta(deltas)}`);
  if (seasonEffect.biasPressure) lines.push(`偏心压力 ${formatDelta(seasonEffect.biasPressure)}`);
  if (finaleDeltas[biasCharacterId.value]) lines.push(`收官席位赌局 ${formatDelta(finaleDeltas[biasCharacterId.value])}`);
  return lines.slice(0, 4);
}

function formatPairDelta(deltas: Record<string, number>): string {
  return formatDelta(selectedPair.value.reduce((total, character) => total + (deltas[character.id] || 0), 0));
}

function formatDelta(value: number): string {
  return `${value >= 0 ? '+' : ''}${value}`;
}

function handleChoice(choice: Choice) {
  if (showResultModal.value) return;
  const controlResult = applyRecordingControls();
  const draft = cloneData(characters);
  const result = withRandomModifier(controlResult.successModifier + fanMomentumModifier.value, () => choice.action(draft));
  applyEventResult(SFormatRoundResult(result, controlResult.message), draft, choice.effectTags, createRecordingAssessmentDeltas(controlResult.successModifier));
}

function createRecordingAssessmentDeltas(successModifier: number): Record<string, number> {
  if (!successModifier) return {};
  return SCreateRecordingAssessmentDeltas(classTrackState, characters, averagePopularity.value, recordingMode.value, focusCharacterId.value, executionIntensity.value);
}

function SFormatRoundResult(choiceResult: string, recordingMessage = ''): string {
  if (!recordingMessage) return `【这波操作】${choiceResult}`;
  return `【机位加戏】${recordingMessage}\n【这波操作】${choiceResult}`;
}

onUnmounted(() => {
  if (toastTimer) window.clearTimeout(toastTimer);
  clearDanmakuTimers();
  clearQteTimers();
  clearTrendingTimers();
});

onMounted(() => {
  initializeSavedGame();
  unlockedAchievementIds.value = new Set(readAchievementIds());
});

function handlePickTwo() {
  if (showResultModal.value) return;
  const event = currentEvent.value;
  if (!event || event.type !== 'PICK_TWO') return;
  if (selectedPair.value.length !== 2) return;
  const controlResult = applyRecordingControls();
  const draft = cloneData(characters);
  const [first, second] = selectedPair.value.map(character => draft.find(item => item.id === character.id)!);
  const result = withRandomModifier(controlResult.successModifier + fanMomentumModifier.value, () => event.choices.action(first, second, draft));
  applyEventResult(SFormatRoundResult(result, controlResult.message), draft, [], createRecordingAssessmentDeltas(controlResult.successModifier));
}

function handleRanking() {
  if (showResultModal.value) return;
  const event = currentEvent.value;
  if (!event || event.type !== 'RANKING') return;
  const controlResult = applyRecordingControls();
  const draft = rankingList.value.map(character => cloneData(character));
  const result = withRandomModifier(controlResult.successModifier + fanMomentumModifier.value, () => event.choices.action(draft));
  applyEventResult(SFormatRoundResult(result, controlResult.message), draft, [], createRecordingAssessmentDeltas(controlResult.successModifier));
}

function updateRankingList(nextRankingList: Character[]) {
  rankingList.value = nextRankingList;
}

function toggleSelection(character: Character) {
  if (currentEvent.value?.type !== 'PICK_TWO') return;

  const index = selectedPair.value.findIndex(c => c.id === character.id);
  if (index > -1) {
    selectedPair.value.splice(index, 1);
  } else {
    if (selectedPair.value.length < 2) {
      selectedPair.value.push(character);
    }
  }
}

function toggleBondCandidate(character: Character) {
  if (selectedBondIds.value.includes(character.id)) {
    selectedBondIds.value = selectedBondIds.value.filter(id => id !== character.id);
    return;
  }
  selectedBondIds.value = [...selectedBondIds.value, character.id].slice(-2);
}

function addBondAssessmentScores(pair: Character[], intensity: number) {
  SAddAssessmentScores(classTrackState, SCreatePairAssessmentDeltas(classTrackState, pair.map(character => character.id), intensity));
}

function addFanAssessmentScores(type: SFanProgramKey, intensity: number) {
  if (type !== 'SOLO') return;
  SAddAssessmentScores(classTrackState, SCreateBiasAssessmentDeltas(classTrackState, biasCharacterId.value, intensity));
}

function getBondValue(char1: Character, char2: Character) {
  return bondMap[SGetPairKey(char1, char2)]?.value || 0;
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
  <div class="container" :class="{ 'reduce-motion': reduceMotion }">
    <VcHomeView
      v-if="gameState === 'home'"
      :hero-characters="heroCharacters"
      :has-saved-game="hasSavedGame"
      :saved-game-label="savedGameLabel"
      :achievement-count="achievementCount"
      :total-achievement-count="totalAchievementCount"
      @continue-saved-game="continueSavedGame"
      @enter-roster="gameState = 'hub'"
      @discard-saved-game="discardSavedGame"
    />

    <VcProducerHub
      v-if="gameState === 'hub'"
      :has-saved-game="hasSavedGame"
      :saved-game-label="savedGameLabel"
      :achievement-count="achievementCount"
      :total-achievement-count="totalAchievementCount"
      :character-count="characters.length"
      :average-popularity="averagePopularity"
      :achievements="achievementResults"
      @continue-saved-game="continueSavedGame"
      @enter-roster="enterRoster"
      @discard-saved-game="discardSavedGame"
      @back-home="gameState = 'home'"
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
        @close-result="closeQteResult"
      />

      <VcDanmakuLayer :show="showDanmaku" :danmakus="danmakus" />

      <VcTopControlBar
        :current-event-index="currentEventIndex"
        :total-events="gameEvents.length"
        :episode-title="currentProgramEpisode?.title || '开录日: 主题曲定位'"
        :class1-count="classRoster.CLASS1.length"
        :bias-class-label="finalClassLabel"
        :bias-assessment-score="biasAssessmentStanding.score"
        :bias-assessment-status="biasAssessmentStatus"
        :budget="budget"
        :episode-resources="episodeResources"
        :bias-character="biasCharacter"
        :has-trending="isAnyTrending"
        :show-danmaku="showDanmaku"
        :reduce-motion="reduceMotion"
        @toggle-dashboard="togglePopularityDashboard"
        @toggle-danmaku="toggleDanmaku"
        @toggle-reduce-motion="toggleReduceMotion"
      />

      <VcStudioNav
        :active-studio-page="activeStudioPage"
        :report-available="reportAvailability.isAvailable"
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
          :top-character="topCharacter"
          :highlighted-char-ids="highlightedCharIds"
          :trending-queue="trendingQueue"
          @close="closePopularityDashboard"
        />

        <VcLiveCockpit
          v-if="activeStudioPage === 'recording'"
          :recording-mode="recordingMode"
          :focus-character="focusCharacter"
          :bias-character-id="biasCharacterId"
          :event-candidates="eventCandidates"
          :focus-character-id="focusCharacterId"
          :execution-intensity="executionIntensity"
          :recording-intensity-cost="RECORDING_INTENSITY_COST"
          :recording-success-modifier="effectiveRecordingModifier"
          :fan-momentum-modifier="fanMomentumModifier"
          :event-success-modifier="effectiveEventModifier"
          :recording-resource-cost="recordingResourceCost"
          :recording-plan-message="recordingPlanMessage"
          @select-focus="setFocusCharacter"
          @set-recording-mode="setRecordingMode"
          @change-intensity="changeExecutionIntensity"
          @set-intensity="setExecutionIntensity"
          @back-to-event="setActiveStudioPage('event')"
        />

        <VcGameGoalsPanel
          v-if="activeStudioPage === 'goals'"
          :goals="gameGoalResults"
          :claimed-goal-ids="claimedGoalIds"
          @claim-reward="claimGoalReward"
        />

        <VcFanWorkspace
          v-if="activeStudioPage === 'fans'"
          :fan-factions="fanFactions"
          :fan-operation-intensity="fanOperationIntensity"
          :fan-program-base-cost="FAN_PROGRAM_BASE_COST"
          :bias-character="biasCharacter"
          :fan-momentum-label="formatModifier(fanMomentumModifier)"
          :recording-mode-label="recordingModeLabels[recordingMode]"
          @change-intensity="changeFanOperationIntensity"
          @set-intensity="setFanOperationIntensity"
          @run-program="handleFanProgram"
        />

        <VcBondWorkspace
          v-if="activeStudioPage === 'bonds'"
          :bond-candidate-list="bondCandidateList"
          :selected-bond-ids="selectedBondIds"
          :selected-bond-characters="selectedBondCharacters"
          :selected-bond-value="selectedBondValue"
          :bond-project-intensity="bondProjectIntensity"
          :bond-project-base-cost="BOND_PROJECT_BASE_COST"
          :top-bond="topBond"
          @toggle-candidate="toggleBondCandidate"
          @change-intensity="changeBondProjectIntensity"
          @set-intensity="setBondProjectIntensity"
          @start-project="handleBondProject"
        />

        <VcReportWorkspace
          v-if="activeStudioPage === 'report' && reportAvailability.isAvailable"
          :fan-faction-summary="fanFactionSummary"
          :fan-factions="fanFactions"
          :studio-closure="studioClosure"
          :studio-ledger="studioLedger"
          :sorted-characters="sortedCharacters"
          :class-roster="classRoster"
          :assessment-score="classTrackState.assessmentScore"
          :report-availability="reportAvailability"
          @run-report-action="handleReportAction"
        />

        <VcEventStage
          v-if="activeStudioPage === 'event'"
          :is-breaking-news="isBreakingNews"
          :current-event-index="currentEventIndex"
          :total-events="gameEvents.length"
          :title="currentEvent.title"
          :description="processedDescription"
          :episode-title="currentProgramEpisode?.title || '开录日: 主题曲定位'"
          :episode-summary="currentProgramEpisode?.summary || '先确定这一季团综的第一记忆点。'"
          :class1-count="classRoster.CLASS1.length"
          :bias-class-label="finalClassLabel"
          :narrative-threads="narrativeThreads"
          :focus-name="focusCharacter.name"
          :recording-mode-label="recordingModeLabels[recordingMode]"
          :recording-plan-message="recordingPlanMessage"
          :recording-modifier-label="formatModifier(effectiveRecordingModifier)"
          :fan-modifier-label="formatModifier(fanMomentumModifier)"
          :total-modifier-label="formatModifier(effectiveEventModifier)"
          :recording-ready="recordingReady"
          @open-recording="setActiveStudioPage('recording')"
        >
            <VcChoiceEventPanel
              v-if="currentEvent.type === 'CHOICE'"
              :choices="choiceOptions"
              @select-choice="handleChoice"
            />

            <VcPickTwoEventPanel
              v-if="currentEvent.type === 'PICK_TWO'"
              :candidates="rankingList"
              :selected-pair="selectedPair"
              :selected-pair-bond-value="selectedPairBond?.value || 0"
              :pair-role="currentEvent.pairRole"
              @toggle-selection="toggleSelection"
              @submit="handlePickTwo"
            />

            <VcRankingEventPanel
              v-if="currentEvent.type === 'RANKING'"
              :ranking-list="rankingList"
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
      :bias-name="biasCharacter.name"
      :bias-breakthrough="biasBreakthrough"
      :final-class-label="finalClassLabel"
      @share-poster="handleSharePoster"
      @restart="restartToRoster"
    />

  </div>
</template>
