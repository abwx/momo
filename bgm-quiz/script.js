const QUESTIONS = [
  {
    id: "scene",
    title: "当你走在路上，最常出现的画面是？",
    desc: "随便选一个最贴近你当下状态的选项。",
    options: [
      { text: "人群里很安静，我只听见自己的脚步声", w: { calm: 2, intro: 2 } },
      { text: "阳光很亮，我想快点奔向下一站", w: { bright: 2, drive: 2 } },
      { text: "灯光闪烁，像在开一场只属于我的演唱会", w: { hype: 2, bold: 2 } },
      { text: "风很大，像一部电影的转场", w: { epic: 2, emo: 1 } },
    ],
  },
  {
    id: "decision",
    title: "遇到选择，你更像哪种人？",
    desc: "",
    options: [
      { text: "先做再说，路走出来的", w: { drive: 2, bold: 1 } },
      { text: "先想清楚，少走弯路", w: { calm: 2, intro: 1 } },
      { text: "跟随感觉，情绪是导航", w: { emo: 2 } },
      { text: "看场景，灵活变换", w: { bright: 1, calm: 1, hype: 1 } },
    ],
  },
  {
    id: "stress",
    title: "压力上来时，你最常做什么？",
    desc: "",
    options: [
      { text: "戴上耳机，把世界关小一点", w: { intro: 2, calm: 1 } },
      { text: "运动/走路，把能量甩出去", w: { drive: 2, hype: 1 } },
      { text: "写点东西，把情绪倒出来", w: { emo: 2, calm: 1 } },
      { text: "找人聊天，把心事说开", w: { bright: 2 } },
    ],
  },
  {
    id: "love",
    title: "你理想的关系更像？",
    desc: "",
    options: [
      { text: "细水长流，安全感第一", w: { calm: 2, intro: 1 } },
      { text: "并肩作战，一起升级打怪", w: { drive: 2, epic: 1 } },
      { text: "情绪共振，彼此懂得", w: { emo: 2 } },
      { text: "热烈真诚，快乐共享", w: { bright: 2, hype: 1 } },
    ],
  },
  {
    id: "weekend",
    title: "周末你更想怎么过？",
    desc: "",
    options: [
      { text: "宅家充电，做点自己的事", w: { intro: 2, calm: 1 } },
      { text: "去一个新地方，收集新鲜感", w: { bright: 2, epic: 1 } },
      { text: "和朋友聚会，越热闹越好", w: { hype: 2, bright: 1 } },
      { text: "随缘，看心情", w: { emo: 1, calm: 1 } },
    ],
  },
  {
    id: "taste",
    title: "你偏爱的音乐氛围是？",
    desc: "",
    options: [
      { text: "Lo-fi / Chill / 低饱和", w: { calm: 2 } },
      { text: "City Pop / 明亮复古", w: { bright: 2 } },
      { text: "摇滚 / 电子 / 现场感", w: { hype: 2, bold: 1 } },
      { text: "史诗 / 电影感 / 宏大", w: { epic: 2 } },
    ],
  },
  {
    id: "goal",
    title: "你今年最想完成的事是？",
    desc: "",
    options: [
      { text: "更稳定、更清晰", w: { calm: 2, drive: 1 } },
      { text: "更自由、更快乐", w: { bright: 2, hype: 1 } },
      { text: "更勇敢、更锋利", w: { bold: 2, drive: 1 } },
      { text: "更深刻、更理解自己", w: { emo: 2, intro: 1 } },
    ],
  },
  {
    id: "memory",
    title: "你更容易被哪种瞬间打动？",
    desc: "",
    options: [
      { text: "突然的安静，像时间停了一秒", w: { calm: 2, emo: 1 } },
      { text: "有人在关键时刻坚定站你身边", w: { epic: 2 } },
      { text: "笑到肚子痛的那一刻", w: { bright: 2, hype: 1 } },
      { text: "我终于做到了的那一刻", w: { drive: 2, bold: 1 } },
    ],
  },
  {
    id: "color",
    title: "如果用一个颜色代表你今天，你选？",
    desc: "",
    options: [
      { text: "深蓝", w: { calm: 2, intro: 1 } },
      { text: "橙黄", w: { bright: 2 } },
      { text: "紫红", w: { emo: 2, bold: 1 } },
      { text: "青绿", w: { hype: 1, epic: 1, bright: 1 } },
    ],
  },
  {
    id: "ending",
    title: "你希望这段“人生BGM”听起来像？",
    desc: "最后一题。",
    options: [
      { text: "温柔但有力量", w: { calm: 2, epic: 1 } },
      { text: "明亮又轻快", w: { bright: 2, hype: 1 } },
      { text: "燃到发光", w: { drive: 2, bold: 1, hype: 1 } },
      { text: "克制但很深", w: { intro: 2, emo: 1 } },
    ],
  },
];
 
