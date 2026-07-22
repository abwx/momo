<script setup lang="ts">
import type { SFanFactionState } from '../../baseLib/serviceLib/type/SFanFactionState';
import type { SOperationCard } from '../../baseLib/serviceLib/type/SOperationCard';
import type { SFanProgramKey } from '../../baseLib/serviceLib/type/SStudioLedger';

defineProps<{
  fanFactions: SFanFactionState;
  fanOperationIntensity: number;
  fanProgramBaseCost: Record<SFanProgramKey, number>;
  operationCards: SOperationCard[];
  usedCardIds: Set<string>;
  budget: number;
  cardFeedback: string;
}>();

const emit = defineEmits<{
  changeIntensity: [delta: number];
  setIntensity: [value: number];
  runProgram: [type: SFanProgramKey];
  useCard: [card: SOperationCard];
}>();

function emitRangeValue(event: Event) {
  const input = event.target as HTMLInputElement;
  emit('setIntensity', Number(input.value));
}
</script>

<template>
  <section class="workspace-panel fans-workspace">
    <div class="workspace-head">
      <span class="workspace-kicker">FAN OPS</span>
      <h2>粉丝运营中心</h2>
      <p>选择不同运营方案，粉圈结构会真实改变，并反过来影响事件反馈。</p>
    </div>
    <div class="faction-grid-large">
      <div class="faction-card group"><span>团粉盘</span><strong>{{ fanFactions.groupFans }}</strong></div>
      <div class="faction-card solo"><span>唯粉盘</span><strong>{{ fanFactions.soloFans }}</strong></div>
      <div class="faction-card cp"><span>CP 粉</span><strong>{{ fanFactions.cpFans }}</strong></div>
      <div class="faction-card public"><span>路人盘</span><strong>{{ fanFactions.publicFans }}</strong></div>
      <div class="faction-card anti"><span>黑粉声量</span><strong>{{ fanFactions.antiFans }}</strong></div>
    </div>
    <label class="workspace-slider">
      <span>投放强度 {{ fanOperationIntensity }} 档</span>
      <div class="range-stepper">
        <button type="button" @click="emit('changeIntensity', -1)">-</button>
        <input :value="fanOperationIntensity" @input="emitRangeValue" type="range" min="1" max="4" step="1" />
        <button type="button" @click="emit('changeIntensity', 1)">+</button>
      </div>
    </label>
    <div class="workspace-actions">
      <button @click="emit('runProgram', 'GROUP')">团建物料 ¥{{ (fanProgramBaseCost.GROUP * fanOperationIntensity).toLocaleString() }}</button>
      <button @click="emit('runProgram', 'SOLO')">单人直拍 ¥{{ (fanProgramBaseCost.SOLO * fanOperationIntensity).toLocaleString() }}</button>
      <button @click="emit('runProgram', 'CP')">双人花絮 ¥{{ (fanProgramBaseCost.CP * fanOperationIntensity).toLocaleString() }}</button>
      <button @click="emit('runProgram', 'PUBLIC')">路人切片 ¥{{ (fanProgramBaseCost.PUBLIC * fanOperationIntensity).toLocaleString() }}</button>
      <button @click="emit('runProgram', 'ANTI')">反黑联动 ¥{{ (fanProgramBaseCost.ANTI * fanOperationIntensity).toLocaleString() }}</button>
    </div>
    <div class="card-hand workspace-card-hand" aria-label="运营卡牌">
      <button
        v-for="card in operationCards"
        :key="card.id"
        class="operation-card"
        :class="[card.kind.toLowerCase(), { used: usedCardIds.has(card.id), locked: budget < card.cost }]"
        :disabled="usedCardIds.has(card.id) || budget < card.cost"
        @click="emit('useCard', card)"
      >
        <span class="card-name">{{ card.name }}</span>
        <span class="card-desc">{{ card.desc }}</span>
        <span class="card-cost">¥{{ card.cost.toLocaleString() }}</span>
      </button>
    </div>
    <p v-if="cardFeedback" class="card-feedback">{{ cardFeedback }}</p>
  </section>
</template>
