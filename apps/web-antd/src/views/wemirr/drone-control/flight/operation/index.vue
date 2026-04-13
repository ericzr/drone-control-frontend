<script lang="ts" setup name="FlightOperationPage">
import { Page } from '@vben/common-ui';

import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue';

import {
  Badge,
  Button,
  Card,
  Col,
  Row,
  Select,
  SelectOption,
  Slider,
  Space,
  Tag,
} from 'ant-design-vue';

import { useMap } from '#/utils/map';

const mapRef = ref<HTMLElement | null>(null);
const { initMap, addMarker, addPolyline, removeFeature, flyTo } = useMap(mapRef);

interface TrackPoint {
  lng: number;
  lat: number;
  alt: number;
  speed: number;
  time: string;
  event?: string;
}

const trackData: TrackPoint[] = [
  { lng: 108.960, lat: 34.280, alt: 0, speed: 0, time: '14:00:00', event: '起飞' },
  { lng: 108.958, lat: 34.278, alt: 60, speed: 5, time: '14:00:30' },
  { lng: 108.955, lat: 34.275, alt: 100, speed: 8, time: '14:01:15' },
  { lng: 108.950, lat: 34.272, alt: 120, speed: 10, time: '14:02:00' },
  { lng: 108.945, lat: 34.270, alt: 120, speed: 10, time: '14:02:45', event: '拍照' },
  { lng: 108.940, lat: 34.268, alt: 120, speed: 10, time: '14:03:30' },
  { lng: 108.935, lat: 34.265, alt: 120, speed: 10, time: '14:04:15' },
  { lng: 108.930, lat: 34.263, alt: 120, speed: 10, time: '14:05:00', event: 'AI 告警' },
  { lng: 108.928, lat: 34.262, alt: 120, speed: 8, time: '14:05:30' },
  { lng: 108.925, lat: 34.260, alt: 120, speed: 10, time: '14:06:15' },
  { lng: 108.930, lat: 34.258, alt: 120, speed: 10, time: '14:07:00', event: '拍照' },
  { lng: 108.935, lat: 34.260, alt: 120, speed: 10, time: '14:07:45' },
  { lng: 108.940, lat: 34.262, alt: 100, speed: 8, time: '14:08:30' },
  { lng: 108.945, lat: 34.265, alt: 80, speed: 6, time: '14:09:15' },
  { lng: 108.950, lat: 34.270, alt: 60, speed: 5, time: '14:10:00' },
  { lng: 108.955, lat: 34.275, alt: 40, speed: 4, time: '14:10:45' },
  { lng: 108.960, lat: 34.280, alt: 0, speed: 0, time: '14:11:30', event: '降落' },
];

const flightRecords = [
  { id: '1', name: '高新区主干道日巡', drone: '大航蜂 M300-01', pilot: '张伟', date: '2026-04-13 14:00', duration: '11:30' },
  { id: '2', name: '北坡林区防火巡检', drone: '大航蜂 M30T-02', pilot: '李明', date: '2026-04-13 09:15', duration: '38:00' },
  { id: '3', name: '渭河流域排污排查', drone: '大航蜂 M350-03', pilot: '王芳', date: '2026-04-12 14:20', duration: '55:00' },
];

const selectedFlight = ref('1');
const progress = ref(0);
const playing = ref(false);
const playSpeed = ref(1);
let animTimer: number | undefined;
let currentMarkerId = '';
let trailLineId = '';

const currentPoint = ref(trackData[0]!);

function renderFullTrack() {
  addPolyline({
    path: trackData.map((p) => [p.lng, p.lat] as [number, number]),
    color: 'rgba(22,119,255,0.3)',
    width: 2,
  });

  trackData.forEach((p) => {
    if (p.event) {
      addMarker({
        position: [p.lng, p.lat],
        label: p.event,
      });
    }
  });
}

function updatePosition() {
  const idx = Math.min(
    Math.floor((progress.value / 100) * (trackData.length - 1)),
    trackData.length - 1,
  );
  currentPoint.value = trackData[idx]!;

  if (currentMarkerId) removeFeature(currentMarkerId);
  if (trailLineId) removeFeature(trailLineId);

  currentMarkerId = addMarker({
    position: [currentPoint.value.lng, currentPoint.value.lat],
    label: '当前',
  });

  const trail = trackData.slice(0, idx + 1);
  if (trail.length >= 2) {
    trailLineId = addPolyline({
      path: trail.map((p) => [p.lng, p.lat] as [number, number]),
      color: '#1677ff',
      width: 3,
    });
  }
}

