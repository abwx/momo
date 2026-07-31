import type { ProgramEpisode } from './type/ProgramEpisode';

export const groupShowProgram: ProgramEpisode[] = [
  {
    id: 'assessment',
    title: '第一期: 分组考核',
    summary: '首轮考核结束后重排班级，先争取一班席位。',
    eventIds: ['event-group-assessment-lineup', 'event-mission-role-swap', 'event-assessment-review', 'event-dorm-night-talk'],
    branchEventIds: ['event-branch-assessment-class1', 'event-branch-assessment-class2', 'event-branch-assessment-pressure'],
  },
  {
    id: 'morning',
    title: '第二期: 清晨任务',
    summary: '班级压力下完成限时任务，期末再次重排席位。',
    eventIds: ['event-wake-up-mission', 'event-breakfast-briefing', 'event-morning-mission-final'],
    branchEventIds: ['event-branch-morning-class1', 'event-branch-morning-class2', 'event-branch-morning-pressure'],
  },
  {
    id: 'duo-stage',
    title: '第三期: 双人舞台',
    summary: '搭档与资源都会影响考核分，争取留在一班。',
    eventIds: ['event-duo-stage-mutual-pick', 'event-song-priority', 'event-song-trade', 'event-duo-rehearsal-note'],
    branchEventIds: ['event-branch-duo-stage-class1', 'event-branch-duo-stage-class2', 'event-branch-duo-stage-pressure'],
  },
  {
    id: 'release',
    title: '第四期: 舞台释出',
    summary: '最终席位确认，决定本命能否以一班身份收官。',
    eventIds: ['event-rainy-day-plan', 'event-song-check', 'event-duo-stage-reveal', 'event-final-stage-release'],
    branchEventIds: ['event-branch-release-class1', 'event-branch-release-class2', 'event-branch-release-pressure'],
  },
];
