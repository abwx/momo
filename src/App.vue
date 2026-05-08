<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { characters as initialCharacters, Character } from './data/characters';
import { openingEvent, eventPool, GameEvent, Choice } from './data/events';
import draggable from 'vuedraggable';

onMounted(() => {
  console.log('Draggable component:', draggable);
});

// --- Reactive State ---
const gameState = ref('roster'); // roster, event, end
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
const lastInterruptionIndex = ref(-1);
const showDanmaku = ref(true);
const isHistoryExpanded = ref(false);

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
  const cost = 5000;
  if (budget.value < cost) {
    toastMessage.value = `❌ 预算不足！应援需要 ¥${cost.toLocaleString()}`;
    showToast.value = true;
    setTimeout(() => showToast.value = false, 1500);
    return;
  }
  
  budget.value -= cost;
  char.popularity += 2;
  clampPopularity();
  addDanmaku(`💖 粉丝豪掷金金！为 ${char.name} 疯狂应援！`);
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
  
  // Construct Game Events: Opening + 7 Random (Total 8 events for more depth)
  const shuffledPool = [...eventPool].sort(() => Math.random() - 0.5);
  gameEvents.value = [openingEvent, ...shuffledPool.slice(0, 7)];
  
  currentEventIndex.value = 0;
  eventHistory.length = 0;
  gameState.value = 'event';
  budget.value = 100000; // 重置预算
  
  triggerEventDanmaku();
  prepareEvent();
}

function prepareEvent() {
  selectedPair.value = [];
  isBreakingNews.value = false;
  qteActive.value = false;
  qteResult.value = null;

  // 每一轮弹出一次热搜
  generateTrendingTopic();

  // 逻辑穿插：确保紧急事件不会扎堆，至少间隔 2 个普通事件
  const canTriggerInterruption = currentEventIndex.value - lastInterruptionIndex.value >= 2;
  const isSudden = canTriggerInterruption && Math.random() < 0.4 && currentEventIndex.value > 0;

  if (isSudden) {
    lastInterruptionIndex.value = currentEventIndex.value;
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
    qteResult.value = scenario.successText;
    addDanmaku("这就是制作人的实力吗？瑞思拜！");
  } else {
    const penalty = 3;
    characters.forEach(c => c.popularity -= penalty);
    qteResult.value = scenario.failText;
    addDanmaku("救命，刚才那段真的好尬...");
  }
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
  // 记录历史
  eventHistory.push({ event: currentEvent.value!, result });
  
  // 识别受影响的成员 (通过简单的文本匹配或当前选中的成员)
  const affectedIds = new Set<string>();
  characters.forEach(c => {
    if (result.includes(c.name)) {
      affectedIds.add(c.id);
    }
  });
  // 如果是 PICK_TWO，也高亮选中的两个人
  if (selectedPair.value.length > 0) {
    selectedPair.value.forEach(c => affectedIds.add(c.id));
  }

  // 显示提示和高亮
  toastMessage.value = result;
  showToast.value = true;
  highlightedCharIds.value = affectedIds;

  // 增加即时反馈弹幕
  addDanmaku(`🔥 现场热报：${result.slice(0, 20)}...`);

  // 缩短至 1.5s
  setTimeout(() => {
    showToast.value = false;
    highlightedCharIds.value = new Set();
    nextEvent();
  }, 1500);
}

function handleChoice(choice: Choice) {
  const result = choice.action(characters);
  clampPopularity();
  triggerFeedback(result);
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
  
  const qteSuccesses = eventHistory.filter(h => h.result.includes("✅")).length;
  if (qteSuccesses >= 3) medals.push({ icon: '⚡', title: '临场专家', desc: 'QTE无失误' });

  return medals;
});

</script>

