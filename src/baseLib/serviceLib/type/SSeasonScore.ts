export interface SSeasonScoreItem {
  key: string;
  label: string;
  value: number;
  weight: number;
  contribution: number;
}

export interface SSeasonScore {
  total: number;
  grade: string;
  rawGrade: string;
  gradeCap: string;
  gradeCapReason: string;
  items: SSeasonScoreItem[];
}
