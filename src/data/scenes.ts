import type { Scene } from "@/types/game";

/** 剧情人物与称呼由玩家在选角页自定义；与任何真实个人无关 */
export const SCENES: Record<string, Scene> = {
  splash: {
    id: "splash",
    chapter: 0,
    title: "企划说明",
    kind: "vn",
    lines: [
      {
        speaker: "narrator",
        text: "本体验为原创互动心理测试，含轻量叙事与分支选择。角色、公司、事件均为虚构，与现实中任何个人或团体无关。结果仅供娱乐与自我觉察，不构成心理诊断或恋爱建议。",
      },
    ],
    next: "casting",
  },
  casting: {
    id: "casting",
    chapter: 0,
    title: "选角与称呼",
    kind: "casting",
  },
  ch1_open: {
    id: "ch1_open",
    chapter: 1,
    title: "巷子口的夏天",
    kind: "vn",
    lines: [
      {
        speaker: "narrator",
        text: "{{对方}}不是你「追」来的星星。他是和你一起跳过皮筋、抄过作业、分过半根冰棍的人。",
      },
      { speaker: "player", text: "那时候我们都不知道，「以后」会把人推到多远的地方。" },
      { speaker: "partner", text: "喂，{{称呼}}，明天文艺汇演，你真不来看？我紧张。" },
    ],
    choices: [
      {
        id: "c1a",
        label: "去啊，你站 C 我看不清谁才是主角。",
        next: "ch1b",
        delta: { possess: 2, devote: 1 },
      },
      {
        id: "c1b",
        label: "我帮你对词吧，你上台我放心。",
        next: "ch1b",
        delta: { devote: 2, grow: 1 },
      },
      {
        id: "c1c",
        label: "你自己可以的，我在台下举手幅。",
        next: "ch1b",
        delta: { grow: 2, boundary: 1 },
      },
    ],
  },
  ch1b: {
    id: "ch1b",
    chapter: 1,
    title: "后台",
    kind: "vn",
    lines: [
      { speaker: "narrator", text: "灯光亮起来之前，他手心全是汗，却还在对你笑。" },
      { speaker: "partner", text: "要是我忘词了，你就对口型，当我的人形提词器。" },
    ],
    choices: [
      {
        id: "c1d",
        label: "忘词就忘词，谁规定完美才算赢。",
        next: "ch1_draft",
        delta: { grow: 2, boundary: 1 },
      },
      {
        id: "c1e",
        label: "你敢忘试试，我记仇。",
        next: "ch1_draft",
        delta: { possess: 2, devote: 1 },
      },
      {
        id: "c1f",
        label: "别怕，我替你紧张完了，你只管发光。",
        next: "ch1_draft",
        delta: { devote: 2 },
      },
    ],
  },
  ch1_draft: {
    id: "ch1_draft",
    chapter: 1,
    title: "彩排表背面",
    kind: "vn",
    lines: [
      {
        speaker: "narrator",
        text: "他把明天的走位用铅笔描在彩排表背面——像怕正式纸太干净，装不下出错的可能。",
      },
      { speaker: "player", text: "我突然发现：他连「紧张」都写得像日程一样工整。" },
      {
        speaker: "partner",
        text: "{{称呼}}……如果我真的搞砸了，你会不会后悔今天来？",
      },
    ],
    choices: [
      {
        id: "d1a",
        label: "不搞砸才奇怪，我来看的就是会搞砸的你。",
        next: "ch1_journal",
        delta: { grow: 2, devote: 1 },
      },
      {
        id: "d1b",
        label: "后悔这个词太贵，我把它从你那儿没收了。",
        next: "ch1_journal",
        delta: { possess: 1, boundary: 1 },
      },
      {
        id: "d1c",
        label: "我只后悔没早点说：搞砸了也来找我。",
        next: "ch1_journal",
        delta: { devote: 2, boundary: 1 },
      },
    ],
  },
  ch1_journal: {
    id: "ch1_journal",
    chapter: 1,
    title: "随手一页",
    kind: "vn",
    skin: "journal",
    lines: [
      {
        speaker: "narrator",
        text: "你在笔记本边角写下一行字——像给未来的自己留证据，也像给现在的他留一点退路。",
      },
      { speaker: "player", text: "如果一定要选，我更想记住他哪一个瞬间？" },
    ],
    choices: [
      {
        id: "j1",
        label: "他第一次把「我怕」说出口的样子。",
        next: "ch1_pulse",
        delta: { devote: 1, grow: 1 },
      },
      {
        id: "j2",
        label: "他把外套丢给我、自己冲进雨里的背影。",
        next: "ch1_pulse",
        delta: { possess: 1, devote: 1 },
      },
      {
        id: "j3",
        label: "他明明很累还在逞强说「没事」的侧脸。",
        next: "ch1_pulse",
        delta: { boundary: 1, grow: 1 },
      },
    ],
  },
  ch1_pulse: {
    id: "ch1_pulse",
    chapter: 1,
    title: "走廊多停三秒",
    kind: "vn",
    lines: [
      {
        speaker: "narrator",
        text: "合上笔记本前，你忽然想起他今天对视时又躲开的那一下——像怕把心事说太大声。",
      },
      { speaker: "player", text: "如果只能带走一个「此刻」写进纸条，你会选哪一种？" },
    ],
    choices: [
      {
        id: "hp1",
        label: "带走他今天对视又躲开的那个瞬间。",
        next: "ch1_evening",
        delta: { devote: 1, grow: 1 },
      },
      {
        id: "hp2",
        label: "带走「如果当时多问一句」的可能。",
        next: "ch1_evening",
        delta: { possess: 1, boundary: 1 },
      },
      {
        id: "hp3",
        label: "带走「我们还会在同一条走廊笑」的确信。",
        next: "ch1_evening",
        delta: { boundary: 1, grow: 1 },
      },
    ],
  },
  ch1_evening: {
    id: "ch1_evening",
    chapter: 1,
    title: "晚自习后",
    kind: "phone",
    messages: [
      { from: "partner", text: "{{称呼}}，今天谢谢你。", delayMs: 400 },
      { from: "partner", text: "我在小卖部买了两瓶汽水，你要哪瓶？", delayMs: 500 },
      { from: "player", text: "都要。你先欠我一瓶。", delayMs: 300 },
    ],
    choices: [
      {
        id: "e1",
        label: "拍张汽水合照发过去：记账。",
        next: "ch1_platform",
        delta: { possess: 1, grow: 1 },
      },
      {
        id: "e2",
        label: "回：下次换我请，你少熬夜。",
        next: "ch1_platform",
        delta: { devote: 2, boundary: 1 },
      },
      {
        id: "e3",
        label: "回：喝完把瓶子留给我做笔筒。",
        next: "ch1_platform",
        delta: { grow: 2 },
      },
    ],
  },
  ch1_platform: {
    id: "ch1_platform",
    chapter: 1,
    title: "末班车前",
    kind: "phone",
    messages: [
      { from: "partner", text: "{{称呼}}，我到家门口了。", delayMs: 450 },
      {
        from: "partner",
        text: "刚才路灯下面……我突然很想问：你会不会有一天，嫌我太吵、太黏、太不稳定？",
        delayMs: 620,
      },
      { from: "player", text: "你先把「不稳定」三个字撤回。", delayMs: 380 },
    ],
    choices: [
      {
        id: "pf1",
        label: "回：嫌你吵我就不会戴降噪耳机还接你电话。",
        next: "ch1_meter",
        delta: { possess: 1, devote: 1 },
      },
      {
        id: "pf2",
        label: "回：不稳定也行，我当你的定点。",
        next: "ch1_meter",
        delta: { boundary: 1, grow: 2 },
      },
      {
        id: "pf3",
        label: "回：明天再讨论哲学，现在先去睡。",
        next: "ch1_meter",
        delta: { devote: 1, boundary: 2 },
      },
    ],
  },
  ch1_meter: {
    id: "ch1_meter",
    chapter: 1,
    title: "在意刻度",
    kind: "slider",
    prompt:
      "把这一刻的在意滑到一个刻度——越靠左越想给{{对方}}留空间，越靠右越想把他抓稳一点（松手后点确认）。",
    minLabel: "更多留白",
    maxLabel: "更少放手",
    next: "ch2_pair",
    tiers: [
      { until: 33, delta: { boundary: 2, grow: 1 } },
      { until: 66, delta: { grow: 2, devote: 1 } },
      { until: 100, delta: { possess: 2, devote: 1 } },
    ],
  },
  ch2_pair: {
    id: "ch2_pair",
    chapter: 2,
    title: "两种支持叠在一起",
    kind: "pick_two",
    prompt: "如果要 {{对方}} 带着两种力量往前走——你会勾选哪两条心声？（必须选两项）",
    hint: "点一下选中，再点可取消；选满两条后点确认。",
    next: "ch2_mid",
    options: [
      { id: "pt_a", label: "我想当他情绪的安全网。", delta: { devote: 2, grow: 1 } },
      { id: "pt_b", label: "我想把喜欢当成长线，不急着要答案。", delta: { grow: 2, boundary: 1 } },
      { id: "pt_c", label: "我想明确说：越界我会开口，但我不走。", delta: { boundary: 2, possess: 1 } },
    ],
  },
  ch2_mid: {
    id: "ch2_mid",
    chapter: 2,
    title: "走廊分叉",
    kind: "binary",
    prompt: "他把耳机分你一半，里面在放你们常听的那首。你更想——",
    left: {
      id: "b2L",
      label: "把音量调小：想听他说话。",
      next: "ch2_station",
      delta: { devote: 2, possess: 1 },
    },
    right: {
      id: "b2R",
      label: "跟着哼两句：把紧张唱散。",
      next: "ch2_station",
      delta: { grow: 2, boundary: 1 },
    },
  },
  ch2_station: {
    id: "ch2_station",
    chapter: 2,
    title: "月台与通告",
    kind: "vn",
    lines: [
      {
        speaker: "narrator",
        text: "城市把末班车排得很密，却把「再见」说得很轻。他开始习惯用「行程」代替「想你」。",
      },
      { speaker: "player", text: "我学着把他的忙碌翻译成：他还在努力靠近某种光。" },
      {
        speaker: "partner",
        text: "{{称呼}}，如果下一站很远……你愿意把我的「不确定」也当成一种诚实吗？",
      },
    ],
    choices: [
      {
        id: "st1",
        label: "愿意。诚实比完美更让我安心。",
        next: "ch2",
        delta: { boundary: 2, grow: 1 },
      },
      {
        id: "st2",
        label: "愿意，但你也得练习把「我需要你」说清楚。",
        next: "ch2",
        delta: { devote: 2, possess: 1 },
      },
      {
        id: "st3",
        label: "愿意——前提是你别把我排进「已读不回」那一栏。",
        next: "ch2",
        delta: { possess: 2, grow: 1 },
      },
    ],
  },
  ch2: {
    id: "ch2",
    chapter: 2,
    title: "高中最后一排",
    kind: "vn",
    lines: [
      { speaker: "narrator", text: "高三那年，他开始跑公司面试。课表、练习室、地铁末班，把他的时间表挤成一张纸。" },
      { speaker: "player", text: "我假装不在意，把想问的那句「你还回得来吗」咽下去。" },
      { speaker: "partner", text: "如果我真的走了……你会不会觉得我很自私？" },
    ],
    choices: [
      {
        id: "c2a",
        label: "会啊，所以你要用一辈子赔我。",
        next: "ch2_phone_rumor",
        nextByArchetype: { soft: "ch2_soft_lane" },
        delta: { possess: 2, devote: 1 },
      },
      {
        id: "c2b",
        label: "不会。你去，我也考我想去的城市。",
        next: "ch2_phone_rumor",
        nextByArchetype: { sharp: "ch2_sharp_lane" },
        delta: { grow: 3, boundary: 1 },
      },
      {
        id: "c2c",
        label: "自私一点也好，我帮你守着后方。",
        next: "ch2_phone_rumor",
        nextByArchetype: { quiet: "ch2_quiet_lane" },
        delta: { devote: 3 },
      },
    ],
  },
  ch2_soft_lane: {
    id: "ch2_soft_lane",
    chapter: 2,
    title: "软着陆",
    kind: "vn",
    lines: [
      {
        speaker: "narrator",
        text: "他把「一辈子」听得很重，重到眼眶先红了，又赶紧用笑把它盖住。",
      },
      {
        speaker: "partner",
        text: "{{称呼}}……你说得那么认真，我会当真的。",
      },
    ],
    next: "ch2_phone_rumor",
  },
  ch2_sharp_lane: {
    id: "ch2_sharp_lane",
    chapter: 2,
    title: "嘴硬之后",
    kind: "vn",
    lines: [
      {
        speaker: "narrator",
        text: "他别过脸三秒，像在跟自己的骄傲谈判。最后只丢给你一句很轻的谢谢。",
      },
      { speaker: "partner", text: "……行。那你也别掉队。谁掉队谁请客。" },
    ],
    next: "ch2_phone_rumor",
  },
  ch2_quiet_lane: {
    id: "ch2_quiet_lane",
    chapter: 2,
    title: "慢热回音",
    kind: "phone",
    messages: [
      { from: "partner", text: "{{称呼}}。", delayMs: 600 },
      { from: "partner", text: "你那句话……我存进备忘录了。", delayMs: 700 },
      { from: "partner", text: "我会努力的。为了不让你……白等。", delayMs: 800 },
    ],
    choices: [
      {
        id: "q2",
        label: "回一个「嗯」，再加一只小猫探头表情包。",
        next: "ch2_phone_rumor",
        delta: { devote: 2, boundary: 1 },
      },
    ],
  },
  ch2_phone_rumor: {
    id: "ch2_phone_rumor",
    chapter: 2,
    title: "深夜热搜预览",
    kind: "phone",
    timeLimitMs: 5000,
    messages: [
      { from: "partner", text: "在吗", delayMs: 400 },
      { from: "partner", text: "训练室有人拍到了，说我和队友「走太近」。" },
      { from: "partner", text: "我知道是假的，但怕你被卷进来。", delayMs: 500 },
    ],
    choices: [
      {
        id: "p2a",
        label: "别解释给全世界看，先跟我把话说清楚。",
        next: "ch2_after",
        delta: { possess: 2, boundary: -1 },
      },
      {
        id: "p2b",
        label: "我关通知了。你好好吃饭，晚点打给我。",
        next: "ch2_after",
        delta: { devote: 2, grow: 1 },
      },
      {
        id: "p2c",
        label: "当艺人就要习惯被误读，我们各走各的路也行。",
        next: "ch2_after",
        delta: { boundary: 3, possess: -1 },
      },
    ],
  },
  ch2_after: {
    id: "ch2_after",
    chapter: 2,
    title: "练习室窗外",
    kind: "binary",
    prompt: "你路过练习室，看见他对着镜子抠同一个动作。你会——",
    left: {
      id: "a2a",
      label: "敲门进去，陪他抠到顺为止。",
      next: "ch2_breathe",
      delta: { devote: 2, possess: 1 },
    },
    right: {
      id: "a2b",
      label: "发消息：我在，不打扰你练。",
      next: "ch2_breathe",
      delta: { boundary: 2, grow: 2 },
    },
  },
  ch2_breathe: {
    id: "ch2_breathe",
    chapter: 2,
    title: "喘口气",
    kind: "phone",
    messages: [
      { from: "partner", text: "{{称呼}}，我到楼下了。", delayMs: 400 },
      {
        from: "partner",
        text: "刚才镜子前那遍我又不满意……可我也想听你一句实话。",
        delayMs: 520,
      },
      { from: "player", text: "那就别说练了，先说你饿不饿。", delayMs: 380 },
    ],
    choices: [
      {
        id: "br1",
        label: "回：先上楼洗把脸，我陪你把那段再过一遍。",
        next: "ch3_warmup",
        delta: { devote: 2, grow: 1 },
      },
      {
        id: "br2",
        label: "回：实话就是——你已经够好了，只是太苛自己。",
        next: "ch3_warmup",
        delta: { grow: 2, boundary: 1 },
      },
      {
        id: "br3",
        label: "回：饿就先吃，练不完明天继续，我陪你。",
        next: "ch3_warmup",
        delta: { possess: 1, devote: 1 },
      },
    ],
  },
  ch3_warmup: {
    id: "ch3_warmup",
    chapter: 3,
    title: "快进之间的呼吸",
    kind: "vn",
    lines: [
      {
        speaker: "narrator",
        text: "你把日历翻过去又翻回来——像想确认：那些被删掉的空白里，是不是也删掉了他。",
      },
      {
        speaker: "player",
        text: "练习室灯一亮一灭，像心跳。你忽然明白：等待也会把人练成另一种艺人。",
      },
      {
        speaker: "narrator",
        text: "而他在更亮的灯里学微笑、学停顿、学把情绪藏进节拍——也学把「想你」压成一条更短的语音。",
      },
      { speaker: "partner", text: "{{称呼}}……我还在这儿。只是有时候，我得先学会站在远处爱你。" },
    ],
    next: "ch3_hold",
  },
  ch3_hold: {
    id: "ch3_hold",
    chapter: 3,
    title: "把「我在」按进此刻",
    kind: "hold",
    prompt: "他不想让你看见发抖的指尖——所以你更想把这句话按进沉默里：「我还在」。",
    hint: "长按下方区域别松开，像把承诺按进这一秒。",
    holdMs: 900,
    next: "ch3_interlude",
    delta: { devote: 2, grow: 1 },
  },
  ch3_interlude: {
    id: "ch3_interlude",
    chapter: 3,
    title: "时间压缩",
    kind: "interlude",
    subtitle: "练习室、考核、淘汰、再考核——像被快进的人生。直到出道名单定稿那一夜。",
    next: "ch3_corridor",
  },
  ch3_corridor: {
    id: "ch3_corridor",
    chapter: 3,
    title: "出道名单贴出来之前",
    kind: "phone",
    messages: [
      { from: "partner", text: "{{称呼}}，名单还没公布。", delayMs: 500 },
      {
        from: "partner",
        text: "我突然很想做一件很幼稚的事——想问你：如果我上去了，你会不会觉得我更远了？",
        delayMs: 700,
      },
      { from: "player", text: "上去了就上去了，我又不跟名单谈恋爱。", delayMs: 400 },
    ],
    choices: [
      {
        id: "co1",
        label: "回：远就远，我会把「见面」练成技能。",
        next: "ch3_key",
        delta: { grow: 2, possess: 1 },
      },
      {
        id: "co2",
        label: "回：别用距离吓我，我比你更怕失去。",
        next: "ch3_key",
        delta: { possess: 2, devote: 1 },
      },
      {
        id: "co3",
        label: "回：先别自我审判，名单出来我们再庆祝或骂人。",
        next: "ch3_key",
        delta: { boundary: 2, grow: 1 },
      },
    ],
  },
  ch3_key: {
    id: "ch3_key",
    chapter: 3,
    title: "出道前夜",
    kind: "phone",
    messages: [
      { from: "partner", text: "{{称呼}}，还没睡吗", delayMs: 600 },
      { from: "partner", text: "我有点怕。", delayMs: 900 },
      { from: "partner", text: "怕明天站上去会发抖，怕……怕你会突然觉得我不值得。", delayMs: 700 },
    ],
    choices: [
      {
        id: "k1",
        label: "怕什么，你只能给我一个人先发语音。",
        next: "ch3_snack",
        delta: { possess: 3, devote: 1 },
      },
      {
        id: "k2",
        label: "把「不值得」三个字删掉。你值得，跟我在不在没关系。",
        next: "ch3_snack",
        delta: { grow: 3, boundary: 1 },
      },
      {
        id: "k3",
        label: "我在。电话别挂，我陪你练开场白到天亮。",
        next: "ch3_snack",
        delta: { devote: 3, possess: 1 },
      },
      {
        id: "k4",
        label: "明天你会很忙，今晚先睡。我也怕，但我会去看你。",
        next: "ch3_snack",
        delta: { grow: 2, boundary: 2 },
      },
    ],
  },
  ch3_snack: {
    id: "ch3_snack",
    chapter: 3,
    title: "便利店定位",
    kind: "phone",
    timeLimitMs: 4000,
    messages: [
      { from: "partner", text: "给你丢个定位。", delayMs: 450 },
      { from: "partner", text: "楼下便利店关东煮还剩两串，你要不要？", delayMs: 550 },
      { from: "player", text: "要。顺便帮我带包纸巾。", delayMs: 350 },
    ],
    choices: [
      {
        id: "s3a",
        label: "转账备注：「出道费预支」。",
        next: "ch3_rooftop",
        delta: { possess: 1, grow: 1 },
      },
      {
        id: "s3b",
        label: "回：你吃什么我吃什么，别省钱。",
        next: "ch3_rooftop",
        delta: { devote: 2, grow: 1 },
      },
      {
        id: "s3c",
        label: "回：我不挑，你快点回来休息。",
        next: "ch3_rooftop",
        delta: { boundary: 2, devote: 1 },
      },
    ],
  },
  ch3_rooftop: {
    id: "ch3_rooftop",
    chapter: 4,
    title: "天台的风把话吹散又拼回来",
    kind: "vn",
    lines: [
      {
        speaker: "narrator",
        text: "你们找到一处没有镜头的地方。城市的灯像倒过来的星海，他却还在练习「如何把喜欢说得不那么像索取」。",
      },
      { speaker: "player", text: "我突然很想把「以后」说得更具体一点——具体到明天早餐吃什么。" },
      {
        speaker: "partner",
        text: "{{称呼}}……出道前夜，我能不能自私一次：把今晚的你，暂时只写进我一个人的备忘录里？",
      },
    ],
    choices: [
      {
        id: "rf1",
        label: "写吧，密码我生日。",
        next: "exclusive_inline",
        delta: { possess: 2, devote: 1 },
      },
      {
        id: "rf2",
        label: "写短一点，留一行给我回「收到」。",
        next: "exclusive_inline",
        delta: { boundary: 2, grow: 1 },
      },
      {
        id: "rf3",
        label: "写完念给我听，我帮你改错别字。",
        next: "exclusive_inline",
        delta: { devote: 2, grow: 1 },
      },
    ],
  },
  exclusive_inline: {
    id: "exclusive_inline",
    chapter: 4,
    title: "四代练习室·专属篇",
    kind: "exclusive",
    continueTo: "ch4",
  },
  ch4: {
    id: "ch4",
    chapter: 6,
    title: "出道日之后",
    kind: "vn",
    lines: [
      {
        speaker: "narrator",
        text: "舞台灯像海。他在海里，你在岸边的阴影里，突然意识到：喜欢一个人的方式，也要跟着长大。",
      },
      { speaker: "partner", text: "公司想让我立「单身人设」。我知道很荒谬，可我还是想问你——你怎么想？" },
    ],
    choices: [
      {
        id: "c4a",
        label: "我配合。只要你别真的把我从人生里「下架」。",
        next: "ch4_letter",
        delta: { devote: 2, possess: 2 },
      },
      {
        id: "c4b",
        label: "人设归人设，私下我们照旧坦诚，行吗？",
        next: "ch4_letter",
        delta: { grow: 2, boundary: 2 },
      },
      {
        id: "c4c",
        label: "公开与否你决定，我只要求别骗我。",
        next: "ch4_letter",
        delta: { boundary: 2, grow: 1 },
      },
    ],
  },
  ch4_letter: {
    id: "ch4_letter",
    chapter: 6,
    title: "手写信与未发送",
    kind: "vn",
    lines: [
      {
        speaker: "narrator",
        text: "你在备忘录里写下一封不会寄出的信——每个字都像在练习：如何把「我需要你」说得体面。",
      },
      { speaker: "player", text: "写到一半又删掉，是因为怕太真，还是怕太轻？" },
      {
        speaker: "partner",
        text: "{{称呼}}……如果有一天我必须把「我们」藏进括号里，你还会读括号外面的我吗？",
      },
    ],
    choices: [
      {
        id: "l4a",
        label: "读。括号内外我都读。",
        next: "dream",
        delta: { devote: 2, grow: 1 },
      },
      {
        id: "l4b",
        label: "不读也行，我会直接问你本人。",
        next: "dream",
        delta: { possess: 1, boundary: 2 },
      },
      {
        id: "l4c",
        label: "我会把括号擦掉，让你不用藏。",
        next: "dream",
        delta: { grow: 2, devote: 1 },
      },
    ],
  },
  dream: {
    id: "dream",
    chapter: 7,
    title: "梦境拾片",
    kind: "vn",
    lines: [
      {
        speaker: "narrator",
        text: "那晚你做了一个很短的梦。梦里只有一片光，和三种声音。你更想抓住哪一种？",
      },
    ],
    choices: [
      {
        id: "d1",
        label: "「抓紧我。」——像怕松手就会丢。",
        next: "dream_gate",
        delta: { possess: 2, devote: 1 },
      },
      {
        id: "d2",
        label: "「去吧。」——像在目送一艘船。",
        next: "dream_gate",
        delta: { boundary: 2, grow: 2 },
      },
      {
        id: "d3",
        label: "「我在这儿。」——像把自己站成坐标。",
        next: "dream_gate",
        delta: { devote: 2, grow: 1 },
      },
    ],
  },
  dream_gate: {
    id: "dream_gate",
    chapter: 7,
    title: "庆功前夜",
    kind: "binary",
    prompt: "梦醒后，{{对方}}发来一句：「庆功宴结束我想见你。」你更想——",
    left: {
      id: "dgL",
      label: "让他发定位：我过去。",
      next: "ch5_dressing",
      delta: { possess: 2, devote: 1 },
    },
    right: {
      id: "dgR",
      label: "让他先回家：我在老地方等他。",
      next: "ch5_dressing",
      delta: { boundary: 2, grow: 2 },
    },
  },
  ch5_dressing: {
    id: "ch5_dressing",
    chapter: 8,
    title: "化妆间门口三十秒",
    kind: "phone",
    timeLimitMs: 4500,
    messages: [
      { from: "partner", text: "{{称呼}}，我快上台了。", delayMs: 400 },
      {
        from: "partner",
        text: "刚才梦里那句「想见你」……我发出去又撤回三次。你会不会觉得我很怂？",
        delayMs: 650,
      },
      { from: "player", text: "怂什么，我截图了（开玩笑的）。", delayMs: 380 },
    ],
    choices: [
      {
        id: "dr1",
        label: "回：不怂，我当你的人形勇气补丁。",
        next: "ch5",
        delta: { devote: 2, possess: 1 },
      },
      {
        id: "dr2",
        label: "回：上台前别看我，我会让你笑场。",
        next: "ch5",
        delta: { boundary: 2, grow: 1 },
      },
      {
        id: "dr3",
        label: "回：发就发，撤回也算数。",
        next: "ch5",
        delta: { possess: 1, grow: 2 },
      },
    ],
  },
  ch5: {
    id: "ch5",
    chapter: 8,
    title: "签售会长队",
    kind: "vn",
    lines: [
      { speaker: "narrator", text: "第一次签售，你排在队伍里，像无数个陌生人一样递上专辑。" },
      { speaker: "partner", text: "（抬眼一愣，又迅速职业化地笑）谢谢支持……今天也要开心哦。" },
    ],
    choices: [
      {
        id: "c5a",
        label: "握久一秒，低声说：回家等你。",
        next: "ch5_afterglow",
        delta: { possess: 2, devote: 1 },
      },
      {
        id: "c5b",
        label: "礼貌点头离开，把话留到没有镜头的地方说。",
        next: "ch5_afterglow",
        delta: { boundary: 2, grow: 2 },
      },
      {
        id: "c5c",
        label: "故意写错 to 签，看他憋笑。",
        next: "ch5_afterglow",
        delta: { grow: 2, devote: 1 },
      },
    ],
  },
  ch5_afterglow: {
    id: "ch5_afterglow",
    chapter: 8,
    title: "散场后的余温",
    kind: "vn",
    lines: [
      {
        speaker: "narrator",
        text: "人群像潮水退去，签名笔的墨味还在空气里。你忽然发现：最响的掌声也会很快安静，而你想留住的是另一种声音。",
      },
      { speaker: "player", text: "不是「谢谢支持」，是他叫错你称呼又改口的那一下。" },
      {
        speaker: "partner",
        text: "{{称呼}}……今天辛苦了。下次……我还能在「不是营业」的时间里见你吗？",
      },
    ],
    choices: [
      {
        id: "ag1",
        label: "能。把「下次」改成「明天」。",
        next: "ch6",
        delta: { possess: 1, grow: 2 },
      },
      {
        id: "ag2",
        label: "能。但你要允许我也累一会儿。",
        next: "ch6",
        delta: { boundary: 2, devote: 1 },
      },
      {
        id: "ag3",
        label: "能。先把外套穿上，别感冒。",
        next: "ch6",
        delta: { devote: 2, boundary: 1 },
      },
    ],
  },
  ch6: {
    id: "ch6",
    chapter: 9,
    title: "回程车上",
    kind: "phone",
    messages: [
      { from: "partner", text: "今天……对不起。", delayMs: 500 },
      { from: "partner", text: "我差点装不下去。", delayMs: 600 },
      { from: "partner", text: "{{称呼}}，你会后悔认识现在这个我吗？", delayMs: 800 },
    ],
    choices: [
      {
        id: "c6a",
        label: "后悔也没用，你已经被我预定了后半场。",
        next: "ch6_stoop",
        delta: { possess: 2, grow: 1 },
      },
      {
        id: "c6b",
        label: "我只后悔没早点告诉你：我也会累。",
        next: "ch6_stoop",
        delta: { devote: 1, grow: 2, boundary: 1 },
      },
      {
        id: "c6c",
        label: "认识你是bonus，不认识我也会好好活。",
        next: "ch6_stoop",
        delta: { boundary: 3, grow: 1 },
      },
    ],
  },
  ch6_stoop: {
    id: "ch6_stoop",
    chapter: 9,
    title: "路灯下的台阶",
    kind: "vn",
    lines: [
      {
        speaker: "narrator",
        text: "车开走了，世界终于把音量调小。你们坐在台阶上，像回到很久以前——只是这次，沉默里多了点成年人的分寸。",
      },
      { speaker: "player", text: "我突然不想把话说漂亮。只想把「我还在」说得很稳。" },
      {
        speaker: "partner",
        text: "{{称呼}}……谢谢你今天没逃走。下一次，换我走向你也可以。",
      },
    ],
    choices: [
      {
        id: "st6a",
        label: "那我等着，你别迟到。",
        next: "finale",
        delta: { possess: 1, grow: 1 },
      },
      {
        id: "st6b",
        label: "不用换，我走过去也行。",
        next: "finale",
        delta: { devote: 2, grow: 1 },
      },
      {
        id: "st6c",
        label: "先回家睡觉，明天再比谁更勇敢。",
        next: "finale",
        delta: { boundary: 2, devote: 1 },
      },
    ],
  },
  finale: {
    id: "finale",
    chapter: 10,
    title: "收束",
    kind: "interlude",
    subtitle: "故事停在虚构的某一页。而你的选择，拼出了你在亲密关系里更常出现的形状。",
    next: "result",
  },
  epilogue: {
    id: "epilogue",
    chapter: 10,
    title: "再度亮起的灯",
    kind: "vn",
    lines: [
      {
        speaker: "narrator",
        text: "你又把同一条路走了一遍——像排练，也像确认：有些心动并不会因为知道结局就失效。",
      },
      {
        speaker: "partner",
        text: "{{称呼}}，我其实会怕：怕你觉得我总把你拖进镜头外的麻烦里。",
      },
      { speaker: "player", text: "那就换我拖你一次。走吧，回家再说。" },
    ],
    next: "result",
  },
  result: {
    id: "result",
    chapter: 11,
    title: "你的恋爱人格",
    kind: "result",
  },
};

export const ENTRY_SCENE = "splash";
