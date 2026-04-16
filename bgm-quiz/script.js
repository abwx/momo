const questions = [
  {
    text: "如果明天世界末日，你今晚会去哪里？",
    options: [
      { text: "熟悉的便利店，买最后一次啤酒", score: { lofi: 3, indie: 1, postrock: 2 } },
      { text: "开着车，在没有人的高架桥上狂飙", score: { synthwave: 3, citypop: 2, phonk: 1 } },
      { text: "最燥的Livehouse，在人群中跳到力竭", score: { edm: 3, synthwave: 1, trap: 2 } },
      { text: "爬上最高的山顶，安静等待最后的日出", score: { cinematic: 3, indie: 2, ambient: 3 } }
    ]
  },
  {
    text: "深夜睡不着时，你脑海里最常出现什么画面？",
    options: [
      { text: "霓虹灯闪烁的雨夜街头", score: { citypop: 3, synthwave: 1, jazz: 2 } },
      { text: "那些未曾说出口的遗憾和抱歉", score: { lofi: 3, indie: 2, acoustic: 3 } },
      { text: "万人欢呼的舞台中央", score: { edm: 3, cinematic: 1, trap: 1 } },
      { text: "一条看不见尽头的旷野公路", score: { indie: 3, cinematic: 2, postrock: 3 } }
    ]
  },
  {
    text: "你在一段感情中，通常扮演什么角色？",
    options: [
      { text: "默默陪伴的倾听者", score: { lofi: 3, acoustic: 3, ambient: 2 } },
      { text: "轰轰烈烈的带领者", score: { edm: 3, trap: 2, synthwave: 1 } },
      { text: "理智且保持距离的观察者", score: { synthwave: 3, citypop: 2, jazz: 3 } },
      { text: "愿意牺牲一切的付出者", score: { cinematic: 3, postrock: 3, lofi: 1 } }
    ]
  },
  {
    text: "如果能获得一种超能力，你想要：",
    options: [
      { text: "回到过去某个特定的瞬间", score: { citypop: 3, acoustic: 2, lofi: 1 } },
      { text: "能听到所有植物的呼吸", score: { ambient: 3, indie: 3, acoustic: 1 } },
      { text: "让全世界跟着你的节奏跳舞", score: { edm: 3, trap: 3, phonk: 2 } },
      { text: "用意念创造出浩瀚的宇宙", score: { cinematic: 3, postrock: 2, synthwave: 2 } }
    ]
  },
  {
    text: "面对突然袭来的巨大压力，你会如何应对？",
    options: [
      { text: "把自己关在房间里，断绝一切联系", score: { lofi: 3, ambient: 3, acoustic: 2 } },
      { text: "去健身房或者去跑步，用汗水发泄", score: { edm: 2, phonk: 3, trap: 2 } },
      { text: "找一家常去的咖啡馆或清吧坐一个下午", score: { citypop: 2, jazz: 3, lofi: 1 } },
      { text: "开车去海边或者山里大喊一顿", score: { postrock: 3, indie: 3, cinematic: 1 } }
    ]
  },
  {
    text: "你最希望拥有哪种类型的朋友？",
    options: [
      { text: "能一起在凌晨压马路聊哲学的", score: { indie: 3, postrock: 2, acoustic: 2 } },
      { text: "品味极佳，能带你发掘小众好店的", score: { citypop: 3, jazz: 3, synthwave: 1 } },
      { text: "随时能叫出来喝酒蹦迪的", score: { edm: 3, trap: 3, phonk: 2 } },
      { text: "不需要常联系但懂你所有沉默的", score: { ambient: 3, lofi: 3, cinematic: 2 } }
    ]
  },
  {
    text: "你的衣柜里，哪种颜色的衣服最多？",
    options: [
      { text: "黑白灰，极简且舒适", score: { lofi: 2, ambient: 3, acoustic: 2 } },
      { text: "高饱和度，亮眼且个性", score: { edm: 3, trap: 2, phonk: 3 } },
      { text: "复古色调，如墨绿、酒红、大地色", score: { citypop: 3, jazz: 3, indie: 2 } },
      { text: "随性混搭，不拘一格", score: { synthwave: 3, postrock: 2, indie: 1 } }
    ]
  },
  {
    text: "如果你的人生是一部电影，它最可能是：",
    options: [
      { text: "一部画面唯美但台词很少的文艺片", score: { ambient: 3, lofi: 2, acoustic: 3 } },
      { text: "一部充满赛博朋克元素的科幻巨制", score: { synthwave: 3, cinematic: 3, phonk: 2 } },
      { text: "一部充满意外和反转的公路电影", score: { indie: 3, postrock: 3, citypop: 1 } },
      { text: "一部节奏明快、色彩浓烈的青春片", score: { edm: 3, trap: 3, jazz: 1 } }
    ]
  }
];

