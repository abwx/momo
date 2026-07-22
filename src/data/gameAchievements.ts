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
    desc: '单局完成 3 个制作目标',
    isUnlocked: context => context.completedGoalCount >= 3,
  },
  {
    id: 'bond-director',
    title: '双人叙事导演',
    desc: '任意羁绊值达到 80',
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
    desc: '结算预算保留 40000',
    isUnlocked: context => context.budget >= 40000,
  },
  {
    id: 'full-pipeline',
    title: '全链路闭环',
    desc: '四个工作台都至少执行一次',
    isUnlocked: context => context.completedWorkspaces >= 4,
  },
  {
    id: 'story-weaver',
    title: '连锁叙事',
    desc: '单局触发 2 个后续事件',
    isUnlocked: context => context.followUpEventCount >= 2,
  },
];
