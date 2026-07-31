<script setup lang="ts">
defineProps<{
  show: boolean;
  message: string;
  title?: string;
}>();

const emit = defineEmits<{
  confirm: [];
}>();
</script>

<template>
  <Teleport to="body">
    <Transition name="result-modal">
      <div
        v-if="show"
        class="result-modal-root"
        role="dialog"
        aria-modal="true"
        aria-labelledby="result-modal-title"
      >
        <div class="result-modal-backdrop" />
        <div class="result-modal-card">
          <p id="result-modal-title" class="result-modal-kicker">{{ title || '粉圈热报' }}</p>
          <p class="result-modal-text">{{ message }}</p>
          <button type="button" class="result-modal-confirm" @click="emit('confirm')">
            确定
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
