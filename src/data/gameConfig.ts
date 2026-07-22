export const INITIAL_BUDGET = 100000;
export const MAX_OPERATION_LEVEL = 4;
export const RECORDING_INTENSITY_COST = 2500;
export const HEART_SUPPORT_COST = 5000;

export const FAN_PROGRAM_BASE_COST = {
  GROUP: 6000,
  SOLO: 4500,
  CP: 5000,
  PUBLIC: 7500,
  ANTI: 9000,
} as const;

export const BOND_PROJECT_BASE_COST = {
  STAGE: 8000,
  LIVE: 5500,
  VLOG: 5500,
} as const;
