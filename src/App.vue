<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { characters as initialCharacters, Character } from './data/characters';
import { openingEvent, eventPool, GameEvent, Choice } from './data/events';
import draggable from 'vuedraggable';
import type { SBondPair } from './baseLib/serviceLib/type/SBondPair';
import type { SFanFactionState } from './baseLib/serviceLib/type/SFanFactionState';
import type { SOperationCard } from './baseLib/serviceLib/type/SOperationCard';
import type { SStudioLedger } from './baseLib/serviceLib/type/SStudioLedger';
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

onMounted(() => {
  console.log('Draggable component:', draggable);
});

// --- Reactive State ---
const gameState = ref('home'); // home, roster, event, end
const characters = reactive<Character[]>(
  JSON.parse(JSON.stringify(initialCharacters)).sort((a: Character, b: Character) => a.name.localeCompare(b.name, 'zh-CN'))
);
const initialPopularityMap = reactive<Record<string, number>>({});
const eventHistory: { event: GameEvent, result: string }[] = reactive([]);
const gameEvents = ref<GameEvent[]>([]);
const currentEventIndex = ref(0);
const toastMessage = ref('');
const showToast = ref(false);
const highlightedCharIds = ref<Set<string>>(new Set());
const isBreakingNews = ref(false);
const showAlert = ref(false);
const budget = ref(100000); // 初始公关预算
const trendingQueue = ref<{ id: string, name: string, type: 'POSITIVE' | 'NEGATIVE', cost: number, timeLeft: number }[]>([]);
const qteActive = ref(false);
const qteType = ref<'MASH' | 'HOLD' | 'TIMING' | null>(null);
const qteValue = ref(0);
const qteTarget = ref(0);
const qteResult = ref<string | null>(null);
const qteSuccessCount = ref(0);
const lastInterruptionIndex = ref(-1);
const showDanmaku = ref(true);
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
const studioLedger = reactive<SStudioLedger>(SCreateStudioLedger());
type StudioPage = 'recording' | 'fans' | 'bonds' | 'report';
const activeStudioPage = ref<StudioPage>('recording');
const selectedBondIds = ref<string[]>([]);
type RecordingMode = 'BALANCE' | 'FOCUS' | 'DRAMA';
const recordingMode = ref<RecordingMode>('BALANCE');
const focusCharacterId = ref('');
const executionIntensity = ref(2);
const fanOperationIntensity = ref(2);
const bondProjectIntensity = ref(2);
const MAX_OPERATION_LEVEL = 4;
const RECORDING_INTENSITY_COST = 2500;
const HEART_SUPPORT_COST = 5000;
const FAN_PROGRAM_BASE_COST = {
  GROUP: 6000,
  SOLO: 4500,
  CP: 5000,
  PUBLIC: 7500,
  ANTI: 9000,
} as const;
const BOND_PROJECT_BASE_COST = {
  STAGE: 8000,
  LIVE: 5500,
  VLOG: 5500,
} as const;

interface QTEScenario {
  title: string;
  desc: string;
  type: 'MASH' | 'HOLD' | 'TIMING';
  icon: string;
  successText: string;
  failText: string;
}

const qteScenarios: QTEScenario[] = [
  { 
    title: "设备故障", 
    desc: "舞台音响突然刺耳！快【连续点击】屏幕调整均衡器！", 
    type: 'MASH', 
    icon: '🔊',
    successText: "✅ 调整成功！音效完美衔接，全员人气 +5",
    failText: "❌ 调整失败... 观众被噪音惊扰，全员人气 -3"
  },
  { 
    title: "气氛降至冰点", 
    desc: "现场提问太抓马，快【长按屏幕】指挥后期加特效救场！", 
    type: 'HOLD', 
    icon: '🧊',
    successText: "✅ 救场成功！剪辑出神入化，全员人气 +5",
    failText: "❌ 救场失败... 场面一度十分僵硬，全员人气 -3"
  },
  { 
    title: "粉丝冲撞", 
    desc: "录制现场秩序混乱！快【连续点击】协助安保疏散！", 
    type: 'MASH', 
    icon: '🛡️',
    successText: "✅ 疏散成功！安全录制也是专业体现，全员人气 +5",
    failText: "❌ 疏散失败... 录制被迫中断，全员人气 -3"
  },
  { 
    title: "麦克风失灵", 
    desc: "主唱麦克风没声了！【长按屏幕】示意导播切换备用麦！", 
    type: 'HOLD', 
    icon: '🎙️',
    successText: "✅ 切换成功！神级临场反应，全员人气 +5",
    failText: "❌ 切换失败... 舞台出现了长达10秒的空白，全员人气 -3"
  },
  {
    title: "捕捉高光",
    desc: "绝美互动镜头！在指针进入【中心区】时点击屏幕捕捉！",
    type: 'TIMING',
    icon: '📸',
    successText: "✅ 捕捉成功！神级运镜喜提百万直拍，全员人气 +8",
    failText: "❌ 捕捉失败... 错失高光时刻，全员人气 -2"
  }
];

const currentQTEScenario = ref<QTEScenario | null>(null);
const timingDirection = ref(1); // For TIMING type
const showPopularityDashboard = ref(false);

const danmakus = ref<{ id: number, text: string, top: number, speed: number }[]>([]);
let danmakuId = 0;

// For PICK_TWO event
const selectedPair = ref<Character[]>([]);

// Candidates for the current event (Top 5 by popularity)
const eventCandidates = computed(() => {
  return [...characters].sort((a, b) => b.popularity - a.popularity).slice(0, 5);
});

// For RANKING event
const rankingList = ref<Character[]>([]);

// --- Computed Properties ---
const currentEvent = computed(() => gameEvents.value[currentEventIndex.value] || null);

// Helper to fix image loading issues with Chinese characters and optimization
function getImageUrl(url: string) {
  if (!url) return '';
  // Ensure the URL is properly encoded for the browser
  return encodeURI(url);
}

const processedDescription = computed(() => {
  if (!currentEvent.value) return '';
  let desc = currentEvent.value.description;
  if (desc.includes('${random_char}')) {
    const topChar = [...characters].sort((a, b) => b.popularity - a.popularity)[0];
    desc = desc.replace('${random_char}', topChar.name);
  }
  return desc;
});

const sortedCharacters = computed(() => {
  return [...characters].sort((a, b) => b.popularity - a.popularity);
});

const isAnyTrending = computed(() => {
  return trendingQueue.value.length > 0;
});

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

const bondCandidateList = computed(() => {
  return [...characters].sort((a, b) => b.popularity - a.popularity).slice(0, 8);
});

const averagePopularity = computed(() => {
  return Math.round(characters.reduce((sum, char) => sum + char.popularity, 0) / characters.length);
});

const focusCharacter = computed(() => {
  return characters.find(char => char.id === focusCharacterId.value) || sortedCharacters.value[0];
});

const studioClosure = computed(() => {
  return SGetStudioClosure(studioLedger, averagePopularity.value, fanFactionSummary.value, topBond.value);
});

const studioTotalSpend = computed(() => {
  return SGetTotalSpend(studioLedger);
});

function changeExecutionIntensity(delta: number) {
  executionIntensity.value = clampLevel(executionIntensity.value + delta);
}

function changeFanOperationIntensity(delta: number) {
  fanOperationIntensity.value = clampLevel(fanOperationIntensity.value + delta);
}

function changeBondProjectIntensity(delta: number) {
  bondProjectIntensity.value = clampLevel(bondProjectIntensity.value + delta);
}

function clampLevel(value: number) {
  return Math.max(1, Math.min(MAX_OPERATION_LEVEL, value));
}

const directiveTypes = ['稳盘控场', '高光押注', '舆情反打', '粉圈运营'];
const directiveTargets = ['路人盘', '团粉盘', '唯粉盘', 'CP粉'];

function getDirectiveType(index: number) {
  return directiveTypes[index % directiveTypes.length];
}

function getDirectiveCost(index: number) {
  return [8000, 16000, 24000, 12000][index % 4];
}

function getDirectiveRisk(index: number) {
  return [28, 62, 84, 45][index % 4];
}

function getDirectiveTarget(index: number) {
  return directiveTargets[index % directiveTargets.length];
}

// --- Danmaku Logic ---
function addDanmaku(text: string) {
  const id = danmakuId++;
  const top = Math.random() * 60 + 5; // 5% to 65%
  const speed = Math.random() * 8 + 12; // 12s to 20s (更慢的速度)
  danmakus.value.push({ id, text, top, speed });
  setTimeout(() => {
    danmakus.value = danmakus.value.filter(d => d.id !== id);
  }, speed * 1000);
}

const danmakuTemplates = [
  "给 ${name} 递麦，这嗓音绝了！",
  "卧槽，刚才那个反转，制作人是天才吧？",
  "${name} 这波稳了，核心位预定！",
  "路人表示被 ${name} 圈粉了，少年感拉满",
  "节目组又在搞事情了，但我好爱看",
  "救命，这个团真的好抓马，这就是内娱吗",
  "只有我觉得 ${name} 这次很可怜吗？抱抱",
  "Center 席位非 ${name} 莫属，不接受反驳",
  "这个运营策略绝了，完全长在我的审美点上",
  "别管了，我要pick ${name}，入股不亏",
  "品牌方快看过来，${name} 这种高级感真的少见",
  "这种全员均衡的团在内娱真的能火吗？有点担心",
  "看到 ${name} 逆袭，我真的哭死，这就是养成系的魅力吧",
  "公关速度好评，公司这次终于干活了",
  "刚才那个舞台消音，${name} 真的打脸了所有黑粉",
  "虽然 ${name} 镜头少，但真的每一个画面都惊艳",
  "这个团综录制真的不是在拍连续剧吗？太刺激了",
  "制作人这波操作，我愿称之为内娱最强操盘",
  "${name} 的私服好想求链接啊，衣品太在线了",
  "求求了，让 ${name} 多出来营业吧，这种颜值不火天理难容"
];

function triggerEventDanmaku() {
  const interval = setInterval(() => {
    if (gameState.value !== 'event') {
      clearInterval(interval);
      return;
    }
    const template = danmakuTemplates[Math.floor(Math.random() * danmakuTemplates.length)];
    const randomChar = characters[Math.floor(Math.random() * characters.length)];
    addDanmaku(template.replace('${name}', randomChar.name));
  }, 1500);
}

// --- Hot Search Logic ---
function generateTrendingTopic() {
  if (gameState.value !== 'event' || trendingQueue.value.length >= 3) return;
  
  const randomChar = characters[Math.floor(Math.random() * characters.length)];
  const isPositive = Math.random() > 0.4;
  const cost = isPositive ? 20000 : 35000;
  
  const topic = reactive({
    id: Math.random().toString(36).substr(2, 9),
    name: randomChar.name,
    type: isPositive ? 'POSITIVE' as const : 'NEGATIVE' as const,
    cost,
    timeLeft: 100 // 100%
  });
  
  trendingQueue.value.push(topic);
  
  const duration = 10000; // 10 seconds
  const interval = 100;
  const step = (interval / duration) * 100;
  
  const timer = setInterval(() => {
    topic.timeLeft -= step;
    if (topic.timeLeft <= 0 || gameState.value !== 'event') {
      clearInterval(timer);
      if (trendingQueue.value.includes(topic)) {
        // 如果没处理且是负面，扣分
        if (topic.type === 'NEGATIVE') {
          const char = characters.find(c => c.name === topic.name);
          if (char) char.popularity -= 8;
          addDanmaku(`📉 舆论失控！${topic.name} 的负面话题已在全网发酵。`);
        }
        trendingQueue.value = trendingQueue.value.filter(t => t.id !== topic.id);
      }
    }
  }, interval);
}

function handleTrending(topicId: string, action: 'BUY' | 'KILL') {
  const topic = trendingQueue.value.find(t => t.id === topicId);
  if (!topic) return;

  if (budget.value < topic.cost) {
    toastMessage.value = `❌ 预算不足！处理该热搜需要 ¥${topic.cost.toLocaleString()}`;
    showToast.value = true;
    setTimeout(() => showToast.value = false, 1500);
    return;
  }

  budget.value -= topic.cost;
  const char = characters.find(c => c.name === topic.name);
  
  if (char) {
    if (action === 'BUY' && topic.type === 'POSITIVE') {
      char.popularity += 15;
      addDanmaku(`🚀 氪金成功！${char.name} 喜提热搜高位！`);
    } else if (action === 'KILL' && topic.type === 'NEGATIVE') {
      char.popularity += 5; // 成功压制负面也算功劳
      addDanmaku(`🛡️ 预算到位！${char.name} 的黑料已被公关封杀。`);
    }
  }

  trendingQueue.value = trendingQueue.value.filter(t => t.id !== topicId);
}

function handleIgnoreTrending(topicId: string) {
  trendingQueue.value = trendingQueue.value.filter(t => t.id !== topicId);
}

function handleHeartClick(char: Character) {
  const cost = HEART_SUPPORT_COST;
  if (budget.value < cost) {
    toastMessage.value = `❌ 预算不足！应援需要 ¥${cost.toLocaleString()}`;
    showToast.value = true;
    setTimeout(() => showToast.value = false, 1500);
    return;
  }
  
  budget.value -= cost;
  SRecordFanSupport(studioLedger, cost, char.name);
  char.popularity += 2;
  fanFactions.soloFans += 2;
  fanFactions.antiFans += 1;
  SClampFanFactions(fanFactions);
  clampPopularity();
  addDanmaku(`💖 粉丝豪掷金金！为 ${char.name} 疯狂应援！`);
}

function handleUseCard(card: SOperationCard) {
  if (usedCardIds.value.has(card.id) || budget.value < card.cost) return;
  budget.value -= card.cost;
  SRecordOperationCard(studioLedger, card.cost, card.name);
  cardFeedback.value = card.apply(characters, fanFactions);
  usedCardIds.value = new Set([...usedCardIds.value, card.id]);
  SClampFanFactions(fanFactions);
  clampPopularity();
  addDanmaku(`🃏 制作人打出「${card.name}」：${cardFeedback.value}`);
}

function spendBudget(cost: number) {
  if (budget.value < cost) return false;
  budget.value -= cost;
  return true;
}

function showStudioFeedback(message: string) {
  toastMessage.value = message;
  showToast.value = true;
  addDanmaku(`📡 工作台更新：${message}`);
  setTimeout(() => showToast.value = false, 1800);
}

function handleFanProgram(type: 'GROUP' | 'SOLO' | 'CP' | 'PUBLIC' | 'ANTI') {
  const cost = FAN_PROGRAM_BASE_COST[type] * fanOperationIntensity.value;
  if (!spendBudget(cost)) return showStudioFeedback('预算不够，粉丝运营方案暂时搁置。');
  SRecordFanProgram(studioLedger, type, cost);
  applyFanProgram(type);
  SClampFanFactions(fanFactions);
  clampPopularity();
}

function applyFanProgram(type: 'GROUP' | 'SOLO' | 'CP' | 'PUBLIC' | 'ANTI') {
  const messages = {
    GROUP: '团建物料上线，团粉盘 +10，全员人气 +2。',
    SOLO: '单人直拍投放，唯粉盘 +9，TOP 成员人气 +5。',
    CP: '双人花絮释出，CP 粉 +11，但黑粉声量 +2。',
    PUBLIC: '路人向切片铺开，路人盘 +12，低位成员人气 +3。',
    ANTI: '反黑组联动，黑粉声量 -12，公关口碑回稳。',
  };
  runFanEffect(type);
  showStudioFeedback(messages[type]);
}

function runFanEffect(type: 'GROUP' | 'SOLO' | 'CP' | 'PUBLIC' | 'ANTI') {
  const power = fanOperationIntensity.value;
  if (type === 'GROUP') { fanFactions.groupFans += 5 * power; characters.forEach(char => char.popularity += power); }
  if (type === 'SOLO') { fanFactions.soloFans += 5 * power; sortedCharacters.value[0].popularity += 3 * power; }
  if (type === 'CP') { fanFactions.cpFans += 6 * power; fanFactions.antiFans += power; }
  if (type === 'PUBLIC') { fanFactions.publicFans += 6 * power; characters.filter(char => char.popularity < 78).forEach(char => char.popularity += power); }
  if (type === 'ANTI') { fanFactions.antiFans -= 6 * power; fanFactions.publicFans += power; }
}

// --- Game Flow Methods ---
function randomizePopularity() {
  characters.forEach(c => {
    c.popularity = Math.floor(Math.random() * 41) + 60; // 60-100 随机
  });
}