// High quality royalty-free MP3s and Unsplash Covers
const results = {
  lofi: {
    title: "Lo-Fi 治愈白噪音",
    desc: "你是温柔的倾听者。在这个吵闹的世界里，你就像一家永远亮着灯的午夜便利店，用不张扬的频率，治愈着身边的人。",
    traits: ["温柔", "细腻", "内耗治疗者"],
    songName: "Lofi Study Vibes",
    artist: "FASSounds",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3",
    coverImg: "https://images.unsplash.com/photo-1516280440502-a29286fa6443?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    color: "#a18cd1",
    icon: "fa-coffee"
  },
  citypop: {
    title: "City Pop 浪漫都市",
    desc: "你骨子里带着迷人的复古与浪漫。像一阵吹过霓虹街头的晚风，即使在快节奏的都市里，你永远踩着属于自己的优雅节拍。",
    traits: ["复古", "浪漫", "微醺"],
    songName: "Night City Lights",
    artist: "Tangerine",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939ef2a02.mp3",
    coverImg: "https://images.unsplash.com/photo-1514924013411-cbf25faa35bb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    color: "#fda085",
    icon: "fa-city"
  },
  edm: {
    title: "EDM 派对动物",
    desc: "你的心脏是一颗永不疲倦的低音炮。你热情、直接、充满能量，永远年轻，永远热泪盈眶，生命对你而言就是一场不停歇的派对。",
    traits: ["热情", "直接", "能量爆棚"],
    songName: "Electronic Future",
    artist: "QubeSounds",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/11/08/audio_64b6e5e8e8.mp3",
    coverImg: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    color: "#f85032",
    icon: "fa-bolt"
  },
  synthwave: {
    title: "Synthwave 复古未来",
    desc: "你是游走在现实与梦境边缘的漫游者。带着合成器般迷幻且冷静的特质，你在这个世界上总显得有些特别，迷人且深邃。",
    traits: ["迷幻", "赛博朋克", "深邃"],
    songName: "Retrowave",
    artist: "Prazkhanal",
    audioUrl: "https://cdn.pixabay.com/download/audio/2021/11/25/audio_91b3cb3cde.mp3",
    coverImg: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    color: "#ff00cc",
    icon: "fa-rocket"
  },
  indie: {
    title: "Indie Folk 独立民谣",
    desc: "你向往自由与旷野。一把木吉他，一条没有尽头的公路。你不喜欢被规则束缚，内心藏着最纯粹的诗意与远方。",
    traits: ["自由", "旷野", "诗意"],
    songName: "Acoustic Folk",
    artist: "Coma-Media",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/01/20/audio_5b31f79028.mp3",
    coverImg: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    color: "#56ab2f",
    icon: "fa-leaf"
  },
  cinematic: {
    title: "Cinematic 史诗配乐",
    desc: "你的灵魂宏大且深沉。你生来就是为了体验最极致的情感，不论是跌宕起伏还是波澜壮阔，你都是自己人生的头号主角。",
    traits: ["宏大", "深沉", "主角光环"],
    songName: "Epic Cinematic",
    artist: "Lexin_Music",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_2eb2761891.mp3",
    coverImg: "https://images.unsplash.com/photo-1440407876336-62333a6f010f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    color: "#141E30",
    icon: "fa-film"
  },
  postrock: {
    title: "Post-Rock 后摇滚",
    desc: "你的情绪像是一座休眠的火山。平时沉默寡言，但在某些时刻，你的内心会爆发出震撼人心的力量与轰鸣。",
    traits: ["外冷内热", "爆发力", "孤独"],
    songName: "Inspiring Cinematic",
    artist: "Lexin_Music",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3",
    coverImg: "https://images.unsplash.com/photo-1498036882173-b41c28af5a15?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    color: "#434343",
    icon: "fa-mountain"
  },
  ambient: {
    title: "Ambient 环境音乐",
    desc: "你有一种能让人安静下来的魔力。你不需要太多言语，你的存在本身就像一片没有边界的湖水，包容且宁静。",
    traits: ["宁静", "包容", "无边界"],
    songName: "Deep Meditation",
    artist: "Zen_Man",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/02/07/audio_65ab8f51a4.mp3",
    coverImg: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    color: "#8ec5fc",
    icon: "fa-water"
  },
  trap: {
    title: "Trap 陷阱说唱",
    desc: "你自信、张扬、不羁。你清楚地知道自己想要什么，并且会毫不掩饰地去争取。你的生活态度就是保持真实，保持锐利。",
    traits: ["自信", "张扬", "锐利"],
    songName: "Trap Beat",
    artist: "QubeSounds",
    audioUrl: "https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3",
    coverImg: "https://images.unsplash.com/photo-1605020420620-20c943cc4669?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    color: "#11998e",
    icon: "fa-fire"
  },
  jazz: {
    title: "Jazz 慵懒爵士",
    desc: "你的灵魂是自由且不可预测的。你喜欢即兴的浪漫，讨厌一成不变的规矩。和你在一起，永远不知道下一秒会有怎样的惊喜。",
    traits: ["慵懒", "自由", "即兴"],
    songName: "Smooth Jazz",
    artist: "Music_Unlimited",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/02/10/audio_f5eb8e8609.mp3",
    coverImg: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    color: "#c5a059",
    icon: "fa-glass-martini-alt"
  }
};

