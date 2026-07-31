<script setup lang="ts">
import { Video } from 'lucide-vue-next';
import type { Character } from '../../data/characters';
import type { SEpisodeResourceCost } from '../../baseLib/serviceLib/type/SEpisodeResources';
import type { SRecordingModeKey } from '../../baseLib/serviceLib/type/SStudioLedger';
import { SGetResourceCostText } from '../../baseLib/serviceLib/SGameResources';
import { SGetCharacterTraits } from '../../baseLib/serviceLib/SCharacterTraits';
import { getImageUrl } from '../../utils/imageUrl';
import VcRangeStepper from './VcRangeStepper.vue';

withDefaults(defineProps<{
  recordingMode: SRecordingModeKey;
  focusCharacter: Character;
  biasCharacterId: string;
  eventCandidates: Character[];
  focusCharacterId: string;
  executionIntensity: number;
  recordingIntensityCost: number;
  recordingSuccessModifier: number;
  fanMomentumModifier: number;
  eventSuccessModifier: number;
  recordingResourceCost: SEpisodeResourceCost;
  recordingPlanMessage: string;
}>(), {
  fanMomentumModifier: 0,
  eventSuccessModifier: 0,
  recordingPlanMessage: '',
  biasCharacterId: '',
});

const emit = defineEmits<{
  selectFocus: [characterId: string];
  setRecordingMode: [mode: SRecordingModeKey];
  changeIntensity: [delta: number];
  setIntensity: [value: number];
  backToEvent: [];
}>();

const recordingModeMeta: Record<SRecordingModeKey, { label: string; hint: string }> = {
  BALANCE: { label: '群像', hint: '给糊糊补镜头，偏心压力低' },
  FOCUS: { label: '高光', hint: '机位锁焦点，写入焦点考核；连续领先会逐步递减' },
  DRAMA: { label: '抓马', hint: '热搜拉满，但黑词也会涨' },
};

function formatModifier(modifier: number): string {
  return `${modifier >= 0 ? '+' : ''}${Math.round(modifier * 100)}%`;
}
</script>

<template>
  <aside class="live-cockpit recording-page expanded">
    <header class="recording-page-head">
      <Video :size="20" aria-hidden="true" />
      <div>
        <strong>本轮机位</strong>
        <p>锁好焦点和剪法，回「考核」点选项一起出片。</p>
      </div>
    </header>

    <div class="cockpit-body">
      <div class="monitor-panel">
        <div class="focus-preview" :class="{ 'is-bias': focusCharacterId === biasCharacterId }">
          <img
            :src="getImageUrl(focusCharacter.image)"
            :alt="focusCharacter.name"
            loading="eager"
            decoding="async"
          />
          <div>
            <span>{{ focusCharacterId === biasCharacterId ? '本命焦点' : '临时焦点' }}</span>
            <strong>{{ focusCharacter.name }}</strong>
            <small>{{ focusCharacter.personality }} · {{ focusCharacter.popularity }} 热度</small>
          </div>
        </div>
        <div class="camera-lanes" aria-label="可选机位对象">
          <button
            v-for="char in eventCandidates"
            :key="char.id"
            class="camera-lane"
            :class="{
              active: focusCharacterId === char.id,
              bias: char.id === biasCharacterId,
            }"
            @click="emit('selectFocus', char.id)"
          >
            <img :src="getImageUrl(char.image)" :alt="char.name" loading="lazy" decoding="async" />
            <span class="lane-meta">
              <strong>
                {{ char.name }}
                <mark v-if="char.id === biasCharacterId">本命</mark>
              </strong>
              <small>{{ SGetCharacterTraits(char.id)[0]?.name || char.personality }}</small>
            </span>
            <em>{{ char.popularity }}</em>
          </button>
        </div>
      </div>

      <div class="control-deck">
        <div class="control-deck-title">剪法倾向</div>
        <div class="mode-switcher">
          <button
            v-for="(meta, mode) in recordingModeMeta"
            :key="mode"
            :class="{ active: recordingMode === mode }"
            :title="meta.hint"
            @click="emit('setRecordingMode', mode as SRecordingModeKey)"
          >
            {{ meta.label }}
          </button>
        </div>
        <p class="mode-hint">{{ recordingModeMeta[recordingMode].hint }}</p>
        <p class="plan-message">{{ recordingPlanMessage }}</p>
        <label class="intensity-control">
          <span>加戏强度 {{ executionIntensity }}</span>
          <VcRangeStepper
            compact
            :model-value="executionIntensity"
            @update:model-value="emit('setIntensity', $event)"
            @change="emit('changeIntensity', $event)"
          />
        </label>
        <div class="control-impact">
          <span>本轮额度消耗</span>
          <strong>{{ SGetResourceCostText(recordingResourceCost) || '无' }}</strong>
        </div>
        <div class="control-impact">
          <span>砸经费</span>
          <strong>¥{{ (executionIntensity * recordingIntensityCost).toLocaleString() }}</strong>
        </div>
        <div class="control-impact outcome-impact">
          <span>机位加成</span>
          <strong>{{ formatModifier(recordingSuccessModifier) }}</strong>
        </div>
        <div class="control-impact outcome-impact" :class="{ risk: fanMomentumModifier < 0 }">
          <span>粉圈风向</span>
          <strong>{{ formatModifier(fanMomentumModifier) }}</strong>
        </div>
        <div class="control-impact outcome-impact total-impact" :class="{ risk: eventSuccessModifier < 0 }">
          <span>本轮成片加成</span>
          <strong>{{ formatModifier(eventSuccessModifier) }}</strong>
        </div>
      </div>

      <button type="button" class="recording-back-btn" @click="emit('backToEvent')">
        设好了，回考核出片
      </button>
    </div>
  </aside>
</template>
