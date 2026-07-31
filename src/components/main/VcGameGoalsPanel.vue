<script setup lang="ts">
import { computed } from 'vue';
import { Target } from 'lucide-vue-next';
import type { GameGoalResult } from '../../data/type/GameGoal';

const props = withDefaults(defineProps<{
  goals: GameGoalResult[];
  claimedGoalIds: Set<string>;
}>(), {
  claimedGoalIds: () => new Set<string>(),
});

const emit = defineEmits<{
  claimReward: [goalId: string];
}>();

const completeCount = computed(() => props.goals.filter(goal => goal.isComplete).length);

function canClaim(goal: GameGoalResult): boolean {
  return goal.isComplete && Boolean(goal.reward) && !props.claimedGoalIds.has(goal.id);
}
</script>

<template>
  <section v-if="goals.length" class="game-goals-panel goals-page expanded">
    <header class="goals-page-head">
      <Target :size="20" aria-hidden="true" />
      <div>
        <strong>本期 KPI</strong>
        <p>开局随机抽几条，做完领经费。和大厅「档案」不是一套。</p>
      </div>
      <span class="goals-count">{{ completeCount }}/{{ goals.length }}</span>
    </header>
    <div class="goals-list">
      <div v-for="goal in goals" :key="goal.id" class="goal-card" :class="{ complete: goal.isComplete }">
        <div class="goal-head">
          <span>{{ goal.title }}</span>
          <strong>{{ goal.isComplete ? 'DONE' : goal.valueText }}</strong>
        </div>
        <p>{{ goal.desc }}</p>
        <div v-if="goal.reward" class="goal-reward">
          <span>{{ goal.reward.label }} ¥{{ goal.reward.budget.toLocaleString() }}</span>
          <button v-if="canClaim(goal)" type="button" @click="emit('claimReward', goal.id)">领取</button>
          <strong v-else-if="claimedGoalIds.has(goal.id)">已领取</strong>
          <small v-else>{{ goal.isEndOnly ? '季终判定' : '达成后可领取' }}</small>
        </div>
        <div class="goal-track">
          <div class="goal-fill" :style="{ width: goal.progress + '%' }"></div>
        </div>
      </div>
    </div>
  </section>
</template>
