import { onBeforeUnmount, onMounted, ref } from 'vue';

/**
 * Reactive clock string (HH:mm:ss) updating every second.
 * Automatically starts in onMounted and cleans up in onBeforeUnmount.
 */
export function useClock(format: 'time' | 'datetime' = 'time') {
  const currentTime = ref('');
  let timer: number | undefined;

  function update() {
    const d = new Date();
    const p = (n: number) => `${n}`.padStart(2, '0');
    if (format === 'datetime') {
      currentTime.value = `${d.getFullYear()}/${p(d.getMonth() + 1)}/${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
    } else {
      currentTime.value = `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
    }
  }

  onMounted(() => {
    update();
    timer = window.setInterval(update, 1000);
  });

  onBeforeUnmount(() => {
    if (timer) window.clearInterval(timer);
  });

  return { currentTime };
}
