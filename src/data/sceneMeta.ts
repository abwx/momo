import { SCENES } from "@/data/scenes";

export const SCENE_MAX_CHAPTER = Math.max(...Object.values(SCENES).map((s) => s.chapter));
