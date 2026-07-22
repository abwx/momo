<script setup lang="ts">
import type { QTEScenario, QTEType } from '../../data/type/QTEScenario';

defineProps<{
  active: boolean;
  scenario: QTEScenario | null;
  qteType: QTEType | null;
  qteValue: number;
  qteTarget: number;
  qteResult: string | null;
  hint: string;
}>();

const emit = defineEmits<{
  mash: [];
  timingClick: [];
  holdStart: [];
  holdStop: [];
  closeResult: [];
}>();

function handleAreaClick(qteType: QTEType | null) {
  if (qteType === 'MASH') emit('mash');
  if (qteType === 'TIMING') emit('timingClick');
}

function handleTouchStart(qteType: QTEType | null) {
  if (qteType === 'MASH') emit('mash');
  if (qteType === 'TIMING') emit('timingClick');
  if (qteType === 'HOLD') emit('holdStart');
}
</script>

<template>
  <div v-if="active || qteResult" class="qte-overlay">
    <div v-if="active && scenario" class="qte-modal">
      <div class="qte-icon">{{ scenario.icon }}</div>
      <h2>{{ scenario.title }}</h2>
      <p>{{ scenario.desc }}</p>

      <div
        class="qte-area"
        :class="{ 'timing-mode': qteType === 'TIMING' }"
        @click="handleAreaClick(qteType)"
        @mousedown="qteType === 'HOLD' ? emit('holdStart') : null"
        @mouseup="qteType === 'HOLD' ? emit('holdStop') : null"
        @touchstart.prevent="handleTouchStart(qteType)"
        @touchend.prevent="qteType === 'HOLD' ? emit('holdStop') : null"
      >
        <div v-if="qteType !== 'TIMING'" class="qte-progress-bg">
          <div class="qte-progress-fill" :style="{ width: (qteValue / qteTarget) * 100 + '%' }"></div>
        </div>

        <div v-else class="timing-bar-container">
          <div class="timing-target-zone"></div>
          <div class="timing-pointer" :style="{ left: qteValue + '%' }"></div>
        </div>

        <div class="qte-hint">{{ hint }}</div>
      </div>
    </div>

    <div v-if="qteResult" class="qte-result-modal">
      <div class="qte-result-text">{{ qteResult }}</div>
      <button @click="emit('closeResult')" class="alert-button">回到录制现场</button>
    </div>
  </div>
</template>
