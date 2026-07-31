<script setup lang="ts">
import type { SNarrativeThread } from '../../baseLib/serviceLib/type/SNarrativeThread';

defineProps<{
  isBreakingNews: boolean;
  currentEventIndex: number;
  totalEvents: number;
  episodeTitle: string;
  episodeSummary: string;
  class1Count: number;
  biasClassLabel: string;
  title: string;
  description: string;
  narrativeThreads: SNarrativeThread[];
  focusName: string;
  recordingModeLabel: string;
  recordingPlanMessage: string;
  recordingModifierLabel: string;
  fanModifierLabel: string;
  totalModifierLabel: string;
  recordingReady: boolean;
}>();

const emit = defineEmits<{
  openRecording: [];
}>();
</script>

<template>
  <div class="event-main">
    <div
      class="event-container"
      :class="{ 'breaking-news-border': isBreakingNews, 'glitch-anim': isBreakingNews }"
    >
      <div v-if="isBreakingNews" class="breaking-news-tag">突发状况</div>
      <div class="progress-bar" aria-hidden="true">
        <div
          class="progress"
          :style="{ width: ((currentEventIndex + 1) / totalEvents) * 100 + '%' }"
        ></div>
      </div>
      <div class="episode-context">
        <strong>{{ episodeTitle }}</strong>
        <span>{{ episodeSummary }}</span>
        <em>一班 {{ class1Count }}/7 · 本命目前在{{ biasClassLabel }}</em>
      </div>
      <h2>{{ title }}</h2>
      <p class="event-description">{{ description }}</p>

      <div class="settle-preview" aria-label="本轮结算预览">
        <div class="settle-preview-head">
          <strong>点选项后一起出片</strong>
          <span :class="{ risk: !recordingReady }">
            {{ recordingReady ? '机位已卡好' : '额度不够，机位这轮先空着' }}
          </span>
        </div>
        <p class="settle-plan">{{ recordingPlanMessage || '这轮还没额外加戏' }}</p>
        <div class="settle-stats">
          <span>焦点 {{ focusName }} · {{ recordingModeLabel }}</span>
          <span>机位 {{ recordingModifierLabel }}</span>
          <span>粉圈 {{ fanModifierLabel }}</span>
          <strong>成片 {{ totalModifierLabel }}</strong>
        </div>
        <button type="button" class="settle-setup-btn" @click="emit('openRecording')">
          去卡本轮机位
        </button>
      </div>

      <div v-if="narrativeThreads.length" class="narrative-thread-strip" aria-label="进行中的节目叙事">
        <span v-for="thread in narrativeThreads.slice(0, 3)" :key="thread.key" :class="thread.stage.toLowerCase()">
          {{ thread.title }} · {{ thread.stage === 'HEATED' ? '升温' : '埋钩子' }}
        </span>
      </div>
      <slot />
    </div>
  </div>
</template>
