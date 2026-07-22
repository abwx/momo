import type { Character } from './characters';
import type { GameEvent } from './type/GameEvent';

function getTopCharacter(characters: Character[]) {
  return [...characters].sort((a, b) => b.popularity - a.popularity)[0];
}

function getLowCharacter(characters: Character[]) {
  return [...characters].sort((a, b) => a.popularity - b.popularity)[0];
}

export const followUpEvents: GameEvent[] = [
  {
    id: 'followup-drama-backlash',
    type: 'CHOICE',
    title: '抓马余波：争议继续发酵',
    description: '上一轮制造的话题继续扩散，讨论度和质疑声同时冲高。现在要决定是继续吃流量，还是及时降温。',
    choices: [
      {
        text: '顺势放出幕后花絮，把争议改写成真实感。',
        action: (characters) => {
          const target = getTopCharacter(characters);
          target.popularity += 12;
          return `${target.name} 的幕后片段挽回口碑，争议被重新解读成真实高光。`;
        },
      },
      {
        text: '立刻降温控评，避免黑粉继续扩散。',
        action: (characters) => {
          characters.forEach(char => char.popularity += 3);
          return '团队选择稳住阵脚，全员讨论恢复到可控区间。';
        },
      },
    ],
  },
  {
    id: 'followup-cp-afterglow',
    type: 'PICK_TWO',
    title: '双人余温：二创开始爆发',
    description: '上一次双人企划产生了明显余温，粉丝正在等待新的互动素材。选出两位成员追加一段轻量物料。',
    choices: {
      action: (char1, char2) => {
        char1.popularity += 10;
        char2.popularity += 10;
        return `${char1.name} 和 ${char2.name} 的追加物料继续发酵，双人线拥有了更稳定的讨论基础。`;
      },
    },
  },
  {
    id: 'followup-low-rank-spotlight',
    type: 'CHOICE',
    title: '逆袭窗口：低位成员被看见',
    description: '上一轮补位策略让低位成员获得讨论，短视频平台开始出现“怎么以前没发现他”的声音。',
    choices: [
      {
        text: '立刻安排个人直拍，趁热把新人设立住。',
        action: (characters) => {
          const target = getLowCharacter(characters);
          target.popularity += 18;
          return `${target.name} 的个人直拍释放后涨势明显，低位逆袭线开始成形。`;
        },
      },
      {
        text: '让全团一起承接热度，避免粉圈失衡。',
        action: (characters) => {
          characters.forEach(char => char.popularity += 5);
          return '团队用团体物料承接热度，全员获得一轮稳定曝光。';
        },
      },
    ],
  },
  {
    id: 'followup-public-crisis',
    type: 'CHOICE',
    title: '舆情追击：黑粉组织反扑',
    description: '黑粉声量没有被及时压下去，负面词条开始追击录制进程。必须立刻处理。',
    choices: [
      {
        text: '发布完整澄清物料，牺牲热度换口碑。',
        action: (characters) => {
          characters.forEach(char => char.popularity += 2);
          return '完整澄清让争议逐渐退潮，虽然爆点减少，但口碑回到安全线。';
        },
      },
      {
        text: '转移话题，推出高强度舞台切片。',
        action: (characters) => {
          const target = getTopCharacter(characters);
          target.popularity += 16;
          return `${target.name} 的舞台切片强势转移视线，流量被重新拉回作品本身。`;
        },
      },
    ],
  },
];
