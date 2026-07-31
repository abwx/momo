import { describe, expect, it } from 'vitest';
import { SCreateGameRandomState, SNextRandom } from './SGameRandom';

describe('SGameRandom', () => {
  it('replays the same random sequence from the same seed', () => {
    const first = SCreateGameRandomState(42);
    const second = SCreateGameRandomState(42);

    expect([SNextRandom(first), SNextRandom(first), SNextRandom(first)]).toEqual([
      SNextRandom(second),
      SNextRandom(second),
      SNextRandom(second),
    ]);
  });
});
