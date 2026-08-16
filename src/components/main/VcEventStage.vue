<script setup lang="ts">

defineProps<{
  isBreakingNews: boolean;
  episodeTitle: string;
  hookMessage?: string;
  planProgress?: string;
  planTitle?: string;
  title: string;
  description: string;
}>();
</script>

<template>
  <div class="event-main">
    <div
      class="event-container"
      :class="{ 'breaking-news-border': isBreakingNews, 'glitch-anim': isBreakingNews }"
    >
      <div v-if="isBreakingNews" class="breaking-news-tag">突发状况</div>
      <strong class="episode-context">{{ episodeTitle }}</strong>
      <p v-if="hookMessage" class="episode-hook">粉盘回响：{{ hookMessage }}</p>
      <p v-if="planTitle" class="episode-hook plan-hook">粉圈计划：{{ planTitle }} · {{ planProgress }}</p>
      <h2>{{ title }}</h2>
      <p class="event-description">{{ description }}</p>
      <slot />
    </div>
  </div>
</template>
