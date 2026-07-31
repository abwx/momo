import type { GameAchievement } from './type/GameAchievement';

export const GAME_ACHIEVEMENTS: GameAchievement[] = [
  {
    id: 'first-s-grade',
    title: '金牌开机',
    desc: '结算平均人气达到 90',
    isUnlocked: context => context.averagePopularity >= 90,
  },
  {
    id: 'goal-clean-run',
    title: '目标全清',
    desc: '单局完成 3 个本期 KPI',
    isUnlocked: context => context.completedGoalCount >= 3,
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
    desc: '结算经费还剩 40000',
    isUnlocked: context => context.budget >= 40000,
  },
  {
    id: 'story-weaver',
    title: '整季收官',
    desc: '完整录完 4 期团综',
    isUnlocked: context => context.completedEpisodeCount >= 4,
  },
];
