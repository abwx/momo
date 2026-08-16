<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue';
import type { QTEScenario, QTEType } from '../../data/type/QTEScenario';
import { useDialogFocusTrap } from '../../composables/useDialogFocusTrap';

const props = defineProps<{
  active: boolean;
  scenario: QTEScenario | null;
  qteType: QTEType | null;
  qteValue: number;
  qteTarget: number;
  qteResult: string | null;
  hint: string;
}>();

const actionButton = ref<HTMLButtonElement>();
const dialogElement = ref<HTMLElement>();
const resultButton = ref<HTMLButtonElement>();
const dialogOpen = computed(() => props.active || !!props.qteResult);
const initialFocus = computed(() => props.qteResult ? resultButton.value : actionButton.value);

const { trapFocus } = useDialogFocusTrap({ initialFocus, isOpen: dialogOpen, root: dialogElement });

watch(() => [props.active, props.qteResult], () => _focusActiveQte(props.qteResult, actionButton, resultButton), { flush: 'post' });

const emit = defineEmits<{
  mash: [];
  timingClick: [];
  holdStart: [];
  holdStop: [];
  closeResult: [];
}>();

function handleAreaClick(qteType: QTEType | null): void {
  if (qteType === 'MASH') emit('mash');
  if (qteType === 'TIMING') emit('timingClick');
}

function handleHoldStart(event: PointerEvent, qteType: QTEType | null): void {
  if (qteType !== 'HOLD') return;
  _capturePointer(event);
  emit('holdStart');
}

function handleHoldStop(event: PointerEvent, qteType: QTEType | null): void {
  if (qteType !== 'HOLD') return;
  _releasePointer(event);
  emit('holdStop');
}

function handleHoldKeydown(event: KeyboardEvent, qteType: QTEType | null): void {
  if (qteType !== 'HOLD' || event.code !== 'Space') return;
  event.preventDefault();
  emit('holdStart');
}

function handleHoldKeyup(event: KeyboardEvent, qteType: QTEType | null): void {
  if (qteType !== 'HOLD' || event.code !== 'Space') return;
  event.preventDefault();
  emit('holdStop');
}

function _focusActiveQte(qteResult: string | null, action: Ref<HTMLButtonElement | undefined>, result: Ref<HTMLButtonElement | undefined>): void {
  nextTick(() => (qteResult ? result.value : action.value)?.focus());
}

function _capturePointer(event: PointerEvent): void {
  (event.currentTarget as HTMLButtonElement).setPointerCapture(event.pointerId);
}

function _releasePointer(event: PointerEvent): void {
  const target = event.currentTarget as HTMLButtonElement;
  if (target.hasPointerCapture(event.pointerId)) target.releasePointerCapture(event.pointerId);
}

function _stopHoldForInterruptedSession(): void {
  emit('holdStop');
}

function _stopHoldWhenHidden(): void {
  if (document.hidden) _stopHoldForInterruptedSession();
}

onMounted(() => {
  window.addEventListener('blur', _stopHoldForInterruptedSession);
  document.addEventListener('visibilitychange', _stopHoldWhenHidden);
});

onBeforeUnmount(() => {
  window.removeEventListener('blur', _stopHoldForInterruptedSession);
  document.removeEventListener('visibilitychange', _stopHoldWhenHidden);
});
</script>

<template>
  <Teleport to="body">
    <div v-if="active || qteResult" class="qte-overlay" role="presentation">
    <section v-if="active && scenario" ref="dialogElement" class="qte-modal" role="dialog" aria-modal="true" aria-labelledby="qte-title" aria-describedby="qte-description qte-hint" @keydown="trapFocus">
      <div class="qte-icon">{{ scenario.icon }}</div>
      <h2 id="qte-title">{{ scenario.title }}</h2>
      <p id="qte-description">{{ scenario.desc }}</p>

      <button
        ref="actionButton"
        type="button"
        class="qte-area"
        :class="{ 'timing-mode': qteType === 'TIMING' }"
        :aria-label="`${scenario.title}：${hint}`"
        @click="handleAreaClick(qteType)"
        @pointerdown="handleHoldStart($event, qteType)"
        @pointerup="handleHoldStop($event, qteType)"
        @pointercancel="handleHoldStop($event, qteType)"
        @lostpointercapture="handleHoldStop($event, qteType)"
        @keydown="handleHoldKeydown($event, qteType)"
        @keyup="handleHoldKeyup($event, qteType)"
      >
        <div v-if="qteType !== 'TIMING'" class="qte-progress-bg">
          <div class="qte-progress-fill" :style="{ width: (qteValue / qteTarget) * 100 + '%' }"></div>
        </div>

        <div v-else class="timing-bar-container">
          <div class="timing-target-zone"></div>
          <div class="timing-pointer" :style="{ left: qteValue + '%' }"></div>
        </div>

        <span id="qte-hint" class="qte-hint">{{ hint }}</span>
      </button>
    </section>

    <section v-if="qteResult" ref="dialogElement" class="qte-result-modal" role="dialog" aria-modal="true" aria-labelledby="qte-result-message" @keydown="trapFocus">
      <div id="qte-result-message" class="qte-result-text">{{ qteResult }}</div>
      <button ref="resultButton" type="button" @click="emit('closeResult')" class="alert-button">回到录制现场</button>
    </section>
    </div>
  </Teleport>
</template>
