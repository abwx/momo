import { computed, type ComputedRef } from 'vue';
import type { Character } from '../data/characters';
import { SGetProducerTitle } from '../baseLib/serviceLib/SProducerReport';
import type { SSeasonScore } from '../baseLib/serviceLib/type/SSeasonScore';

interface UseProducerReportOptions {
  averagePopularity: ComputedRef<number>;
  seasonScore: ComputedRef<SSeasonScore>;
  topCharacter: ComputedRef<Character>;
  bottomCharacter: ComputedRef<Character>;
}

/** Connects reactive season state to the pure settlement-report service. */
export function useProducerReport(options: UseProducerReportOptions) {
  const context = computed(() => SCreateReportContext(options));
  return { producerTitle: computed(() => SGetProducerTitle(context.value)) };
}

function SCreateReportContext(options: UseProducerReportOptions) {
  return { averagePopularity: options.averagePopularity.value, seasonScore: options.seasonScore.value, topCharacter: options.topCharacter.value, bottomCharacter: options.bottomCharacter.value };
}
