<script setup lang="ts">
import {
  ChartNoAxesCombined,
  Clapperboard,
  HeartHandshake,
  ListChecks,
  MessagesSquare,
  Sparkles,
} from 'lucide-vue-next';
import type { Component } from 'vue';
import type { StudioViewKey } from '../../data/type/StudioView';

defineProps<{
  activeStudioPage: StudioViewKey;
  reportAvailable: boolean;
}>();

const emit = defineEmits<{
  changePage: [page: StudioViewKey];
}>();

const studioPages: { key: StudioViewKey; label: string; icon: Component }[] = [
  { key: 'event', label: '考核', icon: Sparkles },
  { key: 'recording', label: '加戏', icon: Clapperboard },
  { key: 'goals', label: '目标', icon: ListChecks },
  { key: 'fans', label: '粉盘', icon: MessagesSquare },
  { key: 'bonds', label: '搭档', icon: HeartHandshake },
  { key: 'report', label: '复盘', icon: ChartNoAxesCombined },
];
</script>

<template>
  <nav class="studio-nav" aria-label="粉圈操盘台">
    <button
      v-for="page in studioPages"
      :key="page.key"
      @click="emit('changePage', page.key)"
      :class="{ active: activeStudioPage === page.key }"
      :disabled="page.key === 'report' && !reportAvailable"
      :aria-current="activeStudioPage === page.key ? 'page' : undefined"
    >
      <component :is="page.icon" :size="18" :stroke-width="2" aria-hidden="true" />
      <span>{{ page.label }}</span>
    </button>
  </nav>
</template>
