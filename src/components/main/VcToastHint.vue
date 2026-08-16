<script setup lang="ts">
import { onUnmounted, watch } from 'vue';
import { Snackbar } from '@varlet/ui';
import '@varlet/ui/es/snackbar/style/index.mjs';

const props = defineProps<{
  show: boolean;
  message: string;
  title?: string;
  impactLines?: string[];
}>();

function getToastContent(): string {
  return [props.title || '粉圈热报', props.message, ...(props.impactLines || [])].join('\n');
}

function updateToast(show: boolean) {
  Snackbar.clear();
  if (show) Snackbar({ content: getToastContent(), position: 'center', duration: 0, forbidClick: true, vertical: true });
}

watch(() => props.show, updateToast);
onUnmounted(() => Snackbar.clear());
</script>
