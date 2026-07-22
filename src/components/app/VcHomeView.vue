<script setup lang="ts">
import type { Character } from '../../data/characters';
import { getImageUrl } from '../../utils/imageUrl';

defineProps<{
  heroCharacters: Character[];
  reversedHeroCharacters: Character[];
  hasSavedGame: boolean;
  savedGameLabel: string;
  achievementCount: number;
  totalAchievementCount: number;
}>();

const emit = defineEmits<{
  continueSavedGame: [];
  enterRoster: [];
  discardSavedGame: [];
}>();

function getHeroImageLoading(index: number) {
  return index < 4 ? 'eager' : 'lazy';
}

function getHeroFetchPriority(index: number) {
  return index < 2 ? 'high' : 'auto';
}
</script>

<template>
  <div class="landing-view-ultimate">
    <div class="ambient-bg">
      <div class="glow-sphere glow-1"></div>
      <div class="glow-sphere glow-2"></div>
      <div class="glow-sphere glow-3"></div>
      <div class="mesh-grid"></div>
    </div>

    <div class="hero-showcase">
      <div class="showcase-track">
        <div v-for="(char, index) in heroCharacters" :key="'hero-' + char.id + '-' + index" class="showcase-item">
          <img :src="getImageUrl(char.image)" :alt="char.name" :loading="getHeroImageLoading(index)" decoding="async" :fetchpriority="getHeroFetchPriority(index)" />
          <div class="showcase-overlay"></div>
          <div class="char-name-tag">{{ char.name }}</div>
        </div>
      </div>
      <div class="showcase-track reverse">
        <div v-for="(char, index) in reversedHeroCharacters" :key="'hero-rev-' + char.id + '-' + index" class="showcase-item">
          <img :src="getImageUrl(char.image)" :alt="char.name" :loading="getHeroImageLoading(index)" decoding="async" :fetchpriority="getHeroFetchPriority(index)" />
          <div class="showcase-overlay"></div>
          <div class="char-name-tag">{{ char.name }}</div>
        </div>
      </div>
    </div>

    <div class="landing-main-content">
      <div class="brand-header">
        <div class="brand-line"></div>
        <span class="brand-text">顶级娱乐圈模拟系统</span>
        <div class="brand-line"></div>
      </div>

      <div class="title-wrapper">
        <h1 class="main-headline">
          <span class="word-top">项目代号</span>
          <span class="word-main">镜头法则</span>
          <span class="word-sub">首席制作人</span>
        </h1>
      </div>

      <div class="mission-box">
        <p class="tagline">镜头的背后，是资源、舆情与选择。</p>
        <p class="description">
          你不是旁观者，而是掌控录制节奏的<strong>首席制作人</strong>。
          调度成员、预算、热搜和粉丝盘，打造这一期的高光结局。
        </p>
        <div class="hero-stats-mini">
          <div class="h-stat">
            <span class="h-val">{{ achievementCount }}/{{ totalAchievementCount }}</span>
            <span class="h-lbl">制作档案</span>
          </div>
          <div class="h-stat">
            <span class="h-val">15</span>
            <span class="h-lbl">候选成员</span>
          </div>
          <div class="h-stat">
            <span class="h-val">实时</span>
            <span class="h-lbl">舆情反馈</span>
          </div>
          <div class="h-stat">
            <span class="h-val">∞</span>
            <span class="h-lbl">运营路线</span>
          </div>
        </div>
      </div>

      <div class="action-portal">
        <button v-if="hasSavedGame" @click="emit('continueSavedGame')" class="portal-btn continue-btn">
          <div class="btn-background"></div>
          <div class="btn-content">
            <span class="btn-label">继续上次录制</span>
            <span class="btn-sub">存档时间：{{ savedGameLabel }}</span>
          </div>
          <div class="btn-shimmer"></div>
        </button>
        <button @click="emit('enterRoster')" class="portal-btn">
          <div class="btn-background"></div>
          <div class="btn-content">
            <span class="btn-label">进入导播间</span>
            <span class="btn-sub">接管镜头、预算与舆情</span>
          </div>
          <div class="btn-shimmer"></div>
        </button>
        <button v-if="hasSavedGame" @click="emit('discardSavedGame')" class="save-clear-btn">清除本地存档</button>
      </div>

      <div class="status-footer">
        <div class="footer-item">
          <span class="f-dot"></span>
          <span class="f-text">导播就绪</span>
        </div>
        <div class="footer-item">
          <span class="f-text">数据流运行中</span>
        </div>
        <div class="footer-item">
          <span class="f-text">© 2026 核心娱乐</span>
        </div>
      </div>
    </div>
  </div>
</template>
