<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue';
import { characters as initialCharacters } from './data/characters';
import { openingEvent, eventPool } from './data/events';
import { followUpEvents } from './data/followUpEvents';
import { qteScenarios } from './data/qteScenarios';
import {
  BOND_PROJECT_BASE_COST,
  FAN_PROGRAM_BASE_COST,
  HEART_SUPPORT_COST,
  INITIAL_BUDGET,
  MAX_OPERATION_LEVEL,
  RECORDING_INTENSITY_COST,
} from './data/gameConfig';
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
import VcToastHint from './components/main/VcToastHint.vue';
import VcTopControlBar from './components/main/VcTopControlBar.vue';
import VcTrendingManager from './components/main/VcTrendingManager.vue';
import { useDanmaku } from './composables/useDanmaku';
import { useQte } from './composables/useQte';
import { useTrending } from './composables/useTrending';
import type { Character } from './data/characters';
import type { Choice, GameEffectTag, GameEvent } from './data/events';
import type { QTEScenario } from './data/type/QTEScenario';
import type {
  EventHistoryItem,
  ProducerAnalysisItem,
  ProducerMedal,
  ProducerTitle,
} from './data/type/SettlementReport';
import type { TrendingTopic, TrendingTopicAction } from './data/type/TrendingTopic';
import type { SBondPair } from './baseLib/serviceLib/type/SBondPair';
import type { SFanFactionState } from './baseLib/serviceLib/type/SFanFactionState';
import type { SOperationCard } from './baseLib/serviceLib/type/SOperationCard';
import type {
  SBondProjectKey,
  SFanProgramKey,
  SRecordingModeKey,
  SReportActionKey,
  SStudioLedgerKey,
  SStudioLedger,
} from './baseLib/serviceLib/type/SStudioLedger';
import {
  SApplyBondBonus,
  SApplyFactionReaction,
  SClampFanFactions,
  SCreateCardHand,
  SDownloadSharePoster,
  SGetFanFactionSummary,
  SGetPairKey,
  SGetTopBond,
  SResetFanFactions,
  SUpdateBondMap,
} from './baseLib/serviceLib/SGameFeatures';
import {
  SCreateGameGoalIds,
  SGetCompletedGameGoalCount,
  SGetGameGoalResults,
} from './baseLib/serviceLib/SGameGoals';
import {
  SGetFollowUpEventId,
  SInsertFollowUpEvent,
} from './baseLib/serviceLib/SGameEventChain';
import {
  SGetGameAchievementResults,
  SGetNewAchievementIds,
  SGetTotalAchievementCount,
} from './baseLib/serviceLib/SGameAchievements';
import {
  SCreateStudioLedger,
  SGetStudioClosure,
  SGetTotalSpend,
  SRecordBondProject,
  SRecordFanProgram,
  SRecordFanSupport,
  SRecordOperationCard,
  SRecordRecordingRun,
  SRecordReportAction,
  SResetStudioLedger,
} from './baseLib/serviceLib/SStudioLedger';
import {
  SGetBondTraitBonus,
  SGetDramaAntiReduction,
  SGetRecordingTraitBonus,
} from './baseLib/serviceLib/SCharacterTraits';
import {
  clearGameSave,
  createGameSaveData,
  readGameSave,
  restoreGameSaveCollections,
  writeGameSave,
  type GameSaveData,
} from './utils/gameSave';
import { readAchievementIds, writeAchievementIds } from './utils/achievementSave';
import { cloneData } from './utils/cloneData';
import { shuffleList } from './utils/random';

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
const toastMessage = ref('');
const showToast = ref(false);
const savedGame = ref<GameSaveData | null>(null);
const activeGoalIds = ref<string[]>([]);
const unlockedAchievementIds = ref<Set<string>>(new Set());
const highlightedCharIds = ref<Set<string>>(new Set());
const isBreakingNews = ref(false);
const budget = ref(INITIAL_BUDGET);
const lastInterruptionIndex = ref(-1);
const showDanmaku = ref(true);
const reduceMotion = ref(false);
const isHistoryExpanded = ref(false);
const fanFactions = reactive<SFanFactionState>({
  groupFans: 62,
  soloFans: 48,
  cpFans: 36,
  publicFans: 52,
  antiFans: 24,
});
const bondMap = reactive<Record<string, SBondPair>>({});
const operationCards = ref<SOperationCard[]>([]);
const usedCardIds = ref<Set<string>>(new Set());
const cardFeedback = ref('');
const isGeneratingPoster = ref(false);
const settlementReportId = ref(createReportId());
const studioLedger = reactive<SStudioLedger>(SCreateStudioLedger());
const activeStudioPage = ref<SStudioLedgerKey>('recording');
const selectedBondIds = ref<string[]>([]);
const recordingMode = ref<SRecordingModeKey>('BALANCE');
const focusCharacterId = ref('');
const executionIntensity = ref(2);
const fanOperationIntensity = ref(2);
const bondProjectIntensity = ref(2);

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
let toastTimer: number | null = null;

