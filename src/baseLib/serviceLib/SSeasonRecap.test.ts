import { describe, expect, it } from 'vitest';
import type { GameEvent } from '../../data/type/GameEvent';
import { SCreateSeasonRecap } from './SSeasonRecap';
import { SCreateSeasonState } from './SSeasonState';

const event: GameEvent = { id: 'followup-drama-final', type: 'CHOICE', title: '抓马线收官', description: '', choices: [] };

describe('SSeasonRecap', () => {
  it('turns tagged decisions into a readable season route', () => {
    const seasonState = SCreateSeasonState();
    seasonState.anticipation = 70;
    seasonState.dramaDebt = 14;
    const recap = SCreateSeasonRecap({
      seasonState, fanFactions: { groupFans: 60, soloFans: 50, cpFans: 50, publicFans: 70, antiFans: 20 },
      narrativeOutcomes: [{ title: '争议回收', detail: '悬念被剪回了节目叙事。' }],
      eventHistory: [{ event, result: '高燃收官让讨论延续。', effectTags: ['DRAMA_ESCALATE'] }],
    });

    expect(recap.route.title).toBe('抓马悬念线');
    expect(recap.choice.title).toBe('抓马线收官');
    expect(recap.gain.title).toBe('争议回收');
  });

  it('surfaces the largest unresolved cost instead of hiding it behind the grade', () => {
    const seasonState = SCreateSeasonState();
    seasonState.biasPressure = 18;
    const recap = SCreateSeasonRecap({
      seasonState, fanFactions: { groupFans: 60, soloFans: 50, cpFans: 50, publicFans: 70, antiFans: 52 },
      narrativeOutcomes: [], eventHistory: [],
    });

    expect(recap.cost.title).toBe('舆情压力');
  });
});
