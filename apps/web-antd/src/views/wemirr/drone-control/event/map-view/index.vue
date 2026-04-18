<script lang="ts" setup name="EventMapViewPage">
import { Page } from '@vben/common-ui';

import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import {
  Badge,
  Button,
  Card,
  Col,
  Empty,
  Row,
  Select,
  SelectOption,
  Space,
  Statistic,
  Tag,
} from 'ant-design-vue';

import { useMap } from '#/utils/map';

import {
  listClosureEvents,
  listClosureWorkorders,
  useEventClosureVersion,
} from '../../_services/event-closure-store';
import EventContextBar from '../../components/EventContextBar.vue';
import { matchesEventSource } from '../../composables/use-event-context';

interface MapEventItem {
  eventNo: string;
  title: string;
  scene: string;
  level: string;
  status: string;
  location: string;
  region: string;
  time: string;
  source: string;
  confidence: number;
  position: [number, number];
  workorderId?: string;
  workorderStatus: string;
}

const route = useRoute();
const router = useRouter();
const mapRef = ref<HTMLElement | null>(null);
const { flyTo, initMap, addMarker, addPolygon } = useMap(mapRef);
const closureStoreVersion = useEventClosureVersion();

const filterScene = ref('all');
const filterStatus = ref('all');
const activeEventNo = ref('');
const filterSource = ref((route.query.source as string) || 'all');

const sceneCenterMap: Record<string, [number, number]> = {
  交通巡查: [108.96, 34.27],
  城管巡检: [108.945, 34.262],
  森林防火: [108.91, 34.285],
  环境监测: [108.905, 34.238],
  水域监测: [108.922, 34.246],
  安全生产: [108.935, 34.255],
};

function parseDateTime(input: string) {
  return new Date(input.replace(/-/g, '/'));
}

function getSceneCenter(scene: string): [number, number] {
  return sceneCenterMap[scene] || [108.94, 34.26];
}

function hashEventOffset(eventNo: string) {
  return eventNo.split('').reduce((total, char) => total + char.charCodeAt(0), 0);
}

function buildPosition(scene: string, eventNo: string): [number, number] {
  const center = getSceneCenter(scene);
  const hash = hashEventOffset(eventNo);
  const lngOffset = ((hash % 7) - 3) * 0.004;
  const latOffset = ((Math.floor(hash / 7) % 7) - 3) * 0.003;
  return [center[0] + lngOffset, center[1] + latOffset];
}

function getScenePolygon(scene: string): Array<[number, number]> {
  const [lng, lat] = getSceneCenter(scene);
  return [
    [lng - 0.018, lat + 0.012],
    [lng + 0.018, lat + 0.012],
    [lng + 0.02, lat - 0.014],
    [lng - 0.02, lat - 0.014],
  ];
}

function levelColor(level: string) {
  if (level === '重大') return '#ff4d4f';
  if (level === '较大') return '#faad14';
  return '#1677ff';
}

function statusBadge(status: string) {
  if (status === '待复核') return 'error';
  if (status === '已派单' || status === '处置中') return 'processing';
  if (status === '已闭环') return 'success';
  if (status === '误报') return 'default';
  return 'warning';
}

function workorderStatusLabel(status?: number) {
  return ['待指派', '待处置', '处置中', '待复核', '已归档'][status ?? -1] || '待生成';
}

const closureEvents = computed(() => {
  closureStoreVersion.value;
  return listClosureEvents().sort((left, right) => {
    return (
      parseDateTime(right.eventTime || right.createTime).getTime() -
      parseDateTime(left.eventTime || left.createTime).getTime()
    );
  });
});

const workorderMap = computed(() => {
  closureStoreVersion.value;
  return new Map(listClosureWorkorders().map((item) => [item.eventId, item]));
});

const sceneOptions = computed(() => {
  return [...new Set(closureEvents.value.map((item) => item.scene))];
});

const mapEvents = computed<MapEventItem[]>(() => {
  return closureEvents.value.map((item) => {
    const workorder = workorderMap.value.get(item.eventNo);
    return {
      eventNo: item.eventNo,
      title: `${item.eventType}事件`,
      scene: item.scene,
      level: item.level,
      status: item.status,
      location: item.location,
      region: item.region,
      time: item.eventTime || item.createTime,
      source: item.source,
      confidence: item.confidence,
      position: buildPosition(item.scene, item.eventNo),
      workorderId: workorder?.id,
      workorderStatus: workorderStatusLabel(workorder?.status),
    };
  });
});

const filteredEvents = computed(() => {
  return mapEvents.value.filter((item) => {
    const matchScene = filterScene.value === 'all' || item.scene === filterScene.value;
    const matchStatus = filterStatus.value === 'all' || item.status === filterStatus.value;
    const matchSource = matchesEventSource(item.source, filterSource.value);
    return matchScene && matchStatus && matchSource;
  });
});

