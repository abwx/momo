/**
 * 人物图在 `public/images/`。浏览器路径 `/images/xxx.png`。
 * 默认文件名仅作开局占位，实际以选角页选择为准。
 */
export const DEFAULT_PORTRAIT_FILE = "陈奕恒.png";

export function portraitUrl(file: string): string {
  const safe = file.replace(/[/\\]/g, "").trim() || DEFAULT_PORTRAIT_FILE;
  return `/images/${safe}`;
}

/** `public/images` 内现有的人物图（与资源目录同步） */
export const PORTRAIT_FILES = [
  "官俊臣.png",
  "左奇函.png",
  "张函瑞.png",
  "张奕然.png",
  "张桂源.png",
  "李煜东.png",
  "杨博文.png",
  "杨涵博.png",
  "王橹杰.png",
  "王烁然.png",
  "聂玮辰.png",
  "陈俊铭.png",
  "陈奕恒.png",
  "陈思罕.png",
  "魏子宸.png",
] as const;

const NO_VN_PORTRAIT_SCENES = new Set(["splash", "casting"]);

export function shouldShowPartnerPortraitInVn(sceneId: string): boolean {
  return !NO_VN_PORTRAIT_SCENES.has(sceneId);
}
