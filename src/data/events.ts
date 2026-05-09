import type { Character } from './characters';

export type GameEventType = 'CHOICE' | 'PICK_TWO' | 'RANKING';

export interface GameEvent {
  id: string;
  type: GameEventType;
  title: string;
  description: string;
  choices: any;
}

export interface Choice {
  text: string;
  action: (characters: Character[]) => string;
}

const randomResult = (successChance: number) => Math.random() < successChance;

// --- 动态文案工具库 ---
const getChoiceText = (type: string, char: Character) => {
  const templates: Record<string, string[]> = {
    CENTER: [
      `让众望所归的 ${char.name} 稳坐 C 位，保住基本盘。`,
      `赌一把 ${char.name} 的舞台爆发力，制造“断层”名场面。`,
      `钦定 ${char.name} 开启逆袭剧本，让全网见证黑马诞生。`,
      `以 ${char.name} 为核心构建视觉重心，强化团队初印象。`
    ],
    BRAND: [
      `看中 ${char.name} 的高冷气质，向顶级时尚资源发起冲击。`,
      `利用 ${char.name} 的国民亲和力，争取品牌大众代言。`,
      `押注 ${char.name} 的电影脸，在试镜中用硬照实力说话。`,
      `推举时尚感爆棚的 ${char.name}，试图刷新全团商务逼格。`
    ],
    VARIETY: [
      `派 ${char.name} 去综艺刷脸，利用其性格魅力圈粉。`,
      `让 ${char.name} 展现私下反差萌，在慢综艺中建立人设。`,
      `靠 ${char.name} 的临场反应撑起场面，在真人秀里抢镜头。`,
      `推荐 ${char.name} 跨界出击，用真实的少年感征服路人。`
    ],
    DANCE: [
      `派舞蹈机器 ${char.name} 开启杀手锏模式，血洗舞池。`,
      `利用 ${char.name} 极具张力的肢体表达，在 Battle 中绝杀。`,
      `让 ${char.name} 展示苦练的技巧，用实力堵住黑粉的嘴。`,
      `推荐 ${char.name} 领舞，通过极具观赏性的动作收割关注。`
    ],
    VOCAL: [
      `让主唱担当 ${char.name} 开启“消音审判”模式，惊艳全场。`,
      `派 ${char.name} 挑战超高难度曲目，展现职业级唱功。`,
      `推举音色流 ${char.name} 演绎深情片段，在和声中突围。`,
      `钦点 ${char.name} 领衔高音部分，用业务能力为全团正名。`
    ]
  };

  const pool = templates[type] || [`选择 ${char.name} 进行下一步。`];
  // 使用 ID 产生相对固定的随机索引，避免在同一事件中出现重复描述
  const index = (char.id.length + char.name.length) % pool.length;
  return pool[index];
};

// --- 核心事件池 (20+ 事件) ---

export const event_c_position: GameEvent = {
  id: 'event-c-position',
  type: 'CHOICE',
  title: '主题曲 Center 席位之争',
  description: '聚光灯下的核心位不仅是荣耀，更是压力。你必须决定，是将这份权力交给目前的人气王，还是亲手书写一段“黑马突围”的佳话？',
  choices: (candidates: Character[]) => candidates.map(char => {
    const isTop = char.popularity > 85;
    return {
      text: getChoiceText('CENTER', char),
      action: (chars: Character[]) => {
        const target = chars.find(c => c.id === char.id)!;
        if (randomResult(isTop ? 0.75 : 0.4)) {
          target.popularity += isTop ? 15 : 35;
          return isTop 
            ? `果然，${target.name} 的 Center 舞台稳如磐石。#初C众望所归# 登顶热搜，品牌方纷纷发来意向单，这波基本盘彻底稳住了！`
            : `你创造了内娱奇迹！${target.name} 在公演中超常发挥，那种“一定要被看见”的眼神极具感染力，全网都在问“那个黑马是谁”！`;
        } else {
          target.popularity -= 12;
          return isTop
            ? `意料之外的翻车！${target.name} 或许是因为压力太大，舞台表现显得紧绷且呆板。路人吐槽“德不配位”，其他选手的粉丝开始集体质疑。`
            : `逆袭剧本宣告失败。${target.name} 在高强度的核心位训练下力不从心，公演舞台被评价为“接不住戏”，这次大胆的尝试反而让他陷入了群嘲。`;
        }
      }
    };
  })
};

