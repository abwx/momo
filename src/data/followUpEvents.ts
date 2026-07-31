import type { Character } from './characters';
import type { GameEvent } from './type/GameEvent';
import { additionalFollowUpEvents } from './additionalFollowUpEvents';

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

export const followUpEvents: GameEvent[] = [
  {
    id: 'followup-drama-backlash',
    type: 'CHOICE',
    title: '抓马余波：争议继续发酵',
    description: '上一轮制造的话题正在脱离节目组控制。现在要决定继续加码，还是牺牲一部分热度把它剪回可控叙事。',
    choices: [
      {
        text: '【继续加码】放出未经剪辑的争执片段，把讨论推到最高点。',
        effectTags: ['DRAMA_ESCALATE'],
        action: characters => {
          const target = getTopCharacter(characters);
          target.popularity += 12;
          addGroupPopularity(characters.filter(character => character.id !== target.id), -3);
          return `${target.name} 的话题冲上高位，但团体讨论开始被争吵吞没。`;
        },
      },
      {
        text: '【及时收束】公开完整花絮，承认剪辑取舍并把焦点还给节目内容。',
        effectTags: ['DRAMA_SETTLE'],
        action: characters => {
          addGroupPopularity(characters, 2);
          return '完整花絮压住了猜测，短期热度回落，但节目口碑重新回到安全线。';
        },
      },
    ],
  },
  {
    id: 'followup-cp-afterglow',
    type: 'PICK_TWO',
    title: '双人余温：二创开始爆发',
    description: '上一轮双人企划产生了明显余温，粉丝正在等待新的互动素材。选出两位成员追加一段轻量物料。',
    choices: {
      action: (char1, char2) => {
        char1.popularity += 8;
        char2.popularity += 8;
        return `${char1.name} 和 ${char2.name} 的追加物料继续发酵，双人线拥有了更稳定的讨论基础。`;
      },
    },
  },
  {
    id: 'followup-low-rank-spotlight',
    type: 'CHOICE',
    title: '逆袭窗口：低位成员被看见',
    description: '补位策略让低位成员获得讨论。你可以把这次曝光做成个人线，也可以让全团承接热度。',
    choices: [
      {
        text: '【个人直拍】立刻安排单人直拍，趁热把新的人设立住。',
        effectTags: ['UNDERDOG_SPOTLIGHT'],
        action: characters => {
          const target = getLowCharacter(characters);
          target.popularity += 16;
          return `${target.name} 的个人直拍释放后涨势明显，低位逆袭线正式成形。`;
        },
      },
      {
        text: '【群像承接】发布全员练习室花絮，避免新的资源失衡。',
        effectTags: ['FOCUS_SETTLE'],
        action: characters => {
          addGroupPopularity(characters, 4);
          return '团体物料承接住了热度，成员之间的镜头落差被重新拉平。';
        },
      },
    ],
  },
  {
    id: 'followup-public-crisis',
    type: 'CHOICE',
    title: '舆情追击：黑粉组织反扑',
    description: '负面词条开始影响录制进程。你可以把热度继续导向头部成员，也可以用口碑换取止损。',
    choices: [
      {
        text: '【止损澄清】发布完整材料，牺牲爆点换回信任。',
        effectTags: ['DRAMA_SETTLE'],
        action: characters => {
          addGroupPopularity(characters, 1);
          return '澄清材料逐步压住争议，讨论量下降，但成员状态回到了安全区。';
        },
      },
      {
        text: '【强势转移】推出高强度个人舞台，把注意力拉回头部成员。',
        effectTags: ['FOCUS_ESCALATE'],
        action: characters => {
          const target = getTopCharacter(characters);
          target.popularity += 14;
          return `${target.name} 的舞台切片夺回了注意力，但粉圈开始质疑资源继续向同一个名字倾斜。`;
        },
      },
    ],
  },
  {
    id: 'followup-focus-boycott',
    type: 'CHOICE',
    title: '镜头反噬：群像粉发起抵制',
    description: '连续高光让主角线变得刺眼。继续押注会换来更强爆点，但团综的群像信用已经接近临界值。',
    choices: [
      {
        text: '【坚持王牌】用主角个人特辑回应质疑，赌一把绝对核心的号召力。',
        effectTags: ['FOCUS_ESCALATE'],
        action: characters => {
          const target = getTopCharacter(characters);
          target.popularity += 10;
          addGroupPopularity(characters.filter(character => character.id !== target.id), -4);
          return `${target.name} 的个人热度继续上涨，但其他成员的粉丝开始退出讨论场。`;
        },
      },
      {
        text: '【群像回收】让低位成员主导特别篇，承认镜头配比需要修正。',
        effectTags: ['FOCUS_SETTLE', 'UNDERDOG_SPOTLIGHT'],
        action: characters => {
          const target = getLowCharacter(characters);
          target.popularity += 14;
          return `${target.name} 接住了特别篇的镜头，群像粉重新愿意为节目站台。`;
        },
      },
    ],
  },
  {
    id: 'followup-cp-fatigue',
    type: 'CHOICE',
    title: '双人透支：嗑糖开始变味',
    description: 'CP 物料连续加码后，讨论从嗑糖转向审视。现在必须选择继续兑现热度，或把双人线收回团体叙事。',
    choices: [
      {
        text: '【继续兑现】释出双人舞台花絮，把最后一波二创热度吃满。',
        effectTags: ['CP_ESCALATE'],
        action: characters => {
          getTopPair(characters).forEach(character => character.popularity += 8);
          return '双人花絮再次引爆讨论，但“过度营业”的质疑同步升温。';
        },
      },
      {
        text: '【回归群像】发布全员合作舞台，把注意力从配对转回作品。',
        effectTags: ['CP_SETTLE'],
        action: characters => {
          addGroupPopularity(characters, 2);
          return '全员舞台让讨论重新回到作品本身，双人线被妥善收束。';
        },
      },
    ],
  },
  {
    id: 'followup-drama-collapse',
    type: 'CHOICE',
    title: '失控预警：争议压过了节目',
    description: '抓马债务已经越过可控线。无论怎么选都会有代价，但制作人仍要决定损失落在哪一边。',
    choices: [
      {
        text: '【停更澄清】暂停争议内容，公开说明并接受短期掉热度。',
        effectTags: ['DRAMA_SETTLE'],
        action: characters => {
          addGroupPopularity(characters, -3);
          return '节目暂时失去热度，但至少止住了继续扩散的伤口。';
        },
      },
      {
        text: '【孤注一掷】开直播正面回应，赌一次情绪反转。',
        effectTags: ['DRAMA_ESCALATE'],
        action: characters => {
          const target = getTopCharacter(characters);
          target.popularity += 5;
          addGroupPopularity(characters.filter(character => character.id !== target.id), -2);
          return `${target.name} 接住了部分注意力，但这条线已经留下了无法完全抹平的裂痕。`;
        },
      },
    ],
  },
  {
    id: 'followup-drama-chase',
    type: 'CHOICE',
    title: '争议续集：偷拍视频再度流出',
    description: '上一轮讨论没有消退，新的片段又被剪成了对立叙事。此时的每一句回应都会改变观众对节目组的判断。',
    choices: [
      {
        text: '【继续追击】让主角在直播里正面回应，把舆论引向更大的反转。',
        effectTags: ['DRAMA_ESCALATE'],
        action: characters => {
          const target = getTopCharacter(characters);
          target.popularity += 10;
          return `${target.name} 的回应抢回了话题中心，但所有人都在等下一次失误。`;
        },
      },
      {
        text: '【证据收束】放出录制时间线，用事实终止二次剪辑。',
        effectTags: ['DRAMA_SETTLE', 'ANTI_RISK'],
        action: characters => {
          addGroupPopularity(characters, 2);
          return '时间线让大部分质疑失去支点，节目从热闹重新回到内容本身。';
        },
      },
    ],
  },
  {
    id: 'followup-drama-crossroads',
    type: 'CHOICE',
    title: '收视抉择：结尾要不要留钩子',
    description: '剪辑台上只剩最后一个决定：保留冲突的悬念，还是让所有人看到完整和解。',
    choices: [
      {
        text: '【悬念拉满】保留沉默的最后十秒，把下期预告做成全网谜题。',
        effectTags: ['DRAMA_ESCALATE'],
        action: characters => {
          getTopPair(characters).forEach(character => character.popularity += 6);
          return '预告引爆了猜测，下一期还没播，讨论区已经先分成了两派。';
        },
      },
      {
        text: '【完整和解】把道歉、解释和互相打气都剪进正片。',
        effectTags: ['DRAMA_SETTLE', 'GROUP_BOOST'],
        action: characters => {
          addGroupPopularity(characters, 3);
          return '观众终于看见了完整关系，争议没有消失，但不再定义这档节目。';
        },
      },
    ],
  },
  {
    id: 'followup-drama-recovery',
    type: 'CHOICE',
    title: '口碑回暖：制作组公开信',
    description: '你已经选择收束争议。接下来要把回暖的信任变成长期口碑，而不是一次短暂的原谅。',
    choices: [
      {
        text: '【透明制作】公开剪辑原则与录制花絮，建立新的沟通规则。',
        effectTags: ['DRAMA_SETTLE', 'PUBLIC_BOOST'],
        action: characters => {
          addGroupPopularity(characters, 2);
          return '透明的制作规则让观众重新相信节目组，路人讨论开始变得友善。';
        },
      },
      {
        text: '【静默回归】不再回应争议，直接用下一期高质量内容说话。',
        effectTags: ['GROUP_BOOST'],
        action: characters => {
          addGroupPopularity(characters, 4);
          return '新内容替代了旧争议，成员的表现成为评论区新的共同语言。';
        },
      },
    ],
  },
  {
    id: 'followup-drama-final',
    type: 'CHOICE',
    title: '抓马线收官：直播复盘夜',
    description: '赛季最后一次面对镜头。你可以把这条线包装成成长，也可以承认它曾经失控。',
    choices: [
      {
        text: '【复盘成长】让成员亲自讲述如何跨过误解与压力。',
        effectTags: ['DRAMA_SETTLE', 'PUBLIC_BOOST'],
        action: characters => {
          addGroupPopularity(characters, 2);
          return '复盘没有回避伤口，反而让这段经历变成了节目最真诚的章节。';
        },
      },
      {
        text: '【高燃收官】用舞台混剪压轴，把所有争议留在身后。',
        effectTags: ['DRAMA_ESCALATE'],
        action: characters => {
          getTopCharacter(characters).popularity += 8;
          return '高燃混剪再次点亮热搜，但观众仍会记得这条线曾经多么危险。';
        },
      },
    ],
  },
  {
    id: 'followup-ensemble-special',
    type: 'CHOICE',
    title: '群像特辑：交换主视角',
    description: '低位成员的镜头获得了反馈。下一步是继续押个人故事，还是让每个人都拥有同等的叙事位置。',
    choices: [
      {
        text: '【成长主线】跟拍低位成员的练习与突破，把逆袭讲完整。',
        effectTags: ['UNDERDOG_SPOTLIGHT'],
        action: characters => {
          getLowCharacter(characters).popularity += 14;
          return '一条完整的成长线让观众记住了新的名字，逆袭不再只是偶然的高光。';
        },
      },
      {
        text: '【接力视角】每位成员接管十分钟镜头，做成群像日记。',
        effectTags: ['FOCUS_SETTLE', 'GROUP_BOOST'],
        action: characters => {
          addGroupPopularity(characters, 3);
          return '镜头在成员之间流动，团粉开始用“每个人都不能少”形容这期节目。';
        },
      },
    ],
  },
  {
    id: 'followup-ensemble-relay',
    type: 'CHOICE',
    title: '全员接力：任务赛反转',
    description: '特别篇的反馈超出预期。节目组获得一场全员任务赛的额外录制机会，资源必须分配给不同位置。',
    choices: [
      {
        text: '【弱项补位】把关键任务交给平时镜头最少的成员。',
        effectTags: ['UNDERDOG_SPOTLIGHT', 'PUBLIC_BOOST'],
        action: characters => {
          getLowCharacter(characters).popularity += 12;
          return '低位成员完成了关键一击，路人开始主动回看此前被忽略的镜头。';
        },
      },
      {
        text: '【团队配合】按成员特长拆分任务，让所有人各赢一次。',
        effectTags: ['GROUP_BOOST'],
        action: characters => {
          addGroupPopularity(characters, 3);
          return '没有单一主角抢走胜利，团队配合成为这期最被讨论的看点。';
        },
      },
    ],
  },
  {
    id: 'followup-ensemble-final',
    type: 'CHOICE',
    title: '群像收官：全员信件企划',
    description: '这一季的成员关系已经被观众看见。收官物料决定是把情感留给团体，还是推向个人出圈。',
    choices: [
      {
        text: '【互相写信】公开每个人写给队友的一段话。',
        effectTags: ['GROUP_BOOST', 'PUBLIC_BOOST'],
        action: characters => {
          addGroupPopularity(characters, 3);
          return '信件把不同成员的关系串成一条线，群像口碑在收官夜完成兑现。';
        },
      },
      {
        text: '【个人番外】为逆袭成员制作一支独立的收官短片。',
        effectTags: ['UNDERDOG_SPOTLIGHT'],
        action: characters => {
          getLowCharacter(characters).popularity += 10;
          return '独立番外让逆袭成员拥有了收官后的第一批稳定关注者。';
        },
      },
    ],
  },
  {
    id: 'followup-steady-trust',
    type: 'CHOICE',
    title: '信任红利：品牌提出长期合作',
    description: '稳定的节目口碑让品牌愿意签下整季合作。你要守住规则，还是把信任换成更大的曝光。',
    choices: [
      {
        text: '【守住规则】签署透明合作条款，拒绝争议性营销。',
        effectTags: ['ANTI_RISK', 'PUBLIC_BOOST'],
        action: characters => {
          addGroupPopularity(characters, 2);
          return '合作不算最轰动，却让观众把节目组视为值得长期追随的制作团队。';
        },
      },
      {
        text: '【兑现信任】把合作拍成高规格舞台，主动冲击更大圈层。',
        effectTags: ['PUBLIC_BOOST'],
        action: characters => {
          addGroupPopularity(characters, 4);
          return '高规格舞台扩大了覆盖面，稳健运营第一次获得了破圈爆点。';
        },
      },
    ],
  },
  {
    id: 'followup-steady-audit',
    type: 'CHOICE',
    title: '制作审查：预算与镜头公开',
    description: '节目组主动公布制作报告，粉丝开始核对每一次投入是否真的公平。',
    choices: [
      {
        text: '【公开账本】把预算、镜头和资源分配全部公开。',
        effectTags: ['ANTI_RISK', 'GROUP_BOOST'],
        action: characters => {
          addGroupPopularity(characters, 1);
          return '公开账本让质疑无处着力，稳健不再被误解为无聊。';
        },
      },
      {
        text: '【公布原则】只公开规则，不让每一笔决策变成粉圈审判。',
        effectTags: ['PUBLIC_BOOST'],
        action: characters => {
          getTopCharacter(characters).popularity += 5;
          return '制作原则守住了专业边界，也保留了节目应有的惊喜空间。';
        },
      },
    ],
  },
  {
    id: 'followup-steady-safety-net',
    type: 'CHOICE',
    title: '稳健考验：临播前的技术故障',
    description: '收官前出现技术故障。没有抓马的捷径，只剩下成本、时间与观众耐心之间的取舍。',
    choices: [
      {
        text: '【延播修复】推迟播出，保证成片完整。',
        effectTags: ['ANTI_RISK'],
        action: characters => {
          addGroupPopularity(characters, 1);
          return '延播换来了完整成片，观众认可节目组没有拿半成品敷衍。';
        },
      },
      {
        text: '【直播陪伴】成员开直播陪粉丝等待，把事故变成互动时刻。',
        effectTags: ['GROUP_BOOST', 'PUBLIC_BOOST'],
        action: characters => {
          addGroupPopularity(characters, 3);
          return '等待没有变成抱怨，反而成了本季最自然的一次陪伴。';
        },
      },
    ],
  },
  {
    id: 'followup-steady-final',
    type: 'CHOICE',
    title: '稳健收官：口碑答卷',
    description: '这一季没有靠一次爆炸性争议取胜。最后一支物料要把长期信任变成怎样的答案？',
    choices: [
      {
        text: '【幕后纪录】让观众看见每一份认真被如何完成。',
        effectTags: ['ANTI_RISK', 'PUBLIC_BOOST'],
        action: characters => {
          addGroupPopularity(characters, 2);
          return '幕后纪录让长期信任有了具体形状，口碑成为最稳定的收官礼物。';
        },
      },
      {
        text: '【全团感谢】成员逐一回应粉丝的陪伴与建议。',
        effectTags: ['GROUP_BOOST'],
        action: characters => {
          addGroupPopularity(characters, 3);
          return '真诚感谢让团粉盘在收官夜再次凝聚，稳健路线完成了自己的高光。';
        },
      },
    ],
  },
  ...additionalFollowUpEvents,
];
