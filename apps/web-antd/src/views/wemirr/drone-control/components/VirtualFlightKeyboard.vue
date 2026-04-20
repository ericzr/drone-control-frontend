<script lang="ts" setup>
defineProps<{
  activeKey?: string;
}>();

const emit = defineEmits<{
  press: [key: string];
}>();

function onPress(k: string) {
  emit('press', k);
}
</script>

<template>
  <div class="vfk" role="group" aria-label="飞行操控键盘">
    <div class="vfk__row">
      <button
        type="button"
        class="vfk__key"
        :class="{ 'vfk__key--active': activeKey === 'q' }"
        aria-keyshortcuts="Q"
        @click="onPress('Q')"
      >
        Q
      </button>
      <button
        type="button"
        class="vfk__key"
        :class="{ 'vfk__key--active': activeKey === 'w' }"
        aria-keyshortcuts="W"
        @click="onPress('W')"
      >
        W
      </button>
      <button
        type="button"
        class="vfk__key"
        :class="{ 'vfk__key--active': activeKey === 'e' }"
        aria-keyshortcuts="E"
        @click="onPress('E')"
      >
        E
      </button>
      <button
        type="button"
        class="vfk__key"
        :class="{ 'vfk__key--active': activeKey === 'c' }"
        aria-keyshortcuts="C"
        @click="onPress('C')"
      >
        C
      </button>
    </div>
    <div class="vfk__row">
      <button
        type="button"
        class="vfk__key"
        :class="{ 'vfk__key--active': activeKey === 'a' }"
        aria-keyshortcuts="A"
        @click="onPress('A')"
      >
        A
      </button>
      <button
        type="button"
        class="vfk__key"
        :class="{ 'vfk__key--active': activeKey === 's' }"
        aria-keyshortcuts="S"
        @click="onPress('S')"
      >
        S
      </button>
      <button
        type="button"
        class="vfk__key"
        :class="{ 'vfk__key--active': activeKey === 'd' }"
        aria-keyshortcuts="D"
        @click="onPress('D')"
      >
        D
      </button>
    </div>
    <div class="vfk__row">
      <button
        type="button"
        class="vfk__key vfk__key--space"
        :class="{ 'vfk__key--active': activeKey === ' ' }"
        aria-keyshortcuts="Space"
        @click="onPress(' ')"
      >
        [Space]
      </button>
    </div>
  </div>
</template>

<style lang="less" scoped>
.vfk {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.vfk__row {
  display: flex;
  gap: 4px;
}

.vfk__key {
  width: 38px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  font-weight: 700;
  font-family: 'SF Mono', 'Menlo', monospace;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #f0f0f0;
    border-color: rgba(255, 255, 255, 0.2);
  }

  &:focus-visible {
    outline: 2px solid #1677ff;
    outline-offset: 2px;
  }

  &--active {
    background: rgba(22, 119, 255, 0.25) !important;
    border-color: #1677ff !important;
    color: #60a5fa !important;
    box-shadow: 0 0 8px rgba(22, 119, 255, 0.2);
  }
}

.vfk__key--space {
  width: 120px;
}
</style>
