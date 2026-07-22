<script setup lang="ts">
import type { Character } from '../../data/characters';
import type {
  EventHistoryItem,
  ProducerAnalysisItem,
  ProducerMedal,
  ProducerTitle,
} from '../../data/type/SettlementReport';
import type { GameGoalResult } from '../../data/type/GameGoal';
import type { GameAchievementResult } from '../../data/type/GameAchievement';
import type { SStudioClosure } from '../../baseLib/serviceLib/type/SStudioLedger';
import { getImageUrl } from '../../utils/imageUrl';

defineProps<{
  producerTitle: ProducerTitle;
  settlementReportId: string;
  producerMedals: ProducerMedal[];
  studioClosure: SStudioClosure[];
  producerAnalysis: ProducerAnalysisItem[];
  eventHistory: EventHistoryItem[];
  isHistoryExpanded: boolean;
  sortedCharacters: Character[];
  initialPopularityMap: Record<string, number>;
  isGeneratingPoster: boolean;
  gameGoals: GameGoalResult[];
  achievements: GameAchievementResult[];
}>();

const emit = defineEmits<{
  toggleHistory: [];
  sharePoster: [];
  restart: [];
}>();

</script>

<template>
  <div class="end-screen">
    <div class="settlement-container-refined">
      <div class="magazine-texture"></div>
      <div class="bg-decoration circle-1"></div>
      <div class="bg-decoration circle-2"></div>

      <div class="grade-section-floating">
        <div
          class="grade-circle"
          :class="{ 'high-grade': producerTitle.grade === 'SSS' || producerTitle.grade === 'S' }"
          :style="{ borderColor: producerTitle.gradeColor }"
        >
          <span class="grade-label">综合评定</span>
          <span class="grade-value" :style="{ color: producerTitle.gradeColor }">{{ producerTitle.grade }}</span>
          <div class="grade-stamp">官方认证</div>
        </div>
      </div>

      <div class="settlement-header-refined">
        <div class="producer-badge-refined" :style="{ backgroundColor: producerTitle.color }">制作人评估报告</div>
        <h1 class="honor-title-refined">{{ producerTitle.name }}</h1>
        <p class="honor-subtitle-refined">本期录制综合表现评定报告 / 核心娱乐数据中心出品</p>
        <div class="report-id">NO. {{ settlementReportId }}</div>
      </div>

      <div v-if="producerMedals.length > 0" class="medals-row">
        <div v-for="medal in producerMedals" :key="medal.title" class="medal-card">
          <span class="medal-icon">{{ medal.icon }}</span>
          <div class="medal-info">
            <span class="medal-title">{{ medal.title }}</span>
            <span class="medal-desc">{{ medal.desc }}</span>
          </div>
        </div>
      </div>

      <div v-if="gameGoals.length" class="settlement-goals-section">
        <h3 class="section-title-refined">本局制作目标</h3>
        <div class="settlement-goal-board">
          <div v-for="goal in gameGoals" :key="goal.id" class="settlement-goal-card" :class="{ complete: goal.isComplete }">
            <span>{{ goal.title }}</span>
            <strong>{{ goal.isComplete ? '达成' : goal.valueText }}</strong>
            <p>{{ goal.desc }}</p>
          </div>
        </div>
      </div>

      <div v-if="achievements.length" class="settlement-achievements-section">
        <h3 class="section-title-refined">制作档案解锁</h3>
        <div class="settlement-achievement-board">
          <div v-for="achievement in achievements" :key="achievement.id" class="settlement-achievement-card" :class="{ fresh: achievement.isNew }">
            <span>{{ achievement.isNew ? 'NEW' : 'ARCHIVE' }}</span>
            <strong>{{ achievement.title }}</strong>
            <p>{{ achievement.desc }}</p>
          </div>
        </div>
      </div>

      <div class="settlement-closure-section">
        <h3 class="section-title-refined">制作闭环复盘</h3>
        <div class="closure-board">
          <div v-for="item in studioClosure" :key="item.key" class="closure-card" :class="item.key">
            <span>{{ item.title }}</span>
            <strong>{{ item.actions }} 次 / ¥{{ item.spend.toLocaleString() }}</strong>
            <p>{{ item.result }}</p>
            <small>{{ item.detail }}</small>
          </div>
        </div>
      </div>

      <div class="analysis-grid-refined">
        <div v-for="(item, index) in producerAnalysis" :key="index" class="analysis-card-refined" :style="{ animationDelay: (index * 0.1) + 's' }">
          <div class="analysis-card-header">
            <span class="analysis-card-icon">{{ index + 1 }}</span>
            <span class="analysis-card-label">{{ item.label }}</span>
          </div>
          <div class="analysis-card-value">{{ item.value }}</div>
          <p class="analysis-card-detail">{{ item.detail }}</p>
        </div>
      </div>

      <div class="settlement-dual-layout">
        <div class="history-box-refined">
          <h3 class="section-title-refined">录制高光时刻回顾</h3>
          <div class="timeline-container-wrapper" :class="{ 'is-collapsed': !isHistoryExpanded && eventHistory.length > 3 }">
            <div class="timeline-refined">
              <div v-for="(item, index) in (isHistoryExpanded ? eventHistory : eventHistory.slice(0, 3))" :key="index" class="timeline-item-refined">
                <div class="timeline-marker"></div>
                <div class="timeline-content">
                  <div class="timeline-header">
                    <span class="timeline-episode">第 {{ index + 1 }} 期</span>
                    <span class="timeline-title">{{ item.event.title }}</span>
                  </div>
                  <p class="timeline-result">{{ item.result }}</p>
                </div>
              </div>
            </div>
            <div v-if="!isHistoryExpanded && eventHistory.length > 3" class="timeline-fade-mask"></div>
          </div>
          <button v-if="eventHistory.length > 3" @click="emit('toggleHistory')" class="expand-toggle-btn">
            {{ isHistoryExpanded ? '收起回顾' : '展开全部回顾' }}
          </button>
        </div>

        <div class="ranking-box-refined">
          <h3 class="section-title-refined">成员人气最终看板</h3>
          <div class="final-ranking-list">
            <div v-for="(char, index) in sortedCharacters" :key="char.id" class="final-rank-item-refined" :style="{ animationDelay: (index * 0.05) + 's' }">
              <div class="final-rank-num-refined" :class="{ 'top-3': index < 3 }">{{ index + 1 }}</div>
              <div class="final-rank-frame">
                <img :src="getImageUrl(char.image)" :alt="char.name" class="final-rank-img-premium" loading="lazy" decoding="async" />
                <div class="vignette-mini"></div>
              </div>
              <div class="final-rank-info-refined">
                <div class="final-rank-header">
                  <span class="final-rank-name-refined">{{ char.name }}</span>
                  <span v-if="char.popularity > initialPopularityMap[char.id]" class="pop-growth-tag">
                    +{{ char.popularity - initialPopularityMap[char.id] }}
                  </span>
                </div>
                <div class="pop-bar-bg-refined">
                  <div class="pop-bar-refined" :style="{ width: Math.min(char.popularity, 100) + '%', backgroundColor: index < 3 ? '#ff9a9e' : '#5d54a4' }"></div>
                </div>
              </div>
              <span class="pop-value-refined">{{ char.popularity }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="settlement-footer">
        <button @click="emit('sharePoster')" class="secondary-button poster-btn" :disabled="isGeneratingPoster">
          {{ isGeneratingPoster ? '生成中...' : '下载战报海报' }}
        </button>
        <button @click="emit('restart')" class="start-button restart-btn-refined">开启下一期运营计划</button>
        <p class="footer-disclaimer">模拟数据仅供娱乐</p>
      </div>
    </div>
  </div>
</template>
