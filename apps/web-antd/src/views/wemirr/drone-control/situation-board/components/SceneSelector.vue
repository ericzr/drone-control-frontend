<script lang="ts" setup>
import type { SceneConfig, SceneType } from '../scenes';

const props = defineProps<{
  scenes: SceneConfig[];
  active: SceneType;
}>();

const emit = defineEmits<{
  change: [scene: SceneType];
}>();
</script>

<template>
  <div class="scene-selector">
    <button
      v-for="s in props.scenes"
      :key="s.key"
      class="scene-btn"
      :class="{ 'scene-btn--active': props.active === s.key }"
      :style="props.active === s.key ? { '--accent': s.color } : {}"
      @click="emit('change', s.key)"
    >
      <span class="scene-btn__label">{{ s.label }}</span>
    </button>
  </div>
</template>

<style lang="less" scoped>
.scene-selector {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.scene-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border: 1px solid rgb(255 255 255 / 8%);
  border-radius: 999px;
  background: rgb(255 255 255 / 4%);
  color: #d1d5db;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s;
  white-space: nowrap;

  &:hover {
    background: rgb(255 255 255 / 8%);
    color: #f3f4f6;
  }

  &--active {
    border-color: var(--accent, #3b82f6);
    background: color-mix(in srgb, var(--accent, #3b82f6) 18%, transparent);
    color: #f9fafb;
    box-shadow: 0 0 12px color-mix(in srgb, var(--accent, #3b82f6) 30%, transparent);
  }
}

</style>
