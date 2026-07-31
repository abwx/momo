import type { Character } from './characters';
import type { GameEvent } from './type/GameEvent';

function getTopCharacter(characters: Character[]): Character {
  return [...characters].sort((a, b) => b.popularity - a.popularity)[0];
}

function getLowCharacter(characters: Character[]): Character {
  return [...characters].sort((a, b) => a.popularity - b.popularity)[0];
}

function getTopPair(characters: Character[]): Character[] {
  return [...characters].sort((a, b) => b.popularity - a.popularity).slice(0, 2);
}

function addGroupPopularity(characters: Character[], value: number): void {
  characters.forEach(character => character.popularity += value);
}

const focusRouteEvents: GameEvent[] = [
  {
    id: 'followup-focus-rebuild',
    type: 'CHOICE',
    title: '镜头公约：偏心后的第一次修复',
    description: '你已经承认镜头失衡。现在要决定修复是一次公关动作，还是把机会真正还给此前被忽略的人。',
    choices: [
      {
        text: '【公开轮换表】公布后续镜头分配，让低位成员先拿到单人任务。',
        effectTags: ['FOCUS_SETTLE', 'UNDERDOG_SPOTLIGHT'],
        action: characters => {
          const target = getLowCharacter(characters);
          target.popularity += 12;
          return `${target.name} 接住了第一段补位镜头，观众开始相信这次修复不是口号。`;
        },
      },
      {
        text: '【保留主线】承诺增加群像素材，但不改变本命主线的叙事位置。',
        effectTags: ['FOCUS_ESCALATE'],
        action: characters => {
          getTopCharacter(characters).popularity += 7;
          addGroupPopularity(characters, 1);
          return '镜头配置有所缓和，但观众仍能看出主角线没有真正退场。';
        },
      },
    ],
  },
  {
    id: 'followup-focus-standoff',
    type: 'CHOICE',
    title: '粉圈对垒：主角线还要不要加码',
    description: '你选择了继续押注本命，反对声也因此变得更具体。最后一次加码能换来断层热度，也可能坐实资源倾斜。',
    choices: [
      {
        text: '【再押一次】用个人舞台回应所有质疑，把讨论压到最高点。',
        effectTags: ['FOCUS_ESCALATE'],
        action: characters => {
          const target = getTopCharacter(characters);
          target.popularity += 10;
          addGroupPopularity(characters.filter(character => character.id !== target.id), -2);
          return `${target.name} 的舞台赢下了热度，但成员之间的镜头落差再也藏不住。`;
        },
      },
      {
        text: '【让出压轴】把压轴改为全员接力舞台，用节目效果结束对垒。',
        effectTags: ['FOCUS_SETTLE', 'GROUP_BOOST'],
        action: characters => {
          addGroupPopularity(characters, 3);
          return '压轴不再属于一个人，观众把注意力重新放回了全团表现。';
        },
      },
    ],
  },
  {
    id: 'followup-focus-final',
    type: 'CHOICE',
    title: '本命线收官：偏爱留下什么',
    description: '收官物料会决定这条本命线是“成就一个主角”，还是“让所有人被看见之后的主角”。',
    choices: [
      {
        text: '【成长回信】让本命成员回应一路获得的镜头与质疑。',
        effectTags: ['FOCUS_SETTLE', 'PUBLIC_BOOST'],
        action: characters => {
          getTopCharacter(characters).popularity += 5;
          return '回应没有回避偏爱，反而把它变成了继续成长的承诺。';
        },
      },
      {
        text: '【个人纪录】为本命制作独立收官短片，兑现核心粉丝期待。',
        effectTags: ['FOCUS_ESCALATE'],
        action: characters => {
          getTopCharacter(characters).popularity += 8;
          return '独立短片稳住了核心盘，也让群像争议成为这季无法绕开的注脚。';
        },
      },
    ],
  },
];

const cpRouteEvents: GameEvent[] = [
  {
    id: 'followup-cp-sponsorship',
    type: 'CHOICE',
    title: '双人企划：热度要不要商业化',
    description: '双人讨论盘正在升温，品牌递来一份限定合作。接下合作能兑现当下热度，也会让关系开始被商业目标定义。',
    choices: [
      {
        text: '【限定双人拍摄】接下合作，用默契互动吃满当期讨论。',
        effectTags: ['CP_ESCALATE'],
        action: characters => {
          getTopPair(characters).forEach(character => character.popularity += 7);
          return '限定物料放出后，二创迅速扩散，CP 线正式成了节目的强势话题。';
        },
      },
      {
        text: '【组合企划】让双人主导一场全员合作，把热度分给团体内容。',
        effectTags: ['CP_SETTLE', 'GROUP_BOOST'],
        action: characters => {
          addGroupPopularity(characters, 2);
          return '双人默契成了团队任务的引子，讨论没有消失，只是更自然地回到了节目里。';
        },
      },
    ],
  },
  {
    id: 'followup-cp-boundaries',
    type: 'CHOICE',
    title: '双人边界：互动被放大之后',
    description: '镜头外的一句玩笑也被逐帧解读。现在要给关系留出边界，还是继续把暧昧感当作节目钩子？',
    choices: [
      {
        text: '【说明边界】在花絮里保留自然相处，也明确不让关系成为唯一卖点。',
        effectTags: ['CP_SETTLE', 'ANTI_RISK'],
        action: characters => {
          addGroupPopularity(characters, 1);
          return '观众得到真实互动，也看见节目组没有继续透支两人的关系。';
        },
      },
      {
        text: '【预告留钩】保留最有争议的十秒，让下期继续发酵。',
        effectTags: ['CP_ESCALATE'],
        action: characters => {
          getTopPair(characters).forEach(character => character.popularity += 6);
          return '预告再次把讨论推高，热度很足，但“刻意营业”的质疑也被一起带回来了。';
        },
      },
    ],
  },
  {
    id: 'followup-cp-final',
    type: 'CHOICE',
    title: '双人线收官：糖点之外的答案',
    description: '最后一支双人物料决定观众记住的是一段化学反应，还是一场被过度消费的营销。',
    choices: [
      {
        text: '【并肩舞台】用双人合作舞台回应讨论，把关系落在作品里。',
        effectTags: ['CP_SETTLE', 'PUBLIC_BOOST'],
        action: characters => {
          getTopPair(characters).forEach(character => character.popularity += 4);
          return '舞台把所有讨论落回实力，两人的化学反应留下了更长的余温。';
        },
      },
      {
        text: '【彩蛋加更】放出未播互动，给二创盘最后一次高燃素材。',
        effectTags: ['CP_ESCALATE'],
        action: characters => {
          getTopPair(characters).forEach(character => character.popularity += 7);
          return '彩蛋引爆了收官夜，热搜很热，但也让这条线的透支风险停在了最高处。';
        },
      },
    ],
  },
];

export const additionalFollowUpEvents: GameEvent[] = [...focusRouteEvents, ...cpRouteEvents];
