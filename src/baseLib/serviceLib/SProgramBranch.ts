import type { Character } from '../../data/characters';
import type { Choice, GameEvent } from '../../data/type/GameEvent';
import type { ProgramEpisode } from '../../data/type/ProgramEpisode';
import type { SClassTrackState } from './type/SClassTrack';
import type { SSeasonState } from './type/SSeasonState';

const PRESSURE_BRANCH_THRESHOLD = 12;

const BRANCH_COPY: Record<string, Record<string, { title: string; description: string }>> = {
  assessment: {
    class1: { title: '试录之后：一班补拍资格', description: '本命暂居一班，舞台导演给了一次补拍优先资格。你可以用它巩固个人镜头，也可以带一位追分成员一起补齐片段，守住整组的席位下限。' },
    class2: { title: '试录之后：二班补拍窗口', description: '本命暂在二班，样片表上还留着一个补拍窗口。你要让落后成员单独挑战高难段落，还是把时间拆给全组补齐基础镜头？' },
    pressure: { title: '试录之后：偏心审查', description: '开营样片的重心已被观众察觉。后续补拍会被当作资源分配的证据：补齐缺失片段能降压，继续给个人加码则会计入终局审查。' },
  },
  morning: {
    class1: { title: '通关之后：一班带队资格', description: '本命暂居一班，下一段任务可优先指定负责人。让他继续带队能稳住交付，也可以把关键工位交给追分成员，避免全组依赖一个人。' },
    class2: { title: '通关之后：二班改线窗口', description: '本命暂在二班，导演允许全组再走一次备用路线。你要让低位成员承担关键节点冲分，还是选择稳妥路线，把每个人的完成度先拉回及格。' },
    pressure: { title: '通关之后：偏心审查', description: '任务签字和分工记录已被观众逐项比对。此时的负责人安排会影响终局席位审查：补齐轮换可降低压力，继续集中权限会换来更高风险。' },
  },
  'duo-stage': {
    class1: { title: '双人舞台：一班排练优先级', description: '本命暂居一班，可以先占用独立排练厅。你可以用它打磨个人定点，也可以留出时段给尚未适应编舞的成员，稳住整组舞台。' },
    class2: { title: '双人舞台：二班补位舞者', description: '本命暂在二班，编舞老师需要一位补位舞者完成备用版本。你要让低位成员冒险接下高难动作，还是把动作拆开，让全组一起完成备用走位？' },
    pressure: { title: '双人舞台：偏心审查', description: '独立排练厅的使用记录已经引起议论。此时追加个人排练会加重终局审查；把时段分给未被覆盖的成员，则能修复资源失衡。' },
  },
  release: {
    class1: { title: '舞台释出：一班返场窗口', description: '本命暂居一班，平台愿意追加一支返场短片。你可以巩固个人记忆点，也可以做成接力版本，让尚未被看见的成员补上关键段。' },
    class2: { title: '舞台释出：二班返场窗口', description: '本命暂在二班，平台只留出一次补拍机会。你要让低位成员独自接下高难返场，还是把补拍拆成多人接力，先保住最终呈现？' },
    pressure: { title: '舞台释出：偏心审查', description: '收官前的资源表已经被盯上。当前偏心压力下，这次补拍会直接影响终局席位审查：补齐缺口更稳，继续追加个人返场则代价更高。' },
  },
};

/** Builds the deterministic state branches available after each authored episode. */
export function SCreateProgramBranchEvents(program: ProgramEpisode[]): GameEvent[] {
  return program.flatMap(episode => SCreateEpisodeBranchEvents(episode));
}

/** Selects one persisted branch from the player's class position and bias pressure. */
export function SGetEpisodeBranchEvent(episode: ProgramEpisode, classTrackState: SClassTrackState, seasonState: SSeasonState, biasId: string, branchEvents: GameEvent[]): GameEvent {
  const eventId = SGetBranchEventId(episode, classTrackState, seasonState, biasId);
  return branchEvents.find(event => event.id === eventId)!;
}

function SCreateEpisodeBranchEvents(episode: ProgramEpisode): GameEvent[] {
  return ['class1', 'class2', 'pressure'].map(route => SCreateBranchEvent(episode, route));
}

function SCreateBranchEvent(episode: ProgramEpisode, route: string): GameEvent {
  return { id: `event-branch-${episode.id}-${route}`, type: 'CHOICE', ...SCreateBranchCopy(episode, route), choices: SCreateBranchChoices(route) };
}