// For PICK_TWO event
const selectedPair = ref<Character[]>([]);

// Candidates for the current event (Top 5 by popularity)
const eventCandidates = computed(() => sortedCharacters.value.slice(0, 5));

// For RANKING event
const rankingList = ref<Character[]>([]);

// --- Computed Properties ---
const currentEvent = computed(() => gameEvents.value[currentEventIndex.value] || null);

const choiceOptions = computed(() => {
  const event = currentEvent.value;
  if (!event || event.type !== 'CHOICE') return [];
  return typeof event.choices === 'function' ? event.choices(eventCandidates.value) : event.choices;
});

const heroCharacters = computed(() => [...characters, ...characters]);

const reversedHeroCharacters = computed(() => [...heroCharacters.value].reverse());

function createReportId() {
  return Math.random().toString(36).slice(2, 11).toUpperCase();
}

function notifyToast(message: string, duration = 1500) {
  if (toastTimer) window.clearTimeout(toastTimer);
  toastMessage.value = message;
  showToast.value = true;
  toastTimer = window.setTimeout(() => showToast.value = false, duration);
}

function togglePopularityDashboard() {
  showPopularityDashboard.value = !showPopularityDashboard.value;
}

function closePopularityDashboard() {
  showPopularityDashboard.value = false;
}

function toggleHistoryExpanded() {
  isHistoryExpanded.value = !isHistoryExpanded.value;
}

function restartToRoster() {
  gameState.value = 'hub';
}

function toggleDanmaku() {
  showDanmaku.value = !showDanmaku.value;
}

function toggleReduceMotion() {
  reduceMotion.value = !reduceMotion.value;
}

const processedDescription = computed(() => {
  if (!currentEvent.value) return '';
  let desc = currentEvent.value.description;
  if (desc.includes('${random_char}')) {
    desc = desc.replace('${random_char}', topCharacter.value.name);
  }
  return desc;
});

const sortedCharacters = computed(() => {
  return [...characters].sort((a, b) => b.popularity - a.popularity);
});

const topCharacter = computed(() => sortedCharacters.value[0]!);

const bottomCharacter = computed(() => sortedCharacters.value[sortedCharacters.value.length - 1]!);

const topBond = computed(() => SGetTopBond(bondMap));

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

const focusCharacter = computed(() => {
  return characters.find(char => char.id === focusCharacterId.value) || topCharacter.value;
});

const studioClosure = computed(() => {
  return SGetStudioClosure(studioLedger, averagePopularity.value, fanFactionSummary.value, topBond.value);
});

const studioTotalSpend = computed(() => {
  return SGetTotalSpend(studioLedger);
});

const gameGoalContext = computed(() => {
  return {
    averagePopularity: averagePopularity.value,
    budget: budget.value,
    antiFans: fanFactions.antiFans,
    topBondValue: topBond.value?.value || 0,
    completedWorkspaces: studioClosure.value.filter(item => item.actions > 0).length,
    lowRankGrowth: getLowRankGrowth(),
  };
});

const gameGoalResults = computed(() => {
  return SGetGameGoalResults(activeGoalIds.value, gameGoalContext.value);
});

const completedGameGoalCount = computed(() => {
  return SGetCompletedGameGoalCount(gameGoalResults.value);
});

const achievementContext = computed(() => {
  return {
    averagePopularity: averagePopularity.value,
    completedGoalCount: completedGameGoalCount.value,
    topBondValue: topBond.value?.value || 0,
    qteSuccessCount: qteSuccessCount.value,
    budget: budget.value,
    completedWorkspaces: gameGoalContext.value.completedWorkspaces,
    followUpEventCount: getFollowUpEventCount(),
  };
});

const achievementResults = computed(() => {
  return SGetGameAchievementResults(unlockedAchievementIds.value, achievementContext.value);
});

const settlementAchievements = computed(() => {
  return achievementResults.value.filter(result => result.isUnlocked);
});

const achievementCount = computed(() => unlockedAchievementIds.value.size);

const totalAchievementCount = computed(() => SGetTotalAchievementCount());

const hasSavedGame = computed(() => Boolean(savedGame.value));

const savedGameLabel = computed(() => {
  if (!savedGame.value) return '';
  return new Date(savedGame.value.savedAt).toLocaleString('zh-CN', { hour12: false });
});

const saveSnapshot = computed(() => {
  if (!isSavableGameState(gameState.value)) return null;
  return createSaveData(gameState.value);
});

const eventMap = computed(() => {
  return new Map([openingEvent, ...eventPool, ...followUpEvents].map(event => [event.id, event]));
});

function isSavableGameState(state: GameState): state is GameSaveData['gameState'] {
  return state === 'event' || state === 'end';
}

