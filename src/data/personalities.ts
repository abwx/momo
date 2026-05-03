import type { Personality, PersonalityId, Scores } from "@/types/game";

export const PERSONALITIES: Record<PersonalityId, Personality> = {
  owner: {
    id: "owner",
    emoji: "🌙",
    title: "占有型恋人",
    summary:
      "你把「他是我的」写得很用力。靠近他的人、偷走他时间的工作，都会让你心里发紧。爱得深，也更容易在不确定里反复确认。",
    summaryAlt:
      "你更在意「专属感」：消息、时间线、被看见的顺序。你不是不讲理，只是太怕在人群里退成模糊的背景。",
    traits: ["强联结需求", "对边界敏感", "情绪浓度高"],
    advice:
      "试着把占有欲翻译成「我需要被优先看见」——直接说出来，比试探更不伤感情。他的舞台属于所有人，但你们之间的信任可以只属于你们。",
    adviceAlt: "下次情绪上头时，先写一句「我真正害怕的是___」再发出去，往往比质问更能让对方接住你。",
    spotlightHint: "把「专属时刻」写进日程：比如每周固定一次不看手机的面对面聊天。",
    riskLine: "占有欲高涨时，先暂停 10 分钟再回复，能显著降低误伤。",
    reflectQuestion: "你最怕失去的是他的人，还是你们之间的「优先权」？",
  },
  guardian: {
    id: "guardian",
    emoji: "🕯️",
    title: "守护型恋人",
    summary:
      "你习惯把光打在他身上，自己退半步。你怕成为负担，于是用付出来换安心。温柔，但有时也会忘了自己也需要被接住。",
    summaryAlt:
      "你像稳定的后台进程：不抢镜，却一直在运行。你最怕的不是失去他，而是「我是不是添乱了」。",
    traits: ["高共情", "自我抑制", "稳定后盾"],
    advice:
      "默默奉献很动人，但长期会累。练习一件小事：每周留一段完全属于自己的时间，不要求「有用」。被爱的人，也希望你过得好。",
    adviceAlt: "允许自己提一次小要求——哪怕只是「今晚我想选吃什么」。被需要也包括被麻烦。",
    spotlightHint: "练习「被照顾」：让他为你做一次很小的事，并认真说谢谢。",
    riskLine: "长期单方面兜底会透支；疲惫不是背叛，是信号。",
    reflectQuestion: "上一次你为自己开心，而不是为他，是什么时候？",
  },
  partner: {
    id: "partner",
    emoji: "🌱",
    title: "并肩型恋人",
    summary:
      "你相信关系是两个人一起长大。他追梦，你也认真生活；他跌倒，你不是救世主，而是队友。亲密里有尊重，也有各自的名字。",
    summaryAlt:
      "你把喜欢理解成「同步成长」：不是绑在一起，而是各自发光，还能互相照路。",
    traits: ["成长导向", "尊重个体性", "沟通型"],
    advice:
      "你已经很成熟。唯一要注意的是：别把「理性」当成压抑情绪的借口——偶尔示弱，会让他也更敢脆弱。",
    adviceAlt: "当你说「我没事」时，先问一下自己：是真的没事，还是怕麻烦对方？",
    spotlightHint: "用「共同目标」表达亲密：一起健身、一起考证，比只聊工作更养关系。",
    riskLine: "别把「理性」当盾牌：情绪也需要名字。",
    reflectQuestion: "你更希望对方用哪种方式确认你在意他？",
  },
  free: {
    id: "free",
    emoji: "🕊️",
    title: "边界清爽型",
    summary:
      "你分得清「喜欢他」和「占有他」。你愿意为他高兴，也守得住自己的生活。不是冷淡，而是把喜欢放在更可持续的距离里。",
    summaryAlt:
      "你擅长给关系留白：靠近时真诚，分开时也不崩。你的安全感更多来自自我，而不是对方的即时回应。",
    traits: ["独立", "低控制欲", "情绪自洽"],
    advice:
      "如果对方是焦虑型，他可能会误读你的清爽为疏远。多用一句「我在」而不是讲道理，会让他安心很多。",
    adviceAlt: "你可以保留边界，也记得偶尔用具体行动表达「我选了你」——一句晚安有时比一篇小作文更暖。",
    spotlightHint: "清爽型最加分的是「可预期」：固定联系节奏比随机爆发更让对方安心。",
    riskLine: "对方焦虑时，别只用逻辑安抚；先复述他的感受再讲道理。",
    reflectQuestion: "你更在意自由，还是更在意「被理解」？",
  },
  anxious_lover: {
    id: "anxious_lover",
    emoji: "🌊",
    title: "潮汐型恋人",
    summary:
      "你在「想抓紧」和「怕拖累」之间来回。占有欲与奉献感同时很高时，容易把自己绕进情绪的浪里——不是不好，只是很累。",
    summaryAlt:
      "你的投入像潮汐：涨潮时想把全世界给他，退潮时又自责是不是太多。你其实在找「刚刚好」的岸边。",
    traits: ["高投入", "易内耗", "害怕失去"],
    advice:
      "把「他回不回消息」和「我值不值得被爱」拆开。写三条不关于他的、你今天做得不错的小事，会慢慢找回锚点。",
    adviceAlt: "试着把「他是不是不爱我」换成「我现在需要什么」——答案常常不一样。",
    spotlightHint: "潮汐型适合「情绪记账」：把波动写下来，会更容易看见规律。",
    riskLine: "高投入时警惕「自我惩罚式付出」：你不是靠受苦来证明爱。",
    reflectQuestion: "你最近一次感到安全，是因为什么具体细节？",
  },
  balanced: {
    id: "balanced",
    emoji: "✨",
    title: "调和型恋人",
    summary:
      "你的选择里没有极端偏向。你会吃醋也会祝福，会靠近也会放手——像把关系当成一首需要反复排练的歌，你在找最适合自己的唱法。",
    summaryAlt:
      "你像会根据场景换策略的玩家：有时靠近，有时后退，但底色是「我还在认真」。",
    traits: ["灵活", "情境敏感", "仍在探索"],
    advice:
      "没有「最正确」的恋爱人格，只有「最诚实」的。下次心动时，问自己：我此刻更需要被看见，还是需要空间？答案会带你走向更舒服的模式。",
    adviceAlt: "给自己三次「不立刻表态」的缓冲：喝口水、走两步，再决定要不要说出口。",
    spotlightHint: "在「被看见」与「给空间」之间找平衡：一句具体时间点的约定，往往比追问更有效。",
    riskLine: "高压时容易把关心说成控制，记得先确认对方此刻更需要解决方案还是陪伴。",
    reflectQuestion: "最近一次你感到不安时，你真正想确认的是什么？",
  },
  spark: {
    id: "spark",
    emoji: "⚡",
    title: "电光型恋人",
    summary:
      "你既想并肩往前冲，也想把关系攥得很紧——像把喜欢同时写在「成长」和「占有」两条线上。能量高，也容易把自己和对方都绷成一根弦。",
    summaryAlt:
      "你迷恋「同步变强」的爽感：一起熬夜、一起扛、一起赢。可当节奏不同步时，你会比谁都更慌。",
    traits: ["高能量投入", "强目标感", "怕掉队"],
    advice:
      "把「一起变更好」拆成可执行的小块：今天只完成一件小事就好。允许对方偶尔只想当普通人，不是背叛你们的未来。",
    adviceAlt: "当你想说「你怎么不努力」时，先换成「我这两天也有点累」——示弱会打开真正的对话。",
    spotlightHint: "与练习生语境最合拍的是：把「我陪你拼」和「我允许你停」写成同一张日程表的两列。",
    riskLine: "别把对方的疲惫误读为「不够爱」；有时他只是电量低了。",
    reflectQuestion: "你更怕的是落后，还是怕不被选择？写下来，答案会不一样。",
  },
  mirror: {
    id: "mirror",
    emoji: "🪞",
    title: "镜面型恋人",
    summary:
      "你很会照顾对方的情绪，也会本能地维持体面与边界——像一面镜子：照得出温柔，也藏得住距离。你怕失控，所以习惯把话说得刚刚好。",
    summaryAlt:
      "你擅长「读懂空气」：什么时候该靠近，什么时候该后退。你很少失控，但也可能累在「永远正确」里。",
    traits: ["高觉察", "体面克制", "怕越界"],
    advice:
      "试着允许一次「不那么体面」的表达：结巴、重复、停顿都没关系。关系里不需要每句话都抛光。",
    adviceAlt: "当你想说「我没事」时，先问自己：我是在体谅他，还是在回避自己的需要？",
    spotlightHint: "在镜头与私生活之间，你最需要的是「可验证的安全感」：小而稳定的信号比宏大承诺更治愈你。",
    riskLine: "过度读空气可能让对方误以为你不在乎——偶尔把需求说直一点。",
    reflectQuestion: "你最近一次「想说却没说」的话是什么？如果只能说一句，你会选哪句？",
  },
  anchor: {
    id: "anchor",
    emoji: "⚓",
    title: "锚定型恋人",
    summary:
      "你更像关系的锚：愿意承接、愿意兜底、愿意把「我在」落实成具体行动。你相信陪伴的重量，也相信时间会把答案磨出来。",
    summaryAlt:
      "你不一定最会讲情话，但你会记得对方的忌口、行程、和那句随口提过的小愿望。",
    traits: ["稳定", "行动派", "低表达高付出"],
    advice:
      "锚也需要被系住：把你的疲惫说出来，不是破坏关系，而是让关系更真实。你也可以被照顾。",
    adviceAlt: "每周留一次「只为自己」的半小时：不讨论他、不刷物料，只回到你自己的生活纹理里。",
    spotlightHint: "对「练习生式作息」最友好的支持是：把关心做成可重复的小动作（热水、闹钟、接送），而不是一次性透支。",
    riskLine: "当心「我都能忍」变成「我不该要」——需求不会消失，只会换地方冒出来。",
    reflectQuestion: "如果明天他完全不需要你帮忙，你仍想为自己做哪一件小事？",
  },
};

