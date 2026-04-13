<script lang="ts" setup>
import type { DroneItem } from '../scenes';

defineProps<{
  drones: DroneItem[];
}>();

function batteryColor(v: number) {
  if (v < 30) return '#ef4444';
  if (v < 60) return '#f59e0b';
  return '#10b981';
}
</script>

<template>
  <div class="drone-list">
    <div v-for="d in drones" :key="d.id" class="drone-card">
      <div class="drone-card__head">
        <div>
          <div class="drone-card__id">{{ d.id }}</div>
          <div class="drone-card__mission">{{ d.mission }}</div>
        </div>
        <div class="drone-card__status">{{ d.status }}</div>
      </div>
      <div class="drone-card__bars">
        <div class="drone-card__bar">
          <span class="drone-card__bar-label">电量</span>
          <div class="drone-card__bar-track">
            <div
              class="drone-card__bar-fill"
              :style="{
                width: `${d.battery}%`,
                background: batteryColor(d.battery),
              }"
            />
          </div>
          <span class="drone-card__bar-val">{{ d.battery }}%</span>
        </div>
        <div class="drone-card__bar">
          <span class="drone-card__bar-label">链路</span>
          <div class="drone-card__bar-track">
            <div
              class="drone-card__bar-fill"
              :style="{
                width: `${d.signal}%`,
                background: '#3b82f6',
              }"
            />
          </div>
          <span class="drone-card__bar-val">{{ d.signal }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.drone-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.drone-card {
  padding: 14px;
  border: 1px solid rgb(255 255 255 / 4%);
  border-radius: 16px;
  background: rgb(255 255 255 / 3%);
}

.drone-card__head {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: flex-start;
}

.drone-card__id {
  color: #f8fafc;
  font-size: 13px;
  font-weight: 700;
}

.drone-card__mission {
  margin-top: 4px;
  color: #a1a1aa;
  font-size: 12px;
}

.drone-card__status {
  color: #65e38f;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}

.drone-card__bars {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
}

.drone-card__bar {
  display: flex;
  align-items: center;
  gap: 8px;
}

.drone-card__bar-label {
  width: 28px;
  color: #9ca3af;
  font-size: 11px;
  flex: none;
}

.drone-card__bar-track {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: rgb(255 255 255 / 8%);
  overflow: hidden;
}

.drone-card__bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.5s ease;
}

.drone-card__bar-val {
  width: 36px;
  color: #d1d5db;
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  text-align: right;
  flex: none;
}
</style>
