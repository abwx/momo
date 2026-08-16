import type { GameAchievement } from './type/GameAchievement';

export const GAME_ACHIEVEMENTS: GameAchievement[] = [
  {
    id: 'first-s-grade',
    title: '金牌收官',
    desc: '结算平均人气达到 90',
    isUnlocked: context => context.isSeasonComplete && context.averagePopularity >= 90,
  },
  {
    id: 'bond-director',
    title: '嗑点导演',
    desc: '任意一对嗑点达到 80',
    isUnlocked: context => context.topBondValue >= 80,
  },
  {
    id: 'live-savior',
    title: '临场救火王',
    desc: '单局 QTE 成功 3 次',
    isUnlocked: context => context.qteSuccessCount >= 3,
  },
  {
    id: 'budget-master',
    title: '铁算盘制作人',
    desc: '赛季结算经费还剩 40000',
    isUnlocked: context => context.isSeasonComplete && context.budget >= 40000,
  },
  {
    id: 'story-weaver',
    title: '整季收官',
    desc: '完整录完 4 期团综',
    isUnlocked: context => context.isSeasonComplete && context.completedEpisodeCount >= 4,
  },
];
