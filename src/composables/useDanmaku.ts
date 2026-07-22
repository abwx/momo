import { ref } from 'vue';
import type { DanmakuItem } from '../data/type/DanmakuItem';

export interface UseDanmakuOptions {
  isActive: () => boolean;
  getRandomName: () => string;
}

const DANMAKU_TEMPLATES = [
  '给 ${name} 递麦，这段太稳了',
  '刚才那个镜头调度有东西',
  '${name} 这波核心位预定',
  '路人被 ${name} 圈到了',
  '节目组又开始制造变量了',
  '这个团综录制有点上头',
  '制作人这波操作可以',
  '公关速度在线，好评',
  '让 ${name} 多出镜一点吧',
  '这组镜头真的有记忆点',
];

export function useDanmaku(options: UseDanmakuOptions) {
  const danmakus = ref<DanmakuItem[]>([]);
  const removeTimers = new Set<number>();
  let danmakuId = 0;
  let danmakuLoopTimer: number | null = null;

  function addDanmaku(text: string) {
    const id = danmakuId++;
    const top = Math.random() * 60 + 5;
    const speed = Math.random() * 8 + 12;
    danmakus.value.push({ id, text, top, speed });
    scheduleDanmakuRemoval(id, speed);
  }

  function triggerEventDanmaku() {
    clearDanmakuLoop();
    danmakuLoopTimer = window.setInterval(() => {
      if (!options.isActive()) return clearDanmakuLoop();
      addDanmaku(createRandomDanmakuText());
    }, 1500);
  }

  function clearDanmakuTimers() {
    clearDanmakuLoop();
    removeTimers.forEach(timer => window.clearTimeout(timer));
    removeTimers.clear();
  }

  function scheduleDanmakuRemoval(id: number, speed: number) {
    const timer = window.setTimeout(() => {
      danmakus.value = danmakus.value.filter(danmaku => danmaku.id !== id);
      removeTimers.delete(timer);
    }, speed * 1000);
    removeTimers.add(timer);
  }

  function clearDanmakuLoop() {
    if (!danmakuLoopTimer) return;
    window.clearInterval(danmakuLoopTimer);
    danmakuLoopTimer = null;
  }

  function createRandomDanmakuText() {
    const template = DANMAKU_TEMPLATES[Math.floor(Math.random() * DANMAKU_TEMPLATES.length)];
    return template.replace('${name}', options.getRandomName());
  }

  return {
    danmakus,
    addDanmaku,
    triggerEventDanmaku,
    clearDanmakuTimers,
  };
}
