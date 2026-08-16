import type { Character } from './characters';
import type { Choice, GameEvent } from './type/GameEvent';

function addGroupPopularity(characters: Character[], value: number): void {
  characters.forEach(character => character.popularity += value);
}

function getTopCharacter(characters: Character[]): Character {
  return [...characters].sort((a, b) => b.popularity - a.popularity)[0];
}

function getLowCharacter(characters: Character[]): Character {
  return [...characters].sort((a, b) => a.popularity - b.popularity)[0];
}

function findCharacter(characters: Character[], id: string): Character {
  return characters.find(character => character.id === id) || characters[0];
}

function boostById(characters: Character[], id: string, value: number): Character {
  const target = findCharacter(characters, id);
  target.popularity += value;
  return target;
}

/** 全员热度序传入；选项里写清名字，避免玩家不知道推的是谁。 */
function createTopLowChoices(
  roster: Character[],
  top: { label: string; preview: string; tags: Choice['effectTags']; gain: number; result: (name: string) => string },
  low: { label: string; preview: string; tags: Choice['effectTags']; gain: number; result: (name: string) => string },
): Choice[] {
  const topChar = getTopCharacter(roster);
  const lowChar = getLowCharacter(roster);
  return [
    {
      text: `${top.label}（当前热度最高：${topChar.name}）`,
      preview: top.preview,
      effectTags: top.tags,
      action: characters => top.result(boostById(characters, topChar.id, top.gain).name),
    },
    {
      text: `${low.label}（当前热度最低：${lowChar.name}）`,
      preview: low.preview,
      effectTags: low.tags,
      action: characters => low.result(boostById(characters, lowChar.id, low.gain).name),
    },
  ];
}

function applyRankingGains(rankedChars: Character[], gains: number[]): string[] {
  return rankedChars.map((character, index) => {
    character.popularity += gains[index] || 0;
    return character.name;
  });
}

export const breakthroughOpeningEvent: GameEvent = {
  id: 'event-breakthrough-open',
  type: 'CHOICE',
  title: '开营首曝: 谁配拿第一个高光',
  description: '短测里有人失误后硬撑完最后八拍，也有人全程零瑕疵。第一支开营直拍只能推一个人，粉圈已经在争“实力该赢”还是“逆袭更有故事”。',
  choices: roster => createTopLowChoices(
    roster,
    {
      label: '【放出零失误直拍】把镜头锁给热门成员的三项连测',
      preview: '热门更稳坐 C 位，其他家会质疑镜头倾斜。',
      tags: ['FOCUS_ESCALATE'],
      gain: 7,
      result: name => `${name} 的零失误直拍冲上热榜，C 位讨论提前开战，节目组默认他是开营标尺。`,
    },
    {
      label: '【放出失误后救场】让冷门成员单独补录短板项目',
      preview: '逆袭线会起势，也可能被说成卖惨剪辑。',
      tags: ['UNDERDOG_SPOTLIGHT'],
      gain: 9,
      result: name => `${name} 的救场片段被反复转发，原本安静的唯粉开始集结，二班席位第一次有了悬念。`,
    },
  ),
};

const wakeUpMissionEvent: GameEvent = {
  id: 'event-wake-up-mission',
  type: 'PICK_TWO',
  pairRole: 'TEAM',
  title: '限时任务: 谁来扛翻车现场',
  description: '任务开录十分钟就有人迷路、有人漏拿道具。请从当前热度前五中选两位救场；他们会被剪进“谁最可靠”的高光，也会替全组背下翻车锅。',
  choices: {
    action: (char1, char2) => {
      char1.popularity += 5;
      char2.popularity += 5;
      return `${char1.name} 和 ${char2.name} 救回了进度，路透把两人并肩核对清单的画面刷成“临危受命组”。`;
    },
  },
};

