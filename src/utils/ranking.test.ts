import { describe, expect, it } from 'vitest';
import { moveListItem } from './ranking';

describe('moveListItem', () => {
  it('swaps neighboring items without mutating the source', () => {
    const list = ['A', 'B', 'C'];
    expect(moveListItem(list, 1, -1)).toEqual(['B', 'A', 'C']);
    expect(list).toEqual(['A', 'B', 'C']);
  });

  it('keeps the list unchanged when the target is outside the range', () => {
    const list = ['A', 'B', 'C'];
    expect(moveListItem(list, 0, -1)).toBe(list);
    expect(moveListItem(list, 2, 1)).toBe(list);
  });
});
