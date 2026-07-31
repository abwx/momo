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
  items: SSeasonScoreItem[];
}
