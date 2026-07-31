import type { Character } from './characters';
import type { GameEvent } from './type/GameEvent';

function addGroupPopularity(characters: Character[], value: number): void {
  characters.forEach(character => character.popularity += value);
}

function getTopCharacter(characters: Character[]): Character {
  return [...characters].sort((a, b) => b.popularity - a.popularity)[0];
}

function getLowCharacter(characters: Character[]): Character {
  return [...characters].sort((a, b) => a.popularity - b.popularity)[0];
}

export const breakthroughOpeningEvent: GameEvent = {
  id: 'event-breakthrough-open',
  type: 'CHOICE',
  title: '开录定位: 首轮席位测试',
  description: '录制从一场短测开始。你要先把镜头交给最稳的人，还是先给暂居二班的成员一个破局机会？',
  choices: [
    { text: '【稳住开场】让人气最高的成员带头完成首轮展示。', effectTags: ['FOCUS_ESCALATE'], action: characters => {
      const target = getTopCharacter(characters);
      target.popularity += 7;
      return `${target.name} 稳住了开录第一镜，制作组先拿到一段能立住节目的素材。`;
    } },
    { text: '【给出机会】把第一段展示交给目前人气最低的成员。', effectTags: ['UNDERDOG_SPOTLIGHT'], action: characters => {
      const target = getLowCharacter(characters);
      target.popularity += 9;
      return `${target.name} 接住了首轮测试，原本紧张的席位竞争出现了第一点松动。`;
    } },
  ],
};

const wakeUpMissionEvent: GameEvent = {
  id: 'event-wake-up-mission', type: 'PICK_TWO', pairRole: 'TEAM', title: '清晨突击：叫早任务',
  description: '导演组给出十分钟准备时间。选两位成员负责叫早和收拾行李，镜头要拍真实反应，还是拍高效完成任务？',
  choices: { action: (char1, char2) => {
    char1.popularity += 5;
    char2.popularity += 5;
    return `${char1.name} 和 ${char2.name} 把混乱的清晨拉回正轨，互相提醒的小细节成了本期最自然的笑点。`;
  } },
};

const duoStageEvent: GameEvent = {
  id: 'event-duo-stage-mutual-pick', type: 'PICK_TWO', pairRole: 'DUO_STAGE', title: '双人舞台：成员互选合作对象',
  description: '双人舞台名额有限，成员必须现场互选。选出一组优先进入排练室，默契能带来名场面，也可能让其他粉圈开始比较资源。',
  choices: { action: (char1, char2) => {
    char1.popularity += 10;
    char2.popularity += 10;
    return `${char1.name} 和 ${char2.name} 的互选没有犹豫，第一次合练就让观众开始期待正式舞台。`;
  } },
};

const songPriorityEvent: GameEvent = {
  id: 'event-song-priority', type: 'RANKING', title: '选曲优先权：谁先拿到想要的歌',
  description: '本轮考核的选曲池刚公布。请排序三位成员的优先级，第一位先选歌，后两位要承担被迫换风格的风险。',
  choices: { action: rankedChars => {
    const [first, second, third] = rankedChars;
    first.popularity += 10;
    second.popularity += 5;
    third.popularity += 2;
    return `${first.name} 拿到了最适合的曲目，${second.name} 和 ${third.name} 则在临场调整里给了观众新的惊喜。`;
  } },
};

const nightTalkEvent: GameEvent = {
  id: 'event-dorm-night-talk', type: 'CHOICE', title: '宿舍夜谈：镜头该不该留下脆弱时刻',
  description: '收工后，有成员在宿舍聊起最近的考核压力。你可以保留真实情绪，也可以把镜头停在更轻松的陪伴上。',
  choices: [
    { text: '【保留夜谈】剪进真实的犹豫和安慰，让观众看见彼此托住的瞬间。', effectTags: ['GROUP_BOOST', 'PUBLIC_BOOST'], action: characters => {
      addGroupPopularity(characters, 2);
      return '没有煽情配乐的夜谈反而更真诚，观众开始把他们当作共同成长的一群人。';
    } },
    { text: '【留在花絮】不让压力成为卖点，只剪一段轻松的睡前游戏。', effectTags: ['ANTI_RISK'], action: characters => {
      addGroupPopularity(characters, 1);
      return '节目没有透支成员情绪，睡前游戏里的默契也让这一段显得足够温柔。';
    } },
  ],
};

const taskSwapEvent: GameEvent = {
  id: 'event-mission-role-swap', type: 'CHOICE', title: '任务换位：失误后谁接主线',
  description: '户外任务进行到一半，原定主力连续失误。你要给低位成员一次反转机会，还是把关键镜头交回最稳的人？',
  choices: [
    { text: '【让新人补位】把最后一棒交给此前镜头最少的成员。', effectTags: ['UNDERDOG_SPOTLIGHT'], action: characters => {
      const target = getLowCharacter(characters);
      target.popularity += 12;
      return `${target.name} 在最后一棒完成反转，这一期终于有了不属于头部成员的主角。`;
    } },
    { text: '【主力救场】让最稳的成员接下关键任务，优先保证成片效果。', effectTags: ['FOCUS_ESCALATE'], action: characters => {
      const target = getTopCharacter(characters);
      target.popularity += 8;
      return `${target.name} 救回了任务，但“关键时刻永远是同一个人”的讨论也再度出现。`;
    } },
  ],
};

