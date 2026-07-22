<script setup lang="ts">
import type { GameAchievementResult } from '../../data/type/GameAchievement';

defineProps<{
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
</script>

<template>
  <main class="producer-hub">
    <section class="hub-hero">
      <div>
        <span class="hub-kicker">PRODUCER CONSOLE</span>
        <h1>制作人中控台</h1>
        <p>从这里进入阵容校准、继续录制、查看制作档案。每一局目标、成员特性和事件链都会影响最终战报。</p>
      </div>
      <div class="hub-signal">
        <span>ARCHIVE</span>
        <strong>{{ achievementCount }}/{{ totalAchievementCount }}</strong>
      </div>
    </section>

    <section class="hub-command-grid">
      <button v-if="hasSavedGame" class="hub-command primary" @click="emit('continueSavedGame')">
        <span class="command-index">01</span>
        <strong>继续上次录制</strong>
        <small>{{ savedGameLabel }}</small>
      </button>
      <button class="hub-command primary" @click="emit('enterRoster')">
        <span class="command-index">{{ hasSavedGame ? '02' : '01' }}</span>
        <strong>开启新一期</strong>
        <small>进入阵容校准，抽取本局制作目标</small>
      </button>
      <button class="hub-command" @click="emit('backHome')">
        <span class="command-index">{{ hasSavedGame ? '03' : '02' }}</span>
        <strong>返回片头</strong>
        <small>回到沉浸式入口画面</small>
      </button>
      <button v-if="hasSavedGame" class="hub-command danger" @click="emit('discardSavedGame')">
        <span class="command-index">CLEAR</span>
        <strong>清除本地存档</strong>
        <small>只清除单局进度，不影响制作档案</small>
      </button>
    </section>

    <section class="hub-panels">
      <div class="hub-panel">
        <div class="panel-head">
          <span>ROSTER</span>
          <strong>{{ characterCount }}</strong>
        </div>
        <p>候选成员已载入，当前平均人气 {{ averagePopularity }}%。成员特性会改变录制、羁绊和舆情策略。</p>
      </div>
      <div class="hub-panel">
        <div class="panel-head">
          <span>RUN RULES</span>
          <strong>3</strong>
        </div>
        <p>每局会抽取 3 个制作目标，并根据你的选择触发后续事件，形成不同的录制路线。</p>
      </div>
      <div class="hub-panel archive-panel">
        <div class="panel-head">
          <span>ARCHIVE</span>
          <strong>{{ achievementCount }}/{{ totalAchievementCount }}</strong>
        </div>
        <div class="archive-list">
          <div v-for="achievement in achievements" :key="achievement.id" class="archive-item" :class="{ locked: !achievement.isUnlocked }">
            <span>{{ achievement.isUnlocked ? 'UNLOCKED' : 'LOCKED' }}</span>
            <strong>{{ achievement.title }}</strong>
            <small>{{ achievement.desc }}</small>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>
