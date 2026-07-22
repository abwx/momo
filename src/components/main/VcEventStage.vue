<script setup lang="ts">
defineProps<{
  isBreakingNews: boolean;
  currentEventIndex: number;
  totalEvents: number;
  title: string;
  description: string;
}>();
</script>

<template>
  <div class="event-main">
    <div class="event-container" :class="{ 'breaking-news-border': isBreakingNews, 'glitch-anim': isBreakingNews }">
      <div class="event-glass-bg"></div>
      <div class="event-scanline"></div>

      <div class="tech-data top-left-data">REC AUTO</div>
      <div class="tech-data top-right-data">ISO 400</div>
      <div class="tech-data bottom-left-data">F2.8 1/60</div>
      <div class="tech-data bottom-right-data">1080P 60FPS</div>

      <div class="viewfinder-corner top-left"></div>
      <div class="viewfinder-corner top-right"></div>
      <div class="viewfinder-corner bottom-left"></div>
      <div class="viewfinder-corner bottom-right"></div>

      <div v-if="isBreakingNews" class="breaking-news-tag">突发状况 / 紧急舆情</div>
      <div class="progress-bar">
        <div class="progress" :style="{ width: ((currentEventIndex + 1) / totalEvents) * 100 + '%' }"></div>
      </div>
      <h2>{{ title }}</h2>
      <p class="event-description">{{ description }}</p>
      <p class="candidate-hint">候选人说明：当前人气前 5 名成员会进入本环节。</p>

      <slot />
    </div>
  </div>
</template>