const summaryCards = computed(() => {
  const total = filteredEvents.value.length;
  const pending = filteredEvents.value.filter((item) => item.status === '待复核').length;
  const active = filteredEvents.value.filter(
    (item) => item.status === '已派单' || item.status === '处置中',
  ).length;
  const closed = filteredEvents.value.filter((item) => item.status === '已闭环').length;
  return [
    { title: '地图事件数', value: total, suffix: '件' },
    { title: '待复核点位', value: pending, suffix: '件' },
    { title: '处置中点位', value: active, suffix: '件' },
    {
      title: '闭环率',
      value: total > 0 ? Number(((closed / total) * 100).toFixed(1)) : 0,
      suffix: '%',
    },
  ];
});

const activeEvent = computed(() => {
  return (
    filteredEvents.value.find((item) => item.eventNo === activeEventNo.value) ||
    filteredEvents.value[0] ||
    null
  );
});

function applyRouteFocus() {
  const routeEventNo = route.query.id as string | undefined;
  filterScene.value = (route.query.scene as string) || 'all';
  filterSource.value = (route.query.source as string) || 'all';
  if (!routeEventNo) return;
  const match = mapEvents.value.find((item) => item.eventNo === routeEventNo);
  if (!match) return;
  filterScene.value = match.scene;
  if (filterStatus.value !== 'all' && filterStatus.value !== match.status) {
    filterStatus.value = 'all';
  }
  activeEventNo.value = match.eventNo;
}

watch(
  filteredEvents,
  (list) => {
    if (list.some((item) => item.eventNo === activeEventNo.value)) return;
    activeEventNo.value = list[0]?.eventNo || '';
  },
  { immediate: true },
);

async function renderMap() {
  await nextTick();
  if (!mapRef.value) return;

  const current = activeEvent.value;
  await initMap({
    center: current?.position || [108.94, 34.26],
    zoom: current ? 12.8 : 11.8,
  });

  const scenes = new Set(filteredEvents.value.map((item) => item.scene));
  for (const scene of scenes) {
    addPolygon({
      path: getScenePolygon(scene),
      fillColor: 'rgba(22,119,255,0.08)',
      fillOpacity: 0.2,
      strokeColor: '#1677ff',
      strokeWidth: 1,
    });
  }

  for (const item of filteredEvents.value) {
    addMarker({
      position: item.position,
      label: `${item.title} · ${item.status}`,
    });
  }
}

function focusEvent(eventNo: string) {
  activeEventNo.value = eventNo;
  const current = filteredEvents.value.find((item) => item.eventNo === eventNo);
  if (!current) return;
  flyTo(current.position[0], current.position[1], { zoom: 13.5 });
}

watch(filteredEvents, () => {
  renderMap();
});

watch(activeEvent, (item) => {
  if (!item) return;
  flyTo(item.position[0], item.position[1], { zoom: 13.2 });
});

watch(
  () => route.query.id,
  () => {
    applyRouteFocus();
  },
);

onMounted(async () => {
  applyRouteFocus();
  await renderMap();
});
</script>