const duoStageEvent: GameEvent = {
  id: 'event-duo-stage-mutual-pick',
  type: 'PICK_TWO',
  pairRole: 'DUO_STAGE',
  title: '双人舞台: 谁和谁才算官配',
  description: '第一组双人舞台只有一个名额。请从当前热度前五中亲自选两人进练习室，选中的组合会直接引爆 CP 讨论，落选的热门搭配也会马上有意见。',
  choices: {
    action: (char1, char2) => {
      char1.popularity += 10;
      char2.popularity += 10;
      return `${char1.name} 和 ${char2.name} 的互选路透先一步外流，CP 名称还没定，广场已经开始抢话题。`;
    },
  },
};

const songPriorityEvent: GameEvent = {
  id: 'event-song-priority',
  type: 'RANKING',
  title: '选歌修罗场: 谁配拿王牌曲',
  description: '五首歌都只有一个首选名额，其中一首是公认的爆款。请为当前热度前五排顺位，排序会被解读成节目组对“谁是主推”的公开表态。',
  choices: {
    action: rankedChars => {
      const [first, second, third, fourth, fifth] = applyRankingGains(rankedChars, [10, 6, 4, 2, 1]);
      return `${first} 拿下爆款首选，${second}、${third} 还能争编曲空间；${fourth} 与 ${fifth} 的粉丝已经开始追问“凭什么排后面”。`;
    },
  },
};

const nightTalkEvent: GameEvent = {
  id: 'event-dorm-night-talk',
  type: 'CHOICE',
  title: '宿舍路透: 要不要播那句“我不服”',
  description: '分班表贴上白板后，有人盯着自己的名字沉默很久，又低声说“我不服”。这段没有台词设计，播出去会很抓马，也可能让两边粉丝直接开战。',
  choices: [
    {
      text: '【播出“不服”原话】留下白板前的沉默和正面回应。',
      preview: '话题会爆，但容易被截成针对同组成员。',
      effectTags: ['GROUP_BOOST', 'PUBLIC_BOOST'],
      action: characters => {
        addGroupPopularity(characters, 2);
        return '“我不服”冲上讨论区，幸好后面的拥抱也被保留，团粉和唯粉围绕这段镜头吵成两派。';
      },
    },
    {
      text: '【只放夜宵和解】剪掉分班表，把陪伴留在正片。',
      preview: '避开对立，热搜力度会明显下降。',
      effectTags: ['ANTI_RISK'],
      action: characters => {
        addGroupPopularity(characters, 1);
        return '夜宵桌上的玩笑压住了争议，虽然少了爆点，但观众更愿意相信这群人真的在互相托底。';
      },
    },
  ],
};

const taskSwapEvent: GameEvent = {
  id: 'event-mission-role-swap',
  type: 'CHOICE',
  title: '团体翻车: 镜头该给王牌还是替补',
  description: '原定主力连续两次失误，现场安静到能听见呼吸。最后一棒只能交给一个人：让王牌救回口碑，还是让一直没镜头的替补赌一次逆袭？',
  choices: roster => createTopLowChoices(
    roster,
    {
      label: '【让王牌收拾残局】把最后一棒交给热度最高的成员',
      preview: '稳住节目口碑，但会坐实“镜头只救热门”。',
      tags: ['FOCUS_ESCALATE'],
      gain: 8,
      result: name => `${name} 救回最后一棒，王牌救场剪辑立刻出圈，但替补粉丝对“又没镜头”更不满了。`,
    },
    {
      label: '【让替补赌一把】把最后一棒交给热度最低的成员',
      preview: '逆袭成功会封神，失败则会被骂拖累全组。',
      tags: ['UNDERDOG_SPOTLIGHT'],
      gain: 12,
      result: name => `${name} 接棒成功，替补逆袭的词条迅速升温，原本无人问津的练习片段被全网翻了出来。`,
    },
  ),
};

