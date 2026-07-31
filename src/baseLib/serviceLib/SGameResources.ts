import type { SEpisodeResourceCost, SEpisodeResources } from './type/SEpisodeResources';

export function SCreateEpisodeResources(): SEpisodeResources {
  return { camera: 3, edit: 2, buzz: 2 };
}

export function SResetEpisodeResources(resources: SEpisodeResources): void {
  Object.assign(resources, SCreateEpisodeResources());
}

export function SCanSpendEpisodeResources(resources: SEpisodeResources, cost: SEpisodeResourceCost): boolean {
  return Object.entries(cost).every(([key, value]) => resources[key as keyof SEpisodeResources] >= (value || 0));
}

export function SSpendEpisodeResources(resources: SEpisodeResources, cost: SEpisodeResourceCost): boolean {
  if (!SCanSpendEpisodeResources(resources, cost)) return false;
  Object.entries(cost).forEach(([key, value]) => resources[key as keyof SEpisodeResources] -= value || 0);
  return true;
}

export function SGetResourceCostText(cost: SEpisodeResourceCost): string {
  return [SGetCostPart('镜头份', cost.camera), SGetCostPart('成片权', cost.edit), SGetCostPart('热搜位', cost.buzz)].filter(Boolean).join(' / ');
}

function SGetCostPart(label: string, value = 0): string {
  return value ? `${label} ${value}` : '';
}
