<script lang="ts" setup name="NoFlyZonePage">
import { Page } from '@vben/common-ui';

import { nextTick, onMounted, ref } from 'vue';

import {
  Badge,
  Button,
  Card,
  Col,
  Modal,
  Row,
  Space,
  Table,
  Tag,
  message,
} from 'ant-design-vue';

import { useMap } from '#/utils/map';

const mapRef = ref<HTMLElement | null>(null);
const { initMap, addPolygon, addMarker, flyTo, enableDraw, disableDraw } = useMap(mapRef);

interface NoFlyZone {
  id: string;
  name: string;
  level: string;
  status: string;
  center: [number, number];
  radius: number;
  maxAlt: number;
  source: string;
  polygonId?: string;
}

const zones = ref<NoFlyZone[]>([
  { id: '1', name: '军事管制区 A', level: '永久禁飞', status: '生效中', center: [108.92, 34.30], radius: 3000, maxAlt: 0, source: '空管部门' },
  { id: '2', name: '机场净空区', level: '永久禁飞', status: '生效中', center: [108.96, 34.22], radius: 6000, maxAlt: 0, source: '民航局' },
  { id: '3', name: '政府办公区', level: '限高区域', status: '生效中', center: [108.94, 34.26], radius: 500, maxAlt: 50, source: '公安局' },
  { id: '4', name: '大型活动临时禁飞', level: '限时禁飞', status: '待生效', center: [108.95, 34.27], radius: 2000, maxAlt: 0, source: '公安局' },
  { id: '5', name: '学校区域', level: '审批飞行', status: '生效中', center: [108.93, 34.25], radius: 300, maxAlt: 120, source: '教育局' },
]);

const selectedId = ref<string | null>(null);
const isDrawing = ref(false);

const columns = [
  { title: '名称', dataIndex: 'name', key: 'name', ellipsis: true },
  { title: '级别', dataIndex: 'level', key: 'level', width: 100 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 80 },
  { title: '', key: 'ops', width: 70 },
];

function levelColor(level: string) {
  if (level === '永久禁飞') return '#ff4d4f';
  if (level === '限时禁飞') return '#faad14';
  if (level === '限高区域') return '#1677ff';
  return '#8c8c8c';
}

function statusBadge(status: string) {
  if (status === '生效中') return 'success';
  if (status === '待生效') return 'processing';
  return 'default';
}

function renderZones() {
  const scale = 0.01;
  zones.value.forEach((z) => {
    const r = (z.radius / 100000) * scale * 3;
    const color = levelColor(z.level);
    z.polygonId = addPolygon({
      path: [
        [z.center[0] - r, z.center[1] + r * 0.7],
        [z.center[0] + r, z.center[1] + r * 0.7],
        [z.center[0] + r, z.center[1] - r * 0.7],
        [z.center[0] - r, z.center[1] - r * 0.7],
      ],
      fillColor: `${color}22`,
      strokeColor: color,
      strokeWidth: 2,
    });
    addMarker({ position: z.center, label: z.name });
  });
}

function handleSelect(zone: NoFlyZone) {
  selectedId.value = zone.id;
  flyTo(zone.center[0], zone.center[1], { zoom: 14, duration: 600 });
}

function handleStartDraw() {
  isDrawing.value = true;
  enableDraw('polygon');
  message.info('请在地图上绘制禁飞区多边形');
}

function handleStopDraw() {
  isDrawing.value = false;
  disableDraw();
}

function handleDelete(zone: NoFlyZone) {
  Modal.confirm({
    title: '删除禁飞区',
    content: `确定删除「${zone.name}」吗？`,
    onOk() {
      zones.value = zones.value.filter((z) => z.id !== zone.id);
      message.success('已删除');
    },
  });
}

onMounted(async () => {
  await nextTick();
  if (mapRef.value) {
    await initMap({ center: [108.94, 34.26], zoom: 12 });
    renderZones();
  }
});
</script>

<template>
  <Page>
    <Row :gutter="[16, 0]" class="h-full p-2">
      <Col :lg="8" :span="24">
        <div class="flex flex-col gap-3">
          <Card :bordered="false" size="small" title="禁飞区列表">
            <template #extra>
              <Button
                v-if="!isDrawing"
                type="primary"
                size="small"
                @click="handleStartDraw"
              >
                绘制新区域
              </Button>
              <Button
                v-else
                size="small"
                danger
                @click="handleStopDraw"
              >
                取消绘制
              </Button>
            </template>
            <Table
              :columns="columns"
              :data-source="zones"
              :pagination="false"
              size="small"
              row-key="id"
              :row-class-name="(record: NoFlyZone) => record.id === selectedId ? 'ant-table-row-selected' : ''"
              :custom-row="(record: NoFlyZone) => ({ onClick: () => handleSelect(record) })"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'level'">
                  <Tag :color="levelColor(record.level)" size="small">{{ record.level }}</Tag>
                </template>
                <template v-if="column.key === 'status'">
                  <Badge :status="statusBadge(record.status)" :text="record.status" />
                </template>
                <template v-if="column.key === 'ops'">
                  <Button type="link" size="small" danger @click.stop="handleDelete(record)">删除</Button>
                </template>
              </template>
            </Table>
          </Card>

          <Card v-if="selectedId" :bordered="false" size="small" title="区域详情">
            <template v-for="z in zones" :key="z.id">
              <div v-if="z.id === selectedId" class="flex flex-col gap-2 text-sm">
                <div class="detail-row">
                  <span class="detail-label">名称</span>
                  <span>{{ z.name }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">级别</span>
                  <Tag :color="levelColor(z.level)" size="small">{{ z.level }}</Tag>
                </div>
                <div class="detail-row">
                  <span class="detail-label">限高</span>
                  <span>{{ z.maxAlt === 0 ? '完全禁飞' : `${z.maxAlt}m` }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">范围</span>
                  <span>{{ z.radius }}m</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">中心</span>
                  <span>{{ z.center[0] }}, {{ z.center[1] }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">来源</span>
                  <span>{{ z.source }}</span>
                </div>
              </div>
            </template>
          </Card>

          <Card :bordered="false" size="small" title="图例">
            <div class="flex flex-col gap-2">
              <div class="legend-item">
                <span class="legend-dot" style="background: #ff4d4f" /> 永久禁飞
              </div>
              <div class="legend-item">
                <span class="legend-dot" style="background: #faad14" /> 限时禁飞
              </div>
              <div class="legend-item">
                <span class="legend-dot" style="background: #1677ff" /> 限高区域
              </div>
              <div class="legend-item">
                <span class="legend-dot" style="background: #8c8c8c" /> 审批飞行
              </div>
            </div>
          </Card>
        </div>
      </Col>

      <Col :lg="16" :span="24">
        <Card :bordered="false" class="map-card">
          <div ref="mapRef" class="zone-map" />
        </Card>
      </Col>
    </Row>
  </Page>
</template>

<style lang="less" scoped>
.zone-map {
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

.detail-row {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--ant-color-text);
}

.detail-label {
  width: 40px;
  flex: none;
  font-size: 12px;
  color: var(--ant-color-text-tertiary);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--ant-color-text-secondary);
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 3px;
  flex: none;
}
</style>
