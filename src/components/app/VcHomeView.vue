<script setup lang="ts">
import type { Character } from "../../data/characters";
import { getImageUrl } from "../../utils/imageUrl";

defineProps<{
  heroCharacters: Character[];
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
  return index < 4 ? "eager" : "lazy";
}

function getHeroFetchPriority(index: number) {
  return index < 2 ? "high" : "auto";
}
</script>

<template>
  <div class="landing-view">
    <div class="landing-cast" aria-hidden="true">
      <div
        v-for="(char, index) in heroCharacters.slice(0, 6)"
        :key="'cast-' + char.id"
        class="landing-cast-tile"
        :class="'tile-' + (index + 1)"
      >
        <img
          :src="getImageUrl(char.image)"
          alt=""
          :loading="getHeroImageLoading(index)"
          decoding="async"
          :fetchpriority="getHeroFetchPriority(index)"
        />
      </div>
    </div>
    <div class="landing-scrim"></div>

    <div class="landing-panel">
      <p class="landing-kicker">非官方同人 · β</p>
      <h1 class="landing-brand">突围模拟器</h1>
      <p class="landing-title">一班席位战</p>
      <p class="landing-lead">
        四期考核，本命能不能留在一班，由你决定。
      </p>

      <div class="landing-meta" aria-label="制作档案">
        <span>{{ achievementCount }}/{{ totalAchievementCount }} 档案</span>
        <span>{{ heroCharacters.length }} 位成员</span>
      </div>

      <div class="landing-actions">
        <button
          v-if="hasSavedGame"
          class="landing-btn continue"
          @click="emit('continueSavedGame')"
        >
          <span>继续录制</span>
          <small>{{ savedGameLabel }}</small>
        </button>
        <button class="landing-btn primary" @click="emit('enterRoster')">
          <span>进入节目大厅</span>
          <small>先选本命，再开录</small>
        </button>
        <button
          v-if="hasSavedGame"
          class="landing-clear"
          @click="emit('discardSavedGame')"
        >
          清除本地存档
        </button>
      </div>

      <p class="landing-disclaimer">
        非官方同人模拟，与时代峰峻及相关艺人、节目无关。内容纯属虚构，请勿商用转载。存档仅保存在本机。
      </p>
    </div>
  </div>
</template>
