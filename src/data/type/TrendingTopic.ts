export type TrendingTopicType = 'POSITIVE' | 'NEGATIVE';

export type TrendingTopicAction = 'BUY' | 'KILL';

export interface TrendingTopic {
  id: string;
  name: string;
  type: TrendingTopicType;
  cost: number;
  timeLeft: number;
}
