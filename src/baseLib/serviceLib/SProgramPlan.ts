import type { Character } from '../../data/characters';
import type { Choice, GameEffectTag } from '../../data/type/GameEvent';
import type { SGameEffect } from './type/SGameEffect';
import type { SProgramPlan, SProgramPlanKey, SProgramPlanOption } from './type/SProgramPlan';

const PLAN_OPTIONS: Record<SProgramPlanKey, SProgramPlanOption> = {
  FOCUS: { key: 'FOCUS', title: '稳住本命主线', detail: '接下来三段持续给本命有效高光，证明主推不是空降。', investment: 4000, payoff: '命中 2 段，招商回款 ¥8,000', reason: '', risk: '偏心压力会继续累积', seatTradeoff: '本命席位优先，群像信用承压' },
  ENSEMBLE: { key: 'ENSEMBLE', title: '回收群像口碑', detail: '把镜头交还给被忽略的人，回应团粉的资源分配争议。', investment: 3500, payoff: '命中 2 段，招商回款 ¥7,000', reason: '', risk: '个人爆点会变少', seatTradeoff: '全员席位更稳，本命冲分变慢' },
  UNDERDOG: { key: 'UNDERDOG', title: '扶低位逆袭', detail: '让路人正在找的成员进入后续片场的候补机位。', investment: 4500, payoff: '命中 2 段，招商回款 ¥9,000', reason: '', risk: '失手会被骂强捧', seatTradeoff: '低位追分优先，本命资源被稀释' },
  CP: { key: 'CP', title: '兑现双人热搜', detail: '围绕上一段真正同框的两人继续拍，而不是临时拉郎。', investment: 5000, payoff: '命中 2 段，招商回款 ¥10,000', reason: '', risk: '唯粉与黑词都会盯得更紧', seatTradeoff: '双人评分优先，单人线会降温' },
  CRISIS: { key: 'CRISIS', title: '先压住风波', detail: '把后续镜头优先给完整度与回应，不让事故继续滚大。', investment: 3000, payoff: '命中 2 段，保住 ¥5,000 合作款', reason: '', risk: '本期传播爆点会下降', seatTradeoff: '口碑优先，短期席位爆点变少' },
};

const PLAN_TAGS: Record<SProgramPlanKey, GameEffectTag[]> = {
  FOCUS: ['FOCUS_ESCALATE'], ENSEMBLE: ['GROUP_BOOST', 'FOCUS_SETTLE'], UNDERDOG: ['UNDERDOG_SPOTLIGHT'], CP: ['CP_ESCALATE', 'CP_SETTLE'], CRISIS: ['ANTI_RISK', 'DRAMA_SETTLE'],
};

const PLAN_STEPS: Record<SProgramPlanKey, Array<{ text: string; result: string; tags: GameEffectTag[] }>> = {
  FOCUS: [
    { text: '先让 ${name} 在主段留下零失误定点。', result: '${name} 的第一段定点被完整保留，本命线正式起势。', tags: ['FOCUS_ESCALATE'] },
    { text: '让 ${name} 接住一次争议后的救场镜头。', result: '${name} 把救场扛了下来，观众开始认可高光并非硬塞。', tags: ['PUBLIC_BOOST'] },
    { text: '用全员反应收住 ${name} 的高光，避免变成独角戏。', result: '${name} 的高光被群像接住，主推线终于有了可信的落点。', tags: ['FOCUS_ESCALATE'] },
  ],
  ENSEMBLE: [
    { text: '把开场镜头拆给此前没有露出的成员。', result: '开场不再只押熟脸，团粉开始认可镜头轮换。', tags: ['GROUP_BOOST'] },
    { text: '保留成员彼此补位的完整过程。', result: '补位过程被保留，资源分配的争论降了一截。', tags: ['FOCUS_SETTLE'] },
    { text: '让全员一起完成最后一个关键镜头。', result: '关键镜头没有单人垄断，群像口碑完成回收。', tags: ['GROUP_BOOST'] },
  ],
  UNDERDOG: [
    { text: '给 ${name} 一段完整自我介绍，不把他剪成背景。', result: '${name} 有了第一段完整入口，路人终于能记住名字。', tags: ['UNDERDOG_SPOTLIGHT'] },
    { text: '保留 ${name} 被质疑后重新练习的过程。', result: '${name} 的练习过程压住了强捧质疑，逆袭线有了来处。', tags: ['PUBLIC_BOOST'] },
    { text: '把关键位交给 ${name}，让逆袭必须经得起正片。', result: '${name} 接住关键位，路人安利终于转成了实绩。', tags: ['UNDERDOG_SPOTLIGHT'] },
  ],
  CP: [
    { text: '先拍两人合作时自然出现的默契，不急着卖糖。', result: '双人互动有了真实前因，讨论没有立刻变成营业审判。', tags: ['CP_SETTLE'] },
    { text: '把两人留在同一段高难任务里，兑现热搜期待。', result: '两人一起扛住高难段，CP 热度有了舞台依据。', tags: ['CP_ESCALATE'] },
    { text: '用并肩收尾回应讨论，给双人线留边界。', result: '双人线没有过度加码，热度被稳稳收回正片。', tags: ['CP_SETTLE'] },
  ],
  CRISIS: [
    { text: '先交完整镜头，把事故的前因后果说清。', result: '完整镜头压住了断章，黑词没能继续滚大。', tags: ['ANTI_RISK'] },
    { text: '让成员自己回应争议，不替他写煽情台词。', result: '回应没有变成公关稿，观众愿意把争议留在节目里。', tags: ['DRAMA_SETTLE'] },
    { text: '用稳定群像收尾，把热搜从事故拉回节目。', result: '最后的群像把风波收住，合作方没有撤掉资源。', tags: ['ANTI_RISK'] },
  ],
};

