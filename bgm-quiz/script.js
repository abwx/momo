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
    id: "lofi-diary",
    styleId: "lofi",
    badge: "Lo-fi · 低饱和 · 适合学习",
    title: "你的“人生BGM”是：深夜自习室",
    desc: "稳定的鼓点，温柔的和弦。你把生活拆成一页页日记，写着写着就变得更清晰。",
    keywords: ["Lo-fi HipHop", "Vinyl Noise", "Soft Chord", "88 BPM", "Rainy Window"],
    platformQuery: "lofi 学习 深夜 自习室",
    track: { title: "深夜自习室", artist: "BGM Lab", bpm: 88, colors: ["#7c5cff", "#00d2ff"] },
    score: (s) => (s.calm || 0) * 1.1 + (s.intro || 0) * 1.0 + (s.emo || 0) * 0.2,
  },
  {
    id: "citypop-drive",
    styleId: "citypop",
    badge: "City Pop · 霓虹 · 夜路开阔",
    title: "你的“人生BGM”是：霓虹夜航",
    desc: "复古的律动像路灯一盏盏掠过。你走得不急，但每一步都带着期待。",
    keywords: ["City Pop", "Retro Bass", "Bright Chord", "110 BPM", "Night Drive"],
    platformQuery: "city pop 夜晚 霓虹 开车 歌单",
    track: { title: "霓虹夜航", artist: "BGM Lab", bpm: 110, colors: ["#ff4d6d", "#7c5cff"] },
    score: (s) => (s.bright || 0) * 1.2 + (s.calm || 0) * 0.3 + (s.hype || 0) * 0.2,
  },
  {
    id: "dance-mode",
    styleId: "dance",
    badge: "电子舞曲 · 爆发 · 多巴胺",
    title: "你的“人生BGM”是：多巴胺开场",
    desc: "鼓点一落下，你就想往前冲。你是那种把“想做”变成“就做”的人。",
    keywords: ["EDM", "Four on the Floor", "Sidechain", "126 BPM", "Festival"],
    platformQuery: "edm 多巴胺 开场 电子舞曲 歌单",
    track: { title: "多巴胺开场", artist: "BGM Lab", bpm: 126, colors: ["#00d2ff", "#21ff9a"] },
    score: (s) => (s.hype || 0) * 1.2 + (s.drive || 0) * 0.6 + (s.bright || 0) * 0.3,
  },
  {
    id: "rock-run",
    styleId: "rock",
    badge: "电子摇滚 · 冲刺 · 热血",
    title: "你的“人生BGM”是：心跳加速",
    desc: "你有明确的目标感，也愿意把热爱开到最大声。你的人生更像一段不断上扬的前奏。",
    keywords: ["Electronic Rock", "Punchy Drum", "Drive Bass", "140 BPM", "Run Mode"],
    platformQuery: "电子摇滚 热血 跑步 高燃 歌单",
    track: { title: "心跳加速", artist: "BGM Lab", bpm: 140, colors: ["#ff4d6d", "#00d2ff"] },
    score: (s) => (s.drive || 0) * 1.1 + (s.bold || 0) * 0.8 + (s.hype || 0) * 0.4,
  },
  {
    id: "indie-heal",
    styleId: "indie",
    badge: "独立民谣 · 治愈 · 温柔坚定",
    title: "你的“人生BGM”是：慢慢变好",
    desc: "你会难过，也会自己照亮自己。你喜欢把情绪放进旋律里，然后继续向前。",
    keywords: ["Indie Folk", "Soft Pluck", "Warm Air", "96 BPM", "Healing"],
    platformQuery: "独立民谣 治愈 温柔 歌单",
    track: { title: "慢慢变好", artist: "BGM Lab", bpm: 96, colors: ["#ffd166", "#7c5cff"] },
    score: (s) => (s.emo || 0) * 1.1 + (s.intro || 0) * 0.8 + (s.calm || 0) * 0.3,
  },
  {
    id: "cinematic",
    styleId: "cinema",
    badge: "电影配乐 · 史诗 · 长镜头",
    title: "你的“人生BGM”是：远方回声",
    desc: "你对世界的感受更深也更远。你的人生像一段配乐：每次回头，都像在铺垫下一次高潮。",
    keywords: ["Cinematic", "Pad", "Timpani", "72 BPM", "Wide Scene"],
    platformQuery: "电影配乐 史诗 氛围 歌单",
    track: { title: "远方回声", artist: "BGM Lab", bpm: 72, colors: ["#00d2ff", "#2b2d42"] },
    score: (s) => (s.epic || 0) * 1.15 + (s.emo || 0) * 0.6 + (s.calm || 0) * 0.2,
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

const cover = $("cover");
const trackTitle = $("track-title");
const trackArtist = $("track-artist");
const btnPlay = $("btn-play");
const timeEl = $("time");
const seekFill = $("seek-fill");
const autoplayHint = $("autoplay-hint");

const state = {
  step: 0,
  answers: new Array(QUESTIONS.length).fill(null),
  hasGesture: false,
  result: null,
  playing: false,
};

let audioCtx = null;
let currentSource = null;
let currentGain = null;
let loopSec = 12;
let playStart = 0;
let rafId = 0;
const bufferCache = new Map();

const playSvg =
  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 5v14l12-7-12-7z" fill="currentColor"/></svg>';
const pauseSvg =
  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 5h3v14H7V5zm7 0h3v14h-3V5z" fill="currentColor"/></svg>';

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

const markGesture = () => {
  state.hasGesture = true;
  const ctx = ensureAudio();
  ctx.resume().catch(() => {});
};

const ensureAudio = () => {
  if (audioCtx) return audioCtx;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  audioCtx = new Ctx();
  return audioCtx;
};

const noiseBuffer = (ctx, seconds) => {
  const length = Math.floor(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
};

const formatTime = (sec) => {
  const s = Math.floor(sec % 60);
  const m = Math.floor(sec / 60);
  return `${m}:${String(s).padStart(2, "0")}`;
};

const setPlayingUi = (playing) => {
  state.playing = playing;
  btnPlay.innerHTML = playing ? pauseSvg : playSvg;
};

const stopPlayback = () => {
  if (rafId) cancelAnimationFrame(rafId);
  rafId = 0;
  if (currentSource) {
    try {
      currentSource.stop();
    } catch {}
    try {
      currentSource.disconnect();
    } catch {}
  }
  currentSource = null;
  if (currentGain) {
    try {
      currentGain.disconnect();
    } catch {}
  }
  currentGain = null;
  seekFill.style.width = "0%";
  timeEl.textContent = "";
  setPlayingUi(false);
};

const tickProgress = () => {
  if (!audioCtx || !state.playing) return;
  const t = (audioCtx.currentTime - playStart) % loopSec;
  const p = Math.max(0, Math.min(1, t / loopSec));
  seekFill.style.width = `${Math.round(p * 100)}%`;
  timeEl.textContent = `${formatTime(t)} / ${formatTime(loopSec)}`;
  rafId = requestAnimationFrame(tickProgress);
};

const buildKick = (ctx, time, gainValue) => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(160, time);
  osc.frequency.exponentialRampToValueAtTime(55, time + 0.08);
  gain.gain.setValueAtTime(gainValue, time);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.18);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(time);
  osc.stop(time + 0.22);
};