const RESULTS = [
  {
    id: "chill-wave",
    badge: "低饱和 · 温柔稳定",
    title: "你的“人生BGM”是：柔光低频",
    desc: "你不是慢，而是把能量留给真正重要的事。你适合在平稳的鼓点里，悄悄把生活推进。",
    keywords: ["Lo-fi", "Chill", "Late Night Drive", "Soft Beat", "Warm Synth"],
    query: "lofi chill warm synth late night drive",
    score: (s) => (s.calm || 0) + (s.intro || 0) * 0.8,
  },
  {
    id: "sunny-pop",
    badge: "明亮 · 轻快向前",
    title: "你的“人生BGM”是：晴天副歌",
    desc: "你靠好奇心续命，靠快乐回血。你的生活里总能挤出一段让人想跟着哼的旋律。",
    keywords: ["City Pop", "Upbeat", "Bright Guitar", "Feel Good", "Morning Walk"],
    query: "city pop upbeat bright guitar feel good",
    score: (s) => (s.bright || 0) + (s.hype || 0) * 0.6,
  },
  {
    id: "fire-run",
    badge: "燃 · 目标感强",
    title: "你的“人生BGM”是：冲刺前奏",
    desc: "你不喜欢等风来，你喜欢自己制造风。你的人生像一段渐进式升调，越走越热。",
    keywords: ["Electronic Rock", "Workout", "Build Up", "Punchy Drum", "Run Mode"],
    query: "electronic rock workout build up punchy drum run mode",
    score: (s) => (s.drive || 0) + (s.bold || 0) * 0.7 + (s.hype || 0) * 0.3,
  },
  {
    id: "cinema-heart",
    badge: "电影感 · 情绪浓度高",
    title: "你的“人生BGM”是：电影长镜头",
    desc: "你对世界的感受更细，也更深。你的人生像一段配乐，情绪起伏都是剧情。",
    keywords: ["Cinematic", "Ambient", "Epic Strings", "Emotional", "Long Take"],
    query: "cinematic ambient epic strings emotional long take",
    score: (s) => (s.epic || 0) + (s.emo || 0) * 0.9,
  },
];
 
const $ = (id) => document.getElementById(id);
 
const screenStart = $("screen-start");
const screenQuiz = $("screen-quiz");
const screenResult = $("screen-result");
 
const btnStart = $("btn-start");
const btnBack = $("btn-back");
const btnSkip = $("btn-skip");
const btnRestart = $("btn-restart");
const btnReview = $("btn-review");
 
const progressFill = $("progress-fill");
const progressText = $("progress-text");
const qTitle = $("q-title");
const qDesc = $("q-desc");
const optionsEl = $("options");
 
const resultBadge = $("result-badge");
const resultTitle = $("result-title");
const resultDesc = $("result-desc");
const resultChips = $("result-chips");
const linkSearch = $("link-search");
const linkShare = $("link-share");
const shareHint = $("share-hint");
const answersEl = $("answers");
const answersList = $("answers-list");
 
const state = {
  step: 0,
  answers: new Array(QUESTIONS.length).fill(null),
};
 
const encodeState = (resultId, answers) => {
  const a = answers.map((x) => (x == null ? "-" : String(x))).join("");
  const params = new URLSearchParams();
  params.set("r", resultId);
  params.set("a", a);
  return `${location.origin}${location.pathname}?${params.toString()}`;
};
 
const parseStateFromUrl = () => {
  const params = new URLSearchParams(location.search);
  const r = params.get("r");
  const a = params.get("a");
  if (!r || !a) return null;
  const answers = a.split("").map((ch) => (ch === "-" ? null : Number(ch)));
  if (answers.length !== QUESTIONS.length) return null;
  if (!RESULTS.some((x) => x.id === r)) return null;
  if (answers.some((x) => x != null && (Number.isNaN(x) || x < 0 || x > 3))) return null;
  return { r, answers };
};
 
const show = (el) => el.classList.remove("hidden");
const hide = (el) => el.classList.add("hidden");
 
