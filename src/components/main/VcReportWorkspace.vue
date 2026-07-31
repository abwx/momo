<script setup lang="ts">
import { computed } from 'vue';
import type { Character } from '../../data/characters';
import type { SClassKey } from '../../baseLib/serviceLib/type/SClassTrack';
import type { SReportActionKey, SStudioClosure, SStudioLedger } from '../../baseLib/serviceLib/type/SStudioLedger';
import type { SReportAvailability } from '../../baseLib/serviceLib/type/SCrisisContext';
import type { SFanFactionState } from '../../baseLib/serviceLib/type/SFanFactionState';

const emit = defineEmits<{
  runReportAction: [type: SReportActionKey];
}>();

const props = defineProps<{
  fanFactionSummary: string;
  fanFactions: SFanFactionState;
  studioClosure: SStudioClosure[];
  studioLedger: SStudioLedger;
  sortedCharacters: Character[];
  classRoster: Record<SClassKey, Character[]>;
  assessmentScore: Record<string, number>;
  reportAvailability: SReportAvailability;
}>();

const assessmentRanking = computed(() => {
  return [...props.sortedCharacters].sort((left, right) => props.assessmentScore[right.id] - props.assessmentScore[left.id]);
});

const classKeys: SClassKey[] = ['CLASS1', 'CLASS2'];
const fanFactionLabels: Record<keyof SFanFactionState, string> = {
  groupFans: '团粉', soloFans: '唯粉', cpFans: 'CP 粉', publicFans: '路人盘', antiFans: '黑词压力',
};

const fanFactionEntries = computed(() => {
  return Object.entries(props.fanFactions).map(([key, value]) => ({ key, label: fanFactionLabels[key as keyof SFanFactionState], value }));
});

function getClassLabel(characterId: string): string {
  return props.classRoster.CLASS1.some(character => character.id === characterId) ? '一班' : '二班';
}
</script>

<template>
  <section class="workspace-panel report-workspace">
    <div class="workspace-head">
      <h2>粉圈复盘台</h2>
      <p>聚焦班级、考核、粉盘和本季操作记录。</p>
    </div>
    <section class="class-report" aria-label="班级与考核排名">
      <header class="class-report-head">
        <strong>班级席位与考核</strong>
        <small>实时按考核分排序</small>
      </header>
      <div class="class-roster-grid">
        <div v-for="classKey in classKeys" :key="classKey" class="class-roster" :class="classKey.toLowerCase()">
          <strong>{{ classKey === 'CLASS1' ? '一班' : '二班' }} · {{ classRoster[classKey].length }} 人</strong>
          <span>{{ classRoster[classKey].map(character => character.name).join(' · ') }}</span>
        </div>
      </div>
      <div class="assessment-rank-list">
        <div v-for="(character, index) in assessmentRanking" :key="character.id" class="assessment-rank">
          <span>{{ index + 1 }}</span>
          <strong>{{ character.name }}</strong>
          <em :class="getClassLabel(character.id)">{{ getClassLabel(character.id) }}</em>
          <b>{{ assessmentScore[character.id] }} 分</b>
        </div>
      </div>
    </section>
    <section class="fan-report" aria-label="粉盘">
      <header class="class-report-head">
        <strong>粉盘</strong>
        <small>当前主力：{{ fanFactionSummary }}</small>
      </header>
      <div class="faction-grid">
        <div v-for="item in fanFactionEntries" :key="item.key" class="faction-card">
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
        </div>
      </div>
    </section>
    <section class="operation-report" aria-label="操作记录">
      <header class="class-report-head"><strong>操作记录</strong></header>
      <div class="closure-board compact">
        <div v-for="item in studioClosure" :key="item.key" class="closure-card" :class="item.key">
          <span>{{ item.title }}</span>
          <strong>{{ item.actions }} 次</strong>
          <small>¥{{ item.spend.toLocaleString() }} / {{ item.result }}</small>
        </div>
      </div>
      <div class="workspace-actions">
        <button v-if="reportAvailability.canBalance" @click="emit('runReportAction', 'BALANCE')">给糊糊补镜头 ¥10,000</button>
        <button v-if="reportAvailability.canClean" @click="emit('runReportAction', 'CLEAN')">压黑热搜 ¥10,000</button>
      </div>
      <p class="formula-note">{{ reportAvailability.reason }}</p>
      <div v-if="studioLedger.highlights.length" class="ledger-feed">
        <span v-for="item in studioLedger.highlights" :key="item">{{ item }}</span>
      </div>
    </section>
  </section>
</template>