export const event_scandal_01: GameEvent = {
  id: 'event-scandal-01',
  type: 'CHOICE',
  title: '深夜炸弹：陈年旧料被搬运',
  description: '凌晨两点，某匿名论坛突然流出 ${random_char} 练习生时期的模糊合照，带节奏者直指其“私生活混乱”。公关黄金 4 小时正在倒计时，全网黑粉已就位。',
  choices: (candidates: Character[]) => {
    const target = candidates[0];
    return [
      { 
        text: `【雷霆手段】动用律师函强硬辟谣，起诉首发营销号。`, 
        action: (chars) => {
          const c = chars.find(ch => ch.id === target.id)!;
          if (randomResult(0.6)) {
            c.popularity += 15;
            return `公关教科书！公司第一时间保护艺人的姿态赢得了极高评价，${c.name} 的粉丝凝聚力因这次风波反而增强了，黑粉被暂时压制。#保护最好的${c.name}# 登顶。`;
          } else {
            c.popularity -= 15;
            return `用力过猛。声明被指责为“恐吓网友”，黑粉挖出了更多真假难辨的细节进行反击，${c.name} 的路人好感度跌至谷底。`;
          }
        } 
      },
      { 
        text: `【柔性化解】发布 ${target.name} 的深夜练舞花絮，侧面展现其纯粹。`, 
        action: (chars) => {
          const c = chars.find(ch => ch.id === target.id)!;
          c.popularity += 10;
          return `稳健的策略。粉丝有组织地用安利文案“控评”，路人看到少年挥汗如雨的画面也逐渐散去。一场危机被无形中消解。`;
        } 
      },
      {
        text: `【抓马反击】暗示合照为竞争对手恶意拼接，引导粉圈大混战。`,
        action: (chars) => {
          const c = chars.find(ch => ch.id === target.id)!;
          c.popularity += 20;
          chars.forEach(char => { if(char.id !== target.id) char.popularity -= 5; });
          return `场面极其抓马！粉圈彻底炸锅，各家粉丝开启“混战模式”。${c.name} 的热度爆表，虽然口碑两极分化，但流量确实拉满了。`;
        }
      },
      {
        text: `【网感自黑】让艺人发微博：“是的，我们有个孩子（指猫）”，用幽默解构危机。`,
        action: (chars) => {
          const c = chars.find(ch => ch.id === target.id)!;
          if (randomResult(0.8)) {
            c.popularity += 25;
            return `神级公关！这种极具网感的自黑瞬间化解了戾气。网友纷纷表示“这性格我粉了”，${c.name} 喜提“内娱活人”称号。`;
          } else {
            c.popularity -= 10;
            return `弄巧成拙。网友认为这种严肃事件不该开玩笑，吐槽公司“把观众当傻子”。`;
          }
        }
      }
    ]
  }
};

export const event_variety_duo_01: GameEvent = {
  id: 'event-variety-duo-01',
  type: 'PICK_TWO',
  title: '《王牌搭档》飞行嘉宾邀约',
  description: '一档主打“化学反应”的顶流双人综艺发来邀请。在内娱，选对 CP 就等于赢了一半。你决定派谁去收割这波红利？',
  choices: {
    action: (char1: Character, char2: Character) => {
      // 优化逻辑：大幅提升基础成功率 (从 0.45 提升至 0.7)
      const isGoodMatch = (char1.personality === '喜剧人' && char2.personality === '喜剧人') || 
                         (char1.personality === '高情商' && char2.personality === '内秀舞担') ||
                         (char1.personality === 'ACE候补' && char2.personality === 'ACE候补');
      if (randomResult(isGoodMatch ? 0.95 : 0.7)) {
        char1.popularity += 25; char2.popularity += 25;
        return `节目效果爆炸！${char1.name} 和 ${char2.name} 在节目中的互补感绝了，“这对神仙组合”的切片在短视频平台疯狂刷屏，CP 粉原地过年！`;
      } else {
        char1.popularity -= 5; char2.popularity -= 5;
        return `糟糕的营业。两人在节目中显得客气且疏离，尴尬的互动被网友做成了表情包嘲讽，观众评价“完全看不出是队友”。`;
      }
    }
  }
};

export const event_vlog_ranking: GameEvent = {
  id: 'event-vlog-ranking',
  type: 'RANKING',
  title: '福利时间：宿舍生活 Vlog 剪辑权',
  description: '这期 Vlog 是粉丝了解成员私下状态的唯一窗口。请通过排序决定谁是本期的“主视角”，谁又是“背景板”？',
  choices: {
    action: (rankedChars: Character[]) => {
      const [c1, c2, c3, c4, c5] = rankedChars;
      c1.popularity += 20; c2.popularity += 15; c3.popularity += 8;
      c4.popularity -= 5; c5.popularity -= 10;
      return `Vlog 播出后，主视角 ${c1.name} 的反差萌性格迅速圈粉。但排在末尾的 ${c5.name} 粉丝已经在公司官博下开始了大规模的“维权维镜”。`;
    }
  }
};

