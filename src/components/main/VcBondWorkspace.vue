<script setup lang="ts">
import type { Character } from '../../data/characters';
import type { SBondPair } from '../../baseLib/serviceLib/type/SBondPair';
import type { SBondProjectKey } from '../../baseLib/serviceLib/type/SStudioLedger';
import { SGetCharacterTraitNames } from '../../baseLib/serviceLib/SCharacterTraits';
import { getImageUrl } from '../../utils/imageUrl';

defineProps<{
  bondCandidateList: Character[];
  selectedBondIds: string[];
  selectedBondCharacters: Character[];
  selectedBondValue: number;
  bondProjectIntensity: number;
  bondProjectBaseCost: Record<SBondProjectKey, number>;
  topBond: SBondPair | null;
}>();

const emit = defineEmits<{
  toggleCandidate: [character: Character];
  changeIntensity: [delta: number];
  setIntensity: [value: number];
  startProject: [type: SBondProjectKey];
}>();

function emitRangeValue(event: Event) {
  const input = event.target as HTMLInputElement;
  emit('setIntensity', Number(input.value));
}
</script>

<template>
  <section class="workspace-panel bonds-workspace">
    <div class="workspace-head">
      <span class="workspace-kicker">PAIR PLAN</span>
      <h2>羁绊企划室</h2>
      <p>选择两位成员安排舞台、直播或 Vlog。羁绊会成长，并影响双人事件收益。</p>
    </div>
    <div class="bond-candidate-grid">
      <button
        v-for="character in bondCandidateList"
        :key="character.id"
        class="bond-candidate"
        :class="{ selected: selectedBondIds.includes(character.id) }"
        @click="emit('toggleCandidate', character)"
      >
        <img :src="getImageUrl(character.image)" :alt="character.name" loading="lazy" decoding="async" />
        <span>{{ character.name }}</span>
        <small>{{ character.personality }}</small>
        <small>{{ SGetCharacterTraitNames(character.id) }}</small>
      </button>
    </div>
    <div class="bond-stage">
      <div class="bond-stage-title">
        {{ selectedBondCharacters.length === 2 ? `${selectedBondCharacters[0].name} × ${selectedBondCharacters[1].name}` : '请选择两位成员' }}
      </div>
      <div class="bond-score">当前羁绊 {{ selectedBondCharacters.length === 2 ? selectedBondValue : 0 }}</div>
      <label class="workspace-slider">
        <span>企划规格 {{ bondProjectIntensity }} 档</span>
        <div class="range-stepper">
          <button type="button" @click="emit('changeIntensity', -1)">-</button>
          <input :value="bondProjectIntensity" @input="emitRangeValue" type="range" min="1" max="4" step="1" />
          <button type="button" @click="emit('changeIntensity', 1)">+</button>
        </div>
      </label>
      <div class="workspace-actions">
        <button @click="emit('startProject', 'STAGE')">合作舞台 ¥{{ (bondProjectBaseCost.STAGE * bondProjectIntensity).toLocaleString() }}</button>
        <button @click="emit('startProject', 'LIVE')">双人直播 ¥{{ (bondProjectBaseCost.LIVE * bondProjectIntensity).toLocaleString() }}</button>
        <button @click="emit('startProject', 'VLOG')">宿舍 Vlog ¥{{ (bondProjectBaseCost.VLOG * bondProjectIntensity).toLocaleString() }}</button>
      </div>
    </div>
    <p v-if="topBond" class="bond-ticker">当前最强羁绊: {{ topBond.names }} / {{ topBond.value }}</p>
  </section>
</template>
