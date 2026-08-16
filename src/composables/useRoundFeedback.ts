import type { Ref } from 'vue';
import type { Character } from '../data/characters';
import type { GameEffectTag, GameEvent } from '../data/type/GameEvent';
import type { RoundResolution } from '../data/type/RoundResolution';
import type { EventHistoryItem } from '../data/type/SettlementReport';
import type { StudioViewKey } from '../data/type/StudioView';

interface UseRoundFeedbackOptions {
  activeStudioPage: Ref<StudioViewKey>;
  celebrateNewAchievements: () => void;
  characters: Character[];
  closePopularityDashboard: () => void;
  currentEvent: Ref<GameEvent | null>;
  eventHistory: EventHistoryItem[];
  getActiveEpisodeHook: () => boolean;
  getSelectedPair: () => Character[];
  highlightedCharIds: Ref<Set<string>>;
  nextEvent: () => void;
  nextEpisodeHook: Ref<unknown | null>;
  onResetPageScroll: () => void;
  roundResolution: Ref<RoundResolution | null>;
}

/** Records a resolved scene before allowing the next one to begin. */
export function useRoundFeedback(options: UseRoundFeedbackOptions) {
  return {
    continueRound: () => _continueRound(options),
    triggerFeedback: (result: string, choiceText: string, affectedIds: string[] = [], effectTags: GameEffectTag[] = [], impactLines: string[] = []) => _triggerFeedback(options, result, choiceText, affectedIds, effectTags, impactLines),
  };
}

function _triggerFeedback(options: UseRoundFeedbackOptions, result: string, choiceText: string, affectedIds: string[], effectTags: GameEffectTag[], impactLines: string[]): void {
  const event = options.currentEvent.value;
  if (!event) return;
  const highlightedIds = _getHighlightedIds(options, result, affectedIds);
  options.eventHistory.push({ event, result, effectTags, choiceText, impactLines });
  options.highlightedCharIds.value = highlightedIds;
  options.roundResolution.value = _createRoundResolution(options.characters, choiceText, result, highlightedIds, impactLines);
  _showRoundFeedback(options);
}

function _getHighlightedIds(options: UseRoundFeedbackOptions, result: string, affectedIds: string[]): Set<string> {
  const ids = new Set(affectedIds);
  options.characters.filter(character => result.includes(character.name)).forEach(character => ids.add(character.id));
  options.getSelectedPair().forEach(character => ids.add(character.id));
  return ids;
}

function _createRoundResolution(characters: Character[], choiceText: string, result: string, ids: Set<string>, impactLines: string[]): RoundResolution {
  const affectedNames = characters.filter(character => ids.has(character.id)).map(character => character.name).slice(0, 4);
  return { choiceText, result, affectedNames, impactLines };
}

function _showRoundFeedback(options: UseRoundFeedbackOptions): void {
  options.closePopularityDashboard();
  options.celebrateNewAchievements();
  options.activeStudioPage.value = 'event';
  options.onResetPageScroll();
}

function _continueRound(options: UseRoundFeedbackOptions): void {
  if (!options.roundResolution.value) return;
  options.roundResolution.value = null;
  if (options.getActiveEpisodeHook()) options.nextEpisodeHook.value = null;
  options.nextEvent();
  options.onResetPageScroll();
}