function createSaveData(state: GameSaveData['gameState']): GameSaveData {
  return createGameSaveData({
    gameState: state,
    currentEventIndex: currentEventIndex.value,
    gameEvents: gameEvents.value,
    eventHistory,
    characters,
    initialPopularityMap,
    budget: budget.value,
    fanFactions,
    bondMap,
    studioLedger,
    qteSuccessCount: qteSuccessCount.value,
    activeStudioPage: activeStudioPage.value,
    recordingMode: recordingMode.value,
    focusCharacterId: focusCharacterId.value,
    executionIntensity: executionIntensity.value,
    fanOperationIntensity: fanOperationIntensity.value,
    bondProjectIntensity: bondProjectIntensity.value,
    usedCardIds: usedCardIds.value,
    cardFeedback: cardFeedback.value,
    settlementReportId: settlementReportId.value,
    activeGoalIds: activeGoalIds.value,
  });
}

function saveCurrentGame() {
  if (!saveSnapshot.value) return;
  writeGameSave(saveSnapshot.value);
  savedGame.value = readGameSave();
}

function continueSavedGame() {
  const saveData = savedGame.value;
  if (!saveData || !restoreSavedGame(saveData)) {
    discardSavedGame();
  }
}

function discardSavedGame() {
  clearGameSave();
  savedGame.value = null;
  notifyToast('本地存档已清除。');
}

function restoreSavedGame(saveData: GameSaveData) {
  const restoredEvents = saveData.eventIds.map(id => eventMap.value.get(id));
  if (restoredEvents.some(event => !event)) return false;
  gameEvents.value = restoredEvents as GameEvent[];
  restoreSaveState(saveData);
  triggerEventDanmaku();
  prepareEvent();
  notifyToast('已恢复上次录制进度。');
  return true;
}

function restoreSaveState(saveData: GameSaveData) {
  gameState.value = saveData.gameState;
  currentEventIndex.value = saveData.currentEventIndex;
  budget.value = saveData.budget;
  qteSuccessCount.value = saveData.qteSuccessCount;
  activeStudioPage.value = saveData.activeStudioPage;
  recordingMode.value = saveData.recordingMode;
  focusCharacterId.value = saveData.focusCharacterId;
  executionIntensity.value = saveData.executionIntensity;
  fanOperationIntensity.value = saveData.fanOperationIntensity;
  bondProjectIntensity.value = saveData.bondProjectIntensity;
  usedCardIds.value = new Set(saveData.usedCardIds);
  cardFeedback.value = saveData.cardFeedback;
  settlementReportId.value = saveData.settlementReportId;
  activeGoalIds.value = saveData.activeGoalIds || SCreateGameGoalIds();
  operationCards.value = SCreateCardHand();
  restoreCollections(saveData);
}

function restoreCollections(saveData: GameSaveData) {
  restoreGameSaveCollections({
    characters,
    initialPopularityMap,
    bondMap,
    fanFactions,
    studioLedger,
    eventHistory,
    eventMap: eventMap.value,
  }, saveData);
}

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

