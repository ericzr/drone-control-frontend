<script lang="ts" setup name="FlightRoutePlanPage">
import { Page } from '@vben/common-ui';

import { nextTick, onMounted, ref } from 'vue';

import {
  Button,
  Card,
  Col,
  Divider,
  InputNumber,
  Modal,
  Row,
  Select,
  SelectOption,
  Slider,
  Space,
  Table,
  Tag,
  message,
} from 'ant-design-vue';

import { useMap } from '#/utils/map';

const mapRef = ref<HTMLElement | null>(null);
const { initMap, addMarker, addPolyline, removeFeature } = useMap(mapRef);

interface Waypoint {
  id: number;
  lng: number;
  lat: number;
  alt: number;
  speed: number;
  action: string;
  markerId: string;
}

const waypoints = ref<Waypoint[]>([
  { id: 1, lng: 108.930, lat: 34.270, alt: 120, speed: 10, action: '拍照', markerId: '' },
  { id: 2, lng: 108.940, lat: 34.275, alt: 120, speed: 10, action: '悬停', markerId: '' },
  { id: 3, lng: 108.950, lat: 34.268, alt: 100, speed: 8, action: '拍照', markerId: '' },
  { id: 4, lng: 108.955, lat: 34.260, alt: 100, speed: 8, action: '拍照', markerId: '' },
  { id: 5, lng: 108.945, lat: 34.255, alt: 120, speed: 10, action: '返航', markerId: '' },
]);

let nextId = 6;
const routeLineId = ref('');
const selectedWaypoint = ref<number | null>(null);
const simulating = ref(false);
const simSpeed = ref(1);

const waypointColumns = [
  { title: '#', dataIndex: 'id', key: 'id', width: 40 },
  { title: '经度', dataIndex: 'lng', key: 'lng', width: 90 },
  { title: '纬度', dataIndex: 'lat', key: 'lat', width: 90 },
  { title: '高度(m)', dataIndex: 'alt', key: 'alt', width: 70 },
  { title: '速度', dataIndex: 'speed', key: 'speed', width: 60 },
  { title: '动作', dataIndex: 'action', key: 'action', width: 70 },
  { title: '', key: 'ops', width: 50 },
];

const favoritePoints = [
  { name: '高新区一号机场', lng: 108.960, lat: 34.280 },
  { name: '北坡林区入口', lng: 108.930, lat: 34.290 },
  { name: '渭河巡检起点', lng: 108.920, lat: 34.250 },
  { name: '工业区中心', lng: 108.950, lat: 34.240 },
];

function renderMap() {
  if (routeLineId.value) {
    removeFeature(routeLineId.value);
  }
  waypoints.value.forEach((wp) => {
    if (wp.markerId) removeFeature(wp.markerId);
  });

  waypoints.value.forEach((wp, i) => {
    wp.markerId = addMarker({
      position: [wp.lng, wp.lat],
      label: `${i + 1}`,
    });
  });

  if (waypoints.value.length >= 2) {
    routeLineId.value = addPolyline({
      path: waypoints.value.map((wp) => [wp.lng, wp.lat] as [number, number]),
      color: '#1677ff',
      width: 3,
    });
  }
}

function addWaypoint() {
  const last = waypoints.value[waypoints.value.length - 1];
  const lng = last ? last.lng + 0.005 : 108.940;
  const lat = last ? last.lat - 0.003 : 34.260;
  waypoints.value.push({
    id: nextId++,
    lng: Number(lng.toFixed(3)),
    lat: Number(lat.toFixed(3)),
    alt: 120,
    speed: 10,
    action: '拍照',
    markerId: '',
  });
  renderMap();
}

function removeWaypoint(id: number) {
  const wp = waypoints.value.find((w) => w.id === id);
  if (wp?.markerId) removeFeature(wp.markerId);
  waypoints.value = waypoints.value.filter((w) => w.id !== id);
  renderMap();
}

function insertFavorite(point: { name: string; lng: number; lat: number }) {
  waypoints.value.push({
    id: nextId++,
    lng: point.lng,
    lat: point.lat,
    alt: 120,
    speed: 10,
    action: '拍照',
    markerId: '',
  });
  renderMap();
  message.success(`已添加收藏点：${point.name}`);
}

function checkSafety() {
  Modal.info({
    title: '航线安全检查',
    content: '航线与 2 个禁飞区无交叉，最近距离 850m（政府办公区限高区域）。建议 3、4 号航点高度降至 50m 以下。',
  });
}