export const event_brand_deal: GameEvent = {
  id: 'event-brand-deal',
  type: 'CHOICE',
  title: '高奢品牌全球大使试镜',
  description: '某国际顶奢品牌正在寻找具备“高级感”的面孔。这不仅是时尚资源的飞跃，更是咖位的象征。全网盯着这块肥肉，稍有不慎就会被嘲“越阶”。',
  choices: (candidates: Character[]) => candidates.slice(0, 4).map(char => ({
    text: getChoiceText('BRAND', char),
    action: (chars: Character[]) => {
      const target = chars.find(c => c.id === char.id)!;
      const isFashionable = target.personality === '佛系贵公子' || target.personality === '懵懂门面';
      if (randomResult(isFashionable ? 0.8 : 0.4)) {
        target.popularity += 30;
        return `拿下！${target.name} 的表现力获得了品牌方的高度赞赏。官宣当天，全团的时尚指数被瞬间拔高，这就是传说中的“高奢脸”吧。`;
      } else {
        target.popularity -= 5;
        return `遗憾落选。品牌方认为 ${target.name} 的气质过于“幼态”或“偶像感太重”，与品牌调性不符。黑粉已经开始嘲讽其“强行越阶”了。`;
      }
    }
  }))
};

export const event_training_injury: GameEvent = {
  id: 'event-training-injury',
  type: 'CHOICE',
  title: '突发：二公排练意外受伤',
  description: '人气选手 ${random_char} 在练习高难度动作时严重崴脚，距离正式录制仅剩 48 小时。此时唯恐天下不乱的营销号已经开始发通稿暗示“队内排挤”。',
  choices: (candidates: Character[]) => {
    const target = candidates[0];
    return [
      {
        text: `【带伤上阵】打封闭坚持演出，强化“热血努力”人设。`,
        action: (chars) => {
          const c = chars.find(ch => ch.id === target.id)!;
          if (randomResult(0.7)) {
            c.popularity += 25;
            return `${c.name} 在舞台上忍痛跳完最后一步的画面成了当晚的最高光。粉丝哭碎了心，#某某带伤舞台# 成了全团最出圈的虐粉点。`;
          } else {
            c.popularity -= 15;
            return `太冒险了。因为伤势严重，${c.name} 在舞台上出现了明显的重心不稳，甚至带乱了整体队形。网友评价“不顾团队，只有自己”。`;
          }
        }
      },
      {
        text: `【修改方案】临时将舞台改为静态演唱，全团配合其伤势。`,
        action: (chars) => {
          chars.forEach(c => c.popularity += 10);
          return `虽然舞台观赏性有所下降，但这种“全团共进退”的举动极大增强了团粉的归属感。全员人气稳健上涨。`;
        }
      },
      {
        text: `【粉圈虐粉】空降粉丝群语音，用沙哑的声音安慰粉丝，收割怜爱。`,
        action: (chars) => {
          const c = chars.find(ch => ch.id === target.id)!;
          c.popularity += 20;
          return `虐粉神技！${c.name} 的语音被粉丝疯狂转发，路人看了都觉得心疼。粉丝打榜的热情被瞬间点燃，“一定要把他送出道”成了口号。`;
        }
      },
      {
        text: `【网感营销】在小号发一张“坚强小狗”表情包，并配文：问题不大。`,
        action: (chars) => {
          const c = chars.find(ch => ch.id === target.id)!;
          c.popularity += 15;
          return `这种轻松幽默的网感姿态极受路人欢迎。不仅辟谣了“队内排挤”，还树立了一个乐观强大的形象，涨粉效果意外地好。`;
        }
      }
    ]
  }
};

export const event_collab_stage: GameEvent = {
  id: 'event-collab-stage',
  type: 'PICK_TWO',
  title: '重磅：与顶级前辈的联袂舞台',
  description: '跨年盛典需要派两名成员与歌坛天后同台。这不仅是提咖的机会，更是展现唱功的生死场。',
  choices: {
    action: (char1: Character, char2: Character) => {
      const isVocalPower = char1.personality === 'ACE候补' || char2.personality === 'ACE候补';
      if (randomResult(isVocalPower ? 0.85 : 0.5)) {
        char1.popularity += 25; char2.popularity += 25;
        return `完美契合！${char1.name} 和 ${char2.name} 的和声竟然没有被天后盖住。#某某神仙唱功# 霸占趋势榜第一，国民度大幅跃升！`;
      } else {
        char1.popularity -= 10; char2.popularity -= 10;
        return `处处透着尴尬。两人在天后的气场压制下显得战战兢兢，甚至出现了破音。路人评价“完全接不住，白瞎了这么好的机会”。`;
      }
    }
  }
};