const rainPlanEvent: GameEvent = {
  id: 'event-rainy-day-plan',
  type: 'CHOICE',
  title: '暴雨停拍: 放团魂还是养 CP',
  description: '外景取消，棚内只剩半天和一组灯光。你可以拍全员困在雨天的团魂花絮，也可以关掉跟拍，把黄金档留给双人舞台悄悄补练。',
  choices: [
    {
      text: '【拍雨天团魂】用现有道具录全员挑战。',
      preview: '全员都有露出，个人高光会被稀释。',
      effectTags: ['GROUP_BOOST'],
      action: characters => {
        addGroupPopularity(characters, 3);
        return '雨天团魂花絮意外好笑，每个人都有能被截出来的瞬间，团粉终于不用替镜头分配吵架。';
      },
    },
    {
      text: '【闭门养双人线】关掉跟拍，把黄金档留给双人补练。',
      preview: 'CP 热度会涨，其他成员的粉丝会盯着资源。',
      effectTags: ['CP_ESCALATE'],
      action: characters => {
        const target = getTopCharacter(characters);
        target.popularity += 5;
        return `双人补练的路透没挡住，${target.name} 的定点图先出圈，CP 粉狂欢，资源倾斜的质疑也跟着来了。`;
      },
    },
  ],
};

const breakfastBriefingEvent: GameEvent = {
  id: 'event-breakfast-briefing',
  type: 'CHOICE',
  title: '任务争议: 给队长兜底还是给失误者镜头',
  description: '路线临时封闭，刚失误的成员红着眼想再试一次。最后一张任务卡只够交给一个方案：让队长稳妥兜底，还是让他用一次正片镜头翻盘？',
  choices: roster => [
    {
      text: '【队长稳妥兜底】按备用路线完成交付。',
      preview: '全组安全下班，失误者会失去解释机会。',
      effectTags: ['ANTI_RISK', 'GROUP_BOOST'],
      action: characters => {
        addGroupPopularity(characters, 2);
        return '队长干净利落地完成交付，节目没翻车，但“为什么不给他重来一次”的讨论仍在持续。';
      },
    },
    {
      text: `【给 ${getLowCharacter(roster).name} 重来】把熟悉的任务交给他单独完成。`,
      preview: '翻盘镜头很有爆点，失败会加重全组争议。',
      effectTags: ['PUBLIC_BOOST'],
      action: characters => {
        const target = boostById(characters, getLowCharacter(roster).id, 7);
        return `${target.name} 重做成功，失误到翻盘的镜头线完整闭环，路人开始替他追问此前为什么没有镜头。`;
      },
    },
  ],
};

const morningMissionFinalEvent: GameEvent = {
  id: 'event-morning-mission-final',
  type: 'RANKING',
  title: '正片分量: 谁拿主叙事位',
  description: '任务片只能剪出五条人物线。请为当前热度前五排序：第一名会拿到“解题核心”的主叙事，末位只剩零散反应镜头，顺位将直接影响粉圈评价。',
  choices: {
    action: rankedChars => {
      const [first, second, third, fourth, fifth] = applyRankingGains(rankedChars, [8, 6, 4, 3, 2]);
      return `${first} 拿到主叙事位，${second} 与 ${third} 撑住过程线；${fourth}、${fifth} 只剩碎片镜头，剪辑分量争议提前发酵。`;
    },
  },
};

const duoRehearsalEvent: GameEvent = {
  id: 'event-duo-rehearsal-note',
  type: 'CHOICE',
  title: '双人合练: 播磨合期还是发糖',
  description: '双人动作卡住，两人连续三次没对上拍，最后一次却在镜子前笑场。你可以保留磨合争执，或只剪成默契发糖，决定这对的舆论走向。',
  choices: [
    {
      text: '【播出争执到和好】保留反复对拍和改动作的过程。',
      preview: '能立住实力搭档，也容易被断章成关系不和。',
      effectTags: ['CP_SETTLE', 'PUBLIC_BOOST'],
      action: characters => {
        addGroupPopularity(characters, 1);
        return '争执和和好的全过程被保留，观众看见默契是练出来的，唯粉也暂时找不到“硬卖 CP”的证据。';
      },
    },
    {
      text: '【只剪默契发糖】删掉卡拍，把笑场定格放进预告。',
      preview: 'CP 话题会冲高，也会招来营业质疑。',
      effectTags: ['CP_ESCALATE'],
      action: characters => {
        const target = getTopCharacter(characters);
        target.popularity += 6;
        return `笑场定格一放出，${target.name} 的 CP 向剪辑直接爆了，正式舞台还没播，营业争议先来了。`;
      },
    },
  ],
};

