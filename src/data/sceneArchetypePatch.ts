import type { Archetype } from "@/data/archetypes";
import type { ScenePhone, SceneVN } from "@/types/game";

type VnPatch = Partial<Pick<SceneVN, "lines" | "choices" | "skin">>;
type PhonePatch = Partial<Pick<ScenePhone, "messages" | "choices">>;

/** 按气质替换整段 VN（未列出的场景用原版） */
export const VN_ARCHETYPE_PATCH: Partial<Record<string, Partial<Record<Archetype, VnPatch>>>> = {
  ch1_open: {
    sunny: {
      lines: [
        {
          speaker: "narrator",
          text: "{{对方}}不是你「追」来的星星。他是那种会把快乐说很大声、把不安藏进笑里的人——你们一起疯过、也一起熬过作业。",
        },
        { speaker: "player", text: "那时候我们都不知道，「以后」会把人推到多远的地方。" },
        {
          speaker: "partner",
          text: "喂{{称呼}}！明天文艺汇演你来不来？你不来我就……我就更紧张了啦。",
        },
      ],
      choices: [
        {
          id: "c1a",
          label: "来啊，你站 C 位我眼睛只装得下你。",
          next: "ch1b",
          delta: { possess: 2, devote: 1 },
          deltaByArchetype: { sunny: { possess: 1, grow: 1 } },
        },
        {
          id: "c1b",
          label: "行，我把词给你抠细，你负责炸场。",
          next: "ch1b",
          delta: { devote: 2, grow: 1 },
        },
        {
          id: "c1c",
          label: "你去发光，我在台下给你喊破喉咙。",
          next: "ch1b",
          delta: { grow: 2, boundary: 1 },
        },
      ],
    },
    quiet: {
      lines: [
        {
          speaker: "narrator",
          text: "{{对方}}不是你「追」来的星星。他更像那种会把话咽一半、把温柔放很轻的人——你们习惯用沉默并肩，也习惯用默契补位。",
        },
        { speaker: "player", text: "那时候我们都不知道，「以后」会把人推到多远的地方。" },
        {
          speaker: "partner",
          text: "……{{称呼}}。明天文艺汇演。你、你会来的吧？我……我不太会说这种话，但我想你在。",
        },
      ],
      choices: [
        {
          id: "c1a",
          label: "去。你少一个人对口型我都会发现。",
          next: "ch1b",
          delta: { possess: 2, devote: 1 },
          deltaByArchetype: { quiet: { devote: 1, boundary: 1 } },
        },
        {
          id: "c1b",
          label: "我帮你顺词，你别一个人硬扛。",
          next: "ch1b",
          delta: { devote: 2, grow: 1 },
        },
        {
          id: "c1c",
          label: "我在台下，不抢你镜头。",
          next: "ch1b",
          delta: { grow: 2, boundary: 1 },
        },
      ],
    },
    sharp: {
      lines: [
        {
          speaker: "narrator",
          text: "{{对方}}不是你「追」来的星星。他是那种嘴上不饶人、却把「我在」写得很隐蔽的人——你们互怼过，也互相兜过底。",
        },
        { speaker: "player", text: "那时候我们都不知道，「以后」会把人推到多远的地方。" },
        {
          speaker: "partner",
          text: "明天文艺汇演。你爱来不来——不来我就当你默认在台下看我出丑。",
        },
      ],
      choices: [
        {
          id: "c1a",
          label: "行啊，我坐第一排挑你毛病。",
          next: "ch1b",
          delta: { possess: 2, devote: 1 },
          deltaByArchetype: { sharp: { grow: 1, boundary: 1 } },
        },
        {
          id: "c1b",
          label: "别嘴硬了，对词。",
          next: "ch1b",
          delta: { devote: 2, grow: 1 },
        },
        {
          id: "c1c",
          label: "我去，但你不许装没事。",
          next: "ch1b",
          delta: { grow: 2, boundary: 1 },
        },
      ],
    },
    soft: {
      lines: [
        {
          speaker: "narrator",
          text: "{{对方}}不是你「追」来的星星。他像会把关心拆成小动作的人：递水、挡风、把耳机分你一半——你们的好，是细细碎碎的。",
        },
        { speaker: "player", text: "那时候我们都不知道，「以后」会把人推到多远的地方。" },
        {
          speaker: "partner",
          text: "{{称呼}}……明天汇演，我有点怕。可你一在，我就好像能呼吸了。",
        },
      ],
      choices: [
        {
          id: "c1a",
          label: "我当然在啊，笨蛋。",
          next: "ch1b",
          delta: { possess: 2, devote: 1 },
          deltaByArchetype: { soft: { devote: 2 } },
        },
        {
          id: "c1b",
          label: "我陪你顺一遍，不急。",
          next: "ch1b",
          delta: { devote: 2, grow: 1 },
        },
        {
          id: "c1c",
          label: "你上台，我在你能看见的地方。",
          next: "ch1b",
          delta: { grow: 2, boundary: 1 },
        },
      ],
    },
  },
  ch2: {
    sunny: {
      lines: [
        {
          speaker: "narrator",
          text: "高三那年，他把「想试试」说得很亮：面试、练习室、末班地铁，像一串停不下来的鼓点。",
        },
        { speaker: "player", text: "我假装不在意，把想问的那句「你还回得来吗」咽下去。" },
        { speaker: "partner", text: "如果我真的走了……你会不会觉得我很自私？" },
      ],
    },
    quiet: {
      lines: [
        {
          speaker: "narrator",
          text: "高三那年，他的时间表越写越满，却越来越少解释。像怕一开口，就会泄气。",
        },
        { speaker: "player", text: "我假装不在意，把想问的那句「你还回得来吗」咽下去。" },
        { speaker: "partner", text: "如果我真的走了……你会不会觉得我很自私？" },
      ],
    },
    sharp: {
      lines: [
        {
          speaker: "narrator",
          text: "高三那年，他把忙碌包装成「没事」，把选择说成「随便」。你知道他只是不想被可怜。",
        },
        { speaker: "player", text: "我假装不在意，把想问的那句「你还回得来吗」咽下去。" },
        { speaker: "partner", text: "如果我真的走了……你会不会觉得我很自私？" },
      ],
    },
    soft: {
      lines: [
        {
          speaker: "narrator",
          text: "高三那年，他一边往前冲，一边频频回头确认你还在不在——像怕线断了。",
        },
        { speaker: "player", text: "我假装不在意，把想问的那句「你还回得来吗」咽下去。" },
        { speaker: "partner", text: "如果我真的走了……你会不会觉得我很自私？" },
      ],
    },
  },
};