<template>
  <div class="container">
    <!-- 1. Roster/Start Screen -->
    <div v-if="gameState === 'roster'" class="roster-view-compact">
      <div class="roster-header-compact">
        <div class="header-title-group">
          <h1>四代团综镜头分配模拟器</h1>
          <p class="roster-hint">💡 列表已按成员姓名首字母排序</p>
          <p class="disclaimer">⚠️ 本程序仅供娱乐模拟，内容与真人无关，请勿上升现实</p>
        </div>
        <div class="header-actions">
          <button @click="randomizePopularity" class="secondary-button mini">🎲 随机人气</button>
          <button @click="startGame" class="start-button mini">开始录制</button>
        </div>
      </div>

      <div class="roster-compact">
        <div v-for="character in characters" :key="character.id" class="character-card-horizontal">
          <img :src="getImageUrl(character.image)" :alt="character.name" class="char-img-mini" loading="lazy" />
          <div class="char-info-mini">
            <div class="char-name-mini">{{ character.name }}</div>
            <div class="pop-edit-mini">
              <span class="pop-label-mini">人气:</span>
              <input type="number" v-model.number="character.popularity" min="0" max="150" class="pop-input-mini" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. Event Screen -->
    <div v-if="gameState === 'event' && currentEvent" class="game-view">
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
          <span class="rec-text">LIVE RECORDING</span>
        </div>
        <div class="episode-tag">EPISODE {{ currentEventIndex + 1 }} / {{ gameEvents.length }}</div>
        <div class="budget-display" :class="{ 'budget-low': budget < 30000 }">
          <span class="budget-label">公关预算</span>
          <span class="budget-value">¥{{ budget.toLocaleString() }}</span>
        </div>
        <div class="control-actions">
          <button @click="showDanmaku = !showDanmaku" class="toggle-button" :class="{ 'off': !showDanmaku }">
            {{ showDanmaku ? '📺 弹幕: 开' : '📺 弹幕: 关' }}
          </button>
        </div>
      </div>

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

      <div class="event-layout">
        <!-- Floating Dashboard Toggle Button -->
        <button 
          @click="showPopularityDashboard = !showPopularityDashboard" 
          class="floating-dash-btn"
          :class="{ 'has-trending': isAnyTrending }"
        >
          <span class="btn-icon">📊</span>
          <span class="btn-text">人气看板</span>
          <span v-if="isAnyTrending" class="trending-dot"></span>
        </button>

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
                <span class="ticker-label">NOW TRENDING</span>
                <div class="ticker-content">
                  #{{ sortedCharacters[0].name }} 舞台实力# #四代团综录制#
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

        <div class="event-main">
          <div class="event-container" :class="{ 'breaking-news-border': isBreakingNews, 'glitch-anim': isBreakingNews }">
            <div v-if="isBreakingNews" class="breaking-news-tag">BREAKING NEWS / 突发状况</div>
            <div class="progress-bar">
              <div class="progress" :style="{ width: ((currentEventIndex + 1) / gameEvents.length) * 100 + '%' }"></div>
            </div>
            <h2>{{ currentEvent.title }}</h2>
            <p class="event-description">{{ processedDescription }}</p>
            <p class="candidate-hint">💡 候选人说明：当前人气前 5 名成员</p>

            <!-- CHOICE Event Type -->
            <div v-if="currentEvent.type === 'CHOICE'" class="choices-grid">
              <button 
                v-for="(choice, index) in (typeof currentEvent.choices === 'function' ? currentEvent.choices(eventCandidates) : currentEvent.choices)" 
                :key="index" 
                @click="handleChoice(choice)" 
                class="choice-button"
              >
                {{ choice.text }}
              </button>
            </div>

            <!-- PICK_TWO Event Type -->
        <div v-if="currentEvent.type === 'PICK_TWO'">
          <p class="pick-two-hint">请从人气最高的前五名中选择两位 (已选 {{ selectedPair.length }} / 2)</p>
          <div class="roster mini">
            <div 
              v-for="character in rankingList" 
              :key="character.id" 
              class="character-card-selectable" 
              :class="{ selected: isSelected(character) }"
              @click="toggleSelection(character)"
            >
              <img :src="getImageUrl(character.image)" :alt="character.name" class="character-image" />
              <div class="character-name">{{ character.name }}</div>
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
              <div class="grade-stamp">CERTIFIED</div>
            </div>
          </div>

          <div class="settlement-header-refined">
            <div class="producer-badge-refined" :style="{ backgroundColor: producerTitle.color }">PRODUCER REPORT</div>
            <h1 class="honor-title-refined">{{ producerTitle.name }}</h1>
            <p class="honor-subtitle-refined">本期录制综合表现评定报告</p>
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

          <!-- Producer Analysis Section -->
          <div class="analysis-grid-refined">
            <div v-for="(item, index) in producerAnalysis" :key="index" class="analysis-card-refined" :style="{ animationDelay: (index * 0.1) + 's' }">
              <div class="analysis-card-header">
                <span class="analysis-card-icon">
                  <template v-if="item.label === '核心策略'">🎯</template>
                  <template v-else-if="item.label === '风险偏好'">🎲</template>
                  <template v-else-if="item.label === '公关投入'">💰</template>
                  <template v-else-if="item.label === '国民认可'">🌍</template>
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
                        <span class="timeline-episode">EP {{ index + 1 }}</span>
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
                  <img :src="getImageUrl(char.image)" :alt="char.name" class="final-rank-img-refined" />
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
            <button @click="gameState = 'roster'" class="start-button restart-btn-refined">开启下一期运营计划</button>
            <p class="footer-disclaimer">模拟数据仅供娱乐</p>
          </div>
        </div>
    </div>

  </div>