function startGame() {
  // 记录初始人气，用于结果对比
  characters.forEach(c => {
    initialPopularityMap[c.id] = c.popularity;
  });
  
  // Construct Game Events: Opening + 11 Random (Total 12 events for more depth)
  const shuffledPool = [...eventPool].sort(() => Math.random() - 0.5);
  gameEvents.value = [openingEvent, ...shuffledPool.slice(0, 11)];
  
  currentEventIndex.value = 0;
  eventHistory.length = 0;
  gameState.value = 'event';
  activeStudioPage.value = 'recording';
  selectedBondIds.value = [];
  recordingMode.value = 'BALANCE';
  executionIntensity.value = 2;
  budget.value = 100000; // 重置预算
  qteSuccessCount.value = 0;
  operationCards.value = SCreateCardHand();
  usedCardIds.value = new Set();
  cardFeedback.value = '';
  SResetStudioLedger(studioLedger);
  Object.keys(bondMap).forEach(key => delete bondMap[key]);
  SResetFanFactions(fanFactions);
  focusCharacterId.value = sortedCharacters.value[0]?.id || '';
  
  triggerEventDanmaku();
  prepareEvent();
}

function prepareEvent() {
  console.log('Current Event:', currentEvent.value);
  console.log('Event Candidates:', eventCandidates.value);
  selectedPair.value = [];
  isBreakingNews.value = false;
  qteActive.value = false;
  qteResult.value = null;

  // 降低热搜频率：40% 概率弹出热搜
  if (Math.random() < 0.4) {
    generateTrendingTopic();
  }

  // 逻辑穿插：确保紧急事件不会扎堆，至少间隔 2 个普通事件
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

function startQTE() {
  const scenario = qteScenarios[Math.floor(Math.random() * qteScenarios.length)];
  currentQTEScenario.value = scenario;
  qteType.value = scenario.type;
  qteActive.value = true;
  qteValue.value = 0;
  
  if (qteType.value === 'MASH') {
    qteTarget.value = 10;
  } else if (qteType.value === 'HOLD') {
    qteTarget.value = 2000;
  } else if (qteType.value === 'TIMING') {
    qteTarget.value = 100;
    qteValue.value = 0;
    startTimingLoop();
  }
}

let timingInterval: number | null = null;
function startTimingLoop() {
  timingDirection.value = 1;
  timingInterval = window.setInterval(() => {
    if (!qteActive.value || qteType.value !== 'TIMING') {
      clearInterval(timingInterval!);
      return;
    }
    qteValue.value += 4 * timingDirection.value;
    if (qteValue.value >= 100) timingDirection.value = -1;
    if (qteValue.value <= 0) timingDirection.value = 1;
  }, 30);
}

function handleTimingClick() {
  if (qteType.value !== 'TIMING' || !qteActive.value) return;
  // 目标区间是 40-60
  const success = qteValue.value >= 40 && qteValue.value <= 60;
  completeQTE(success);
}

function handleMash() {
  if (qteType.value !== 'MASH' || !qteActive.value) return;
  qteValue.value++;
  if (qteValue.value >= qteTarget.value) {
    completeQTE(true);
  }
}

let holdTimer: number | null = null;
function startHold() {
  if (qteType.value !== 'HOLD' || !qteActive.value) return;
  const start = Date.now();
  holdTimer = window.setInterval(() => {
    qteValue.value = Date.now() - start;
    if (qteValue.value >= qteTarget.value) {
      clearInterval(holdTimer!);
      completeQTE(true);
    }
  }, 50);
}

function stopHold() {
  if (holdTimer) {
    clearInterval(holdTimer);
    if (qteActive.value) {
      completeQTE(false);
    }
  }
}

function completeQTE(success: boolean) {
  qteActive.value = false;
  const scenario = currentQTEScenario.value;
  if (!scenario) return;

  if (success) {
    const bonus = scenario.type === 'TIMING' ? 8 : 5;
    characters.forEach(c => c.popularity += bonus);
    fanFactions.groupFans += 5;
    fanFactions.publicFans += 4;
    qteSuccessCount.value++;
    qteResult.value = scenario.successText;
    addDanmaku("这就是制作人的实力吗？瑞思拜！");
  } else {
    const penalty = 3;
    characters.forEach(c => c.popularity -= penalty);
    fanFactions.antiFans += 6;
    qteResult.value = scenario.failText;
    addDanmaku("救命，刚才那段真的好尬...");
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
    trendingQueue.value = []; // 清空热搜队列
  }
}

// --- Event Handlers ---
function clampPopularity() {
  characters.forEach(c => {
    if (c.popularity > 100) c.popularity = 100;
    if (c.popularity < 0) c.popularity = 0;
  });
}

function triggerFeedback(result: string) {
  const bond = SUpdateBondMap(bondMap, selectedPair.value);
  const bondBonus = SApplyBondBonus(selectedPair.value, bond);
  const finalResult = bondBonus ? `${result} ${bondBonus}` : result;
  SApplyFactionReaction(fanFactions, finalResult, currentEvent.value);
  clampPopularity();

  // 记录历史
  eventHistory.push({ event: currentEvent.value!, result: finalResult });
  
  // 识别受影响的成员 (通过简单的文本匹配或当前选中的成员)
  const affectedIds = new Set<string>();
  characters.forEach(c => {
    if (finalResult.includes(c.name)) {
      affectedIds.add(c.id);
    }
  });
  // 如果是 PICK_TWO，也高亮选中的两个人
  if (selectedPair.value.length > 0) {
    selectedPair.value.forEach(c => affectedIds.add(c.id));
  }

  // 显示提示和高亮
  toastMessage.value = finalResult;
  showToast.value = true;
  highlightedCharIds.value = affectedIds;

  // 增加即时反馈弹幕
  addDanmaku(`🔥 现场热报：${finalResult.slice(0, 20)}...`);

  // 缩短至 1.5s
  setTimeout(() => {
    showToast.value = false;
    highlightedCharIds.value = new Set();
    nextEvent();
  }, 1500);
}

function handleChoice(choice: Choice) {
  const result = choice.action(characters);
  const controlResult = applyRecordingControls();
  clampPopularity();
  triggerFeedback(controlResult ? `${result} ${controlResult}` : result);
}

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
  characters.filter(char => char.popularity < averagePopularity.value).forEach(char => char.popularity += executionIntensity.value);
  fanFactions.groupFans += executionIntensity.value;
  return `录制模式「群像平衡」生效，低位成员获得补镜头。`;
}

function applyFocusMode(focus: Character) {
  focus.popularity += executionIntensity.value * 2;
  fanFactions.soloFans += executionIntensity.value;
  highlightedCharIds.value = new Set([focus.id]);
  return `镜头焦点锁定 ${focus.name}，个人高光额外放大。`;
}

function applyDramaMode(focus: Character) {
  focus.popularity += executionIntensity.value * 3;
  fanFactions.publicFans += executionIntensity.value * 2;
  fanFactions.antiFans += Math.max(1, executionIntensity.value - 1);
  highlightedCharIds.value = new Set([focus.id]);
  return `抓马剪辑拉满，${focus.name} 讨论度暴涨，但黑粉也被引来。`;
}

function handlePickTwo() {
  if (selectedPair.value.length !== 2) return;
  const [char1, char2] = selectedPair.value;
  const result = currentEvent.value!.choices.action(char1, char2, characters);
  clampPopularity();
  triggerFeedback(result);
}

