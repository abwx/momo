/** 选角立绘对应的「相处气质」——影响题干、选项与少数分支 */
export type Archetype = "sunny" | "quiet" | "sharp" | "soft";

export const ARCHETYPE_LABEL: Record<Archetype, string> = {
  sunny: "外向小太阳",
  quiet: "慢热细腻",
  sharp: "嘴硬心软",
  soft: "温柔黏人",
};

/** 每张可选立绘对应一种气质（虚构归类，与真人无关） */
export const PORTRAIT_TO_ARCHETYPE: Record<string, Archetype> = {
  "陈奕恒.png": "sunny",
  "官俊臣.png": "sunny",
  "杨博文.png": "sunny",
  "张桂源.png": "sunny",
  "左奇函.png": "quiet",
  "张函瑞.png": "quiet",
  "杨涵博.png": "quiet",
  "陈思罕.png": "quiet",
  "王烁然.png": "sharp",
  "魏子宸.png": "sharp",
  "聂玮辰.png": "sharp",
  "张奕然.png": "soft",
  "李煜东.png": "soft",
  "王橹杰.png": "soft",
  "陈俊铭.png": "soft",
};

export function archetypeForPortrait(file: string): Archetype {
  return PORTRAIT_TO_ARCHETYPE[file] ?? "sunny";
}
