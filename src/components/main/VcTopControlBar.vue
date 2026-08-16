<script setup lang="ts">
import { Users } from 'lucide-vue-next';
import type { Character } from '../../data/characters';
import { getImageUrl } from '../../utils/imageUrl';

defineProps<{
  mainEventIndex: number;
  mainEventTotal: number;
  isBranchEvent: boolean;
  biasAssessmentScore: number;
  biasAssessmentStatus: string;
  budget: number;
  biasCharacter: Character;
  dashboardOpen: boolean;
  hasTrending: boolean;
}>();

const emit = defineEmits<{
  toggleDashboard: [];
}>();
</script>

<template>
  <header class="control-bar">
    <div class="control-bar-top">
      <div class="bias-chip" aria-label="本期本命">
        <img :src="getImageUrl(biasCharacter.image)" :alt="biasCharacter.name" width="36" height="36" />
        <div>
          <small>本命</small>
          <strong>{{ biasCharacter.name }}</strong>
          <span>评分 {{ biasAssessmentScore }} · {{ biasAssessmentStatus }}</span>
        </div>
      </div>
      <button
        class="top-dashboard-btn"
        :class="{ active: dashboardOpen, 'has-trending': hasTrending }"
        :aria-label="hasTrending ? '打开实时人气看板，当前有热搜' : '打开实时人气看板'"
        :aria-pressed="dashboardOpen"
        @click="emit('toggleDashboard')"
      >
        <Users :size="18" aria-hidden="true" />
        <span>实时看板</span>
        <small v-if="hasTrending">热搜</small>
      </button>
    </div>
    <div class="control-bar-meta">
      <span class="rec-indicator"><i class="rec-dot"></i>REC</span>
      <span class="episode-tag">主线 {{ mainEventIndex }}/{{ mainEventTotal }}{{ isBranchEvent ? ' · 分支' : '' }}</span>
      <span class="budget-display" :class="{ 'budget-low': budget < 30000 }">¥{{ budget.toLocaleString() }}</span>
    </div>
  </header>
</template>
