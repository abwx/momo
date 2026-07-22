import { ref } from 'vue';
import type { QTEScenario, QTEType } from '../data/type/QTEScenario';

export interface UseQteOptions {
  scenarios: QTEScenario[];
  onComplete: (success: boolean, scenario: QTEScenario) => void;
}

export function useQte(options: UseQteOptions) {
  const qteActive = ref(false);
  const qteType = ref<QTEType | null>(null);
  const qteValue = ref(0);
  const qteTarget = ref(0);
  const qteResult = ref<string | null>(null);
  const qteSuccessCount = ref(0);
  const currentQTEScenario = ref<QTEScenario | null>(null);
  const timingDirection = ref(1);
  let timingInterval: number | null = null;
  let holdTimer: number | null = null;

  function getQteHint() {
    if (qteType.value === 'MASH') return '快点，连续点击';
    if (qteType.value === 'HOLD') return '按住不要松手';
    return '看准时机点击';
  }

  function closeQteResult() {
    qteResult.value = null;
  }

  function startQTE() {
    const scenario = options.scenarios[Math.floor(Math.random() * options.scenarios.length)];
    currentQTEScenario.value = scenario;
    qteType.value = scenario.type;
    qteActive.value = true;
    qteValue.value = 0;
    setQteTarget();
  }

  function resetQte() {
    qteActive.value = false;
    qteType.value = null;
    qteValue.value = 0;
    qteTarget.value = 0;
    qteResult.value = null;
    currentQTEScenario.value = null;
    clearQteTimers();
  }

  function handleTimingClick() {
    if (qteType.value !== 'TIMING' || !qteActive.value) return;
    completeQTE(qteValue.value >= 40 && qteValue.value <= 60);
  }

  function handleMash() {
    if (qteType.value !== 'MASH' || !qteActive.value) return;
    qteValue.value++;
    if (qteValue.value >= qteTarget.value) completeQTE(true);
  }

  function startHold() {
    if (qteType.value !== 'HOLD' || !qteActive.value) return;
    const start = Date.now();
    holdTimer = window.setInterval(() => updateHoldValue(start), 50);
  }

  function stopHold() {
    if (!holdTimer) return;
    window.clearInterval(holdTimer);
    holdTimer = null;
    if (qteActive.value) completeQTE(false);
  }

  function clearQteTimers() {
    if (timingInterval) window.clearInterval(timingInterval);
    if (holdTimer) window.clearInterval(holdTimer);
    timingInterval = null;
    holdTimer = null;
  }

  function setQteTarget() {
    if (qteType.value === 'MASH') qteTarget.value = 10;
    if (qteType.value === 'HOLD') qteTarget.value = 2000;
    if (qteType.value === 'TIMING') startTimingQte();
  }

  function startTimingQte() {
    qteTarget.value = 100;
    qteValue.value = 0;
    startTimingLoop();
  }

  function startTimingLoop() {
    timingDirection.value = 1;
    timingInterval = window.setInterval(() => {
      if (!qteActive.value || qteType.value !== 'TIMING') return clearQteTimers();
      qteValue.value += 4 * timingDirection.value;
      if (qteValue.value >= 100) timingDirection.value = -1;
      if (qteValue.value <= 0) timingDirection.value = 1;
    }, 30);
  }

  function updateHoldValue(start: number) {
    qteValue.value = Date.now() - start;
    if (qteValue.value < qteTarget.value) return;
    if (holdTimer) window.clearInterval(holdTimer);
    holdTimer = null;
    completeQTE(true);
  }

  function completeQTE(success: boolean) {
    qteActive.value = false;
    const scenario = currentQTEScenario.value;
    if (!scenario) return;
    qteSuccessCount.value += success ? 1 : 0;
    qteResult.value = success ? scenario.successText : scenario.failText;
    options.onComplete(success, scenario);
  }

  return {
    qteActive,
    qteType,
    qteValue,
    qteTarget,
    qteResult,
    qteSuccessCount,
    currentQTEScenario,
    closeQteResult,
    getQteHint,
    startQTE,
    resetQte,
    handleTimingClick,
    handleMash,
    startHold,
    stopHold,
    clearQteTimers,
  };
}
