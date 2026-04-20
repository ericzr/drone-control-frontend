<script lang="ts" setup name="FlightAirspaceResourcePage">
import { Page } from '@vben/common-ui';

import { computed, nextTick, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import {
  Badge,
  Button,
  Card,
  Col,
  Descriptions,
  DescriptionsItem,
  Progress,
  Row,
  Space,
  Statistic,
  Table,
  Tag,
  message,
} from 'ant-design-vue';

import { useMap } from '#/utils/map';

const router = useRouter();
const mapRef = ref<HTMLElement | null>(null);
const { initMap, addMarker, addPolygon, addPolyline, flyTo } = useMap(mapRef);

type AirspaceLevel = '协同走廊' | '审批飞行' | '永久禁飞' | '限时禁飞';
type AirspaceStatus = '待审批占用' | '空闲可申请' | '生效中' | '预警中';

interface AirspaceResource {
  id: string;
  name: string;
  level: AirspaceLevel;
  status: AirspaceStatus;
  area: string;
  timeWindow: string;
  occupancy: number;
  center: [number, number];
  altitude: string;
  owner: string;
  conflictNote: string;
}

const stats = [
  { title: '纳管空域单元', value: 36, suffix: '个' },
  { title: '今日申请占用', value: 14, suffix: '条' },
  { title: '冲突待研判', value: 3, suffix: '项' },
  { title: '可直接放飞', value: 9, suffix: '条' },
];

const airspaces = ref<AirspaceResource[]>([
  {
    id: 'ASP-001',
    name: '渭河沿线协同飞行走廊',
    level: '协同走廊',
    status: '生效中',
    area: '沿河西路 - 渭河桥下游 4.2km',
    timeWindow: '07:00 - 19:00',
    occupancy: 68,
    center: [108.92, 34.27],
    altitude: '60m - 120m',
    owner: '水务局 / 巡检一队',
    conflictNote: '与 15:00 应急核查任务存在 12 分钟窗口重叠，建议自动错峰。',
  },
  {
    id: 'ASP-002',
    name: '北坡林区防火巡航空域',
    level: '审批飞行',
    status: '待审批占用',
    area: '北坡林区核心防火区',
    timeWindow: '06:30 - 18:30',
    occupancy: 42,
    center: [108.885, 34.302],
    altitude: '80m - 150m',
    owner: '林草局 / 防火值守班',
    conflictNote: '需与临时演练禁飞窗口错开 30 分钟后放飞。',
  },
  {
    id: 'ASP-003',
    name: '高新区政务办公核心区',
    level: '永久禁飞',
    status: '生效中',
    area: '政务办公楼群及周边 500m',
    timeWindow: '永久',
    occupancy: 100,
    center: [108.94, 34.26],
    altitude: '0m',
    owner: '公安局 / 空管协同',
    conflictNote: '该区域仅允许特殊审批飞行任务进入。',
  },
  {
    id: 'ASP-004',
    name: '会展中心五一活动临时禁飞区',
    level: '限时禁飞',
    status: '预警中',
    area: '会展中心及外扩 2km',
    timeWindow: '2026-05-01 00:00 - 2026-05-03 23:59',
    occupancy: 91,
    center: [108.953, 34.271],
    altitude: '0m',
    owner: '公安局 / 活动安保组',
    conflictNote: '已有 2 条城市巡查任务进入冲突队列，需改道或延期。',
  },
]);

const selectedAirspaceId = ref(airspaces.value[0]!.id);

const selectedAirspace = computed(() => {
  return airspaces.value.find((item) => item.id === selectedAirspaceId.value) || null;
});

const timeWindows = computed(() => [
  {
    id: 'TW-01',
    slot: '08:00 - 10:00',
    unit: '交通主干道巡查',
    usage: '占用协同走廊 1 条 / 审批空域 1 条',
    status: '已锁定',
  },
  {
    id: 'TW-02',
    slot: '10:00 - 12:00',
    unit: '北坡林区晨巡',
    usage: '待审批，需错峰',
    status: '待审批',
  },
  {
    id: 'TW-03',
    slot: '15:00 - 17:00',
    unit: '沿河排污口应急核查',
    usage: '与渭河走廊重叠 12 分钟',
    status: '冲突预警',
  },
  {
    id: 'TW-04',
    slot: '19:00 - 21:00',
    unit: '夜间热成像巡检',
    usage: '空域资源充足，可放飞',
    status: '可申请',
  },
]);

const reviewQueue = [
  {
    id: 'APR-240417-01',
    title: '北坡林区防火巡检申请',
    applicant: '林草局值守班',
    risk: '中',
    note: '与演练空域窗口重叠 30 分钟，建议顺延起飞。',
  },
  {
    id: 'APR-240417-02',
    title: '会展中心周边道路巡查申请',
    applicant: '城管巡查队',
    risk: '高',
    note: '进入限时禁飞区，需改航线并补充公安会签。',
  },
  {
    id: 'APR-240417-03',
    title: '渭河下游漂浮物核查申请',
    applicant: '水务局巡检组',
    risk: '低',
    note: '已满足飞前检查条件，可直接进入授权队列。',
  },
];

const layerTags = ref([
  { label: '协同走廊', active: true },
  { label: '审批飞行区', active: true },
  { label: '禁飞区', active: true },
  { label: '申请占用热力', active: false },
  { label: '机场点位', active: true },
]);

const resourceColumns = [
  { title: '空域单元', dataIndex: 'name', key: 'name', width: 220 },
  { title: '类型', dataIndex: 'level', key: 'level', width: 110 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 110 },
  { title: '高度层', dataIndex: 'altitude', key: 'altitude', width: 110 },
  { title: '时窗', dataIndex: 'timeWindow', key: 'timeWindow', width: 200 },
  { title: '占用率', dataIndex: 'occupancy', key: 'occupancy', width: 120 },
  { title: '责任单位', dataIndex: 'owner', key: 'owner', width: 180 },
];

function resourceLevelColor(level: AirspaceLevel) {
  if (level === '协同走廊') return 'blue';
  if (level === '审批飞行') return 'gold';
  if (level === '永久禁飞') return 'red';
  return 'orange';
}

function resourceStatusColor(status: AirspaceStatus) {
  if (status === '生效中') return 'processing';
  if (status === '空闲可申请') return 'success';
  if (status === '预警中') return 'warning';
  return 'default';
}

function queueRiskColor(risk: string) {
  if (risk === '高') return 'red';
  if (risk === '中') return 'gold';
  return 'green';
}

function toggleLayer(index: number) {
  layerTags.value[index]!.active = !layerTags.value[index]!.active;
}

function openApplyCenter() {
  message.info('下一步将进入飞行申请中心原型');
}

function openNoFlyZone() {
  router.push('/settings/no-fly-zone');
}

function openRouteApply() {
  router.push('/flight/route-apply');
}

function focusAirspace(record: AirspaceResource) {
  selectedAirspaceId.value = record.id;
  flyTo(record.center[0], record.center[1], { zoom: 13, duration: 600 });
}

function renderAirspaceMap() {
  addMarker({ position: [108.96, 34.28], label: '高新区一号机场' });
  addMarker({ position: [108.92, 34.32], label: '水务巡检机场' });
  addMarker({ position: [108.88, 34.30], label: '林草防火机场' });

  addPolyline({
    path: [
      [108.905, 34.274],
      [108.92, 34.271],
      [108.936, 34.268],
      [108.952, 34.264],
    ],
    color: '#1677ff',
    width: 4,
  });

  addPolygon({
    path: [
      [108.872, 34.315],
      [108.894, 34.315],
      [108.898, 34.292],
      [108.876, 34.288],
    ],
    fillColor: 'rgba(250,173,20,0.18)',
    strokeColor: '#faad14',
    strokeWidth: 2,
  });

  addPolygon({
    path: [
      [108.932, 34.267],
      [108.948, 34.267],
      [108.948, 34.252],
      [108.932, 34.252],
    ],
    fillColor: 'rgba(255,77,79,0.16)',
    strokeColor: '#ff4d4f',
    strokeWidth: 2,
  });

  addPolygon({
    path: [
      [108.946, 34.279],
      [108.968, 34.279],
      [108.971, 34.262],
      [108.948, 34.258],
    ],
    fillColor: 'rgba(250,140,22,0.16)',
    strokeColor: '#fa8c16',
    strokeWidth: 2,
  });
}

onMounted(async () => {
  await nextTick();
  await initMap({ center: [108.93, 34.27], zoom: 12 });
  renderAirspaceMap();
});
</script>

<template>
  <Page :auto-content-height="true">
    <div class="flex flex-col gap-4 p-2">
      <Card :bordered="false">
        <div class="airspace-hero">
          <div class="airspace-hero__main">
            <div class="airspace-hero__title">空域资源中心</div>
            <div class="airspace-hero__desc">
              作为飞控与统飞治理的支撑子域，统一查看空域单元、时间窗口占用、申请冲突与放飞前研判结果。
            </div>
          </div>
          <Space wrap>
            <Button @click="openNoFlyZone">禁飞区配置</Button>
            <Button @click="openRouteApply">查看现有航线申请</Button>
            <Button type="primary" @click="openApplyCenter">进入飞行申请</Button>
          </Space>
        </div>
      </Card>

      <Row :gutter="[16, 16]">
        <Col v-for="item in stats" :key="item.title" :lg="6" :md="12" :span="24">
          <Card :bordered="false">
            <Statistic :title="item.title" :value="item.value" :suffix="item.suffix" />
          </Card>
        </Col>
      </Row>

      <Row :gutter="[16, 16]">
        <Col :xl="16" :span="24">
          <Card :bordered="false" title="空域资源地图">
            <template #extra>
              <Space wrap>
                <Tag
                  v-for="(layer, index) in layerTags"
                  :key="layer.label"
                  :color="layer.active ? 'blue' : 'default'"
                  class="cursor-pointer select-none"
                  @click="toggleLayer(index)"
                >
                  {{ layer.label }}
                </Tag>
              </Space>
            </template>
            <div class="airspace-map">
              <div ref="mapRef" class="airspace-map__canvas" />
            </div>
          </Card>
        </Col>

        <Col :xl="8" :span="24">
          <Card :bordered="false" title="当前空域研判">
            <template v-if="selectedAirspace">
              <Descriptions :column="1" size="small">
                <DescriptionsItem label="空域单元">{{ selectedAirspace.name }}</DescriptionsItem>
                <DescriptionsItem label="类型">
                  <Tag :color="resourceLevelColor(selectedAirspace.level)">
                    {{ selectedAirspace.level }}
                  </Tag>
                </DescriptionsItem>
                <DescriptionsItem label="状态">
                  <Badge :status="resourceStatusColor(selectedAirspace.status)" :text="selectedAirspace.status" />
                </DescriptionsItem>
                <DescriptionsItem label="高度层">{{ selectedAirspace.altitude }}</DescriptionsItem>
                <DescriptionsItem label="生效时窗">{{ selectedAirspace.timeWindow }}</DescriptionsItem>
                <DescriptionsItem label="占用率">
                  <div class="airspace-progress">
                    <Progress :percent="selectedAirspace.occupancy" :show-info="false" stroke-color="#1677ff" />
                    <span>{{ selectedAirspace.occupancy }}%</span>
                  </div>
                </DescriptionsItem>
                <DescriptionsItem label="责任单位">{{ selectedAirspace.owner }}</DescriptionsItem>
                <DescriptionsItem label="冲突提示">
                  <div class="airspace-note">{{ selectedAirspace.conflictNote }}</div>
                </DescriptionsItem>
              </Descriptions>
            </template>
          </Card>

          <Card :bordered="false" title="待研判申请队列" class="mt-4">
            <div class="queue-list">
              <div v-for="item in reviewQueue" :key="item.id" class="queue-item">
                <div class="queue-item__head">
                  <strong>{{ item.title }}</strong>
                  <Tag :color="queueRiskColor(item.risk)">{{ item.risk }}风险</Tag>
                </div>
                <div class="queue-item__meta">{{ item.id }} · {{ item.applicant }}</div>
                <div class="queue-item__desc">{{ item.note }}</div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row :gutter="[16, 16]">
        <Col :xl="14" :span="24">
          <Card :bordered="false" title="空域台账">
            <Table
              :columns="resourceColumns"
              :data-source="airspaces"
              :pagination="false"
              row-key="id"
              :scroll="{ x: 1200 }"
              :custom-row="(record: AirspaceResource) => ({ onClick: () => focusAirspace(record) })"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'level'">
                  <Tag :color="resourceLevelColor(record.level)">{{ record.level }}</Tag>
                </template>
                <template v-else-if="column.key === 'status'">
                  <Badge :status="resourceStatusColor(record.status)" :text="record.status" />
                </template>
                <template v-else-if="column.key === 'occupancy'">
                  <div class="airspace-progress">
                    <Progress :percent="record.occupancy" :show-info="false" stroke-color="#1677ff" />
                    <span>{{ record.occupancy }}%</span>
                  </div>
                </template>
              </template>
            </Table>
          </Card>
        </Col>

        <Col :xl="10" :span="24">
          <Card :bordered="false" title="时间窗口占用">
            <div class="window-list">
              <div v-for="item in timeWindows" :key="item.id" class="window-item">
                <div class="window-item__slot">{{ item.slot }}</div>
                <div class="window-item__unit">{{ item.unit }}</div>
                <div class="window-item__usage">{{ item.usage }}</div>
                <Tag
                  :color="
                    item.status === '冲突预警'
                      ? 'red'
                      : item.status === '待审批'
                        ? 'gold'
                        : item.status === '已锁定'
                          ? 'blue'
                          : 'green'
                  "
                >
                  {{ item.status }}
                </Tag>
              </div>
            </div>
          </Card>

          <Card :bordered="false" title="放飞前检查摘要" class="mt-4">
            <div class="check-grid">
              <div class="check-card">
                <div class="check-card__title">飞手资质</div>
                <div class="check-card__value text-green-600">7/8 可直接放飞</div>
                <div class="check-card__desc">1 名飞手证书 15 天后到期，建议提前续期。</div>
              </div>
              <div class="check-card">
                <div class="check-card__title">设备健康</div>
                <div class="check-card__value text-blue-600">29/34 可用</div>
                <div class="check-card__desc">2 架无人机电池循环超阈值，3 座机场补给延迟。</div>
              </div>
              <div class="check-card">
                <div class="check-card__title">空域合法性</div>
                <div class="check-card__value text-orange-600">3 条待研判</div>
                <div class="check-card__desc">重点关注会展中心临时禁飞区与北坡林区演练时窗。</div>
              </div>
              <div class="check-card">
                <div class="check-card__title">天气窗口</div>
                <div class="check-card__value text-green-600">今日日间可飞</div>
                <div class="check-card__desc">17:30 后阵风增强，夜航任务需补充风险说明。</div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  </Page>
</template>

<style lang="less" scoped>
.airspace-hero {
  align-items: flex-start;
  display: flex;
  gap: 16px;
  justify-content: space-between;
}

.airspace-hero__main {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.airspace-hero__title {
  color: var(--ant-color-text);
  font-size: 24px;
  font-weight: 700;
  line-height: 1.2;
}

.airspace-hero__desc {
  color: var(--ant-color-text-description);
  line-height: 1.7;
  max-width: 760px;
}

.airspace-map {
  height: 520px;
}

.airspace-map__canvas {
  border-radius: 16px;
  height: 100%;
  overflow: hidden;
}

.airspace-progress {
  align-items: center;
  display: flex;
  gap: 10px;
}

.airspace-progress :deep(.ant-progress) {
  flex: 1;
  margin-bottom: 0;
}

.airspace-note {
  background: color-mix(in srgb, var(--ant-color-warning) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--ant-color-warning) 22%, transparent);
  border-radius: 12px;
  color: var(--ant-color-text);
  line-height: 1.7;
  padding: 10px 12px;
}

.queue-list,
.window-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.queue-item,
.window-item,
.check-card {
  background: var(--ant-color-fill-quaternary);
  border-radius: 14px;
  padding: 14px;
}

.queue-item__head {
  align-items: center;
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.queue-item__meta,
.queue-item__desc,
.window-item__usage,
.check-card__desc {
  color: var(--ant-color-text-description);
  font-size: 12px;
  line-height: 1.7;
}

.queue-item__meta,
.window-item__usage {
  margin-top: 6px;
}

.window-item__slot,
.window-item__unit,
.check-card__title {
  color: var(--ant-color-text);
  font-weight: 600;
}

.window-item__unit {
  margin-top: 4px;
}

.check-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.check-card__value {
  font-size: 18px;
  font-weight: 700;
  margin: 8px 0 4px;
}

@media (max-width: 1200px) {
  .check-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 768px) {
  .airspace-hero {
    align-items: stretch;
    flex-direction: column;
  }

  .airspace-map {
    height: 420px;
  }
}
</style>
