<script lang="ts" setup name="DispatchSituationPage">
import { Page } from '@vben/common-ui';

import { nextTick, onMounted, ref } from 'vue';

import {
  Badge,
  Button,
  Card,
  Col,
  Descriptions,
  DescriptionsItem,
  Drawer,
  Dropdown,
  InputNumber,
  Menu,
  MenuItem,
  Modal,
  Progress,
  Row,
  Select,
  SelectOption,
  Space,
  Statistic,
  Tag,
  message,
} from 'ant-design-vue';

import type { MapType } from '#/utils/map';

import { useMap } from '#/utils/map';

const mapContainerRef = ref<HTMLElement | null>(null);
const {
  mapType,
  ready: mapReady,
  initMap,
  switchMapType,
  addMarker,
  addPolyline,
  addPolygon,
  flyTo,
  enableDraw,
  disableDraw,
  measureDistance,
  measureArea,
} = useMap(mapContainerRef);

const stats = [
  { title: '在线机场', value: 14, suffix: '座' },
  { title: '在线无人机', value: 27, suffix: '架' },
  { title: '执行中任务', value: 9, suffix: '个' },
  { title: '待处理告警', value: 6, suffix: '条' },
];

const layerTags = ref([
  { label: '卫星底图', active: true },
  { label: '禁飞区', active: true },
  { label: '机场点位', active: true },
  { label: '作业范围', active: false },
  { label: '无人机轨迹', active: true },
  { label: 'AI 告警热力', active: false },
  { label: '网格化区域', active: false },
]);

const airportList = ref([
  { name: '高新区一号机场', status: '在线', drone: '大航蜂 M300-01', task: '道路巡查', battery: 64, utilization: 72, lng: 108.96, lat: 34.28 },
  { name: '生态园区机场', status: '作业中', drone: '大航蜂 M350-03', task: '水域巡查', battery: 72, utilization: 86, lng: 108.90, lat: 34.25 },
  { name: '林草防火机场', status: '在线', drone: '大航蜂 M30T-02', task: '充电待命', battery: 100, utilization: 48, lng: 108.88, lat: 34.30 },
  { name: '交通主干道机场', status: '在线', drone: '大航蜂 FP-04', task: '待命', battery: 90, utilization: 35, lng: 108.98, lat: 34.22 },
  { name: '水务巡检机场', status: '在线', drone: '大航蜂 M30-06', task: '待命', battery: 95, utilization: 52, lng: 108.92, lat: 34.32 },
  { name: '城管巡检机场', status: '作业中', drone: '大航蜂 M300-07', task: '全覆盖巡查', battery: 78, utilization: 91, lng: 108.94, lat: 34.20 },
]);

const situationPanels = [
  { title: '机场在线率', value: '87.5%', sub: '14/16 在线', color: '#52c41a' },
  { title: '无人机在线率', value: '79.4%', sub: '27/34 在线', color: '#1890ff' },
  { title: '平均电量', value: '74%', sub: '最低 32%（M350-03）', color: '#faad14' },
  { title: '今日飞行架次', value: '46', sub: '较昨日 +8', color: '#722ed1' },
];

function toggleLayer(idx: number) {
  layerTags.value[idx]!.active = !layerTags.value[idx]!.active;
}

function getStatusBadge(s: string) {
  if (s === '作业中') return 'processing';
  if (s === '在线') return 'success';
  return 'default';
}

function addMockFeatures() {
  for (const ap of airportList.value) {
    addMarker({ position: [ap.lng, ap.lat], label: ap.name });
  }

  addPolyline({
    path: [
      [108.96, 34.28],
      [108.94, 34.26],
      [108.90, 34.25],
      [108.88, 34.30],
    ],
    color: '#ff4d4f',
    width: 2,
  });

  addPolygon({
    path: [
      [108.91, 34.27],
      [108.95, 34.27],
      [108.95, 34.24],
      [108.91, 34.24],
    ],
    fillColor: 'rgba(255,77,79,0.15)',
    strokeColor: '#ff4d4f',
    strokeWidth: 2,
  });
}

function handleLocateAirport(ap: { lng: number; lat: number }) {
  flyTo(ap.lng, ap.lat, { zoom: 15, duration: 800 });
}

async function handleMeasureDistance() {
  const d = await measureDistance();
  message.info(`测量距离: ${d.toFixed(1)} m`);
}

async function handleMeasureArea() {
  const a = await measureArea();
  message.info(`测量面积: ${a.toFixed(1)} m²`);
}

function handleDrawFence() {
  enableDraw('polygon');
  message.info('请在地图上绘制围栏区域');
}

function handleSwitchMap(type: string) {
  switchMapType(type as MapType);
  message.success(`已切换至 ${type} 地图`);
}

