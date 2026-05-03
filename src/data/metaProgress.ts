const META_KEY = "faxiado-meta-v1";

export type MetaProgress = {
  /** 曾完整看过结局的次数（用于二周目彩蛋与洗牌提示） */
  totalClears: number;
};

export function loadMeta(): MetaProgress {
  try {
    const raw = localStorage.getItem(META_KEY);
    if (!raw) return { totalClears: 0 };
    const o = JSON.parse(raw) as MetaProgress;
    return { totalClears: Math.max(0, Number(o.totalClears) || 0) };
  } catch {
    return { totalClears: 0 };
  }
}

export function bumpClears(): number {
  const m = loadMeta();
  const next = { totalClears: m.totalClears + 1 };
  localStorage.setItem(META_KEY, JSON.stringify(next));
  return next.totalClears;
}
