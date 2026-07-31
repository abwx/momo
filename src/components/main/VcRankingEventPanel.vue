<script setup lang="ts">
import { ref, watch } from 'vue';
import draggable from 'vuedraggable';
import type { Character } from '../../data/characters';
import { getImageUrl } from '../../utils/imageUrl';

const props = defineProps<{
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
    <p class="pick-two-hint">拖动成员卡片进行排序</p>
    <draggable v-model="editableRankingList" item-key="id" class="drag-list" handle=".drag-item" animation="220">
      <template #item="{ element, index }">
        <div class="drag-item">
          <span class="rank-badge" :class="'rank-' + (index + 1)">{{ index + 1 }}</span>
          <img :src="getImageUrl(element.image)" :alt="element.name" class="drag-img" loading="lazy" decoding="async" />
          <span class="drag-name">{{ element.name }}</span>
          <span class="drag-handle" aria-hidden="true">↕</span>
        </div>
      </template>
    </draggable>
    <button class="primary-btn" @click="emit('submit')">确认排位并发布</button>
  </div>
</template>