function jitterScores(s: Scores, runSeed: number): Scores {
  const keys: (keyof Scores)[] = ["possess", "devote", "grow", "boundary"];
  const out = { ...s };
  let x = runSeed >>> 0;
  const rnd = () => {
    x = (Math.imul(x, 1664525) + 1013904223) >>> 0;
    return x / 0xffffffff;
  };
  for (let i = 0; i < 2; i++) {
    const k = keys[Math.floor(rnd() * 4)]!;
    out[k] = Math.max(0, out[k] + (rnd() > 0.55 ? 1 : 0));
  }
  return out;
}

export function resolvePersonality(
  s: Scores,
  opts?: { runSeed?: number; replaySpice?: boolean },
): PersonalityId {
  const seed = opts?.runSeed ?? 0;
  const j = opts?.replaySpice && seed !== 0 ? jitterScores(s, seed) : s;
  const { possess, devote, grow, boundary } = j;
  const max = Math.max(possess, devote, grow, boundary);
  const second = [possess, devote, grow, boundary].sort((a, b) => b - a)[1] ?? 0;

  if (grow >= 8 && possess >= 6 && possess >= devote - 2) return "spark";
  if (boundary >= 7 && devote >= 6 && boundary >= possess) return "mirror";
  if (devote >= 8 && grow >= 5 && devote >= possess) return "anchor";

  if (possess >= 7 && possess >= devote && possess - grow >= 3) return "owner";
  if (devote >= 7 && devote >= possess && devote - boundary >= 2) return "guardian";
  if (grow >= 7 && grow >= possess && grow >= devote - 1) return "partner";
  if (boundary >= 6 && possess <= 5 && grow >= 4) return "free";
  if (possess >= 5 && devote >= 5 && possess + devote > grow + boundary + 4) return "anxious_lover";
  if (max - second <= 2 && max < 7) return "balanced";
  if (grow === max) return "partner";
  if (devote === max) return "guardian";
  if (possess === max) return "owner";
  if (boundary === max) return "free";
  return "balanced";
}
