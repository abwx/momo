<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import { useDialogFocusTrap } from '../../composables/useDialogFocusTrap';

const props = defineProps<{
  show: boolean;
  message: string;
  title?: string;
}>();

const emit = defineEmits<{ confirm: [] }>();

const confirmButton = ref<HTMLButtonElement>();
const dialogElement = ref<HTMLElement>();
const dialogOpen = computed(() => props.show);
const { trapFocus } = useDialogFocusTrap({ initialFocus: confirmButton, isOpen: dialogOpen, root: dialogElement });

/** Moves keyboard focus into the announcement when it becomes visible. */
function focusConfirmButton(show: boolean): void {
  if (!show) return;
  nextTick(() => confirmButton.value?.focus());
}

watch(() => props.show, focusConfirmButton, { flush: 'post' });
</script>

<template>
  <Teleport to="body">
    <Transition name="result-modal">
      <section
        v-if="show"
        class="result-modal-overlay"
        role="presentation"
      >
        <article
          class="result-modal"
          ref="dialogElement"
          role="dialog"
          aria-modal="true"
          aria-labelledby="result-modal-title"
          aria-describedby="result-modal-message"
          @keydown="trapFocus"
        >
          <header class="result-modal__header">
            <span class="result-modal__label">片场快报</span>
            <h2 id="result-modal-title">{{ title || '粉圈热报' }}</h2>
          </header>

          <p id="result-modal-message" class="result-modal__message">
            {{ message }}
          </p>

          <footer class="result-modal__actions">
            <button ref="confirmButton" class="result-modal__confirm" type="button" @click="emit('confirm')">
              确认
            </button>
          </footer>
        </article>
      </section>
    </Transition>
  </Teleport>
</template>

<style scoped>
.result-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: calc(var(--z-overlay) + 20);
  display: grid;
  place-items: center;
  padding: 1rem;
  background: rgba(10, 6, 8, 0.78);
  backdrop-filter: blur(6px);
}

.result-modal {
  position: relative;
  width: min(420px, 100%);
  overflow: hidden;
  border: 1px solid rgba(255, 250, 247, 0.22);
  border-radius: var(--radius);
  background: #161014;
  box-shadow: 0 20px 54px rgba(0, 0, 0, 0.48);
}

.result-modal::before {
  position: absolute;
  top: 0;
  left: 1.1rem;
  width: 5.4rem;
  height: 3px;
  content: '';
  background: var(--red);
}

.result-modal__header,
.result-modal__message,
.result-modal__actions {
  position: relative;
  margin: 0;
  padding-inline: 1.15rem;
}

.result-modal__header {
  display: grid;
  gap: 0.2rem;
  padding-top: 1.3rem;
  padding-bottom: 0.85rem;
  border-bottom: 1px solid var(--line);
}

.result-modal__label {
  color: #ffb3a5;
  font-family: var(--mono);
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.06em;
}

.result-modal__header h2 {
  margin: 0;
  color: var(--ink);
  font-size: 1.16rem;
  letter-spacing: 0;
}

.result-modal__message {
  min-height: 4.6rem;
  padding-top: 1rem;
  padding-bottom: 1rem;
  color: rgba(255, 250, 247, 0.78);
  font-size: 0.88rem;
  font-weight: 600;
  line-height: 1.65;
  text-align: left;
  white-space: pre-line;
}

.result-modal__actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 0.85rem;
  padding-bottom: 1rem;
  border-top: 1px solid var(--line);
}

.result-modal__confirm {
  min-width: 88px;
  min-height: var(--touch);
  border: 1px solid #f38575;
  border-radius: var(--radius-sm);
  color: var(--ink);
  background: #c94b40;
  font-weight: 800;
  transition: transform 0.15s var(--ease), background 0.15s var(--ease);
}

.result-modal__confirm:hover {
  background: #d65c4f;
}

.result-modal__confirm:focus-visible {
  outline: 2px solid var(--gold);
  outline-offset: 3px;
}

.result-modal__confirm:active {
  transform: translateY(1px) scale(0.99);
}

.result-modal-enter-active,
.result-modal-leave-active {
  transition: opacity 0.16s var(--ease);
}

.result-modal-enter-active .result-modal,
.result-modal-leave-active .result-modal {
  transition: transform 0.2s var(--ease), opacity 0.16s var(--ease);
}

.result-modal-enter-from,
.result-modal-leave-to {
  opacity: 0;
}

.result-modal-enter-from .result-modal,
.result-modal-leave-to .result-modal {
  opacity: 0;
  transform: translateY(8px);
}
</style>