const launchVisible = ref(false);
const launchAirport = ref('');
const launchDrone = ref('');
const launchAlt = ref(120);
const availableDrones = ['大航蜂 M300-01', '大航蜂 M30T-02', '大航蜂 FP-04', '大航蜂 M30-06'];

function openLaunchModal(ap?: { name: string }) {
  launchAirport.value = ap?.name || '';
  launchDrone.value = '';
  launchAlt.value = 120;
  launchVisible.value = true;
}

function confirmLaunch() {
  if (!launchAirport.value || !launchDrone.value) {
    message.warning('请选择机场和无人机');
    return;
  }
  launchVisible.value = false;
  message.success(`已发起起飞指令：${launchDrone.value} → ${launchAirport.value}，高度 ${launchAlt.value}m`);
}

const detailVisible = ref(false);
const detailAirport = ref<any>(null);
const airportEnv = {
  temperature: '24°C',
  humidity: '62%',
  windSpeed: '3.2 m/s',
  windDir: '东南风',
  visibility: '8 km',
  pressure: '1013 hPa',
};

function openAirportDetail(ap: any) {
  detailAirport.value = ap;
  detailVisible.value = true;
  flyTo(ap.lng, ap.lat, { zoom: 15, duration: 800 });
}

onMounted(async () => {
  await nextTick();
  await initMap({ center: [108.94, 34.26], zoom: 12 });
  addMockFeatures();
});
</script>

