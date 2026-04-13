<script lang="ts" setup name="EventMapViewPage">
import { Page } from '@vben/common-ui';

import { nextTick, onMounted, ref } from 'vue';

import { Badge, Card, Col, Row, Select, SelectOption, Tag } from 'ant-design-vue';

import { useMap } from '#/utils/map';

const mapRef = ref<HTMLElement | null>(null);
const { initMap, addMarker, addPolygon } = useMap(mapRef);

const filterType = ref('all');
const filterLevel = ref('all');

const events = [
  { id: 1, type: '烟雾告警', level: 'critical', lng: 108.93, lat: 34.27, location: '北坡 230m', time: '14:32', scene: '森林防火', status: '待处理' },
  { id: 2, type: '违停检测', level: 'warning', lng: 108.96, lat: 34.25, location: '人民路交叉口', time: '14:15', scene: '交通巡查', status: '处理中' },
  { id: 3, type: '未戴安全帽', level: 'critical', lng: 108.91, lat: 34.28, location: 'A 工地 3 号楼', time: '13:45', scene: '安全生产', status: '待处理' },
  { id: 4, type: '管道泄漏', level: 'warning', lng: 108.95, lat: 34.23, location: '主管网 K8+500', time: '13:20', scene: '热力巡检', status: '已处理' },
  { id: 5, type: '占道经营', level: 'info', lng: 108.94, lat: 34.26, location: '朝阳路步行街', time: '12:50', scene: '市政巡检', status: '处理中' },
  { id: 6, type: '排污口异常', level: 'critical', lng: 108.90, lat: 34.24, location: '渭河 K12 段', time: '11:30', scene: '环境监测', status: '待处理' },
  { id: 7, type: '路面病害', level: 'info', lng: 108.97, lat: 34.29, location: '环城西路 K3', time: '10:45', scene: '交通巡查', status: '已处理' },
];

function levelColor(level: string) {
  if (level === 'critical') return '#ff4d4f';
  if (level === 'warning') return '#faad14';
  return '#1677ff';
}

function statusText(s: string) {
  if (s === '待处理') return 'error';
  if (s === '处理中') return 'processing';
  return 'success';
}

onMounted(async () => {
  await nextTick();
  if (mapRef.value) {
    await initMap({ center: [108.94, 34.26], zoom: 13 });
    for (const e of events) {
      addMarker({ position: [e.lng, e.lat], label: e.type });
    }
  }
});
</script>

<template>
  <Page>
    <div class="flex flex-col gap-4 p-2">
      <Card :bordered="false" title="事件地图视图">
        <template #extra>
          <div class="flex gap-2">
            <Select v-model:value="filterType" style="width: 120px" size="small">
              <SelectOption value="all">全部类型</SelectOption>
              <SelectOption value="critical">紧急事件</SelectOption>
              <SelectOption value="warning">一般事件</SelectOption>
              <SelectOption value="info">提示事件</SelectOption>
            </Select>
            <Select v-model:value="filterLevel" style="width: 120px" size="small">
              <SelectOption value="all">全部状态</SelectOption>
              <SelectOption value="pending">待处理</SelectOption>
              <SelectOption value="processing">处理中</SelectOption>
              <SelectOption value="done">已处理</SelectOption>
            </Select>
          </div>
        </template>
        <div ref="mapRef" style="height: 420px; border-radius: 8px; overflow: hidden" />
      </Card>

      <Card :bordered="false" title="事件列表">
        <Row :gutter="[12, 12]">
          <Col v-for="e in events" :key="e.id" :lg="8" :md="12" :span="24">
            <div class="event-card">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <Badge :color="levelColor(e.level)" />
                  <span class="text-sm font-semibold" style="color: var(--ant-color-text)">{{ e.type }}</span>
                </div>
                <Badge :status="statusText(e.status)" :text="e.status" />
              </div>
              <div class="mt-2 text-xs" style="color: var(--ant-color-text-tertiary)">
                {{ e.location }} · {{ e.scene }} · {{ e.time }}
              </div>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  </Page>
</template>

<style lang="less" scoped>
.event-card {
  padding: 12px;
  border-radius: 8px;
  border: 1px solid var(--ant-color-border-secondary);
  transition: background 0.2s;

  &:hover {
    background: var(--ant-color-bg-layout);
  }
}
</style>
