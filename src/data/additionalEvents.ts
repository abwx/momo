import type { Character } from './characters';
import type { GameEvent } from './type/GameEvent';

function getTopCharacter(characters: Character[]): Character {
  return [...characters].sort((a, b) => b.popularity - a.popularity)[0];
}

function getLowCharacter(characters: Character[]): Character {
  return [...characters].sort((a, b) => a.popularity - b.popularity)[0];
}

function addGroupPopularity(characters: Character[], value: number): void {
  characters.forEach(character => character.popularity += value);
}

const sponsorEditEvent: GameEvent = {
  id: 'event-sponsor-edit-rights',
  type: 'CHOICE',
  title: '资源交换：品牌想决定谁上正片',
  description: '本期合作品牌愿意追加宣传资源，但提出要指定一位成员占据正片核心镜头。你要接受资源置换，还是守住节目的群像叙事？',
  choices: [
    {
      text: '【坚持群像版】只保留自然植入，让每位成员都参与任务。',
      effectTags: ['FOCUS_SETTLE', 'GROUP_BOOST'],
      action: characters => {
        addGroupPopularity(characters, 3);
        return '品牌露出没有抢走节目主线，观众记住的是全员完成任务时的默契。';
      },
    },
    {
      text: '【接受指定镜头】用头部成员扛起品牌短片，换取更大曝光。',
      effectTags: ['FOCUS_ESCALATE', 'PUBLIC_BOOST'],
      action: characters => {
        const target = getTopCharacter(characters);
        target.popularity += 10;
        return `${target.name} 的品牌短片出圈了，但镜头为什么总给同一个人的讨论也被放大。`;
      },
    },
  ],
};

const overnightEditEvent: GameEvent = {
  id: 'event-overnight-edit',
  type: 'PICK_TWO',
  title: '深夜花絮：谁留在剪辑室收尾',
  description: '收工后，节目组拍到两位成员主动留下整理素材和道具。选出两人，把这段不设防的互动剪进正片彩蛋。',
  choices: {
    action: (char1, char2) => {
      char1.popularity += 8;
      char2.popularity += 8;
      return `${char1.name} 和 ${char2.name} 的深夜收工花絮意外出圈，观众开始讨论他们镜头外的默契。`;
    },
  },
};

const openRehearsalEvent: GameEvent = {
  id: 'event-open-rehearsal',
  type: 'RANKING',
  title: '开放排练：三段高光该怎么排',
  description: '节目组决定开放一段不修音排练。请排序三位成员的展示顺序，第一位承担最硬核的开场，第三位负责情绪收束。',
  choices: {
    action: rankedChars => {
      const [first, second, third] = rankedChars;
      first.popularity += 11;
      second.popularity += 7;
      third.popularity += 4;
      return `${first.name} 的开场让路人停下来看完，${second.name} 和 ${third.name} 则把整段排练稳稳接住。`;
    },
  },
};

const liveCommentEvent: GameEvent = {
  id: 'event-live-comment-pileup',
  type: 'CHOICE',
  title: '弹幕堆叠：直播间出现尖锐提问',
  description: '直播间不断刷出“镜头分配不公平”的提问。你可以把它当成一次解释机会，也可以用更强的节目钩子把话题带走。',
  choices: [
    {
      text: '【正面回应】让成员说明录制分工，并补放未播的群像片段。',
      effectTags: ['ANTI_RISK', 'GROUP_BOOST'],
      action: characters => {
        addGroupPopularity(characters, 2);
        return '解释没有卖惨，补放素材也让观众看见了此前没被剪进正片的努力。';
      },
    },
    {
      text: '【高能转场】立刻放出下一期冲突预告，把弹幕焦点引向更大的悬念。',
      effectTags: ['DRAMA_ESCALATE'],
      action: characters => {
        const target = getTopCharacter(characters);
        target.popularity += 9;
        return `${target.name} 的预告镜头瞬间刷屏，问题被压下去了，但新的争议也开始酝酿。`;
      },
    },
  ],
};

const supportingRoleEvent: GameEvent = {
  id: 'event-supporting-role',
  type: 'CHOICE',
  title: '临时改本：谁来接住掉下来的戏',
  description: '原定主角因身体不适无法完成单人任务，现场需要立刻改本。你是让低位成员接住机会，还是把内容重新集中给最稳的人？',
  choices: [
    {
      text: '【给新人机会】把单人任务交给此前镜头最少的成员。',
      effectTags: ['UNDERDOG_SPOTLIGHT', 'PUBLIC_BOOST'],
      action: characters => {
        const target = getLowCharacter(characters);
        target.popularity += 13;
        return `${target.name} 接住了原本不属于自己的任务，现场发挥让观众第一次主动记住了这个名字。`;
      },
    },
    {
      text: '【保住完成度】由头部成员接手，确保本期核心环节不失速。',
      effectTags: ['FOCUS_ESCALATE'],
      action: characters => {
        const target = getTopCharacter(characters);
        target.popularity += 8;
        return `${target.name} 稳住了现场，但原本可能改变镜头格局的机会也随之消失。`;
      },
    },
  ],
};

export const additionalEvents: GameEvent[] = [
  sponsorEditEvent,
  overnightEditEvent,
  openRehearsalEvent,
  liveCommentEvent,
  supportingRoleEvent,
];
