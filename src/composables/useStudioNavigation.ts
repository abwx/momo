import { ref, type Ref } from 'vue';
import type { StudioViewKey } from '../data/type/StudioView';

interface UseStudioNavigationOptions {
  activeStudioPage: Ref<StudioViewKey>;
  canOpenDashboard: () => boolean;
  isPlanPrompt: () => boolean;
  onBlocked: (message: string) => void;
  onNavigate: () => void;
}

/** Coordinates studio navigation with the current mandatory decision. */
export function useStudioNavigation(options: UseStudioNavigationOptions) {
  const showPopularityDashboard = ref(false);
  return {
    closePopularityDashboard: () => showPopularityDashboard.value = false,
    setActiveStudioPage: (page: StudioViewKey) => _setActiveStudioPage(options, page),
    showPopularityDashboard,
    togglePopularityDashboard: () => _togglePopularityDashboard(options, showPopularityDashboard),
  };
}

function _setActiveStudioPage(options: UseStudioNavigationOptions, page: StudioViewKey): void {
  if (options.isPlanPrompt() && page !== 'fans') return options.onBlocked('请先选择节目计划，或明确跳过本次押注。');
  options.activeStudioPage.value = page;
  options.onNavigate();
}

function _togglePopularityDashboard(options: UseStudioNavigationOptions, dashboard: Ref<boolean>): void {
  if (!options.canOpenDashboard() && !dashboard.value) return options.onBlocked('当前节点不可执行资本调度。');
  dashboard.value = !dashboard.value;
}
