<script setup lang="ts">
import type { Character } from '../../data/characters';
import type { TrendingTopic } from '../../data/type/TrendingTopic';
import type { SCapitalInterventionOutcome } from '../../baseLib/serviceLib/type/SCapitalInterventionOutcome';
import type { SCapitalIntervention } from '../../baseLib/serviceLib/type/SCapitalIntervention';
import { getImageUrl } from '../../utils/imageUrl';

const props = defineProps<{
  show: boolean;
  sortedCharacters: Character[];
  highlightedCharIds: Set<string>;
  trendingQueue: TrendingTopic[];
  budget: number;
  capitalBoostCost: number;
  capitalSuppressCost: number;
  capitalInterventionPhase: boolean;
  capitalInterventionAvailable: boolean;
  capitalOutcomes: Record<string, { boost: SCapitalInterventionOutcome; suppress: SCapitalInterventionOutcome }>;
  biasCharacterId: string;
  biasAssessmentStatus: string;
}>();

const emit = defineEmits<{
  close: [];
  capitalIntervention: [characterId: string, intervention: 'BOOST' | 'SUPPRESS'];
}>();

function isTrending(character: Character, trendingQueue: TrendingTopic[]) {
  return trendingQueue.some(topic => topic.name === character.name);
}

function getTrendingLabel(topic: TrendingTopic): string {
  return topic.type === 'POSITIVE' ? '舞台讨论' : '争议讨论';
}

function formatSeatDelta(value: number) {
  return value > 0 ? `+${value}` : `${value}`;
}

function getCapitalOutcome(characterId: string, intervention: SCapitalIntervention): SCapitalInterventionOutcome {
  return props.capitalOutcomes[characterId][intervention === 'BOOST' ? 'boost' : 'suppress'];
}

function isCapitalActionDisabled(character: Character, intervention: SCapitalIntervention): boolean {
  const outcome = getCapitalOutcome(character.id, intervention);
  return !props.capitalInterventionPhase || !props.capitalInterventionAvailable || props.budget < outcome.cost || outcome.popularityDelta === 0 || isBiasSuppression(character, intervention);
}

function isBiasSuppression(character: Character, intervention: SCapitalIntervention): boolean {
  return intervention === 'SUPPRESS' && character.id === props.biasCharacterId;
}

function getCapitalActionTitle(character: Character, intervention: SCapitalIntervention): string {
  const status = getCapitalActionStatus(character, intervention);
  return status || '执行资本调度';
}

function getCapitalActionStatus(character: Character, intervention: SCapitalIntervention): string {
  if (!props.capitalInterventionPhase) return '当前节点已结算';
  if (!props.capitalInterventionAvailable) return '本镜已执行';
  if (isBiasSuppression(character, intervention)) return '本命不可压热，避免误触不可逆策略。';
  const outcome = getCapitalOutcome(character.id, intervention);
  if (props.budget < outcome.cost) return `还差 ¥${(outcome.cost - props.budget).toLocaleString()}`;
  if (outcome.popularityDelta === 0) return intervention === 'BOOST' ? '热度已到上限' : '热度已到下限';
  return '';
}
</script>

