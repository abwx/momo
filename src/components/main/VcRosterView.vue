<script setup lang="ts">
import type { Character } from '../../data/characters';
import { SGetCharacterTraits } from '../../baseLib/serviceLib/SCharacterTraits';
import { getImageUrl } from '../../utils/imageUrl';

defineProps<{
  characters: Character[];
  averagePopularity: number;
}>();

const emit = defineEmits<{
  randomizePopularity: [];
  startGame: [];
  adjustPopularity: [characterId: string, delta: number];
}>();

</script>

<template>
  <div class="roster-view-refined">
    <div class="roster-bg-decor circle-top"></div>
    <div class="roster-bg-decor circle-bottom"></div>
    <div class="mesh-grid"></div>

    <div class="roster-header-container">
      <div class="roster-hero-section-compact">
        <div class="hero-text-mini">
          <h1 class="hero-title-mini">制作人操盘中心</h1>
          <p class="hero-desc-mini">先校准初始人气，再进入录制。成员状态会影响后续事件候选与结算。</p>
        </div>

        <div class="hero-actions-mini">
          <button @click="emit('randomizePopularity')" class="mini-btn secondary">随机人气</button>
          <button @click="emit('startGame')" class="mini-btn primary">开始录制</button>
        </div>
      </div>

      <div class="roster-stats-bar">
        <div class="stat-item">
          <span class="stat-label">总成员</span>
          <span class="stat-value">{{ characters.length }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">平均人气</span>
          <span class="stat-value">{{ averagePopularity }}%</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">制作状态</span>
          <span class="stat-value pulse">READY</span>
        </div>
      </div>
    </div>

    <div class="roster-grid-section">
      <div class="roster-grid-refined">
        <div v-for="character in characters" :key="character.id" class="char-card-premium">
          <div class="char-frame">
            <div class="image-container">
              <img :src="getImageUrl(character.image)" :alt="character.name" class="main-img-fit" loading="lazy" decoding="async" />
              <div class="vignette-overlay"></div>
            </div>
          </div>

          <div class="char-info-overlay">
            <div class="char-name-premium">{{ character.name }}</div>
            <div class="char-role-mini">{{ character.personality }}</div>
            <div class="trait-row">
              <span v-for="trait in SGetCharacterTraits(character.id)" :key="trait.key" class="trait-chip">
                {{ trait.name }}
              </span>
            </div>
          </div>

          <div class="char-controls-premium">
            <div class="pop-metrics">
              <span class="m-label">调节人气</span>
              <span class="m-value">{{ character.popularity }}%</span>
            </div>
            <div class="pop-adjuster-premium">
              <button @click="emit('adjustPopularity', character.id, -1)" class="adjust-btn minus">
                <span class="icon">-</span>
              </button>
              <div class="progress-mini-track">
                <div class="progress-mini-fill" :style="{ width: character.popularity + '%' }"></div>
              </div>
              <button @click="emit('adjustPopularity', character.id, 1)" class="adjust-btn plus">
                <span class="icon">+</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="roster-footer-refined">
      <p>© 2026 偶像制作人模拟器 / 数据仅供娱乐模拟</p>
    </div>
  </div>
</template>
