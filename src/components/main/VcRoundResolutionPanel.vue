<script setup lang="ts">
import { ArrowRight, CheckCircle2 } from 'lucide-vue-next';
import type { RoundResolution } from '../../data/type/RoundResolution';

defineProps<{
  resolution: RoundResolution;
}>();

const emit = defineEmits<{
  continue: [];
}>();
</script>

<template>
  <section class="tw:mt-3 tw:grid tw:gap-3 tw:rounded-lg tw:border tw:border-[#ffd166]/40 tw:bg-white/5 tw:p-4" aria-label="本期回放">
    <header class="tw:flex tw:items-center tw:gap-2 tw:text-[#ffd166]">
      <CheckCircle2 :size="18" aria-hidden="true" />
      <strong class="tw:text-sm">本期回放</strong>
    </header>
    <p class="tw:border-l-2 tw:border-[#e11d48] tw:pl-3 tw:text-sm tw:font-bold tw:leading-6">{{ resolution.choiceText }}</p>
    <p class="tw:m-0 tw:text-[15px] tw:leading-7 tw:text-white/85">{{ resolution.result }}</p>
    <div v-if="resolution.affectedNames.length" class="tw:flex tw:flex-wrap tw:gap-2" aria-label="受影响成员">
      <span v-for="name in resolution.affectedNames" :key="name" class="tw:rounded-lg tw:bg-white/10 tw:px-2 tw:py-1 tw:text-xs tw:font-bold">
        {{ name }}
      </span>
    </div>
    <ul v-if="resolution.impactLines.length" class="tw:m-0 tw:grid tw:list-none tw:gap-1 tw:p-0 tw:text-xs tw:leading-5 tw:text-[#ffd166]">
      <li v-for="impact in resolution.impactLines" :key="impact">{{ impact }}</li>
    </ul>
    <button
      type="button"
      class="tw:inline-flex tw:min-h-11 tw:items-center tw:justify-center tw:gap-2 tw:rounded-lg tw:bg-[#e11d48] tw:px-4 tw:text-sm tw:font-extrabold tw:text-white tw:transition-transform active:tw:translate-y-px"
      @click="emit('continue')"
    >
      进入下一镜
      <ArrowRight :size="18" aria-hidden="true" />
    </button>
  </section>
</template>
