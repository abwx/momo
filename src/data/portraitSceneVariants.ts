import { PORTRAIT_FILES } from "@/data/characterArt";
import type { Choice, SceneBinary, ScenePhone, SceneVN, VnSpeaker } from "@/types/game";
import {
  ringCh1Open,
  ringCh1b,
  ringCh1Pulse,
  ringCh2,
  ringCh2After,
  ringCh2Breathe,
  ringCh2Mid,
  ringCh3Key,
  ringCh3Snack,
  ringCh4,
  ringCh5,
  ringCh6,
  ringDream,
  ringDreamGate,
  ringEvening,
  ringJournal,
  ringPhoneRumor,
} from "@/data/portraitLabelRings";

export function portraitIdx(portraitFile: string): number {
  const i = PORTRAIT_FILES.indexOf(portraitFile as (typeof PORTRAIT_FILES)[number]);
  return i < 0 ? 0 : i;
}

const PL = ["操场看台", "教学楼侧门", "图书馆三楼", "广播站门口", "食堂二楼靠窗", "音乐教室走廊", "校史馆后门", "单车棚"];
const EV = ["文艺汇演", "校庆彩排", "班歌预赛", "社团联排", "中秋晚会", "元旦游园"];
const SN = ["四月", "初夏", "晚秋", "冬天下第一场雨后"];

function relabel(base: Choice[] | undefined, byId: Record<string, string>): Choice[] | undefined {
  if (!base) return base;
  return base.map((c) => (byId[c.id] ? { ...c, label: byId[c.id]! } : c));
}

function line(s: VnSpeaker, text: string) {
  return { speaker: s, text };
}

export function applyPortraitToVn(scene: SceneVN, portraitFile: string): SceneVN {
  const i = portraitIdx(portraitFile);
  const place = PL[i % PL.length];
  const ev = EV[i % EV.length];
  const sn = SN[i % SN.length];

  switch (scene.id) {
    case "ch1_open": {
      const lines = [
        line(
          "narrator",
          `窗外的风把${sn}吹进走廊——你和{{对方}}总爱在${place}分一副耳机，也在草稿纸背面写同一句玩笑。`,
        ),
        scene.lines[1]!,
        line(
          "partner",
          `喂{{称呼}}，${ev}那场……你真不来？我比这周的周练还紧张。`,
        ),
      ];
      return { ...scene, lines, choices: relabel(scene.choices, ringCh1Open(i)) ?? scene.choices };
    }
    case "ch1b": {
      const lines = [
        line("narrator", `后台灯还没全亮，${place}那边传来彩排声。他把汗擦在袖口，却还在对你笑。`),
        line(
          "partner",
          i % 2 === 0
            ? "要是我忘词了……你就对口型，当我的人形提词器。"
            : "等会儿上台，我一眼就能在人群里找到你——别乱跑。",
        ),
      ];
      return { ...scene, lines, choices: relabel(scene.choices, ringCh1b(i)) ?? scene.choices };
    }
    case "ch1_journal": {
      return { ...scene, choices: relabel(scene.choices, ringJournal(i)) ?? scene.choices };
    }
    case "ch1_pulse": {
      const lines = [
        line(
          "narrator",
          `铃声没落尽，你在${place}旁多停三秒——脑海里全是他刚才躲开视线的那一下。`,
        ),
        line("player", scene.lines[1]!.text),
      ];
      return { ...scene, lines, choices: relabel(scene.choices, ringCh1Pulse(i)) ?? scene.choices };
    }
    case "ch1_draft": {
      const lines = [
        line(
          "narrator",
          `他把明天的走位描在彩排表背面——墨迹在${place}借来的灯光下一点点晕开，像怕正式纸太干净。`,
        ),
        scene.lines[1]!,
        scene.lines[2]!,
      ];
      return { ...scene, lines };
    }
    case "ch2_station": {
      const lines = [
        line(
          "narrator",
          `末班车广播和${ev}的预告叠在一起。城市把「再见」说得很轻，却把你们在${place}养成的默契说得很重。`,
        ),
        scene.lines[1]!,
        scene.lines[2]!,
      ];
      return { ...scene, lines };
    }
    case "ch3_warmup": {
      const lines = [
        line(
          "narrator",
          `你把日历翻过去又翻回来——像想确认：那些被删掉的空白里，是不是也删掉了他。`,
        ),
        line(
          "player",
          `${place}的灯一亮一灭，像心跳。你忽然明白：等待也会把人练成另一种艺人。`,
        ),
        line(
          "narrator",
          `而他在更亮的灯里学微笑、学停顿、学把情绪藏进节拍——也学把「想你」压成一条更短的语音。`,
        ),
        scene.lines[3]!,
      ];
      return { ...scene, lines };
    }
    case "ch3_rooftop": {
      const lines = [
        line(
          "narrator",
          `你们找到一处没有镜头的地方。${sn}的夜风把城市的灯吹得像倒过来的星海。`,
        ),
        scene.lines[1]!,
        scene.lines[2]!,
      ];
      return { ...scene, lines };
    }
    case "ch4_letter": {
      const lines = [
        line(
          "narrator",
          `你在备忘录里写下一封不会寄出的信——每个字都像在练习：如何把「我需要你」说得体面，像在${place}写检讨那样认真。`,
        ),
        scene.lines[1]!,
        scene.lines[2]!,
      ];
      return { ...scene, lines };
    }
    case "ch5_afterglow": {
      const lines = [
        line(
          "narrator",
          `人群像潮水退去，签名笔的墨味还在空气里。你想起第一次在${place}等他散场的那种心情——原来没变。`,
        ),
        scene.lines[1]!,
        scene.lines[2]!,
      ];
      return { ...scene, lines };
    }
    case "ch6_stoop": {
      const lines = [
        line(
          "narrator",
          `车开走了，世界终于把音量调小。你们坐在${place}附近的台阶上，像回到很久以前——只是沉默里多了点成年人的分寸。`,
        ),
        scene.lines[1]!,
        scene.lines[2]!,
      ];
      return { ...scene, lines };
    }
    case "ch2": {
      const lines = [
        line(
          "narrator",
          `高三这年，课表、月考、社团表叠成一张网。他却开始在${place}练习「另一种人生」。`,
        ),
        scene.lines[1]!,
        line(
          "partner",
          i % 3 === 0
            ? "如果我真的走了……你会不会觉得我很自私？"
            : "如果我去追那个梦……你会不会觉得，我把你丢在原地？",
        ),
      ];
      return { ...scene, lines, choices: relabel(scene.choices, ringCh2(i)) ?? scene.choices };
    }
    case "ch4": {
      const lines = [
        line(
          "narrator",
          `聚光灯像潮水。你在人群里突然明白：喜欢一个人的方式，也要在${place}这种「普通日常」里长大。`,
        ),
        line(
          "partner",
          `公司想让我立「单身人设」。我知道很荒谬……可我还是想问你：${ev}之后，我们还算「同校那种熟」吗？`,
        ),
      ];
      return { ...scene, lines, choices: relabel(scene.choices, ringCh4(i)) ?? scene.choices };
    }
    case "ch5": {
      const lines = [
        line("narrator", `签售队伍像一条河。你递上专辑，像无数个陌生人一样——却又像在${place}递过纸条那样熟。`),
        line(
          "partner",
          i % 2 === 0
            ? "（抬眼一愣，又迅速职业化地笑）谢谢支持……今天也要开心哦。"
            : "（愣了半秒，职业化地笑）谢谢支持……下一位。",
        ),
      ];
      return { ...scene, lines, choices: relabel(scene.choices, ringCh5(i)) ?? scene.choices };
    }
    case "dream": {
      const lines = [
        line(
          "narrator",
          `那晚你梦见同一道光，耳边却换成${place}的风声与${ev}的鼓点。你更想抓住哪一种声音？`,
        ),
      ];
      return { ...scene, lines, choices: relabel(scene.choices, ringDream(i)) ?? scene.choices };
    }
    default:
      return scene;
  }
}

