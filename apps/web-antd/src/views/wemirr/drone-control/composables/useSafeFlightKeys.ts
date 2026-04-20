/**
 * 座舱 / 监控页键盘热键安全：避免在表单、弹窗内误触飞行操控键。
 */
export function shouldBlockFlightHotkeys(ev: KeyboardEvent): boolean {
  const t = ev.target as HTMLElement | null;
  if (!t) return true;

  if (ev.repeat) return true;

  const tag = t.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;

  if (t.isContentEditable || t.getAttribute('contenteditable') === 'true')
    return true;

  if (t.closest('[role="textbox"]')) return true;

  if (t.closest('.ant-modal-wrap') || t.closest('.ant-modal-root')) return true;

  if (t.closest('.ant-drawer-content')) return true;

  if (t.closest('.ant-picker-dropdown')) return true;

  if ((ev.ctrlKey || ev.metaKey) && ev.key !== ' ') return true;

  return false;
}

export type FlightKeyHandler = (key: string, ev: KeyboardEvent) => void;

const FLIGHT_KEYS = new Set([
  'q',
  'w',
  'e',
  'a',
  's',
  'd',
  'c',
  ' ',
]);

/**
 * 注册 window keydown；调用方在 onBeforeUnmount 中执行返回的 cleanup。
 */
export function registerSafeFlightKeydown(
  handler: FlightKeyHandler,
  options?: { enabled?: () => boolean },
): () => void {
  const onKeydown = (ev: KeyboardEvent) => {
    if (options?.enabled && !options.enabled()) return;
    if (shouldBlockFlightHotkeys(ev)) return;

    const raw = ev.key.length === 1 ? ev.key.toLowerCase() : ev.key;
    const key = raw === 'spacebar' ? ' ' : raw;

    if (!FLIGHT_KEYS.has(key)) return;

    ev.preventDefault();
    handler(key, ev);
  };

  window.addEventListener('keydown', onKeydown);
  return () => window.removeEventListener('keydown', onKeydown);
}