export const event_live_stream_accident: GameEvent = {
  id: 'event-live-stream-accident',
  type: 'CHOICE',
  title: '惊魂：直播间麦克风未关',
  description: '直播结束后的 30 秒内，后台收音设备记录下了成员们的私下谈话。此时，5 万名观众还没退出直播间，一段足以改变团队命运的对话正在流出。',
  choices: [
    {
      text: '【真心剖白】内容是成员们对刚才舞台瑕疵的自责和互相打气。',
      action: (chars) => {
        chars.forEach(c => c.popularity += 18);
        return `这种“意外”流出的真挚情感让路人瞬间破防。全团口碑大幅逆转，粉丝凝聚力达到了前所未有的高度。#团魂炸裂# 屠榜。`;
      }
    },
    {
      text: '【逗趣互损】内容是成员们毫无包袱的模仿和打闹。',
      action: (chars) => {
        chars.forEach(c => c.popularity += 12);
        return `这种真实的性格魅力让网友直呼“这就是我想看的少年感”。全员喜剧人的人设坐稳了，商业价值上升。`;
      }
    },
    {
      text: '【抓马反转】对话中透露了某个未公开的“大惊喜”计划，引发全网猜测。',
      action: (chars) => {
        chars.forEach(c => c.popularity += 15);
        return `这波营销绝了！全网都在扒那个惊喜到底是什么，团队的讨论度瞬间拉满，成为了当周最受关注的话题中心。`;
      }
    },
    {
      text: '【粉圈CP】录到了两名成员极其自然的亲密互动，CP粉原地过年。',
      action: (chars) => {
        chars.forEach(c => c.popularity += 20);
        return `CP粉狂欢！这段“未公开糖点”在短视频平台疯狂刷屏，CP的热度带动了整个团的关注度，吸金能力直线上升。`;
      }
    }
  ]
};

export const event_fan_gift_crisis: GameEvent = {
  id: 'event-fan-gift-crisis',
  type: 'CHOICE',
  title: '舆情：应援礼品价值争议',
  description: '大粉送给 ${random_char} 的昂贵私人物品被曝光，引发了关于艺人收受奢侈礼品的负面讨论。黑粉趁机带节奏：“这还没出道就开始割韭菜了？”',
  choices: (candidates: Character[]) => {
    const target = candidates[0];
    return [
      {
        text: `【全部退回】官方出面统一退回所有贵重礼品，重申禁收令。`,
        action: (chars) => {
          const c = chars.find(ch => ch.id === target.id)!;
          c.popularity += 15;
          return `这种清醒的姿态获得了官方媒体的点赞。虽然站姐有些伤心，但 ${c.name} 在大众眼中的形象变得高级且自律。`;
        }
      },
      {
        text: `【低调处理】让艺人在小号晒出日常使用的平价礼品，引导舆论。`,
        action: (chars) => {
          const c = chars.find(ch => ch.id === target.id)!;
          c.popularity -= 5;
          return `这种做法被黑粉识破并嘲讽为“又立又当”。讨论度虽然降下去了，但 ${c.name} 的信誉度出现了一丝裂痕。`;
        }
      },
      {
        text: `【粉圈反转】暗示该礼品实为艺人自购，站姐只是代购，顺便营销“富二代”人设。`,
        action: (chars) => {
          const c = chars.find(ch => ch.id === target.id)!;
          c.popularity += 25;
          return `人设站稳了！#某某人间富贵花# 冲上热搜，网友纷纷感叹“果然长了一张不差钱的脸”，这种反差感极具商业吸引力。`;
        }
      },
      {
        text: `【抓马跨界】将礼品拍卖并全额捐赠公益，邀请大粉共同参与。`,
        action: (chars) => {
          const c = chars.find(ch => ch.id === target.id)!;
          c.popularity += 30;
          return `公关天花板！不仅化解了危机，还带飞了整个团的国民度。#某某和粉丝一起做公益# 被主流媒体转发点赞，格局瞬间拉满。`;
        }
      }
    ]
  }
};

