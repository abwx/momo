import { computed, type ComputedRef, type Ref } from 'vue';
import type { Character } from '../data/characters';
import type { EventHistoryItem } from '../data/type/SettlementReport';
import type { SProgramPlan, SProgramPlanOption } from '../baseLib/serviceLib/type/SProgramPlan';
import type { SFanFactionState } from '../baseLib/serviceLib/type/SFanFactionState';
import type { SFanPulse } from '../baseLib/serviceLib/type/SFanPulse';
import type { SSeasonState } from '../baseLib/serviceLib/type/SSeasonState';
import { SCreateEventFactionEffect } from '../baseLib/serviceLib/SGameEffect';
import { SGetNarrativeChoiceHint } from '../baseLib/serviceLib/SGameNarrative';
import { SGetProgramPlanOptions } from '../baseLib/serviceLib/SProgramPlan';
import { SGetFanPulse } from '../baseLib/serviceLib/SFanPulse';
import type { FanWatchItem } from '../data/type/FanWatchItem';

interface UseStudioWorkspaceOptions {
  biasCharacter: ComputedRef<Character>;
  characters: Character[];
  currentEventIndex: Ref<number>;
  eventHistory: EventHistoryItem[];
  fanFactions: SFanFactionState;
  hasNegativeTrending: ComputedRef<boolean>;
  lastScenePairIds: Ref<[string, string] | null>;
  programPlan: Ref<SProgramPlan | null>;
  seasonState: SSeasonState;
}

/** Prepares the fan workspace data without coupling the root component to its presentation. */
export function useStudioWorkspace(options: UseStudioWorkspaceOptions) {
  return _createWorkspaceResult(options, _createWorkspaceState(options));
}

function _createWorkspaceState(options: UseStudioWorkspaceOptions) {
  const isProgramPlanPrompt = computed(() => _isProgramPlanPrompt(options));
  const fanWatchItems = computed(() => _createFanWatchItems(options.eventHistory));
  return { fanWatchItems, isProgramPlanPrompt, latestFactionDeltas: computed(() => fanWatchItems.value[0]?.factionDeltas || {}) };
}

function _createWorkspaceResult(options: UseStudioWorkspaceOptions, state: ReturnType<typeof _createWorkspaceState>) {
  return {
    fanPulse: computed<SFanPulse>(() => _createFanPulse(options)),
    fanWatchItems: state.fanWatchItems,
    isProgramPlanPrompt: state.isProgramPlanPrompt,
    latestFactionDeltas: state.latestFactionDeltas,
    nextStudioTask: computed(() => _getNextStudioTask(state.isProgramPlanPrompt.value, options.programPlan.value)),
    programPlanOptions: computed<SProgramPlanOption[]>(() => _createProgramPlanOptions(options.fanFactions, options.seasonState)),
  };
}

function _isProgramPlanPrompt(options: UseStudioWorkspaceOptions): boolean {
  return !options.programPlan.value && options.eventHistory.length > 0 && options.eventHistory.length % 3 === 0
    && options.seasonState.programPlanPromptIndex === options.currentEventIndex.value;
}

function _createFanPulse(options: UseStudioWorkspaceOptions): SFanPulse {
  return SGetFanPulse(_getFanPulseContext(options));
}

function _getFanPulseContext(options: UseStudioWorkspaceOptions) {
  return { biasCharacter: options.biasCharacter.value, characters: options.characters, factions: options.fanFactions,
    hasNegativeTrending: options.hasNegativeTrending.value, lastTags: _getLatestTags(options.eventHistory), scenePairIds: options.lastScenePairIds.value, season: options.seasonState, step: _getFanPulseStep(options) };
}

function _getLatestTags(history: EventHistoryItem[]) {
  return history[history.length - 1]?.effectTags || [];
}

function _getFanPulseStep(options: UseStudioWorkspaceOptions): number {
  return options.seasonState.fanPulseEventIndex === options.currentEventIndex.value ? options.seasonState.fanPulseStep : 0;
}

function _createProgramPlanOptions(factions: SFanFactionState, season: SSeasonState): SProgramPlanOption[] {
  return SGetProgramPlanOptions(factions.antiFans, season.biasPressure, season.cpHeat, factions.publicFans, factions.groupFans);
}

function _createFanWatchItems(history: EventHistoryItem[]): FanWatchItem[] {
  return history.slice(-3).reverse().map(_createFanWatchItem);
}

function _createFanWatchItem(item: EventHistoryItem): FanWatchItem {
  const factionDeltas = SCreateEventFactionEffect(item.event, item.effectTags || []).factions || {};
  const summary = SGetNarrativeChoiceHint(item.effectTags) || '这段片场正在改变广场注意力。';
  return { changes: _formatFactionChanges(factionDeltas), factionDeltas, summary, title: item.event.title };
}

function _formatFactionChanges(deltas: Partial<SFanFactionState>): string[] {
  return Object.entries(deltas).filter(([, value]) => value).map(([key, value]) => `${_getFactionLabel(key)} ${_formatDelta(value || 0)}`);
}

function _getFactionLabel(key: string): string {
  return ({ groupFans: '团粉', soloFans: '唯粉', cpFans: 'CP 粉', publicFans: '路人', antiFans: '黑词' })[key] || key;
}

function _formatDelta(value: number): string {
  return value > 0 ? `+${value}` : `${value}`;
}

function _getNextStudioTask(isPlanPrompt: boolean, plan: SProgramPlan | null): string {
  if (isPlanPrompt) return '下一步：完成粉盘押注';
  return plan ? '节目计划已锁定，回片场拍出匹配内容' : '回片场继续录制';
}
