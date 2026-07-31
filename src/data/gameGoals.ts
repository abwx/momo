import type { GameGoal } from './type/GameGoal';

function formatScore(value: number) {
  return Math.round(value).toString();
}

function formatCurrency(value: number) {
  return `¥${Math.max(0, Math.round(value)).toLocaleString()}`;
}

function formatCount(value: number, total: number) {
  return `${Math.round(value)} / ${total}`;
}

/** 本期 KPI 题库：开局随机抽几条，和大厅「档案」成就不是一套。 */
export const GAME_GOALS: GameGoal[] = [
  {
    id: 'avg-popularity-86',
    title: '全员热度',
    desc: '全员平均热度冲到 86',
    target: 86,
    reward: { budget: 8000, label: '加戏经费' },
    getValue: context => context.averagePopularity,
    formatValue: formatScore,
  },
  {
    id: 'top-bond-70',
    title: '嗑点拉满',
    desc: '任意一对嗑点涨到 70',
    target: 70,
    reward: { budget: 6000, label: '开嗑经费' },
    getValue: context => context.topBondValue,
    formatValue: formatScore,
  },
  {
    id: 'budget-saver-30000',
    title: '经费守门',
    desc: '季终手头还剩 ¥30,000',
    target: 30000,
    isEndOnly: true,
    getValue: context => context.budget,
    formatValue: formatCurrency,
  },
  {
    id: 'anti-control-80',
    title: '反黑稳住',
    desc: '把黑粉压到 20 以下',
    target: 80,
    reward: { budget: 6000, label: '反黑经费' },
    getValue: context => 100 - context.antiFans,
    formatValue: value => `黑粉 ${Math.max(0, 100 - Math.round(value))}`,
  },
  {
    id: 'low-rank-growth-18',
    title: '糊糊起飞',
    desc: '有人比开局多涨 18 热度',
    target: 18,
    reward: { budget: 5000, label: '推糊经费' },
    getValue: context => context.lowRankGrowth,
    formatValue: formatScore,
  },
  {
    id: 'cp-fans-52',
    title: 'CP 盘升温',
    desc: 'CP 粉盘涨到 52',
    target: 52,
    reward: { budget: 5500, label: '糖点经费' },
    getValue: context => context.cpFans,
    formatValue: formatScore,
  },
  {
    id: 'solo-fans-55',
    title: '唯粉站台',
    desc: '唯粉盘抬到 55',
    target: 55,
    reward: { budget: 5500, label: '直拍经费' },
    getValue: context => context.soloFans,
    formatValue: formatScore,
  },
  {
    id: 'group-fans-72',
    title: '团魂在线',
    desc: '团粉盘稳住到 72',
    target: 72,
    reward: { budget: 5500, label: '团建经费' },
    getValue: context => context.groupFans,
    formatValue: formatScore,
  },
  {
    id: 'public-fans-60',
    title: '路人安利',
    desc: '路人盘扩到 60',
    target: 60,
    reward: { budget: 5000, label: '安利经费' },
    getValue: context => context.publicFans,
    formatValue: formatScore,
  },
  {
    id: 'top-char-92',
    title: '头部出圈',
    desc: '第一热度冲到 92',
    target: 92,
    reward: { budget: 6500, label: '出圈经费' },
    getValue: context => context.topPopularity,
    formatValue: formatScore,
  },
  {
    id: 'cp-heat-8',
    title: '营业余温',
    desc: '营业热度拉到 8',
    target: 8,
    reward: { budget: 4500, label: '营业经费' },
    getValue: context => context.cpHeat,
    formatValue: formatScore,
  },
  {
    id: 'qte-save-2',
    title: '临场救场',
    desc: 'QTE 救场成功 2 次',
    target: 2,
    reward: { budget: 4500, label: '救场经费' },
    getValue: context => context.qteSuccessCount,
    formatValue: value => formatCount(value, 2),
  },
  {
    id: 'bond-ops-2',
    title: '开嗑两次',
    desc: '开嗑营业至少做 2 次',
    target: 2,
    reward: { budget: 5000, label: '双人经费' },
    getValue: context => context.bondProjectCount,
    formatValue: value => formatCount(value, 2),
  },
  {
    id: 'fan-ops-3',
    title: '控评三连',
    desc: '控评投放至少 3 次',
    target: 3,
    reward: { budget: 5000, label: '控评经费' },
    getValue: context => context.fanProgramCount,
    formatValue: value => formatCount(value, 3),
  },
  {
    id: 'focus-cut-2',
    title: '本命高光',
    desc: '高光剪法至少用 2 次',
    target: 2,
    reward: { budget: 5000, label: '高光经费' },
    getValue: context => context.focusRecordingCount,
    formatValue: value => formatCount(value, 2),
  },
];
