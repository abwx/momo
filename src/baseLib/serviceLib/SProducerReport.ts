import type { ProducerTitle, SProducerReportContext } from './type/SProducerReport';

/** Creates the title shown in the season settlement. */
export function SGetProducerTitle(context: SProducerReportContext): ProducerTitle {
  const gap = context.topCharacter.popularity - context.bottomCharacter.popularity;
  return { name: SGetTitleName(context.averagePopularity, gap), color: SGetTitleColor(context.averagePopularity, gap), grade: context.seasonScore.grade, gradeColor: SGetGradeColor(context.seasonScore.grade) };
}

function SGetTitleName(averagePopularity: number, gap: number): string {
  if (averagePopularity > 98) return '内娱救世主';
  if (averagePopularity > 92 && gap < 20) return '群像端水大师';
  if (averagePopularity > 92) return '金牌幕后推手';
  if (gap > 45) return '断层剧本专家';
  if (averagePopularity > 85) return '资深行业总监';
  return averagePopularity < 60 ? '糊团拯救失败者' : averagePopularity < 75 ? '平稳运营助理' : '合格制作人';
}

function SGetTitleColor(averagePopularity: number, gap: number): string {
  if (averagePopularity > 98) return '#fbbf24';
  if (averagePopularity > 92 && gap < 20) return '#22c55e';
  if (averagePopularity > 92) return '#fb7185';
  if (gap > 45) return '#a78bfa';
  if (averagePopularity > 85) return '#38bdf8';
  return averagePopularity < 60 ? '#64748b' : averagePopularity < 75 ? '#94a3b8' : '#38bdf8';
}

function SGetGradeColor(grade: string): string {
  return { SSS: '#fbbf24', SS: '#f97316', S: '#fb7185', A: '#22c55e', B: '#60a5fa', C: '#94a3b8', D: '#78716c', F: '#ef4444' }[grade] || '#94a3b8';
}
