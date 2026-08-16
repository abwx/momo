<script setup lang="ts">
import { ArrowRight, CircleHelp } from 'lucide-vue-next';
import type { Character } from "../../data/characters";
import { getImageUrl } from "../../utils/imageUrl";

defineProps<{
  heroCharacters: Character[];
}>();

const emit = defineEmits<{
  enterRoster: [];
}>();

function getHeroFetchPriority(index: number) {
  return index < 4 ? "high" : "auto";
}
</script>

<template>
  <main class="landing-view">
    <div class="landing-cast" aria-hidden="true">
      <div
        v-for="(char, index) in heroCharacters"
        :key="'cast-' + char.id"
        class="landing-cast-tile"
      >
        <img
          :src="getImageUrl(char.image)"
          alt=""
          loading="eager"
          decoding="async"
          :fetchpriority="getHeroFetchPriority(index)"
        />
      </div>
      <div class="landing-cast-tile landing-mystery-tile">
        <CircleHelp :size="28" stroke-width="1.5" aria-hidden="true" />
        <span>神秘席位</span>
      </div>
    </div>
    <div class="landing-scrim" aria-hidden="true"></div>
    <div class="landing-stage-number" aria-hidden="true">04</div>

    <section class="landing-panel">
      <div class="landing-topline">
        <p class="landing-kicker">四代试录</p>
        <span>15 人入席</span>
      </div>
      <h1 class="landing-brand"><span>四代一班</span><span>模拟器</span></h1>
      <p class="landing-title">把本命送进一班</p>
      <p class="landing-lead">
        四期试录，本命能不能留在一班，由你决定。
      </p>

      <div class="landing-actions">
        <button class="landing-btn primary" @click="emit('enterRoster')">
          <span class="landing-btn-copy">
            <strong>开启试录</strong>
            <small>先选本命，再开录</small>
          </span>
          <ArrowRight :size="20" aria-hidden="true" />
        </button>
      </div>

      <p class="landing-brief">选人气，控镜头，压住风向，争下一个一班席位。</p>

      <p class="landing-disclaimer">
        本作是非官方、非商业的虚构互动模拟，与任何真实艺人、团体、节目、公司或平台无关联。请勿将角色关系、事件与现实人物经历对应或传播。
      </p>
    </section>
  </main>
</template>
