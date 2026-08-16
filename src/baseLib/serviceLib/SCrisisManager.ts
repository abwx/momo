import type { SCrisisContext, SReportAvailability } from './type/SCrisisContext';

const MAX_CRISIS_COUNT = 3;

export function SShouldTriggerCrisis(context: SCrisisContext, random: () => number): boolean {
  if (context.crisisCount >= MAX_CRISIS_COUNT) return false;
  if (context.eventIndex + 1 - context.lastCrisisEventIndex < 3) return false;
  return random() < SGetCrisisChance(context);
}

export function SGetReportAvailability(context: SCrisisContext): SReportAvailability {
  const canBalance = context.popularityGap >= 12;
  const canClean = context.antiFans >= 30 || context.hasNegativeTrending;
  return { canBalance, canClean, isAvailable: canBalance || canClean, reason: SGetReportReason(canBalance, canClean) };
}

function SGetCrisisChance(context: SCrisisContext): number {
  const signals = [
    context.antiFans >= 30 ? 0.6 : 0,
    context.dramaDebt >= 6 ? 0.56 : 0,
    context.biasPressure >= 8 ? 0.52 : 0,
    context.cpHeat >= 8 ? 0.52 : 0,
    context.hasNegativeTrending ? 0.64 : 0,
  ];
  return Math.max(...signals);
}

function SGetReportReason(canBalance: boolean, canClean: boolean): string {
  if (canBalance && canClean) return '人气断层和黑词一起炸了，两边都得管。';
  if (canBalance) return '人气断层拉开了，该给糊糊补镜头。';
  if (canClean) return '黑词起来了，建议先压一波。';
  return '粉圈暂时稳住了，先不用纠偏。';
}
