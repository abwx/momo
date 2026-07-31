<script setup lang="ts">
import type { Choice } from '../../data/events';
import { SGetNarrativeChoiceHint } from '../../baseLib/serviceLib/SGameNarrative';

defineProps<{
  choices: Choice[];
}>();

const emit = defineEmits<{
  selectChoice: [choice: Choice];
}>();

function getChoiceHint(choice: Choice): string {
  return SGetNarrativeChoiceHint(choice.effectTags);
}
</script>

<template>
  <div class="director-board">
    <div class="director-board-header">
      <strong class="board-kicker">选一套出片思路</strong>
      <span class="board-hint">选定后立刻结算，考核变化会显示在本轮回响里</span>
    </div>
    <button
      v-for="(choice, index) in choices"
      :key="index"
      class="directive-card"
      @click="emit('selectChoice', choice)"
    >
      <span class="directive-index">{{ String(index + 1).padStart(2, '0') }}</span>
      <span class="directive-detail">
        <span class="directive-copy">{{ choice.text }}</span>
        <small v-if="getChoiceHint(choice)" class="narrative-choice-hint">赛季影响：{{ getChoiceHint(choice) }}</small>
        <small v-if="choice.preview" class="narrative-choice-hint risk">{{ choice.preview }}</small>
      </span>
    </button>
  </div>
</template>
