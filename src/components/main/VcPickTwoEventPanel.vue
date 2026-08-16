<script setup lang="ts">
import { computed } from 'vue';
import type { Character } from '../../data/characters';
import type { PickTwoRole } from '../../data/type/GameEvent';
import { getImageUrl } from '../../utils/imageUrl';

const props = defineProps<{
  candidates: Character[];
  hookCandidateIds?: string[];
  selectedPair: Character[];
  selectedPairBondValue: number;
  pairRole?: PickTwoRole;
}>();

const emit = defineEmits<{
  toggleSelection: [character: Character];
  submit: [];
}>();

function isSelected(character: Character, selectedPair: Character[]) {
  return selectedPair.some((item) => item.id === character.id);
}

const pairMetricLabel = computed(() => props.pairRole === 'TEAM' ? '默契值' : '嗑点');
</script>

<template>
  <div class="pick-two-board">
    <p class="pick-two-hint">
      本镜指名两人（已选 {{ selectedPair.length }} / 2）
    </p>
    <p v-if="selectedPair.length === 2" class="bond-preview">
      {{ selectedPair[0].name }} × {{ selectedPair[1].name }} · {{ pairMetricLabel }} {{ selectedPairBondValue }}
    </p>
    <div class="pick-two-grid">
      <button
        v-for="character in candidates"
        :key="character.id"
        type="button"
        class="pick-card"
        :class="{ selected: isSelected(character, selectedPair) }"
        @click="emit('toggleSelection', character)"
      >
        <img :src="getImageUrl(character.image)" :alt="character.name" loading="lazy" decoding="async" />
        <span class="pick-meta">
          <strong>{{ character.name }}</strong>
          <small v-if="hookCandidateIds?.includes(character.id)" class="candidate-signal">粉盘候补</small>
          <small>{{ character.personality }} · {{ character.popularity }} 热度</small>
        </span>
      </button>
    </div>
    <button
      class="primary-btn"
      :disabled="selectedPair.length !== 2"
      @click="emit('submit')"
    >
      确认本镜人选
    </button>
  </div>
</template>
