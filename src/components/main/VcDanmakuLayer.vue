<script setup lang="ts">
import type { DanmakuItem } from '../../data/type/DanmakuItem';

defineProps<{
  show: boolean;
  danmakus: DanmakuItem[];
}>();
</script>

<template>
  <div v-if="show" class="danmaku-container">
    <div
      v-for="danmaku in danmakus"
      :key="danmaku.id"
      class="danmaku-item"
      :style="{ top: danmaku.top + '%', animationDuration: danmaku.speed + 's' }"
    >
      {{ danmaku.text }}
    </div>
  </div>
</template>