export function SGetProgramPlanOptions(antiFans: number, biasPressure: number, cpHeat: number, publicFans = 0, groupFans = 0): SProgramPlanOption[] {
  if (antiFans >= 34) return SAttachReason([PLAN_OPTIONS.CRISIS, PLAN_OPTIONS.ENSEMBLE], `黑词升到 ${antiFans}，继续放大事故会让合作方撤资。`);
  if (biasPressure >= 10) return SAttachReason([PLAN_OPTIONS.ENSEMBLE, PLAN_OPTIONS.FOCUS], `偏心压力 ${biasPressure}，团粉正在盯镜头分配。`);
  if (cpHeat >= 8) return SAttachReason([PLAN_OPTIONS.CP, PLAN_OPTIONS.ENSEMBLE], `CP 热度 ${cpHeat}，上一段同框已被逐帧拆解。`);
  if (publicFans >= groupFans) return SAttachReason([PLAN_OPTIONS.UNDERDOG, PLAN_OPTIONS.ENSEMBLE], `路人盘 ${publicFans} 高于团粉 ${groupFans}，新面孔值得押一次。`);
  return SAttachReason([PLAN_OPTIONS.UNDERDOG, PLAN_OPTIONS.FOCUS], '当前没有单一危机，节目可以在逆袭线和主推线之间下注。');
}

export function SCreateProgramPlan(key: SProgramPlanKey, characters: Character[], targetParts: number, candidateIds: string[] = []): SProgramPlan {
  const option = PLAN_OPTIONS[key];
  const candidates = SGetPlanCandidates(key, characters, candidateIds);
  return { candidateIds: candidates, investment: option.investment, key, matches: 0, partsDone: 0, seatTradeoff: option.seatTradeoff, targetParts, title: option.title };
}

/** Keeps all plan-entry surfaces on the same budget rule. */
export function SGetProgramPlanAvailability(budget: number, investment: number) {
  const budgetGap = Math.max(0, investment - budget);
  return { isAffordable: budgetGap === 0, budgetGap };
}

export function SCreateProgramPlanChoice(plan: SProgramPlan, characters: Character[]): Choice {
  const target = characters.find(character => plan.candidateIds.includes(character.id)) || characters[0];
  const step = SGetPlanStep(plan);
  return { text: `【第 ${plan.partsDone + 1} 段兑现】${SFillName(step.text, target?.name || '候补成员')}`, preview: SGetChoicePreview(plan), effectTags: step.tags, action: list => SApplyPlanChoice(plan, list, target?.id || '') };
}

