import type { Character } from '../../data/characters';
import type { GameEffectTag, GameEvent } from '../../data/events';
import type { SBondPair } from './type/SBondPair';
import type { SFanFactionState } from './type/SFanFactionState';
import type { SOperationCard } from './type/SOperationCard';
import { shuffleList } from '../../utils/random';

const FAN_MIN_VALUE = 0;
const FAN_MAX_VALUE = 100;
const BOND_MAX_VALUE = 100;

export const S_INITIAL_FAN_FACTIONS: SFanFactionState = {
  groupFans: 62,
  soloFans: 48,
  cpFans: 36,
  publicFans: 52,
  antiFans: 24,
};

export const S_OPERATION_CARD_POOL: SOperationCard[] = [
  {
    id: 'practice-cam',
    name: '练习室直拍',
    kind: 'BUFF',
    cost: 12000,
    desc: '全员人气小涨，路人盘更容易入坑。',
    apply: (characters, factions) => {
      characters.forEach(char => char.popularity += 4);
      factions.groupFans += 6;
      factions.publicFans += 5;
      return '练习室直拍释出，全员业务感被看见，团粉和路人盘同步升温。';
    },
  },
  {
    id: 'lawyer-letter',
    name: '律师函预警',
    kind: 'PR',
    cost: 18000,
    desc: '压制黑粉，但会轻微消耗路人好感。',
    apply: (_characters, factions) => {
      factions.antiFans -= 10;
      factions.publicFans -= 2;
      return '法务速度在线，黑粉声量被压下去，但路人对强硬公关略有观望。';
    },
  },
  {
    id: 'late-live',
    name: '深夜直播',
    kind: 'BALANCE',
    cost: 9000,
    desc: '提升团粉黏性，平衡全员人气。',
    apply: (characters, factions) => {
      characters.forEach(char => char.popularity += char.popularity < 78 ? 6 : 2);
      factions.groupFans += 8;
      factions.soloFans -= 2;
      return '深夜直播意外自然，低位成员被看见，团魂浓度上来了。';
    },
  },
  {
    id: 'cp-cut',
    name: '双人剪辑',
    kind: 'CP',
    cost: 10000,
    desc: '拉高 CP 讨论，也会带来轻微唯粉摩擦。',
    apply: (_characters, factions) => {
      factions.cpFans += 12;
      factions.soloFans += 3;
      factions.antiFans += 2;
      return '双人高光剪辑扩散，CP 粉原地过年，唯粉也开始暗暗较劲。';
    },
  },
];

export function SResetFanFactions(factions: SFanFactionState) {
  Object.assign(factions, S_INITIAL_FAN_FACTIONS);
}

export function SClampFanFactions(factions: SFanFactionState) {
  Object.keys(factions).forEach(key => {
    const stateKey = key as keyof SFanFactionState;
    factions[stateKey] = Math.max(FAN_MIN_VALUE, Math.min(FAN_MAX_VALUE, factions[stateKey]));
  });
}

export function SCreateCardHand() {
  return shuffleList(S_OPERATION_CARD_POOL).slice(0, 3);
}

export function SGetPairKey(char1: Character, char2: Character) {
  return [char1.id, char2.id].sort().join('__');
}

export function SUpdateBondMap(bondMap: Record<string, SBondPair>, pair: Character[]) {
  if (pair.length !== 2) return null;
  const key = SGetPairKey(pair[0], pair[1]);
  const currentValue = bondMap[key]?.value || 0;
  bondMap[key] = { key, names: `${pair[0].name} × ${pair[1].name}`, value: Math.min(BOND_MAX_VALUE, currentValue + 18) };
  return bondMap[key];
}

export function SApplyBondBonus(pair: Character[], bond: SBondPair | null) {
  if (!bond || bond.value < 36) return '';
  const bonus = bond.value >= 72 ? 8 : 4;
  pair.forEach(char => char.popularity += bonus);
  return `羁绊加成触发：${bond.names} 化学反应升温，双方人气额外 +${bonus}。`;
}

export function SApplyFactionReaction(
  factions: SFanFactionState,
  result: string,
  event: GameEvent | null,
  effectTags: GameEffectTag[] = []
) {
  if (!event) return;
  const tags = effectTags.length ? effectTags : SGetResultEffectTags(result);
  if (event.type === 'PICK_TWO') factions.cpFans += 5;
  if (event.type === 'RANKING') factions.soloFans += 4;
  if (tags.includes('GROUP_BOOST')) factions.groupFans += 7;
  if (tags.includes('ANTI_RISK')) factions.antiFans += 6;
  if (tags.includes('PUBLIC_BOOST')) factions.publicFans += 5;
  SClampFanFactions(factions);
}

