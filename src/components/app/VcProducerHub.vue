<script setup lang="ts">
import { Clapperboard } from 'lucide-vue-next';

defineProps<{
  characterCount: number;
  averagePopularity: number;
}>();

const emit = defineEmits<{
  enterRoster: [];
  backHome: [];
}>();

</script>

<template>
  <main class="producer-hub">
    <section class="season-poster">
      <p class="season-tag">SEASON 04 · EP.01</p>
      <p class="season-kicker">四代一班模拟器</p>
      <h1>本命能进一班吗？</h1>
      <p class="season-copy">四期试录，期末重排班籍。一班资源更完整，二班要靠追分翻盘。</p>
      <div class="season-actions">
        <button class="season-start" @click="emit('enterRoster')">
          <span>选本命开录 <Clapperboard :size="17" aria-hidden="true" /></span>
          <small>排班 · 片场 · 席位</small>
        </button>
      </div>
      <div class="show-stats" aria-label="本期节目数据">
        <span><strong>{{ characterCount }}</strong> 位成员</span>
        <span><strong>{{ averagePopularity }}%</strong> 均热</span>
        <span><strong>4</strong> 期试录</span>
      </div>
    </section>

    <section class="hub-play-panels">
      <div class="quest-card rules-card">
        <header class="rules-head">
          <strong>玩法</strong>
          <span>四期录制，目标是让本命留在一班</span>
        </header>
        <ol class="rules-flow">
          <li><span>01</span><div><strong>选定本命</strong><p>从 15 位成员中选一位作为本命。开季人气会决定初始班级，但不是最终结果。</p></div></li>
          <li><span>02</span><div><strong>完成片场决策</strong><p>每个录制节点会给出选题、搭档或叙事排序。选择会改变人气、粉圈风向与席位评分。</p></div></li>
          <li><span>03</span><div><strong>应对舆情与机会</strong><p>热搜、突发危机、粉圈计划和双人舞台都会带来资源与风险。高热度不一定等于高席位分。</p></div></li>
          <li><span>04</span><div><strong>期末重排班籍</strong><p>每期结束按席位评分重新分班。前七进入一班，二班成员人气收益较低，但追分更快。</p></div></li>
        </ol>
        <p class="rules-note">过程型成就会即时提示；收官、预算和整季成就在赛季结算时判定。开启新一季后重新计算。</p>
      </div>
      <p class="hub-disclaimer">本作仅为非官方、非商业的虚构互动模拟，不代表或影射任何真实艺人、团体、节目、公司或平台。请理性体验，勿将游戏情节用于现实评价或传播。</p>
      <button class="hub-back-link" type="button" @click="emit('backHome')">← 回到入口</button>
    </section>
  </main>
</template>
