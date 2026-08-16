import { describe, expect, it } from 'vitest';
import type { Character } from '../../data/characters';
import { SCreateProgramPlan, SCreateProgramPlanChoice, SGetProgramPlanAvailability, SGetProgramPlanOptions, SRecordProgramPlanPart } from './SProgramPlan';

const characters: Character[] = [
  { id: 'top', name: 'Top', image: '', personality: '综艺感', popularity: 90, description: '' },
  { id: 'low', name: 'Low', image: '', personality: '成长势', popularity: 50, description: '' },
];

describe('SProgramPlan', () => {
  it('prioritizes crisis recovery when black-word pressure is high', () => {
    expect(SGetProgramPlanOptions(36, 0, 0).map(option => option.key)).toEqual(['CRISIS', 'ENSEMBLE']);
  });

  it('pays out only after a three-part plan reaches two matches', () => {
    const plan = SCreateProgramPlan('UNDERDOG', characters, 3);

    expect(SRecordProgramPlanPart(plan, ['UNDERDOG_SPOTLIGHT'])).toBeNull();
    expect(SRecordProgramPlanPart(plan, [])).toBeNull();
    expect(SRecordProgramPlanPart(plan, ['UNDERDOG_SPOTLIGHT'])).toMatchObject({ budgetDelta: 9000 });
  });

  it('uses a different production objective for each plan part', () => {
    const plan = SCreateProgramPlan('UNDERDOG', characters, 3);

    expect(SCreateProgramPlanChoice(plan, characters).text).toContain('完整自我介绍');
    SRecordProgramPlanPart(plan, ['UNDERDOG_SPOTLIGHT']);
    expect(SCreateProgramPlanChoice(plan, characters).text).toContain('重新练习');
  });

  it('keeps a focus plan on the selected bias instead of the hottest member', () => {
    const plan = SCreateProgramPlan('FOCUS', characters, 3, ['low']);

    expect(plan.candidateIds).toEqual(['low']);
    expect(SCreateProgramPlanChoice(plan, characters).text).toContain('Low');
  });

  it('shares one budget availability result across plan entry points', () => {
    expect(SGetProgramPlanAvailability(3200, 4000)).toEqual({ isAffordable: false, budgetGap: 800 });
    expect(SGetProgramPlanAvailability(4000, 4000)).toEqual({ isAffordable: true, budgetGap: 0 });
  });
});
