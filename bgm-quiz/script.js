const questions = [
  {
    text: "如果明天世界末日，你今晚会去哪里？",
    options: [
      { text: "熟悉的便利店，买最后一次啤酒", score: { lofi: 3, indie: 1 } },
      { text: "开着车，在没有人的高架桥上狂飙", score: { synthwave: 3, citypop: 2 } },
      { text: "最燥的Livehouse，在人群中跳到力竭", score: { edm: 3, synthwave: 1 } },
      { text: "爬上最高的山顶，安静等待最后的日出", score: { cinematic: 3, indie: 2 } }
    ]
  },
  {
    text: "深夜睡不着时，你脑海里最常出现什么画面？",
    options: [
      { text: "霓虹灯闪烁的雨夜街头", score: { citypop: 3, synthwave: 1 } },
      { text: "那些未曾说出口的遗憾和抱歉", score: { lofi: 3, indie: 2 } },
      { text: "万人欢呼的舞台中央", score: { edm: 3, cinematic: 1 } },
      { text: "一条看不见尽头的旷野公路", score: { indie: 3, cinematic: 2 } }
    ]
  },
  {
    text: "你在一段感情中，通常扮演什么角色？",
    options: [
      { text: "默默陪伴的倾听者", score: { lofi: 3, indie: 1 } },
      { text: "轰轰烈烈的带领者", score: { edm: 3, synthwave: 1 } },
      { text: "理智且保持距离的观察者", score: { synthwave: 3, citypop: 2 } },
      { text: "愿意牺牲一切的付出者", score: { cinematic: 3, lofi: 1 } }
    ]
  },
  {
    text: "如果能获得一种超能力，你想要：",
    options: [
      { text: "回到过去某个特定的瞬间", score: { citypop: 3, indie: 2 } },
      { text: "能听到所有植物的呼吸", score: { lofi: 3, indie: 3 } },
      { text: "让全世界跟着你的节奏跳舞", score: { edm: 3, citypop: 1 } },
      { text: "用意念创造出浩瀚的宇宙", score: { cinematic: 3, synthwave: 2 } }
    ]
  }
];

const results = {
  lofi: {
    title: "Lo-Fi 治愈白噪音",
    desc: "你是温柔的倾听者。在这个吵闹的世界里，你就像一家永远亮着灯的午夜便利店，用不张扬的频率，治愈着身边的人。",
    color: "linear-gradient(135deg, #a18cd1, #fbc2eb)",
    icon: "fa-coffee"
  },
  citypop: {
    title: "City Pop 浪漫都市",
    desc: "你骨子里带着迷人的复古与浪漫。像一阵吹过霓虹街头的晚风，即使在快节奏的都市里，你永远踩着属于自己的优雅节拍。",
    color: "linear-gradient(135deg, #f6d365, #fda085)",
    icon: "fa-city"
  },
  edm: {
    title: "EDM 派对动物",
    desc: "你的心脏是一颗永不疲倦的低音炮。你热情、直接、充满能量，永远年轻，永远热泪盈眶，生命对你而言就是一场不停歇的派对。",
    color: "linear-gradient(135deg, #f85032, #e73827)",
    icon: "fa-bolt"
  },
  synthwave: {
    title: "Synthwave 复古未来",
    desc: "你是游走在现实与梦境边缘的漫游者。带着合成器般迷幻且冷静的特质，你在这个世界上总显得有些特别，迷人且深邃。",
    color: "linear-gradient(135deg, #ff00cc, #333399)",
    icon: "fa-rocket"
  },
  indie: {
    title: "Indie Folk 独立民谣",
    desc: "你向往自由与旷野。一把木吉他，一条没有尽头的公路。你不喜欢被规则束缚，内心藏着最纯粹的诗意与远方。",
    color: "linear-gradient(135deg, #56ab2f, #a8e063)",
    icon: "fa-leaf"
  },
  cinematic: {
    title: "Cinematic 史诗配乐",
    desc: "你的灵魂宏大且深沉。你生来就是为了体验最极致的情感，不论是跌宕起伏还是波澜壮阔，你都是自己人生的头号主角。",
    color: "linear-gradient(135deg, #141E30, #243B55)",
    icon: "fa-film"
  }
};

let currentQuestion = 0;
let userScores = { lofi: 0, citypop: 0, edm: 0, synthwave: 0, indie: 0, cinematic: 0 };
let finalResultKey = '';

// Audio Context & Nodes
let audioCtx = null;
let currentOscillators = [];

