import type { Archetype } from "@/data/archetypes";
import { fillStoryTemplate, type StoryCtx } from "@/lib/storyTemplate";
import type { Scene } from "@/types/game";

type AmbientEventTone = "rose" | "gold" | "sky" | "mint";

export type AmbientEvent = {
  tag: string;
  title: string;
  detail: string;
  icon: string;
  tone: AmbientEventTone;
  isSurprise?: boolean;
  actionLabel?: string;
  actionDelta?: Partial<Scores>;
};

type AmbientTemplate = AmbientEvent & {
  kinds?: Scene["kind"][];
  chapters?: number[];
  archetypes?: Archetype[];
  chance?: number; // 0-1, default 1
};

const AMBIENT_TEMPLATES: AmbientTemplate[] = [
  {
    tag: "突发意外",
    title: "班主任正在路过！",
    detail: "快把手机藏进抽屉里！(点击此处立即掩护)",
    icon: "⚠",
    tone: "rose",
    isSurprise: true,
    actionLabel: "已藏好",
    actionDelta: { grow: 1 },
    kinds: ["vn", "binary", "pick_two"],
  },
  {
    tag: "心动奖励",
    title: "你发现了一张旧合照",
    detail: "那是你们第一次去练习室留下的。(点击收藏回忆)",
    icon: "♥",
    tone: "rose",
    isSurprise: true,
    actionLabel: "收藏成功",
    actionDelta: { devote: 2 },
    chapters: [1, 2, 3],
  },
  {
    tag: "意外干扰",
    title: "手机电量红了！",
    detail: "快回完这一句，不然就关机了！(点击立刻插上充电宝)",
    icon: "⚡",
    tone: "rose",
    isSurprise: true,
    actionLabel: "充电中",
    actionDelta: { possess: 1, grow: 1 },
    kinds: ["phone"],
  },
  {
    tag: "紧急情况",
    title: "选角导演过来了！",
    detail: "快把刚才的表情收一收！(点击立即调整状态)",
    icon: "👤",
    tone: "gold",
    isSurprise: true,
    actionLabel: "状态满分",
    actionDelta: { grow: 2 },
    chapters: [4, 5, 6],
    kinds: ["vn"],
  },
  {
    tag: "练习生日常",
    title: "被粉丝偶遇了！",
    detail: "快松开拉着的手！(点击立即放手)",
    icon: "📸",
    tone: "mint",
    isSurprise: true,
    actionLabel: "掩护成功",
    actionDelta: { boundary: 2 },
    chapters: [6, 7, 8],
  },
  {
    tag: "突发灵感",
    title: "你突然想到了一个绝佳的梗",
    detail: "把它发给{{对方}}肯定能让他笑场。(点击记录灵感)",
    icon: "💡",
    tone: "gold",
    isSurprise: true,
    actionLabel: "已记录",
    actionDelta: { grow: 1, devote: 1 },
    kinds: ["vn", "phone"],
  },
  {
    tag: "环境干扰",
    title: "信号突然变弱了",
    detail: "消息发不出去，快晃晃手机！(点击重试)",
    icon: "📶",
    tone: "sky",
    isSurprise: true,
    actionLabel: "已重连",
    actionDelta: { possess: 1 },
    kinds: ["phone"],
  },
  {
    tag: "突发心跳",
    title: "他的指尖碰到了你的手",
    detail: "空气突然安静得可怕。(点击深呼吸保持冷静)",
    icon: "💓",
    tone: "rose",
    isSurprise: true,
    actionLabel: "冷静成功",
    actionDelta: { boundary: 1, grow: 1 },
    kinds: ["vn"],
  },
  {
    tag: "突发事件",
    title: "班级群突然安静了三秒",
    detail: "有人把你和{{对方}}并肩的背影发进了群，又在下一秒撤回。",
    icon: "✦",
    tone: "rose",
    kinds: ["vn", "binary", "pick_two"],
  },
  {
    tag: "课间风声",
    title: "后排传来一声压低的起哄",
    detail: "你假装没听见，可余光还是先去找了{{对方}}的反应。",
    icon: "♫",
    tone: "gold",
    kinds: ["vn", "interlude"],
  },
  {
    tag: "校园广播",
    title: "广播站刚好切到旧歌",
    detail: "旋律一响，你和{{对方}}都慢了半拍，像被同一段回忆叫住。",
    icon: "◌",
    tone: "sky",
    chapters: [1, 2],
  },
  {
    tag: "消息插曲",
    title: "屏幕亮了一下又暗回去",
    detail: "{{对方}}删掉了一行字，最后只留下更克制的一句。",
    icon: "✉",
    tone: "mint",
    kinds: ["phone"],
  },
  {
    tag: "走廊意外",
    title: "值日生刚从拐角经过",
    detail: "你们同时往旁边让开半步，结果距离反而比刚才更近。",
    icon: "➹",
    tone: "rose",
    kinds: ["vn", "hold", "slider"],
  },
  {
    tag: "练习室波动",
    title: "灯光忽然闪了一下",
    detail: "黑下去的那半秒里，{{对方}}下意识先偏头确认你在不在。",
    icon: "✧",
    tone: "sky",
    chapters: [3, 4],
  },
  {
    tag: "心跳误差",
    title: "你差点把名字听成自己的",
    detail: "老师在点人时语气太像{{对方}}刚刚喊你的那一下。",
    icon: "♡",
    tone: "gold",
    kinds: ["vn", "binary", "exclusive"],
  },
  {
    tag: "慢半拍",
    title: "{{对方}}把纸角压得很平",
    detail: "明明只是顺手递来一张纸，你却看出了点没说破的认真。",
    icon: "✿",
    tone: "mint",
    archetypes: ["quiet", "soft"],
  },
  {
    tag: "反差瞬间",
    title: "{{对方}}嘴上说着路过",
    detail: "可脚步却刚好和你并在一条线，像故意练过很多次。",
    icon: "✦",
    tone: "rose",
    archetypes: ["sharp", "sunny"],
  },
  {
    tag: "围观席",
    title: "前排同学回头看了你们一眼",
    detail: "那一眼没带恶意，却让空气突然多了点说不清的暧昧。",
    icon: "◍",
    tone: "gold",
    kinds: ["vn", "phone", "pick_two"],
  },
  {
    tag: "夜色插播",
    title: "窗外风声突然变大",
    detail: "{{对方}}的下一句话因此停了停，像在给勇气找一个更好的落点。",
    icon: "☾",
    tone: "sky",
    chapters: [4],
  },
  {
    tag: "甜度偏移",
    title: "你忽然意识到一件小事",
    detail: "{{对方}}最近喊你“{{称呼}}”的语气，已经和以前不太一样了。",
    icon: "♡",
    tone: "rose",
    kinds: ["vn", "phone", "exclusive"],
  },
];

function hashString(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function resolveAmbientEvent(scene: Scene, ctx: StoryCtx & { archetype: Archetype; runSeed: number }): AmbientEvent {
  const filtered = AMBIENT_TEMPLATES.filter((template) => {
    if (template.kinds && !template.kinds.includes(scene.kind)) return false;
    if (template.chapters && !template.chapters.includes(scene.chapter)) return false;
    if (template.archetypes && !template.archetypes.includes(ctx.archetype)) return false;
    return true;
  });

  const pool = filtered.length ? filtered : AMBIENT_TEMPLATES;
  const index = hashString(`${scene.id}:${scene.chapter}:${ctx.archetype}:${ctx.runSeed}`) % pool.length;
  const picked = pool[index];

  return {
    ...picked,
    detail: fillStoryTemplate(picked.detail, ctx),
  };
}