let currentQuestion = 0;
let userScores = {};
let finalResultKey = '';

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
const resultCoverImg = document.getElementById('result-cover-img');
const resultTraits = document.getElementById('result-traits');
const shareBtn = document.getElementById('share-btn');
const retryBtn = document.getElementById('retry-btn');
const equalizerAnim = document.getElementById('equalizer-anim');
const allResultsGrid = document.getElementById('all-results-grid');

// Custom Audio Elements
const customPlayBtn = document.getElementById('custom-play-btn');
const trackName = document.getElementById('track-name');
const trackArtist = document.getElementById('track-artist');
const audioProgress = document.getElementById('audio-progress');
const timeCurrent = document.getElementById('time-current');
const timeTotal = document.getElementById('time-total');
const progressContainer = document.getElementById('progress-container');

const bgmAudio = new Audio();
bgmAudio.loop = true;

// --- Audio Controls ---

function formatTime(seconds) {
  if (isNaN(seconds)) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
}

bgmAudio.addEventListener('timeupdate', () => {
  if (bgmAudio.duration) {
    const percent = (bgmAudio.currentTime / bgmAudio.duration) * 100;
    audioProgress.style.width = `${percent}%`;
    timeCurrent.innerText = formatTime(bgmAudio.currentTime);
  }
});

bgmAudio.addEventListener('loadedmetadata', () => {
  timeTotal.innerText = formatTime(bgmAudio.duration);
});

progressContainer.addEventListener('click', (e) => {
  if (!bgmAudio.duration) return;
  const rect = progressContainer.getBoundingClientRect();
  const pos = (e.clientX - rect.left) / rect.width;
  bgmAudio.currentTime = pos * bgmAudio.duration;
});

function togglePlay() {
  if (bgmAudio.paused) {
    bgmAudio.play().then(() => {
      customPlayBtn.innerHTML = '<i class="fas fa-pause"></i>';
      equalizerAnim.classList.remove('paused');
      resultCoverImg.classList.add('playing');
    }).catch(err => console.log('Autoplay prevented:', err));
  } else {
    bgmAudio.pause();
    customPlayBtn.innerHTML = '<i class="fas fa-play"></i>';
    equalizerAnim.classList.add('paused');
    resultCoverImg.classList.remove('playing');
  }
}