function SCreateBranchCopy(episode: ProgramEpisode, route: string) {
  return BRANCH_COPY[episode.id]?.[route] || SCreateDefaultBranchCopy(episode, route);
}

function SCreateDefaultBranchCopy(episode: ProgramEpisode, route: string) {
  if (route === 'class2') return { title: `${episode.title}：二班补位窗口`, description: '本命暂在二班，节目组给出一次补位机会。要冲一次个人翻盘，还是稳住全组的拍摄节奏？' };
  if (route === 'pressure') return { title: `${episode.title}：偏心审查前置`, description: '资源分配已经被观众察觉。终局审查会记账，这次安排必须在个人收益和组内平衡之间取舍。' };
  return { title: `${episode.title}：一班守位机会`, description: '本命暂居一班，但席位还不稳。要巩固个人成绩，还是把机会分给正在追分的成员？' };
}

function SCreateBranchChoices(route: string): Choice[] {
  if (route === 'class2') return SCreateClass2Choices();
  if (route === 'pressure') return SCreatePressureChoices();
  return SCreateClass1Choices();
}

function SCreateClass2Choices(): Choice[] {
  return [
    { text: '【给替补一个完整工位】让当前热度最低的成员承担高难补位，换取冲班机会。', effectTags: ['UNDERDOG_SPOTLIGHT'], action: (characters: Character[]) => SBoostLowestCharacter(characters, 11, '补位工位被接住，二班的追分终于有了能落到成绩单上的抓手。') },
    { text: '【把补位拆成轮换】由全组分担缺口，先保住下一轮席位下限。', effectTags: ['GROUP_BOOST', 'ANTI_RISK'], action: (characters: Character[]) => SBoostGroup(characters, 3, '轮换没有被一次冒险拖散，稳定交付反而保住了继续追分的空间。') },
  ];
}

function SCreatePressureChoices(): Choice[] {
  return [
    { text: '【补齐缺失工位】把追加资源交给此前未覆盖的成员，先降偏心压力。', effectTags: ['FOCUS_SETTLE', 'GROUP_BOOST'], action: (characters: Character[]) => SBoostGroup(characters, 3, '资源重新轮换后，观众开始相信这一季并非只为一个人服务。') },
    { text: '【追加个人优先级】再给当前热度最高的成员一段独立任务，接受更重审查。', effectTags: ['FOCUS_ESCALATE', 'PUBLIC_BOOST'], action: (characters: Character[]) => SBoostTopCharacter(characters, 8, '独立任务确实留下了爆点，但资源倾斜的质疑也被推到了更高的位置。') },
  ];
}

function SCreateClass1Choices(): Choice[] {
  return [
    { text: '【兑现优先资格】让当前热度最高的成员承担关键段，巩固一班成绩。', effectTags: ['FOCUS_ESCALATE'], action: (characters: Character[]) => SBoostTopCharacter(characters, 7, '关键段稳住了头部成绩，但优先资格也开始带来额外压力。') },
    { text: '【转成协作工位】把关键段交给热度最低的追分成员，换取整组稳定。', effectTags: ['UNDERDOG_SPOTLIGHT', 'GROUP_BOOST'], action: (characters: Character[]) => SBoostLowestCharacter(characters, 9, '追分成员补上了关键工位，组内竞争没有演变成只剩一个人的独角戏。') },
  ];
}

function SGetBranchEventId(episode: ProgramEpisode, classTrackState: SClassTrackState, seasonState: SSeasonState, biasId: string): string {
  const route = classTrackState.classById[biasId] === 'CLASS2' ? 'class2' : seasonState.biasPressure >= PRESSURE_BRANCH_THRESHOLD ? 'pressure' : 'class1';
  return episode.branchEventIds.find(id => id.endsWith(`-${route}`))!;
}

function SBoostGroup(characters: Character[], value: number, result: string): string {
  characters.forEach(character => character.popularity += value);
  return result;
}

function SBoostLowestCharacter(characters: Character[], value: number, result: string): string {
  SGetLowestCharacter(characters).popularity += value;
  return result;
}

function SBoostTopCharacter(characters: Character[], value: number, result: string): string {
  SGetTopCharacter(characters).popularity += value;
  return result;
}

function SGetLowestCharacter(characters: Character[]): Character {
  return [...characters].sort((left, right) => left.popularity - right.popularity)[0];
}

function SGetTopCharacter(characters: Character[]): Character {
  return [...characters].sort((left, right) => right.popularity - left.popularity)[0];
}