export const PHONE_ARCHETYPE_PATCH: Partial<Record<string, Partial<Record<Archetype, PhonePatch>>>> = {
  ch2_phone_rumor: {
    sunny: {
      messages: [
        { from: "partner", text: "{{称呼}}在吗在吗！", delayMs: 350 },
        { from: "partner", text: "训练室被偷拍了，说我跟队友黏太紧哈哈哈哈离谱！", delayMs: 450 },
        { from: "partner", text: "但我怕你被骂……我不想你因为我难受。", delayMs: 500 },
      ],
      choices: [
        {
          id: "p2a",
          label: "先别管热搜，先让我听见你声音。",
          next: "ch3_interlude",
          delta: { possess: 2, boundary: -1 },
        },
        {
          id: "p2b",
          label: "我关通知了，你吃饭。晚点打给我。",
          next: "ch3_interlude",
          delta: { devote: 2, grow: 1 },
        },
        {
          id: "p2c",
          label: "你解释你的，我先去骂醒我自己别乱想。",
          next: "ch3_interlude",
          delta: { boundary: 2, possess: -1 },
        },
      ],
    },
    quiet: {
      messages: [
        { from: "partner", text: "{{称呼}}……在吗。", delayMs: 500 },
        { from: "partner", text: "训练室被偷拍了。说我跟队友……走太近。", delayMs: 600 },
        { from: "partner", text: "我知道是假的。可我怕你被卷进来……对不起。", delayMs: 550 },
      ],
      choices: [
        {
          id: "p2a",
          label: "别一个人道歉。把话说清楚，我听着。",
          next: "ch3_interlude",
          delta: { possess: 2, boundary: -1 },
        },
        {
          id: "p2b",
          label: "我先静音世界。你慢慢说。",
          next: "ch3_interlude",
          delta: { devote: 2, grow: 1 },
        },
        {
          id: "p2c",
          label: "我不看评论了。你也别看。",
          next: "ch3_interlude",
          delta: { boundary: 3, possess: -1 },
        },
      ],
    },
    sharp: {
      messages: [
        { from: "partner", text: "在？别装死。", delayMs: 400 },
        { from: "partner", text: "训练室被偷拍，编得像真的一样。烦。", delayMs: 450 },
        { from: "partner", text: "你要是信了……我就更烦。", delayMs: 500 },
      ],
      choices: [
        {
          id: "p2a",
          label: "我信你。不信他们。",
          next: "ch3_interlude",
          delta: { possess: 1, grow: 1, boundary: -1 },
        },
        {
          id: "p2b",
          label: "行，你先吃饭。我等你电话。",
          next: "ch3_interlude",
          delta: { devote: 2, grow: 1 },
        },
        {
          id: "p2c",
          label: "热搜关我屁事。你关好你自己。",
          next: "ch3_interlude",
          delta: { boundary: 3, possess: -1 },
        },
      ],
    },
    soft: {
      messages: [
        { from: "partner", text: "{{称呼}}……", delayMs: 500 },
        { from: "partner", text: "训练室被偷拍了。我好怕你也受伤……", delayMs: 550 },
        { from: "partner", text: "你要是累了，也可以不理我。真的。", delayMs: 600 },
      ],
      choices: [
        {
          id: "p2a",
          label: "我会理你。先把心放肚子里。",
          next: "ch3_interlude",
          delta: { possess: 2, devote: 1, boundary: -1 },
        },
        {
          id: "p2b",
          label: "我不走。你去吃点热的。",
          next: "ch3_interlude",
          delta: { devote: 3, grow: 1 },
        },
        {
          id: "p2c",
          label: "我也会怕，但我们可以一起怕。",
          next: "ch3_interlude",
          delta: { boundary: 2, grow: 2, possess: -1 },
        },
      ],
    },
  },
  ch3_key: {
    sunny: {
      messages: [
        { from: "partner", text: "{{称呼}}还没睡吗！我亢奋又害怕哈哈哈哈", delayMs: 500 },
        { from: "partner", text: "我有点怕。", delayMs: 700 },
        { from: "partner", text: "怕明天站上去会抖……也怕你觉得我不值得被喜欢。", delayMs: 650 },
      ],
    },
    quiet: {
      messages: [
        { from: "partner", text: "{{称呼}}……还没睡吗。", delayMs: 600 },
        { from: "partner", text: "我有点怕。", delayMs: 900 },
        { from: "partner", text: "怕明天会搞砸……也怕你会失望。", delayMs: 700 },
      ],
    },
    sharp: {
      messages: [
        { from: "partner", text: "睡了没。", delayMs: 450 },
        { from: "partner", text: "说怕太丢人。但……", delayMs: 700 },
        { from: "partner", text: "明天要是搞砸了，你会不会装作没认识过我。", delayMs: 650 },
      ],
    },
    soft: {
      messages: [
        { from: "partner", text: "{{称呼}}……", delayMs: 550 },
        { from: "partner", text: "我有点怕。", delayMs: 900 },
        { from: "partner", text: "怕明天会发抖……更怕你会不要我。", delayMs: 700 },
      ],
    },
  },
};
