<script setup lang="ts">
defineProps<{
  modelValue: number;
  min?: number;
  max?: number;
  compact?: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: number];
  change: [delta: number];
}>();

function onInput(event: Event) {
  const input = event.target as HTMLInputElement;
  emit('update:modelValue', Number(input.value));
}
</script>

<template>
  <div class="range-stepper" :class="{ compact }">
    <button type="button" aria-label="减小" @click="emit('change', -1)">-</button>
    <input
      :value="modelValue"
      :min="min ?? 1"
      :max="max ?? 4"
      step="1"
      type="range"
      @input="onInput"
    />
    <button type="button" aria-label="增大" @click="emit('change', 1)">+</button>
  </div>
</template>
