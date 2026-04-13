<script lang="ts" setup>
import type { DeviceStatus, StatCard } from '../scenes';

defineProps<{
  cards: StatCard[];
  devices: DeviceStatus[];
}>();
</script>

<template>
  <div class="stat-panel">
    <div class="stat-cards">
      <div
        v-for="c in cards"
        :key="c.label"
        class="stat-card"
      >
        <div class="stat-card__value" :style="{ color: c.color }">
          {{ c.value }}<span class="stat-card__suffix">{{ c.suffix }}</span>
        </div>
        <div class="stat-card__label">{{ c.label }}</div>
      </div>
    </div>

    <div class="device-bars">
      <div v-for="d in devices" :key="d.label" class="device-bar">
        <div class="device-bar__header">
          <span class="device-bar__label">{{ d.label }}</span>
          <span class="device-bar__count">{{ d.online }}/{{ d.total }}</span>
        </div>
        <div class="device-bar__track">
          <div
            class="device-bar__fill"
            :style="{ width: `${(d.online / d.total) * 100}%` }"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.stat-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.stat-card {
  padding: 14px 12px 12px;
  border-radius: 16px;
  background: rgb(255 255 255 / 4%);
  text-align: center;
}

.stat-card__value {
  font-size: 22px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.stat-card__suffix {
  margin-left: 2px;
  font-size: 12px;
  font-weight: 600;
  opacity: 0.7;
}

.stat-card__label {
  margin-top: 6px;
  color: #9ca3af;
  font-size: 12px;
}

.device-bars {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 14px;
}

.device-bar__header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}

.device-bar__label {
  color: #d1d5db;
  font-size: 12px;
}

.device-bar__count {
  color: #9ca3af;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}

.device-bar__track {
  height: 6px;
  border-radius: 3px;
  background: rgb(255 255 255 / 8%);
  overflow: hidden;
}

.device-bar__fill {
  height: 100%;
  border-radius: 3px;
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
  transition: width 0.5s ease;
}
</style>
