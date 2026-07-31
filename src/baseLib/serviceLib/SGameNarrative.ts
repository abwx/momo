import type { EventHistoryItem } from '../../data/type/SettlementReport';
import type { GameEffectTag } from '../../data/type/GameEvent';
import type { SBondPair } from './type/SBondPair';
import type { SNarrativeOutcome, SNarrativeThread } from './type/SNarrativeThread';
import type { SSeasonState } from './type/SSeasonState';
import type { SStudioLedger } from './type/SStudioLedger';

export interface SProducerIdentity {
  title: string;
  detail: string;
}

const S_NARRATIVE_TAG_EFFECTS: Partial<Record<GameEffectTag, Partial<SSeasonState>>> = {
  DRAMA_ESCALATE: { dramaDebt: 6, anticipation: 4, groupHeat: 3, producerReputation: -3 },
  DRAMA_SETTLE: { dramaDebt: -8, producerReputation: 4 },
  FOCUS_ESCALATE: { biasPressure: 6, groupHeat: 3, producerReputation: -3 },
  FOCUS_SETTLE: { biasPressure: -8, lowRankMomentum: 4, producerReputation: 3 },
  CP_ESCALATE: { cpHeat: 6, anticipation: 3, producerReputation: -2 },
  CP_SETTLE: { cpHeat: -8, groupHeat: 1, producerReputation: 3 },
  UNDERDOG_SPOTLIGHT: { lowRankMomentum: 6, producerReputation: 2 },
};

const S_NARRATIVE_TAG_HINTS: Partial<Record<GameEffectTag, string>> = {
  DRAMA_ESCALATE: '争议债上升', DRAMA_SETTLE: '争议债下降',
  FOCUS_ESCALATE: '偏心压力上升', FOCUS_SETTLE: '镜头落差缓和',
  CP_ESCALATE: 'CP 热度升高', CP_SETTLE: 'CP 热度收束',
  UNDERDOG_SPOTLIGHT: '低位逆袭推进', FINALE_AUDIT: '触发终局审查',
};

export function SGetNarrativeThreads(state: SSeasonState): SNarrativeThread[] {
  return [SCreateBiasThread(state), SCreateDramaThread(state), SCreateCpThread(state), SCreateUnderdogThread(state)].filter(Boolean) as SNarrativeThread[];
}

export function SGetNarrativeResolutionEffect(eventId: string): Partial<SSeasonState> {
  if (eventId === 'followup-cp-afterglow') return { cpHeat: -6, anticipation: 3 };
  if (eventId === 'followup-low-rank-spotlight') return { lowRankMomentum: -8, producerReputation: 3 };
  if (eventId === 'followup-public-crisis') return { dramaDebt: -3, producerReputation: 4 };
  return {};
}

/** Converts a branch decision into state that can affect later events and the final report. */
export function SGetNarrativeTagEffect(tags: GameEffectTag[]): Partial<SSeasonState> {
  return tags.reduce((effect, tag) => SAddNarrativeEffect(effect, S_NARRATIVE_TAG_EFFECTS[tag]), {} as Partial<SSeasonState>);
}

export function SGetNarrativeChoiceHint(tags: GameEffectTag[] = []): string {
  return tags.map(tag => S_NARRATIVE_TAG_HINTS[tag]).filter(Boolean).join(' · ');
}

export function SGetNarrativeOutcomes(state: SSeasonState, history: EventHistoryItem[], topBond: SBondPair | null, lowRankGrowth: number): SNarrativeOutcome[] {
  return [SCreateBiasOutcome(state, history), SCreateDramaOutcome(history), SCreateCpOutcome(topBond, history), SCreateUnderdogOutcome(lowRankGrowth, history)].filter(Boolean) as SNarrativeOutcome[];
}

export function SGetProducerIdentity(state: SSeasonState, ledger: SStudioLedger): SProducerIdentity {
  if (ledger.recordingModes.DRAMA >= 3 || state.anticipation >= 30) return { title: '话题制造机', detail: '你愿意用争议换取讨论，并知道何时安排回收。' };
  if (state.biasPressure >= 16 || ledger.recordingModes.FOCUS >= 4) return { title: '本命操盘手', detail: '镜头始终偏向一个名字，粉圈也因此记住了你的偏爱。' };
  if (state.lowRankMomentum >= 8 || ledger.recordingModes.BALANCE >= 4) return { title: '群像派导演', detail: '你把被忽略的人留在镜头里，让团综拥有更长的后劲。' };
  return { title: '稳妥节目监制', detail: '你优先保证节目口碑与团体秩序，把风险留在可控范围。' };
}

