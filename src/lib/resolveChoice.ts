import type { Archetype } from "@/data/archetypes";
import type { Choice, Scores } from "@/types/game";

export function resolveChoiceRoute(
  c: Choice,
  arch: Archetype,
  portraitFile?: string,
): { next: string; delta?: Partial<Scores> } {
  let next = c.next ?? "";
  if (portraitFile && c.nextByPortraitFile?.[portraitFile]) {
    next = c.nextByPortraitFile[portraitFile]!;
  } else if (c.nextByArchetype?.[arch]) {
    next = c.nextByArchetype[arch]!;
  }
  const base = c.delta ?? {};
  const extra = c.deltaByArchetype?.[arch] ?? {};
  const keys = new Set([...(Object.keys(base) as (keyof Scores)[]), ...(Object.keys(extra) as (keyof Scores)[])]);
  const delta: Partial<Scores> = {};
  keys.forEach((k) => {
    const v = (base[k] ?? 0) + (extra[k] ?? 0);
    if (v !== 0) delta[k] = v;
  });
  return { next, delta: Object.keys(delta).length ? delta : undefined };
}
