import type { GameEffectTag } from '../../data/type/GameEvent';
import type { EventHistoryItem } from '../../data/type/SettlementReport';
import type { SSeasonRecap, SSeasonRecapContext, SSeasonRecapItem } from './type/SSeasonRecap';

type SRouteKey = 'DRAMA' | 'FOCUS' | 'CP' | 'ENSEMBLE' | 'STEADY';

const S_ROUTE_TAGS: Record<SRouteKey, GameEffectTag[]> = {
  DRAMA: ['DRAMA_ESCALATE', 'DRAMA_SETTLE'], FOCUS: ['FOCUS_ESCALATE', 'FOCUS_SETTLE'],
  CP: ['CP_ESCALATE', 'CP_SETTLE'], ENSEMBLE: ['UNDERDOG_SPOTLIGHT', 'GROUP_BOOST'], STEADY: ['ANTI_RISK', 'PUBLIC_BOOST'],
};

const S_ROUTE_ITEMS: Record<SRouteKey, SSeasonRecapItem> = {
  DRAMA: { label: '主导路线', title: '抓马悬念线', detail: '你用冲突和悬念拉住讨论，也必须决定热度何时收束。' },
  FOCUS: { label: '主导路线', title: '本命高光线', detail: '你把镜头持续交给一个名字，让偏爱成为本季最强叙事。' },
  CP: { label: '主导路线', title: '双人化学线', detail: '你放大了双人关系的讨论，也在热度与边界之间做取舍。' },
  ENSEMBLE: { label: '主导路线', title: '群像成长线', detail: '你把镜头从头部成员分给更多人，让团综更有后劲。' },
  STEADY: { label: '主导路线', title: '稳健口碑线', detail: '你选择长期信任与内容完成度，而不是一次性爆点。' },
};

/** Builds the concise cause-and-effect story shown before the detailed archive. */
export function SCreateSeasonRecap(context: SSeasonRecapContext): SSeasonRecap {
  const route = SGetDominantRoute(context);
  return { route: S_ROUTE_ITEMS[route], choice: SCreateChoice(context.eventHistory, route), gain: SCreateGain(context, route), cost: SCreateCost(context) };
}

function SGetDominantRoute(context: SSeasonRecapContext): SRouteKey {
  return (Object.keys(S_ROUTE_TAGS) as SRouteKey[]).sort((a, b) => SGetRouteScore(context, b) - SGetRouteScore(context, a))[0];
}

function SGetRouteScore(context: SSeasonRecapContext, route: SRouteKey): number {
  const tagScore = SCountTags(context.eventHistory, S_ROUTE_TAGS[route]) * 4;
  return tagScore + SGetRouteStateScore(context, route);
}

function SGetRouteStateScore(context: SSeasonRecapContext, route: SRouteKey): number {
  const { seasonState, fanFactions } = context;
  if (route === 'DRAMA') return seasonState.anticipation / 16 + seasonState.dramaDebt / 20;
  if (route === 'FOCUS') return seasonState.biasPressure / 12;
  if (route === 'CP') return seasonState.cpHeat / 12;
  if (route === 'ENSEMBLE') return fanFactions.groupFans / 35;
  return seasonState.producerReputation / 30 + fanFactions.publicFans / 55;
}

function SCreateChoice(history: EventHistoryItem[], route: SRouteKey): SSeasonRecapItem {
  const event = [...history].reverse().find(item => SIncludesRouteTag(item, route)) || history.at(-1);
  return event ? { label: '关键决定', title: event.event.title, detail: event.result } : { label: '关键决定', title: '按计划开录', detail: '这一季没有出现需要改变整体方向的关键节点。' };
}

function SCreateGain(context: SSeasonRecapContext, route: SRouteKey): SSeasonRecapItem {
  const outcome = context.narrativeOutcomes.find(item => SMatchesRoute(item.title, route)) || context.narrativeOutcomes[0];
  return outcome ? { label: '你留下了', title: outcome.title, detail: outcome.detail } : { label: '你留下了', title: '稳定的制作口碑', detail: '节目完成了整季录制，并为下一季保留了继续运营的基础。' };
}

function SCreateCost(context: SSeasonRecapContext): SSeasonRecapItem {
  return SGetCostItems(context).sort((a, b) => b.score - a.score)[0].item;
}

function SGetCostItems(context: SSeasonRecapContext): Array<{ score: number; item: SSeasonRecapItem }> {
  const { fanFactions, seasonState } = context;
  return [SCreateAntiCost(fanFactions.antiFans), SCreateDramaCost(seasonState.dramaDebt), SCreateBiasCost(seasonState.biasPressure), SCreateCpCost(seasonState.cpHeat)];
}

function SCreateAntiCost(antiFans: number) {
  return { score: antiFans, item: { label: '你承担了', title: antiFans >= 40 ? '舆情压力' : '可控的争议', detail: antiFans >= 40 ? '负面讨论已经形成规模，下一季必须优先处理信任与口碑。' : '热度没有完全没有代价，但粉圈仍处在可运营的范围内。' } };
}

function SCreateDramaCost(dramaDebt: number) {
  return { score: dramaDebt * 2, item: { label: '你承担了', title: dramaDebt >= 10 ? '未清的悬念债' : '抓马余波', detail: dramaDebt >= 10 ? '你留下的冲突还没有被完全回收，观众会带着它进入下一季。' : '悬念带来了讨论，但尚未发展为无法收拾的后遗症。' } };
}

function SCreateBiasCost(biasPressure: number) {
  return { score: biasPressure * 2, item: { label: '你承担了', title: biasPressure >= 12 ? '镜头失衡' : '偏爱痕迹', detail: biasPressure >= 12 ? '成员之间的资源落差已经被粉圈看见，群像信用需要重新建立。' : '镜头有明显倾向，但仍有空间把叙事拉回团体。' } };
}

function SCreateCpCost(cpHeat: number) {
  return { score: cpHeat * 2, item: { label: '你承担了', title: cpHeat >= 12 ? '双人线透支' : '互动审视', detail: cpHeat >= 12 ? '双人热度被持续放大，接下来要防止观众把关系只当作营销素材。' : '双人互动带来了讨论，也让节目需要更谨慎地处理边界。' } };
}

function SCountTags(history: EventHistoryItem[], tags: GameEffectTag[]): number {
  return history.reduce((count, item) => count + (item.effectTags?.filter(tag => tags.includes(tag)).length || 0), 0);
}

function SIncludesRouteTag(item: EventHistoryItem, route: SRouteKey): boolean {
  return item.effectTags?.some(tag => S_ROUTE_TAGS[route].includes(tag)) || false;
}

function SMatchesRoute(title: string, route: SRouteKey): boolean {
  return SGetRouteKeywords(route).some(keyword => title.includes(keyword));
}

function SGetRouteKeywords(route: SRouteKey): string[] {
  return { DRAMA: ['争议'], FOCUS: ['偏心', '群像回收', '镜头主角'], CP: ['CP', '化学'], ENSEMBLE: ['逆袭'], STEADY: ['口碑', '信任'] }[route];
}