function handleRanking() {
  const result = currentEvent.value!.choices.action(rankingList.value);
  clampPopularity();
  triggerFeedback(result);
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

function isSelected(character: Character) {
  return selectedPair.value.some(c => c.id === character.id);
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

function handleBondProject(type: 'STAGE' | 'LIVE' | 'VLOG') {
  if (selectedBondCharacters.value.length !== 2) return showStudioFeedback('先选两位成员，再开双人企划。');
  const cost = BOND_PROJECT_BASE_COST[type] * bondProjectIntensity.value;
  if (!spendBudget(cost)) return showStudioFeedback('预算不够，双人企划排不上日程。');
  SRecordBondProject(studioLedger, type, cost, selectedBondCharacters.value.map(char => char.name).join(' × '));
  applyBondProject(type, selectedBondCharacters.value);
}

function applyBondProject(type: 'STAGE' | 'LIVE' | 'VLOG', pair: Character[]) {
  const bond = SUpdateBondMap(bondMap, pair);
  const bonus = (type === 'STAGE' ? 3 : 2) * bondProjectIntensity.value;
  pair.forEach(char => char.popularity += bonus);
  fanFactions.cpFans += (type === 'LIVE' ? 5 : 3) * bondProjectIntensity.value;
  SClampFanFactions(fanFactions);
  showStudioFeedback(`${pair[0].name} × ${pair[1].name} 企划推进，羁绊升至 ${bond?.value || 0}。`);
}

function handleReportAction(type: 'BALANCE' | 'TOP' | 'CLEAN') {
  const cost = type === 'TOP' ? 14000 : 10000;
  if (!spendBudget(cost)) return showStudioFeedback('预算不够，策略会先暂停。');
  SRecordReportAction(studioLedger, type, cost);
  applyReportAction(type);
  SClampFanFactions(fanFactions);
  clampPopularity();
}

function applyReportAction(type: 'BALANCE' | 'TOP' | 'CLEAN') {
  if (type === 'BALANCE') characters.filter(char => char.popularity < averagePopularity.value).forEach(char => char.popularity += 4);
  if (type === 'TOP') sortedCharacters.value.slice(0, 3).forEach(char => char.popularity += 4);
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
const producerTitle = computed(() => {
  const avgPopularity = characters.reduce((acc, c) => acc + c.popularity, 0) / characters.length;
  const topPopularity = sortedCharacters.value[0].popularity;
  const bottomPopularity = sortedCharacters.value[sortedCharacters.value.length - 1].popularity;
  const gap = topPopularity - bottomPopularity;

  let grade = 'C';
  let gradeColor = '#94a3b8';
  if (avgPopularity > 95) { grade = 'SSS'; gradeColor = '#FFD700'; }
  else if (avgPopularity > 90) { grade = 'S'; gradeColor = '#FF4500'; }
  else if (avgPopularity > 85) { grade = 'A'; gradeColor = '#5d54a4'; }
  else if (avgPopularity > 75) { grade = 'B'; gradeColor = '#4682B4'; }

  let title = "合格产品经理";
  let color = "#4682B4";

  if (avgPopularity > 98) { title = "内娱救世主"; color = "#FFD700"; }
  else if (avgPopularity > 92 && gap < 20) { title = "传奇端水大师"; color = "#00CED1"; }
  else if (avgPopularity > 92) { title = "金牌幕后推手"; color = "#FF4500"; }
  else if (gap > 45) { title = "断层剧本专家"; color = "#9400D3"; }
  else if (avgPopularity > 85) { title = "资深行业总监"; color = "#5d54a4"; }
  else if (avgPopularity < 60) { title = "糊团拯救失败者"; color = "#808080"; }
  else if (avgPopularity < 75) { title = "平庸运营助理"; color = "#A9A9A9"; }

  return { name: title, color, grade, gradeColor };
});

const producerAnalysis = computed(() => {
  const avgPopularity = characters.reduce((acc, c) => acc + c.popularity, 0) / characters.length;
  const top = sortedCharacters.value[0];
  const bottom = sortedCharacters.value[sortedCharacters.value.length - 1];
  const gap = top.popularity - bottom.popularity;
  const analysis = [];

  // 运营风格分析
  if (gap > 40) {
    analysis.push({ label: "核心策略", value: "单核驱动模式", detail: `你将资源高度集中在 ${top.name} 身上，这种“保一争全”的策略极具赌徒色彩。虽然制造了现象级流量，但也埋下了团队生态失衡的隐患。` });
  } else if (gap < 18) {
    analysis.push({ label: "核心策略", value: "群像共振模式", detail: "你拒绝制造人气断层，追求极致的平衡美学。这种运营方式让团队整体感极强，是打造“团魂”的最高级手段。" });
  } else {
    analysis.push({ label: "核心策略", value: "阶梯递进模式", detail: "你建立了一套健康的阶梯人气体系，主次分明且全员在线。这是目前市场上最具商业可持续性的运营模型。" });
  }

  // 风险偏好分析
  const riskyChoices = eventHistory.filter(h => h.result.includes("豪赌") || h.result.includes("翻车") || h.result.includes("车祸") || h.result.includes("逆袭"));
  if (riskyChoices.length > 2) {
    analysis.push({ label: "风险偏好", value: "激进冒险家", detail: "你热衷于制造反转和逆袭，不按常理出牌。虽然过程惊心动魄，但这种不确定性正是你作为制作人的独特魅力所在。" });
  } else {
    analysis.push({ label: "风险偏好", value: "审慎决策者", detail: "你的每一步都走得极其稳健，更倾向于基于基本盘做出最优解。这种风格极大地降低了团队的试错成本。" });
  }

  // 财务管理分析
  const usedBudget = 100000 - budget.value;
  if (usedBudget > 80000) {
    analysis.push({ label: "公关投入", value: "重金砸榜型", detail: "你在公关和热搜上的投入毫不吝啬。这种高投入虽然换来了瞬时的人气爆发，但也考验着项目的长期盈利能力。" });
  } else if (usedBudget < 20000) {
    analysis.push({ label: "公关投入", value: "零成本操盘", detail: "你几乎没有动用公关预算，完全依靠自然热度和舞台决策支撑人气。这显示了你对内容质量的极度自信。" });
  } else {
    analysis.push({ label: "公关投入", value: "精算平衡型", detail: "你对预算的使用非常节制且精准，每一分钱都花在了舆情的关键节点上，财务健康度极高。" });
  }

  // 国民度评定
  if (avgPopularity > 88) {
    analysis.push({ label: "国民认可", value: "全网入坑", detail: "你精准捕捉到了大众的审美红心。现在的他们已经不仅仅是偶像，更是全民讨论的文化符号。" });
  } else if (avgPopularity < 70) {
    analysis.push({ label: "国民认可", value: "垂直圈地", detail: "目前的人气仍集中在核心粉丝圈。你需要更多破圈级的抓马事件或跨界合作来打破壁垒。" });
  }

  analysis.push({ label: "粉丝生态", value: fanFactionSummary.value, detail: `本局最强势的讨论盘是「${fanFactionSummary.value}」。团粉 ${fanFactions.groupFans}，唯粉 ${fanFactions.soloFans}，CP 粉 ${fanFactions.cpFans}，路人盘 ${fanFactions.publicFans}，黑粉声量 ${fanFactions.antiFans}。` });

  if (topBond.value) {
    analysis.push({ label: "化学反应", value: topBond.value.names, detail: `这组羁绊值达到 ${topBond.value.value}，已经具备衍生双人舞台、CP 向物料或综艺搭档的潜力。` });
  }

  return analysis;
});

const producerMedals = computed(() => {
  const medals = [];
  const avgPopularity = characters.reduce((acc, c) => acc + c.popularity, 0) / characters.length;
  const usedBudget = 100000 - budget.value;
  
  if (avgPopularity > 90) medals.push({ icon: '🏆', title: '收视神话', desc: '全员人气爆发' });
  if (usedBudget < 10000) medals.push({ icon: '💡', title: '小本经营', desc: '极低成本操盘' });
  if (usedBudget > 90000) medals.push({ icon: '💎', title: '豪门推手', desc: '公关费尽其用' });
  
  const totalGrowth = characters.reduce((acc, c) => acc + (c.popularity - initialPopularityMap[c.id]), 0);
  if (totalGrowth > 50) medals.push({ icon: '📈', title: '人气推手', desc: '成员大幅增粉' });
  
  if (qteSuccessCount.value >= 3) medals.push({ icon: '⚡', title: '临场专家', desc: 'QTE无失误' });
  if (fanFactions.groupFans > 80) medals.push({ icon: '🤝', title: '团魂操盘手', desc: '团粉盘大爆发' });
  if (fanFactions.cpFans > 70) medals.push({ icon: '💞', title: '化学反应大师', desc: 'CP讨论破圈' });
  if (topBond.value?.value && topBond.value.value > 70) medals.push({ icon: '🎬', title: '双人叙事导演', desc: '羁绊线拉满' });
  if (studioClosure.value.every(item => item.actions > 0)) medals.push({ icon: '🧩', title: '全链路制作人', desc: '四个工作台都形成闭环' });

  return medals;
});

</script>

<template>
  <div class="container">
    <!-- 0. Landing Page (Ultimate Premium) -->
    <div v-if="gameState === 'home'" class="landing-view-ultimate">
      <!-- Ambient Background -->
      <div class="ambient-bg">
        <div class="glow-sphere glow-1"></div>
        <div class="glow-sphere glow-2"></div>
        <div class="glow-sphere glow-3"></div>
        <div class="mesh-grid"></div>
      </div>

      <!-- Hero Member Display (Dynamic & High-end) -->
      <div class="hero-showcase">
        <div class="showcase-track">
          <div v-for="char in [...characters, ...characters]" :key="'hero-' + char.id + Math.random()" class="showcase-item">
            <img :src="getImageUrl(char.image)" :alt="char.name" />
            <div class="showcase-overlay"></div>
            <div class="char-name-tag">{{ char.name }}</div>
          </div>
        </div>
        <div class="showcase-track reverse">
          <div v-for="char in [...characters, ...characters].reverse()" :key="'hero-rev-' + char.id + Math.random()" class="showcase-item">
            <img :src="getImageUrl(char.image)" :alt="char.name" />
            <div class="showcase-overlay"></div>
            <div class="char-name-tag">{{ char.name }}</div>
          </div>
        </div>
      </div>

      <div class="landing-main-content">
        <div class="brand-header">
          <div class="brand-line"></div>
          <span class="brand-text">顶级娱乐圈模拟系列</span>
          <div class="brand-line"></div>
        </div>

        <div class="title-wrapper">
          <h1 class="main-headline">
            <span class="word-top">项目</span>
            <span class="word-main">镜头法则</span>
            <span class="word-sub">首席制作人</span>
          </h1>
        </div>

        <div class="mission-box">
          <p class="tagline">“镜头的背后，是权力的博弈。”</p>
          <p class="description">
            在这里，你不仅是观众，更是掌控一切的<strong>首席制作人</strong>。
            通过精准的流量操盘与资源分配，定义新一代偶像的巅峰序列。
          </p>
          <div class="hero-stats-mini">
            <div class="h-stat">
              <span class="h-val">15</span>
              <span class="h-lbl">候选成员</span>
            </div>
            <div class="h-stat">
              <span class="h-val">专业</span>
              <span class="h-lbl">制作视角</span>
            </div>
            <div class="h-stat">
              <span class="h-val">∞</span>
              <span class="h-lbl">无限可能</span>
            </div>
          </div>
        </div>

        <div class="action-portal">
          <button @click="gameState = 'roster'" class="portal-btn">
            <div class="btn-background"></div>
            <div class="btn-content">
              <span class="btn-label">进入导播间</span>
              <span class="btn-sub">点击进入控制室</span>
            </div>
            <div class="btn-shimmer"></div>
          </button>
        </div>

        <div class="status-footer">
          <div class="footer-item">
            <span class="f-dot"></span>
            <span class="f-text">导演就绪</span>
          </div>
          <div class="footer-item">
            <span class="f-text">数据流运行中</span>
          </div>
          <div class="footer-item">
            <span class="f-text">© 2026 核心娱乐</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 1. Roster/Start Screen -->
    <div v-if="gameState === 'roster'" class="roster-view-refined">
      <!-- Animated Background Decorations -->
      <div class="roster-bg-decor circle-top"></div>
      <div class="roster-bg-decor circle-bottom"></div>
      <div class="mesh-grid"></div>
      
      <div class="roster-header-container">
        <div class="roster-hero-section-compact">
          <div class="hero-text-mini">
            <h1 class="hero-title-mini">制作人操盘中心</h1>
            <p class="hero-desc-mini">成员按姓名首字母排序。人气高低将决定后续环节</p>
          </div>
          
          <div class="hero-actions-mini">
            <button @click="randomizePopularity" class="mini-btn secondary">
              🎲 随机人气
            </button>
            <button @click="startGame" class="mini-btn primary">
              🎬 开始录制
            </button>
          </div>
        </div>

        <!-- Stats Bar -->
        <div class="roster-stats-bar">
          <div class="stat-item">
            <span class="stat-label">总成员</span>
            <span class="stat-value">{{ characters.length }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">平均人气</span>
            <span class="stat-value">{{ Math.round(characters.reduce((acc, c) => acc + c.popularity, 0) / characters.length) }}%</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">制作状态</span>
            <span class="stat-value pulse">READY</span>
          </div>
        </div>
      </div>

      <div class="roster-grid-section">
        <div class="roster-grid-refined">
          <div v-for="character in characters" :key="character.id" class="char-card-premium">
            <div class="char-frame">
              <div class="image-container">
                <img :src="getImageUrl(character.image)" :alt="character.name" class="main-img-fit" loading="lazy" />
                <div class="vignette-overlay"></div>
              </div>
            </div>

            <div class="char-info-overlay">
              <div class="char-name-premium">{{ character.name }}</div>
              <div class="char-role-mini">{{ character.personality || '练习生' }}</div>
            </div>

            <div class="char-controls-premium">
              <div class="pop-metrics">
                <span class="m-label">调节人气</span>
                <span class="m-value">{{ character.popularity }}%</span>
              </div>
              <div class="pop-adjuster-premium">
                <button @click="character.popularity = Math.max(0, character.popularity - 1)" class="adjust-btn minus">
                  <span class="icon">−</span>
                </button>
                <div class="progress-mini-track">
                  <div class="progress-mini-fill" :style="{ width: character.popularity + '%' }"></div>
                </div>
                <button @click="character.popularity = Math.min(100, character.popularity + 1)" class="adjust-btn plus">
                  <span class="icon">+</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="roster-footer-refined">
        <p>© 2026 偶像制作人模拟器 | 数据仅供娱乐模拟</p>
      </div>
    </div>

    <!-- 2. Event Screen -->
    <div v-if="gameState === 'event' && currentEvent" class="game-view">
      <div class="ambient-bg-event">
        <div class="glow-sphere-event"></div>
      </div>
      <div class="producer-status-line">
        <span class="status-indicator">直播中</span>
        <span class="status-text">当前环节: {{ currentEvent.title }}</span>
      </div>
      <!-- QTE Overlay -->
      <div v-if="qteActive || qteResult" class="qte-overlay">
        <div v-if="qteActive && currentQTEScenario" class="qte-modal">
          <div class="qte-icon">{{ currentQTEScenario.icon }}</div>
          <h2>{{ currentQTEScenario.title }}</h2>
          <p>{{ currentQTEScenario.desc }}</p>
          
          <!-- Interaction Area -->
          <div 
            class="qte-area" 
            :class="{ 'timing-mode': qteType === 'TIMING' }"
            @click="qteType === 'MASH' ? handleMash() : (qteType === 'TIMING' ? handleTimingClick() : null)" 
            @mousedown="qteType === 'HOLD' ? startHold() : null" 
            @mouseup="qteType === 'HOLD' ? stopHold() : null"
            @touchstart.prevent="qteType === 'MASH' ? handleMash() : (qteType === 'TIMING' ? handleTimingClick() : startHold())"
            @touchend.prevent="qteType === 'HOLD' ? stopHold() : null"
          >
            <!-- Normal Progress Bar (Mash/Hold) -->
            <div v-if="qteType !== 'TIMING'" class="qte-progress-bg">
              <div class="qte-progress-fill" :style="{ width: (qteValue / qteTarget) * 100 + '%' }"></div>
            </div>

            <!-- Timing Bar -->
            <div v-else class="timing-bar-container">
              <div class="timing-target-zone"></div>
              <div class="timing-pointer" :style="{ left: qteValue + '%' }"></div>
            </div>

            <div class="qte-hint">
              {{ qteType === 'MASH' ? '快点！点！点！' : (qteType === 'HOLD' ? '按住不要松手...' : '看准时机，点！') }}
            </div>
          </div>
        </div>

        <div v-if="qteResult" class="qte-result-modal">
          <div class="qte-result-text">{{ qteResult }}</div>
          <button @click="qteResult = null" class="alert-button">回到录制现场</button>
        </div>
      </div>

      <!-- Danmaku Layer -->
      <div v-if="showDanmaku" class="danmaku-container">
        <div v-for="d in danmakus" :key="d.id" 
             class="danmaku-item" 
             :style="{ top: d.top + '%', animationDuration: d.speed + 's' }">
          {{ d.text }}
        </div>
      </div>

      <!-- Top Control Bar -->
      <div class="control-bar">
        <div class="rec-indicator">
          <span class="rec-dot"></span>
          <span class="rec-text">现场录制中</span>
        </div>
        <div class="episode-tag">第 {{ currentEventIndex + 1 }} / {{ gameEvents.length }} 节</div>
        <div class="budget-display" :class="{ 'budget-low': budget < 30000 }">
          <span class="budget-label">公关预算</span>
          <span class="budget-value">¥{{ budget.toLocaleString() }}</span>
        </div>
        <div class="control-actions">
          <button 
            @click="showPopularityDashboard = !showPopularityDashboard" 
            class="top-dash-btn"
            :class="{ 'has-trending': isAnyTrending }"
          >
            <span class="btn-icon">📊</span>
            <span class="btn-text">人气看板</span>
            <span v-if="isAnyTrending" class="trending-dot"></span>
          </button>
          <button @click="showDanmaku = !showDanmaku" class="toggle-button" :class="{ 'off': !showDanmaku }">
            {{ showDanmaku ? '📺 弹幕: 开' : '📺 弹幕: 关' }}
          </button>
        </div>
      </div>

      <nav class="studio-nav" aria-label="制作人工作台">
        <button @click="activeStudioPage = 'recording'" :class="{ active: activeStudioPage === 'recording' }">录制现场</button>
        <button @click="activeStudioPage = 'fans'" :class="{ active: activeStudioPage === 'fans' }">粉丝运营</button>
        <button @click="activeStudioPage = 'bonds'" :class="{ active: activeStudioPage === 'bonds' }">羁绊企划</button>
        <button @click="activeStudioPage = 'report'" :class="{ active: activeStudioPage === 'report' }">数据报告</button>
      </nav>

      <section v-if="activeStudioPage === 'fans'" class="workspace-panel fans-workspace">
        <div class="workspace-head">
          <span class="workspace-kicker">FAN OPS</span>
          <h2>粉丝运营中心</h2>
          <p>选择不同运营方案，粉圈结构会真实改变，不再只是旁边的数字。</p>
        </div>
        <div class="faction-grid-large">
          <div class="faction-card group"><span>团粉盘</span><strong>{{ fanFactions.groupFans }}</strong></div>
          <div class="faction-card solo"><span>唯粉盘</span><strong>{{ fanFactions.soloFans }}</strong></div>
          <div class="faction-card cp"><span>CP 粉</span><strong>{{ fanFactions.cpFans }}</strong></div>
          <div class="faction-card public"><span>路人盘</span><strong>{{ fanFactions.publicFans }}</strong></div>
          <div class="faction-card anti"><span>黑粉声量</span><strong>{{ fanFactions.antiFans }}</strong></div>
        </div>
        <label class="workspace-slider">
          <span>投放强度 {{ fanOperationIntensity }} 档</span>
          <div class="range-stepper">
            <button type="button" @click="changeFanOperationIntensity(-1)">-</button>
            <input v-model.number="fanOperationIntensity" type="range" min="1" max="4" step="1" />
            <button type="button" @click="changeFanOperationIntensity(1)">+</button>
          </div>
        </label>
        <div class="workspace-actions">
          <button @click="handleFanProgram('GROUP')">团建物料 ¥{{ (FAN_PROGRAM_BASE_COST.GROUP * fanOperationIntensity).toLocaleString() }}</button>
          <button @click="handleFanProgram('SOLO')">单人直拍 ¥{{ (FAN_PROGRAM_BASE_COST.SOLO * fanOperationIntensity).toLocaleString() }}</button>
          <button @click="handleFanProgram('CP')">双人花絮 ¥{{ (FAN_PROGRAM_BASE_COST.CP * fanOperationIntensity).toLocaleString() }}</button>
          <button @click="handleFanProgram('PUBLIC')">路人切片 ¥{{ (FAN_PROGRAM_BASE_COST.PUBLIC * fanOperationIntensity).toLocaleString() }}</button>
          <button @click="handleFanProgram('ANTI')">反黑联动 ¥{{ (FAN_PROGRAM_BASE_COST.ANTI * fanOperationIntensity).toLocaleString() }}</button>
        </div>
        <div class="card-hand workspace-card-hand" aria-label="运营卡牌">
          <button
            v-for="card in operationCards"
            :key="card.id"
            class="operation-card"
            :class="[card.kind.toLowerCase(), { used: usedCardIds.has(card.id), locked: budget < card.cost }]"
            :disabled="usedCardIds.has(card.id) || budget < card.cost"
            @click="handleUseCard(card)"
          >
            <span class="card-name">{{ card.name }}</span>
            <span class="card-desc">{{ card.desc }}</span>
            <span class="card-cost">¥{{ card.cost.toLocaleString() }}</span>
          </button>
        </div>
        <p v-if="cardFeedback" class="card-feedback">{{ cardFeedback }}</p>
      </section>

      <section v-if="activeStudioPage === 'bonds'" class="workspace-panel bonds-workspace">
        <div class="workspace-head">
          <span class="workspace-kicker">PAIR PLAN</span>
          <h2>羁绊企划室</h2>
          <p>先选两位成员，再安排舞台、直播或 Vlog。羁绊会成长，并反过来影响双人事件。</p>
        </div>
        <div class="bond-candidate-grid">
          <button
            v-for="character in bondCandidateList"
            :key="character.id"
            class="bond-candidate"
            :class="{ selected: selectedBondIds.includes(character.id) }"
            @click="toggleBondCandidate(character)"
          >
            <img :src="getImageUrl(character.image)" :alt="character.name" />
            <span>{{ character.name }}</span>
            <small>{{ character.personality }}</small>
          </button>
        </div>
        <div class="bond-stage">
          <div class="bond-stage-title">
            {{ selectedBondCharacters.length === 2 ? `${selectedBondCharacters[0].name} × ${selectedBondCharacters[1].name}` : '请选择两位成员' }}
          </div>
          <div class="bond-score">
            当前羁绊 {{ selectedBondCharacters.length === 2 ? getBondValue(selectedBondCharacters[0], selectedBondCharacters[1]) : 0 }}
          </div>
          <label class="workspace-slider">
            <span>企划规格 {{ bondProjectIntensity }} 档</span>
            <div class="range-stepper">
              <button type="button" @click="changeBondProjectIntensity(-1)">-</button>
              <input v-model.number="bondProjectIntensity" type="range" min="1" max="4" step="1" />
              <button type="button" @click="changeBondProjectIntensity(1)">+</button>
            </div>
          </label>
          <div class="workspace-actions">
            <button @click="handleBondProject('STAGE')">合作舞台 ¥{{ (BOND_PROJECT_BASE_COST.STAGE * bondProjectIntensity).toLocaleString() }}</button>
            <button @click="handleBondProject('LIVE')">双人直播 ¥{{ (BOND_PROJECT_BASE_COST.LIVE * bondProjectIntensity).toLocaleString() }}</button>
            <button @click="handleBondProject('VLOG')">宿舍 Vlog ¥{{ (BOND_PROJECT_BASE_COST.VLOG * bondProjectIntensity).toLocaleString() }}</button>
          </div>
        </div>
        <p v-if="topBond" class="bond-ticker">当前最强羁绊：{{ topBond.names }} / {{ topBond.value }}</p>
      </section>

      <section v-if="activeStudioPage === 'report'" class="workspace-panel report-workspace">
        <div class="workspace-head">
          <span class="workspace-kicker">DATA ROOM</span>
          <h2>运营报告台</h2>
          <p>根据当前局势开策略会，直接修正队伍结构、资源分配和舆情风险。</p>
        </div>
        <div class="report-metrics">
          <div><span>平均人气</span><strong>{{ averagePopularity }}</strong></div>
          <div><span>最强粉圈</span><strong>{{ fanFactionSummary }}</strong></div>
          <div><span>剩余预算</span><strong>¥{{ budget.toLocaleString() }}</strong></div>
          <div><span>最强羁绊</span><strong>{{ topBond?.names || '未形成' }}</strong></div>
          <div><span>工作台投入</span><strong>¥{{ studioTotalSpend.toLocaleString() }}</strong></div>
        </div>
        <div class="closure-board compact">
          <div v-for="item in studioClosure" :key="item.key" class="closure-card" :class="item.key">
            <span>{{ item.title }}</span>
            <strong>{{ item.actions }} 次</strong>
            <small>¥{{ item.spend.toLocaleString() }} / {{ item.result }}</small>
          </div>
        </div>
        <div class="workspace-actions">
          <button @click="handleReportAction('BALANCE')">补短板会议 ¥10,000</button>
          <button @click="handleReportAction('TOP')">TOP 加码 ¥14,000</button>
          <button @click="handleReportAction('CLEAN')">舆情复盘 ¥10,000</button>
        </div>
        <p class="formula-note">
          计算口径：强度 1-4 档按基础成本和基础收益线性放大，成本越高越可控，但预算风险也更明显。
        </p>
        <div v-if="studioLedger.highlights.length" class="ledger-feed">
          <span v-for="item in studioLedger.highlights" :key="item">{{ item }}</span>
        </div>
        <div class="mini-ranking-board">
          <div v-for="(char, index) in sortedCharacters.slice(0, 6)" :key="char.id">
            <span>{{ index + 1 }}. {{ char.name }}</span>
            <strong>{{ char.popularity }}</strong>
          </div>
        </div>
      </section>

      <!-- Trending Management Panel -->
      <div v-if="trendingQueue.length > 0" class="trending-manager">
        <p class="manager-hint">📢 发现热搜！请及时处理舆情</p>
        <div v-for="topic in trendingQueue" :key="topic.id" class="trending-action-card" :class="topic.type.toLowerCase()">
          <div class="topic-timer-bar" :style="{ width: topic.timeLeft + '%' }"></div>
          <div class="topic-info">
            <span class="topic-type">{{ topic.type === 'POSITIVE' ? '正面热点' : '负面舆情' }}</span>
            <span class="topic-name">#{{ topic.name }} 关联话题#</span>
          </div>
          <div class="topic-ops">
            <span class="topic-cost">成本: ¥{{ topic.cost.toLocaleString() }}</span>
            <div class="op-btn-group">
              <button @click="handleIgnoreTrending(topic.id)" class="op-btn ignore">忽略</button>
              <button @click="handleTrending(topic.id, topic.type === 'POSITIVE' ? 'BUY' : 'KILL')" 
                      class="op-btn"
                      :class="{ 'insufficient-funds': budget < topic.cost }">
                {{ topic.type === 'POSITIVE' ? '买上热搜' : '降热搜' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="activeStudioPage === 'recording'" class="event-layout">
        <!-- Side Dashboard: Real-time Popularity -->
        <Transition name="slide-fade">
          <div v-if="showPopularityDashboard" class="side-dashboard-overlay" @click.self="showPopularityDashboard = false">
            <div class="side-dashboard">
              <div class="dashboard-header">
                <div class="header-main">
                  <h3>实时人气看板</h3>
                  <p class="dashboard-instruction">点击 💖 可消耗 ¥5,000 提升成员人气</p>
                </div>
                <button @click="showPopularityDashboard = false" class="close-dash-btn">✕</button>
              </div>
              <div class="trending-ticker">
                <span class="ticker-label">当前热搜</span>
                <div class="ticker-content">
                  #{{ sortedCharacters[0].name }} 舞台实力# #镜头法则录制#
                </div>
              </div>
              <div class="dashboard-list">
                <div v-for="char in sortedCharacters" :key="char.id" 
                     class="dashboard-item" 
                     :class="{ 
                       'highlight-active': highlightedCharIds.has(char.id),
                       'is-trending': trendingQueue.some(t => t.name === char.name)
                     }"
                     :title="`定位: ${char.personality}`">
                  <img :src="getImageUrl(char.image)" :alt="char.name" class="dash-img" />
                  <div class="dash-info">
                    <div class="dash-name">
                      {{ char.name }}
                      <span v-if="trendingQueue.some(t => t.name === char.name)" class="trending-tag-mini">热搜中</span>
                    </div>
                    <div class="dash-pop-bar">
                      <div class="dash-pop-progress" :style="{ width: Math.min(char.popularity, 120) + '%' }"></div>
                    </div>
                  </div>
                  <div class="dash-ops">
                    <button 
                      @click.stop="handleHeartClick(char)" 
                      class="heart-btn" 
                      :class="{ 'insufficient': budget < 5000 }"
                      title="砸钱提升人气 (¥5,000)"
                    >
                      💖
                    </button>
                    <div class="dash-num">{{ char.popularity }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Transition>

        <aside class="live-cockpit">
          <div class="monitor-panel">
            <div class="monitor-topline">
              <span>LIVE MONITOR</span>
              <strong>{{ recordingMode }}</strong>
            </div>
            <div class="focus-preview">
              <img :src="getImageUrl(focusCharacter.image)" :alt="focusCharacter.name" />
              <div>
                <span>当前镜头焦点</span>
                <strong>{{ focusCharacter.name }}</strong>
                <small>{{ focusCharacter.personality }} / 人气 {{ focusCharacter.popularity }}</small>
              </div>
            </div>
            <div class="camera-lanes">
              <button
                v-for="char in eventCandidates"
                :key="char.id"
                class="camera-lane"
                :class="{ active: focusCharacterId === char.id }"
                @click="focusCharacterId = char.id"
              >
                <img :src="getImageUrl(char.image)" :alt="char.name" />
                <span>{{ char.name }}</span>
                <strong>{{ char.popularity }}</strong>
              </button>
            </div>
          </div>

          <div class="control-deck">
            <div class="control-deck-title">录制参数</div>
            <div class="mode-switcher">
              <button @click="recordingMode = 'BALANCE'" :class="{ active: recordingMode === 'BALANCE' }">群像</button>
              <button @click="recordingMode = 'FOCUS'" :class="{ active: recordingMode === 'FOCUS' }">单推</button>
              <button @click="recordingMode = 'DRAMA'" :class="{ active: recordingMode === 'DRAMA' }">抓马</button>
            </div>
            <label class="intensity-control">
              <span>执行强度 {{ executionIntensity }}</span>
              <div class="range-stepper compact">
                <button type="button" @click="changeExecutionIntensity(-1)">-</button>
                <input v-model.number="executionIntensity" type="range" min="1" max="4" step="1" />
                <button type="button" @click="changeExecutionIntensity(1)">+</button>
              </div>
            </label>
            <div class="control-impact">
              <span>预计消耗</span>
              <strong>¥{{ (executionIntensity * RECORDING_INTENSITY_COST).toLocaleString() }}</strong>
            </div>
          </div>
        </aside>

        <div class="event-main">
          <div class="event-container" :class="{ 'breaking-news-border': isBreakingNews, 'glitch-anim': isBreakingNews }">
            <!-- Glass Decorative Background -->
            <div class="event-glass-bg"></div>
            <div class="event-scanline"></div>
            
            <!-- Technical Data Overlays -->
            <div class="tech-data top-left-data">REC AUTO</div>
            <div class="tech-data top-right-data">ISO 400</div>
            <div class="tech-data bottom-left-data">F2.8 1/60</div>
            <div class="tech-data bottom-right-data">1080P 60FPS</div>
            
            <!-- Viewfinder Decor -->
            <div class="viewfinder-corner top-left"></div>
            <div class="viewfinder-corner top-right"></div>
            <div class="viewfinder-corner bottom-left"></div>
            <div class="viewfinder-corner bottom-right"></div>

            <div v-if="isBreakingNews" class="breaking-news-tag">突发状况 / 紧急舆情</div>
            <div class="progress-bar">
              <div class="progress" :style="{ width: ((currentEventIndex + 1) / gameEvents.length) * 100 + '%' }"></div>
            </div>
            <h2>{{ currentEvent.title }}</h2>
            <p class="event-description">{{ processedDescription }}</p>
            <p class="candidate-hint">💡 候选人说明：当前人气前 5 名成员</p>

            <!-- CHOICE Event Type -->
            <div v-if="currentEvent.type === 'CHOICE'" class="director-board">
              <div class="director-board-header">
                <span class="board-kicker">导播台 / 方案调度</span>
                <span class="board-hint">选择一套执行方案，系统会即时结算舆情与人气</span>
              </div>
              <button 
                v-for="(choice, index) in (typeof currentEvent.choices === 'function' ? currentEvent.choices(eventCandidates) : currentEvent.choices)" 
                :key="index" 
                @click="handleChoice(choice)" 
                class="directive-card"
              >
                <span class="directive-topline">
                  <span class="directive-type">{{ getDirectiveType(index) }}</span>
                  <span class="directive-cost">预算预估 ¥{{ getDirectiveCost(index).toLocaleString() }}</span>
                </span>
                <span class="directive-copy">{{ choice.text }}</span>
                <span class="directive-meta">
                  <span>影响：{{ getDirectiveTarget(index) }}</span>
                  <span>风险 {{ getDirectiveRisk(index) }}%</span>
                </span>
                <span class="risk-meter">
                  <span class="risk-fill" :style="{ width: getDirectiveRisk(index) + '%' }"></span>
                </span>
              </button>
            </div>

            <!-- PICK_TWO Event Type -->
        <div v-if="currentEvent.type === 'PICK_TWO'">
          <p class="pick-two-hint">请从人气最高的前五名中选择两位 (已选 {{ selectedPair.length }} / 2)</p>
          <p v-if="selectedPair.length === 2" class="bond-preview">
            {{ selectedPair[0].name }} × {{ selectedPair[1].name }}
            当前羁绊：{{ selectedPairBond?.value || 0 }}
          </p>
          <div class="roster mini">
            <div 
              v-for="character in rankingList" 
              :key="character.id" 
              class="char-card-premium mini-selectable" 
              :class="{ selected: isSelected(character) }"
              @click="toggleSelection(character)"
            >
              <div class="char-frame">
                <div class="image-container">
                  <img :src="getImageUrl(character.image)" :alt="character.name" class="main-img-fit" />
                  <div class="vignette-overlay"></div>
                </div>
                <div v-if="isSelected(character)" class="selection-indicator">已选择</div>
              </div>
              <div class="char-info-overlay mini">
                <div class="char-name-premium mini">{{ character.name }}</div>
              </div>
            </div>
          </div>
          <button @click="handlePickTwo" :disabled="selectedPair.length !== 2" class="start-button centered">确认人选</button>
        </div>

            <!-- RANKING Event Type -->
            <div v-if="currentEvent.type === 'RANKING'" class="ranking-area">
              <p class="pick-two-hint">💡 拖动成员卡片进行排序</p>
              <draggable 
                v-model="rankingList" 
                item-key="id" 
                class="drag-list"
                handle=".drag-item"
                animation="300"
              >
                <template #item="{element, index}">
                  <div class="drag-item">
                    <span class="rank-badge" :class="'rank-' + (index + 1)">{{ index + 1 }}</span>
                    <img :src="getImageUrl(element.image)" :alt="element.name" class="drag-img" />
                    <span class="drag-name">{{ element.name }}</span>
                    <span class="drag-handle">☰</span>
                  </div>
                </template>
              </draggable>
              <button @click="handleChoice({ text: '提交排序', action: (chars) => currentEvent.choices.action(rankingList) })" class="start-button submit-rank" style="margin-top: 2rem;">确认排位并发布</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast Notification -->
    <Transition name="toast">
      <div v-if="showToast" class="toast-hint">
        <div class="toast-icon">📢</div>
        <div class="toast-body">
          <div class="toast-title">执行反馈</div>
          <p class="toast-text">{{ toastMessage }}</p>
        </div>
      </div>
    </Transition>

    <!-- 3. End Screen (Settlement Report) -->
    <div v-if="gameState === 'end'" class="end-screen">
        <div class="settlement-container-refined">
          <!-- Magazine Grid Texture -->
          <div class="magazine-texture"></div>
          
          <!-- Decorative Background Elements -->
          <div class="bg-decoration circle-1"></div>
          <div class="bg-decoration circle-2"></div>
          
          <!-- Grade Badge Section -->
          <div class="grade-section-floating">
            <div class="grade-circle" 
                 :class="{ 'high-grade': producerTitle.grade === 'SSS' || producerTitle.grade === 'S' }"
                 :style="{ borderColor: producerTitle.gradeColor }">
              <span class="grade-label">综合评定</span>
              <span class="grade-value" :style="{ color: producerTitle.gradeColor }">{{ producerTitle.grade }}</span>
              <div class="grade-stamp">官方认证</div>
            </div>
          </div>

          <div class="settlement-header-refined">
            <div class="producer-badge-refined" :style="{ backgroundColor: producerTitle.color }">制作人评估报告</div>
            <h1 class="honor-title-refined">{{ producerTitle.name }}</h1>
            <p class="honor-subtitle-refined">本期录制综合表现评定报告 / 核心娱乐数据中心出品</p>
            <div class="report-id">NO. {{ Math.random().toString(36).substr(2, 9).toUpperCase() }}</div>
          </div>

          <!-- Medals Row -->
          <div v-if="producerMedals.length > 0" class="medals-row">
            <div v-for="medal in producerMedals" :key="medal.title" class="medal-card">
              <span class="medal-icon">{{ medal.icon }}</span>
              <div class="medal-info">
                <span class="medal-title">{{ medal.title }}</span>
                <span class="medal-desc">{{ medal.desc }}</span>
              </div>
            </div>
          </div>

          <div class="settlement-closure-section">
            <h3 class="section-title-refined">制作闭环复盘</h3>
            <div class="closure-board">
              <div v-for="item in studioClosure" :key="item.key" class="closure-card" :class="item.key">
                <span>{{ item.title }}</span>
                <strong>{{ item.actions }} 次 / ¥{{ item.spend.toLocaleString() }}</strong>
                <p>{{ item.result }}</p>
                <small>{{ item.detail }}</small>
              </div>
            </div>
          </div>

          <!-- Producer Analysis Section -->
          <div class="analysis-grid-refined">
            <div v-for="(item, index) in producerAnalysis" :key="index" class="analysis-card-refined" :style="{ animationDelay: (index * 0.1) + 's' }">
              <div class="analysis-card-header">
                <span class="analysis-card-icon">
                  <template v-if="item.label === '核心策略'">🎯</template>
                  <template v-else-if="item.label === '风险偏好'">🎲</template>
                  <template v-else-if="item.label === '公关投入'">💰</template>
                  <template v-else-if="item.label === '国民认可'">🌍</template>
                  <template v-else-if="item.label === '粉丝生态'">🧭</template>
                  <template v-else-if="item.label === '化学反应'">🔗</template>
                </span>
                <span class="analysis-card-label">{{ item.label }}</span>
              </div>
              <div class="analysis-card-value">{{ item.value }}</div>
              <p class="analysis-card-detail">{{ item.detail }}</p>
            </div>
          </div>

          <div class="settlement-dual-layout">
            <!-- Highlight Review (Moved up and added expand/collapse) -->
            <div class="history-box-refined">
              <h3 class="section-title-refined">🎞️ 录制高光时刻回顾</h3>
              <div class="timeline-container-wrapper" :class="{ 'is-collapsed': !isHistoryExpanded && eventHistory.length > 3 }">
                <div class="timeline-refined">
                  <div v-for="(item, index) in (isHistoryExpanded ? eventHistory : eventHistory.slice(0, 3))" :key="index" class="timeline-item-refined">
                    <div class="timeline-marker"></div>
                    <div class="timeline-content">
                      <div class="timeline-header">
                        <span class="timeline-episode">第 {{ index + 1 }} 期</span>
                        <span class="timeline-title">{{ item.event.title }}</span>
                      </div>
                      <p class="timeline-result">{{ item.result }}</p>
                    </div>
                  </div>
                </div>
                <!-- Fade mask for collapsed state -->
                <div v-if="!isHistoryExpanded && eventHistory.length > 3" class="timeline-fade-mask"></div>
              </div>
              <button v-if="eventHistory.length > 3" @click="isHistoryExpanded = !isHistoryExpanded" class="expand-toggle-btn">
                {{ isHistoryExpanded ? '收起回顾 ↑' : '展开全部回顾 ↓' }}
              </button>
            </div>

            <!-- Final Popularity Ranking (Moved down) -->
            <div class="ranking-box-refined">
              <h3 class="section-title-refined">📊 成员人气最终看板</h3>
              <div class="final-ranking-list">
                <div v-for="(char, index) in sortedCharacters" :key="char.id" class="final-rank-item-refined" :style="{ animationDelay: (index * 0.05) + 's' }">
                  <div class="final-rank-num-refined" :class="{ 'top-3': index < 3 }">{{ index + 1 }}</div>
                  <div class="final-rank-frame">
                    <img :src="getImageUrl(char.image)" :alt="char.name" class="final-rank-img-premium" />
                    <div class="vignette-mini"></div>
                  </div>
                  <div class="final-rank-info-refined">
                    <div class="final-rank-header">
                      <span class="final-rank-name-refined">{{ char.name }}</span>
                      <span v-if="char.popularity > initialPopularityMap[char.id]" class="pop-growth-tag">
                        +{{ char.popularity - initialPopularityMap[char.id] }}
                      </span>
                    </div>
                    <div class="pop-bar-bg-refined">
                      <div class="pop-bar-refined" :style="{ width: Math.min(char.popularity, 100) + '%', backgroundColor: index < 3 ? '#ff9a9e' : '#5d54a4' }"></div>
                    </div>
                  </div>
                  <span class="pop-value-refined">{{ char.popularity }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="settlement-footer">
            <button @click="handleSharePoster" class="secondary-button poster-btn" :disabled="isGeneratingPoster">
              {{ isGeneratingPoster ? '生成中...' : '下载战报海报' }}
            </button>
            <button @click="gameState = 'roster'" class="start-button restart-btn-refined">开启下一期运营计划</button>
            <p class="footer-disclaimer">模拟数据仅供娱乐</p>
          </div>
        </div>
    </div>

  </div>
</template>

<style scoped>
/* --- Design System & Global Polish --- */
/* (Container styles moved below to avoid duplication) */

/* --- Landing View Styles (Ultimate Optimization) --- */
.landing-view-ultimate {
  position: fixed;
  inset: 0;
  background: radial-gradient(circle at 50% -20%, #2e1065 0%, #1e1b4b 50%, #0f172a 100%); /* 深紫色到深蓝色的渐变 */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  z-index: 10000;
  font-family: 'Inter', -apple-system, sans-serif;
  color: #fff;
}

/* Ambient Background */
.ambient-bg {
  position: absolute;
  inset: 0;
  z-index: 1;
}

.glow-sphere {
  position: absolute;
  border-radius: 50%;
  filter: blur(140px);
  opacity: 0.6;
  animation: aurora-flow 30s infinite alternate ease-in-out;
}

.glow-1 {
  width: 80vw;
  height: 80vw;
  background: radial-gradient(circle, rgba(79, 70, 229, 0.3) 0%, transparent 70%);
  top: -20%;
  left: -20%;
}

.glow-2 {
  width: 70vw;
  height: 70vw;
  background: radial-gradient(circle, rgba(219, 39, 119, 0.25) 0%, transparent 70%);
  bottom: -20%;
  right: -20%;
  animation-delay: -10s;
}

.glow-3 {
  position: absolute;
  width: 60vw;
  height: 60vw;
  background: radial-gradient(circle, rgba(124, 58, 237, 0.2) 0%, transparent 70%);
  top: 20%;
  right: 10%;
  filter: blur(120px);
  animation: aurora-flow 25s infinite alternate-reverse ease-in-out;
  animation-delay: -5s;
}

@keyframes aurora-flow {
  0% { transform: translate(0, 0) scale(1) rotate(0deg); opacity: 0.4; }
  33% { transform: translate(10%, 5%) scale(1.1) rotate(5deg); opacity: 0.6; }
  66% { transform: translate(-5%, 15%) scale(0.9) rotate(-5deg); opacity: 0.5; }
  100% { transform: translate(0, 0) scale(1) rotate(0deg); opacity: 0.4; }
}

.mesh-grid {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 50px 50px;
  mask-image: radial-gradient(circle at center, black, transparent 80%);
}

@keyframes ambient-float {
  from { transform: translate(0, 0) rotate(0deg); }
  to { transform: translate(5%, 5%) rotate(5deg); }
}

/* Hero Showcase */
.hero-showcase {
  position: absolute;
  inset: 0;
  z-index: 2;
  opacity: 0.5; /* Increased opacity for better visibility */
  pointer-events: none;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 20px;
  transform: rotate(-5deg) scale(1.1); /* Tilted for dynamic look */
}

.showcase-track {
  display: flex;
  gap: 20px;
  animation: showcase-scroll 60s linear infinite;
}

.showcase-track.reverse {
  animation-direction: reverse;
}

@keyframes showcase-scroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

.showcase-item {
  position: relative;
  flex: 0 0 180px;
  height: 240px;
  border-radius: 4px;
  overflow: hidden;
  filter: contrast(1.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.showcase-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.showcase-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%);
}

.char-name-tag {
  position: absolute;
  bottom: 15px;
  left: 15px;
  color: #fff;
  font-size: 0.8rem;
  font-weight: 900;
  letter-spacing: 2px;
  text-transform: uppercase;
  text-shadow: 0 2px 10px rgba(0,0,0,0.8);
}

/* Main Content */
.landing-main-content {
  position: relative;
  z-index: 100; /* Increased to ensure visibility */
  text-align: center;
  max-width: 1000px;
  padding: 2rem;
}

.brand-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-bottom: 2rem;
  opacity: 0.6;
}

.brand-line {
  width: 40px;
  height: 1px;
  background: #fff;
}

.brand-text {
  font-size: 0.7rem;
  letter-spacing: 5px;
  font-weight: 800;
  text-transform: uppercase;
  color: #fff;
  opacity: 0.8;
}

.title-wrapper {
  margin-bottom: 3rem;
}

.main-headline {
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 1;
}

.word-top {
  font-size: 1.5rem;
  font-weight: 300;
  letter-spacing: 20px;
  color: #94a3b8;
  margin-bottom: 0.5rem;
  margin-left: 20px; /* Offset for spacing */
}

.word-main {
  font-size: 8.5rem;
  font-weight: 950;
  letter-spacing: -5px;
  color: #fff;
  background: linear-gradient(135deg, #fff 0%, #a5b4fc 50%, #818cf8 100%);
  -webkit-background-clip: text;
  background-clip: text;
  display: block;
  filter: drop-shadow(0 0 30px rgba(129, 140, 248, 0.3));
}

.word-sub {
  font-size: 1.4rem;
  font-weight: 800;
  letter-spacing: 14px;
  background: linear-gradient(to right, #fb7185, #f43f5e);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin-top: -10px;
  text-transform: uppercase;
}

.mission-box {
  margin-bottom: 4rem;
}

.tagline {
  font-size: 1.8rem;
  font-style: italic;
  font-weight: 300;
  margin-bottom: 1.5rem;
  color: #e2e8f0;
  letter-spacing: 1px;
}

.description {
  font-size: 1.3rem;
  color: #94a3b8;
  max-width: 720px;
  margin: 0 auto;
  line-height: 1.8;
  font-weight: 400;
}

.description strong {
  color: #fff;
  font-weight: 800;
  text-decoration: underline decoration-indigo-500 underline-offset-4;
}

.hero-stats-mini {
  display: flex;
  justify-content: center;
  gap: 3rem;
  margin-top: 3rem;
  opacity: 0.8;
}

.h-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.h-val {
  font-size: 1.5rem;
  font-weight: 900;
  color: #fff;
  font-family: 'Monaco', monospace;
}

.h-lbl {
  font-size: 0.6rem;
  font-weight: 800;
  color: #5d54a4;
  letter-spacing: 2px;
  margin-top: 4px;
}

/* Portal Button */
.action-portal {
  margin-bottom: 6rem;
}

.portal-btn {
  position: relative;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1.5rem 5rem;
  cursor: pointer;
  transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
  overflow: hidden;
  border-radius: 4px;
  backdrop-filter: blur(10px);
}

.btn-background {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, #6366f1, #ec4899);
  opacity: 0;
  transition: all 0.4s ease;
}

.btn-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #fff;
  transition: all 0.4s ease;
}

.btn-label {
  font-size: 1.6rem;
  font-weight: 900;
  letter-spacing: 4px;
  text-transform: uppercase;
}

.btn-sub {
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 4px;
  opacity: 0.6;
  margin-top: 4px;
}

.btn-shimmer {
  position: absolute;
  top: 0; left: -100%;
  width: 100%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent);
  animation: shimmer 3s infinite;
}

@keyframes shimmer {
  0% { left: -100%; }
  30% { left: 100%; }
  100% { left: 100%; }
}

.portal-btn:hover {
  transform: scale(1.02) translateY(-2px);
  border-color: rgba(255, 255, 255, 0.4);
  box-shadow: 0 0 40px rgba(99, 102, 241, 0.3);
}

.portal-btn:hover .btn-background {
  opacity: 1;
}

.portal-btn:hover .btn-content {
  color: #fff;
  transform: scale(1.05);
}

/* Status Footer */
.status-footer {
  display: flex;
  justify-content: center;
  gap: 3rem;
  opacity: 0.4;
}

.footer-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.f-dot {
  width: 6px;
  height: 6px;
  background: #22c55e;
  border-radius: 50%;
  box-shadow: 0 0 10px #22c55e;
}

.f-text {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 2px;
}

@media (max-width: 768px) {
  .word-main { font-size: 4.5rem; }
  .word-top { font-size: 1rem; letter-spacing: 10px; }
  .word-sub { font-size: 0.8rem; letter-spacing: 6px; }
  .tagline { font-size: 1.2rem; }
  .portal-btn { padding: 1.4rem 3rem; }
  .status-footer { flex-direction: column; gap: 1rem; }
}



.game-view {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  position: relative;
  z-index: 10;
  padding-bottom: 4rem;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.95); }
}

.producer-status-line {
   display: flex;
   align-items: center;
   gap: 15px;
   margin-bottom: 1.5rem;
   padding: 10px 24px;
   background: linear-gradient(90deg, rgba(79, 70, 229, 0.9), rgba(124, 58, 237, 0.8)); /* 鲜艳的靛蓝到紫色渐变 */
   border-radius: 50px; /* 胶囊形状 */
   border: 1px solid rgba(255, 255, 255, 0.3);
   box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
   max-width: 850px;
   margin-left: auto;
   margin-right: auto;
 }
 
 .container {
  max-width: 1600px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  color: #f8fafc;
  min-height: 100vh;
  position: relative;
}

.status-indicator {
  font-size: 0.6rem;
  font-weight: 900;
  color: #ff0055;
  letter-spacing: 2px;
  animation: pulse 1.5s infinite;
}
.status-text {
  font-size: 1.1rem;
  font-weight: 900;
  color: #ffffff;
  letter-spacing: 1.5px;
  text-shadow: 0 2px 8px rgba(0,0,0,0.3);
}

h1 {
  font-size: 1.7rem;
  font-weight: 850;
  color: #fff;
  margin-bottom: 0.25rem;
  text-align: left;
}

/* Apply transparent fill only to elements with background-clip gradients */
@supports (-webkit-background-clip: text) or (background-clip: text) {
  .word-main, .hero-title-mini {
    -webkit-text-fill-color: transparent;
  }
}

.word-main {
  font-size: 8rem;
  font-weight: 950;
  letter-spacing: -4px;
  color: #fff;
  background: linear-gradient(to bottom, #fff 30%, #5d54a4 100%);
  -webkit-background-clip: text;
  background-clip: text;
  display: block;
}

/* 移除所有透明文字填充效果 */
.hero-title-mini {
  font-size: 1.1rem;
  font-weight: 900;
  margin: 0;
  color: #ffffff;
}

/* --- Danmaku Layer --- */
.danmaku-container {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  pointer-events: none; z-index: 100; overflow: hidden;
}
.danmaku-item {
  position: absolute; right: -100%; white-space: nowrap;
  font-size: 1.25rem; 
  color: #ffffff; /* 纯白色 */
  font-weight: 900; 
  text-shadow: 2px 2px 4px #000;
  animation: danmaku-move linear forwards;
}
@keyframes danmaku-move {
  from { right: -100%; }
  to { right: 200%; }
}

/* --- Control Bar (Premium) --- */
.control-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.85rem 1rem;
  background: rgba(2, 6, 23, 0.84);
  backdrop-filter: blur(12px);
  border-radius: 14px;
  border: 1px solid rgba(148, 163, 184, 0.22);
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.28);
  margin-bottom: 1rem;
  max-width: 1180px;
  margin-left: auto;
  margin-right: auto;
}

.rec-indicator { display: flex; align-items: center; gap: 12px; }
.rec-dot {
  width: 8px; height: 8px; background: #ff0055; border-radius: 50%;
  animation: pulse-red 1.5s infinite;
  box-shadow: 0 0 10px #ff0055;
}
@keyframes pulse-red { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.3); opacity: 0.5; } }
.rec-text { 
  font-size: 0.78rem; 
  font-weight: 850; 
  color: #f87171; 
  letter-spacing: 0;
  text-shadow: none;
}

.episode-tag {
  font-size: 0.9rem;
  font-weight: 850;
  color: #fff;
  letter-spacing: 1px;
  text-shadow: 0 2px 10px rgba(0,0,0,0.2);
}

.budget-display { display: flex; flex-direction: column; align-items: flex-end; }
.budget-label { 
  font-size: 0.72rem; 
  color: rgba(255, 255, 255, 0.7); /* 在蓝色背景下提高标签亮度 */
  font-weight: 800; 
  text-transform: uppercase; 
  letter-spacing: 1px;
}
.budget-value { 
  font-family: 'Monaco', monospace; 
  font-weight: 900; 
  color: #10b981; 
  font-size: 1.1rem; 
  text-shadow: 0 2px 10px rgba(0,0,0,0.2); 
}
.budget-low .budget-value { color: #ff0055; text-shadow: 0 0 15px rgba(255, 0, 85, 0.4); }

.toggle-button {
  min-height: 48px;
  background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); padding: 0.6rem 1.2rem;
  border-radius: 8px; font-weight: 700; color: #e2e8f0; cursor: pointer;
  transition: all 0.2s;
}
.toggle-button:hover { background: rgba(255, 255, 255, 0.1); color: white; }
.toggle-button.off { opacity: 0.5; }

/* --- Studio Workspaces --- */
.studio-nav {
  max-width: 980px;
  margin: -0.8rem auto 1.4rem;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.7rem;
}

.studio-nav button {
  min-height: 48px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(15, 23, 42, 0.72);
  color: #cbd5e1;
  font-weight: 900;
  cursor: pointer;
  transition: all 0.2s ease;
}

.studio-nav button:hover,
.studio-nav button.active {
  color: #0f172a;
  background: #facc15;
  border-color: #fde68a;
  transform: translateY(-2px);
}

.workspace-panel {
  position: relative;
  z-index: 3;
  max-width: 1100px;
  margin: 0 auto 2rem;
  padding: 1.4rem;
  border-radius: 16px;
  background: rgba(2, 6, 23, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.32);
}

.workspace-head {
  display: grid;
  gap: 0.35rem;
  margin-bottom: 1.2rem;
}

.workspace-kicker {
  color: #67e8f9;
  font-size: 0.72rem;
  font-weight: 950;
}

.workspace-head h2 {
  color: #ffffff;
  margin: 0;
  font-size: 1.25rem;
  line-height: 1.2;
}

.workspace-head p {
  color: #cbd5e1;
  margin: 0;
  font-weight: 650;
  font-size: 0.9rem;
}

.faction-grid-large,
.report-metrics {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 0.8rem;
  margin-bottom: 1rem;
}

.faction-card,
.report-metrics div {
  min-height: 96px;
  border-radius: 12px;
  padding: 0.9rem;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.faction-card span,
.report-metrics span {
  color: #94a3b8;
  font-size: 0.76rem;
  font-weight: 900;
}

.faction-card strong,
.report-metrics strong {
  color: #ffffff;
  font-family: Monaco, monospace;
  font-size: 1.25rem;
}

.faction-card.group { border-color: rgba(34, 197, 94, 0.45); }
.faction-card.solo { border-color: rgba(96, 165, 250, 0.45); }
.faction-card.cp { border-color: rgba(244, 114, 182, 0.45); }
.faction-card.public { border-color: rgba(250, 204, 21, 0.45); }
.faction-card.anti { border-color: rgba(248, 113, 113, 0.5); }

.workspace-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin: 1rem 0;
}

.workspace-actions button {
  min-height: 48px;
  border: none;
  border-radius: 10px;
  padding: 0.75rem 1rem;
  background: #e0f2fe;
  color: #082f49;
  font-weight: 950;
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease;
}

.workspace-actions button:hover {
  background: #bae6fd;
  transform: translateY(-2px);
}

.workspace-slider {
  display: grid;
  gap: 0.55rem;
  margin: 1rem 0;
  color: #e2e8f0;
  font-weight: 900;
}

.workspace-slider input {
  width: 100%;
  accent-color: #facc15;
}

.range-stepper {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr) 44px;
  gap: 0.65rem;
  align-items: center;
}

.range-stepper button {
  min-width: 44px;
  min-height: 44px;
  border-radius: 9px;
  border: 1px solid rgba(148, 163, 184, 0.28);
  background: #0f172a;
  color: #f8fafc;
  font-size: 1rem;
  font-weight: 900;
  cursor: pointer;
  touch-action: manipulation;
}

.range-stepper input[type="range"] {
  appearance: none;
  width: 100%;
  min-height: 44px;
  background: transparent;
  cursor: grab;
  touch-action: pan-y;
  pointer-events: auto;
}

.range-stepper input[type="range"]:active {
  cursor: grabbing;
}

.range-stepper input[type="range"]::-webkit-slider-runnable-track {
  height: 8px;
  border-radius: 999px;
  background: #334155;
}

.range-stepper input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  width: 26px;
  height: 26px;
  margin-top: -9px;
  border-radius: 50%;
  border: 3px solid #020617;
  background: #facc15;
  box-shadow: 0 0 0 4px rgba(250, 204, 21, 0.18);
}

