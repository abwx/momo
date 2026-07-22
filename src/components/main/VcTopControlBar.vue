<script setup lang="ts">
defineProps<{
  currentEventIndex: number;
  totalEvents: number;
  budget: number;
  hasTrending: boolean;
  showDanmaku: boolean;
  reduceMotion: boolean;
}>();

const emit = defineEmits<{
  toggleDashboard: [];
  toggleDanmaku: [];
  toggleReduceMotion: [];
}>();
</script>

<template>
  <div class="control-bar">
    <div class="rec-indicator">
      <span class="rec-dot"></span>
      <span class="rec-text">现场录制中</span>
    </div>
    <div class="episode-tag">第 {{ currentEventIndex + 1 }} / {{ totalEvents }} 节</div>
    <div class="budget-display" :class="{ 'budget-low': budget < 30000 }">
      <span class="budget-label">公关预算</span>
      <span class="budget-value">¥{{ budget.toLocaleString() }}</span>
    </div>
    <div class="control-actions">
      <button @click="emit('toggleDashboard')" class="top-dash-btn" :class="{ 'has-trending': hasTrending }">
        <span class="btn-icon">▣</span>
        <span class="btn-text">人气看板</span>
        <span v-if="hasTrending" class="trending-dot"></span>
      </button>
      <button @click="emit('toggleDanmaku')" class="toggle-button" :class="{ 'off': !showDanmaku }">
        {{ showDanmaku ? '弹幕: 开' : '弹幕: 关' }}
      </button>
      <button @click="emit('toggleReduceMotion')" class="toggle-button" :class="{ 'off': reduceMotion }">
        {{ reduceMotion ? '低动效: 开' : '低动效: 关' }}
      </button>
    </div>
  </div>
</template>
