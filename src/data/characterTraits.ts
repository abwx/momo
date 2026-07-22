import type { CharacterTrait, CharacterTraitKey } from './type/CharacterTrait';

export const CHARACTER_TRAITS: Record<CharacterTraitKey, CharacterTrait> = {
  STAGE_CORE: { key: 'STAGE_CORE', name: '舞台核心', desc: '聚焦录制收益更高' },
  VARIETY_SPARK: { key: 'VARIETY_SPARK', name: '综艺火花', desc: '抓马录制更容易出圈' },
  CP_MAGNET: { key: 'CP_MAGNET', name: '化学反应', desc: '双人企划羁绊成长更快' },
  PUBLIC_FAVOR: { key: 'PUBLIC_FAVOR', name: '路人缘', desc: '均衡录制更容易涨路人盘' },
  PR_SHIELD: { key: 'PR_SHIELD', name: '口碑缓冲', desc: '争议玩法带来的黑粉更低' },
  GROWTH_CURVE: { key: 'GROWTH_CURVE', name: '成长曲线', desc: '低位补镜头收益更高' },
};

export const CHARACTER_TRAIT_MAP: Record<string, CharacterTraitKey[]> = {
  'guan-junchen': ['GROWTH_CURVE', 'PUBLIC_FAVOR'],
  'zuo-qihan': ['PUBLIC_FAVOR', 'VARIETY_SPARK'],
  'zhang-hanrui': ['STAGE_CORE', 'GROWTH_CURVE'],
  'zhang-yiran': ['GROWTH_CURVE', 'CP_MAGNET'],
  'zhang-guiyuan': ['STAGE_CORE', 'PR_SHIELD'],
  'li-yudong': ['PUBLIC_FAVOR', 'CP_MAGNET'],
  'yang-bowen': ['STAGE_CORE', 'CP_MAGNET'],
  'yang-hanbo': ['PUBLIC_FAVOR', 'PR_SHIELD'],
  'wang-lujie': ['VARIETY_SPARK', 'PUBLIC_FAVOR'],
  'wang-shuoran': ['GROWTH_CURVE', 'VARIETY_SPARK'],
  'nie-weichen': ['GROWTH_CURVE', 'PR_SHIELD'],
  'chen-junming': ['GROWTH_CURVE', 'CP_MAGNET'],
  'chen-yiheng': ['VARIETY_SPARK', 'STAGE_CORE'],
  'chen-sihan': ['GROWTH_CURVE', 'PUBLIC_FAVOR'],
  'wei-zichen': ['GROWTH_CURVE', 'PR_SHIELD'],
};
