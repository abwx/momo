<script setup lang="ts">
import type { SStudioLedgerKey } from '../../baseLib/serviceLib/type/SStudioLedger';

defineProps<{
  activeStudioPage: SStudioLedgerKey;
}>();

const emit = defineEmits<{
  changePage: [page: SStudioLedgerKey];
}>();

const studioPages: { key: SStudioLedgerKey; label: string }[] = [
  { key: 'recording', label: '录制现场' },
  { key: 'fans', label: '粉丝运营' },
  { key: 'bonds', label: '羁绊企划' },
  { key: 'report', label: '数据报告' },
];
</script>

<template>
  <nav class="studio-nav" aria-label="制作人工作台">
    <button
      v-for="page in studioPages"
      :key="page.key"
      @click="emit('changePage', page.key)"
      :class="{ active: activeStudioPage === page.key }"
    >
      {{ page.label }}
    </button>
  </nav>
</template>
