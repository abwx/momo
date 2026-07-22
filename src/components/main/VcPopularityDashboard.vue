<script setup lang="ts">
import type { Character } from '../../data/characters';
import type { TrendingTopic } from '../../data/type/TrendingTopic';
import { getImageUrl } from '../../utils/imageUrl';

defineProps<{
  show: boolean;
  sortedCharacters: Character[];
  topCharacter: Character;
  highlightedCharIds: Set<string>;
  trendingQueue: TrendingTopic[];
  budget: number;
  supportCost: number;
}>();

const emit = defineEmits<{
  close: [];
  supportCharacter: [character: Character];
}>();

function isTrending(character: Character, trendingQueue: TrendingTopic[]) {
  return trendingQueue.some(topic => topic.name === character.name);
}
</script>

<template>
  <Transition name="slide-fade">
    <div v-if="show" class="side-dashboard-overlay" @click.self="emit('close')">
      <div class="side-dashboard">
        <div class="dashboard-header">
          <div class="header-main">
            <h3>实时人气看板</h3>
            <p class="dashboard-instruction">点击应援可消耗 ¥{{ supportCost.toLocaleString() }} 提升成员人气。</p>
          </div>
          <button @click="emit('close')" class="close-dash-btn">关闭</button>
        </div>
        <div class="trending-ticker">
          <span class="ticker-label">当前热搜</span>
          <div class="ticker-content">#{{ topCharacter.name }} 舞台实力# #镜头法则录制#</div>
        </div>
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
            <div class="dash-ops">
              <button
                @click.stop="emit('supportCharacter', char)"
                class="heart-btn"
                :class="{ insufficient: budget < supportCost }"
                :title="`应援提升人气 (¥${supportCost.toLocaleString()})`"
              >
                应援
              </button>
              <div class="dash-num">{{ char.popularity }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>