async function simulateFlight() {
  if (waypoints.value.length < 2) {
    message.warning('至少需要 2 个航点');
    return;
  }
  simulating.value = true;
  message.info('模拟飞行开始');

  for (let i = 0; i < waypoints.value.length; i++) {
    if (!simulating.value) break;
    selectedWaypoint.value = waypoints.value[i]!.id;
    await new Promise((resolve) => setTimeout(resolve, 1500 / simSpeed.value));
  }

  simulating.value = false;
  selectedWaypoint.value = null;
  message.success('模拟飞行完成');
}

function stopSimulation() {
  simulating.value = false;
}

function handleSave() {
  message.success('航线已保存');
}

const totalDist = ref('3.2 km');
const estTime = ref('约 12 分钟');

onMounted(async () => {
  await nextTick();
  if (mapRef.value) {
    await initMap({ center: [108.940, 34.265], zoom: 14 });
    renderMap();
  }
});
</script>

<template>
  <Page>
    <Row :gutter="[16, 0]" class="h-full p-2">
      <!-- Left: Waypoint list -->
      <Col :lg="8" :span="24">
        <div class="flex flex-col gap-3">
          <Card :bordered="false" size="small" title="航点列表">
            <template #extra>
              <Space>
                <Button size="small" type="primary" @click="addWaypoint">添加航点</Button>
                <Button size="small" @click="handleSave">保存</Button>
              </Space>
            </template>
            <Table
              :columns="waypointColumns"
              :data-source="waypoints"
              :pagination="false"
              size="small"
              row-key="id"
              :row-class-name="(record: Waypoint) => record.id === selectedWaypoint ? 'ant-table-row-selected' : ''"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'action'">
                  <Tag size="small">{{ record.action }}</Tag>
                </template>
                <template v-if="column.key === 'ops'">
                  <Button type="link" size="small" danger @click="removeWaypoint(record.id)">删</Button>
                </template>
              </template>
            </Table>
            <div class="mt-2 flex justify-between text-xs" style="color: var(--ant-color-text-tertiary)">
              <span>总距离：{{ totalDist }}</span>
              <span>预计耗时：{{ estTime }}</span>
            </div>
          </Card>

          <Card :bordered="false" size="small" title="收藏点">
            <div class="flex flex-col gap-1">
              <div
                v-for="fp in favoritePoints"
                :key="fp.name"
                class="fav-item"
                @click="insertFavorite(fp)"
              >
                <span class="text-xs" style="color: var(--ant-color-text)">{{ fp.name }}</span>
                <span class="text-xs" style="color: var(--ant-color-text-quaternary)">{{ fp.lng }}, {{ fp.lat }}</span>
              </div>
            </div>
          </Card>

          <Card :bordered="false" size="small" title="工具">
            <div class="flex flex-col gap-2">
              <Button block @click="checkSafety">航线安全检查</Button>
              <div class="flex gap-2">
                <Button block type="primary" :loading="simulating" @click="simulateFlight">
                  {{ simulating ? '模拟中...' : '模拟飞行' }}
                </Button>
                <Button v-if="simulating" block danger @click="stopSimulation">停止</Button>
              </div>
              <div v-if="simulating" class="flex items-center gap-2">
                <span class="text-xs flex-none" style="color: var(--ant-color-text-tertiary)">速度</span>
                <Slider v-model:value="simSpeed" :min="0.5" :max="5" :step="0.5" class="flex-1" />
                <span class="text-xs flex-none" style="color: var(--ant-color-text-secondary)">{{ simSpeed }}x</span>
              </div>
            </div>
          </Card>
        </div>
      </Col>

      <!-- Right: Map -->
      <Col :lg="16" :span="24">
        <Card :bordered="false" class="map-card">
          <div ref="mapRef" class="route-map" />
        </Card>
      </Col>
    </Row>
  </Page>
</template>

<style lang="less" scoped>
.route-map {
  height: calc(100vh - 200px);
  min-height: 500px;
  border-radius: 8px;
  overflow: hidden;
}

.map-card {
  height: 100%;

  :deep(.ant-card-body) {
    padding: 0;
    height: 100%;
  }
}

.fav-item {
  display: flex;
  justify-content: space-between;
  padding: 6px 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: var(--ant-color-primary-bg);
  }
}
</style>