const duoStageRevealEvent: GameEvent = {
  id: 'event-duo-stage-reveal',
  type: 'CHOICE',
  title: '预告大战: 用封神直拍还是暧昧对视',
  description: '平台只给十五秒预告位。剪辑师递来两版：一版是舞台中心位的封神定格，一版是两人在练习室对视后同时笑出来的瞬间。',
  choices: [
    {
      text: '【上封神直拍】用中心位最完整的舞台定格。',
      preview: '个人热度飙升，中心偏爱会被放大。',
      effectTags: ['FOCUS_ESCALATE'],
      action: characters => {
        const target = getTopCharacter(characters);
        target.popularity += 7;
        return `封神直拍让预约量暴涨，${target.name} 的动作点被全网复刻，同时也坐实了节目对中心位的偏爱。`;
      },
    },
    {
      text: '【上暧昧对视】交出两人练习室互相校拍的瞬间。',
      preview: 'CP 讨论升温，舞台实力预期会被稀释。',
      effectTags: ['CP_ESCALATE'],
      action: characters => {
        addGroupPopularity(characters, 2);
        return '对视片段一出，CP 超话涌进新人，观众开始追正片，但也有人怀疑舞台本身不够硬。';
      },
    },
  ],
};

const songTradeEvent: GameEvent = {
  id: 'event-song-trade',
  type: 'CHOICE',
  title: '选曲撕票: 要不要推翻王牌顺位',
  description: '有人拿到爆款曲却明显撑不住高音，另一位冷门成员却最适配。音乐总监给出一次换歌窗口，打开它等于公开承认原本的王牌顺位有问题。',
  choices: roster => createTopLowChoices(
    roster,
    {
      label: '【保住王牌曲】按首轮顺位执行，不给换歌',
      preview: '热门资源不动，适配度争议会持续发酵。',
      tags: ['FOCUS_ESCALATE'],
      gain: 6,
      result: name => `${name} 保住王牌曲，排练表没乱，但“实力不配资源”的质疑开始在各家账号间转发。`,
    },
    {
      label: '【让冷门换歌】允许热度最低的成员申请互换',
      preview: '逆袭感拉满，也会被说节目临时改规则。',
      tags: ['UNDERDOG_SPOTLIGHT'],
      gain: 9,
      result: name => `${name} 换到最适合的样带，逆袭线瞬间成立，热门唯粉则盯上了“为谁改规则”。`,
    },
  ),
};

const songCheckEvent: GameEvent = {
  id: 'event-song-check',
  type: 'CHOICE',
  title: '先导争议: 放整齐副歌还是事故救场',
  description: '平台今晚就要先导片。剪辑台上只有两段可用素材：全员整齐的副歌验收，和设备故障后有人临场接麦救回全场的事故现场。',
  choices: [
    {
      text: '【放全员副歌】用整齐度保住团体口碑。',
      preview: '整体评价更稳，个人爆点不明显。',
      effectTags: ['ANTI_RISK', 'PUBLIC_BOOST'],
      action: characters => {
        addGroupPopularity(characters, 2);
        return '副歌验收稳稳落地，团体口碑保住了，但想等个人封神镜头的观众只能继续蹲正片。';
      },
    },
    {
      text: '【放事故救场】把临场接麦的混乱原样交出去。',
      preview: '救场者会封神，事故责任也会被追着问。',
      effectTags: ['DRAMA_ESCALATE'],
      action: characters => {
        const target = getTopCharacter(characters);
        target.popularity += 5;
        return `事故救场片段刷屏，${target.name} 被夸稳住全场，另一边也开始逐帧追查到底是谁出了错。`;
      },
    },
  ],
};

