import type { Character } from '../../data/characters';
import type { SFanPulse, SFanPulseContext } from './type/SFanPulse';

/** Turns the last filming choice and current hot topics into one actionable fan-disk brief. */
export function SGetFanPulse(context: SFanPulseContext): SFanPulse {
  const base = SGetBasePulse(context, SGetSuggestedPair(context));
  if (context.step === 1) return SCreateFollowUpPulse(base);
  if (context.step > 1) return SCreateResolvedPulse(base);
  return base;
}

function SGetBasePulse(context: SFanPulseContext, pair: [string, string]): SFanPulse {
  if (context.hasNegativeTrending) return SCreateCrisisPulse(pair);
  return SGetTagPulse(context, pair) || SGetStatePulse(context, pair);
}

function SGetTagPulse(context: SFanPulseContext, pair: [string, string]): SFanPulse | null {
  if (context.lastTags.includes('DRAMA_ESCALATE')) return SCreateCrisisPulse(pair);
  if (context.lastTags.includes('FOCUS_ESCALATE')) return SCreateFocusPulse(context, pair);
  if (context.lastTags.includes('CP_ESCALATE')) return SCreateCpPulse(pair);
  if (context.lastTags.includes('UNDERDOG_SPOTLIGHT')) return SCreateUnderdogPulse(pair);
  if (context.lastTags.includes('GROUP_BOOST')) return SCreateGroupPulse(pair);
  return null;
}

function SGetStatePulse(context: SFanPulseContext, pair: [string, string]): SFanPulse {
  if (context.factions.antiFans >= 30 || context.season.dramaDebt >= 8) return SCreateCrisisPulse(pair);
  if (context.season.biasPressure >= 10) return SCreateFocusPulse(context, pair);
  if (context.season.cpHeat >= 8) return SCreateCpPulse(pair);
  if (context.season.lowRankMomentum < 4) return SCreateUnderdogPulse(pair);
  return SCreateGroupPulse(pair);
}

function SCreateCrisisPulse(pair: [string, string]): SFanPulse {
  return SCreatePulse('crisis', '广场在拉表', '# 节目组别只剪事故 # 被顶上来了。', 'ANTI', '先回应争议，别让质疑自己长大。', pair, 'VLOG', '先放自然后台，给观众一个不带滤镜的解释。');
}

function SCreateFocusPulse(context: SFanPulseContext, pair: [string, string]): SFanPulse {
  const support = pair.find(id => id !== context.biasCharacter.id) || pair[0];
  return SCreatePulse('focus', '唯粉和团粉吵起来了', '# 镜头又只给他 # 的热评正在升。', 'GROUP', '先补团魂物料，把讨论从偏爱拉回群像。', [context.biasCharacter.id, support], 'VLOG', '推荐拍后台互相接话，不要再硬塞高光。');
}

function SCreateCpPulse(pair: [string, string]): SFanPulse {
  return SCreatePulse('cp', '超话在翻片段', '# 这对接话不是剪出来的吧 # 有人开始逐帧扒。', 'CP', '互动混剪能接住讨论，但别连续硬炒。', pair, 'LIVE', '推荐拍双人游戏，把互动放回任务里。');
}

function SCreateUnderdogPulse(pair: [string, string]): SFanPulse {
  return SCreatePulse('underdog', '路人在找新面孔', '# 除了熟脸还有谁值得看 # 的评论很多。', 'PUBLIC', '先发路人安利，让低位成员有真正的入口。', pair, 'STAGE', '推荐同框舞台，用完成度给新人一个记忆点。');
}

function SCreateGroupPulse(pair: [string, string]): SFanPulse {
  return SCreatePulse('group', '团粉在等群像', '# 团综就该这么拍 # 的互动很高。', 'GROUP', '团魂物料最对路，继续让每个人都被看见。', pair, 'VLOG', '推荐后台花絮，先把自然关系线养出来。');
}

function SCreateFollowUpPulse(base: SFanPulse): SFanPulse {
  const program = base.program === 'ANTI' || base.program === 'PUBLIC' ? 'GROUP' : 'PUBLIC';
  return SCreatePulse(`${base.id}-follow`, '第一条热评接住了', '广场开始追问：下一条能不能把团综拍得更完整？', program, program === 'GROUP' ? '补一条群像，把这波讨论收在节目里。' : '给新面孔补一条入口，别让讨论只停在熟脸。', base.pairIds, 'VLOG', '第二条更适合放松弛花絮，别继续硬堆话题。', 'FOLLOW_UP');
}

function SCreateResolvedPulse(base: SFanPulse): SFanPulse {
  return SCreatePulse(`${base.id}-done`, '本期反馈已接住', '这两条讨论已经有了落点，留一点余地给下一期。', base.program, '本期热搜位先别再硬投，回片场继续拍。', base.pairIds, base.project, '双人线先留白，下一期再看广场怎么接。', 'RESOLVED');
}

function SCreatePulse(id: string, title: string, quote: string, program: SFanPulse['program'], programHint: string, pairIds: [string, string], project: SFanPulse['project'], projectHint: string, phase: SFanPulse['phase'] = 'OPEN'): SFanPulse {
  return { id, phase, title, quote, program, programHint, pairIds, project, projectHint };
}

function SGetSuggestedPair(context: SFanPulseContext): [string, string] {
  if (context.scenePairIds?.[0] && context.scenePairIds[1]) return context.scenePairIds;
  return SGetDefaultPair(context.characters);
}

function SGetDefaultPair(characters: Character[]): [string, string] {
  const sorted = [...characters].sort((left, right) => right.popularity - left.popularity);
  return [sorted[0]?.id || '', sorted[sorted.length - 1]?.id || sorted[0]?.id || ''];
}
