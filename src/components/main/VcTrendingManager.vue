<script setup lang="ts">
import type { TrendingTopic, TrendingTopicAction } from '../../data/type/TrendingTopic';

defineProps<{
  topics: TrendingTopic[];
  budget: number;
}>();

const emit = defineEmits<{
  ignoreTopic: [topicId: string];
  handleTopic: [topicId: string, action: TrendingTopicAction];
}>();

function getTopicAction(topic: TrendingTopic): TrendingTopicAction {
  return topic.type === 'POSITIVE' ? 'BUY' : 'KILL';
}
</script>

<template>
  <div v-if="topics.length > 0" class="trending-manager">
    <p class="manager-hint">发现热搜，请及时处理舆情</p>
    <div v-for="topic in topics" :key="topic.id" class="trending-action-card" :class="topic.type.toLowerCase()">
      <div class="topic-timer-bar" :style="{ width: topic.timeLeft + '%' }"></div>
      <div class="topic-info">
        <span class="topic-type">{{ topic.type === 'POSITIVE' ? '正面热点' : '负面舆情' }}</span>
        <span class="topic-name">#{{ topic.name }} 关联话题#</span>
      </div>
      <div class="topic-ops">
        <span class="topic-cost">成本: ¥{{ topic.cost.toLocaleString() }}</span>
        <div class="op-btn-group">
          <button @click="emit('ignoreTopic', topic.id)" class="op-btn ignore">忽略</button>
          <button @click="emit('handleTopic', topic.id, getTopicAction(topic))" class="op-btn" :class="{ 'insufficient-funds': budget < topic.cost }">
            {{ topic.type === 'POSITIVE' ? '买上热搜' : '压制热度' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
