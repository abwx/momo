import type { Scores } from "@/types/game";

const KEYS: (keyof Scores)[] = ["possess", "devote", "grow", "boundary"];

export function mergeScoreDelta(a: Partial<Scores>, b: Partial<Scores>): Partial<Scores> {
  const out: Partial<Scores> = {};
  for (const k of KEYS) {
    const s = (a[k] ?? 0) + (b[k] ?? 0);
    if (s !== 0) out[k] = s;
  }
  return out;
}
