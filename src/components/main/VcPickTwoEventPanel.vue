<script setup lang="ts">
import type { Character } from '../../data/characters';
import { getImageUrl } from '../../utils/imageUrl';

defineProps<{
  candidates: Character[];
  selectedPair: Character[];
  selectedPairBondValue: number;
}>();

const emit = defineEmits<{
  toggleSelection: [character: Character];
  submit: [];
}>();

function isSelected(character: Character, selectedPair: Character[]) {
  return selectedPair.some(item => item.id === character.id);
}
</script>

<template>
  <div>
    <p class="pick-two-hint">请从人气最高的前五名中选择两位成员（已选 {{ selectedPair.length }} / 2）</p>
    <p v-if="selectedPair.length === 2" class="bond-preview">
      {{ selectedPair[0].name }} × {{ selectedPair[1].name }}
      当前羁绊：{{ selectedPairBondValue }}
    </p>
    <div class="roster mini">
      <div
        v-for="character in candidates"
        :key="character.id"
        class="char-card-premium mini-selectable"
        :class="{ selected: isSelected(character, selectedPair) }"
        @click="emit('toggleSelection', character)"
      >
        <div class="char-frame">
          <div class="image-container">
            <img :src="getImageUrl(character.image)" :alt="character.name" class="main-img-fit" loading="lazy" decoding="async" />
            <div class="vignette-overlay"></div>
          </div>
          <div v-if="isSelected(character, selectedPair)" class="selection-indicator">已选择</div>
        </div>
        <div class="char-info-overlay mini">
          <div class="char-name-premium mini">{{ character.name }}</div>
        </div>
      </div>
    </div>
    <button @click="emit('submit')" :disabled="selectedPair.length !== 2" class="start-button centered">确认人选</button>
  </div>
</template>