export const event_variety_guest: GameEvent = {
  id: 'event-variety-guest',
  type: 'CHOICE',
  title: '单兵作战：热门慢综艺常驻邀请',
  description: '某档高口碑慢综艺需要一名常驻嘉宾，这对提升路人缘和国民度极其关键。各家粉丝已经在工作室评论区“开撕”，要求公司公平对待。',
  choices: (candidates: Character[]) => candidates.slice(0, 4).map(char => ({
    text: getChoiceText('VARIETY', char),
    action: (chars: Character[]) => {
      const target = chars.find(c => c.id === char.id)!;
      const isGoodFit = char.personality === '高情商' || char.personality === '佛系贵公子' || char.personality === '喜剧人';
      if (randomResult(isGoodFit ? 0.8 : 0.4)) {
        target.popularity += 25;
        return `大获成功！${target.name} 在节目中展现的性格魅力简直是“吸粉利器”。路人纷纷感叹“这个小伙子真不错”，国民度稳步提升。`;
      } else {
        target.popularity -= 5;
        return `反响平平。${target.name} 在节目中话太少，剪辑出来的镜头屈指可数。虽然没出错，但也完全没有起到圈粉的作用，浪费了一个好机会。`;
      }
    }
  }))
};

export const event_airport_fashion: GameEvent = {
  id: 'event-airport-fashion',
  type: 'PICK_TWO',
  title: '时尚生死场：全团首次机场私服',
  description: '机场生图是衡量艺人时尚潜力的第一标准。你决定重点打造哪两名成员的穿搭？',
  choices: {
    action: (char1: Character, char2: Character) => {
      const isFashionable = char1.personality === '佛系贵公子' || char2.personality === '懵懂门面';
      // 提升基础成功率 (从 0.45 提升至 0.75)
      if (randomResult(isFashionable ? 0.95 : 0.75)) {
        char1.popularity += 18; char2.popularity += 18;
        return `生图出圈！#某某机场私服# 瞬间霸占时尚广场，大牌公关纷纷开始询问两人的合作档期。`;
      } else {
        char1.popularity -= 5; char2.popularity -= 5;
        return `用力过猛。两人的穿搭被评价为“像精神小伙”，土味文案在时尚圈流传，对后续高端资源的获取产生了不利影响。`;
      }
    }
  }
};

export const event_mr_removed_vocal: GameEvent = {
  id: 'event-mr-removed-vocal',
  type: 'RANKING',
  title: '硬核审判：全网疯传的消音视频',
  description: '这期打歌舞台的消音视频（MR Removed）被放了出来，成员们的真实唱功暴露无遗。请通过排序决定谁的“开麦稳度”最高？',
  choices: {
    action: (rankedChars: Character[]) => {
      const [c1, c2, c3, c4, c5] = rankedChars;
      c1.popularity += 25; c2.popularity += 15; c3.popularity += 5;
      c4.popularity -= 10; c5.popularity -= 20;
      return `${c1.name} 的全开麦表现惊艳了所有人，被封为“四代大主唱”。而排在末尾的 ${c5.name} 则因为气息不稳遭到了全网嘲讽。`;
    }
  }
};

export const event_dance_battle: GameEvent = {
  id: 'event-dance-battle',
  type: 'PICK_TWO',
  title: '挑战：街舞竞技节目的 Battle 环节',
  description: '为了展现团队硬实力，你需要派出两名成员参加顶流街舞节目的 Battle 录制。',
  choices: {
    action: (char1: Character, char2: Character) => {
      const isDancer = char1.personality === '内秀舞担' || char2.personality === '内秀舞担';
      if (randomResult(isDancer ? 0.9 : 0.5)) {
        char1.popularity += 28; char2.popularity += 20;
        return `炸裂！${char1.name} 的地板动作直接让全场沸腾。#四代舞力天花板# 登顶热搜，实力口碑彻底打响！`;
      } else {
        char1.popularity -= 12; char2.popularity -= 8;
        return `惨败。在职业舞者的压制下，两人的动作显得非常稚嫩，甚至出现了明显的失误。网友评价“这种水平也敢叫舞担？”`;
      }
    }
  }
};

export const event_audition_chance: GameEvent = {
  id: 'event-audition-chance',
  type: 'CHOICE',
  title: '跨界：知名导演的古装剧试镜',
  description: '一个热门古装 IP 正在寻找男配。虽然只是客串，但这是进入影视圈的最佳跳板。粉丝已经在超话疯狂安利自家的“神颜”，希望能被导演看中。',
  choices: (candidates: Character[]) => candidates.slice(0, 4).map(char => ({
    text: `押注颜值优势，派 ${char.name} 去导演组试戏。`,
    action: (chars: Character[]) => {
      const target = chars.find(c => c.id === char.id)!;
      const isActorLook = char.personality === '懵懂门面' || char.personality === '佛系贵公子';
      if (randomResult(isActorLook ? 0.75 : 0.45)) {
        target.popularity += 22;
        return `试镜成功！导演评价其“天生一张电影脸”。官宣后的定妆照瞬间刷屏，成功收割了大批颜粉，转型之路首战告捷。`;
      } else {
        target.popularity -= 5;
        return `遗憾落选。导演认为其“偶像味太重”，无法融入角色。这次失败让部分粉丝对艺人的未来转型路径感到了一丝忧虑。`;
      }
    }
  }))
};