.range-stepper input[type="range"]::-moz-range-track {
  height: 8px;
  border-radius: 999px;
  background: #334155;
}

.range-stepper input[type="range"]::-moz-range-thumb {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 3px solid #020617;
  background: #facc15;
}

.workspace-card-hand {
  margin-top: 1rem;
}

.bond-candidate-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.8rem;
}

.bond-candidate {
  min-height: 132px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(15, 23, 42, 0.78);
  color: #ffffff;
  cursor: pointer;
  display: grid;
  justify-items: center;
  gap: 0.35rem;
  padding: 0.8rem;
  transition: all 0.2s ease;
}

.bond-candidate.selected {
  border-color: #facc15;
  background: rgba(250, 204, 21, 0.18);
}

.bond-candidate img {
  width: 58px;
  height: 58px;
  border-radius: 10px;
  object-fit: cover;
}

.bond-candidate span {
  font-weight: 950;
}

.bond-candidate small {
  color: #cbd5e1;
  font-weight: 800;
}

.bond-stage {
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(14, 165, 233, 0.18), rgba(244, 114, 182, 0.14));
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.bond-stage-title {
  color: #ffffff;
  font-size: 1.2rem;
  font-weight: 950;
}

.bond-score {
  color: #fde68a;
  font-family: Monaco, monospace;
  font-weight: 900;
  margin-top: 0.4rem;
}