function play() {
  if (progress.value >= 100) progress.value = 0;
  playing.value = true;
  animTimer = window.setInterval(() => {
    progress.value += 0.5 * playSpeed.value;
    if (progress.value >= 100) {
      progress.value = 100;
      playing.value = false;
      clearInterval(animTimer);
    }
    updatePosition();
  }, 50);
}

function pause() {
  playing.value = false;
  if (animTimer) clearInterval(animTimer);
}

function handleSliderChange(val: number) {
  progress.value = val;
  updatePosition();
}

function eventColor(event?: string) {
  if (event === 'AI 告警') return 'red';
  if (event === '拍照') return 'blue';
  if (event === '起飞' || event === '降落') return 'green';
  return 'default';
}

onMounted(async () => {
  await nextTick();
  if (mapRef.value) {
    await initMap({ center: [108.942, 34.270], zoom: 14 });
    renderFullTrack();
    updatePosition();
  }
});

onBeforeUnmount(() => {
  if (animTimer) clearInterval(animTimer);
});
</script>

<template>
  <Page>
    <Row :gutter="[16, 0]" class="h-full p-2">
      <Col :lg="7" :span="24">
        <div class="flex flex-col gap-3">
          <Card :bordered="false" size="small" title="飞行记录">
            <Select v-model:value="selectedFlight" style="width: 100%" size="small">
              <SelectOption v-for="f in flightRecords" :key="f.id" :value="f.id">
                {{ f.name }} · {{ f.date }}
              </SelectOption>
            </Select>
            <div class="mt-3 text-xs" style="color: var(--ant-color-text-tertiary)">
              设备：{{ flightRecords[0]?.drone }} · 飞手：{{ flightRecords[0]?.pilot }}
            </div>
          </Card>

          <Card :bordered="false" size="small" title="回放控制">
            <div class="flex flex-col gap-3">
              <div class="flex gap-2">
                <Button v-if="!playing" type="primary" block @click="play">播放</Button>
                <Button v-else block danger @click="pause">暂停</Button>
                <Button block @click="progress = 0; updatePosition()">重置</Button>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-xs flex-none" style="color: var(--ant-color-text-tertiary)">速度</span>
                <Slider v-model:value="playSpeed" :min="0.5" :max="5" :step="0.5" class="flex-1" />
                <span class="text-xs flex-none" style="color: var(--ant-color-text-secondary)">{{ playSpeed }}x</span>
              </div>
              <Slider :value="progress" :min="0" :max="100" :step="0.1" @change="handleSliderChange" />
            </div>
          </Card>

          <Card :bordered="false" size="small" title="实时数据">
            <div class="flex flex-col gap-2 text-sm">
              <div class="data-row">
                <span class="data-label">时间</span>
                <span>{{ currentPoint.time }}</span>
              </div>
              <div class="data-row">
                <span class="data-label">高度</span>
                <span>{{ currentPoint.alt }} m</span>
              </div>
              <div class="data-row">
                <span class="data-label">速度</span>
                <span>{{ currentPoint.speed }} m/s</span>
              </div>
              <div class="data-row">
                <span class="data-label">坐标</span>
                <span>{{ currentPoint.lng.toFixed(3) }}, {{ currentPoint.lat.toFixed(3) }}</span>
              </div>
              <div v-if="currentPoint.event" class="data-row">
                <span class="data-label">事件</span>
                <Tag :color="eventColor(currentPoint.event)" size="small">{{ currentPoint.event }}</Tag>
              </div>
            </div>
          </Card>

          <Card :bordered="false" size="small" title="关键事件">
            <div class="flex flex-col gap-2">
              <div v-for="(p, i) in trackData.filter(t => t.event)" :key="i" class="event-item">
                <Tag :color="eventColor(p.event)" size="small">{{ p.event }}</Tag>
                <span class="text-xs" style="color: var(--ant-color-text)">{{ p.time }}</span>
              </div>
            </div>
          </Card>
        </div>
      </Col>

      <Col :lg="17" :span="24">
        <Card :bordered="false" class="map-card">
          <div ref="mapRef" class="replay-map" />
        </Card>
      </Col>
    </Row>
  </Page>
</template>

<style lang="less" scoped>
.replay-map {
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

.data-row {
  display: flex;
  justify-content: space-between;
  color: var(--ant-color-text);
}

.data-label {
  color: var(--ant-color-text-tertiary);
  font-size: 12px;
}

.event-item {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
