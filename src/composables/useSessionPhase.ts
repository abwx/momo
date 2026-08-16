import { computed, type Ref } from 'vue';
import type { StudioViewKey } from '../data/type/StudioView';
import type { RoundResolution } from '../data/type/RoundResolution';

export type SessionPhase = 'EVENT' | 'FAN_WORKSPACE' | 'PROGRAM_PLAN' | 'QTE' | 'ROUND_RESULT' | 'NOTICE';

interface UseSessionPhaseOptions {
  activeStudioPage: Ref<StudioViewKey>;
  isProgramPlanPrompt: Ref<boolean>;
  qteActive: Ref<boolean>;
  qteResult: Ref<string | null>;
  roundResolution: Ref<RoundResolution | null>;
  showResultModal: Ref<boolean>;
}

/** Derives one authoritative interaction phase from the active overlays and workspace. */
export function useSessionPhase(options: UseSessionPhaseOptions) {
  const sessionPhase = computed(() => _getSessionPhase(options));
  const canResolveEvent = computed(() => sessionPhase.value === 'EVENT');
  const canIntervene = computed(() => sessionPhase.value === 'EVENT');
  const canRunTimedWork = computed(() => sessionPhase.value === 'EVENT');
  return { canIntervene, canResolveEvent, canRunTimedWork, sessionPhase };
}

function _getSessionPhase(options: UseSessionPhaseOptions): SessionPhase {
  if (options.qteActive.value || options.qteResult.value) return 'QTE';
  if (options.showResultModal.value) return 'NOTICE';
  if (options.roundResolution.value) return 'ROUND_RESULT';
  if (options.isProgramPlanPrompt.value) return 'PROGRAM_PLAN';
  return options.activeStudioPage.value === 'fans' ? 'FAN_WORKSPACE' : 'EVENT';
}
