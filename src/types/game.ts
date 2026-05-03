import type { Archetype } from "@/data/archetypes";

/** 亲密关系倾向维度（非临床，仅供娱乐自察） */
export type AxisKey = "possess" | "devote" | "grow" | "boundary";
export type Scores = Record<AxisKey, number>;

export const INITIAL_SCORES: Scores = {
  possess: 0,
  devote: 0,
  grow: 0,
  boundary: 0,
};

export type Choice = {
  id: string;
  label: string;
  /** 下一节点；缺省则线性 next */
  next?: string;
  /** 同一选项、不同「对方气质」可走不同分支 */
  nextByArchetype?: Partial<Record<Archetype, string>>;
  /** 同一选项、不同选角立绘可走不同分支（值为场景 id） */
  nextByPortraitFile?: Partial<Record<string, string>>;
  delta?: Partial<Scores>;
  /** 在基础 delta 上按气质叠加（可负） */
  deltaByArchetype?: Partial<Record<Archetype, Partial<Scores>>>;
};
export type SceneBase = {
  id: string;
  chapter: number;
  title: string;
};

export type VnSpeaker = "player" | "narrator" | "partner";

export type SceneVN = SceneBase & {
  kind: "vn";
  lines: { speaker: VnSpeaker; text: string }[];
  /** 无选项时自动去的下一节点 */
  next?: string;
  choices?: Choice[];
  /** 日记纸等特殊版式 */
  skin?: "default" | "journal";
};
export type ChatBubble = { from: "partner" | "player"; text: string; delayMs?: number };

export type ScenePhone = SceneBase & {
  kind: "phone";
  messages: ChatBubble[];
  choices: Choice[];
};

export type SceneInterlude = SceneBase & {
  kind: "interlude";
  subtitle: string;
  next: string;
};

export type SceneResult = SceneBase & {
  kind: "result";
};

/** 选角、起名（单独组件渲染） */
export type SceneCasting = SceneBase & {
  kind: "casting";
};

/** 二选一卡片（非微信） */
export type SceneBinary = SceneBase & {
  kind: "binary";
  prompt: string;
  left: Choice;
  right: Choice;
};

/** 选角后的「专属小题」三连（组件内分步，不经由图结构展开） */
export type SceneExclusive = SceneBase & {
  kind: "exclusive";
  continueTo: string;
};

/** 滑条：松手时按档位叠加分数 */
export type SliderTier = { until: number; delta: Partial<Scores> };

export type SceneSlider = SceneBase & {
  kind: "slider";
  prompt: string;
  minLabel: string;
  maxLabel: string;
  next: string;
  /** 按 until 升序；数值区间 (prevUntil, until] 对应一档，第一档从 0 起 */
  tiers: SliderTier[];
};

/** 长按：按住达到时长后进入下一节点 */
export type SceneHold = SceneBase & {
  kind: "hold";
  prompt: string;
  hint: string;
  holdMs: number;
  next: string;
  delta?: Partial<Scores>;
};

export type PickTwoOption = { id: string; label: string; delta: Partial<Scores> };

/** 三选二：勾选两条心声后确认，分数为两项之和 */
export type ScenePickTwo = SceneBase & {
  kind: "pick_two";
  prompt: string;
  hint: string;
  options: [PickTwoOption, PickTwoOption, PickTwoOption];
  next: string;
};

export type Scene =
  | SceneVN
  | ScenePhone
  | SceneInterlude
  | SceneResult
  | SceneCasting
  | SceneBinary
  | SceneExclusive
  | SceneSlider
  | SceneHold
  | ScenePickTwo;
export type PersonalityId =
  | "owner"
  | "guardian"
  | "partner"
  | "free"
  | "anxious_lover"
  | "balanced"
  | "spark"
  | "mirror"
  | "anchor";

export type Personality = {
  id: PersonalityId;
  title: string;
  emoji: string;
  summary: string;
  /** 重玩时轮换的副文案（可选） */
  summaryAlt?: string;
  traits: string[];
  advice: string;
  adviceAlt?: string;
  /** 与「练习生/聚光灯」语境下的相处提示（含 {{对方}}） */
  spotlightHint?: string;
  /** 风险提示（非评判） */
  riskLine?: string;
  /** 下次自测可关注的一个具体问题 */
  reflectQuestion?: string;
};
