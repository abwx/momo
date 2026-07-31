import { describe, expect, it } from 'vitest';
import type { Character } from './characters';
import { SAssignChoiceTexts } from './events';
import { setRandomSource } from '../utils/random';

const characters: Character[] = [
  { id: 'a', name: '甲', image: '', personality: '成长势', popularity: 80, description: '' },
  { id: 'b', name: '乙', image: '', personality: '综艺感', popularity: 78, description: '' },
  { id: 'c', name: '丙', image: '', personality: '全能担当', popularity: 76, description: '' },
];

describe('SAssignChoiceTexts', () => {
  it('fills names and avoids duplicate templates in one batch', () => {
    setRandomSource(() => 0.1);
    const texts = SAssignChoiceTexts('CENTER', characters);
    expect(texts).toHaveLength(3);
    expect(texts.every(text => /甲|乙|丙/.test(text))).toBe(true);
    expect(new Set(texts).size).toBe(3);
    setRandomSource();
  });
});
