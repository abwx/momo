<script setup lang="ts">
import { computed, ref } from 'vue';
import { ArrowUpRight, BookOpen, Clapperboard, Save, Trophy } from 'lucide-vue-next';
import type { GameAchievementResult } from '../../data/type/GameAchievement';

const props = defineProps<{
  hasSavedGame: boolean;
  savedGameLabel: string;
  achievementCount: number;
  totalAchievementCount: number;
  characterCount: number;
  averagePopularity: number;
  achievements: GameAchievementResult[];
}>();

const emit = defineEmits<{
  continueSavedGame: [];
  enterRoster: [];
  discardSavedGame: [];
  backHome: [];
}>();

type BriefKey = 'rules' | 'archive' | 'save';
const activeBrief = ref<BriefKey>('rules');

const sortedAchievements = computed(() => {
  return [...props.achievements].sort((left, right) => Number(right.isUnlocked) - Number(left.isUnlocked));
});

const archiveProgress = computed(() => {
  if (!props.totalAchievementCount) return 0;
  return Math.round((props.achievementCount / props.totalAchievementCount) * 100);
});
</script>

<template>
  <main class="producer-hub">
    <section class="season-poster">
      <p class="season-tag">SEASON 04 · EP.01</p>
      <p class="season-kicker">突围模拟器</p>
      <h1>本命能进一班吗？</h1>
      <p class="season-copy">四期考核，期末重排班籍。一班资源更完整，二班要靠追分翻盘。</p>
      <div class="season-actions">
        <button v-if="hasSavedGame" class="season-start continue" @click="emit('continueSavedGame')">
          <span>继续剪辑 <ArrowUpRight :size="17" aria-hidden="true" /></span>
          <small>{{ savedGameLabel }}</small>
        </button>
        <button class="season-start" @click="emit('enterRoster')">
          <span>选本命开录 <Clapperboard :size="17" aria-hidden="true" /></span>
          <small>排班 · 机位 · 考核</small>
        </button>
      </div>
      <div class="show-stats" aria-label="本期节目数据">
        <span><strong>{{ characterCount }}</strong> 位成员</span>
        <span><strong>{{ averagePopularity }}%</strong> 均热</span>
        <span><strong>{{ achievementCount }}/{{ totalAchievementCount }}</strong> 档案</span>
      </div>
    </section>

    <section class="hub-play-panels">
      <nav class="hub-panel-tabs" aria-label="节目简报">
        <button :class="{ active: activeBrief === 'rules' }" @click="activeBrief = 'rules'">
          <BookOpen :size="18" aria-hidden="true" />玩法
        </button>
        <button :class="{ active: activeBrief === 'archive' }" @click="activeBrief = 'archive'">
          <Trophy :size="18" aria-hidden="true" />档案
        </button>
        <button :class="{ active: activeBrief === 'save' }" @click="activeBrief = 'save'">
          <Save :size="18" aria-hidden="true" />存档
        </button>
      </nav>
      <div v-if="activeBrief === 'rules'" class="quest-card">
        <strong>你要守住的，是一班席位</strong>
        <p>选题推进考核分，加戏锁机位，粉盘托举本命。每期结束重排班级，名次掉出前七就会降班。</p>
      </div>
      <div v-if="activeBrief === 'archive'" class="quest-card archive-panel">
        <div class="archive-head">
          <div>
            <strong>制作人档案</strong>
            <p>跨季永久点亮，不绑定本季 KPI。</p>
          </div>
          <span class="archive-count">{{ achievementCount }}/{{ totalAchievementCount }}</span>
        </div>
        <div class="archive-track" aria-hidden="true">
          <div class="archive-fill" :style="{ width: archiveProgress + '%' }"></div>
        </div>
        <ul class="archive-list">
          <li
            v-for="achievement in sortedAchievements"
            :key="achievement.id"
            class="archive-item"
            :class="{ unlocked: achievement.isUnlocked, locked: !achievement.isUnlocked }"
          >
            <span class="archive-mark" aria-hidden="true">{{ achievement.isUnlocked ? '★' : '○' }}</span>
            <div class="archive-copy">
              <strong>{{ achievement.title }}</strong>
              <small>{{ achievement.desc }}</small>
            </div>
            <em>{{ achievement.isUnlocked ? '已点亮' : '待点亮' }}</em>
          </li>
        </ul>
      </div>
      <div v-if="activeBrief === 'save'" class="quest-card danger-zone">
        <strong>{{ hasSavedGame ? '发现未完成录制' : '暂无进行中的录制' }}</strong>
        <button v-if="hasSavedGame" @click="emit('discardSavedGame')">清除存档</button>
        <p v-else>开始新一期后会自动保存进度。</p>
        <button class="hub-back-link" type="button" @click="emit('backHome')">← 回到入口</button>
      </div>
    </section>
  </main>
</template>
