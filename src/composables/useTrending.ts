import { computed, ref } from 'vue';
import type { TrendingTopic } from '../data/type/TrendingTopic';

export interface UseTrendingOptions {
  isActive: () => boolean;
  getRandomName: () => string;
  onExpire: (topic: TrendingTopic) => void;
}

const MAX_TRENDING_TOPICS = 3;
const TRENDING_DURATION = 10000;
const TRENDING_INTERVAL = 100;

export function useTrending(options: UseTrendingOptions) {
  const trendingQueue = ref<TrendingTopic[]>([]);
  const topicTimers = new Map<string, number>();
  const isAnyTrending = computed(() => trendingQueue.value.length > 0);

  function generateTrendingTopic() {
    if (!options.isActive() || trendingQueue.value.length >= MAX_TRENDING_TOPICS) return;
    const topic = createTrendingTopic(options.getRandomName());
    trendingQueue.value.push(topic);
    startTopicTimer(topic);
  }

  function getTrendingTopic(topicId: string) {
    return trendingQueue.value.find(topic => topic.id === topicId) || null;
  }

  function removeTrendingTopic(topicId: string) {
    clearTopicTimer(topicId);
    trendingQueue.value = trendingQueue.value.filter(topic => topic.id !== topicId);
  }

  function clearTrendingTopics() {
    clearTrendingTimers();
    trendingQueue.value = [];
  }

  function clearTrendingTimers() {
    topicTimers.forEach(timer => window.clearInterval(timer));
    topicTimers.clear();
  }

  function createTrendingTopic(name: string): TrendingTopic {
    const isPositive = Math.random() > 0.4;
    return {
      id: Math.random().toString(36).slice(2, 11),
      name,
      type: isPositive ? 'POSITIVE' : 'NEGATIVE',
      cost: isPositive ? 20000 : 35000,
      timeLeft: 100,
    };
  }

  function startTopicTimer(topic: TrendingTopic) {
    const step = (TRENDING_INTERVAL / TRENDING_DURATION) * 100;
    const timer = window.setInterval(() => updateTopicTimer(topic, step), TRENDING_INTERVAL);
    topicTimers.set(topic.id, timer);
  }

  function updateTopicTimer(topic: TrendingTopic, step: number) {
    topic.timeLeft -= step;
    if (topic.timeLeft > 0 && options.isActive()) return;
    clearTopicTimer(topic.id);
    if (!getTrendingTopic(topic.id)) return;
    if (topic.type === 'NEGATIVE') options.onExpire(topic);
    removeTrendingTopic(topic.id);
  }

  function clearTopicTimer(topicId: string) {
    const timer = topicTimers.get(topicId);
    if (timer) window.clearInterval(timer);
    topicTimers.delete(topicId);
  }

  return {
    trendingQueue,
    isAnyTrending,
    generateTrendingTopic,
    getTrendingTopic,
    removeTrendingTopic,
    clearTrendingTopics,
    clearTrendingTimers,
  };
}
