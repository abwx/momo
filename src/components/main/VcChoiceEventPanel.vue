<script setup lang="ts">
import type { Choice } from '../../data/type/GameEvent';

defineProps<{
  choices: Choice[];
}>();

const emit = defineEmits<{
  selectChoice: [choice: Choice];
}>();
</script>

<template>
  <div class="tw:grid tw:gap-2">
    <div class="tw:grid tw:gap-1">
      <strong class="tw:text-base tw:font-extrabold tw:leading-6">这一镜只够做一个决定</strong>
      <small class="tw:text-xs tw:leading-5 tw:text-white/55">选项的收益与风险会写入席位、口碑和后续剧情。</small>
    </div>
    <button
      v-for="(choice, index) in choices"
      :key="index"
      type="button"
      class="tw:grid tw:w-full tw:min-h-11 tw:grid-cols-[32px_minmax(0,1fr)] tw:items-start tw:gap-3 tw:rounded-lg tw:border tw:border-white/10 tw:bg-white/5 tw:p-3 tw:text-left tw:transition-[border-color,background-color,transform] active:tw:translate-y-px"
      @click="emit('selectChoice', choice)"
    >
      <span class="tw:grid tw:size-8 tw:place-items-center tw:rounded-lg tw:bg-black/20 tw:font-mono tw:text-xs tw:font-extrabold tw:text-[#ffd166]">
        {{ String(index + 1).padStart(2, '0') }}
      </span>
      <span class="tw:grid tw:min-w-0 tw:gap-1">
        <span class="tw:text-[15px] tw:font-bold tw:leading-6">{{ choice.text }}</span>
        <small v-if="choice.preview" class="tw:text-xs tw:leading-5 tw:text-[#ffd166]">{{ choice.preview }}</small>
      </span>
    </button>
  </div>
</template>
