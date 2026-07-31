import { describe, expect, it, vi } from 'vitest';
import { getRandomValue, shuffleList, withRandomModifier } from './random';

describe('shuffleList', () => {
  it('keeps the source list unchanged', () => {
    const items = ['a', 'b', 'c'];

    shuffleList(items);

    expect(items).toEqual(['a', 'b', 'c']);
  });

  it('uses Fisher-Yates swaps', () => {
    vi.spyOn(Math, 'random').mockReturnValueOnce(0).mockReturnValueOnce(0);

    expect(shuffleList(['a', 'b', 'c'])).toEqual(['b', 'c', 'a']);

    vi.restoreAllMocks();
  });

  it('applies a temporary outcome modifier without changing the source roll', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);

    expect(withRandomModifier(0.12, getRandomValue)).toBeCloseTo(0.38);
    expect(getRandomValue()).toBeCloseTo(0.5);

    vi.restoreAllMocks();
  });
});
