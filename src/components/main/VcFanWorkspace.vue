<script setup lang="ts">
import { computed } from 'vue';
import type { SFanFactionState } from '../../baseLib/serviceLib/type/SFanFactionState';
import type { SFanPulse } from '../../baseLib/serviceLib/type/SFanPulse';
import type { SProgramPlan, SProgramPlanKey, SProgramPlanOption } from '../../baseLib/serviceLib/type/SProgramPlan';
import type { FanWatchItem } from '../../data/type/FanWatchItem';
import { SGetProgramPlanAvailability } from '../../baseLib/serviceLib/SProgramPlan';

const props = defineProps<{
  fanFactions: SFanFactionState;
  pulse: SFanPulse;
  isPlanPrompt: boolean;
  plan: SProgramPlan | null;
  planOptions: SProgramPlanOption[];
  watchItems: FanWatchItem[];
  factionDeltas: Partial<SFanFactionState>;
  nextStudioTask: string;
  budget: number;
}>();

const factions = computed(() => [
  createFaction('团粉', 'groupFans', props.fanFactions.groupFans, '群像口碑'),
  createFaction('唯粉', 'soloFans', props.fanFactions.soloFans, '资源敏感度'),
  createFaction('CP 粉', 'cpFans', props.fanFactions.cpFans, '互动讨论度'),
  createFaction('路人', 'publicFans', props.fanFactions.publicFans, '新客入口'),
  createFaction('黑词', 'antiFans', props.fanFactions.antiFans, '负面扩散度', true),
]);

const emit = defineEmits<{
  selectPlan: [key: SProgramPlanKey];
  skipPlan: [];
}>();

function getPlanAvailability(investment: number) {
  return SGetProgramPlanAvailability(props.budget, investment);
}

function createFaction(label: string, key: keyof SFanFactionState, value: number, detail: string, isRisk = false) {
  return { label, value, detail, delta: formatDelta(props.factionDeltas[key]), status: getFactionStatus(value, isRisk), tone: getFactionTone(value, isRisk) };
}

function formatDelta(value?: number) {
  if (!value) return '本轮无变化';
  return `本轮 ${value > 0 ? '+' : ''}${value}`;
}

function getFactionStatus(value: number, isRisk: boolean) {
  if (isRisk) return value >= 34 ? '高危' : value >= 20 ? '需盯盘' : '可控';
  return value >= 70 ? '强势' : value >= 45 ? '活跃' : '偏弱';
}

function getFactionTone(value: number, isRisk: boolean) {
  if (isRisk) return value >= 34 ? 'danger' : value >= 20 ? 'watch' : 'steady';
  return value >= 70 ? 'strong' : value >= 45 ? 'active' : 'quiet';
}

function getPulsePhaseLabel(phase: SFanPulse['phase']) {
  return { OPEN: '待处理', FOLLOW_UP: '追踪中', RESOLVED: '已收束' }[phase];
}
</script>

<template>
  <section class="workspace-panel fans-workspace">
    <div class="workspace-head fan-workspace-head">
      <div><h2>粉圈监看</h2><p>把广场反馈转成下一段的节目判断。</p></div>
      <span :class="['fan-phase', pulse.phase.toLowerCase()]">{{ getPulsePhaseLabel(pulse.phase) }}</span>
    </div>
    <p v-if="isPlanPrompt" class="studio-next-task" role="status">{{ nextStudioTask }}</p>
    <section class="pulse-board" :class="{ resolved: pulse.phase === 'RESOLVED' }" aria-label="本轮广场反馈" aria-live="polite">
      <header><span>本轮焦点</span><small>广场热评</small></header>
      <strong>{{ pulse.title }}</strong>
      <p>{{ pulse.quote }}</p>
      <div class="pulse-recommendation"><span>建议处理</span><p>{{ pulse.programHint }}</p><small>{{ pulse.projectHint }}</small></div>
    </section>
    <section v-if="isPlanPrompt" class="plan-board" aria-label="节目计划">
      <header><strong>下一段押什么</strong><small>命中 2 段，才能拿到合作回款</small></header>
      <p class="plan-signal">{{ planOptions[0]?.reason }}</p>
      <button v-for="option in planOptions" :key="option.key" class="plan-option" :disabled="!getPlanAvailability(option.investment).isAffordable" @click="emit('selectPlan', option.key)">
        <span class="plan-option-top"><strong>{{ option.title }}</strong><em>投入 ¥{{ option.investment.toLocaleString() }}</em></span>
        <span class="plan-option-detail">{{ option.detail }}</span>
        <span class="plan-option-meta"><small>{{ option.payoff }}</small><small>{{ option.risk }}</small></span>
        <b>{{ option.seatTradeoff }}</b>
        <small v-if="!getPlanAvailability(option.investment).isAffordable" class="plan-budget-gap">还差 ¥{{ getPlanAvailability(option.investment).budgetGap.toLocaleString() }}</small>
      </button>
      <button class="skip-plan" @click="emit('skipPlan')">不做押注，直接开拍</button>
    </section>
    <section v-else-if="plan" class="plan-status" aria-label="执行中的节目计划">
      <span>执行中的节目计划</span><strong>{{ plan.title }}</strong>
      <p>已执行 {{ plan.partsDone }}/{{ plan.targetParts }} 段 · 命中 {{ plan.matches }}/2 · 前期投入 ¥{{ plan.investment.toLocaleString() }}</p>
      <b>{{ plan.seatTradeoff }}</b>
      <small>在片场选择和这条计划一致的镜头，才能拿到合作回款。</small>
    </section>
    <section v-else class="plan-status" aria-label="粉圈观察">
      <strong>继续观察广场</strong><p>完成三段片场后，会开放下一次节目计划。</p>
    </section>
    <section class="faction-board" aria-label="粉圈情绪">
      <header><strong>粉盘状态</strong><small>高数值会更明显地左右下一轮讨论</small></header>
      <div class="faction-grid">
        <article v-for="faction in factions" :key="faction.label" :class="['faction-item', faction.tone]">
          <div><span>{{ faction.label }}</span><output>{{ faction.value }}</output></div>
          <small :class="{ 'is-positive': !faction.delta.includes('-'), 'is-negative': faction.delta.includes('-') }">{{ faction.delta }}</small>
          <p>{{ faction.status }} · {{ faction.detail }}</p>
        </article>
      </div>
    </section>
    <section class="watch-board" aria-label="情绪来源">
      <header><strong>监看回溯</strong><small>最近三段片场如何累积成现在的广场情绪</small></header>
      <ol v-if="watchItems.length" class="watch-list">
        <li v-for="(item, index) in watchItems" :key="`${item.title}-${index}`">
          <span>{{ index === 0 ? '刚刚' : `回看 ${index}` }}</span>
          <div><p><strong>{{ item.title }}</strong>：{{ item.summary }}</p><small v-if="item.changes.length">{{ item.changes.join(' · ') }}</small></div>
        </li>
      </ol>
      <p v-else class="watch-empty">还没有片场记录，先完成一段录制再回来查看风向。</p>
    </section>
  </section>
</template>
