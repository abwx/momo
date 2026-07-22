<script setup lang="ts">
import type { Character } from '../../data/characters';
import type { SRecordingModeKey } from '../../baseLib/serviceLib/type/SStudioLedger';
import { SGetCharacterTraitNames, SGetCharacterTraits } from '../../baseLib/serviceLib/SCharacterTraits';
import { getImageUrl } from '../../utils/imageUrl';

defineProps<{
  recordingMode: SRecordingModeKey;
  focusCharacter: Character;
  eventCandidates: Character[];
  focusCharacterId: string;
  executionIntensity: number;
  recordingIntensityCost: number;
}>();

const emit = defineEmits<{
  selectFocus: [characterId: string];
  setRecordingMode: [mode: SRecordingModeKey];
  changeIntensity: [delta: number];
  setIntensity: [value: number];
}>();

function emitRangeValue(event: Event) {
  const input = event.target as HTMLInputElement;
  emit('setIntensity', Number(input.value));
}
</script>

<template>
  <aside class="live-cockpit">
    <div class="monitor-panel">
      <div class="monitor-topline">
        <span>LIVE MONITOR</span>
        <strong>{{ recordingMode }}</strong>
      </div>
      <div class="focus-preview">
        <img :src="getImageUrl(focusCharacter.image)" :alt="focusCharacter.name" loading="eager" decoding="async" />
        <div>
          <span>当前镜头焦点</span>
          <strong>{{ focusCharacter.name }}</strong>
          <small>{{ SGetCharacterTraitNames(focusCharacter.id) }}</small>
          <small>{{ focusCharacter.personality }} / 人气 {{ focusCharacter.popularity }}</small>
        </div>
      </div>
      <div class="camera-lanes">
        <button
          v-for="char in eventCandidates"
          :key="char.id"
          class="camera-lane"
          :class="{ active: focusCharacterId === char.id }"
          @click="emit('selectFocus', char.id)"
        >
          <img :src="getImageUrl(char.image)" :alt="char.name" loading="lazy" decoding="async" />
          <span>{{ char.name }}</span>
          <small>{{ SGetCharacterTraits(char.id)[0]?.name }}</small>
          <strong>{{ char.popularity }}</strong>
        </button>
      </div>
    </div>

    <div class="control-deck">
      <div class="control-deck-title">录制参数</div>
      <div class="mode-switcher">
        <button @click="emit('setRecordingMode', 'BALANCE')" :class="{ active: recordingMode === 'BALANCE' }">均衡</button>
        <button @click="emit('setRecordingMode', 'FOCUS')" :class="{ active: recordingMode === 'FOCUS' }">聚焦</button>
        <button @click="emit('setRecordingMode', 'DRAMA')" :class="{ active: recordingMode === 'DRAMA' }">抓马</button>
      </div>
      <label class="intensity-control">
        <span>执行强度 {{ executionIntensity }}</span>
        <div class="range-stepper compact">
          <button type="button" @click="emit('changeIntensity', -1)">-</button>
          <input :value="executionIntensity" @input="emitRangeValue" type="range" min="1" max="4" step="1" />
          <button type="button" @click="emit('changeIntensity', 1)">+</button>
        </div>
      </label>
      <div class="control-impact">
        <span>预计消耗</span>
        <strong>¥{{ (executionIntensity * recordingIntensityCost).toLocaleString() }}</strong>
      </div>
    </div>
  </aside>
</template>
