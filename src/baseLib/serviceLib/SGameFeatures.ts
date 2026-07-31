import type { Character } from '../../data/characters';
import type { SBondPair } from './type/SBondPair';
import type { SFanFactionState } from './type/SFanFactionState';
import type { SProgramBonus } from './type/SProgramBonus';

const FAN_MIN_VALUE = 0;
const FAN_MAX_VALUE = 100;

export const S_INITIAL_FAN_FACTIONS: SFanFactionState = {
  groupFans: 62,
  soloFans: 48,
  cpFans: 36,
  publicFans: 52,
  antiFans: 24,
};

const S_PROGRAM_BONUSES: SProgramBonus[] = [
  {
    id: 'practice-cam',
    name: '练习室直拍',
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
    apply: (_characters, factions) => {
      factions.antiFans -= 10;
      factions.publicFans -= 2;
      return '法务速度在线，黑粉声量被压下去，但路人对强硬公关略有观望。';
    },
  },
  {
    id: 'late-live',
    name: '深夜直播',
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

export function SGetProgramBonus(eventIndex: number, random: () => number): SProgramBonus | null {
  if ((eventIndex + 1) % 4 !== 0) return null;
  return S_PROGRAM_BONUSES[Math.floor(random() * S_PROGRAM_BONUSES.length)] ?? null;
}

export function SGetPairKey(char1: Character, char2: Character) {
  return [char1.id, char2.id].sort().join('__');
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
