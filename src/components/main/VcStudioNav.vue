<script setup lang="ts">
import { MessagesSquare, Sparkles } from 'lucide-vue-next';
import type { Component } from 'vue';
import type { StudioViewKey } from '../../data/type/StudioView';

defineProps<{
  activeStudioPage: StudioViewKey;
  lockedPage: StudioViewKey | null;
  lockedMessage?: string;
}>();

const emit = defineEmits<{
  changePage: [page: StudioViewKey];
}>();

const studioPages: { key: StudioViewKey; label: string; icon: Component }[] = [
  { key: 'event', label: '片场', icon: Sparkles },
  { key: 'fans', label: '粉盘', icon: MessagesSquare },
];
</script>

<template>
  <div class="studio-nav-wrap">
    <p v-if="lockedMessage" class="studio-nav-task" role="status">{{ lockedMessage }}</p>
    <nav class="studio-nav" aria-label="导演工作台">
      <button
        v-for="page in studioPages"
        :key="page.key"
        @click="emit('changePage', page.key)"
        :class="{ active: activeStudioPage === page.key }"
        :aria-current="activeStudioPage === page.key ? 'page' : undefined"
        :disabled="lockedPage !== null && page.key !== lockedPage"
        :title="lockedPage !== null && page.key !== lockedPage ? '请先完成当前粉圈计划决策。' : ''"
      >
        <component :is="page.icon" :size="18" :stroke-width="2" aria-hidden="true" />
        <span>{{ page.label }}</span>
      </button>
    </nav>
  </div>
</template>
