import { ref } from 'vue';

type ResultModalMode = 'notice' | 'final';

/** Owns transient notices and modal state displayed over the game session. */
export function useGameFeedback() {
  const state = _createFeedbackState();
  return { ...state, clearFeedbackTimers: () => _clearFeedbackTimers(state), notifyToast: (message: string, duration = 2200, title = '粉圈热报', impactLines: string[] = []) => _notifyToast(state, message, duration, title, impactLines), openDelayedNotice: (message: string, title: string, delay: number) => _openDelayedNotice(state, message, title, delay), openNoticeModal: (message: string, title = '粉圈热报') => _openNoticeModal(state, message, title) };
}

function _createFeedbackState() {
  return { achievementTimer: null as number | null, resultModalMessage: ref(''), resultModalMode: ref<ResultModalMode>('notice'), resultModalTitle: ref('粉圈热报'), showResultModal: ref(false), showToast: ref(false), toastImpactLines: ref<string[]>([]), toastMessage: ref(''), toastTimer: null as number | null, toastTitle: ref('粉圈热报') };
}

function _notifyToast(state: ReturnType<typeof _createFeedbackState>, message: string, duration: number, title: string, impactLines: string[]) {
  if (state.toastTimer) window.clearTimeout(state.toastTimer);
  state.toastMessage.value = message;
  state.toastTitle.value = title;
  state.toastImpactLines.value = impactLines;
  state.showToast.value = true;
  state.toastTimer = window.setTimeout(() => state.showToast.value = false, duration);
}

function _openNoticeModal(state: ReturnType<typeof _createFeedbackState>, message: string, title: string) {
  state.resultModalMode.value = 'notice';
  state.resultModalTitle.value = title;
  state.resultModalMessage.value = message;
  state.showResultModal.value = true;
}

function _openDelayedNotice(state: ReturnType<typeof _createFeedbackState>, message: string, title: string, delay: number) {
  if (state.achievementTimer) window.clearTimeout(state.achievementTimer);
  state.achievementTimer = window.setTimeout(() => _openNoticeModal(state, message, title), delay);
}

function _clearFeedbackTimers(state: ReturnType<typeof _createFeedbackState>) {
  if (state.toastTimer) window.clearTimeout(state.toastTimer);
  if (state.achievementTimer) window.clearTimeout(state.achievementTimer);
}