const rainPlanEvent: GameEvent = {
  id: 'event-rainy-day-plan', type: 'CHOICE', title: '暴雨改录：外景取消后的节目单',
  description: '暴雨打乱了外景录制。你可以临时组织全员室内挑战，也可以留出时间排练，把原本的空档变成下一期舞台的伏笔。',
  choices: [
    { text: '【室内接力赛】把道具搬进练习室，临时做一场全员挑战。', effectTags: ['GROUP_BOOST'], action: characters => {
      addGroupPopularity(characters, 3);
      return '临时接力赛比预想更好笑，每个人都在混乱里拿到了一段有效镜头。';
    } },
    { text: '【加练纪录】跟拍双人舞台的磨合，把看不见的努力留到下期揭晓。', effectTags: ['CP_ESCALATE'], action: characters => {
      getTopCharacter(characters).popularity += 5;
      return '加练素材没急着放完，只留下一点磨合的悬念，双人舞台的期待值被悄悄拉高。';
    } },
  ],
};

const breakfastBriefingEvent: GameEvent = {
  id: 'event-breakfast-briefing', type: 'CHOICE', title: '叫早后续：早餐桌上的任务分配',
  description: '被叫醒的成员陆续到齐，早餐只剩一轮准备时间。你要让叫早组继续控场，还是把镜头交给刚睡醒的成员自由发挥？',
  choices: [
    { text: '【继续控场】让任务搭档分发早餐和任务卡，保证录制节奏。', effectTags: ['ANTI_RISK', 'GROUP_BOOST'], action: characters => {
      addGroupPopularity(characters, 2);
      return '节奏被稳稳接住，大家在早餐桌上逐渐进入录制状态。';
    } },
    { text: '【保留起床气】让镜头继续跟拍最真实的反应，赌一段自然名场面。', effectTags: ['PUBLIC_BOOST'], action: characters => {
      getLowCharacter(characters).popularity += 7;
      return '刚睡醒的反应没有被修饰，反而让一位平时低调的成员被更多人注意到。';
    } },
  ],
};

const morningMissionFinalEvent: GameEvent = {
  id: 'event-morning-mission-final', type: 'RANKING', title: '清晨任务：谁负责最后的镜头',
  description: '叫早任务进入收尾，三位成员将依次完成线索解锁。请排序决定谁负责破局、谁负责气氛、谁留下结尾反应。',
  choices: { action: rankedChars => {
    const [first, second, third] = rankedChars;
    first.popularity += 8;
    second.popularity += 5;
    third.popularity += 3;
    return `${first.name} 找到关键线索，${second.name} 和 ${third.name} 把清晨任务收成了一段完整的小团综。`;
  } },
};

const duoRehearsalEvent: GameEvent = {
  id: 'event-duo-rehearsal-note', type: 'CHOICE', title: '双人舞台：第一次合练卡住了',
  description: '互选搭档的第一轮合练并不顺利。你可以放大磨合过程，或者直接剪出默契片段，把问题留到幕后解决。',
  choices: [
    { text: '【保留磨合】让观众看见彼此调整节奏的过程。', effectTags: ['CP_SETTLE', 'PUBLIC_BOOST'], action: characters => {
      addGroupPopularity(characters, 1);
      return '观众看见了配合不是天生的，双人关系反而多了一层可信的成长感。';
    } },
    { text: '【直上高光】只剪默契最好的八拍，把双人感推到极致。', effectTags: ['CP_ESCALATE'], action: characters => {
      getTopCharacter(characters).popularity += 6;
      return '八拍高光很快被做成循环视频，双人舞台的讨论开始提前发酵。';
    } },
  ],
};

const duoStageRevealEvent: GameEvent = {
  id: 'event-duo-stage-reveal', type: 'CHOICE', title: '双人舞台：正式物料要留什么钩子',
  description: '舞台物料已经剪完。最后一个预告位可以放双人对视，也可以放排练室里互相纠正动作的片段。',
  choices: [
    { text: '【舞台对视】把最强情绪点留给预告，冲一波二创热度。', effectTags: ['CP_ESCALATE'], action: characters => {
      getTopCharacter(characters).popularity += 7;
      return '预告一出，讨论瞬间翻倍，观众开始逐帧猜测正式舞台的设计。';
    } },
    { text: '【练习互助】把重点放在彼此纠错与互相打气上。', effectTags: ['CP_SETTLE', 'GROUP_BOOST'], action: characters => {
      addGroupPopularity(characters, 2);
      return '双人舞台没有只剩暧昧，观众也认可这份配合是真正的共同完成。';
    } },
  ],
};

