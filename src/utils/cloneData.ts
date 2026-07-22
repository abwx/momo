/**
 * Clones plain persisted data while preserving TypeScript shape at call sites.
 */
export function cloneData<T>(data: T): T {
  if (typeof structuredClone === 'function') return structuredClone(data);
  return JSON.parse(JSON.stringify(data)) as T;
}
