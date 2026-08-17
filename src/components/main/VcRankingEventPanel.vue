<script setup lang="ts">
import { ref, watch } from 'vue';
import { ArrowDown, ArrowUp } from 'lucide-vue-next';
import type { Character } from '../../data/characters';
import { getImageUrl } from '../../utils/imageUrl';
import { moveListItem } from '../../utils/ranking';

const props = defineProps<{
  hookCandidateIds?: string[];
  rankingList: Character[];
}>();

const emit = defineEmits<{
  'update:rankingList': [value: Character[]];
  submit: [];
}>();

const editableRankingList = ref<Character[]>([...props.rankingList]);

watch(
  () => props.rankingList,
  (list) => {
    editableRankingList.value = [...list];
  }
);

function moveCharacter(index: number, offset: number): void {
  const nextList = moveListItem(editableRankingList.value, index, offset);
  if (nextList === editableRankingList.value) return;
  editableRankingList.value = nextList;
  emit('update:rankingList', nextList);
}
</script>

<template>
  <div class="ranking-area">
    <p class="pick-two-hint">点击箭头调整镜头顺位。第一名拿主叙事，顺位越靠后，席位增益越低。</p>
    <div class="drag-list">
      <div v-for="(element, index) in editableRankingList" :key="element.id" class="drag-item">
          <span class="rank-badge" :class="'rank-' + (index + 1)">{{ index + 1 }}</span>
          <img :src="getImageUrl(element.image)" :alt="element.name" class="drag-img" loading="lazy" decoding="async" />
          <span class="drag-copy">
            <span class="drag-name">{{ element.name }}</span>
            <small v-if="props.hookCandidateIds?.includes(element.id)" class="candidate-signal">粉盘候补</small>
            <small class="drag-heat">热度 {{ element.popularity }}</small>
          </span>
          <span class="drag-actions">
            <button class="drag-move" type="button" aria-label="上移一位" title="上移一位" :disabled="index === 0" @click="moveCharacter(index, -1)">
              <ArrowUp :size="18" aria-hidden="true" />
            </button>
            <button class="drag-move" type="button" aria-label="下移一位" title="下移一位" :disabled="index === editableRankingList.length - 1" @click="moveCharacter(index, 1)">
              <ArrowDown :size="18" aria-hidden="true" />
            </button>
          </span>
      </div>
    </div>
    <button class="primary-btn" @click="emit('submit')">确认镜头顺位</button>
  </div>
</template>
