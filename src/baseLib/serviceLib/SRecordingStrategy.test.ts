import { describe, expect, it } from 'vitest';
import type { Character } from '../../data/characters';
import { SCreateRecordingPlan } from './SRecordingStrategy';

const characters: Character[] = [
  { id: 'guan-junchen', name: '成长成员', personality: '成长势', image: '', popularity: 60, description: '' },
  { id: 'chen-yiheng', name: '焦点成员', personality: '综艺感', image: '', popularity: 90, description: '' },
];

describe('SCreateRecordingPlan', () => {
  it('makes balance recording support lower-ranked members', () => {
    const plan = SCreateRecordingPlan({ characters, averagePopularity: 75, focusCharacter: characters[0], intensity: 2, mode: 'BALANCE' });

    expect(plan.effect.popularity).toEqual({ 'guan-junchen': 2 });
    expect(plan.resourceCost).toEqual({ camera: 1, edit: 1 });
    expect(plan.successModifier).toBeCloseTo(0.04);
  });

  it('caps the drama success modifier and highlights its focus member', () => {
    const plan = SCreateRecordingPlan({ characters, averagePopularity: 75, focusCharacter: characters[1], intensity: 99, mode: 'DRAMA' });

    expect(plan.highlightedCharacterId).toBe('chen-yiheng');
    expect(plan.resourceCost).toEqual({ camera: 1, edit: 2 });
    expect(plan.successModifier).toBe(0.18);
  });
});