export const event_training_vlog_accident: GameEvent = {
  id: 'event-training-vlog-accident',
  type: 'CHOICE',
  title: '突发：练习室争吵画面误入 Vlog',
  description: '在最新的 Vlog 中，剪辑师疏忽，剪进了 ${random_char} 与队友激烈争论舞蹈细节的画面。这段视频在 10 分钟内播放量破百万，全网都在讨论“皇族霸凌”。',
  choices: [
    {
      text: '【大方回应】发布完整片段，展现成员对舞台的高要求和真实磨合过程。',
      action: (chars) => {
        chars.forEach(c => c.popularity += 15);
        return `反向操作成功！网友感叹“这才是真实的练习室，有碰撞才有进步”。这种不加修饰的真实感极大提升了好感度。`;
      }
    },
    {
      text: '【紧急下架】立刻删除视频并重新剪辑，发布道歉声明。',
      action: (chars) => {
        chars.forEach(c => c.popularity -= 8);
        return `这种心虚的做法引发了更多猜测。黑粉开始带节奏说“内部霸凌”，路人观感下降，粉丝之间也开始产生裂痕。`;
      }
    },
    {
      text: '【抓马营销】趁机推出“成员真心话”特别专题，将冲突转化为团魂。',
      action: (chars) => {
        chars.forEach(c => c.popularity += 25);
        return `神级反转！节目组顺势推出的深度访谈，让观众看到了少年们为了梦想的执着。原本的冲突变成了加分项，粉丝粘性大增。`;
      }
    },
    {
      text: '【网感公关】买通大 V 联动，将争吵解读为“业务讨论的良性内卷”，树立全员 ACE 形象。',
      action: (chars) => {
        chars.forEach(c => c.popularity += 20);
        return `这波网感营销极佳。不仅洗清了“霸凌”嫌疑，还让全网记住了这个团“实力强、肯拼命”的标签，路人盘迅速扩大。`;
      }
    }
  ]
};

export const event_solo_cover: GameEvent = {
  id: 'event-solo-cover',
  type: 'CHOICE',
  title: '机遇：首支个人翻唱作品发布',
  description: '为了展现成员个人特色，你决定在 B 站发布一支高质量的翻唱视频。这种垂直领域的展示是圈内“吸粉”的神器。',
  choices: (candidates: Character[]) => candidates.slice(0, 4).map(char => ({
    text: getChoiceText('VOCAL', char),
    action: (chars: Character[]) => {
      const target = chars.find(c => c.id === char.id)!;
      const isVocal = char.personality === 'ACE候补' || char.personality === '高情商';
      if (randomResult(isVocal ? 0.85 : 0.5)) {
        target.popularity += 20;
        return `惊艳全场！${target.name} 的独特唱腔赋予了老歌新生命。视频在 B 站迅速达成百万播放，吸引了大量垂直乐评人的关注 and 点赞。`;
      } else {
        target.popularity -= 5;
        return `反响平淡。虽然唱功在线，但缺乏个人辨识度和记忆点。在这个看脸又看个性的时代，平庸就是制作人最大的失败。`;
      }
    }
  }))
};

