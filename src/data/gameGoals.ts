import type { GameGoal } from './type/GameGoal';

function formatScore(value: number) {
  return Math.round(value).toString();
}

function formatCurrency(value: number) {
  return `¥${Math.max(0, Math.round(value)).toLocaleString()}`;
}

export const GAME_GOALS: GameGoal[] = [
  {
    id: 'avg-popularity-86',
    title: '全民热度',
    desc: '全员平均人气达到 86',
    target: 86,
    getValue: context => context.averagePopularity,
    formatValue: formatScore,
  },
  {
    id: 'top-bond-70',
    title: '双人叙事',
    desc: '任意羁绊值达到 70',
    target: 70,
    getValue: context => context.topBondValue,
    formatValue: formatScore,
  },
  {
    id: 'budget-saver-30000',
    title: '预算纪律',
    desc: '结算时预算保留 30000',
    target: 30000,
    getValue: context => context.budget,
    formatValue: formatCurrency,
  },
  {
    id: 'anti-control-80',
    title: '舆情控场',
    desc: '把黑粉声量压到 20 以下',
    target: 80,
    getValue: context => 100 - context.antiFans,
    formatValue: value => `${Math.max(0, 100 - Math.round(value))} 黑粉`,
  },
  {
    id: 'workspace-loop-4',
    title: '全链路制作',
    desc: '四个工作台都至少执行一次',
    target: 4,
    getValue: context => context.completedWorkspaces,
    formatValue: value => `${Math.round(value)} / 4`,
  },
  {
    id: 'low-rank-growth-18',
    title: '逆袭镜头',
    desc: '任意成员较开局涨粉 18',
    target: 18,
    getValue: context => context.lowRankGrowth,
    formatValue: formatScore,
  },
];