</template>

<style scoped>
/* --- Design System & Global Polish --- */
.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  color: #1e293b;
}

h1 {
  font-size: 2rem; /* Reduced from 2.5rem */
  font-weight: 900;
  background: linear-gradient(135deg, #5d54a4 0%, #7d73d1 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 0.25rem;
  text-align: center;
}

.subtitle {
  color: #64748b;
  font-size: 0.95rem; /* Reduced from 1.1rem */
  margin-bottom: 2rem; /* Reduced from 3rem */
  text-align: center;
}

/* --- Danmaku Layer --- */
.danmaku-container {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  pointer-events: none; z-index: 100; overflow: hidden;
}
.danmaku-item {
  position: absolute; right: -100%; white-space: nowrap;
  font-size: 1.1rem; color: rgba(93, 84, 164, 0.7);
  font-weight: 600; text-shadow: 1px 1px 2px rgba(255,255,255,0.8);
  animation: danmaku-move linear forwards;
}
@keyframes danmaku-move {
  from { right: -100%; }
  to { right: 200%; }
}

/* --- Control Bar --- */
.control-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.2rem 2.5rem;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(16px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 4px 20px rgba(0,0,0,0.03);
  margin-bottom: 2.5rem;
}

.rec-indicator { display: flex; align-items: center; gap: 10px; }
.rec-dot {
  width: 10px; height: 10px; background: #ff4d4f; border-radius: 50%;
  animation: blink 1s infinite;
}
@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
.rec-text { font-size: 0.75rem; font-weight: 900; color: #ff4d4f; letter-spacing: 1px; }

.budget-display { display: flex; flex-direction: column; align-items: center; }
.budget-label { font-size: 0.7rem; color: #94a3b8; font-weight: 800; text-transform: uppercase; }
.budget-value { font-family: 'Monaco', monospace; font-weight: 900; color: #10b981; font-size: 1.25rem; }
.budget-low .budget-value { color: #ef4444; animation: pulse-red 1s infinite; }
@keyframes pulse-red { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }

.toggle-button {
  background: #f1f5f9; border: none; padding: 0.6rem 1.2rem;
  border-radius: 12px; font-weight: 700; color: #64748b; cursor: pointer;
  transition: all 0.2s;
}
.toggle-button.off { opacity: 0.6; text-decoration: line-through; }

/* --- Trending Manager --- */
.trending-manager {
  position: fixed; top: 120px; right: 2rem; z-index: 100;
  display: flex; flex-direction: column; gap: 1rem; width: 320px;
}

.manager-hint {
  font-size: 0.75rem;
  background: rgba(15, 23, 42, 0.8);
  color: white;
  padding: 4px 12px;
  border-radius: 50px;
  backdrop-filter: blur(4px);
  margin-bottom: -0.5rem;
  align-self: flex-start;
  animation: bounce-horizontal 2s infinite;
}

@keyframes bounce-horizontal {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(5px); }
}
.trending-action-card {
  background: white; padding: 1.2rem; border-radius: 20px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.08); border-left: 6px solid #e2e8f0;
  position: relative; overflow: hidden;
  animation: slide-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.trending-action-card.positive { border-left-color: #ff9a9e; }
.trending-action-card.negative { border-left-color: #1e293b; }

.topic-timer-bar {
  position: absolute; top: 0; left: 0; height: 4px;
  background: rgba(0,0,0,0.05); transition: width 0.1s linear;
}
.positive .topic-timer-bar { background: #ff9a9e; }
.negative .topic-timer-bar { background: #1e293b; }

.topic-info { margin-bottom: 0.8rem; }
.topic-type { 
  font-size: 0.65rem; font-weight: 900; padding: 2px 8px; 
  border-radius: 6px; background: #f1f5f9; display: inline-block; margin-bottom: 4px;
}
.positive .topic-type { background: #fff1f2; color: #ff4d4f; }
.negative .topic-type { background: #f8fafc; color: #1e293b; }
.topic-name { display: block; font-weight: 800; font-size: 0.95rem; }
.topic-ops { display: flex; justify-content: space-between; align-items: center; }
.op-btn-group { display: flex; gap: 8px; }
.topic-cost { font-size: 0.8rem; font-weight: 700; color: #64748b; }
.op-btn {
  background: #5d54a4; color: white; border: none; padding: 6px 14px;
  border-radius: 10px; font-size: 0.8rem; font-weight: 800; cursor: pointer;
  transition: all 0.2s;
}
.op-btn.insufficient-funds {
  background: #cbd5e1;
  cursor: pointer;
}
.op-btn.ignore {
  background: #f1f5f9;
  color: #64748b;
}
.op-btn.ignore:hover {
  background: #e2e8f0;
  color: #1e293b;
}
.op-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 4px 10px rgba(93, 84, 164, 0.3); }

@keyframes slide-in { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

/* --- Layout --- */
.event-layout { position: relative; width: 100%; }

/* Floating Button */
.floating-dash-btn {
  position: fixed;
  bottom: 2rem;
  right: 1.5rem;
  z-index: 99;
  background: white;
  border: none;
  border-radius: 50px;
  padding: 0.8rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  border: 2px solid transparent;
}

.floating-dash-btn:hover {
  transform: translateY(-5px) scale(1.05);
  box-shadow: 0 15px 40px rgba(0,0,0,0.2);
}

.floating-dash-btn.has-trending {
  border-color: #ff4d4f;
  animation: pulse-border 2s infinite;
}

@keyframes pulse-border {
  0% { box-shadow: 0 0 0 0 rgba(255, 77, 79, 0.4); }
  70% { box-shadow: 0 0 0 15px rgba(255, 77, 79, 0); }
  100% { box-shadow: 0 0 0 0 rgba(255, 77, 79, 0); }
}

.btn-icon { font-size: 1.2rem; }
.btn-text { font-weight: 800; color: #1e293b; font-size: 0.9rem; }

.trending-dot {
  width: 8px;
  height: 8px;
  background: #ff4d4f;
  border-radius: 50%;
  position: absolute;
  top: 5px;
  right: 15px;
  border: 2px solid white;
}

/* Dashboard Overlay */
.side-dashboard-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(8px);
  z-index: 1000;
  display: flex;
  justify-content: flex-end;
}

.side-dashboard {
  width: 340px;
  height: 100%;
  background: white;
  padding: 2rem;
  box-shadow: -10px 0 40px rgba(0,0,0,0.1);
  overflow-y: auto;
  position: relative;
  display: flex;
  flex-direction: column;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f1f5f9;
}

.dashboard-header h3 { margin: 0; color: #1e293b; font-size: 1.2rem; }

.header-main {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.dashboard-instruction {
  font-size: 0.7rem;
  color: #ff9a9e;
  margin: 0;
  font-weight: 700;
}

.close-dash-btn {
  background: #f1f5f9;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  cursor: pointer;
  color: #64748b;
  transition: all 0.2s;
}

.close-dash-btn:hover { background: #e2e8f0; color: #1e293b; }

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
  background: #fdf2f2; border-radius: 12px; padding: 0.6rem;
  margin-bottom: 1.5rem; border: 1px solid #fee2e2; overflow: hidden;
}
.ticker-label { font-size: 0.6rem; font-weight: 900; color: #ef4444; display: block; }
.ticker-content { font-size: 0.75rem; color: #b91c1c; white-space: nowrap; animation: ticker-scroll 12s linear infinite; }
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

.event-main { flex: 1; }
.event-container {
  background: white; padding: 3rem; border-radius: 36px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.02); position: relative;
}
.event-container h2 { font-size: 1.8rem; color: #1e293b; margin-bottom: 1.5rem; text-align: center; }
.event-description { font-size: 1.15rem; line-height: 1.7; color: #475569; margin-bottom: 2rem; }
.candidate-hint { font-size: 0.85rem; color: #94a3b8; font-style: italic; margin-bottom: 2rem; text-align: center; }

/* --- Compact Roster Styles --- */
.roster-view-compact {
  background: linear-gradient(145deg, #ffffff, #f9f7ff);
  padding: 1.5rem;
  border-radius: 32px;
  box-shadow: 0 10px 40px rgba(93, 84, 164, 0.05);
  border: 1px solid rgba(93, 84, 164, 0.1);
}

.roster-header-compact {
  display: flex;
  flex-direction: column; /* Stack on mobile */
  gap: 1.2rem;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #f1f5f9;
}

@media (min-width: 768px) {
  .roster-header-compact {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}

.roster-header-compact h1 {
  margin: 0;
  font-size: 1.8rem;
  background: linear-gradient(135deg, #5d54a4 0%, #ff9a9e 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 950;
  letter-spacing: -1px;
}

.header-title-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.roster-hint {
  font-size: 0.85rem;
  color: #5d54a4;
  margin: 0;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
}

.disclaimer {
  font-size: 0.7rem;
  color: #94a3b8;
  margin: 0;
  opacity: 0.8;
}

.header-actions {
  display: flex;
  gap: 0.8rem;
}

.secondary-button.mini, .start-button.mini {
  padding: 0.7rem 1.4rem;
  font-size: 0.9rem;
  border-radius: 14px;
  font-weight: 800;
  white-space: nowrap;
}

.roster-compact {
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* Forced 2 columns */
  gap: 0.8rem;
}

@media (min-width: 1024px) {
  .roster-compact {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.2rem;
  }
}

.character-card-horizontal {
  display: flex;
  flex-direction: column; /* Vertical on mobile to save width */
  align-items: center;
  gap: 0.8rem;
  padding: 1.2rem 0.8rem;
  background: white;
  border-radius: 24px;
  border: 1px solid #f1f5f9;
  box-shadow: 0 4px 15px rgba(0,0,0,0.02);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  overflow: hidden;
}

@media (min-width: 768px) {
  .character-card-horizontal {
    flex-direction: row;
    padding: 1rem 1.2rem;
    text-align: left;
  }
}

.character-card-horizontal::before {
  content: "";
  position: absolute;
  top: 0; left: 0; width: 4px; height: 100%;
  background: #5d54a4;
  opacity: 0;
  transition: opacity 0.2s;
}

.character-card-horizontal:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(93, 84, 164, 0.1);
  border-color: rgba(93, 84, 164, 0.2);
}

.character-card-horizontal:hover::before {
  opacity: 1;
}

.char-img-mini {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #fdfbff;
  box-shadow: 0 4px 10px rgba(0,0,0,0.08);
}

.char-info-mini {
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

@media (min-width: 768px) {
  .char-info-mini {
    align-items: flex-start;
  }
}

.char-name-mini {
  font-weight: 900;
  font-size: 1rem;
  color: #1e293b;
  margin-bottom: 4px;
}

.pop-edit-mini {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #f8f9fa;
  padding: 2px 8px;
  border-radius: 12px;
}

.pop-label-mini {
  font-size: 0.65rem;
  color: #64748b;
  font-weight: 800;
  text-transform: uppercase;
}

.pop-input-mini {
  width: 45px;
  border: none;
  background: transparent;
  color: #5d54a4;
  font-weight: 900;
  font-size: 0.95rem;
  text-align: center;
  padding: 4px 0;
}

.pop-input-mini:focus {
  outline: none;
}

/* --- Components --- */
.roster {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); /* Reduced from 220px */
  gap: 1rem; /* Reduced from 1.5rem */
  margin-bottom: 2rem;
}
.roster.mini { grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 1rem; }

.character-card-static, .character-card-selectable {
  background: white; padding: 1rem; /* Reduced from 1.5rem */
  border-radius: 20px; /* More compact radius */
  border: 1px solid #f1f5f9; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex; flex-direction: column; align-items: center;
}
.character-card-static:hover, .character-card-selectable:hover {
  transform: translateY(-4px); box-shadow: 0 12px 20px -5px rgba(0, 0, 0, 0.05);
}
.character-card-selectable.selected {
  border-color: #ff9a9e; background: #fff1f2; transform: translateY(-4px) scale(1.02);
  box-shadow: 0 15px 20px -5px rgba(255, 154, 158, 0.2);
}

.character-image {
  width: 64px; /* Reduced from 80px */
  height: 64px;
  border-radius: 50%; object-fit: cover;
  margin-bottom: 0.8rem; border: 3px solid #f8fafc; box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}
.roster.mini .character-image { width: 52px; height: 52px; border-width: 2px; }

.character-name { font-weight: 800; font-size: 1rem; color: #1e293b; }
.character-description { 
  font-size: 0.75rem; /* Smaller font */
  color: #64748b; line-height: 1.4; 
  margin-top: 0.5rem; text-align: center;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; /* Clamp to 2 lines */
}

.popularity-input-wrapper {
  margin-top: 0.75rem; display: flex; align-items: center; gap: 6px;
  background: #f8fafc; padding: 0.3rem 0.8rem; border-radius: 10px;
}
.pop-label { font-size: 0.7rem; font-weight: 800; color: #64748b; }
.pop-input {
  width: 45px; border: none; background: transparent; color: #5d54a4;
  font-weight: 900; font-size: 0.95rem; text-align: center;
}

.choices-grid { display: grid; gap: 1rem; }
.choice-button {
  background: #f8fafc; border: 1px solid #f1f5f9; padding: 1.5rem 2rem;
  border-radius: 20px; font-size: 1.1rem; font-weight: 700; color: #334155;
  text-align: left; cursor: pointer; transition: all 0.2s;
  display: flex; justify-content: space-between; align-items: center;
}
.choice-button:hover { background: white; border-color: #5d54a4; color: #5d54a4; transform: scale(1.02); }
.choice-button::after { content: "→"; opacity: 0; transform: translateX(-10px); transition: all 0.2s; }
.choice-button:hover::after { opacity: 1; transform: translateX(0); }

.drag-list { display: flex; flex-direction: column; gap: 0.75rem; }
.drag-item {
  display: flex; align-items: center; padding: 1rem; background: #f8fafc;
  border-radius: 16px; border: 1px solid #f1f5f9; cursor: grab;
}
.rank-badge {
  width: 28px; height: 28px; background: #cbd5e1; color: white;
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  font-weight: 900; font-size: 0.8rem; transition: all 0.3s;
}
.rank-badge.rank-1 { background: linear-gradient(135deg, #FFD700, #FFA500); box-shadow: 0 4px 10px rgba(255, 215, 0, 0.3); transform: scale(1.1); }
.rank-badge.rank-2 { background: linear-gradient(135deg, #C0C0C0, #808080); }
.rank-badge.rank-3 { background: linear-gradient(135deg, #CD7F32, #A0522D); }

.drag-item {
  display: flex; align-items: center; padding: 1rem; background: white;
  border-radius: 18px; border: 1px solid #f1f5f9; cursor: grab;
  transition: all 0.2s; user-select: none; touch-action: none;
}
.drag-item:hover { border-color: #5d54a4; transform: scale(1.01); }
.drag-item:active { cursor: grabbing; }

.drag-img { width: 36px; height: 36px; border-radius: 50%; object-fit: cover; margin: 0 1rem; border: 2px solid #f8fafc; }

/* --- Toast --- */
.toast-hint {
  position: fixed; bottom: 10%; left: 50%; transform: translateX(-50%);
  background: white; padding: 1.5rem 2.5rem; border-radius: 24px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.15); display: flex; align-items: center;
  gap: 1.5rem; z-index: 2000; border-left: 8px solid #5d54a4; width: 90%; max-width: 550px;
}
.toast-icon { font-size: 2.2rem; }
.toast-title { font-size: 0.75rem; font-weight: 900; color: #94a3b8; text-transform: uppercase; margin-bottom: 4px; }
.toast-text { font-size: 1.1rem; font-weight: 700; color: #1e293b; line-height: 1.5; }

/* --- Settlement Refined Styles --- */
.end-screen {
  padding: 1rem;
  background: #f8fafc;
}

.settlement-container-refined {
  max-width: 1000px;
  margin: 0 auto;
  background: white;
  border-radius: 40px;
  padding: 3rem 2rem;
  position: relative;
  box-shadow: 0 20px 60px rgba(0,0,0,0.05);
  border: 1px solid #f1f5f9;
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
.medal-title { font-size: 0.85rem; font-weight: 900; color: #1e293b; }
.medal-desc { font-size: 0.65rem; color: #64748b; font-weight: 600; }

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
  width: 100px;
  height: 100px;
  border: 8px solid;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: white;
  transform: rotate(15deg);
  box-shadow: 0 10px 20px rgba(0,0,0,0.05);
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
  font-size: 2.5rem;
  font-weight: 950;
  color: #1e293b;
  margin: 0 0 0.5rem 0;
  letter-spacing: -1px;
}

.honor-subtitle-refined {
  font-size: 1.1rem;
  color: #64748b;
  margin: 0;
}

.analysis-grid-refined {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.2rem;
  margin-bottom: 3rem;
}

.analysis-card-refined {
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 24px;
  text-align: left;
  border: 1px solid #f1f5f9;
  animation: slide-up 0.5s ease backwards;
}

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
  background: white;
  border-radius: 18px;
  margin-bottom: 0.8rem;
  border: 1px solid #f1f5f9;
  animation: slide-in-left 0.4s ease backwards;
}

@keyframes slide-in-left {
  from { transform: translateX(-20px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

.final-rank-num-refined { font-weight: 900; color: #cbd5e1; width: 24px; font-style: italic; font-size: 1.1rem; }
.final-rank-num-refined.top-3 { color: #ff9a9e; font-size: 1.3rem; }
.final-rank-img-refined { width: 44px; height: 44px; border-radius: 50%; object-fit: cover; border: 2px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
.final-rank-info-refined { flex: 1; text-align: left; }
.final-rank-name-refined { font-weight: 800; color: #1e293b; font-size: 0.9rem; margin-bottom: 4px; }
.pop-bar-bg-refined { height: 6px; background: #f1f5f9; border-radius: 3px; overflow: hidden; }
.pop-bar-refined { height: 100%; border-radius: 3px; transition: width 1.5s cubic-bezier(0.34, 1.56, 0.64, 1); }
.pop-value-refined { font-weight: 900; color: #1e293b; font-size: 0.9rem; width: 35px; text-align: right; }

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
}

.restart-btn-refined {
  padding: 1.2rem 4rem;
  font-size: 1.1rem;
  box-shadow: 0 15px 30px rgba(93, 84, 164, 0.2);
}

.footer-disclaimer {
  font-size: 0.75rem;
  color: #cbd5e1;
  margin-top: 1.5rem;
}

@media (max-width: 768px) {
  .settlement-container-refined { padding: 2rem 1.2rem; }
  .grade-section-floating { position: relative; top: 0; right: 0; margin-bottom: 2rem; display: flex; justify-content: center; }
  .settlement-header-refined { text-align: center; }
  .honor-title-refined { font-size: 2rem; }
}

/* --- Sudden Event Overlay --- */
.qte-overlay {
  position: fixed; inset: 0; background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(12px); display: flex; align-items: center;
  justify-content: center; z-index: 1000;
}
.qte-modal, .qte-result-modal {
  background: white; padding: 3rem; border-radius: 40px;
  width: 90%; max-width: 450px; text-align: center;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}
.qte-icon { font-size: 5rem; margin-bottom: 1.5rem; animation: pulse-icon 1.5s infinite; }
@keyframes pulse-icon { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }

.qte-area {
  margin-top: 2.5rem; padding: 3rem; border: 3px dashed #e2e8f0;
  border-radius: 24px; cursor: pointer; transition: all 0.2s;
}
.qte-area:active { transform: scale(0.98); background: #f8fafc; }
.qte-progress-bg { height: 16px; background: #f1f5f9; border-radius: 8px; overflow: hidden; margin-bottom: 1rem; }
.qte-progress-fill { height: 100%; background: linear-gradient(90deg, #5d54a4, #ff9a9e); transition: width 0.1s linear; }

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
}

/* --- Global Buttons --- */
.start-button {
  background: linear-gradient(135deg, #5d54a4 0%, #7d73d1 100%);
  color: white; border: none; padding: 1.2rem 3.5rem; font-size: 1.25rem;
  font-weight: 900; border-radius: 50px; cursor: pointer; transition: all 0.3s;
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
.toast-enter-from { opacity: 0; transform: translate(-50%, 40px); }
.toast-leave-to { opacity: 0; transform: translate(-50%, -20px); }
</style>