const groupAssessmentLineupEvent: GameEvent = {
  id: 'event-group-assessment-lineup',
  type: 'RANKING',
  title: '镜头分配: 谁站开场 C 位',
  description: '第一轮彩排开录，五个显眼机位已经标好。请为当前热度前五排镜头顺位：开场、主段、衔接、副歌、结尾；这份名单会被当成 C 位预测。',
  choices: {
    action: rankedChars => {
      const [first, second, third, fourth, fifth] = applyRankingGains(rankedChars, [9, 7, 5, 3, 2]);
      return `${first} 站到开场中心，${second}、${third} 进入主段镜头；${fourth} 与 ${fifth} 负责收束，C 位预测贴瞬间盖起高楼。`;
    },
  },
};

const assessmentReviewEvent: GameEvent = {
  id: 'event-assessment-review',
  type: 'CHOICE',
  title: '评审回放: 放批评还是护住体面',
  description: '彩排后，导演当着全组点出一个人的呼吸和走位问题，对方转身就去练习。播完整批评会让成长线更真，也可能把他送进全网嘲讽。',
  choices: roster => [
    {
      text: `【播完整批评】让 ${getLowCharacter(roster).name} 带着改法回练习室。`,
      preview: '成长线会出圈，也会放大失误与嘲点。',
      effectTags: ['PUBLIC_BOOST', 'UNDERDOG_SPOTLIGHT'],
      action: characters => {
        const target = boostById(characters, getLowCharacter(roster).id, 8);
        return `完整批评和加练都播了，观众开始等 ${target.name} 下次验收翻盘，反黑组也提前忙了起来。`;
      },
    },
    {
      text: '【只播合格结果】剪掉批评，把镜头留给彩排成片。',
      preview: '争议较少，但观众会怀疑节目在藏问题。',
      effectTags: ['ANTI_RISK', 'GROUP_BOOST'],
      action: characters => {
        addGroupPopularity(characters, 2);
        return '批评被留在排练室，成片只剩进步结果。舆论安静了，但“节目是不是在遮问题”的猜测没有消失。';
      },
    },
  ],
};

const finalStageReleaseEvent: GameEvent = {
  id: 'event-final-stage-release',
  type: 'CHOICE',
  title: '收官夜: 造一个人还是保住全团',
  description: '收官舞台剪完了，平台只给最后三十秒一个叙事选择。是把它做成某个人的封神返场，还是让所有人并肩谢幕？偏心争议已经等在发布页外。',
  choices: [
    {
      text: '【造神返场版】让本命独享最后三十秒，接受终局审查。',
      preview: '会造出全季记忆点，也可能引爆偏心审查。',
      effectTags: ['FOCUS_ESCALATE', 'PUBLIC_BOOST', 'FINALE_AUDIT'],
      action: () => '造神返场版迅速出圈，整季最强记忆点钉在一个名字上，偏心审查也随之启动。',
    },
    {
      text: '【全团共担版】把最后三十秒留给整团的致谢。',
      preview: '压住偏心风险，但少一个单人爆点。',
      effectTags: ['GROUP_BOOST', 'ANTI_RISK'],
      action: characters => {
        addGroupPopularity(characters, 3);
        return '全员谢幕压住了偏心争议，观众记住的是一起扛过席位战的人，而不是唯一的赢家。';
      },
    },
  ],
};

export const groupShowEvents: GameEvent[] = [
  breakthroughOpeningEvent,
  wakeUpMissionEvent,
  breakfastBriefingEvent,
  morningMissionFinalEvent,
  songTradeEvent,
  duoStageEvent,
  duoRehearsalEvent,
  duoStageRevealEvent,
  songPriorityEvent,
  groupAssessmentLineupEvent,
  taskSwapEvent,
  assessmentReviewEvent,
  nightTalkEvent,
  rainPlanEvent,
  songCheckEvent,
  finalStageReleaseEvent,
];
