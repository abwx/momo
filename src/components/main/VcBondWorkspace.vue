<script setup lang="ts">
import type { Character } from '../../data/characters';
import type { SBondPair } from '../../baseLib/serviceLib/type/SBondPair';
import type { SBondProjectKey } from '../../baseLib/serviceLib/type/SStudioLedger';
import { getImageUrl } from '../../utils/imageUrl';
import VcRangeStepper from './VcRangeStepper.vue';

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
</script>

<template>
  <section class="workspace-panel bonds-workspace">
    <div class="workspace-head">
      <h2>开嗑营业室</h2>
      <p>锁两位成员，再砸同框/营业/宿舍糖。</p>
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
        <span class="bond-meta">
          <strong>{{ character.name }}</strong>
          <small>{{ character.personality }}</small>
        </span>
      </button>
    </div>
    <div class="bond-stage">
      <div class="bond-stage-title">
        {{
          selectedBondCharacters.length === 2
            ? `${selectedBondCharacters[0].name} × ${selectedBondCharacters[1].name}`
            : '先锁两位再开嗑'
        }}
      </div>
      <div class="bond-score">
        当前嗑点 {{ selectedBondCharacters.length === 2 ? selectedBondValue : 0 }}
      </div>
      <p class="formula-note">每次营业都会给这两位成员增加考核分，也会抬高双人内容的成片表现。</p>
      <label class="workspace-slider">
        <span>营业强度 {{ bondProjectIntensity }} 档</span>
        <VcRangeStepper
          :model-value="bondProjectIntensity"
          @update:model-value="emit('setIntensity', $event)"
          @change="emit('changeIntensity', $event)"
        />
      </label>
      <div class="workspace-actions">
        <button @click="emit('startProject', 'STAGE')">
          同框舞台 ¥{{ (bondProjectBaseCost.STAGE * bondProjectIntensity).toLocaleString() }}
        </button>
        <button @click="emit('startProject', 'LIVE')">
          双人营业 ¥{{ (bondProjectBaseCost.LIVE * bondProjectIntensity).toLocaleString() }}
        </button>
        <button @click="emit('startProject', 'VLOG')">
          宿舍糖点 ¥{{ (bondProjectBaseCost.VLOG * bondProjectIntensity).toLocaleString() }}
        </button>
      </div>
    </div>
    <p v-if="topBond" class="bond-ticker">
      本季最强 CP：{{ topBond.names }} / 嗑点 {{ topBond.value }}
    </p>
  </section>
</template>