const getScore = (answers) => {
  const score = {};
  for (let i = 0; i < answers.length; i++) {
    const idx = answers[i];
    if (idx == null) continue;
    const opt = QUESTIONS[i].options[idx];
    if (!opt) continue;
    for (const [k, v] of Object.entries(opt.w)) {
      score[k] = (score[k] || 0) + v;
    }
  }
  return score;
};
 
const pickResult = (answers) => {
  const s = getScore(answers);
  let best = RESULTS[0];
  let bestScore = -Infinity;
  for (const r of RESULTS) {
    const val = r.score(s);
    if (val > bestScore) {
      best = r;
      bestScore = val;
    }
  }
  return best;
};
 
const renderQuiz = () => {
  const total = QUESTIONS.length;
  const step = state.step;
  const q = QUESTIONS[step];
 
  const percent = Math.round(((step + 1) / total) * 100);
  progressFill.style.width = `${percent}%`;
  progressText.textContent = `${step + 1} / ${total}`;
 
  qTitle.textContent = q.title;
  qDesc.textContent = q.desc || "";
 
  optionsEl.innerHTML = "";
  const selected = state.answers[step];
  q.options.forEach((opt, idx) => {
    const row = document.createElement("div");
    row.className = "option" + (selected === idx ? " selected" : "");
    row.tabIndex = 0;
 
    const dot = document.createElement("div");
    dot.className = "dot";
    const text = document.createElement("div");
    text.textContent = opt.text;
 
    row.appendChild(dot);
    row.appendChild(text);
 
    const choose = () => {
      state.answers[step] = idx;
      if (step < total - 1) {
        state.step += 1;
        renderQuiz();
      } else {
        renderResult();
      }
    };
 
    row.addEventListener("click", choose);
    row.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") choose();
    });
 
    optionsEl.appendChild(row);
  });
 
  btnBack.disabled = step === 0;
};
 
const renderAnswers = (answers) => {
  answersList.innerHTML = "";
  for (let i = 0; i < QUESTIONS.length; i++) {
    const q = QUESTIONS[i];
    const idx = answers[i];
    const row = document.createElement("div");
    row.className = "answer-row";
 
    const qEl = document.createElement("div");
    qEl.className = "a-q";
    qEl.textContent = `${i + 1}. ${q.title}`;
 
    const aEl = document.createElement("div");
    aEl.className = "a-a";
    aEl.textContent = idx == null ? "（跳过）" : q.options[idx].text;
 
    row.appendChild(qEl);
    row.appendChild(aEl);
    answersList.appendChild(row);
  }
};
 
const renderResult = () => {
  const result = pickResult(state.answers);
 
  resultBadge.textContent = result.badge;
  resultTitle.textContent = result.title;
  resultDesc.textContent = result.desc;
 
  resultChips.innerHTML = "";
  result.keywords.forEach((k) => {
    const el = document.createElement("div");
    el.className = "chip";
    el.textContent = k;
    resultChips.appendChild(el);
  });
 
  const q = encodeURIComponent(result.query);
  linkSearch.href = `https://www.google.com/search?q=${q}`;
 
  const shareUrl = encodeState(result.id, state.answers);
  linkShare.href = shareUrl;
  shareHint.textContent = "";
 
  linkShare.onclick = async (e) => {
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(shareUrl);
      shareHint.textContent = "已复制分享链接";
    } catch {
      shareHint.textContent = "复制失败，你可以手动复制浏览器地址栏链接";
    }
  };
 
  renderAnswers(state.answers);
 
  hide(screenStart);
  hide(screenQuiz);
  show(screenResult);
  answersEl.open = false;
};
 
const startQuiz = () => {
  state.step = 0;
  state.answers = new Array(QUESTIONS.length).fill(null);
  shareHint.textContent = "";
 
  hide(screenStart);
  hide(screenResult);
  show(screenQuiz);
  renderQuiz();
};
 
btnStart.addEventListener("click", startQuiz);
 
btnBack.addEventListener("click", () => {
  if (state.step > 0) {
    state.step -= 1;
    renderQuiz();
  }
});
 
btnSkip.addEventListener("click", () => {
  if (state.step < QUESTIONS.length - 1) {
    state.step += 1;
    renderQuiz();
  } else {
    renderResult();
  }
});
 
btnRestart.addEventListener("click", () => {
  startQuiz();
});
 
btnReview.addEventListener("click", () => {
  answersEl.open = !answersEl.open;
});
 
const init = () => {
  const parsed = parseStateFromUrl();
  if (parsed) {
    state.answers = parsed.answers;
    renderResult();
    return;
  }
  show(screenStart);
  hide(screenQuiz);
  hide(screenResult);
};
 
init();
