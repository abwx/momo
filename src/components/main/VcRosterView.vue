<script setup lang="ts">
import { computed, ref } from 'vue';
import type { Character } from '../../data/characters';
import { getImageUrl } from '../../utils/imageUrl';

const props = defineProps<{
  characters: Character[];
  averagePopularity: number;
}>();

const emit = defineEmits<{
  startGame: [characterId: string];
  adjustPopularity: [characterId: string, delta: number];
}>();

const selectedBiasId = ref(props.characters[0]?.id || '');
const selectedBiasCharacter = computed(() =>
  props.characters.find((char) => char.id === selectedBiasId.value)
);

function selectBias(characterId: string): void {
  selectedBiasId.value = characterId;
}

function startWithBias(): void {
  emit('startGame', selectedBiasId.value);
}

function onAdjust(characterId: string, delta: number): void {
  emit('adjustPopularity', characterId, delta);
}
</script>

<template>
  <div class="roster-view">
    <header class="roster-header">
      <div class="roster-hero">
        <h1>选本命，开局热度已随机</h1>
        <p>每人开局热度为本局随机生成的模拟值，不代表现实人气；可用 +/- 微调。本命会影响你的席位目标。</p>
      </div>
      <div class="roster-stats" aria-label="排班概览">
        <div><span>成员</span><strong>{{ characters.length }}</strong></div>
        <div><span>均热</span><strong>{{ averagePopularity }}%</strong></div>
        <div><span>本命</span><strong class="ready">{{ selectedBiasCharacter?.name || '未选' }}</strong></div>
      </div>
    </header>

    <div class="roster-list">
      <article
        v-for="character in characters"
        :key="character.id"
        class="char-row"
        :class="{ selected: selectedBiasId === character.id }"
      >
        <button type="button" class="char-select" :aria-pressed="selectedBiasId === character.id" :aria-label="`选择 ${character.name} 作为本命`" @click="selectBias(character.id)">
          <div class="char-avatar">
            <img :src="getImageUrl(character.image)" :alt="character.name" loading="lazy" decoding="async" />
            <span v-if="selectedBiasId === character.id" class="bias-badge">本命</span>
          </div>
          <div class="char-meta"><strong>{{ character.name }}</strong><span>{{ character.personality }}</span></div>
        </button>
        <div v-if="selectedBiasId === character.id" class="pop-adjuster" :aria-label="`${character.name} 开局热度`">
          <button
            class="adjust-btn"
            type="button"
            :disabled="character.popularity <= 50"
            :aria-label="`降低 ${character.name} 热度`"
            @click="onAdjust(character.id, -2)"
          >
            −
          </button>
          <div class="pop-value-wrap">
            <small>热度</small>
            <span class="pop-value">{{ character.popularity }}</span>
          </div>
          <button
            class="adjust-btn"
            type="button"
            :disabled="character.popularity >= 95"
            :aria-label="`提高 ${character.name} 热度`"
            @click="onAdjust(character.id, 2)"
          >
            +
          </button>
        </div>
        <div v-else class="pop-score" :aria-label="`${character.name} 开局热度 ${character.popularity}`">
          <small>热度</small>
          <strong>{{ character.popularity }}</strong>
        </div>
      </article>
    </div>

    <div class="roster-dock">
      <div>
        <span>本期本命</span>
        <strong>{{ selectedBiasCharacter?.name || '未选择' }}</strong>
      </div>
      <button type="button" @click="startWithBias">带本命开录</button>
    </div>
  </div>
</template>