export function SRecordProgramPlanPart(plan: SProgramPlan, tags: GameEffectTag[]): SGameEffect | null {
  if (SGetPlanStep(plan).tags.some(tag => tags.includes(tag))) plan.matches += 1;
  plan.partsDone += 1;
  if (plan.partsDone < plan.targetParts) return null;
  return plan.matches >= 2 ? SCreatePlanWinEffect(plan.key) : SCreatePlanMissEffect(plan.key);
}

export function SGetProgramPlanResolution(plan: SProgramPlan): string {
  return plan.matches >= 2 ? `粉圈计划「${plan.title}」押中，合作款已到账。` : `粉圈计划「${plan.title}」没能兑现，广场开始追问节目组的判断。`;
}

function SGetCandidates(key: SProgramPlanKey, characters: Character[]): string[] {
  const sorted = [...characters].sort((left, right) => right.popularity - left.popularity);
  if (key === 'FOCUS') return [sorted[0]?.id || ''];
  if (key === 'UNDERDOG') return [sorted.at(-1)?.id || ''];
  if (key === 'CP') return sorted.slice(0, 2).map(character => character.id);
  return [];
}

function SGetPlanCandidates(key: SProgramPlanKey, characters: Character[], candidateIds: string[]): string[] {
  if (key === 'FOCUS' && SHasValidCandidates(characters, candidateIds, 1)) return candidateIds;
  if (key === 'CP' && SHasValidCandidates(characters, candidateIds, 2)) return candidateIds;
  return SGetCandidates(key, characters);
}

function SHasValidCandidates(characters: Character[], candidateIds: string[], count: number): boolean {
  return candidateIds.length === count && candidateIds.every(id => characters.some(character => character.id === id));
}

export function SGetProgramPlanTags(key: SProgramPlanKey): GameEffectTag[] {
  return PLAN_TAGS[key];
}

export function SGetCurrentProgramPlanTags(plan: SProgramPlan): GameEffectTag[] {
  return SGetPlanStep(plan).tags;
}

function SGetChoicePreview(plan: SProgramPlan): string {
  return `${plan.title} · 已执行 ${plan.partsDone}/${plan.targetParts} · 命中 ${plan.matches}/2`;
}

function SAttachReason(options: SProgramPlanOption[], reason: string): SProgramPlanOption[] {
  return options.map(option => ({ ...option, reason }));
}

function SGetPlanStep(plan: SProgramPlan) {
  return PLAN_STEPS[plan.key][Math.min(plan.partsDone, PLAN_STEPS[plan.key].length - 1)];
}

function SFillName(text: string, name: string): string {
  return text.replaceAll('${name}', name);
}

function SApplyPlanChoice(plan: SProgramPlan, characters: Character[], targetId: string): string {
  const target = characters.find(character => character.id === targetId);
  if (plan.key === 'ENSEMBLE') characters.forEach(character => character.popularity += 2);
  if (plan.key === 'UNDERDOG' && target) target.popularity += 8;
  if (plan.key === 'FOCUS' && target) target.popularity += 7;
  return SFillName(SGetPlanStep(plan).result, target?.name || '候补成员');
}

function SCreatePlanWinEffect(key: SProgramPlanKey): SGameEffect {
  return { FOCUS: { budgetDelta: 8000, factions: { soloFans: 5 }, season: { anticipation: 4 } }, ENSEMBLE: { budgetDelta: 7000, factions: { groupFans: 6, publicFans: 3 }, season: { producerReputation: 4 } }, UNDERDOG: { budgetDelta: 9000, factions: { publicFans: 7 }, season: { lowRankMomentum: 5 } }, CP: { budgetDelta: 10000, factions: { cpFans: 7 }, season: { anticipation: 5 } }, CRISIS: { budgetDelta: 5000, factions: { antiFans: -8 }, season: { producerReputation: 5 } } }[key];
}

function SCreatePlanMissEffect(key: SProgramPlanKey): SGameEffect {
  return { FOCUS: { factions: { antiFans: 3 }, season: { biasPressure: 3 } }, ENSEMBLE: { factions: { groupFans: -4 }, season: { producerReputation: -2 } }, UNDERDOG: { factions: { antiFans: 4 }, season: { lowRankMomentum: -2 } }, CP: { factions: { antiFans: 5 }, season: { cpHeat: 3 } }, CRISIS: { factions: { antiFans: 7 }, season: { dramaDebt: 4 } } }[key];
}
