<script setup lang="ts">
import type { Choice } from '../../data/events';

defineProps<{
  choices: Choice[];
}>();

const emit = defineEmits<{
  selectChoice: [choice: Choice];
}>();

const directiveTypes = ['稳盘控场', '高光押注', '舆情反打', '粉圈运营'];
const directiveTargets = ['路人盘', '团粉盘', '唯粉盘', 'CP粉'];

function getDirectiveType(index: number) {
  return directiveTypes[index % directiveTypes.length];
}

function getDirectiveCost(index: number) {
  return [8000, 16000, 24000, 12000][index % 4];
}

function getDirectiveRisk(index: number) {
  return [28, 62, 84, 45][index % 4];
}

function getDirectiveTarget(index: number) {
  return directiveTargets[index % directiveTargets.length];
}
</script>

<template>
  <div class="director-board">
    <div class="director-board-header">
      <span class="board-kicker">导播台 / 方案调度</span>
      <span class="board-hint">选择一套执行方案，系统会立即结算舆情与人气。</span>
    </div>
    <button v-for="(choice, index) in choices" :key="index" @click="emit('selectChoice', choice)" class="directive-card">
      <span class="directive-topline">
        <span class="directive-type">{{ getDirectiveType(index) }}</span>
        <span class="directive-cost">预算预估 ¥{{ getDirectiveCost(index).toLocaleString() }}</span>
      </span>
      <span class="directive-copy">{{ choice.text }}</span>
      <span class="directive-meta">
        <span>影响：{{ getDirectiveTarget(index) }}</span>
        <span>风险 {{ getDirectiveRisk(index) }}%</span>
      </span>
      <span class="risk-meter">
        <span class="risk-fill" :style="{ width: getDirectiveRisk(index) + '%' }"></span>
      </span>
    </button>
  </div>
</template>