.mini-ranking-board {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.6rem;
}

.mini-ranking-board div {
  min-height: 46px;
  padding: 0.7rem 0.9rem;
  border-radius: 10px;
  background: rgba(15, 23, 42, 0.76);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mini-ranking-board span {
  color: #e2e8f0;
  font-weight: 850;
}

.mini-ranking-board strong {
  color: #facc15;
  font-family: Monaco, monospace;
}

.formula-note {
  margin: 0 0 1rem;
  color: #cbd5e1;
  font-size: 0.78rem;
  line-height: 1.55;
  font-weight: 750;
}

.closure-board {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.85rem;
  margin: 1rem 0 1.4rem;
}

.closure-board.compact {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.closure-card {
  min-height: 120px;
  padding: 0.9rem;
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.78);
  border: 1px solid rgba(148, 163, 184, 0.18);
  display: grid;
  gap: 0.35rem;
  align-content: start;
}

.closure-card span {
  color: #94a3b8;
  font-size: 0.72rem;
  font-weight: 900;
}

.closure-card strong {
  color: #ffffff;
  font-size: 1rem;
  font-weight: 950;
}

.closure-card p,
.closure-card small {
  margin: 0;
  color: #cbd5e1;
  font-size: 0.78rem;
  line-height: 1.45;
  font-weight: 700;
}

.closure-card.recording { border-color: rgba(34, 197, 94, 0.42); }
.closure-card.fans { border-color: rgba(96, 165, 250, 0.42); }
.closure-card.bonds { border-color: rgba(244, 114, 182, 0.42); }
.closure-card.report { border-color: rgba(250, 204, 21, 0.42); }

.ledger-feed {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 0 0 1rem;
}

.ledger-feed span {
  padding: 0.4rem 0.6rem;
  border-radius: 8px;
  background: rgba(250, 204, 21, 0.12);
  color: #fde68a;
  font-size: 0.74rem;
  font-weight: 850;
}

/* --- Strategy Console --- */
.strategy-console {
  max-width: 980px;
  margin: -0.8rem auto 1.8rem;
  display: grid;
  gap: 0.9rem;
}

.faction-strip {
  display: grid;
  grid-template-columns: repeat(5, minmax(96px, 1fr));
  gap: 0.6rem;
}

.faction-chip {
  min-height: 56px;
  padding: 0.65rem 0.8rem;
  border-radius: 10px;
  background: rgba(15, 23, 42, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.faction-chip span {
  font-size: 0.75rem;
  color: #cbd5e1;
  font-weight: 800;
}

.faction-chip strong {
  font-family: Monaco, monospace;
  color: #fff;
  font-size: 1.1rem;
}

.faction-chip.group { border-color: rgba(34, 197, 94, 0.35); }
.faction-chip.solo { border-color: rgba(96, 165, 250, 0.35); }
.faction-chip.cp { border-color: rgba(244, 114, 182, 0.35); }
.faction-chip.public { border-color: rgba(250, 204, 21, 0.35); }
.faction-chip.anti { border-color: rgba(248, 113, 113, 0.45); }

.card-hand {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.8rem;
}

.operation-card {
  min-height: 118px;
  text-align: left;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(30, 41, 59, 0.82);
  border-radius: 12px;
  padding: 0.95rem;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  transition: transform 0.2s ease, border-color 0.2s ease, opacity 0.2s ease;
}

.operation-card:hover:not(:disabled) {
  transform: translateY(-3px);
  border-color: rgba(255, 255, 255, 0.45);
}

.operation-card:disabled {
  cursor: not-allowed;
  opacity: 0.46;
}

.operation-card.buff { box-shadow: inset 0 0 0 1px rgba(34, 197, 94, 0.24); }
.operation-card.pr { box-shadow: inset 0 0 0 1px rgba(96, 165, 250, 0.24); }
.operation-card.cp { box-shadow: inset 0 0 0 1px rgba(244, 114, 182, 0.24); }
.operation-card.balance { box-shadow: inset 0 0 0 1px rgba(250, 204, 21, 0.24); }

.card-name {
  font-size: 1rem;
  font-weight: 950;
}

.card-desc {
  flex: 1;
  color: #cbd5e1;
  font-size: 0.78rem;
  line-height: 1.5;
}

.card-cost {
  font-family: Monaco, monospace;
  font-size: 0.78rem;
  color: #86efac;
  font-weight: 900;
}

.card-feedback,
.bond-ticker,
.bond-preview {
  margin: 0;
  color: #e2e8f0;
  font-size: 0.85rem;
  font-weight: 800;
}

.bond-preview {
  color: #f9a8d4;
  margin-bottom: 1rem;
}

/* --- Trending Manager --- */
.trending-manager {
  position: fixed; top: 120px; right: 2rem; z-index: 100;
  display: flex; flex-direction: column; gap: 1rem; width: 340px;
}

.manager-hint {
  font-size: 0.65rem;
  background: #ff0055;
  color: white;
  padding: 4px 12px;
  border-radius: 4px;
  font-weight: 900;
  letter-spacing: 1px;
  margin-bottom: -0.5rem;
  align-self: flex-start;
}

.trending-action-card {
  background: rgba(30, 41, 59, 0.8);
  backdrop-filter: blur(12px);
  padding: 1.2rem;
  border-radius: 12px;
  box-shadow: 0 15px 35px rgba(0,0,0,0.4);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-left: 4px solid #475569;
  position: relative;
  overflow: hidden;
  animation: slide-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.trending-action-card.positive { border-left-color: #5d54a4; }
.trending-action-card.negative { border-left-color: #ff0055; }

.topic-timer-bar {
  position: absolute; top: 0; left: 0; height: 3px;
  background: rgba(255,255,255,0.1); transition: width 0.1s linear;
}
.positive .topic-timer-bar { background: #5d54a4; }
.negative .topic-timer-bar { background: #ff0055; }

.topic-info { margin-bottom: 1rem; }
.topic-type { 
  font-size: 0.6rem; font-weight: 900; padding: 2px 8px; 
  border-radius: 4px; background: rgba(255,255,255,0.05); color: #94a3b8; display: inline-block; margin-bottom: 6px;
  letter-spacing: 1px;
}
.positive .topic-type { color: #5d54a4; background: rgba(93, 84, 164, 0.1); }
.negative .topic-type { color: #ff0055; background: rgba(255, 0, 85, 0.1); }
.topic-name { display: block; font-weight: 800; font-size: 1rem; color: white; }

.topic-ops { display: flex; justify-content: space-between; align-items: center; }
.op-btn-group { display: flex; gap: 8px; }
.topic-cost { font-size: 0.75rem; font-weight: 700; color: #64748b; }
.op-btn {
  min-height: 40px;
  background: white; color: black; border: none; padding: 6px 14px;
  border-radius: 4px; font-size: 0.75rem; font-weight: 900; cursor: pointer;
  transition: all 0.2s;
}
.op-btn.ignore {
  background: rgba(255,255,255,0.05);
  color: #94a3b8;
}
.op-btn:hover:not(:disabled) { transform: translateY(-2px); background: #5d54a4; color: white; }

@keyframes slide-in { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

/* Top Dashboard Button */
.top-dash-btn {
  min-height: 48px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.top-dash-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

.top-dash-btn.has-trending {
  border-color: #ff0055;
  background: rgba(255, 0, 85, 0.1);
}

.control-actions {
  display: flex;
  gap: 16px;
  align-items: center;
}

/* --- Layout --- */
.event-layout { 
  position: relative; 
  width: 100%; 
  display: grid;
  grid-template-columns: minmax(300px, 380px) minmax(0, 1fr);
  gap: 1.5rem;
  max-width: 1180px;
  margin: 0 auto;
}

.live-cockpit {
  display: grid;
  gap: 1rem;
  align-self: start;
  position: sticky;
  top: 1rem;
  z-index: 3;
}

.monitor-panel,
.control-deck {
  border-radius: 14px;
  background: #020617;
  border: 1px solid #334155;
  box-shadow: 0 18px 48px rgba(0, 0, 0, 0.36);
  padding: 1rem;
}

.monitor-topline,
.control-impact {
  display: flex;
  justify-content: space-between;
  color: #94a3b8;
  font-size: 0.75rem;
  font-weight: 900;
}

.monitor-topline strong,
.control-impact strong {
  color: #22c55e;
  font-family: Monaco, monospace;
}

.focus-preview {
  display: flex;
  gap: 0.9rem;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid rgba(148, 163, 184, 0.18);
}

.focus-preview img {
  width: 82px;
  height: 82px;
  border-radius: 12px;
  object-fit: cover;
  border: 2px solid #22c55e;
}

.focus-preview div {
  display: grid;
  gap: 0.25rem;
}

.focus-preview span,
.focus-preview small {
  color: #94a3b8;
  font-size: 0.75rem;
  font-weight: 800;
}

.focus-preview strong {
  color: #ffffff;
  font-size: 1.35rem;
  font-weight: 950;
}

.camera-lanes {
  display: grid;
  gap: 0.55rem;
  margin-top: 0.85rem;
}

.camera-lane {
  min-height: 54px;
  display: grid;
  grid-template-columns: 42px 1fr auto;
  align-items: center;
  gap: 0.7rem;
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: rgba(15, 23, 42, 0.8);
  color: #e2e8f0;
  border-radius: 10px;
  padding: 0.45rem 0.65rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.camera-lane.active,
.camera-lane:hover {
  border-color: #22c55e;
  background: rgba(34, 197, 94, 0.12);
}

.camera-lane img {
  width: 42px;
  height: 42px;
  border-radius: 8px;
  object-fit: cover;
}

.camera-lane span {
  font-weight: 900;
}

.camera-lane strong {
  color: #facc15;
  font-family: Monaco, monospace;
}

.control-deck-title {
  color: #ffffff;
  font-weight: 950;
  margin-bottom: 0.8rem;
}

.mode-switcher {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.45rem;
  margin-bottom: 1rem;
}

.mode-switcher button {
  min-height: 48px;
  border-radius: 9px;
  border: 1px solid rgba(148, 163, 184, 0.22);
  background: rgba(15, 23, 42, 0.9);
  color: #cbd5e1;
  font-weight: 900;
  cursor: pointer;
}

.mode-switcher button.active,
.mode-switcher button:hover {
  background: #22c55e;
  color: #052e16;
  border-color: #86efac;
}

.intensity-control {
  display: grid;
  gap: 0.6rem;
  color: #e2e8f0;
  font-weight: 900;
  margin-bottom: 1rem;
}

.intensity-control input {
  width: 100%;
  accent-color: #22c55e;
}

.btn-icon { font-size: 1.1rem; }
.btn-text { font-weight: 950; color: white; font-size: 0.9rem; letter-spacing: 1px; text-shadow: 0 1px 3px rgba(0,0,0,0.5); }

.trending-dot {
  width: 6px;
  height: 6px;
  background: #ff0055;
  border-radius: 50%;
  position: absolute;
  top: 8px;
  right: 8px;
  box-shadow: 0 0 10px #ff0055;
}

/* Dashboard Overlay (Premium) */
.side-dashboard-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  z-index: 1000;
  display: flex;
  justify-content: flex-end;
}

.side-dashboard {
  width: 380px;
  height: 100%;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(40px);
  padding: 2rem;
  box-shadow: -20px 0 60px rgba(0,0,0,0.5);
  overflow-y: auto;
  position: relative;
  display: flex;
  flex-direction: column;
  border-left: 1px solid rgba(255, 255, 255, 0.1);
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.dashboard-header h3 { margin: 0; color: white; font-size: 1.4rem; font-weight: 900; letter-spacing: 1px; }

.header-main {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.dashboard-instruction {
  font-size: 0.65rem;
  color: #94a3b8;
  margin: 0;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.close-dash-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  width: 32px;
  height: 32px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  cursor: pointer;
  color: #94a3b8;
  transition: all 0.2s;
}

.close-dash-btn:hover { background: #ff0055; color: white; border-color: transparent; }

/* Transitions */
.slide-fade-enter-active, .slide-fade-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-fade-enter-from, .slide-fade-leave-to {
  opacity: 0;
}

.slide-fade-enter-active .side-dashboard,
.slide-fade-leave-active .side-dashboard {
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-fade-enter-from .side-dashboard,
.slide-fade-leave-to .side-dashboard {
  transform: translateX(100%);
}

@media (max-width: 768px) {
  .side-dashboard {
    width: 85%;
  }
  .floating-dash-btn {
    bottom: 1.5rem;
    right: 1rem;
  }
}

.trending-ticker {
  background: rgba(255, 0, 85, 0.05); border-radius: 4px; padding: 0.8rem;
  margin-bottom: 2rem; border: 1px solid rgba(255, 0, 85, 0.1); overflow: hidden;
}
.ticker-label { font-size: 0.6rem; font-weight: 900; color: #ff0055; display: block; letter-spacing: 2px; margin-bottom: 4px; }
.ticker-content { font-size: 0.8rem; color: white; white-space: nowrap; animation: ticker-scroll 15s linear infinite; font-weight: 600; }
@keyframes ticker-scroll { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }

.dashboard-item {
  display: flex; align-items: center; gap: 0.8rem; padding: 0.75rem;
  background: #f8fafc; border-radius: 18px; margin-bottom: 0.6rem;
  transition: all 0.3s; border: 1px solid transparent;
}
.dashboard-item.highlight-active {
  background: #f0fdf4; border-color: #bbf7d0;
  transform: scale(1.05); box-shadow: 0 10px 15px -3px rgba(34, 197, 94, 0.1);
}
.dash-img { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 2px solid white; }
.dash-info { flex: 1; }
.dash-name { font-size: 0.85rem; font-weight: 800; color: #1e293b; display: flex; align-items: center; gap: 4px; }
.trending-tag-mini {
  font-size: 0.6rem; background: #ff4d4f; color: white;
  padding: 1px 4px; border-radius: 4px; font-weight: 900;
  animation: pulse-small 1s infinite;
}
@keyframes pulse-small { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
.dashboard-item.is-trending { border-color: #ff9a9e; background: #fff1f2; }

.dash-pop-bar { height: 4px; background: #e2e8f0; border-radius: 2px; margin-top: 4px; }
.dash-pop-progress { height: 100%; background: linear-gradient(90deg, #ff9a9e, #fecfef); border-radius: 2px; transition: width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1); }
.dash-ops { display: flex; align-items: center; gap: 8px; }
.heart-btn {
  min-width: 44px;
  min-height: 44px;
  background: none; border: none; font-size: 1.2rem; cursor: pointer;
  padding: 4px; border-radius: 50%; transition: all 0.2s;
  line-height: 1;
}
.heart-btn:hover { transform: scale(1.3); background: rgba(255, 154, 158, 0.1); }
.heart-btn:active { transform: scale(0.9); }
.heart-btn.insufficient {
  filter: grayscale(1);
  opacity: 0.5;
  cursor: not-allowed;
}
.dash-num { font-weight: 900; color: #ff4d4f; font-size: 0.85rem; width: 30px; text-align: right; }

.event-main { 
  width: 100%;
  position: relative;
  z-index: 2;
}

.ambient-bg-event {
  position: fixed;
  inset: 0;
  z-index: -1;
  overflow: hidden;
  pointer-events: none;
}

.glow-sphere-event {
  position: absolute;
  width: 100vw;
  height: 100vw;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(244, 63, 94, 0.05) 50%, transparent 70%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  filter: blur(120px);
  animation: pulse-glow 12s infinite alternate ease-in-out;
}

@keyframes pulse-glow {
  from { opacity: 0.3; transform: translate(-50%, -50%) scale(1); }
  to { opacity: 0.6; transform: translate(-50%, -50%) scale(1.2); }
}

/* Technical Data Overlays */
.tech-data {
  position: absolute;
  font-family: 'Monaco', monospace;
  font-size: 0.6rem;
  color: rgba(255, 255, 255, 0.4);
  z-index: 5;
  letter-spacing: 1px;
}

.top-left-data { top: 10px; left: 40px; }
.top-right-data { top: 10px; right: 40px; }
.bottom-left-data { bottom: 10px; left: 40px; }
.bottom-right-data { bottom: 10px; right: 40px; }

/* Viewfinder Corners */
.viewfinder-corner {
  position: absolute;
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  z-index: 5;
}

.top-left { top: 15px; left: 15px; border-right: none; border-bottom: none; }
.top-right { top: 15px; right: 15px; border-left: none; border-bottom: none; }
.bottom-left { bottom: 15px; left: 15px; border-right: none; border-top: none; }
.bottom-right { bottom: 15px; right: 15px; border-left: none; border-top: none; }

.event-container {
  background: #020617;
  backdrop-filter: blur(12px);
  padding: 2rem;
  border-radius: 14px;
  border: 1px solid #334155;
  box-shadow: 0 22px 58px rgba(0, 0, 0, 0.34);
  position: relative;
  max-width: 850px;
  margin: 0 auto;
  overflow: hidden;
}

.breaking-news-border {
  border: 4px solid #ff0055 !important;
  box-shadow: 0 0 50px rgba(255, 0, 85, 0.5) !important;
  background: linear-gradient(135deg, rgba(225, 29, 72, 0.8), rgba(159, 18, 57, 0.7)) !important;
}

.event-glass-bg {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 20% 20%, rgba(34, 197, 94, 0.12) 0%, transparent 48%);
  z-index: -1;
}

.event-glass-bg::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: 
    radial-gradient(circle at 2px 2px, rgba(255, 255, 255, 0.05) 1px, transparent 0);
  background-size: 24px 24px;
  opacity: 0.5;
}

.event-scanline {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    transparent 50%,
    rgba(255, 255, 255, 0.05) 50%
  );
  background-size: 100% 4px;
  z-index: 0;
  pointer-events: none;
  opacity: 0.3;
}
.event-container h2 { 
  font-size: 1.12rem;
  color: #ffffff; 
  margin-bottom: 0.85rem; 
  text-align: left; 
  font-weight: 850; 
  letter-spacing: 0;
  position: relative;
  z-index: 2;
  text-shadow: none;
}
.event-description { 
  font-size: 0.92rem;
  line-height: 1.6; 
  color: #e2e8f0; 
  margin-bottom: 1.2rem; 
  text-align: left; 
  font-weight: 500;
  position: relative;
  z-index: 2;
  text-shadow: none;
}
.candidate-hint { 
  font-size: 0.76rem;
  color: #94a3b8; 
  margin-bottom: 2rem; 
  text-align: center; 
  letter-spacing: 1px; 
  font-weight: 700;
  background: linear-gradient(90deg, rgba(99, 102, 241, 0.4), rgba(244, 63, 94, 0.4)); 
  backdrop-filter: blur(10px);
  padding: 8px 24px;
  border-radius: 30px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  display: inline-block;
  margin-left: 50%;
  transform: translateX(-50%);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

/* --- Refined Roster Styles --- */
.roster-view-refined {
  position: relative;
  min-height: 100vh;
  padding: 3rem 1.5rem;
  background: radial-gradient(circle at 0% 0%, #312e81 0%, transparent 50%),
              radial-gradient(circle at 100% 100%, #4c1d95 0%, transparent 50%),
              radial-gradient(circle at 50% 50%, #1e1b4b 0%, #0f172a 100%);
  overflow-x: hidden;
}

.roster-bg-decor {
  position: absolute;
  filter: blur(120px);
  opacity: 0.15;
  z-index: 0;
  pointer-events: none;
}
.circle-top {
  width: 600px; height: 600px; background: radial-gradient(circle, #5d54a4 0%, transparent 70%);
  top: -200px; right: -100px;
  animation: float 15s infinite alternate;
  opacity: 0.2;
}
.circle-bottom {
  width: 500px; height: 500px; background: radial-gradient(circle, #ff0055 0%, transparent 70%);
  bottom: -150px; left: -100px;
  animation: float 18s infinite alternate-reverse;
  opacity: 0.15;
}

.roster-header-container {
  max-width: 900px;
  margin: 0 auto 1.5rem;
  position: relative;
  z-index: 10;
}

.roster-stats-bar {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.stat-item {
  flex: 1;
  background: rgba(30, 41, 59, 0.4);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 0.8rem;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-label {
  font-size: 0.6rem;
  color: #94a3b8;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.stat-value {
  font-size: 1.2rem;
  font-weight: 900;
  color: #fff;
  font-family: 'Monaco', monospace;
}

.stat-value.pulse {
  color: #22c55e;
  text-shadow: 0 0 10px rgba(34, 197, 94, 0.4);
  animation: pulse 2s infinite;
}

.roster-hero-section-compact {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.2rem 1.8rem;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
}

.hero-title-mini {
  font-size: 1.1rem;
  font-weight: 900;
  margin: 0;
  background: linear-gradient(135deg, #fff 0%, #5d54a4 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: #fff;
}

@supports (-webkit-background-clip: text) or (background-clip: text) {
  .hero-title-mini {
    -webkit-text-fill-color: transparent;
  }
}

.hero-desc-mini {
  font-size: 0.8rem; /* 增大字号 */
  color: #e2e8f0;
  margin: 4px 0 0 0;
  font-weight: 500;
  line-height: 1.4;
}

.hero-actions-mini {
  display: flex;
  gap: 0.6rem;
}

.mini-btn {
  padding: 0.4rem 1rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 800;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.mini-btn.primary { background: #fff; color: #000; }
.mini-btn.secondary { background: rgba(255,255,255,0.05); color: #fff; border: 1px solid rgba(255,255,255,0.1); }
.mini-btn:hover { transform: translateY(-2px); opacity: 0.9; }

/* --- Premium Char Card (Next-Gen Compact) --- */
.roster-grid-refined {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  max-width: 900px;
  margin: 0 auto;
  padding: 0 1rem;
}

.char-card-premium {
  background: rgba(30, 41, 59, 0.4);
  backdrop-filter: blur(12px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
  overflow: hidden;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0.8rem 1.5rem;
  position: relative;
}

.char-card-premium:hover {
  border-color: #6366f1;
  box-shadow: 0 0 25px rgba(99, 102, 241, 0.2);
  transform: translateX(5px);
  background: linear-gradient(90deg, rgba(30, 41, 59, 0.8) 0%, rgba(99, 102, 241, 0.1) 100%);
}

.char-frame {
  width: 64px;
  height: 64px;
  flex-shrink: 0;
  border-radius: 10px;
  background: #1e1b4b;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s;
  margin-right: 1.5rem;
}

.char-card-premium:hover .char-frame {
  border-color: #ff0055;
  transform: scale(1.05);
}

.main-img-fit {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 10%;
  background: #000;
  transition: transform 0.4s ease;
}

.char-card-premium:hover .main-img-fit {
  transform: scale(1.08);
}

.char-info-overlay {
  position: static;
  width: 160px;
  padding: 0;
  background: transparent;
  backdrop-filter: none;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.char-name-premium {
  font-size: 1.1rem;
  font-weight: 900;
  color: #fff;
  margin-bottom: 2px;
  text-shadow: none;
}

.char-role-mini {
  font-size: 0.7rem;
  color: #94a3b8;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  text-shadow: none;
}

.char-controls-premium {
  flex: 1;
  padding: 0;
  background: transparent;
  border-top: none;
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.pop-metrics {
  margin-bottom: 0;
  min-width: 100px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.m-label { 
  font-size: 0.6rem; 
  color: #94a3b8; 
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 4px;
}

.m-label::before {
  content: '⚡';
  font-size: 0.7rem;
}

.m-value { 
  font-size: 0.85rem; 
  color: #ff0055; 
  font-weight: 900; 
  font-family: 'Monaco', monospace; 
  text-shadow: 0 0 10px rgba(255, 0, 85, 0.3);
}

.pop-adjuster-premium {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.adjust-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.adjust-btn:hover {
  background: #ff0055;
  border-color: transparent;
  transform: scale(1.1);
}

.adjust-btn:active {
  transform: scale(0.9);
}

.adjust-btn .icon {
  font-size: 1.2rem;
  font-weight: 900;
}

.progress-mini-track {
  flex: 1;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
  position: relative;
}

.progress-mini-fill {
  height: 100%;
  background: linear-gradient(90deg, #5d54a4, #ff0055);
  border-radius: 2px;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.roster-footer-refined {
  text-align: center; margin-top: 6rem; padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05); color: #475569; font-size: 0.7rem;
  letter-spacing: 1px;
}

/* --- Components --- */
/* --- Mini Premium Card for Events --- */
.mini-selectable {
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s;
  flex-direction: column !important; /* 强制垂直布局 */
  padding: 0.5rem !important;
  background: rgba(255, 255, 255, 0.05) !important;
}

.mini-selectable:hover {
  transform: translateY(-5px) !important;
  background: rgba(255, 255, 255, 0.1) !important;
}

.mini-selectable .char-frame {
  aspect-ratio: 1/1; /* 在事件页保持正方形 */
  width: 100% !important;
  height: auto !important;
  margin-right: 0 !important;
  margin-bottom: 0.5rem;
}

.mini-selectable .char-info-overlay.mini {
  width: 100% !important;
  text-align: center;
  position: static !important;
}

.mini-selectable .char-name-premium.mini {
  font-size: 0.85rem;
  text-align: center;
  color: #fff;
  font-weight: 800;
}

.mini-selectable.selected {
  border: 2px solid #ff0055;
  box-shadow: 0 0 25px rgba(255, 0, 85, 0.5);
  background: rgba(255, 0, 85, 0.15) !important; /* 给选中红框部分增加淡红色背景 */
}

.selection-indicator {
  position: absolute;
  top: 10px; right: 10px;
  background: #ff0055;
  color: white;
  font-size: 0.65rem;
  font-weight: 950;
  padding: 4px 10px;
  border-radius: 4px;
  letter-spacing: 1px;
  z-index: 10;
  box-shadow: 0 4px 10px rgba(0,0,0,0.5);
  animation: bounce-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.roster.mini {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 1rem;
  justify-content: center;
  max-width: 900px;
  margin: 0 auto 2rem;
}

.director-board {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.director-board-header {
  grid-column: 1 / -1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 0.8rem 1rem;
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.board-kicker {
  color: #ffffff;
  font-weight: 850;
}

.board-hint {
  color: #cbd5e1;
  font-size: 0.76rem;
  font-weight: 600;
}

.directive-card {
  min-height: 148px;
  background: #0f172a;
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 12px;
  color: #ffffff;
  padding: 1rem;
  text-align: left;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.directive-card:hover {
  transform: translateY(-2px);
  border-color: #22c55e;
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.28);
}

.directive-topline,
.directive-meta {
  display: flex;
  justify-content: space-between;
  gap: 0.8rem;
  align-items: center;
}

.directive-type {
  color: #0f172a;
  background: #facc15;
  padding: 0.24rem 0.5rem;
  border-radius: 6px;
  font-size: 0.72rem;
  font-weight: 850;
}

.directive-cost,
.directive-meta {
  color: #cbd5e1;
  font-size: 0.74rem;
  font-weight: 650;
}

.directive-copy {
  flex: 1;
  color: #ffffff;
  font-size: 0.88rem;
  line-height: 1.55;
  font-weight: 600;
}

.risk-meter {
  height: 7px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
  overflow: hidden;
}

.risk-fill {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #22c55e, #facc15, #ff0055);
}

.drag-list { display: flex; flex-direction: column; gap: 1rem; }
.drag-item {
  display: flex; align-items: center; padding: 1rem; background: rgba(255, 255, 255, 0.05);
  border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.1); cursor: grab;
  transition: all 0.2s; user-select: none; touch-action: none;
}
.drag-item:hover { border-color: #5d54a4; background: rgba(255, 255, 255, 0.08); }
.drag-item:active { cursor: grabbing; background: #5d54a4; }

.drag-name {
  font-size: 1.1rem;
  font-weight: 900;
  color: #ffffff;
  flex: 1;
  text-shadow: 1px 1px 2px #000;
}

.drag-handle {
  color: #94a3b8;
  font-size: 1.2rem;
  margin-left: 1rem;
}

.rank-badge {
  width: 28px; height: 28px; background: #334155; color: white;
  border-radius: 4px; display: flex; align-items: center; justify-content: center;
  font-weight: 900; font-size: 0.8rem;
}
.rank-badge.rank-1 { background: #FFD700; color: black; box-shadow: 0 0 15px rgba(255, 215, 0, 0.3); }

.drag-img { width: 36px; height: 36px; border-radius: 4px; object-fit: cover; margin: 0 1rem; border: 1px solid rgba(255, 255, 255, 0.1); }

/* --- Toast --- */
.toast-hint {
  position: fixed;
  top: 30px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(20px);
  padding: 1.2rem 2.5rem;
  border-radius: 16px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  gap: 1.5rem;
  z-index: 2000;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-left: 6px solid #6366f1;
  width: auto;
  min-width: 400px;
  max-width: 80%;
}
.toast-icon { font-size: 2.2rem; }
.toast-title { 
  font-size: 0.8rem; 
  font-weight: 950; 
  color: #ffffff; 
  text-transform: uppercase; 
  margin-bottom: 6px; 
  letter-spacing: 1.5px; 
  text-shadow: 1px 1px 2px #000;
}
.toast-text { 
  font-size: 1.25rem; 
  font-weight: 800; 
  color: white; 
  line-height: 1.5; 
  text-shadow: 1px 1px 4px #000;
}

/* --- Settlement Refined Styles --- */
.end-screen {
  padding: 2rem;
  background: radial-gradient(circle at 100% 0%, #4c1d95 0%, #1e1b4b 50%, #0f172a 100%);
  min-height: 100vh;
}

.magazine-texture {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 20px 20px;
  pointer-events: none;
  z-index: 0;
}

.report-id {
  font-family: 'Monaco', monospace;
  font-size: 0.7rem;
  color: #94a3b8;
  margin-top: 1rem;
  letter-spacing: 2px;
}

.settlement-container-refined {
  max-width: 1250px;
  margin: 0 auto;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.6) 100%);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 4rem 3.5rem;
  position: relative;
  box-shadow: 0 40px 100px rgba(0,0,0,0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
  z-index: 1;
}

.bg-decoration {
  position: absolute;
  z-index: -1;
  filter: blur(80px);
  opacity: 0.15;
}
.circle-1 {
  width: 400px; height: 400px; background: #5d54a4;
  top: -100px; right: -100px;
}
.circle-2 {
  width: 300px; height: 300px; background: #ff9a9e;
  bottom: -50px; left: -50px;
}

.grade-stamp {
  position: absolute;
  bottom: -10px;
  font-size: 0.5rem;
  font-weight: 900;
  letter-spacing: 2px;
  color: #94a3b8;
  border: 1px solid #94a3b8;
  padding: 1px 4px;
  transform: rotate(-5deg);
}

.medals-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2.5rem;
  justify-content: flex-start;
}

.medal-card {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(93, 84, 164, 0.05);
  padding: 0.6rem 1.2rem;
  border-radius: 16px;
  border: 1px solid rgba(93, 84, 164, 0.1);
  animation: bounce-in 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) backwards;
}

@keyframes bounce-in {
  from { transform: scale(0.5); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.medal-icon { font-size: 1.5rem; }
.medal-info { display: flex; flex-direction: column; text-align: left; }
.medal-title { font-size: 0.85rem; font-weight: 900; color: #fff; }
.medal-desc { font-size: 0.65rem; color: #94a3b8; font-weight: 600; }

.final-rank-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.pop-growth-tag {
  font-size: 0.65rem;
  font-weight: 900;
  color: #10b981;
  background: #ecfdf5;
  padding: 1px 6px;
  border-radius: 4px;
  animation: slide-in-right 0.4s ease-out backwards;
}

@keyframes slide-in-right {
  from { transform: translateX(10px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

.grade-section-floating {
  position: absolute;
  top: 2rem;
  right: 2rem;
}

.grade-circle {
  width: 120px;
  height: 120px;
  border: 6px solid;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
  transform: rotate(-5deg);
  box-shadow: 0 20px 40px rgba(0,0,0,0.3);
  animation: stamp-fade 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) backwards;
  position: relative;
}

.grade-circle.high-grade::after {
  content: "✨";
  position: absolute;
  top: -10px;
  right: -10px;
  font-size: 1.5rem;
  animation: sparkle 1.5s infinite;
}

@keyframes sparkle {
  0%, 100% { transform: scale(1) rotate(0); opacity: 1; }
  50% { transform: scale(1.2) rotate(20deg); opacity: 0.8; }
}

@keyframes stamp-fade {
  from { transform: scale(2) rotate(30deg); opacity: 0; }
  to { transform: scale(1) rotate(15deg); opacity: 1; }
}

.grade-label { font-size: 0.65rem; font-weight: 900; color: #94a3b8; }
.grade-value { font-size: 2.5rem; font-weight: 950; line-height: 1; }

.settlement-header-refined {
  text-align: left;
  margin-bottom: 3rem;
}

.producer-badge-refined {
  display: inline-block;
  color: white;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 900;
  letter-spacing: 2px;
  margin-bottom: 1rem;
}

.honor-title-refined {
  font-size: 3rem;
  font-weight: 950;
  color: white;
  margin: 0 0 0.5rem 0;
  letter-spacing: -1px;
}

.honor-subtitle-refined {
  font-size: 1.2rem;
  color: #94a3b8;
  margin: 0;
  font-weight: 300;
}

.analysis-grid-refined {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.2rem;
  margin-bottom: 3rem;
}

.settlement-closure-section {
  margin: 0 0 2.4rem;
}

.settlement-closure-section .section-title-refined {
  color: #ffffff;
  margin-bottom: 1rem;
}

.settlement-closure-section .closure-card {
  background: rgba(255, 255, 255, 0.04);
}

.analysis-card-refined {
  background: rgba(255, 255, 255, 0.03);
  padding: 1.5rem;
  border-radius: 12px;
  text-align: left;
  border: 1px solid rgba(255, 255, 255, 0.05);
}
.analysis-card-value { font-size: 1.2rem; font-weight: 900; color: white; margin-bottom: 0.5rem; }
.analysis-card-detail { font-size: 0.85rem; color: #94a3b8; line-height: 1.6; }

@keyframes slide-up {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.analysis-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 0.8rem;
}

.analysis-card-icon { font-size: 1.2rem; }
.analysis-card-label { font-size: 0.75rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; }
.analysis-card-value { font-size: 1.1rem; font-weight: 900; color: #5d54a4; margin-bottom: 0.5rem; }
.analysis-card-detail { font-size: 0.85rem; color: #475569; line-height: 1.6; margin: 0; }

.section-title-refined {
  font-size: 1.2rem;
  font-weight: 900;
  color: #1e293b;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 10px;
}

.final-rank-item-refined {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.8rem;
  background: rgba(255, 255, 255, 0.05); /* 统一使用深色风格背景 */
  border-radius: 12px;
  margin-bottom: 0.8rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s;
  animation: slide-in-left 0.4s ease backwards;
}

.final-rank-item-refined:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: #ff0055;
  transform: translateX(8px);
}

@keyframes slide-in-left {
  from { transform: translateX(-20px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

.final-rank-num-refined { font-weight: 900; color: #cbd5e1; width: 24px; font-style: italic; font-size: 1.1rem; }
.final-rank-num-refined.top-3 { color: #ff9a9e; font-size: 1.3rem; }

.final-rank-frame {
  width: 50px;
  height: 50px;
  border-radius: 8px; /* 稍微圆角 */
  overflow: hidden;
  position: relative;
  border: 2px solid #ffffff; /* 增加边框感 */
  box-shadow: 0 4px 15px rgba(0,0,0,0.3);
  transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.final-rank-item-refined:hover .final-rank-frame {
  transform: scale(1.1) rotate(5deg);
  border-color: #ff0055;
  box-shadow: 0 0 20px rgba(255, 0, 85, 0.4);
}

.final-rank-img-premium {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.vignette-mini {
  position: absolute; inset: 0;
  background: radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.5) 100%);
}
.final-rank-info-refined { flex: 1; text-align: left; }
.final-rank-name-refined { font-weight: 800; color: white; font-size: 0.9rem; margin-bottom: 4px; }
.pop-bar-bg-refined { height: 6px; background: #f1f5f9; border-radius: 3px; overflow: hidden; }
.pop-bar-refined { height: 100%; border-radius: 3px; transition: width 1.5s cubic-bezier(0.34, 1.56, 0.64, 1); }
.pop-value-refined { font-weight: 950; color: #ff0055; font-size: 1rem; width: 40px; text-align: right; text-shadow: 1px 1px 2px #000; }

.timeline-container-wrapper {
  position: relative;
  transition: all 0.4s ease;
}

.timeline-container-wrapper.is-collapsed {
  max-height: 320px;
  overflow: hidden;
}

.timeline-fade-mask {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 80px;
  background: linear-gradient(to bottom, transparent, white);
  pointer-events: none;
}

.expand-toggle-btn {
  background: #f1f5f9;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 12px;
  color: #5d54a4;
  font-weight: 800;
  font-size: 0.85rem;
  cursor: pointer;
  margin-top: 1rem;
  width: 100%;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.expand-toggle-btn:hover {
  background: #e2e8f0;
  border-color: #5d54a4;
  transform: translateY(-2px);
}

.timeline-refined {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding-left: 1rem;
  border-left: 2px solid #f1f5f9;
  margin-left: 0.5rem;
  text-align: left;
}

.timeline-item-refined {
  position: relative;
  animation: fade-in 0.5s ease backwards;
}

@keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }

.timeline-marker {
  position: absolute;
  left: -1.45rem;
  top: 0.2rem;
  width: 12px;
  height: 12px;
  background: white;
  border: 3px solid #5d54a4;
  border-radius: 50%;
}

.timeline-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 0.4rem;
}

.timeline-episode {
  font-size: 0.65rem;
  font-weight: 900;
  color: white;
  background: #94a3b8;
  padding: 2px 6px;
  border-radius: 4px;
}

.timeline-title { font-weight: 800; color: #1e293b; font-size: 0.9rem; }
.timeline-result { font-size: 0.85rem; color: #64748b; line-height: 1.5; margin: 0; }

.settlement-footer {
  margin-top: 4rem;
  padding-top: 2rem;
  border-top: 1px solid #f1f5f9;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
  justify-content: center;
}

.restart-btn-refined {
  padding: 1.2rem 4rem;
  font-size: 1.1rem;
  box-shadow: 0 15px 30px rgba(93, 84, 164, 0.2);
}

.poster-btn {
  min-height: 54px;
  border-color: rgba(255, 255, 255, 0.2) !important;
}

.footer-disclaimer {
  width: 100%;
  font-size: 0.75rem;
  color: #cbd5e1;
  margin-top: 1.5rem;
}

@media (max-width: 768px) {
  .settlement-container-refined { padding: 2rem 1.2rem; }
  .grade-section-floating { position: relative; top: 0; right: 0; margin-bottom: 2rem; display: flex; justify-content: center; }
  .settlement-header-refined { text-align: center; }
  .honor-title-refined { font-size: 2rem; }
  .roster-grid-refined {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
}

/* --- Sudden Event Overlay --- */
.qte-overlay {
  position: fixed; inset: 0; background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(12px); display: flex; align-items: center;
  justify-content: center; z-index: 1000;
}
.qte-modal, .qte-result-modal {
  background: linear-gradient(145deg, #111827, #312e81);
  color: #f8fafc;
  padding: 2rem;
  border-radius: 16px;
  width: 90%; max-width: 450px; text-align: center;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.18);
}
.qte-icon { font-size: 3.2rem; margin-bottom: 1rem; animation: pulse-icon 1.5s infinite; }
@keyframes pulse-icon { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }

.qte-area {
  margin-top: 1.6rem;
  padding: 2rem;
  color: #0f172a;
  background: #f8fafc;
  border: 3px dashed #94a3b8;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
}
.qte-area:active { transform: scale(0.98); background: #e0f2fe; }
.qte-progress-bg { height: 16px; background: #f1f5f9; border-radius: 8px; overflow: hidden; margin-bottom: 1rem; }
.qte-progress-fill { height: 100%; background: linear-gradient(90deg, #5d54a4, #ff9a9e); transition: width 0.1s linear; }
.qte-modal h2,
.qte-modal p,
.qte-result-text {
  color: #f8fafc;
}

.qte-hint {
  color: #1e293b;
  font-weight: 950;
}

/* Timing Bar Styles */
.timing-bar-container {
  height: 24px;
  background: #f1f5f9;
  border-radius: 12px;
  position: relative;
  overflow: hidden;
  margin-bottom: 1rem;
  border: 2px solid #e2e8f0;
}
.timing-target-zone {
  position: absolute;
  left: 40%;
  width: 20%;
  height: 100%;
  background: rgba(34, 197, 94, 0.3);
  border-left: 2px dashed #22c55e;
  border-right: 2px dashed #22c55e;
}
.timing-pointer {
  position: absolute;
  top: 0;
  width: 4px;
  height: 100%;
  background: #5d54a4;
  box-shadow: 0 0 8px rgba(93, 84, 164, 0.5);
  transition: left 0.03s linear;
}
.timing-mode {
  border-color: #5d54a4 !important;
  background: #fdfbff !important;
  color: #1e1b4b;
}

/* --- Global Buttons --- */
.start-button {
  background: linear-gradient(135deg, #5d54a4 0%, #7d73d1 100%);
  color: white; border: none; padding: 0.85rem 1.6rem; font-size: 0.95rem;
  font-weight: 850; border-radius: 12px; cursor: pointer; transition: all 0.3s;
  box-shadow: 0 10px 25px rgba(93, 84, 164, 0.3); display: block; margin: 0 auto;
}
.start-button:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 15px 30px rgba(93, 84, 164, 0.4); }
.start-button:disabled { background: #cbd5e1; box-shadow: none; cursor: not-allowed; }

.secondary-button {
  background: white; color: #5d54a4; border: 2px solid #e2e8f0;
  padding: 0.8rem 2rem; border-radius: 50px; font-weight: 700;
  cursor: pointer; transition: all 0.2s;
}
.secondary-button:hover { border-color: #5d54a4; background: #f8fafc; }

/* --- Transitions --- */
.toast-enter-active, .toast-leave-active { transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
.toast-enter-from { opacity: 0; transform: translate(-50%, -40px); }
.toast-leave-to { opacity: 0; transform: translate(-50%, -20px); }
/* --- Mobile Adaptation (Media Queries) --- */
@media (max-width: 768px) {
  /* Global Adjustments */
  .container {
    padding: 0.8rem;
    padding-bottom: calc(94px + env(safe-area-inset-bottom));
    max-width: 100%;
    overflow-x: hidden;
  }
  .game-view {
    max-width: 100%;
    padding-bottom: calc(96px + env(safe-area-inset-bottom));
  }

  /* Landing Page */
  .word-main { font-size: 4rem !important; letter-spacing: -2px; }
  .word-top { font-size: 1rem !important; letter-spacing: 8px !important; }
  .word-sub { font-size: 0.7rem !important; letter-spacing: 4px !important; }
  .tagline { font-size: 1.1rem !important; }
  .description { font-size: 1rem !important; padding: 0 1rem; }
  .portal-btn { padding: 1.2rem 2.5rem !important; }
  .hero-stats-mini { gap: 1.5rem !important; }
  .h-val { font-size: 1.2rem !important; }
  .status-footer { flex-direction: column; gap: 0.8rem; }

  /* Roster View */
  .roster-hero-section-compact {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  .hero-actions-mini {
    width: 100%;
    justify-content: center;
  }
  .roster-grid-refined {
    gap: 0.5rem !important;
  }
  .char-card-premium {
    padding: 0.5rem 0.8rem !important;
    gap: 0.8rem !important;
  }
  .char-frame {
    width: 48px !important;
    height: 48px !important;
    margin-right: 0.8rem !important;
  }
  .char-info-overlay {
    width: 100px !important;
  }
  .char-controls-premium {
    gap: 0.8rem !important;
  }
  .pop-metrics {
    min-width: 60px !important;
  }
  .char-name-premium { font-size: 0.82rem !important; }
  .char-role-mini { font-size: 0.56rem !important; }

  /* Control Bar */
  .control-bar {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 0.65rem;
    padding: 0.75rem !important;
    align-items: center;
    border-radius: 12px;
  }
  .rec-indicator { order: 1; }
  .episode-tag { order: 2; font-size: 0.82rem !important; justify-self: end; }
  .budget-display { order: 3; align-items: flex-start !important; margin: 0; }
  .control-actions {
    order: 4;
    width: 100%;
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.6rem;
  }
  .top-dash-btn, .toggle-button {
    justify-content: center;
    min-height: 48px;
    padding: 0.55rem 0.7rem !important;
    font-size: 0.75rem !important;
  }

  .studio-nav {
    position: fixed;
    left: 10px;
    right: 10px;
    bottom: calc(10px + env(safe-area-inset-bottom));
    z-index: 900;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 0.4rem;
    margin: 0;
    padding: 0.45rem;
    max-width: none;
    border-radius: 14px;
    background: rgba(2, 6, 23, 0.92);
    border: 1px solid rgba(148, 163, 184, 0.25);
    box-shadow: 0 18px 42px rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(18px);
  }
  .studio-nav button {
    min-height: 54px;
    padding: 0.2rem;
    border-radius: 10px;
    font-size: 0.72rem;
    line-height: 1.25;
  }
  .workspace-panel {
    padding: 1rem;
    margin-bottom: 1rem;
    border-radius: 12px;
  }
  .faction-grid-large,
  .report-metrics,
  .closure-board,
  .closure-board.compact,
  .bond-candidate-grid,
  .mini-ranking-board {
    grid-template-columns: 1fr;
  }
  .workspace-actions button {
    width: 100%;
    min-height: 48px;
  }

  .strategy-console {
    margin: -0.4rem 0 1.2rem;
  }
  .faction-strip {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .card-hand {
    grid-template-columns: 1fr;
  }
  .operation-card {
    min-height: 96px;
  }

  /* Event Container */
  .event-container {
    padding: 1rem !important;
    border-width: 2px !important;
  }
  .event-layout {
    grid-template-columns: 1fr !important;
    gap: 1rem;
  }
  .live-cockpit {
    position: static;
    order: 2;
  }
  .event-main {
    order: 1;
  }
  .event-container h2 { font-size: 1.2rem !important; }
  .event-description { font-size: 0.9rem !important; }
  .candidate-hint { font-size: 0.75rem !important; padding: 6px !important; }
  .focus-preview img {
    width: 58px;
    height: 58px;
  }
  .focus-preview strong {
    font-size: 1rem;
  }
  .camera-lanes {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .camera-lane {
    min-height: 58px;
    grid-template-columns: 34px 1fr;
    gap: 0.5rem;
    padding: 0.5rem;
  }
  .camera-lane img {
    width: 34px;
    height: 34px;
  }
  .camera-lane strong {
    grid-column: 2;
    justify-self: start;
    font-size: 0.76rem;
  }
  .mode-switcher button,
  .range-stepper button {
    min-height: 48px;
  }
  .range-stepper {
    grid-template-columns: 48px minmax(0, 1fr) 48px;
  }
  .director-board {
    grid-template-columns: 1fr !important;
  }
  .director-board-header {
    flex-direction: column;
    align-items: flex-start;
  }
  .directive-card {
    min-height: auto;
    padding: 0.85rem !important;
    border-radius: 10px;
  }
  .directive-copy {
    font-size: 0.86rem !important;
  }

  /* Mini Selection Grid (PICK_TWO) */
  .roster.mini {
    grid-template-columns: repeat(3, 1fr) !important;
    gap: 0.5rem !important;
  }

  /* Trending Manager */
  .trending-manager {
    top: auto;
    bottom: calc(88px + env(safe-area-inset-bottom));
    right: 1rem;
    left: 1rem;
    width: auto;
    gap: 0.65rem;
  }
  .topic-ops {
    align-items: stretch;
    flex-direction: column;
    gap: 0.55rem;
  }
  .op-btn-group {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  /* Side Dashboard */
  .side-dashboard {
    width: 100% !important;
    padding: 1rem !important;
  }
  .dashboard-item { padding: 0.55rem !important; border-radius: 12px !important; }
  .dash-img { width: 32px !important; height: 32px !important; }
  .dash-name { font-size: 0.75rem !important; }
  .toast-hint {
    top: calc(10px + env(safe-area-inset-top));
    left: 12px;
    right: 12px;
    min-width: 0;
    max-width: none;
    transform: none;
    padding: 0.85rem 1rem;
    border-radius: 12px;
    gap: 0.8rem;
  }
  .toast-icon { font-size: 1.4rem; }
  .toast-text { font-size: 0.92rem; }

  /* End Screen */
  .settlement-container-refined {
    padding: 2rem 1rem !important;
  }
  .honor-title-refined { font-size: 1.8rem !important; }
  .analysis-grid-refined { grid-template-columns: 1fr !important; }
  .settlement-dual-layout { flex-direction: column; gap: 2rem; }
  .medals-row { flex-wrap: wrap; justify-content: center; }
}

@media (max-width: 480px) {
  .roster-grid-refined {
    gap: 0.4rem !important;
  }
  .char-frame {
    width: 40px !important;
    height: 40px !important;
    margin-right: 0.5rem !important;
  }
  .char-info-overlay {
    width: 80px !important;
  }
  .char-name-premium { font-size: 0.72rem !important; }
  .char-role-mini { font-size: 0.5rem !important; }
  .roster.mini {
    grid-template-columns: repeat(2, 1fr) !important;
  }
  .studio-nav {
    left: 6px;
    right: 6px;
    gap: 0.25rem;
  }
  .studio-nav button {
    min-height: 50px;
    font-size: 0.66rem;
  }
  .camera-lanes {
    grid-template-columns: 1fr;
  }
  .control-actions {
    grid-template-columns: 1fr;
  }
}
</style>
