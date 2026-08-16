import { computed, reactive, ref } from 'vue';
import { describe, expect, it } from 'vitest';
import { SCreateSeasonState } from '../baseLib/serviceLib/SSeasonState';
import type { Character } from '../data/characters';
import type { EventHistoryItem } from '../data/type/SettlementReport';
import { useStudioWorkspace } from './useStudioWorkspace';

const characters: Character[] = [
  { id: 'alpha', name: 'Alpha', image: '', personality: '成长力' as Character['personality'], popularity: 70, description: '' },
  { id: 'beta', name: 'Beta', image: '', personality: '成长力' as Character['personality'], popularity: 60, description: '' },
];

describe('useStudioWorkspace', () => {
  it('shows real faction deltas from the latest recording decision', () => {
    const workspace = createWorkspace([createHistoryItem(['GROUP_BOOST'])]);

    expect(workspace.latestFactionDeltas.value).toMatchObject({ groupFans: 7 });
    expect(workspace.fanWatchItems.value[0]).toMatchObject({ changes: ['团粉 +7'], title: '群像加拍' });
  });

  it('turns the third completed scene into a clear fan-plan task', () => {
    const workspace = createWorkspace([createHistoryItem([]), createHistoryItem([]), createHistoryItem([])]);

    expect(workspace.isProgramPlanPrompt.value).toBe(true);
    expect(workspace.nextStudioTask.value).toBe('下一步：完成粉盘押注');
  });
});

function createWorkspace(eventHistory: EventHistoryItem[]) {
  const seasonState = reactive(SCreateSeasonState());
  seasonState.programPlanPromptIndex = 0;
  return useStudioWorkspace({ biasCharacter: computed(() => characters[0]), characters, currentEventIndex: ref(0), eventHistory,
    fanFactions: reactive({ groupFans: 40, soloFans: 40, cpFans: 30, publicFans: 45, antiFans: 20 }), hasNegativeTrending: computed(() => false), lastScenePairIds: ref(null), programPlan: ref(null), seasonState });
}

function createHistoryItem(effectTags: EventHistoryItem['effectTags']): EventHistoryItem {
  return { event: { id: 'event', type: 'CHOICE', title: '群像加拍', description: '', choices: [] }, result: '', effectTags };
}
