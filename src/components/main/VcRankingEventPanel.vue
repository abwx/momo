<script setup lang="ts">
import { computed } from 'vue';
import draggable from 'vuedraggable';
import type { Character } from '../../data/characters';
import { getImageUrl } from '../../utils/imageUrl';

const props = defineProps<{
  rankingList: Character[];
}>();

const emit = defineEmits<{
  'update:rankingList': [rankingList: Character[]];
  submit: [];
}>();

const editableRankingList = computed({
  get: () => props.rankingList,
  set: (value: Character[]) => emit('update:rankingList', value),
});

</script>

<template>
  <div class="ranking-area">
    <p class="pick-two-hint">拖动成员卡片进行排序。</p>
    <draggable v-model="editableRankingList" item-key="id" class="drag-list" handle=".drag-item" animation="300">
      <template #item="{ element, index }">
        <div class="drag-item">
          <span class="rank-badge" :class="'rank-' + (index + 1)">{{ index + 1 }}</span>
          <img :src="getImageUrl(element.image)" :alt="element.name" class="drag-img" loading="lazy" decoding="async" />
          <span class="drag-name">{{ element.name }}</span>
          <span class="drag-handle">↕</span>
        </div>
      </template>
    </draggable>
    <button @click="emit('submit')" class="start-button submit-rank" style="margin-top: 2rem;">确认排位并发布</button>
  </div>
</template>
