const ACHIEVEMENT_SAVE_KEY = 'momo.producer.achievements.v1';

export function readAchievementIds(): string[] {
  const rawSave = _readRawAchievementSave();
  return rawSave ? _parseAchievementSave(rawSave) : [];
}

export function writeAchievementIds(ids: string[]): void {
  try {
    localStorage.setItem(ACHIEVEMENT_SAVE_KEY, JSON.stringify([...new Set(ids)]));
  } catch {
    return;
  }
}

function _readRawAchievementSave(): string | null {
  try {
    return localStorage.getItem(ACHIEVEMENT_SAVE_KEY);
  } catch {
    return null;
  }
}

function _parseAchievementSave(rawSave: string): string[] {
  try {
    const ids = JSON.parse(rawSave) as string[];
    return Array.isArray(ids) ? ids.filter(id => typeof id === 'string') : [];
  } catch {
    return [];
  }
}