export function applyPortraitToPhone(scene: ScenePhone, portraitFile: string): ScenePhone {
  const i = portraitIdx(portraitFile);
  const place = PL[i % PL.length];
  const ev = EV[i % EV.length];

  switch (scene.id) {
    case "ch1_evening": {
      const messages = [
        { from: "partner" as const, text: "{{称呼}}，今天谢谢你。", delayMs: 400 },
        {
          from: "partner" as const,
          text: `我在${place}旁边小卖部买了两瓶汽水——你要哪瓶？`,
          delayMs: 500,
        },
        { from: "player" as const, text: "都要。你先欠我一瓶。", delayMs: 300 },
      ];
      return { ...scene, messages, choices: relabel(scene.choices, ringEvening(i)) ?? scene.choices };
    }
    case "ch1_platform": {
      const messages = [
        { from: "partner" as const, text: "{{称呼}}，我到家门口了。", delayMs: 450 },
        {
          from: "partner" as const,
          text: `刚才在${place}路灯下面……我突然很想问：你会不会有一天，嫌我太吵、太黏、太不稳定？`,
          delayMs: 620,
        },
        { from: "player" as const, text: scene.messages[2]!.text, delayMs: 380 },
      ];
      return { ...scene, messages };
    }
    case "ch2_breathe": {
      const messages = [
        { from: "partner" as const, text: "{{称呼}}，我到楼下了。", delayMs: 400 },
        {
          from: "partner" as const,
          text: `刚才在${place}那边练到一半又卡住了……想听你一句实话。`,
          delayMs: 520,
        },
        { from: "player" as const, text: scene.messages[2]!.text, delayMs: 380 },
      ];
      return { ...scene, messages, choices: relabel(scene.choices, ringCh2Breathe(i)) ?? scene.choices };
    }
    case "ch2_phone_rumor": {
      const messages = [
        { from: "partner" as const, text: "{{称呼}}在吗", delayMs: 400 },
        {
          from: "partner" as const,
          text: `有人拍到我在${place}附近和队友走太近……我知道是假的，但怕你被卷进来。`,
          delayMs: 520,
        },
        { from: "partner" as const, text: "你要是很烦……我可以先不回你，让你清净。", delayMs: 500 },
      ];
      return { ...scene, messages, choices: relabel(scene.choices, ringPhoneRumor(i)) ?? scene.choices };
    }
    case "ch3_corridor": {
      const messages = [
        { from: "partner" as const, text: "{{称呼}}，名单还没公布。", delayMs: 500 },
        {
          from: "partner" as const,
          text: `我在${place}走廊来回走了三趟……突然很想问：如果我上去了，你会不会觉得我更远了？`,
          delayMs: 700,
        },
        { from: "player" as const, text: scene.messages[2]!.text, delayMs: 400 },
      ];
      return { ...scene, messages };
    }
    case "ch3_key": {
      const messages = [
        {
          from: "partner" as const,
          text: `{{称呼}}，${ev}前一晚……你还没睡吗？`,
          delayMs: 600,
        },
        { from: "partner" as const, text: "我有点怕。", delayMs: 900 },
        {
          from: "partner" as const,
          text: "怕明天站上去会发抖……也怕你会觉得我不值得被喜欢。",
          delayMs: 700,
        },
      ];
      return { ...scene, messages, choices: relabel(scene.choices, ringCh3Key(i)) ?? scene.choices };
    }
    case "ch3_snack": {
      const messages = [
        { from: "partner" as const, text: `给你丢个定位：${place}楼下便利店。`, delayMs: 450 },
        {
          from: "partner" as const,
          text: "关东煮还剩两串……你要不要？我顺便帮你占个座。",
          delayMs: 550,
        },
        { from: "player" as const, text: "要。顺便帮我带包纸巾。", delayMs: 350 },
      ];
      return { ...scene, messages, choices: relabel(scene.choices, ringCh3Snack(i)) ?? scene.choices };
    }
    case "ch5_dressing": {
      const messages = [
        { from: "partner" as const, text: "{{称呼}}，我快上台了。", delayMs: 400 },
        {
          from: "partner" as const,
          text: `刚才在${place}化妆间门口……梦里那句「想见你」我发出去又撤回三次。你会不会觉得我很怂？`,
          delayMs: 650,
        },
        { from: "player" as const, text: scene.messages[2]!.text, delayMs: 380 },
      ];
      return { ...scene, messages };
    }
    case "ch6": {
      const messages = [
        { from: "partner" as const, text: "今天……对不起。", delayMs: 500 },
        {
          from: "partner" as const,
          text: `回程车上我一直在想：在${place}等我的那个人，会不会后悔。`,
          delayMs: 600,
        },
        { from: "partner" as const, text: "{{称呼}}，你会后悔认识现在这个我吗？", delayMs: 800 },
      ];
      return { ...scene, messages, choices: relabel(scene.choices, ringCh6(i)) ?? scene.choices };
    }
    case "ch2_quiet_lane": {
      const messages = [
        { from: "partner" as const, text: "{{称呼}}。", delayMs: 600 },
        {
          from: "partner" as const,
          text: `你那句话……我在${place}那边反复读了好几遍。`,
          delayMs: 700,
        },
        { from: "partner" as const, text: "我会努力的。为了不让你……白等。", delayMs: 800 },
      ];
      return { ...scene, messages };
    }
    default:
      return scene;
  }
}

export function applyPortraitToBinary(scene: SceneBinary, portraitFile: string): SceneBinary {
  const i = portraitIdx(portraitFile);
  const place = PL[i % PL.length];
  const ev = EV[i % EV.length];
  const mid = ringCh2Mid(i);
  const aft = ringCh2After(i);
  const dg = ringDreamGate(i);

  switch (scene.id) {
    case "ch2_mid": {
      return {
        ...scene,
        prompt: `放学铃刚响，他把耳机分你一半，里面在放你们常听的那首。路过${place}时，你更想——`,
        left: { ...scene.left, label: mid.left },
        right: { ...scene.right, label: mid.right },
      };
    }
    case "ch2_after": {
      return {
        ...scene,
        prompt: `你路过${place}，看见他对着镜子抠同一个动作。你会——`,
        left: { ...scene.left, label: aft.left },
        right: { ...scene.right, label: aft.right },
      };
    }
    case "dream_gate": {
      return {
        ...scene,
        prompt: `梦醒后，{{对方}}发来一句：「${ev}结束想见你。」你更想——`,
        left: { ...scene.left, label: dg.dgL },
        right: { ...scene.right, label: dg.dgR },
      };
    }
    default:
      return scene;
  }
}