// DOM Elements
const homeScreen = document.getElementById('home-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultScreen = document.getElementById('result-screen');
const allResultsScreen = document.getElementById('all-results-screen');
const toast = document.getElementById('toast');

const startBtn = document.getElementById('start-btn');
const viewAllBtn = document.getElementById('view-all-btn');
const viewAllBtnResult = document.getElementById('view-all-btn-result');
const backHomeBtn = document.getElementById('back-home-btn');

const questionText = document.getElementById('question-text');
const questionNumber = document.getElementById('question-number');
const optionsContainer = document.getElementById('options-container');
const progressFill = document.getElementById('progress-fill');

const resultTitle = document.getElementById('result-title');
const resultDesc = document.getElementById('result-desc');
const resultCover = document.getElementById('result-cover');
const shareBtn = document.getElementById('share-btn');
const retryBtn = document.getElementById('retry-btn');
const playPauseBtn = document.getElementById('play-pause-btn');
const equalizerAnim = document.getElementById('equalizer-anim');
const trackName = document.getElementById('track-name');
const allResultsGrid = document.getElementById('all-results-grid');

let isPlaying = false;
let currentPlayingCard = null; // null for main result, or string key for all-results

// --- Init & Navigation ---

function initAudio() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function showScreen(screenEl) {
  document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
  screenEl.classList.add('active');
}

startBtn.addEventListener('click', () => {
  initAudio();
  currentQuestion = 0;
  userScores = { lofi: 0, citypop: 0, edm: 0, synthwave: 0, indie: 0, cinematic: 0 };
  showScreen(quizScreen);
  renderQuestion();
});

retryBtn.addEventListener('click', () => {
  stopAudio();
  showScreen(homeScreen);
});

viewAllBtn.addEventListener('click', () => {
  initAudio();
  renderAllResults();
  showScreen(allResultsScreen);
});

viewAllBtnResult.addEventListener('click', () => {
  stopAudio();
  renderAllResults();
  showScreen(allResultsScreen);
});

backHomeBtn.addEventListener('click', () => {
  stopAudio();
  showScreen(homeScreen);
});

// --- Quiz Logic ---

function renderQuestion() {
  const q = questions[currentQuestion];
  questionNumber.innerText = `0${currentQuestion + 1}`;
  questionText.innerText = q.text;
  optionsContainer.innerHTML = '';
  
  progressFill.style.width = `${((currentQuestion) / questions.length) * 100}%`;

  q.options.forEach((opt, index) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.innerText = opt.text;
    btn.onclick = () => handleAnswer(opt.score);
    optionsContainer.appendChild(btn);
  });
}

function handleAnswer(score) {
  for (let key in score) {
    userScores[key] += score[key];
  }
  
  currentQuestion++;
  if (currentQuestion < questions.length) {
    renderQuestion();
  } else {
    progressFill.style.width = `100%`;
    setTimeout(showResult, 300);
  }
}

// --- Result Logic ---

function showResult() {
  let maxScore = -1;
  for (let key in userScores) {
    if (userScores[key] > maxScore) {
      maxScore = userScores[key];
      finalResultKey = key;
    }
  }

  // URL override for shared links
  const urlParams = new URLSearchParams(window.location.search);
  const sharedKey = urlParams.get('bgm');
  if (sharedKey && results[sharedKey]) {
    finalResultKey = sharedKey;
  }

  const res = results[finalResultKey];
  resultTitle.innerText = res.title;
  resultDesc.innerText = res.desc;
  resultCover.style.background = res.color;
  trackName.innerText = `正在播放：${res.title}`;
  
  showScreen(resultScreen);
  playAudio(finalResultKey);
}

// --- All Results Page ---

function renderAllResults() {
  allResultsGrid.innerHTML = '';
  for (let key in results) {
    const res = results[key];
    const card = document.createElement('div');
    card.className = 'album-card';
    card.innerHTML = `
      <div class="album-cover-small" style="background: ${res.color}">
        <i class="fas ${res.icon}"></i>
      </div>
      <div class="album-info">
        <div class="album-title">${res.title}</div>
        <div class="album-desc">${res.desc}</div>
      </div>
      <div class="album-play-btn" data-key="${key}" onclick="togglePreview('${key}', this)">
        <i class="fas fa-play"></i>
      </div>
    `;
    allResultsGrid.appendChild(card);
  }
}

window.togglePreview = function(key, btnEl) {
  if (isPlaying && currentPlayingCard === key) {
    stopAudio();
    btnEl.classList.remove('playing');
    btnEl.innerHTML = '<i class="fas fa-play"></i>';
    return;
  }
  
  stopAudio();
  // reset all buttons
  document.querySelectorAll('.album-play-btn').forEach(el => {
    el.classList.remove('playing');
    el.innerHTML = '<i class="fas fa-play"></i>';
  });
  
  currentPlayingCard = key;
  btnEl.classList.add('playing');
  btnEl.innerHTML = '<i class="fas fa-pause"></i>';
  playAudio(key, true);
};

// --- Audio Engine (Generative) ---

function stopAudio() {
  currentOscillators.forEach(node => {
    try { node.stop(); } catch(e) {}
    node.disconnect();
  });
  currentOscillators = [];
  isPlaying = false;
  equalizerAnim.classList.add('paused');
  playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
}