<template>
  <Transition name="slide-fade">
    <div v-if="show" class="side-dashboard-overlay" @click.self="emit('close')">
      <div class="side-dashboard">
        <div class="dashboard-header">
          <div class="header-main">
            <h3>实时人气看板</h3>
            <p class="dashboard-instruction">实时查看镜头高光和热搜对成员人气的影响。</p>
          </div>
          <button @click="emit('close')" class="close-dash-btn">关闭</button>
        </div>
        <div class="trending-ticker">
          <span class="ticker-label">当前热搜</span>
          <div v-if="trendingQueue.length" class="ticker-content" aria-live="polite">
            <span v-for="topic in trendingQueue" :key="topic.id">#{{ topic.name }} {{ getTrendingLabel(topic) }}#</span>
          </div>
          <div v-else class="ticker-content ticker-empty">暂无在榜话题</div>
        </div>
        <section class="capital-panel" aria-label="资本下场">
          <div>
            <strong>资本下场</strong>
            <p>本命 {{ biasAssessmentStatus }}。标准抬热 ¥{{ capitalBoostCost.toLocaleString() }} / 压热 ¥{{ capitalSuppressCost.toLocaleString() }}，临界时按实际幅度折算，每镜限一次。</p>
          </div>
          <span :class="{ 'capital-panel__used': !capitalInterventionAvailable }">
            {{ !capitalInterventionPhase ? '当前不可调度' : capitalInterventionAvailable ? '等待调度' : '本镜已执行' }}
          </span>
        </section>
        <div class="dashboard-list">
          <div
            v-for="char in sortedCharacters"
            :key="char.id"
            class="dashboard-item"
            :class="{ 'highlight-active': highlightedCharIds.has(char.id), 'is-trending': isTrending(char, trendingQueue) }"
            :title="`定位: ${char.personality}`"
          >
            <img :src="getImageUrl(char.image)" :alt="char.name" class="dash-img" loading="lazy" decoding="async" />
            <div class="dash-info">
              <div class="dash-name">
                {{ char.name }}
                <span v-if="isTrending(char, trendingQueue)" class="trending-tag-mini">热搜中</span>
              </div>
              <div class="dash-pop-bar">
                <div class="dash-pop-progress" :style="{ width: Math.min(char.popularity, 120) + '%' }"></div>
              </div>
            </div>
            <div class="dash-num">{{ char.popularity }}</div>
            <div class="capital-actions" :aria-label="`管理 ${char.name} 热度`">
              <button
                type="button"
                :disabled="isCapitalActionDisabled(char, 'BOOST')"
                :title="getCapitalActionTitle(char, 'BOOST')"
                :aria-label="`抬升 ${char.name} 热度 ${formatSeatDelta(getCapitalOutcome(char.id, 'BOOST').popularityDelta)}，预计席位 ${formatSeatDelta(getCapitalOutcome(char.id, 'BOOST').seatDelta)} 分，费用 ¥${getCapitalOutcome(char.id, 'BOOST').cost.toLocaleString()}`"
                @click="emit('capitalIntervention', char.id, 'BOOST')"
              >
                <span>抬热 {{ formatSeatDelta(getCapitalOutcome(char.id, 'BOOST').popularityDelta) }}</span>
                <small>席位 {{ formatSeatDelta(getCapitalOutcome(char.id, 'BOOST').seatDelta) }} · ¥{{ getCapitalOutcome(char.id, 'BOOST').cost.toLocaleString() }}</small>
                <small v-if="getCapitalActionStatus(char, 'BOOST')" class="capital-action-status">{{ getCapitalActionStatus(char, 'BOOST') }}</small>
              </button>
              <button
                type="button"
                :disabled="isCapitalActionDisabled(char, 'SUPPRESS')"
                :title="getCapitalActionTitle(char, 'SUPPRESS')"
                :aria-label="`压低 ${char.name} 热度 ${formatSeatDelta(getCapitalOutcome(char.id, 'SUPPRESS').popularityDelta)}，预计席位 ${formatSeatDelta(getCapitalOutcome(char.id, 'SUPPRESS').seatDelta)} 分，费用 ¥${getCapitalOutcome(char.id, 'SUPPRESS').cost.toLocaleString()}`"
                @click="emit('capitalIntervention', char.id, 'SUPPRESS')"
              >
                <span>压热 {{ formatSeatDelta(getCapitalOutcome(char.id, 'SUPPRESS').popularityDelta) }}</span>
                <small>席位 {{ formatSeatDelta(getCapitalOutcome(char.id, 'SUPPRESS').seatDelta) }} · ¥{{ getCapitalOutcome(char.id, 'SUPPRESS').cost.toLocaleString() }}</small>
                <small v-if="getCapitalActionStatus(char, 'SUPPRESS')" class="capital-action-status">{{ getCapitalActionStatus(char, 'SUPPRESS') }}</small>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>