<template>
  <Page>
    <div class="flex flex-col gap-4 p-2">
      <EventContextBar current="map" />

      <Card :bordered="false" title="事件地图视图">
        <template #extra>
          <Space>
            <Select v-model:value="filterScene" style="width: 140px" size="small">
              <SelectOption value="all">全部场景</SelectOption>
              <SelectOption v-for="scene in sceneOptions" :key="scene" :value="scene">
                {{ scene }}
              </SelectOption>
            </Select>
            <Select v-model:value="filterStatus" style="width: 120px" size="small">
              <SelectOption value="all">全部状态</SelectOption>
              <SelectOption value="待复核">待复核</SelectOption>
              <SelectOption value="已确认">已确认</SelectOption>
              <SelectOption value="已派单">已派单</SelectOption>
              <SelectOption value="处置中">处置中</SelectOption>
              <SelectOption value="已闭环">已闭环</SelectOption>
              <SelectOption value="误报">误报</SelectOption>
            </Select>
          </Space>
        </template>

        <Row :gutter="[16, 16]">
          <Col v-for="item in summaryCards" :key="item.title" :lg="6" :md="12" :span="24">
            <Card :bordered="false" class="summary-card">
              <Statistic :title="item.title" :value="item.value" :suffix="item.suffix" />
            </Card>
          </Col>
        </Row>

        <div ref="mapRef" class="mt-4 map-panel" />
      </Card>

      <Row :gutter="[16, 16]">
        <Col :xl="16" :span="24">
          <Card :bordered="false" title="地图事件卡片">
            <template v-if="filteredEvents.length > 0">
              <Row :gutter="[12, 12]">
                <Col v-for="event in filteredEvents" :key="event.eventNo" :lg="12" :span="24">
                  <div
                    class="event-card"
                    :class="{ 'event-card--active': activeEvent?.eventNo === event.eventNo }"
                    @click="focusEvent(event.eventNo)"
                  >
                    <div class="flex items-start justify-between gap-3">
                      <div>
                        <div class="flex items-center gap-2">
                          <Badge :color="levelColor(event.level)" />
                          <span class="text-sm font-semibold text-slate-900">
                            {{ event.title }}
                          </span>
                        </div>
                        <div class="mt-2 text-xs text-slate-500">
                          {{ event.location }} · {{ event.scene }}
                        </div>
                      </div>
                      <Badge :status="statusBadge(event.status)" :text="event.status" />
                    </div>

                    <div class="mt-3 flex flex-wrap gap-2">
                      <Tag color="blue">{{ event.region }}</Tag>
                      <Tag :color="event.workorderId ? 'green' : 'default'">
                        {{ event.workorderStatus }}
                      </Tag>
                      <Tag color="purple">{{ event.confidence }}%</Tag>
                    </div>

                    <div class="mt-3 text-xs text-slate-500">
                      {{ event.time }} · {{ event.source }}
                    </div>

                    <div class="mt-4 flex flex-wrap gap-2">
                      <Button size="small" type="primary" ghost @click.stop="focusEvent(event.eventNo)">
                        聚焦点位
                      </Button>
                      <Button
                        size="small"
                        @click.stop="router.push(`/event/detail?id=${event.eventNo}`)"
                      >
                        查看详情
                      </Button>
                      <Button size="small" @click.stop="router.push(`/event/review?id=${event.eventNo}`)">
                        去复核
                      </Button>
                      <Button
                        v-if="event.workorderId"
                        size="small"
                        @click.stop="router.push(`/event/workorder-detail?id=${event.workorderId}`)"
                      >
                        查看工单
                      </Button>
                    </div>
                  </div>
                </Col>
              </Row>
            </template>
            <Empty v-else description="当前筛选下暂无地图事件" />
          </Card>
        </Col>

        <Col :xl="8" :span="24">
          <Card :bordered="false" title="当前聚焦事件">
            <template v-if="activeEvent">
              <div class="focus-panel">
                <div>
                  <div class="text-base font-semibold text-slate-900">
                    {{ activeEvent.title }}
                  </div>
                  <div class="mt-1 text-sm text-slate-500">
                    {{ activeEvent.location }}
                  </div>
                </div>

                <div class="flex flex-wrap gap-2">
                  <Tag :color="activeEvent.workorderId ? 'green' : 'orange'">
                    {{ activeEvent.workorderStatus }}
                  </Tag>
                  <Tag color="blue">{{ activeEvent.scene }}</Tag>
                  <Tag color="purple">{{ activeEvent.confidence }}%</Tag>
                </div>

                <div class="focus-panel__meta">
                  <div>事件编号：{{ activeEvent.eventNo }}</div>
                  <div>告警来源：{{ activeEvent.source }}</div>
                  <div>归属区域：{{ activeEvent.region }}</div>
                  <div>发现时间：{{ activeEvent.time }}</div>
                </div>

                <div class="focus-panel__hint">
                  当前聚焦事件已与共享闭环数据联动，地图、复核页、工单页和报告页读取同一份状态。
                </div>

                <div class="flex flex-wrap gap-2">
                  <Button type="primary" @click="router.push(`/event/detail?id=${activeEvent.eventNo}`)">
                    查看完整详情
                  </Button>
                  <Button v-if="activeEvent.workorderId" @click="router.push(`/event/workorder-detail?id=${activeEvent.workorderId}`)">
                    跳转工单
                  </Button>
                </div>
              </div>
            </template>
            <Empty v-else description="请先选择地图事件" />
          </Card>
        </Col>
      </Row>
    </div>
  </Page>
</template>

<style lang="less" scoped>
.summary-card {
  background: var(--ant-color-bg-layout);
}

.map-panel {
  height: 440px;
  overflow: hidden;
  border-radius: 16px;
}

.event-card {
  border: 1px solid var(--ant-color-border-secondary);
  border-radius: 16px;
  padding: 14px;
  transition:
    border-color 0.2s,
    box-shadow 0.2s,
    transform 0.2s;
  cursor: pointer;

  &:hover {
    border-color: rgba(22, 119, 255, 0.35);
    box-shadow: 0 14px 36px rgba(15, 23, 42, 0.08);
    transform: translateY(-2px);
  }
}

.event-card--active {
  border-color: rgba(22, 119, 255, 0.55);
  box-shadow: 0 18px 40px rgba(22, 119, 255, 0.12);
}

.focus-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.focus-panel__meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px;
  border-radius: 14px;
  background: var(--ant-color-bg-layout);
  color: var(--ant-color-text-secondary);
  font-size: 13px;
}

.focus-panel__hint {
  border: 1px solid rgba(22, 119, 255, 0.12);
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(239, 246, 255, 0.95), rgba(248, 250, 252, 0.96));
  color: #334155;
  font-size: 13px;
  line-height: 1.8;
  padding: 12px 14px;
}
</style>
