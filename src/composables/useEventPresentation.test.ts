import { computed, ref, type Ref } from 'vue';
import { describe, expect, it } from 'vitest';
import type { Character } from '../data/characters';
import { SCreateSeasonState } from '../baseLib/serviceLib/SSeasonState';
import type { GameEvent } from '../data/type/GameEvent';
import type { SNextEpisodeHook } from '../baseLib/serviceLib/type/SNextEpisodeHook';
import { useEventPresentation } from './useEventPresentation';

const characters = Array.from({ length: 7 }, (_, index) => SCreateCharacter(index));
const event = ref<GameEvent>({ id: 'ranking', type: 'RANKING', title: '', description: '', choices: { action: () => '' } });

describe('useEventPresentation', () => {
  it('keeps both duo-hook members in the next scene candidates', () => {
    const hook = ref<SNextEpisodeHook | null>({ key: 'DUO', characterIds: ['member-5', 'member-6'], targetEventIndex: 1 });
    const presentation = SCreatePresentation(hook);

    presentation.prepareEventPresentation();

    expect(presentation.rankingList.value.map(character => character.id)).toEqual(['member-0', 'member-1', 'member-2', 'member-5', 'member-6']);
  });

  it('keeps authored choice scenes focused when no contextual route is active', () => {
    const choiceEvent = ref<GameEvent>({ id: 'event-song-check', type: 'CHOICE', title: '', description: '', choices: [{ text: '路线一', effectTags: ['FOCUS_ESCALATE'], action: () => '' }, { text: '路线二', action: () => '' }] });
    const presentation = SCreatePresentation(ref(null), choiceEvent);

    presentation.prepareEventPresentation();

    expect(presentation.choiceOptions.value).toHaveLength(2);
    expect(presentation.choiceOptions.value[0].preview).toContain('偏心压力 +6');
  });

  it('keeps a lower-ranked bias available for interactive scenes', () => {
    const choiceEvent = ref<GameEvent>({ id: 'ranking', type: 'RANKING', title: '', description: '', choices: { action: () => '' } });
    const presentation = useEventPresentation({ biasCharacterId: ref('member-6'), currentEvent: computed(() => choiceEvent.value), episodeHook: computed(() => null), programPlan: ref(null), getRandomValue: () => 0, seasonState: SCreateSeasonState(), sortedCharacters: computed(() => characters), topCharacter: computed(() => characters[0]) });

    presentation.prepareEventPresentation();

    expect(presentation.rankingList.value.map(character => character.id)).toContain('member-6');
  });
});

function SCreatePresentation(hook: Ref<SNextEpisodeHook | null>, currentEvent = event) {
  return useEventPresentation({ biasCharacterId: ref('member-0'), currentEvent: computed(() => currentEvent.value), episodeHook: computed(() => hook.value || null), programPlan: ref(null), getRandomValue: () => 0, seasonState: SCreateSeasonState(), sortedCharacters: computed(() => characters), topCharacter: computed(() => characters[0]) });
}

function SCreateCharacter(index: number): Character {
  return { id: `member-${index}`, name: `Member ${index}`, image: '', personality: 'test' as Character['personality'], popularity: 100 - index, description: '' };
}