function playAudio(key, isPreview = false) {
  if (!audioCtx) initAudio();
  stopAudio();

  const now = audioCtx.currentTime;
  const masterGain = audioCtx.createGain();
  masterGain.connect(audioCtx.destination);
  masterGain.gain.setValueAtTime(0, now);
  masterGain.gain.linearRampToValueAtTime(0.5, now + 1); // fade in

  isPlaying = true;
  if (!isPreview) {
    equalizerAnim.classList.remove('paused');
    playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    currentPlayingCard = null;
  }

  // Synthesize styles based on key
  if (key === 'lofi') {
    createChord(masterGain, [261.63, 329.63, 392.00, 493.88], 'sine', now); // Cmaj7
    createNoise(masterGain, now);
  } else if (key === 'citypop') {
    createChord(masterGain, [311.13, 392.00, 466.16, 587.33], 'triangle', now); // Ebmaj9
    createBass(masterGain, 77.78, now); // Eb2
  } else if (key === 'edm') {
    createBass(masterGain, 65.41, now, 'sawtooth', true); // C2 pumping
    createChord(masterGain, [523.25, 659.25], 'square', now); 
  } else if (key === 'synthwave') {
    createChord(masterGain, [220.00, 261.63, 329.63, 440.00], 'sawtooth', now); // Am
    createBass(masterGain, 55.00, now, 'square'); // A1
  } else if (key === 'indie') {
    createArp(masterGain, [261.63, 329.63, 392.00], 'triangle', now); // C
  } else if (key === 'cinematic') {
    createChord(masterGain, [130.81, 196.00, 261.63, 311.13], 'sine', now); // Cm slow
    masterGain.gain.linearRampToValueAtTime(0.8, now + 3);
  }
}

playPauseBtn.addEventListener('click', () => {
  if (isPlaying) {
    stopAudio();
  } else {
    playAudio(finalResultKey);
  }
});

// Sound Helpers
function createChord(masterGain, freqs, type, now) {
  freqs.forEach(f => {
    const osc = audioCtx.createOscillator();
    osc.type = type;
    osc.frequency.value = f;
    const lfo = audioCtx.createOscillator();
    lfo.frequency.value = 0.5; // slight chorus/movement
    const lfoGain = audioCtx.createGain();
    lfoGain.gain.value = 2;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    
    osc.connect(masterGain);
    osc.start(now);
    lfo.start(now);
    currentOscillators.push(osc, lfo);
  });
}

function createBass(masterGain, freq, now, type='sine', pumping=false) {
  const osc = audioCtx.createOscillator();
  osc.type = type;
  osc.frequency.value = freq;
  
  const gain = audioCtx.createGain();
  if (pumping) {
    // sidechain effect simulation
    setInterval(() => {
      if(!isPlaying) return;
      const t = audioCtx.currentTime;
      gain.gain.setValueAtTime(0.1, t);
      gain.gain.exponentialRampToValueAtTime(0.8, t + 0.2);
    }, 500);
  } else {
    gain.gain.value = 0.6;
  }

  osc.connect(gain);
  gain.connect(masterGain);
  osc.start(now);
  currentOscillators.push(osc);
}

function createArp(masterGain, freqs, type, now) {
  const osc = audioCtx.createOscillator();
  osc.type = type;
  osc.connect(masterGain);
  osc.start(now);
  currentOscillators.push(osc);
  
  let i = 0;
  const interval = setInterval(() => {
    if (!isPlaying) { clearInterval(interval); return; }
    osc.frequency.setValueAtTime(freqs[i % freqs.length], audioCtx.currentTime);
    i++;
  }, 300);
}

function createNoise(masterGain, now) {
  const bufferSize = audioCtx.sampleRate * 2; 
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const noise = audioCtx.createBufferSource();
  noise.buffer = buffer;
  noise.loop = true;
  
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 800;
  
  const gain = audioCtx.createGain();
  gain.gain.value = 0.05; // very quiet vinyl crackle
  
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(masterGain);
  noise.start(now);
  currentOscillators.push(noise);
}

// --- Share ---

function showToast(msg) {
  toast.innerText = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}

shareBtn.addEventListener('click', () => {
  const shareUrl = window.location.href.split('?')[0] + '?bgm=' + finalResultKey;
  navigator.clipboard.writeText(`我的人生BGM是【${results[finalResultKey].title}】！快来测测你的是哪首？\n${shareUrl}`)
    .then(() => showToast('✨ 结果链接已复制到剪贴板，快去分享吧！'))
    .catch(() => showToast('复制失败，请手动分享链接'));
});

// Check if loaded from shared link
window.onload = () => {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('bgm')) {
    showResult();
    // Add a toast hint for autoplay policy
    setTimeout(() => {
      if(!isPlaying) showToast('🎶 点击播放按钮试听 TA 的人生BGM');
    }, 1000);
  }
};