<template>
  <Page :auto-content-height="true">
    <div class="flex flex-col gap-4 p-2">
      <Row :gutter="[16, 16]">
        <Col v-for="item in stats" :key="item.title" :lg="6" :md="12" :span="24">
          <Card :bordered="false">
            <Statistic :suffix="item.suffix" :title="item.title" :value="item.value" />
          </Card>
        </Col>
      </Row>

      <Row :gutter="[16, 16]">
        <Col :xl="16" :span="24">
          <Card :bordered="false" title="态势地图">
            <template #extra>
              <Space wrap>
                <Tag
                  v-for="(layer, idx) in layerTags"
                  :key="layer.label"
                  :color="layer.active ? 'blue' : 'default'"
                  class="cursor-pointer select-none"
                  @click="toggleLayer(idx)"
                >
                  {{ layer.label }}
                </Tag>
              </Space>
            </template>
            <div class="dispatch-map">
              <div ref="mapContainerRef" class="dispatch-map__canvas" />
              <div class="dispatch-map__toolbar">
                <Space>
                  <Dropdown>
                    <Button size="small" type="primary" ghost>
                      {{ mapType === 'mock' ? 'Mock' : mapType }} ▾
                    </Button>
                    <template #overlay>
                      <Menu @click="({ key }: any) => handleSwitchMap(key)">
                        <MenuItem key="mock">Mock (开发)</MenuItem>
                        <MenuItem key="amap">高德地图</MenuItem>
                        <MenuItem key="tianditu">天地图</MenuItem>
                        <MenuItem key="mars3d">Mars3D</MenuItem>
                      </Menu>
                    </template>
                  </Dropdown>
                  <Button size="small" ghost @click="handleMeasureDistance">测距</Button>
                  <Button size="small" ghost @click="handleMeasureArea">测面</Button>
                  <Button size="small" ghost @click="handleDrawFence">围栏</Button>
                </Space>
              </div>
            </div>
          </Card>
        </Col>

        <Col :xl="8" :span="24">
          <Card :bordered="false" title="态势指标">
            <div class="flex flex-col gap-4">
              <div
                v-for="panel in situationPanels"
                :key="panel.title"
                class="rounded-lg border border-slate-100 px-4 py-3 dark:border-slate-700"
              >
                <div class="flex items-center justify-between">
                  <span class="text-sm text-slate-500 dark:text-slate-400">{{ panel.title }}</span>
                  <span class="text-xl font-bold" :style="{ color: panel.color }">
                    {{ panel.value }}
                  </span>
                </div>
                <div class="mt-1 text-xs text-slate-400">{{ panel.sub }}</div>
              </div>
            </div>
          </Card>

          <Card :bordered="false" title="机场概览" class="mt-4">
            <div class="flex flex-col gap-3">
              <div
                v-for="ap in airportList"
                :key="ap.name"
                class="cursor-pointer rounded-lg border border-slate-100 px-3 py-2 transition-colors hover:border-blue-300 hover:bg-blue-50/30 dark:border-slate-700 dark:hover:border-blue-600 dark:hover:bg-blue-900/20"
                @click="handleLocateAirport(ap)"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <Badge :status="getStatusBadge(ap.status)" />
                    <span class="text-sm font-medium text-slate-800 dark:text-slate-200">{{ ap.name }}</span>
                  </div>
                  <Tag :color="ap.status === '作业中' ? 'blue' : 'green'" size="small">
                    {{ ap.status }}
                  </Tag>
                </div>
                <div class="mt-1 flex items-center justify-between text-xs text-slate-400">
                  <span>{{ ap.drone }} · {{ ap.task }}</span>
                  <span>利用率 {{ ap.utilization }}%</span>
                </div>
                <Progress
                  :percent="ap.utilization"
                  :show-info="false"
                  :stroke-color="ap.utilization > 80 ? '#ff4d4f' : '#1890ff'"
                  class="mt-1"
                  size="small"
                />
                <div class="mt-2 flex gap-2">
                  <Button size="small" type="link" @click.stop="openAirportDetail(ap)">详情</Button>
                  <Button size="small" type="primary" ghost @click.stop="openLaunchModal(ap)">一键起飞</Button>
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>

    <!-- Launch Modal -->
    <Modal v-model:open="launchVisible" title="一键起飞" @ok="confirmLaunch" ok-text="发起起飞" cancel-text="取消">
      <div class="flex flex-col gap-4 py-2">
        <div>
          <div class="mb-1 text-sm" style="color: var(--ant-color-text)">起飞机场</div>
          <Select v-model:value="launchAirport" style="width: 100%" placeholder="选择机场">
            <SelectOption v-for="ap in airportList" :key="ap.name" :value="ap.name">{{ ap.name }}</SelectOption>
          </Select>
        </div>
        <div>
          <div class="mb-1 text-sm" style="color: var(--ant-color-text)">选择无人机</div>
          <Select v-model:value="launchDrone" style="width: 100%" placeholder="选择无人机">
            <SelectOption v-for="d in availableDrones" :key="d" :value="d">{{ d }}</SelectOption>
          </Select>
        </div>
        <div>
          <div class="mb-1 text-sm" style="color: var(--ant-color-text)">起飞高度 (m)</div>
          <InputNumber v-model:value="launchAlt" :min="10" :max="500" style="width: 100%" />
        </div>
      </div>
    </Modal>

    <!-- Airport Detail Drawer -->
    <Drawer v-model:open="detailVisible" :title="detailAirport?.name || '机场详情'" width="420" placement="right">
      <template v-if="detailAirport">
        <Descriptions bordered :column="1" size="small">
          <DescriptionsItem label="机场名称">{{ detailAirport.name }}</DescriptionsItem>
          <DescriptionsItem label="当前状态">
            <Badge :status="getStatusBadge(detailAirport.status)" :text="detailAirport.status" />
          </DescriptionsItem>
          <DescriptionsItem label="绑定无人机">{{ detailAirport.drone }}</DescriptionsItem>
          <DescriptionsItem label="当前任务">{{ detailAirport.task }}</DescriptionsItem>
          <DescriptionsItem label="电量">
            <Progress :percent="detailAirport.battery" size="small" :status="detailAirport.battery < 30 ? 'exception' : 'active'" />
          </DescriptionsItem>
          <DescriptionsItem label="利用率">{{ detailAirport.utilization }}%</DescriptionsItem>
          <DescriptionsItem label="坐标">{{ detailAirport.lng }}, {{ detailAirport.lat }}</DescriptionsItem>
        </Descriptions>

        <div class="mt-4 mb-2 text-sm font-semibold" style="color: var(--ant-color-text)">环境参数</div>
        <Descriptions bordered :column="2" size="small">
          <DescriptionsItem label="温度">{{ airportEnv.temperature }}</DescriptionsItem>
          <DescriptionsItem label="湿度">{{ airportEnv.humidity }}</DescriptionsItem>
          <DescriptionsItem label="风速">{{ airportEnv.windSpeed }}</DescriptionsItem>
          <DescriptionsItem label="风向">{{ airportEnv.windDir }}</DescriptionsItem>
          <DescriptionsItem label="能见度">{{ airportEnv.visibility }}</DescriptionsItem>
          <DescriptionsItem label="气压">{{ airportEnv.pressure }}</DescriptionsItem>
        </Descriptions>

        <div class="mt-4">
          <Button type="primary" block @click="openLaunchModal(detailAirport)">一键起飞</Button>
        </div>
      </template>
    </Drawer>
  </Page>
</template>

<style lang="less" scoped>
.dispatch-map {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
}

.dispatch-map__canvas {
  height: 480px;
  border-radius: 8px;
  overflow: hidden;
}

.dispatch-map__toolbar {
  position: absolute;
  bottom: 12px;
  left: 12px;
  z-index: 10;
}
</style>
