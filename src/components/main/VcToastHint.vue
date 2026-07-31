<script setup lang="ts">
defineProps<{
  show: boolean;
  message: string;
  title?: string;
  impactLines?: string[];
}>();
</script>

<template>
  <Transition name="toast">
    <div v-if="show" class="toast-hint" role="status" aria-live="polite">
      <div class="toast-icon">LOG</div>
      <div class="toast-body">
        <div class="toast-title">{{ title || '粉圈热报' }}</div>
        <p class="toast-text">{{ message }}</p>
        <div v-if="impactLines?.length" class="toast-impacts">
          <span v-for="impact in impactLines" :key="impact">{{ impact }}</span>
        </div>
      </div>
    </div>
  </Transition>
</template>