const songTradeEvent: GameEvent = {
  id: 'event-song-trade', type: 'CHOICE', title: '选曲之后：有人想交换曲目',
  description: '优先顺位公布后，有成员发现自己拿到的歌并不适合。你要允许私下交换，还是按原定顺位执行到底？',
  choices: [
    { text: '【允许交换】给低位成员一次主动争取适配曲目的机会。', effectTags: ['UNDERDOG_SPOTLIGHT'], action: characters => {
      const target = getLowCharacter(characters);
      target.popularity += 9;
      return `${target.name} 换到了更适合自己的曲目，原本被动的顺位第一次出现了转机。`;
    } },
    { text: '【坚持顺位】保住规则与效率，让第一顺位的优势真正兑现。', effectTags: ['FOCUS_ESCALATE'], action: characters => {
      getTopCharacter(characters).popularity += 6;
      return '流程没有被打乱，但优势成员和其他人的资源差距也被看得更清楚。';
    } },
  ],
};

const songCheckEvent: GameEvent = {
  id: 'event-song-check', type: 'CHOICE', title: '选曲收束：彩排片段先放哪一组',
  description: '首轮彩排结束，节目组只能提前公开一段片段。你要先放最稳的成片，还是先放意外的失误与反转？',
  choices: [
    { text: '【放完成度】先公开最稳的一组，把考核氛围做得专业有说服力。', effectTags: ['ANTI_RISK', 'PUBLIC_BOOST'], action: characters => {
      addGroupPopularity(characters, 2);
      return '成片质量先立住了，路人开始期待下一轮完整的考核舞台。';
    } },
    { text: '【放反转】保留结果不说，只放一段从失误到救场的过程。', effectTags: ['DRAMA_ESCALATE'], action: characters => {
      getTopCharacter(characters).popularity += 5;
      return '过程片段留下了足够悬念，评论区开始猜测最后是谁接住了这次考核。';
    } },
  ],
};

const groupAssessmentLineupEvent: GameEvent = {
  id: 'event-group-assessment-lineup', type: 'RANKING', title: '分组考核：核心位怎么排',
  description: '第一轮分组考核开始。请排序三位成员的核心位，第一位负责开场，第二位承担衔接，第三位负责结尾记忆点。',
  choices: { action: rankedChars => {
    const [first, second, third] = rankedChars;
    first.popularity += 9;
    second.popularity += 6;
    third.popularity += 4;
    return `${first.name} 的开场先声夺人，${second.name} 和 ${third.name} 让小组舞台拥有了完整的起承转合。`;
  } },
};

const assessmentReviewEvent: GameEvent = {
  id: 'event-assessment-review', type: 'CHOICE', title: '分组考核：点评该留在正片吗',
  description: '导师点评直指成员短板。你可以保留完整点评推动成长线，也可以只留下鼓励，把压力收在镜头外。',
  choices: [
    { text: '【保留完整点评】让观众看见问题和下一次进步的方向。', effectTags: ['PUBLIC_BOOST', 'UNDERDOG_SPOTLIGHT'], action: characters => {
      getLowCharacter(characters).popularity += 8;
      return '完整点评没有显得残酷，反而让观众愿意继续等待有人把短板练成下一次高光。';
    } },
    { text: '【只留鼓励】把压力留给训练室，正片优先给成员信心。', effectTags: ['ANTI_RISK', 'GROUP_BOOST'], action: characters => {
      addGroupPopularity(characters, 2);
      return '正片保住了团队氛围，成员也带着更稳定的状态走进下一轮录制。';
    } },
  ],
};

const finalStageReleaseEvent: GameEvent = {
  id: 'event-final-stage-release', type: 'CHOICE', title: '正式舞台: 收官镜头该落在哪',
  description: '舞台拍摄完成，只剩最后一个收官镜头。个人收官能冲出爆点，但也会触发偏心剪辑的终局审查；全员谢幕则更稳，却未必能保住个人记忆点。',
  choices: [
    { text: '【本命收官】让焦点成员独享最后的镜头和返场段落，接受终局审查。', effectTags: ['FOCUS_ESCALATE', 'PUBLIC_BOOST', 'FINALE_AUDIT'], action: () => {
      return '本命的收官直拍迅速出圈，整季最强记忆点被牢牢留在了一个名字上。';
    } },
    { text: '【全员谢幕】把镜头留给所有成员完成后的拥抱和致谢。', effectTags: ['GROUP_BOOST', 'ANTI_RISK'], action: characters => {
      addGroupPopularity(characters, 3);
      return '全员谢幕让前面的竞争有了落点，观众记住的是一档真正把每个人放进故事里的团综。';
    } },
  ],
};

export const groupShowEvents: GameEvent[] = [
  breakthroughOpeningEvent,
  wakeUpMissionEvent,
  breakfastBriefingEvent,
  morningMissionFinalEvent,
  duoStageEvent,
  duoRehearsalEvent,
  duoStageRevealEvent,
  songPriorityEvent,
  songTradeEvent,
  songCheckEvent,
  groupAssessmentLineupEvent,
  taskSwapEvent,
  assessmentReviewEvent,
  nightTalkEvent,
  rainPlanEvent,
  finalStageReleaseEvent,
];
