<script lang="ts" setup>
import { computed, ref } from 'vue';

export interface RouteLibraryItem {
  id: string;
  name: string;
  routeType: string;
  aircraft: string;
  waypoints: number;
  distance: string;
  updatedAt: string;
}

const props = defineProps<{
  routes: RouteLibraryItem[];
  activeRouteId: string | null;
}>();

const emit = defineEmits<{
  (e: 'select', id: string): void;
  (e: 'create'): void;
  (e: 'duplicate', id: string): void;
  (e: 'delete', id: string): void;
}>();

const filterType = ref('');
const sortBy = ref<'name' | 'time'>('time');

const filteredRoutes = computed(() => {
  let list = [...props.routes];
  if (filterType.value) {
    list = list.filter((r) => r.routeType === filterType.value);
  }
  if (sortBy.value === 'name') {
    list.sort((a, b) => a.name.localeCompare(b.name));
  }
  return list;
});

const routeTypes = ['航点航线', '巡逻航线', '面状航线', '带状航线'];

function typeColor(t: string): string {
  if (t.includes('巡逻')) return '#3b82f6';
  if (t.includes('面状') || t.includes('测绘')) return '#10b981';
  if (t.includes('带状')) return '#8b5cf6';
  return '#60a5fa';
}
</script>

<template>
  <div class="rl">
    <!-- Header -->
    <div class="rl-header">
      <span class="rl-header__title">航线库</span>
      <button class="rl-header__add" @click="emit('create')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
      </button>
    </div>

    <!-- Filters -->
    <div class="rl-filters">
      <select v-model="filterType" class="rl-select">
        <option value="">全部类型</option>
        <option v-for="t in routeTypes" :key="t" :value="t">{{ t }}</option>
      </select>
      <select v-model="sortBy" class="rl-select">
        <option value="time">时间排序</option>
        <option value="name">名称排序</option>
      </select>
    </div>

    <!-- Route list -->
    <div class="rl-list">
      <div v-if="filteredRoutes.length === 0" class="rl-empty">暂无航线</div>
      <div
        v-for="route in filteredRoutes"
        :key="route.id"
        :class="['rl-item', { 'rl-item--active': activeRouteId === route.id }]"
        @click="emit('select', route.id)"
      >
        <div class="rl-item__top">
          <span class="rl-item__name">{{ route.name }}</span>
        </div>
        <div class="rl-item__meta">
          <span class="rl-item__type" :style="{ color: typeColor(route.routeType), borderColor: typeColor(route.routeType) + '55' }">
            {{ route.routeType }}
          </span>
          <span class="rl-item__aircraft">{{ route.aircraft }}</span>
        </div>
        <div class="rl-item__bottom">
          <span class="rl-item__info">{{ route.waypoints }} 航点 · {{ route.distance }}</span>
          <div class="rl-item__actions">
            <button class="rl-item__btn" title="复制" @click.stop="emit('duplicate', route.id)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="12" height="12"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
            </button>
            <button class="rl-item__btn rl-item__btn--danger" title="删除" @click.stop="emit('delete', route.id)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="12" height="12"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
            </button>
          </div>
        </div>
        <div class="rl-item__date">{{ route.updatedAt }}</div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.rl {
  display: flex;
  flex-direction: column;
  height: 100%;
  color: #e5e7eb;
}

.rl-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 16px 12px;
  flex: none;
}

.rl-header__title {
  font-size: 14px;
  font-weight: 700;
  color: #f9fafb;
}

.rl-header__add {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: 1px solid rgb(22 119 255 / 40%);
  background: rgb(22 119 255 / 18%);
  color: #60a5fa;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgb(22 119 255 / 30%);
    color: #93c5fd;
  }
}

.rl-filters {
  display: flex;
  gap: 6px;
  padding: 0 14px 10px;
  flex: none;
}

.rl-select {
  flex: 1;
  height: 28px;
  padding: 0 8px;
  border: 1px solid rgb(255 255 255 / 10%);
  border-radius: 6px;
  background: rgb(255 255 255 / 5%);
  color: rgb(255 255 255 / 60%);
  font-size: 11px;
  cursor: pointer;
  appearance: auto;
  outline: none;

  &:focus {
    border-color: rgb(22 119 255 / 50%);
  }

  option {
    background: #1a1c20;
    color: #e5e7eb;
  }
}

.rl-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 10px 10px;

  &::-webkit-scrollbar {
    width: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgb(255 255 255 / 10%);
    border-radius: 2px;
  }
}

.rl-empty {
  text-align: center;
  padding: 40px 0;
  color: rgb(255 255 255 / 25%);
  font-size: 13px;
}

.rl-item {
  padding: 12px;
  border-radius: 12px;
  margin-bottom: 6px;
  cursor: pointer;
  border: 1.5px solid transparent;
  transition: all 0.15s;

  &:hover {
    background: rgb(255 255 255 / 4%);
  }

  &--active {
    background: rgb(22 119 255 / 10%);
    border-color: rgb(22 119 255 / 30%);

    .rl-item__name {
      color: #60a5fa;
    }
  }
}

.rl-item__top {
  margin-bottom: 6px;
}

.rl-item__name {
  font-size: 13px;
  font-weight: 600;
  color: #f0f0f0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 0.15s;
}

.rl-item__meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.rl-item__type {
  padding: 2px 8px;
  font-size: 10px;
  font-weight: 600;
  border: 1px solid;
  border-radius: 999px;
}

.rl-item__aircraft {
  font-size: 11px;
  color: rgb(255 255 255 / 40%);
}

.rl-item__bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.rl-item__info {
  font-size: 11px;
  color: rgb(255 255 255 / 35%);
  font-variant-numeric: tabular-nums;
}

.rl-item__actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.15s;

  .rl-item:hover & {
    opacity: 1;
  }
}

.rl-item__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 5px;
  background: rgb(255 255 255 / 6%);
  color: rgb(255 255 255 / 45%);
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background: rgb(255 255 255 / 12%);
    color: #f9fafb;
  }

  &--danger:hover {
    background: rgb(239 68 68 / 15%);
    color: #ef4444;
  }
}

.rl-item__date {
  margin-top: 4px;
  font-size: 10px;
  color: rgb(255 255 255 / 20%);
}
</style>