const buildNoiseHit = (ctx, buf, time, gainValue, hp, decay) => {
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const filter = ctx.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.setValueAtTime(hp, time);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(gainValue, time);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + decay);
  src.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  src.start(time);
  src.stop(time + decay + 0.02);
};

const chord = (root, type) => {
  const semis = type === "min" ? [0, 3, 7] : [0, 4, 7];
  return semis.map((s) => root * Math.pow(2, s / 12));
};

const buildChordPad = (ctx, freqs, time, dur, gainValue, wave, lp) => {
  const out = ctx.createGain();
  out.gain.setValueAtTime(gainValue, time);
  out.gain.exponentialRampToValueAtTime(0.0001, time + dur);
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(lp, time);
  out.connect(filter);
  filter.connect(ctx.destination);
  freqs.forEach((f, i) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = wave;
    o.frequency.setValueAtTime(f, time);
    o.detune.setValueAtTime((i - 1) * 6, time);
    g.gain.setValueAtTime(0.35, time);
    g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    o.connect(g);
    g.connect(out);
    o.start(time);
    o.stop(time + dur + 0.02);
  });
};

const buildBass = (ctx, freq, time, dur, gainValue) => {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = "sine";
  o.frequency.setValueAtTime(freq, time);
  g.gain.setValueAtTime(gainValue, time);
  g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
  o.connect(g);
  g.connect(ctx.destination);
  o.start(time);
  o.stop(time + dur + 0.02);
};

