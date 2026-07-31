<script setup lang="ts">
import type { Character } from '../../data/characters';
import type { SFanFactionState } from '../../baseLib/serviceLib/type/SFanFactionState';
import type { SFanProgramKey } from '../../baseLib/serviceLib/type/SStudioLedger';
import VcRangeStepper from './VcRangeStepper.vue';

defineProps<{
  fanFactions: SFanFactionState;
  fanOperationIntensity: number;
  fanProgramBaseCost: Record<SFanProgramKey, number>;
  biasCharacter: Character;
  fanMomentumLabel: string;
  recordingModeLabel: string;
}>();

const emit = defineEmits<{
  changeIntensity: [delta: number];
  setIntensity: [value: number];
  runProgram: [type: SFanProgramKey];
}>();
</script>

<template>
  <section class="workspace-panel fans-workspace">
    <div class="workspace-head">
      <h2>粉圈控评室</h2>
      <p>砸物料改粉盘，立刻影响考核节点的成功率。</p>
    </div>
    <div class="fan-loop-card">
      <span>当前粉圈风向</span>
      <strong>{{ fanMomentumLabel }}</strong>
      <small>当前剪法：{{ recordingModeLabel }} · 唯粉抬「高光」，CP 粉抬「双人」</small>
    </div>
    <p class="formula-note">本命直拍会额外提高本命考核分；其他投放会改变下一轮考核的成功率。</p>
    <div class="faction-grid">
      <div class="faction-card"><span>团粉</span><strong>{{ fanFactions.groupFans }}</strong></div>
      <div class="faction-card"><span>唯粉</span><strong>{{ fanFactions.soloFans }}</strong></div>
      <div class="faction-card"><span>CP 粉</span><strong>{{ fanFactions.cpFans }}</strong></div>
      <div class="faction-card"><span>路人</span><strong>{{ fanFactions.publicFans }}</strong></div>
      <div class="faction-card anti"><span>黑粉</span><strong>{{ fanFactions.antiFans }}</strong></div>
    </div>
    <label class="workspace-slider">
      <span>控评强度 {{ fanOperationIntensity }} 档</span>
      <VcRangeStepper
        :model-value="fanOperationIntensity"
        @update:model-value="emit('setIntensity', $event)"
        @change="emit('changeIntensity', $event)"
      />
    </label>
    <div class="workspace-actions">
      <button @click="emit('runProgram', 'GROUP')">团魂物料 ¥{{ (fanProgramBaseCost.GROUP * fanOperationIntensity).toLocaleString() }}</button>
      <button @click="emit('runProgram', 'SOLO')">{{ biasCharacter.name }} 直拍 ¥{{ (fanProgramBaseCost.SOLO * fanOperationIntensity).toLocaleString() }}</button>
      <button @click="emit('runProgram', 'CP')">糖点切片 ¥{{ (fanProgramBaseCost.CP * fanOperationIntensity).toLocaleString() }}</button>
      <button @click="emit('runProgram', 'PUBLIC')">路人安利 ¥{{ (fanProgramBaseCost.PUBLIC * fanOperationIntensity).toLocaleString() }}</button>
      <button @click="emit('runProgram', 'ANTI')">反黑控评 ¥{{ (fanProgramBaseCost.ANTI * fanOperationIntensity).toLocaleString() }}</button>
    </div>
  </section>
</template>
