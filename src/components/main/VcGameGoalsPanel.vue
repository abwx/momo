<script setup lang="ts">
import type { GameGoalResult } from '../../data/type/GameGoal';

defineProps<{
  goals: GameGoalResult[];
}>();
</script>

<template>
  <section v-if="goals.length" class="game-goals-panel">
    <div v-for="goal in goals" :key="goal.id" class="goal-card" :class="{ complete: goal.isComplete }">
      <div class="goal-head">
        <span>{{ goal.title }}</span>
        <strong>{{ goal.isComplete ? 'DONE' : goal.valueText }}</strong>
      </div>
      <p>{{ goal.desc }}</p>
      <div class="goal-track">
        <div class="goal-fill" :style="{ width: goal.progress + '%' }"></div>
      </div>
    </div>
  </section>
</template>