const renderBuffer = async (styleId, bpm) => {
  const sr = 44100;
  const duration = 12;
  const ctx = new OfflineAudioContext(1, sr * duration, sr);
  const beat = 60 / bpm;
  const bar = beat * 4;
  const noise = noiseBuffer(ctx, 1);

  const master = ctx.createGain();
  master.gain.value = 0.85;
  master.connect(ctx.destination);

  const connectToMaster = (node) => {
    node.connect(master);
  };

  const kick = (t, g = 0.95) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(170, t);
    osc.frequency.exponentialRampToValueAtTime(55, t + 0.08);
    gain.gain.setValueAtTime(g, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
    osc.connect(gain);
    connectToMaster(gain);
    osc.start(t);
    osc.stop(t + 0.22);
  };

  const hat = (t, g = 0.16) => {
    const src = ctx.createBufferSource();
    src.buffer = noise;
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.setValueAtTime(6200, t);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(g, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
    src.connect(hp);
    hp.connect(gain);
    connectToMaster(gain);
    src.start(t);
    src.stop(t + 0.07);
  };

  const snare = (t, g = 0.35) => {
    const src = ctx.createBufferSource();
    src.buffer = noise;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.setValueAtTime(1800, t);
    bp.Q.setValueAtTime(1.2, t);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(g, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
    src.connect(bp);
    bp.connect(gain);
    connectToMaster(gain);
    src.start(t);
    src.stop(t + 0.18);
  };

  const vinyl = () => {
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer(ctx, duration);
    src.loop = true;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 1800;
    const g = ctx.createGain();
    g.gain.value = 0.04;
    src.connect(lp);
    lp.connect(g);
    connectToMaster(g);
    src.start(0);
  };

  const pad = (freqs, t, dur, g, wave, lpFreq) => {
    const out = ctx.createGain();
    out.gain.setValueAtTime(g, t);
    out.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.setValueAtTime(lpFreq, t);
    out.connect(lp);
    connectToMaster(lp);
    freqs.forEach((f, i) => {
      const o = ctx.createOscillator();
      const gg = ctx.createGain();
      o.type = wave;
      o.frequency.setValueAtTime(f, t);
      o.detune.setValueAtTime((i - 1) * 7, t);
      gg.gain.setValueAtTime(0.35, t);
      gg.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(gg);
      gg.connect(out);
      o.start(t);
      o.stop(t + dur + 0.02);
    });
  };

  const bass = (f, t, dur, g) => {
    const o = ctx.createOscillator();
    const gg = ctx.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(f, t);
    gg.gain.setValueAtTime(g, t);
    gg.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(gg);
    connectToMaster(gg);
    o.start(t);
    o.stop(t + dur + 0.02);
  };

  const pluck = (f, t, dur, g) => {
    const o = ctx.createOscillator();
    const gg = ctx.createGain();
    o.type = "triangle";
    o.frequency.setValueAtTime(f, t);
    gg.gain.setValueAtTime(g, t);
    gg.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 2400;
    o.connect(gg);
    gg.connect(lp);
    connectToMaster(lp);
    o.start(t);
    o.stop(t + dur + 0.02);
  };

  if (styleId === "lofi") {
    vinyl();
    for (let t = 0; t < duration; t += beat) {
      if (Math.round(t / beat) % 4 === 0) kick(t, 0.55);
      if (Math.round(t / beat) % 2 === 1) hat(t + beat * 0.5, 0.10);
    }
    const prog = [
      chord(220, "min"),
      chord(246.94, "maj"),
      chord(196, "min"),
      chord(233.08, "maj"),
    ];
    for (let t = 0; t < duration; t += bar) {
      const idx = Math.floor(t / bar) % prog.length;
      pad(prog[idx], t, bar * 0.95, 0.34, "triangle", 1800);
      bass(prog[idx][0] / 2, t, bar * 0.92, 0.25);
    }
  }

  if (styleId === "citypop") {
    for (let t = 0; t < duration; t += beat) {
      if (Math.round(t / beat) % 4 === 0) kick(t, 0.65);
      if (Math.round(t / beat) % 4 === 2) snare(t, 0.22);
      hat(t + beat * 0.5, 0.12);
    }
    const prog = [
      chord(261.63, "maj"),
      chord(329.63, "min"),
      chord(293.66, "min"),
      chord(349.23, "maj"),
    ];
    for (let t = 0; t < duration; t += bar) {
      const idx = Math.floor(t / bar) % prog.length;
      pad(prog[idx], t, bar * 0.95, 0.30, "sawtooth", 2600);
      bass(prog[idx][0] / 2, t + beat, bar * 0.75, 0.18);
    }
  }

  if (styleId === "dance") {
    for (let t = 0; t < duration; t += beat) {
      kick(t, 0.85);
      hat(t + beat * 0.5, 0.12);
      if (Math.round(t / beat) % 4 === 2) snare(t, 0.18);
    }
    const prog = [
      chord(246.94, "min"),
      chord(293.66, "maj"),
      chord(220, "min"),
      chord(329.63, "maj"),
    ];
    for (let t = 0; t < duration; t += bar) {
      const idx = Math.floor(t / bar) % prog.length;
      pad(prog[idx], t, bar * 0.98, 0.24, "sawtooth", 3200);
      bass(prog[idx][0] / 2, t, bar * 0.95, 0.22);
    }
  }

  if (styleId === "rock") {
    for (let t = 0; t < duration; t += beat) {
      if (Math.round(t / beat) % 4 === 0) kick(t, 0.82);
      if (Math.round(t / beat) % 4 === 2) snare(t, 0.28);
      hat(t + beat * 0.5, 0.15);
    }
    const prog = [
      chord(196, "min"),
      chord(233.08, "maj"),
      chord(220, "min"),
      chord(261.63, "maj"),
    ];
    for (let t = 0; t < duration; t += bar) {
      const idx = Math.floor(t / bar) % prog.length;
      pad(prog[idx], t, bar * 0.92, 0.26, "square", 2000);
      bass(prog[idx][0] / 2, t, bar * 0.88, 0.30);
    }
  }

  if (styleId === "indie") {
    for (let t = 0; t < duration; t += beat) {
      if (Math.round(t / beat) % 4 === 0) kick(t, 0.45);
      hat(t + beat * 0.5, 0.08);
    }
    const seq = [261.63, 293.66, 329.63, 293.66, 261.63, 349.23, 329.63, 293.66];
    for (let t = 0; t < duration; t += beat * 0.5) {
      const idx = Math.floor(t / (beat * 0.5)) % seq.length;
      pluck(seq[idx], t, 0.22, 0.12);
    }
    const prog = [chord(261.63, "maj"), chord(220, "min"), chord(293.66, "min"), chord(349.23, "maj")];
    for (let t = 0; t < duration; t += bar) {
      const idx = Math.floor(t / bar) % prog.length;
      pad(prog[idx], t, bar * 0.95, 0.22, "triangle", 1800);
    }
  }

  if (styleId === "cinema") {
    for (let t = 0; t < duration; t += beat) {
      if (Math.round(t / beat) % 4 === 0) kick(t, 0.35);
      if (Math.round(t / beat) % 8 === 4) snare(t, 0.10);
    }
    const prog = [chord(220, "min"), chord(174.61, "min"), chord(196, "maj"), chord(246.94, "min")];
    for (let t = 0; t < duration; t += bar * 2) {
      const idx = Math.floor(t / (bar * 2)) % prog.length;
      pad(prog[idx], t, bar * 1.95, 0.30, "sine", 1400);
      bass(prog[idx][0] / 2, t, bar * 1.8, 0.18);
    }
  }

  return await ctx.startRendering();
};

const getTrackBuffer = async (result) => {
  const key = `${result.styleId}:${result.track.bpm}`;
  if (bufferCache.has(key)) return bufferCache.get(key);
  const buf = await renderBuffer(result.styleId, result.track.bpm);
  bufferCache.set(key, buf);
  return buf;
};

const startPlayback = async (result) => {
  if (!result) return;
  autoplayHint.textContent = "";
  const ctx = ensureAudio();
  await ctx.resume();

  const buf = await getTrackBuffer(result);
  stopPlayback();

  currentGain = ctx.createGain();
  currentGain.gain.value = 0.9;
  currentGain.connect(ctx.destination);

  currentSource = ctx.createBufferSource();
  currentSource.buffer = buf;
  currentSource.loop = true;
  currentSource.connect(currentGain);

  loopSec = buf.duration;
  playStart = ctx.currentTime;
  currentSource.start();

  setPlayingUi(true);
  tickProgress();
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
      markGesture();
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

const renderResult = async () => {
  const result = state.result || pickResult(state.answers);
  state.result = result;

  resultBadge.textContent = result.badge;
  resultTitle.textContent = result.title;
  resultDesc.textContent = result.desc;

  cover.style.background = `linear-gradient(135deg, ${result.track.colors[0]}, ${result.track.colors[1]})`;
  cover.innerHTML = `<div class="cover-mark"><div class="m1">${result.track.title}</div><div class="m2">${result.track.artist} · ${result.track.bpm} BPM</div></div>`;

  trackTitle.textContent = result.track.title;
  trackArtist.textContent = `${result.track.artist} · ${result.badge}`;

  resultChips.innerHTML = "";
  result.keywords.forEach((k) => {
    const el = document.createElement("div");
    el.className = "chip";
    el.textContent = k;
    resultChips.appendChild(el);
  });

  const q = encodeURIComponent(result.platformQuery);
  linkSearch.href = `https://music.163.com/#/search/m/?s=${q}&type=1000`;

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

  setPlayingUi(false);
  timeEl.textContent = "";
  seekFill.style.width = "0%";

  if (state.hasGesture) {
    try {
      await startPlayback(result);
    } catch {
      autoplayHint.textContent = "浏览器限制自动播放，点一下播放键即可";
    }
  } else {
    autoplayHint.textContent = "点一下播放键开始试听";
  }
};

const startQuiz = () => {
  stopPlayback();
  state.step = 0;
  state.answers = new Array(QUESTIONS.length).fill(null);
  shareHint.textContent = "";
  autoplayHint.textContent = "";

  hide(screenStart);
  hide(screenResult);
  show(screenQuiz);
  renderQuiz();
};

btnStart.addEventListener("click", () => {
  markGesture();
  startQuiz();
});

btnBack.addEventListener("click", () => {
  markGesture();
  if (state.step > 0) {
    state.step -= 1;
    renderQuiz();
  }
});

btnSkip.addEventListener("click", () => {
  markGesture();
  if (state.step < QUESTIONS.length - 1) {
    state.step += 1;
    renderQuiz();
  } else {
    renderResult();
  }
});

btnRestart.addEventListener("click", () => {
  markGesture();
  startQuiz();
});

btnReview.addEventListener("click", () => {
  markGesture();
  answersEl.open = !answersEl.open;
});

btnPlay.addEventListener("click", async () => {
  markGesture();
  if (!state.result) return;
  if (state.playing) {
    stopPlayback();
    return;
  }
  try {
    await startPlayback(state.result);
  } catch {
    autoplayHint.textContent = "播放失败，请再试一次";
  }
});

const init = () => {
  btnPlay.innerHTML = playSvg;
  const parsed = parseStateFromUrl();
  if (parsed) {
    state.answers = parsed.answers;
    state.result = RESULTS.find((x) => x.id === parsed.r) || null;
    renderResult();
    return;
  }
  show(screenStart);
  hide(screenQuiz);
  hide(screenResult);
};

init();