customPlayBtn.addEventListener('click', togglePlay);

function initScores() {
  userScores = {};
  for(let key in results) {
    userScores[key] = 0;
  }
}

function showScreen(screenEl) {
  document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
  screenEl.classList.add('active');
}

startBtn.addEventListener('click', () => {
  currentQuestion = 0;
  initScores();
  showScreen(quizScreen);
  renderQuestion();
});

retryBtn.addEventListener('click', () => {
  bgmAudio.pause();
  bgmAudio.currentTime = 0;
  equalizerAnim.classList.add('paused');
  resultCoverImg.classList.remove('playing');
  customPlayBtn.innerHTML = '<i class="fas fa-play"></i>';
  showScreen(homeScreen);
});

viewAllBtn.addEventListener('click', () => {
  renderAllResults();
  showScreen(allResultsScreen);
});

viewAllBtnResult.addEventListener('click', () => {
  bgmAudio.pause();
  customPlayBtn.innerHTML = '<i class="fas fa-play"></i>';
  equalizerAnim.classList.add('paused');
  resultCoverImg.classList.remove('playing');
  renderAllResults();
  showScreen(allResultsScreen);
});

backHomeBtn.addEventListener('click', () => {
  bgmAudio.pause();
  showScreen(homeScreen);
});

// --- Quiz Logic ---

function renderQuestion() {
  const q = questions[currentQuestion];
  questionNumber.innerText = `0${currentQuestion + 1}`;
  questionText.innerText = q.text;
  optionsContainer.innerHTML = '';
  
  progressFill.style.width = `${((currentQuestion) / questions.length) * 100}%`;

  q.options.forEach((opt) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.innerText = opt.text;
    btn.onclick = () => handleAnswer(opt.score);
    optionsContainer.appendChild(btn);
  });
}

function handleAnswer(score) {
  for (let key in score) {
    if (userScores[key] !== undefined) {
      userScores[key] += score[key];
    }
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
  
  // Set traits tags
  resultTraits.innerHTML = res.traits.map(t => `<span class="trait-tag">${t}</span>`).join('');
  
  // Set cover and music info
  resultCoverImg.src = res.coverImg;
  trackName.innerText = res.songName;
  trackArtist.innerText = res.artist;
  
  // Audio playback
  bgmAudio.src = res.audioUrl;
  bgmAudio.currentTime = 0;
  
  showScreen(resultScreen);
  
  // Attempt autoplay
  togglePlay();
}

// --- All Results Page ---

function renderAllResults() {
  allResultsGrid.innerHTML = '';
  for (let key in results) {
    const res = results[key];
    const card = document.createElement('div');
    card.className = 'album-card';
    card.innerHTML = `
      <div class="album-card-header">
        <div class="album-cover-small" style="background: url('${res.coverImg}')">
        </div>
        <div class="album-info">
          <div class="album-title">${res.title}</div>
          <div class="album-desc">${res.desc}</div>
        </div>
        <div class="album-play-btn" data-key="${key}" onclick="togglePreview('${key}', this)">
          <i class="fas fa-play"></i>
        </div>
      </div>
    `;
    allResultsGrid.appendChild(card);
  }
}

window.togglePreview = function(key, btnEl) {
  // Clear any existing active states
  document.querySelectorAll('.album-card .custom-audio-inline').forEach(el => el.remove());
  document.querySelectorAll('.album-play-btn').forEach(el => {
    el.style.display = 'flex';
  });

  const res = results[key];
  const card = btnEl.parentElement;
  
  btnEl.style.display = 'none'; // hide play button
  
  // Pause main BGM if playing
  if (!bgmAudio.paused) togglePlay();

  // Inject custom player below info
  const playerDiv = document.createElement('div');
  playerDiv.className = 'custom-audio-inline';
  playerDiv.style.width = '100%';
  playerDiv.style.marginTop = '15px';
  playerDiv.innerHTML = `
    <audio controls autoplay style="width: 100%; height: 40px; border-radius: 8px; outline: none;">
      <source src="${res.audioUrl}" type="audio/mpeg">
    </audio>
  `;
  
  card.appendChild(playerDiv);
};

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
  }
};
