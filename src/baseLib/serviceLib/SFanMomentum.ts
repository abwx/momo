import type { SFanMomentumContext } from './type/SFanMomentum';

const MAX_MOMENTUM = 0.12;

/** Converts the active fan ecosystem into a bounded event outcome modifier. */
export function SGetFanMomentumModifier(context: SFanMomentumContext): number {
  const factions = context.fanFactions;
  const modifier = SGetGroupMomentum(factions.groupFans) + SGetPublicMomentum(factions.publicFans) - SGetAntiPressure(factions.antiFans);
  return SClampMomentum(modifier + SGetEventMomentum(context));
}

function SGetGroupMomentum(value: number): number {
  return SGetPositiveMomentum(value, 55, 0.0009, 0.035);
}

function SGetPublicMomentum(value: number): number {
  return SGetPositiveMomentum(value, 50, 0.0008, 0.032);
}

function SGetAntiPressure(value: number): number {
  return SGetPositiveMomentum(value, 30, 0.002, 0.14);
}

function SGetEventMomentum(context: SFanMomentumContext): number {
  if (context.eventType === 'PICK_TWO') return SGetPositiveMomentum(context.fanFactions.cpFans, 35, 0.001, 0.04);
  if (context.recordingMode === 'FOCUS') return SGetPositiveMomentum(context.fanFactions.soloFans, 45, 0.0009, 0.03);
  return 0;
}

function SGetPositiveMomentum(value: number, threshold: number, scale: number, max: number): number {
  return Math.min(max, Math.max(0, value - threshold) * scale);
}

function SClampMomentum(value: number): number {
  return Math.max(-MAX_MOMENTUM, Math.min(MAX_MOMENTUM, value));
}