export const event_fan_project: GameEvent = {
  id: 'event-fan-project',
  type: 'CHOICE',
  title: '应援：站姐组织的无人机灯光秀',
  description: '核心成员 ${random_char} 的站姐斥巨资在市中心组织了无人机应援。这种排场极具话题度，但也容易引发“铺张浪费”的争议。黑粉已经开始在官媒下举报“非法集资”。',
  choices: (candidates: Character[]) => {
    const target = candidates[0];
    return [
      {
        text: `【高调认证】艺人在微博晒出认证照并感谢粉丝，引导正向话题。`,
        action: (chars) => {
          const c = chars.find(ch => ch.id === target.id)!;
          c.popularity += 15;
          return `艺人的双向奔赴让粉丝感动不已。#某某无人机灯光秀# 霸屏全城，排面拉满，人气大幅上涨。`;
        }
      },
      {
        text: `【官方劝导】以艺人名义呼吁粉丝理智消费，支持公益。`,
        action: (chars) => {
          const c = chars.find(ch => ch.id === target.id)!;
          c.popularity += 10;
          return `这种正能量的引导获得了主流媒体的点赞。虽然排面少了点，但 ${c.name} 的路人缘和国民度得到了扎实的提升。`;
        }
      },
      {
        text: `【粉圈联动】组织全团成员一起观看，营销“神仙友谊”。`,
        action: (chars) => {
          chars.forEach(c => c.popularity += 12);
          return `这波抓马营销绝了！全团在灯光秀下的合照瞬间刷屏，不仅平息了“唯粉独美”的争议，还吸了一大波团粉。`;
        }
      },
      {
        text: `【网感解构】发布无人机排练的各种“沙雕”废片，用幽默消解豪横感。`,
        action: (chars) => {
          const c = chars.find(ch => ch.id === target.id)!;
          c.popularity += 18;
          return `极具网感的公关！网友纷纷表示“这应援也太可爱了”，原本的“土豪”争议变成了“有趣”的谈资，路人缘爆棚。`;
        }
      }
    ]
  }
};

export const event_variety_clash: GameEvent = {
  id: 'event-variety-clash',
  type: 'PICK_TWO',
  title: '危机：综艺现场录制冲突',
  description: '在综艺录制中，两名成员因为分组问题与前辈艺人产生了小摩擦。现场导演非常不满。',
  choices: {
    action: (char1: Character, char2: Character) => {
      const hasHighEQ = char1.personality === '高情商' || char2.personality === '高情商';
      // 提升基础成功率 (从 0.4 提升至 0.7)
      if (randomResult(hasHighEQ ? 0.98 : 0.7)) {
        char1.popularity += 12; char2.popularity += 12;
        return `危机公关成功！多亏了其中一人的高情商斡旋，不仅化解了尴尬，还赢得了前辈的赞赏。这段互动成了节目的神来之笔。`;
      } else {
        char1.popularity -= 15; char2.popularity -= 15;
        return `灾难性录制。两人在现场显得局促且缺乏礼貌，这种不专业的表现被工作人员传到了网上，口碑遭到重创。`;
      }
    }
  }
};

export const event_dance_practice_vlog: GameEvent = {
  id: 'event-dance-practice-vlog',
  type: 'RANKING',
  title: '审美：练习室直拍版位分配',
  description: '这期练习室直拍将作为官方舞蹈视频发布。请排序决定谁在“核心领舞区”待的时间最长？',
  choices: {
    action: (rankedChars: Character[]) => {
      const [c1, c2, c3] = rankedChars;
      c1.popularity += 25; c2.popularity += 12; c3.popularity += 5;
      return `直拍发布后，领舞位 ${c1.name} 的精准卡点被做成了无数技术流视频。全网惊叹：“这个团的实力真的有点恐怖”。`;
    }
  }
};

export const event_debut_countdown: GameEvent = {
  id: 'event-debut-countdown',
  type: 'CHOICE',
  title: '最终期：出道夜预热方案',
  description: '出道夜就在眼前，成败在此一举。作为制作人，你决定将最后的宣传资源投放在哪个方向？各家站姐已经开始在场外疯狂圈地，气氛紧张到了极点。',
  choices: [
    {
      text: '【极致情怀】发布练习生时期的成长纪录片，主打“初心”。',
      action: (chars) => {
        chars.forEach(c => c.popularity += 15);
        return `全网破防！那些青涩且努力的画面让无数路人入坑。#陪某某一起长大# 成了当晚最感人的话题，团粉粘性达到巅峰。`;
      }
    },
    {
      text: '【实力震撼】提前释出高燃舞台预告，主打“职业进化”。',
      action: (chars) => {
        chars.forEach(c => c.popularity += 20);
        return `太燃了！这种超越新人的业务水平让所有人感到震撼。全网都在期待出道夜的正式爆发，团队期待值被拉到了历史最高点。`;
      }
    },
    {
      text: '【抓马反转】放出一段“出道位归属”的悬念预告，引导粉圈大乱斗。',
      action: (chars) => {
        chars.forEach(c => c.popularity += 25);
        return `这波营销极其抓马！各家粉丝为了保住自家偶像的出道位，打榜力度翻了三倍。热度爆表，但粉丝之间的火药味也达到了顶点。`;
      }
    },
    {
      text: '【网感直播】全员素颜开启深夜吃播，与粉丝进行“活人”互动。',
      action: (chars) => {
        chars.forEach(c => c.popularity += 18);
        return `这种极具网感的接地气方式大获好评。路人纷纷感叹“这团好真实”，国民好感度大幅提升，成功在出道前完成破圈。`;
      }
    }
  ]
};

