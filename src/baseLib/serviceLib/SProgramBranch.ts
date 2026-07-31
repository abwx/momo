import type { Character } from '../../data/characters';
import type { Choice, GameEvent } from '../../data/type/GameEvent';
import type { ProgramEpisode } from '../../data/type/ProgramEpisode';
import type { SClassTrackState } from './type/SClassTrack';
import type { SSeasonState } from './type/SSeasonState';

const PRESSURE_BRANCH_THRESHOLD = 12;

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
  if (route === 'class2') return { title: `${episode.title}：二班补位窗口`, description: '本命暂在二班，节目组把一段补位素材交到你手里。要用它冲一次个人翻盘，还是稳住全组的考核节奏？' };
  if (route === 'pressure') return { title: `${episode.title}：偏心审查前置`, description: '偏心压力已经被观众察觉。收官审查会记账，这段加拍必须在个人记忆点和镜头回收之间做选择。' };
  return { title: `${episode.title}：一班守位加拍`, description: '本命暂居一班，但席位还不稳。加拍可以继续冲个人高光，也可以把镜头分给正在追分的成员。' };
}

function SCreateBranchChoices(route: string): Choice[] {
  if (route === 'class2') return SCreateClass2Choices();
  if (route === 'pressure') return SCreatePressureChoices();
  return SCreateClass1Choices();
}

function SCreateClass2Choices(): Choice[] {
  return [
    { text: '【逆袭补位】让本命接下高难度补位段，换取冲班机会。', effectTags: ['UNDERDOG_SPOTLIGHT'], action: (characters: Character[]) => SBoostLowestCharacter(characters, 11, '补位段接住了，二班的追分终于有了具体抓手。') },
    { text: '【稳住组队】把补位拆给全组，先保住下一轮考核下限。', effectTags: ['GROUP_BOOST', 'ANTI_RISK'], action: (characters: Character[]) => SBoostGroup(characters, 3, '组队没有被一次冒险拖散，稳定完成反而保住了继续追分的空间。') },
  ];
}

function SCreatePressureChoices(): Choice[] {
  return [
    { text: '【回收镜头】把加拍留给此前被忽略的成员，先降偏心压力。', effectTags: ['FOCUS_SETTLE', 'GROUP_BOOST'], action: (characters: Character[]) => SBoostGroup(characters, 3, '镜头重新分配后，观众开始相信这一季并非只为一个人服务。') },
    { text: '【继续押注】再给本命一段单人加拍，接受更重的审查。', effectTags: ['FOCUS_ESCALATE', 'PUBLIC_BOOST'], action: (characters: Character[]) => SBoostTopCharacter(characters, 8, '单人加拍确实留下了爆点，但偏心讨论也被推到了更高的位置。') },
  ];
}

function SCreateClass1Choices(): Choice[] {
  return [
    { text: '【守位高光】继续给本命单人段，巩固一班记忆点。', effectTags: ['FOCUS_ESCALATE'], action: (characters: Character[]) => SBoostTopCharacter(characters, 7, '高光段稳住了本命的存在感，但席位优势也开始带来额外压力。') },
    { text: '【群像补镜】把加拍留给追分成员，换取整组稳定。', effectTags: ['UNDERDOG_SPOTLIGHT', 'GROUP_BOOST'], action: (characters: Character[]) => SBoostLowestCharacter(characters, 9, '追分成员补上了镜头，组内竞争没有演变成只剩一个人的独角戏。') },
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
