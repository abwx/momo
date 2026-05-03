import type { Archetype } from "@/data/archetypes";
import type { Scene, SceneBinary, ScenePhone, SceneVN } from "@/types/game";
import { mergeNarratorLines } from "@/lib/mergeNarratorLines";
import { PHONE_ARCHETYPE_PATCH, VN_ARCHETYPE_PATCH } from "@/data/sceneArchetypePatch";
import {
  applyPortraitToBinary,
  applyPortraitToPhone,
  applyPortraitToVn,
} from "@/data/portraitSceneVariants";

export function resolveScene(scene: Scene, arch: Archetype, portraitFile: string): Scene {
  if (scene.kind === "vn") {
    let s: SceneVN = { ...(scene as SceneVN) };
    const a = VN_ARCHETYPE_PATCH[s.id]?.[arch];
    if (a) {
      s = { ...s, lines: a.lines ?? s.lines, choices: a.choices ?? s.choices, skin: a.skin ?? s.skin };
    }
    s = applyPortraitToVn(s, portraitFile);
    return { ...s, lines: mergeNarratorLines(s.lines) };
  }
  if (scene.kind === "phone") {
    let s: ScenePhone = { ...(scene as ScenePhone) };
    const p = PHONE_ARCHETYPE_PATCH[s.id]?.[arch];
    if (p) {
      s = { ...s, messages: p.messages ?? s.messages, choices: p.choices ?? s.choices };
    }
    s = applyPortraitToPhone(s, portraitFile);
    return s;
  }
  if (scene.kind === "binary") {
    const s = applyPortraitToBinary(scene as SceneBinary, portraitFile);
    return s;
  }
  return scene;
}
