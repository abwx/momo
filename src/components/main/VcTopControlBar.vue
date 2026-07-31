<script setup lang="ts">
import { Gauge, MessageSquareText, Settings2, Users } from 'lucide-vue-next';
import { ref } from 'vue';
import type { Character } from '../../data/characters';
import type { SEpisodeResources } from '../../baseLib/serviceLib/type/SEpisodeResources';
import { getImageUrl } from '../../utils/imageUrl';

defineProps<{
  currentEventIndex: number;
  totalEvents: number;
  episodeTitle: string;
  class1Count: number;
  biasClassLabel: string;
  biasAssessmentScore: number;
  biasAssessmentStatus: string;
  budget: number;
  episodeResources: SEpisodeResources;
  biasCharacter: Character;
  hasTrending: boolean;
  showDanmaku: boolean;
  reduceMotion: boolean;
}>();

const emit = defineEmits<{
  toggleDashboard: [];
  toggleDanmaku: [];
  toggleReduceMotion: [];
}>();

const isSettingsOpen = ref(false);

function toggleSettings() {
  isSettingsOpen.value = !isSettingsOpen.value;
}
</script>

<template>
  <header class="control-bar">
    <div class="control-bar-top">
      <div class="bias-chip" aria-label="本期本命">
        <img
          :src="getImageUrl(biasCharacter.image)"
          :alt="biasCharacter.name"
          width="40"
          height="40"
        />
        <div>
          <small>本命 · {{ biasClassLabel }}</small>
          <strong>{{ biasCharacter.name }}</strong>
        </div>
      </div>
      <div class="assessment-tag" :title="biasAssessmentStatus">
        <span>{{ biasAssessmentScore }} 分</span>
        <small>{{ biasAssessmentStatus }}</small>
      </div>
    </div>

    <div class="control-bar-meta">
      <div class="rec-indicator" aria-live="polite" aria-label="录制中">
        <span class="rec-dot"></span>
        <span class="rec-text">REC</span>
      </div>
      <div class="class-tag">一班 {{ class1Count }}/7</div>
      <div class="episode-tag">{{ episodeTitle }} · {{ currentEventIndex + 1 }}/{{ totalEvents }}</div>
      <div class="budget-display" :class="{ 'budget-low': budget < 30000 }">
        <span class="budget-label">经费</span>
        <span class="budget-value">¥{{ budget.toLocaleString() }}</span>
      </div>
    </div>

    <div
      class="episode-resources"
      aria-label="本期粉圈额度，每节重置。镜头份和成片权用来卡机位，热搜位用来控评和压黑。"
    >
      <span title="卡机位消耗：高光更吃镜头份">
        <small>镜头份</small>
        <strong>{{ episodeResources.camera }}</strong>
      </span>
      <span title="成片与复盘消耗：抓马更吃成片权">
        <small>成片权</small>
        <strong>{{ episodeResources.edit }}</strong>
      </span>
      <span title="控评、上热搜消耗">
        <small>热搜位</small>
        <strong>{{ episodeResources.buzz }}</strong>
      </span>
    </div>

    <div class="control-actions">
      <button
        class="icon-btn"
        :class="{ 'has-trending': hasTrending }"
        aria-label="人气看板"
        @click="emit('toggleDashboard')"
      >
        <Users :size="18" aria-hidden="true" />
        <span class="btn-text">人气</span>
        <span v-if="hasTrending" class="trending-dot"></span>
      </button>
      <button
        class="icon-btn"
        :aria-expanded="isSettingsOpen"
        aria-label="显示设置"
        @click="toggleSettings"
      >
        <Settings2 :size="18" aria-hidden="true" />
        <span class="btn-text">设置</span>
      </button>
      <div v-if="isSettingsOpen" class="display-settings" aria-label="显示设置">
        <button :aria-pressed="showDanmaku" @click="emit('toggleDanmaku')">
          <MessageSquareText :size="16" aria-hidden="true" />
          {{ showDanmaku ? '弹幕开启' : '弹幕关闭' }}
        </button>
        <button :aria-pressed="!reduceMotion" @click="emit('toggleReduceMotion')">
          <Gauge :size="16" aria-hidden="true" />
          {{ reduceMotion ? '低动效' : '动效开启' }}
        </button>
      </div>
    </div>
  </header>
</template>