function setActiveStudioPage(page: SStudioLedgerKey) {
  activeStudioPage.value = page;
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

function getFollowUpEventCount() {
  return gameEvents.value.filter(event => event.id.startsWith('followup-')).length;
}

// --- Hot Search Logic ---
function getRandomCharacterName() {
  return characters[Math.floor(Math.random() * characters.length)].name;
}

function handleTrendingExpired(topic: TrendingTopic) {
  const char = characters.find(character => character.name === topic.name);
  if (char) char.popularity -= 8;
  addDanmaku(`舆论失控，${topic.name} 的负面话题已扩散。`);
}

function handleTrending(topicId: string, action: TrendingTopicAction) {
  const topic = getTrendingTopic(topicId);
  if (!topic) return;

  if (budget.value < topic.cost) {
    notifyToast(`预算不足，处理该热搜需要 ¥${topic.cost.toLocaleString()}`);
    return;
  }

  budget.value -= topic.cost;
  const char = characters.find(c => c.name === topic.name);
  
  if (char) {
    if (action === 'BUY' && topic.type === 'POSITIVE') {
      char.popularity += 15;
      addDanmaku(`${char.name} 喜提热搜高位。`);
    } else if (action === 'KILL' && topic.type === 'NEGATIVE') {
      char.popularity += 5;
      addDanmaku(`预算到位，${char.name} 的负面声量被压下。`);
    }
  }

  removeTrendingTopic(topicId);
}

function handleIgnoreTrending(topicId: string) {
  removeTrendingTopic(topicId);
}

function handleHeartClick(char: Character) {
  const cost = HEART_SUPPORT_COST;
  if (budget.value < cost) {
    notifyToast(`预算不足，应援需要 ¥${cost.toLocaleString()}`);
    return;
  }
  
  budget.value -= cost;
  SRecordFanSupport(studioLedger, cost, char.name);
  char.popularity += 2;
  fanFactions.soloFans += 2;
  fanFactions.antiFans += 1;
  SClampFanFactions(fanFactions);
  clampPopularity();
  addDanmaku(`粉丝为 ${char.name} 加码应援。`);
}

function handleUseCard(card: SOperationCard) {
  if (usedCardIds.value.has(card.id) || budget.value < card.cost) return;
  budget.value -= card.cost;
  SRecordOperationCard(studioLedger, card.cost, card.name);
  cardFeedback.value = card.apply(characters, fanFactions);
  usedCardIds.value = new Set([...usedCardIds.value, card.id]);
  SClampFanFactions(fanFactions);
  clampPopularity();
  addDanmaku(`制作人打出「${card.name}」：${cardFeedback.value}`);
}

function spendBudget(cost: number) {
  if (budget.value < cost) return false;
  budget.value -= cost;
  return true;
}

function showStudioFeedback(message: string) {
  notifyToast(message, 1800);
  addDanmaku(`工作台更新：${message}`);
}

function handleFanProgram(type: SFanProgramKey) {
  const cost = FAN_PROGRAM_BASE_COST[type] * fanOperationIntensity.value;
  if (!spendBudget(cost)) return showStudioFeedback('预算不足，粉丝运营方案暂时搁置。');
  SRecordFanProgram(studioLedger, type, cost);
  applyFanProgram(type);
  SClampFanFactions(fanFactions);
  clampPopularity();
}

function applyFanProgram(type: SFanProgramKey) {
  const messages = {
    GROUP: '团建物料上线，团粉盘提升，全员获得曝光。',
    SOLO: '单人直拍投放，唯粉盘升温，TOP 成员获得额外关注。',
    CP: '双人花絮释放，CP 粉增长，但争议声量也会抬头。',
    PUBLIC: '路人向切片铺开，路人盘提升，低位成员获得镜头。',
    ANTI: '反黑组联动，黑粉声量下降，公关口碑回稳。',
  };
  runFanEffect(type);
  showStudioFeedback(messages[type]);
}

function runFanEffect(type: SFanProgramKey) {
  const power = fanOperationIntensity.value;
  if (type === 'GROUP') { fanFactions.groupFans += 5 * power; characters.forEach(char => char.popularity += power); }
  if (type === 'SOLO') { fanFactions.soloFans += 5 * power; topCharacter.value.popularity += 3 * power; }
  if (type === 'CP') { fanFactions.cpFans += 6 * power; fanFactions.antiFans += power; }
  if (type === 'PUBLIC') { fanFactions.publicFans += 6 * power; characters.filter(char => char.popularity < 78).forEach(char => char.popularity += power); }
  if (type === 'ANTI') { fanFactions.antiFans -= 6 * power; fanFactions.publicFans += power; }
}

// --- Game Flow Methods ---
function randomizePopularity() {
  characters.forEach(c => {
    c.popularity = Math.floor(Math.random() * 41) + 60; // 60-100 闅忔満
  });
}

function adjustCharacterPopularity(characterId: string, delta: number) {
  const character = characters.find(char => char.id === characterId);
  if (character) character.popularity = Math.max(0, Math.min(100, character.popularity + delta));
}

function startGame() {
  // 记录初始人气，用于结算对比。
  characters.forEach(c => {
    initialPopularityMap[c.id] = c.popularity;
  });
  
  // Construct Game Events: Opening + 11 Random (Total 12 events for more depth)
  const shuffledPool = shuffleList(eventPool);
  gameEvents.value = [openingEvent, ...shuffledPool.slice(0, 11)];
  
  currentEventIndex.value = 0;
  eventHistory.length = 0;
  gameState.value = 'event';
  activeStudioPage.value = 'recording';
  selectedBondIds.value = [];
  recordingMode.value = 'BALANCE';
  executionIntensity.value = 2;
  budget.value = INITIAL_BUDGET;
  qteSuccessCount.value = 0;
  operationCards.value = SCreateCardHand();
  usedCardIds.value = new Set();
  cardFeedback.value = '';
  activeGoalIds.value = SCreateGameGoalIds();
  SResetStudioLedger(studioLedger);
  Object.keys(bondMap).forEach(key => delete bondMap[key]);
  SResetFanFactions(fanFactions);
  focusCharacterId.value = topCharacter.value?.id || '';
  settlementReportId.value = createReportId();
  
  triggerEventDanmaku();
  prepareEvent(false);
}

function prepareEvent(allowTrending = true) {
  selectedPair.value = [];
  isBreakingNews.value = false;
  resetQte();

  // 闄嶄綆鐑悳棰戠巼锛?0% 姒傜巼寮瑰嚭鐑悳
  if (allowTrending && Math.random() < 0.4) {
    generateTrendingTopic();
  }

  const canTriggerInterruption = currentEventIndex.value - lastInterruptionIndex.value >= 3;
  const isSudden = currentEventIndex.value > 1 && canTriggerInterruption && Math.random() < 0.32;

  if (isSudden) {
    lastInterruptionIndex.value = currentEventIndex.value;
    isBreakingNews.value = true;
    startQTE();
  }
  
  if (currentEvent.value?.type === 'RANKING' || currentEvent.value?.type === 'PICK_TWO') {
    rankingList.value = [...eventCandidates.value];
  }
}

function handleQteComplete(success: boolean, scenario: QTEScenario) {
  if (success) {
    const bonus = scenario.type === 'TIMING' ? 8 : 5;
    characters.forEach(c => c.popularity += bonus);
    fanFactions.groupFans += 5;
    fanFactions.publicFans += 4;
    addDanmaku('这就是制作人的实力。');
  } else {
    const penalty = 3;
    characters.forEach(c => c.popularity -= penalty);
    fanFactions.antiFans += 6;
    addDanmaku('刚才那段有点危险。');
  }
  SClampFanFactions(fanFactions);
  clampPopularity();
}

function nextEvent() {
  currentEventIndex.value++;
  if (currentEventIndex.value < gameEvents.value.length) {
    prepareEvent();
    gameState.value = 'event';
  } else {
    gameState.value = 'end';
    clearTrendingTopics();
    unlockAchievements();
  }
}

function unlockAchievements() {
  const newAchievementIds = SGetNewAchievementIds(achievementResults.value);
  if (!newAchievementIds.length) return;
  unlockedAchievementIds.value = new Set([...unlockedAchievementIds.value, ...newAchievementIds]);
  writeAchievementIds([...unlockedAchievementIds.value]);
}

// --- Event Handlers ---
function clampPopularity() {
  characters.forEach(c => {
    if (c.popularity > 100) c.popularity = 100;
    if (c.popularity < 0) c.popularity = 0;
  });
}

function triggerFeedback(result: string, effectTags: GameEffectTag[] = []) {
  const event = currentEvent.value;
  if (!event) return;
  const bond = SUpdateBondMap(bondMap, selectedPair.value);
  const bondBonus = SApplyBondBonus(selectedPair.value, bond);
  const finalResult = bondBonus ? `${result} ${bondBonus}` : result;
  SApplyFactionReaction(fanFactions, finalResult, event, effectTags);
  clampPopularity();

  // 记录历史。
  eventHistory.push({ event, result: finalResult });
  enqueueFollowUpEvent(event);
  
  // 识别受影响成员。
  const affectedIds = new Set<string>();
  characters.forEach(c => {
    if (finalResult.includes(c.name)) {
      affectedIds.add(c.id);
    }
  });
  // PICK_TWO 事件同时高亮选中的两位成员。
  if (selectedPair.value.length > 0) {
    selectedPair.value.forEach(c => affectedIds.add(c.id));
  }

  notifyToast(finalResult);
  highlightedCharIds.value = affectedIds;

  addDanmaku(`现场热报：${finalResult.slice(0, 20)}...`);

  // 短暂高亮后恢复。
  setTimeout(() => {
    highlightedCharIds.value = new Set();
    nextEvent();
  }, 1500);
}

function enqueueFollowUpEvent(event: GameEvent) {
  const followUpId = SGetFollowUpEventId(createEventChainContext(event));
  const followUpEvent = eventMap.value.get(followUpId);
  if (followUpEvent) SInsertFollowUpEvent(gameEvents.value, currentEventIndex.value, followUpEvent);
}

function createEventChainContext(event: GameEvent) {
  return {
    eventType: event.type,
    recordingMode: recordingMode.value,
    antiFans: fanFactions.antiFans,
    topBondValue: topBond.value?.value || 0,
    lowRankGrowth: getLowRankGrowth(),
  };
}

function handleChoice(choice: Choice) {
  const result = choice.action(characters);
  const controlResult = applyRecordingControls();
  clampPopularity();
  triggerFeedback(controlResult ? `${result} ${controlResult}` : result, choice.effectTags);
}

onUnmounted(() => {
  if (toastTimer) window.clearTimeout(toastTimer);
  clearDanmakuTimers();
  clearQteTimers();
  clearTrendingTimers();
});

onMounted(() => {
  savedGame.value = readGameSave();
  unlockedAchievementIds.value = new Set(readAchievementIds());
});

watch(
  () => saveSnapshot.value,
  () => saveCurrentGame(),
  { deep: true }
);

function applyRecordingControls() {
  const cost = executionIntensity.value * RECORDING_INTENSITY_COST;
  if (!spendBudget(cost)) return '录制参数预算不足，本轮只执行事件方案。';
  const focus = focusCharacter.value;
  SRecordRecordingRun(studioLedger, recordingMode.value, cost, focus.name);
  if (recordingMode.value === 'BALANCE') return applyBalanceMode();
  if (recordingMode.value === 'FOCUS') return applyFocusMode(focus);
  return applyDramaMode(focus);
}

function applyBalanceMode() {
  characters.filter(char => char.popularity < averagePopularity.value).forEach(applyBalanceBonus);
  fanFactions.groupFans += executionIntensity.value;
  return '录制模式「群像均衡」生效，低位成员获得补镜头。';
}

function applyFocusMode(focus: Character) {
  const traitBonus = SGetRecordingTraitBonus(focus, 'FOCUS') * executionIntensity.value;
  focus.popularity += executionIntensity.value * 2 + traitBonus;
  fanFactions.soloFans += executionIntensity.value;
  highlightedCharIds.value = new Set([focus.id]);
  return `镜头焦点锁定 ${focus.name}，个人高光额外放大。`;
}

function applyDramaMode(focus: Character) {
  const traitBonus = SGetRecordingTraitBonus(focus, 'DRAMA') * executionIntensity.value;
  focus.popularity += executionIntensity.value * 3 + traitBonus;
  fanFactions.publicFans += executionIntensity.value * 2;
  fanFactions.antiFans += getDramaAntiIncrease(focus);
  highlightedCharIds.value = new Set([focus.id]);
  return `抓马剪辑拉满，${focus.name} 讨论度暴涨，但争议声量也会上升。`;
}

function applyBalanceBonus(char: Character) {
  char.popularity += executionIntensity.value + SGetRecordingTraitBonus(char, 'BALANCE');
}

function getDramaAntiIncrease(focus: Character) {
  const baseIncrease = Math.max(1, executionIntensity.value - 1);
  return Math.max(0, baseIncrease - SGetDramaAntiReduction(focus));
}

function handlePickTwo() {
  if (currentEvent.value?.type !== 'PICK_TWO') return;
  if (selectedPair.value.length !== 2) return;
  const [char1, char2] = selectedPair.value;
  const result = currentEvent.value.choices.action(char1, char2, characters);
  clampPopularity();
  triggerFeedback(result);
}

function handleRanking() {
  if (currentEvent.value?.type !== 'RANKING') return;
  const result = currentEvent.value.choices.action(rankingList.value);
  clampPopularity();
  triggerFeedback(result);
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

function getBondValue(char1: Character, char2: Character) {
  return bondMap[SGetPairKey(char1, char2)]?.value || 0;
}

function handleBondProject(type: SBondProjectKey) {
  if (selectedBondCharacters.value.length !== 2) return showStudioFeedback('先选择两位成员，再开启双人企划。');
  const cost = BOND_PROJECT_BASE_COST[type] * bondProjectIntensity.value;
  if (!spendBudget(cost)) return showStudioFeedback('预算不足，双人企划排不上日程。');
  SRecordBondProject(studioLedger, type, cost, selectedBondCharacters.value.map(char => char.name).join(' × '));
  applyBondProject(type, selectedBondCharacters.value);
}

function applyBondProject(type: SBondProjectKey, pair: Character[]) {
  const bond = SUpdateBondMap(bondMap, pair);
  const traitBonus = SGetBondTraitBonus(pair, type);
  const bonus = ((type === 'STAGE' ? 3 : 2) + traitBonus) * bondProjectIntensity.value;
  if (bond) bond.value = Math.min(100, bond.value + traitBonus * 4);
  pair.forEach(char => char.popularity += bonus);
  fanFactions.cpFans += (type === 'LIVE' ? 5 : 3) * bondProjectIntensity.value;
  SClampFanFactions(fanFactions);
  clampPopularity();
  showStudioFeedback(`${pair[0].name} × ${pair[1].name} 企划推进，羁绊升至 ${bond?.value || 0}。`);
}

function handleReportAction(type: SReportActionKey) {
  const cost = type === 'TOP' ? 14000 : 10000;
  if (!spendBudget(cost)) return showStudioFeedback('预算不足，策略会先暂停。');
  SRecordReportAction(studioLedger, type, cost);
  applyReportAction(type);
  SClampFanFactions(fanFactions);
  clampPopularity();
}

function applyReportAction(type: SReportActionKey) {
  if (type === 'BALANCE') characters.filter(char => char.popularity < averagePopularity.value).forEach(char => char.popularity += 4);
  if (type === 'TOP') eventCandidates.value.slice(0, 3).forEach(char => char.popularity += 4);
  if (type === 'CLEAN') fanFactions.antiFans -= 8;
  showStudioFeedback(type === 'BALANCE' ? '补短板会议完成，低位成员获得额外镜头。' : type === 'TOP' ? 'TOP 资源包加码，前三人气继续冲高。' : '舆情复盘完成，黑粉声量下降。');
}

function handleSharePoster() {
  isGeneratingPoster.value = true;
  SDownloadSharePoster({
    title: producerTitle.value.name,
    grade: producerTitle.value.grade,
    topCharacters: sortedCharacters.value,
    factions: fanFactions,
    topBond: topBond.value,
  });
  setTimeout(() => isGeneratingPoster.value = false, 400);
}

// --- Settlement Logic ---
const producerTitle = computed<ProducerTitle>(() => {
  const avgPopularity = averagePopularity.value;
  const gap = topCharacter.value.popularity - bottomCharacter.value.popularity;

  let grade = 'C';
  let gradeColor = '#94a3b8';
  if (avgPopularity > 95) { grade = 'SSS'; gradeColor = '#fbbf24'; }
  else if (avgPopularity > 90) { grade = 'S'; gradeColor = '#fb7185'; }
  else if (avgPopularity > 85) { grade = 'A'; gradeColor = '#22c55e'; }
  else if (avgPopularity > 75) { grade = 'B'; gradeColor = '#60a5fa'; }

  let title = '合格制作人';
  let color = '#38bdf8';
  if (avgPopularity > 98) { title = '内娱救世主'; color = '#fbbf24'; }
  else if (avgPopularity > 92 && gap < 20) { title = '群像端水大师'; color = '#22c55e'; }
  else if (avgPopularity > 92) { title = '金牌幕后推手'; color = '#fb7185'; }
  else if (gap > 45) { title = '断层剧本专家'; color = '#a78bfa'; }
  else if (avgPopularity > 85) { title = '资深行业总监'; color = '#38bdf8'; }
  else if (avgPopularity < 60) { title = '糊团拯救失败者'; color = '#64748b'; }
  else if (avgPopularity < 75) { title = '平稳运营助理'; color = '#94a3b8'; }

  return { name: title, color, grade, gradeColor };
});

const producerAnalysis = computed<ProducerAnalysisItem[]>(() => {
  const avgPopularity = averagePopularity.value;
  const top = topCharacter.value;
  const bottom = bottomCharacter.value;
  const gap = top.popularity - bottom.popularity;
  const usedBudget = INITIAL_BUDGET - budget.value;
  const analysis: ProducerAnalysisItem[] = [];

  if (gap > 40) {
    analysis.push({ label: '核心策略', value: '单核驱动', detail: `资源明显集中在 ${top.name} 身上，爆点更强，但队伍生态更容易失衡。` });
  } else if (gap < 18) {
    analysis.push({ label: '核心策略', value: '群像共振', detail: '成员差距被控制在健康范围内，团体感和持续运营空间更好。' });
  } else {
    analysis.push({ label: '核心策略', value: '阶梯递进', detail: '主次分明且全员在线，适合继续做长期内容运营。' });
  }

  const riskyChoices = eventHistory.filter(h => h.result.includes('豪赌') || h.result.includes('翻车') || h.result.includes('失败') || h.result.includes('争议'));
  analysis.push({ label: '风险偏好', value: riskyChoices.length > 2 ? '激进冒险' : '审慎决策', detail: riskyChoices.length > 2 ? '你偏爱高风险高回报的抓马打法，热度强但舆情波动也大。' : '你的选择更偏稳健，能够降低试错成本。' });

  if (usedBudget > 80000) {
    analysis.push({ label: '公关投入', value: '重金砸榜', detail: '预算投入非常积极，短期热度强，但后续需要关注回报效率。' });
  } else if (usedBudget < 20000) {
    analysis.push({ label: '公关投入', value: '低成本操盘', detail: '你更多依赖内容和事件自然发酵，财务健康度很高。' });
  } else {
    analysis.push({ label: '公关投入', value: '精算平衡', detail: '预算使用节制且精准，关键节点有投入，整体风险可控。' });
  }

  if (avgPopularity > 88) {
    analysis.push({ label: '国民认可', value: '全网入坑', detail: '平均人气已经进入高位，具备进一步破圈传播的基础。' });
  } else if (avgPopularity < 70) {
    analysis.push({ label: '国民认可', value: '垂直圈地', detail: '当前热度仍偏核心粉圈，需要更强的破圈事件。' });
  }

  analysis.push({ label: '粉丝生态', value: fanFactionSummary.value, detail: `本局最强讨论盘是「${fanFactionSummary.value}」。团粉 ${fanFactions.groupFans}，唯粉 ${fanFactions.soloFans}，CP 粉 ${fanFactions.cpFans}，路人盘 ${fanFactions.publicFans}，黑粉声量 ${fanFactions.antiFans}。` });

  if (topBond.value) {
    analysis.push({ label: '化学反应', value: topBond.value.names, detail: `这组羁绊值达到 ${topBond.value.value}，已经具备继续开发双人舞台、花絮或综艺搭档的潜力。` });
  }

  return analysis;
});

const producerMedals = computed<ProducerMedal[]>(() => {
  const medals: ProducerMedal[] = [];
  const avgPopularity = averagePopularity.value;
  const usedBudget = INITIAL_BUDGET - budget.value;
  const totalGrowth = characters.reduce((acc, c) => acc + (c.popularity - initialPopularityMap[c.id]), 0);

  if (avgPopularity > 90) medals.push({ icon: 'TOP', title: '收视神话', desc: '全员人气爆发' });
  if (usedBudget < 10000) medals.push({ icon: 'SAVE', title: '小本经营', desc: '极低成本操盘' });
  if (usedBudget > 90000) medals.push({ icon: 'PR', title: '豪门推手', desc: '公关费用拉满' });
  if (totalGrowth > 50) medals.push({ icon: 'UP', title: '人气推手', desc: '成员大幅增粉' });
  if (qteSuccessCount.value >= 3) medals.push({ icon: 'LIVE', title: '临场专家', desc: '突发事件处理优秀' });
  if (fanFactions.groupFans > 80) medals.push({ icon: 'TEAM', title: '团魂操盘手', desc: '团粉盘大爆发' });
  if (fanFactions.cpFans > 70) medals.push({ icon: 'PAIR', title: '化学反应大师', desc: 'CP 讨论破圈' });
  if (topBond.value?.value && topBond.value.value > 70) medals.push({ icon: 'DUO', title: '双人叙事导演', desc: '羁绊线拉满' });
  if (studioClosure.value.every(item => item.actions > 0)) medals.push({ icon: 'OPS', title: '全链路制作人', desc: '四个工作台都形成闭环' });

  if (completedGameGoalCount.value >= 3) {
    medals.push({ icon: 'GOAL', title: '目标全清', desc: '本局制作目标全部完成' });
  }

  return medals;
});

</script>

<template>
  <div class="container" :class="{ 'reduce-motion': reduceMotion }">
    <VcHomeView
      v-if="gameState === 'home'"
      :hero-characters="heroCharacters"
      :reversed-hero-characters="reversedHeroCharacters"
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
      @enter-roster="gameState = 'roster'"
      @discard-saved-game="discardSavedGame"
      @back-home="gameState = 'home'"
    />

    <VcRosterView
      v-if="gameState === 'roster'"
      :characters="characters"
      :average-popularity="averagePopularity"
      @randomize-popularity="randomizePopularity"
      @start-game="startGame"
      @adjust-popularity="adjustCharacterPopularity"
    />

    <!-- 2. Event Screen -->
    <div v-if="gameState === 'event' && currentEvent" class="game-view">
      <div class="ambient-bg-event">
        <div class="glow-sphere-event"></div>
      </div>
      <div class="producer-status-line">
        <span class="status-indicator">直播中</span>
        <span class="status-text">当前环节: {{ currentEvent.title }}</span>
      </div>
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
        :budget="budget"
        :has-trending="isAnyTrending"
        :show-danmaku="showDanmaku"
        :reduce-motion="reduceMotion"
        @toggle-dashboard="togglePopularityDashboard"
        @toggle-danmaku="toggleDanmaku"
        @toggle-reduce-motion="toggleReduceMotion"
      />

      <VcStudioNav :active-studio-page="activeStudioPage" @change-page="setActiveStudioPage" />
      <VcGameGoalsPanel :goals="gameGoalResults" />
      <VcFanWorkspace
        v-if="activeStudioPage === 'fans'"
        :fan-factions="fanFactions"
        :fan-operation-intensity="fanOperationIntensity"
        :fan-program-base-cost="FAN_PROGRAM_BASE_COST"
        :operation-cards="operationCards"
        :used-card-ids="usedCardIds"
        :budget="budget"
        :card-feedback="cardFeedback"
        @change-intensity="changeFanOperationIntensity"
        @set-intensity="setFanOperationIntensity"
        @run-program="handleFanProgram"
        @use-card="handleUseCard"
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
        v-if="activeStudioPage === 'report'"
        :average-popularity="averagePopularity"
        :fan-faction-summary="fanFactionSummary"
        :budget="budget"
        :top-bond="topBond"
        :studio-total-spend="studioTotalSpend"
        :studio-closure="studioClosure"
        :studio-ledger="studioLedger"
        :sorted-characters="sortedCharacters"
        @run-report-action="handleReportAction"
      />

      <VcTrendingManager
        :topics="trendingQueue"
        :budget="budget"
        @ignore-topic="handleIgnoreTrending"
        @handle-topic="handleTrending"
      />

      <div v-if="activeStudioPage === 'recording'" class="event-layout">
        <VcPopularityDashboard
          :show="showPopularityDashboard"
          :sorted-characters="sortedCharacters"
          :top-character="topCharacter"
          :highlighted-char-ids="highlightedCharIds"
          :trending-queue="trendingQueue"
          :budget="budget"
          :support-cost="HEART_SUPPORT_COST"
          @close="closePopularityDashboard"
          @support-character="handleHeartClick"
        />

        <VcLiveCockpit
          :recording-mode="recordingMode"
          :focus-character="focusCharacter"
          :event-candidates="eventCandidates"
          :focus-character-id="focusCharacterId"
          :execution-intensity="executionIntensity"
          :recording-intensity-cost="RECORDING_INTENSITY_COST"
          @select-focus="setFocusCharacter"
          @set-recording-mode="setRecordingMode"
          @change-intensity="changeExecutionIntensity"
          @set-intensity="setExecutionIntensity"
        />

        <VcEventStage
          :is-breaking-news="isBreakingNews"
          :current-event-index="currentEventIndex"
          :total-events="gameEvents.length"
          :title="currentEvent.title"
          :description="processedDescription"
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

    <VcToastHint :show="showToast" :message="toastMessage" />

    <VcSettlementView
      v-if="gameState === 'end'"
      :producer-title="producerTitle"
      :settlement-report-id="settlementReportId"
      :producer-medals="producerMedals"
      :game-goals="gameGoalResults"
      :achievements="settlementAchievements"
      :studio-closure="studioClosure"
      :producer-analysis="producerAnalysis"
      :event-history="eventHistory"
      :is-history-expanded="isHistoryExpanded"
      :sorted-characters="sortedCharacters"
      :initial-popularity-map="initialPopularityMap"
      :is-generating-poster="isGeneratingPoster"
      @toggle-history="toggleHistoryExpanded"
      @share-poster="handleSharePoster"
      @restart="restartToRoster"
    />

  </div>
</template>