function SCreateBiasThread(state: SSeasonState): SNarrativeThread | null {
  if (state.biasPressure < 4) return null;
  return SCreateThread('bias', '本命高光线', state.biasPressure, '镜头偏爱已被粉圈察觉。');
}

function SCreateDramaThread(state: SSeasonState): SNarrativeThread | null {
  if (state.dramaDebt < 2) return null;
  return SCreateThread('drama', '虐粉悬念线', state.dramaDebt, '悬念正在累积，下一期需要给出交代。');
}

function SCreateCpThread(state: SSeasonState): SNarrativeThread | null {
  if (state.cpHeat < 3) return null;
  return SCreateThread('cp', 'CP 发酵线', state.cpHeat, '二创正在升温，继续加码会带来反噬风险。');
}

function SCreateUnderdogThread(state: SSeasonState): SNarrativeThread | null {
  if (state.lowRankMomentum < 3) return null;
  return SCreateThread('underdog', '低位逆袭线', state.lowRankMomentum, '被忽略的成员正在等待一段真正的高光。');
}

function SCreateThread(key: string, title: string, value: number, detail: string): SNarrativeThread {
  return { key, title, detail, stage: value >= 8 ? 'HEATED' : 'SEEDED' };
}

function SCreateBiasOutcome(state: SSeasonState, history: EventHistoryItem[]): SNarrativeOutcome | null {
  if (SHasTag(history, 'FOCUS_SETTLE')) return { title: '群像回收', detail: '你在偏心争议扩大前把镜头交还给了其他成员，团体叙事重新站稳。' };
  if (SHasEvent(history, 'followup-focus-boycott')) return { title: '偏心反噬', detail: '过度集中镜头引发了粉圈抵触，本季主角线最终留下了代价。' };
  return state.biasPressure >= 8 ? { title: '镜头主角', detail: '你用连续高光剪出了一位本季主角。' } : null;
}

function SCreateDramaOutcome(history: EventHistoryItem[]): SNarrativeOutcome | null {
  if (SHasEvent(history, 'followup-drama-collapse')) return { title: '争议失控', detail: '这条抓马线越过了可控边界，热度兑现成了本季最难收拾的后遗症。' };
  return SHasTag(history, 'DRAMA_SETTLE') ? { title: '争议回收', detail: '你没有让悬念失控，而是把争议剪回了节目叙事。' } : null;
}

function SCreateCpOutcome(topBond: SBondPair | null, history: EventHistoryItem[]): SNarrativeOutcome | null {
  if (SHasEvent(history, 'followup-cp-fatigue')) return { title: 'CP 透支', detail: '双人热度被连续加码，讨论盘开始从嗑糖转为审视。' };
  return topBond?.value && topBond.value >= 36 ? { title: '化学反应', detail: `${topBond.names} 成为本季最有记忆点的双人线。` } : null;
}

function SCreateUnderdogOutcome(lowRankGrowth: number, history: EventHistoryItem[]): SNarrativeOutcome | null {
  if (SHasTag(history, 'UNDERDOG_SPOTLIGHT')) return { title: '逆袭镜头', detail: '你把一次补位做成了可持续的个人成长线。' };
  return lowRankGrowth >= 12 ? { title: '逆袭镜头', detail: '你给了低位成员一次被真正看见的机会。' } : null;
}

function SAddNarrativeEffect(target: Partial<SSeasonState>, source?: Partial<SSeasonState>): Partial<SSeasonState> {
  if (!source) return target;
  Object.entries(source).forEach(([key, value]) => target[key as keyof SSeasonState] = (target[key as keyof SSeasonState] || 0) + value);
  return target;
}

function SHasTag(history: EventHistoryItem[], tag: GameEffectTag): boolean {
  return history.some(item => item.effectTags?.includes(tag));
}

function SHasEvent(history: EventHistoryItem[], eventId: string): boolean {
  return history.some(item => item.event.id === eventId);
}
