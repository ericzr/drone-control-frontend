<script lang="ts" setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { Button, Card, Select, SelectOption, Space, Tag } from 'ant-design-vue';

import { listClosureEvents, useEventClosureVersion } from '../_services/event-closure-store';
import { EVENT_CONTEXT_SOURCE_OPTIONS } from '../composables/use-event-context';

const props = withDefaults(
  defineProps<{
    current?: string;
  }>(),
  {
    current: '',
  },
);

const route = useRoute();
const router = useRouter();
const closureStoreVersion = useEventClosureVersion();

const pageLinks = [
  { key: 'overview', label: '首页态势', path: '/event' },
  { key: 'map', label: '地图视图', path: '/event/map-view' },
  { key: 'review', label: '事件复核', path: '/event/review' },
  { key: 'workorder', label: '工单管理', path: '/event/workorder' },
  { key: 'report', label: '闭环报告', path: '/event/report' },
];

const sceneOptions = computed(() => {
  closureStoreVersion.value;
  return [...new Set(listClosureEvents().map((item) => item.scene))];
});

function updateQuery(partial: Record<string, string | undefined>) {
  const nextQuery = { ...route.query };
  for (const [key, value] of Object.entries(partial)) {
    if (!value || value === 'all') {
      delete nextQuery[key];
    } else {
      nextQuery[key] = value;
    }
  }
  router.replace({ path: route.path, query: nextQuery });
}

const selectedScene = computed({
  get: () => (route.query.scene as string) || 'all',
  set: (value: string) => updateQuery({ scene: value }),
});

const selectedSource = computed({
  get: () => (route.query.source as string) || 'all',
  set: (value: string) => updateQuery({ source: value }),
});

function goPage(path: string) {
  router.push({ path, query: { ...route.query } });
}

function clearContext() {
  const nextQuery = { ...route.query };
  delete nextQuery.scene;
  delete nextQuery.source;
  delete nextQuery.id;
  delete nextQuery.workorderId;
  router.replace({ path: route.path, query: nextQuery });
}
</script>

<template>
  <Card :bordered="false" size="small">
    <div class="event-context-bar">
      <div class="event-context-bar__main">
        <div class="event-context-bar__title">事件中心统一上下文</div>
        <div class="event-context-bar__desc">
          跨页保留当前场景和来源筛选，便于在首页、地图、复核、工单、报告之间连续演示。
        </div>
      </div>

      <Space :size="[10, 10]" wrap>
        <Select v-model:value="selectedScene" style="width: 140px" size="small">
          <SelectOption value="all">全部场景</SelectOption>
          <SelectOption v-for="scene in sceneOptions" :key="scene" :value="scene">
            {{ scene }}
          </SelectOption>
        </Select>

        <Select v-model:value="selectedSource" style="width: 120px" size="small">
          <SelectOption
            v-for="item in EVENT_CONTEXT_SOURCE_OPTIONS"
            :key="item.value"
            :value="item.value"
          >
            {{ item.label }}
          </SelectOption>
        </Select>

        <div class="event-context-bar__links">
          <Button
            v-for="item in pageLinks"
            :key="item.key"
            size="small"
            :type="props.current === item.key ? 'primary' : 'default'"
            ghost
            @click="goPage(item.path)"
          >
            {{ item.label }}
          </Button>
        </div>

        <Button size="small" @click="clearContext">清空上下文</Button>
      </Space>

      <div class="event-context-bar__tags">
        <Tag color="blue">场景：{{ selectedScene === 'all' ? '全部场景' : selectedScene }}</Tag>
        <Tag color="purple">
          来源：
          {{ EVENT_CONTEXT_SOURCE_OPTIONS.find((item) => item.value === selectedSource)?.label || '全部来源' }}
        </Tag>
      </div>
    </div>
  </Card>
</template>

<style lang="less" scoped>
.event-context-bar {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.event-context-bar__main {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.event-context-bar__title {
  color: var(--ant-color-text);
  font-size: 14px;
  font-weight: 700;
}

.event-context-bar__desc {
  color: var(--ant-color-text-tertiary);
  font-size: 12px;
}

.event-context-bar__links {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.event-context-bar__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
