<script setup lang="ts">
defineProps<{
  show: boolean;
  message: string;
}>();
</script>

<template>
  <Transition name="toast">
    <div v-if="show" class="toast-hint">
      <div class="toast-icon">LOG</div>
      <div class="toast-body">
        <div class="toast-title">执行反馈</div>
        <p class="toast-text">{{ message }}</p>
      </div>
    </div>
  </Transition>
</template>