export function SGetResultEffectTags(result: string): GameEffectTag[] {
  return [
    ...(SHasAnyText(result, ['全员', '团魂']) ? ['GROUP_BOOST' as const] : []),
    ...(SHasAnyText(result, ['翻车', '失败', '负面']) ? ['ANTI_RISK' as const] : []),
    ...(SHasAnyText(result, ['路人', '国民']) ? ['PUBLIC_BOOST' as const] : []),
  ];
}

function SHasAnyText(text: string, tokens: string[]) {
  return tokens.some(token => text.includes(token));
}

export function SGetTopBond(bondMap: Record<string, SBondPair>) {
  return Object.values(bondMap).sort((a, b) => b.value - a.value)[0] || null;
}

export function SGetFanFactionSummary(factions: SFanFactionState) {
  const entries = [
    ['团粉盘', factions.groupFans],
    ['唯粉盘', factions.soloFans],
    ['CP粉', factions.cpFans],
    ['路人盘', factions.publicFans],
    ['黑粉声量', factions.antiFans],
  ] as const;
  return [...entries].sort((a, b) => b[1] - a[1])[0][0];
}

export function SDownloadSharePoster(options: {
  title: string;
  grade: string;
  topCharacters: Character[];
  factions: SFanFactionState;
  topBond: SBondPair | null;
}) {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1440;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  SDrawPoster(ctx, options);
  const link = document.createElement('a');
  link.download = `momo-report-${Date.now()}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

function SDrawPoster(ctx: CanvasRenderingContext2D, options: {
  title: string;
  grade: string;
  topCharacters: Character[];
  factions: SFanFactionState;
  topBond: SBondPair | null;
}) {
  const gradient = ctx.createLinearGradient(0, 0, 1080, 1440);
  gradient.addColorStop(0, '#16113f');
  gradient.addColorStop(0.55, '#24183f');
  gradient.addColorStop(1, '#090b18');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1080, 1440);
  SDrawPosterText(ctx, options);
}

function SDrawPosterText(ctx: CanvasRenderingContext2D, options: {
  title: string;
  grade: string;
  topCharacters: Character[];
  factions: SFanFactionState;
  topBond: SBondPair | null;
}) {
  ctx.fillStyle = '#ffffff';
  ctx.font = '800 64px sans-serif';
  ctx.fillText('制作人战报', 88, 140);
  ctx.font = '900 92px sans-serif';
  ctx.fillText(options.title, 88, 250);
  ctx.fillStyle = '#ffcf66';
  ctx.fillText(`评级 ${options.grade}`, 88, 360);
  SDrawPosterRanking(ctx, options.topCharacters);
  SDrawPosterFactions(ctx, options.factions, options.topBond);
}

function SDrawPosterRanking(ctx: CanvasRenderingContext2D, topCharacters: Character[]) {
  ctx.fillStyle = '#cbd5e1';
  ctx.font = '700 36px sans-serif';
  ctx.fillText('最终 TOP 3', 88, 500);
  topCharacters.slice(0, 3).forEach((char, index) => {
    ctx.fillStyle = index === 0 ? '#ff9a9e' : '#ffffff';
    ctx.font = '800 54px sans-serif';
    ctx.fillText(`${index + 1}. ${char.name}`, 108, 590 + index * 92);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 30px sans-serif';
    ctx.fillText(`人气 ${char.popularity}`, 780, 590 + index * 92);
  });
}

function SDrawPosterFactions(ctx: CanvasRenderingContext2D, factions: SFanFactionState, topBond: SBondPair | null) {
  ctx.fillStyle = '#cbd5e1';
  ctx.font = '700 36px sans-serif';
  ctx.fillText('粉丝生态', 88, 920);
  ctx.font = '700 34px sans-serif';
  ctx.fillText(`团粉 ${factions.groupFans} / 唯粉 ${factions.soloFans} / CP ${factions.cpFans}`, 108, 1000);
  ctx.fillText(`路人 ${factions.publicFans} / 黑粉声量 ${factions.antiFans}`, 108, 1060);
  ctx.fillStyle = '#ffffff';
  ctx.font = '800 42px sans-serif';
  ctx.fillText(`最强羁绊：${topBond?.names || '尚未形成'}`, 108, 1170);
  ctx.fillStyle = '#64748b';
  ctx.font = '600 28px sans-serif';
  ctx.fillText('MOMO 录制模拟器 / 数据仅供娱乐', 88, 1320);
}
