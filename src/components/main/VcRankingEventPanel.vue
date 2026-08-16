<script setup lang="ts">
import { ref, watch } from 'vue';
import draggable from 'vuedraggable';
import type { Character } from '../../data/characters';
import { getImageUrl } from '../../utils/imageUrl';

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

watch(
  editableRankingList,
  (list) => {
    emit('update:rankingList', list);
  },
  { deep: true }
);
</script>

<template>
  <div class="ranking-area">
    <p class="pick-two-hint">拖动卡片决定镜头顺位。第一名拿主叙事，顺位越靠后，席位增益越低。</p>
    <draggable v-model="editableRankingList" item-key="id" class="drag-list" handle=".drag-item" animation="220">
      <template #item="{ element, index }">
        <div class="drag-item">
          <span class="rank-badge" :class="'rank-' + (index + 1)">{{ index + 1 }}</span>
          <img :src="getImageUrl(element.image)" :alt="element.name" class="drag-img" loading="lazy" decoding="async" />
          <span class="drag-copy">
            <span class="drag-name">{{ element.name }}</span>
            <small v-if="props.hookCandidateIds?.includes(element.id)" class="candidate-signal">粉盘候补</small>
            <small class="drag-heat">热度 {{ element.popularity }}</small>
          </span>
          <span class="drag-handle" aria-hidden="true">↕</span>
        </div>
      </template>
    </draggable>
    <button class="primary-btn" @click="emit('submit')">确认镜头顺位</button>
  </div>
</template>
