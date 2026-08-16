import type { ProgramEpisode } from './type/ProgramEpisode';

export const groupShowProgram: ProgramEpisode[] = [
  {
    id: 'assessment',
    title: '第一期: 席位定标',
    summary: '首期试录后首次排班，先把本命送进一班。',
    eventIds: [
      'event-group-assessment-lineup',
      'event-mission-role-swap',
      'event-assessment-review',
      'event-dorm-night-talk',
    ],
    branchEventIds: [
      'event-branch-assessment-class1',
      'event-branch-assessment-class2',
      'event-branch-assessment-pressure',
    ],
  },
  {
    id: 'morning',
    title: '第二期: 限时通关',
    summary: '24 小时通关加压，曲目互换决定谁先适配上台。',
    eventIds: [
      'event-wake-up-mission',
      'event-breakfast-briefing',
      'event-morning-mission-final',
      'event-song-trade',
    ],
    branchEventIds: [
      'event-branch-morning-class1',
      'event-branch-morning-class2',
      'event-branch-morning-pressure',
    ],
  },
  {
    id: 'duo-stage',
    title: '第三期: 双人破局',
    summary: '互选搭档、合练到预告，再用舞台样片争席位。',
    eventIds: [
      'event-duo-stage-mutual-pick',
      'event-duo-rehearsal-note',
      'event-duo-stage-reveal',
      'event-song-priority',
    ],
    branchEventIds: [
      'event-branch-duo-stage-class1',
      'event-branch-duo-stage-class2',
      'event-branch-duo-stage-pressure',
    ],
  },
  {
    id: 'release',
    title: '第四期: 舞台释出',
    summary: '释出前加练与彩排公开，收官镜决定本命能否破局。',
    eventIds: [
      'event-rainy-day-plan',
      'event-song-check',
      'event-final-stage-release',
    ],
    branchEventIds: [
      'event-branch-release-class1',
      'event-branch-release-class2',
      'event-branch-release-pressure',
    ],
  },
];
