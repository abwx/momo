<script setup lang="ts">
import type { Character } from '../../data/characters';
import type { SBondPair } from '../../baseLib/serviceLib/type/SBondPair';
import type { SReportActionKey, SStudioClosure, SStudioLedger } from '../../baseLib/serviceLib/type/SStudioLedger';

defineProps<{
  averagePopularity: number;
  fanFactionSummary: string;
  budget: number;
  topBond: SBondPair | null;
  studioTotalSpend: number;
  studioClosure: SStudioClosure[];
  studioLedger: SStudioLedger;
  sortedCharacters: Character[];
}>();

const emit = defineEmits<{
  runReportAction: [type: SReportActionKey];
}>();
</script>

<template>
  <section class="workspace-panel report-workspace">
    <div class="workspace-head">
      <span class="workspace-kicker">DATA ROOM</span>
      <h2>运营报告台</h2>
      <p>根据当前局势开策略会，修正队伍结构、资源分配和舆情风险。</p>
    </div>
    <div class="report-metrics">
      <div><span>平均人气</span><strong>{{ averagePopularity }}</strong></div>
      <div><span>最强粉盘</span><strong>{{ fanFactionSummary }}</strong></div>
      <div><span>剩余预算</span><strong>¥{{ budget.toLocaleString() }}</strong></div>
      <div><span>最强羁绊</span><strong>{{ topBond?.names || '未形成' }}</strong></div>
      <div><span>工作台投入</span><strong>¥{{ studioTotalSpend.toLocaleString() }}</strong></div>
    </div>
    <div class="closure-board compact">
      <div v-for="item in studioClosure" :key="item.key" class="closure-card" :class="item.key">
        <span>{{ item.title }}</span>
        <strong>{{ item.actions }} 次</strong>
        <small>¥{{ item.spend.toLocaleString() }} / {{ item.result }}</small>
      </div>
    </div>
    <div class="workspace-actions">
      <button @click="emit('runReportAction', 'BALANCE')">补短板会议 ¥10,000</button>
      <button @click="emit('runReportAction', 'TOP')">TOP 加码 ¥14,000</button>
      <button @click="emit('runReportAction', 'CLEAN')">舆情复盘 ¥10,000</button>
    </div>
    <p class="formula-note">强度 1-4 档会线性放大成本和收益，投入越高越可控，但预算风险也更明显。</p>
    <div v-if="studioLedger.highlights.length" class="ledger-feed">
      <span v-for="item in studioLedger.highlights" :key="item">{{ item }}</span>
    </div>
    <div class="mini-ranking-board">
      <div v-for="(char, index) in sortedCharacters.slice(0, 6)" :key="char.id">
        <span>{{ index + 1 }}. {{ char.name }}</span>
        <strong>{{ char.popularity }}</strong>
      </div>
    </div>
  </section>
</template>
