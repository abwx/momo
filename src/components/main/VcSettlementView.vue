<script setup lang="ts">
import { Download, RotateCcw } from 'lucide-vue-next';
import type { ProducerTitle } from '../../data/type/SettlementReport';
import type { SProducerIdentity } from '../../baseLib/serviceLib/SGameNarrative';
import type { SSeasonRecap } from '../../baseLib/serviceLib/type/SSeasonRecap';

const props = defineProps<{
  producerTitle: ProducerTitle;
  isGeneratingPoster: boolean;
  producerIdentity: SProducerIdentity;
  seasonRecap: SSeasonRecap;
  biasName: string;
  biasBreakthrough: boolean;
  finalClassLabel: string;
}>();

const emit = defineEmits<{ sharePoster: []; restart: [] }>();
</script>

<template>
  <main class="end-screen" aria-label="赛季结算报告">
    <div class="settlement-stage">
      <header class="settlement-stage-head">
        <span>突围模拟器</span>
        <span>SEASON COMPLETE</span>
      </header>

      <section class="settlement-report" aria-labelledby="settlement-title">
        <div class="report-masthead">
          <p>四期收官</p>
          <h1 id="settlement-title">制作评级和本命席位，都有答案</h1>
        </div>

        <div class="report-hero">
          <div class="grade-stamp" :style="{ color: producerTitle.gradeColor, borderColor: producerTitle.gradeColor }">
            <span>综合评级</span>
            <strong>{{ producerTitle.grade }}</strong>
            <small>OFFICIAL GRADE</small>
          </div>
          <div class="report-identity">
            <span class="report-kicker">本季制作人</span>
            <h2>{{ producerTitle.name }}</h2>
            <p>{{ producerIdentity.detail }}</p>
          </div>
        </div>

        <section class="bias-outcome" :class="{ breakthrough: biasBreakthrough }" aria-label="本命突围结果">
          <span>本命席位</span>
          <strong>{{ biasBreakthrough ? `${biasName} 突围成功` : `${biasName} 暂未进入一班` }}</strong>
          <p>赛季收官时位于{{ finalClassLabel }}。{{ biasBreakthrough ? '这一季的镜头和考核都接住了。' : '资源会变少，但下一季仍有升班机会。' }}</p>
        </section>

        <section class="season-story" aria-label="本季制作叙事">
          <article class="story-route">
            <span>{{ seasonRecap.route.label }}</span>
            <h3>{{ seasonRecap.route.title }}</h3>
            <p>{{ seasonRecap.route.detail }}</p>
          </article>
          <div class="story-consequences">
            <article class="story-gain">
              <span>{{ seasonRecap.gain.label }}</span>
              <strong>{{ seasonRecap.gain.title }}</strong>
              <p>{{ seasonRecap.gain.detail }}</p>
            </article>
            <article class="story-cost">
              <span>{{ seasonRecap.cost.label }}</span>
              <strong>{{ seasonRecap.cost.title }}</strong>
              <p>{{ seasonRecap.cost.detail }}</p>
            </article>
          </div>
          <article class="story-choice">
            <span>{{ seasonRecap.choice.label }}</span>
            <strong>{{ seasonRecap.choice.title }}</strong>
            <p>{{ seasonRecap.choice.detail }}</p>
          </article>
        </section>
      </section>

      <footer class="settlement-footer">
        <button class="secondary-button poster-btn" type="button" :disabled="isGeneratingPoster" @click="emit('sharePoster')">
          <Download :size="18" aria-hidden="true" />
          {{ isGeneratingPoster ? '生成中...' : '下载战报海报' }}
        </button>
        <button class="start-button restart-btn-refined" type="button" @click="emit('restart')">
          <RotateCcw :size="19" aria-hidden="true" />
          开启下一季运营计划
        </button>
        <p class="settlement-disclaimer">非官方同人模拟，与时代峰峻及相关艺人、节目无关。内容纯属虚构。</p>
      </footer>
    </div>
  </main>
</template>
