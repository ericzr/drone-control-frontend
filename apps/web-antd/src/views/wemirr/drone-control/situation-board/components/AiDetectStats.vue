<script lang="ts" setup>
import { computed } from 'vue';

import type { DetectCategory } from '../scenes';

const props = defineProps<{
  categories: DetectCategory[];
}>();

const maxCount = computed(() =>
  Math.max(...props.categories.map((c) => c.count), 1),
);
</script>

<template>
  <div class="ai-stats">
    <div
      v-for="cat in categories"
      :key="cat.label"
      class="ai-stats__row"
    >
      <div class="ai-stats__header">
        <span class="ai-stats__label">{{ cat.label }}</span>
        <span class="ai-stats__count" :style="{ color: cat.color }">{{ cat.count }}</span>
      </div>
      <div class="ai-stats__track">
        <div
          class="ai-stats__fill"
          :style="{
            width: `${(cat.count / maxCount) * 100}%`,
            background: cat.color,
          }"
        />
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.ai-stats {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ai-stats__header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.ai-stats__label {
  color: #d1d5db;
  font-size: 12px;
}

.ai-stats__count {
  font-size: 13px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.ai-stats__track {
  height: 8px;
  border-radius: 4px;
  background: rgb(255 255 255 / 6%);
  overflow: hidden;
}

.ai-stats__fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.6s ease;
}
</style>
