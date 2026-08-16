import { nextTick, onBeforeUnmount, watch, type Ref } from 'vue';

interface UseDialogFocusTrapOptions {
  initialFocus: Ref<HTMLElement | undefined>;
  isOpen: Ref<boolean>;
  root: Ref<HTMLElement | undefined>;
}

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
let activeDialogCount = 0;

/** Keeps focus inside a modal dialog and makes the underlying application inert. */
export function useDialogFocusTrap(options: UseDialogFocusTrapOptions) {
  const state: DialogFocusState = { opener: null, ownsIsolation: false };
  watch(options.isOpen, isOpen => _updateDialogFocus(isOpen, options, state), { flush: 'post' });
  onBeforeUnmount(() => _restoreDialogFocus(state));
  return { trapFocus: (event: KeyboardEvent) => _trapFocus(event, options.root) };
}

function _updateDialogFocus(isOpen: boolean, options: UseDialogFocusTrapOptions, state: DialogFocusState): void {
  if (!isOpen) return _restoreDialogFocus(state);
  if (state.ownsIsolation) return _focusInitial(options.initialFocus);
  state.opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  state.ownsIsolation = true;
  activeDialogCount += 1;
  _setApplicationInert(true);
  _focusInitial(options.initialFocus);
}

function _restoreDialogFocus(state: DialogFocusState): void {
  if (!state.ownsIsolation) return;
  state.ownsIsolation = false;
  activeDialogCount = Math.max(0, activeDialogCount - 1);
  if (!activeDialogCount) _setApplicationInert(false);
  state.opener?.focus();
  state.opener = null;
}

function _focusInitial(initialFocus: Ref<HTMLElement | undefined>): void {
  nextTick(() => initialFocus.value?.focus());
}

function _trapFocus(event: KeyboardEvent, root: Ref<HTMLElement | undefined>): void {
  if (event.key !== 'Tab') return;
  const items = _getFocusableItems(root.value);
  if (!items.length) return event.preventDefault();
  _cycleFocus(event, items);
}

function _getFocusableItems(root: HTMLElement | undefined): HTMLElement[] {
  if (!root) return [];
  return [...root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)];
}

function _cycleFocus(event: KeyboardEvent, items: HTMLElement[]): void {
  const first = items[0];
  const last = items[items.length - 1];
  if (event.shiftKey && document.activeElement === first) return _moveFocus(event, last);
  if (!event.shiftKey && document.activeElement === last) _moveFocus(event, first);
}

function _moveFocus(event: KeyboardEvent, target: HTMLElement): void {
  event.preventDefault();
  target.focus();
}

function _setApplicationInert(isInert: boolean): void {
  const app = document.getElementById('app');
  if (isInert) app?.setAttribute('inert', '');
  else app?.removeAttribute('inert');
}

interface DialogFocusState {
  opener: HTMLElement | null;
  ownsIsolation: boolean;
}
