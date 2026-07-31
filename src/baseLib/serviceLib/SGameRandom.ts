export interface SGameRandomState {
  seed: number;
  cursor: number;
}

/** Creates the persisted random state for one season. */
export function SCreateGameRandomState(seed = Date.now()): SGameRandomState {
  return { seed: Math.abs(Math.floor(seed)) || 1, cursor: 0 };
}

/** Returns the next reproducible value in the range [0, 1). */
export function SNextRandom(state: SGameRandomState): number {
  const value = SHash(state.seed + state.cursor * 0x6d2b79f5);
  state.cursor += 1;
  return value;
}

function SHash(value: number): number {
  let hash = value | 0;
  hash = Math.imul(hash ^ (hash >>> 16), 0x45d9f3b);
  hash = Math.imul(hash ^ (hash >>> 16), 0x45d9f3b);
  return ((hash ^ (hash >>> 16)) >>> 0) / 4294967296;
}
