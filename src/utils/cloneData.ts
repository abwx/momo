/**
 * Clones plain persisted data while preserving TypeScript shape at call sites.
 */
export function cloneData<T>(data: T): T {
  return JSON.parse(JSON.stringify(data)) as T;
}
