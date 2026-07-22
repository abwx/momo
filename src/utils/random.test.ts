import { describe, expect, it, vi } from 'vitest';
import { shuffleList } from './random';

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
});
