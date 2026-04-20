<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

import type { TerminalItem } from '../scenes';

const props = defineProps<{
  terminals: TerminalItem[];
  activeId?: string;
}>();

const emit = defineEmits<{
  (e: 'select', terminal: TerminalItem): void;
}>();

const router = useRouter();
type FilterType = 'all' | 'camera' | 'drone';
const filter = ref<FilterType>('all');

const filtered = computed(() => {
  if (filter.value === 'all') return props.terminals;
  return props.terminals.filter((t) => t.type === filter.value);
});

const counts = computed(() => ({
  all: props.terminals.length,
  drone: props.terminals.filter((t) => t.type === 'drone').length,
  camera: props.terminals.filter((t) => t.type === 'camera').length,
}));

function typeIcon(type: string) {
  if (type === 'drone') return '✈️';
  if (type === 'camera') return '📷';
  return '📡';
}

function statusColor(status: string) {
  if (status === '飞行中') return '#10b981';
  if (status === '在线') return '#3b82f6';
  if (status === '离线') return '#6b7280';
  return '#f59e0b';
}

function batteryColor(v: number) {
  if (v < 30) return '#ef4444';
  if (v < 60) return '#f59e0b';
  return '#10b981';
}

function goCockpit(t: TerminalItem) {
  router.push(`/flight/cockpit?drone=${encodeURIComponent(t.name)}&mission=${encodeURIComponent(t.mission)}`);
}
</script>

<template>
  <div class="tl">
    <div class="tl-filter">
      <button
        v-for="f in (['all', 'drone', 'camera'] as const)"
        :key="f"
        class="tl-filter__btn"
        :class="{ 'tl-filter__btn--active': filter === f }"
        @click="filter = f"
      >
        {{ f === 'all' ? '全部' : f === 'drone' ? '无人机' : '摄像头' }}
        <span class="tl-filter__count">{{ counts[f] }}</span>
      </button>
    </div>

    <div class="tl-list">
      <div
        v-for="t in filtered"
        :key="t.id"
        class="tl-card"
        :class="{ 'tl-card--active': activeId === t.id }"
        @click="emit('select', t)"
      >
        <div class="tl-card__icon">{{ typeIcon(t.type) }}</div>
        <div class="tl-card__body">
          <div class="tl-card__name">{{ t.name }}</div>
          <div class="tl-card__mission">{{ t.mission }}</div>
          <div class="tl-card__meta">
            <span class="tl-card__status" :style="{ color: statusColor(t.status) }">● {{ t.status }}</span>
            <span v-if="t.battery !== undefined" class="tl-card__battery" :style="{ color: batteryColor(t.battery) }">🔋 {{ t.battery }}%</span>
            <span class="tl-card__signal">📶 {{ t.signal }}%</span>
          </div>
        </div>
        <button
          v-if="t.type === 'drone'"
          class="tl-card__cockpit"
          title="进入座舱"
          @click.stop="goCockpit(t)"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        </button>
      </div>

      <div v-if="filtered.length === 0" class="tl-empty">暂无终端</div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.tl-filter {
  display: flex;
  gap: 4px;
  margin-bottom: 10px;
}

.tl-filter__btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 5px 0;
  border: 1px solid rgb(255 255 255 / 6%);
  border-radius: 8px;
  background: transparent;
  color: rgb(255 255 255 / 45%);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    color: rgb(255 255 255 / 70%);
    background: rgb(255 255 255 / 4%);
  }

  &--active {
    background: rgb(22 119 255 / 15%);
    border-color: rgb(22 119 255 / 30%);
    color: #60a5fa;
  }
}

.tl-filter__count {
  font-size: 10px;
  opacity: 0.6;
}

.tl-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 320px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgb(255 255 255 / 12%);
    border-radius: 2px;
  }
}

.tl-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: 1px solid rgb(255 255 255 / 4%);
  border-radius: 12px;
  background: rgb(255 255 255 / 2%);
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgb(255 255 255 / 5%);
    border-color: rgb(255 255 255 / 8%);
  }

  &--active {
    background: rgb(22 119 255 / 10%);
    border-color: rgb(22 119 255 / 25%);
    box-shadow: 0 0 12px rgb(22 119 255 / 10%);
  }
}

.tl-card__icon {
  font-size: 20px;
  flex: none;
  width: 28px;
  text-align: center;
}

.tl-card__body {
  flex: 1;
  min-width: 0;
}

.tl-card__name {
  color: #f0f0f0;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tl-card__mission {
  margin-top: 2px;
  color: #9ca3af;
  font-size: 11px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tl-card__meta {
  display: flex;
  gap: 8px;
  margin-top: 4px;
  font-size: 10px;
}

.tl-card__status {
  font-weight: 600;
}

.tl-card__battery,
.tl-card__signal {
  color: rgb(255 255 255 / 45%);
}

.tl-card__cockpit {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: 1px solid rgb(22 119 255 / 30%);
  border-radius: 8px;
  background: rgb(22 119 255 / 10%);
  color: #60a5fa;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgb(22 119 255 / 25%);
    border-color: #1677ff;
    color: #93c5fd;
  }
}

.tl-empty {
  padding: 20px;
  text-align: center;
  color: rgb(255 255 255 / 30%);
  font-size: 12px;
}
</style>