export const event_variety_drama: GameEvent = {
  id: 'event-variety-drama',
  type: 'CHOICE',
  title: '抓马：综艺剪辑恶意带节奏',
  description: '最新一期综艺播出后，剪辑师为了热度，故意放大了 ${random_char} 的一个疲惫表情，引导网友认为其“耍大牌”。粉圈大粉已经开始带节奏要“撕碎”节目组。',
  choices: (candidates: Character[]) => {
    const target = candidates[0];
    return [
      {
        text: `【硬刚节目组】官博发声质疑剪辑逻辑，要求释放未删减花絮。`,
        action: (chars) => {
          const c = chars.find(ch => ch.id === target.id)!;
          if (randomResult(0.65)) {
            c.popularity += 20;
            return `刚得漂亮！未删减花絮证明了 ${c.name} 当时其实是在帮队友搬重物。这种“护犊子”的行为不仅洗清了冤屈，还让公司口碑大涨。`;
          } else {
            c.popularity -= 10;
            return `收效甚微。节目组以“合同保密”为由拒绝，黑粉反而嘲讽公司“戏多且玩不起”，舆论进一步恶化。`;
          }
        }
      },
      {
        text: `【粉丝运营】引导大粉扩散艺人私下的礼貌细节，冷处理负面。`,
        action: (chars) => {
          const c = chars.find(ch => ch.id === target.id)!;
          c.popularity += 8;
          return `稳健的处理方式。路人缘虽然受损，但核心粉丝群通过大规模的安利成功对冲了负面影响。`;
        }
      },
      {
        text: `【抓马联动】让 ${target.name} 与剪辑师在直播中“世纪和解”，博取同情分。`,
        action: (chars) => {
          const c = chars.find(ch => ch.id === target.id)!;
          c.popularity += 15;
          return `这波抓马操作惊呆了网友。虽然被指责“戏多”，但成功将负面转化为正面关注，${c.name} 的大度形象深入人心。`;
        }
      },
      {
        text: `【网感玩梗】艺人发微博：“是的，我当时确实在想中午吃什么”，用网感化解“耍大牌”指控。`,
        action: (chars) => {
          const c = chars.find(ch => ch.id === target.id)!;
          if (randomResult(0.85)) {
            c.popularity += 22;
            return `神级公关！网友纷纷表示“这就是我本人”，原本的负面标签被幽默感彻底消解，${c.name} 喜提“内娱真实活人”称号。`;
          } else {
            c.popularity -= 5;
            return `反响一般。部分严厉的网友仍认为其工作态度有问题，但大规模的攻击已经停止。`;
          }
        }
      }
    ]
  }
};

export const event_award_ceremony: GameEvent = {
  id: 'event-award-ceremony',
  type: 'PICK_TWO',
  title: '重磅：年度新人奖领奖代表',
  description: '团队荣获年度最具潜力新人奖，由于行程冲突，只能派两名代表上台领奖并发表获奖感言。',
  choices: {
    action: (char1: Character, char2: Character) => {
      const hasLeader = char1.name === '张桂源' || char2.name === '张桂源';
      // 提升基础成功率 (从 0.6 提升至 0.8)
      if (randomResult(hasLeader ? 0.98 : 0.8)) {
        char1.popularity += 22; char2.popularity += 22;
        return `得体大方！两人的发言既谦逊又有力量，#某某领奖感言# 霸屏热搜。作为制作人，你这次的人选安排被业界盛赞。`;
      } else {
        char1.popularity -= 5; char2.popularity -= 5;
        return `略显稚嫩。两人在台上表现得过于紧张，甚至出现了忘词的情况。虽然没出大错，但被嘲讽为“接不住泼天的富贵”。`;
      }
    }
  }
};

// --- 事件分发逻辑 (确保不重复) ---

export const eventPool: GameEvent[] = [
  event_scandal_01,
  event_variety_duo_01,
  event_vlog_ranking,
  event_brand_deal,
  event_training_injury,
  event_collab_stage,
  event_live_stream_accident,
  event_fan_gift_crisis,
  event_variety_guest,
  event_airport_fashion,
  event_mr_removed_vocal,
  event_dance_battle,
  event_audition_chance,
  event_training_vlog_accident,
  event_solo_cover,
  event_fan_project,
  event_variety_clash,
  event_dance_practice_vlog,
  event_variety_drama,
  event_award_ceremony,
  event_debut_countdown
];

export const openingEvent: GameEvent = event_c_position;
