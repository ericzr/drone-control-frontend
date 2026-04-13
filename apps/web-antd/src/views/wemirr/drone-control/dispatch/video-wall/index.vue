<script lang="ts" setup name="DispatchVideoWallPage">
import { Page } from '@vben/common-ui';

import { onBeforeUnmount, onMounted, ref } from 'vue';

import {
  Button,
  Card,
  Drawer,
  Select,
  SelectOption,
  Slider,
  Space,
  Switch,
  Tag,
  message,
} from 'ant-design-vue';

const layoutOptions = [
  { label: '2×2 四画面', value: 4 },
  { label: '3×3 九画面', value: 9 },
  { label: '4×4 十六画面', value: 16 },
];

const layoutCols: Record<number, number> = { 4: 2, 9: 3, 16: 4 };
const cellCount = ref(9);

interface Channel {
  id: string;
  name: string;
  status: string;
  protocol: string;
  location: string;
  lens: string;
  quality: string;
  aiEnabled: boolean;
  aiBoxes: { x: number; y: number; w: number; h: number; label: string; conf: number }[];
}

const channels = ref<Channel[]>([
  { id: 'ch1', name: '高新路口球机 C-01', status: '在线', protocol: 'GB28181', location: '高新区', lens: '广角', quality: '1080p', aiEnabled: true, aiBoxes: [{ x: 35, y: 40, w: 18, h: 25, label: '车辆', conf: 0.92 }] },
  { id: 'ch2', name: '沿河监控 C-02', status: '在线', protocol: 'GB28181', location: '沿河西路', lens: '广角', quality: '1080p', aiEnabled: false, aiBoxes: [] },
  { id: 'ch3', name: '林区枪机 C-03', status: '在线', protocol: 'RTSP', location: '林草防火区', lens: '变焦', quality: '4K', aiEnabled: true, aiBoxes: [{ x: 20, y: 30, w: 30, h: 20, label: '烟雾', conf: 0.88 }] },
  { id: 'ch4', name: '园区全景 C-04', status: '在线', protocol: 'ONVIF', location: '生态园区', lens: '广角', quality: '1080p', aiEnabled: false, aiBoxes: [] },
  { id: 'ch5', name: '热成像 C-05', status: '在线', protocol: 'GB28181', location: '林草防火区', lens: '红外', quality: '720p', aiEnabled: true, aiBoxes: [{ x: 55, y: 50, w: 12, h: 18, label: '人员', conf: 0.85 }] },
  { id: 'ch6', name: '城管路口 C-06', status: '离线', protocol: 'GB28181', location: '城管巡检区', lens: '广角', quality: '1080p', aiEnabled: false, aiBoxes: [] },
  { id: 'ch7', name: 'M300-01 FPV', status: '推流中', protocol: 'RTMP', location: '高新区', lens: '广角', quality: '1080p', aiEnabled: true, aiBoxes: [{ x: 40, y: 55, w: 20, h: 15, label: '违停', conf: 0.91 }, { x: 15, y: 35, w: 14, h: 20, label: '行人', conf: 0.78 }] },
  { id: 'ch8', name: 'M300-07 FPV', status: '推流中', protocol: 'RTMP', location: '城管巡检区', lens: '广角', quality: '720p', aiEnabled: false, aiBoxes: [] },
  { id: 'ch9', name: 'M350-03 FPV', status: '推流中', protocol: 'RTMP', location: '生态园区', lens: '变焦', quality: '4K', aiEnabled: true, aiBoxes: [{ x: 30, y: 25, w: 25, h: 30, label: '漂浮物', conf: 0.83 }] },
]);

const visibleChannels = () => channels.value.slice(0, cellCount.value);

function statusColor(s: string) {
  if (s === '推流中') return 'blue';
  if (s === '在线') return 'green';
  return 'default';
}

const ptzDrawerVisible = ref(false);
const ptzChannel = ref<Channel | null>(null);
const ptzPitch = ref(0);
const ptzYaw = ref(0);
const ptzZoom = ref(1);

function openPtz(ch: Channel) {
  ptzChannel.value = ch;
  ptzPitch.value = 0;
  ptzYaw.value = 0;
  ptzZoom.value = 1;
  ptzDrawerVisible.value = true;
}

function handleScreenshot(ch: Channel) {
  message.success(`${ch.name} 截图已保存`);
}

function handleRecord(ch: Channel) {
  message.info(`${ch.name} 开始录制`);
}

function toggleAi(ch: Channel) {
  ch.aiEnabled = !ch.aiEnabled;
}

const scanLines = ref<Map<string, number>>(new Map());
let animFrame = 0;

function animateScanLines() {
  channels.value.forEach((ch) => {
    if (ch.status !== '离线') {
      const cur = scanLines.value.get(ch.id) ?? Math.random() * 100;
      scanLines.value.set(ch.id, (cur + 0.3 + Math.random() * 0.2) % 100);
    }
  });
  animFrame = requestAnimationFrame(animateScanLines);
}

onMounted(() => {
  animateScanLines();
});

onBeforeUnmount(() => {
  if (animFrame) cancelAnimationFrame(animFrame);
});
</script>

<template>
  <Page :auto-content-height="true">
    <div class="flex flex-col gap-3 p-2">
      <Card :bordered="false" size="small">
        <div class="flex items-center justify-between">
          <Space>
            <span class="text-sm" style="color: var(--ant-color-text-secondary)">布局：</span>
            <Select v-model:value="cellCount" style="width: 150px" size="small">
              <SelectOption v-for="opt in layoutOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</SelectOption>
            </Select>
          </Space>
          <Space>
            <Button size="small" @click="message.success('全部截图已保存')">全部截图</Button>
            <Button size="small" @click="message.info('全部录制开始')">全部录制</Button>
          </Space>
        </div>
      </Card>

      <div
        class="video-grid"
        :style="{ gridTemplateColumns: `repeat(${layoutCols[cellCount] || 3}, 1fr)` }"
      >
        <div
          v-for="ch in visibleChannels()"
          :key="ch.id"
          class="video-cell"
        >
          <div class="video-cell__header">
            <div class="flex items-center gap-2">
              <Tag :color="statusColor(ch.status)" size="small" class="m-0">{{ ch.status }}</Tag>
              <span class="video-cell__name">{{ ch.name }}</span>
            </div>
            <Space :size="2">
              <Select v-model:value="ch.lens" size="small" :bordered="false" class="lens-select">
                <SelectOption value="广角">广角</SelectOption>
                <SelectOption value="变焦">变焦</SelectOption>
                <SelectOption value="红外">红外</SelectOption>
                <SelectOption value="夜视">夜视</SelectOption>
              </Select>
              <Select v-model:value="ch.quality" size="small" :bordered="false" class="lens-select">
                <SelectOption value="720p">720p</SelectOption>
                <SelectOption value="1080p">1080p</SelectOption>
                <SelectOption value="4K">4K</SelectOption>
              </Select>
            </Space>
          </div>

          <div class="video-cell__body" :class="{ 'video-cell__body--ir': ch.lens === '红外', 'video-cell__body--nv': ch.lens === '夜视' }">
            <template v-if="ch.status === '离线'">
              <div class="video-cell__offline">信号中断</div>
            </template>
            <template v-else>
              <div
                class="video-cell__scanline"
                :style="{ top: `${scanLines.get(ch.id) ?? 0}%` }"
              />
              <div class="video-cell__noise" />
              <div class="video-cell__location">{{ ch.location }}</div>

              <template v-if="ch.aiEnabled">
                <div
                  v-for="(box, bi) in ch.aiBoxes"
                  :key="bi"
                  class="ai-box"
                  :style="{ left: `${box.x}%`, top: `${box.y}%`, width: `${box.w}%`, height: `${box.h}%` }"
                >
                  <span class="ai-box__label">{{ box.label }} {{ (box.conf * 100).toFixed(0) }}%</span>
                </div>
              </template>
            </template>
          </div>

          <div class="video-cell__footer">
            <Space :size="2">
              <Button size="small" type="text" class="video-btn" @click="openPtz(ch)">云台</Button>
              <Button size="small" type="text" class="video-btn" @click="handleScreenshot(ch)">截图</Button>
              <Button size="small" type="text" class="video-btn" @click="handleRecord(ch)">录制</Button>
              <Button size="small" type="text" class="video-btn" :class="{ 'video-btn--active': ch.aiEnabled }" @click="toggleAi(ch)">AI</Button>
            </Space>
          </div>
        </div>
      </div>
    </div>

    <Drawer v-model:open="ptzDrawerVisible" :title="`云台控制 · ${ptzChannel?.name || ''}`" width="320" placement="right">
      <div class="flex flex-col gap-5">
        <div>
          <div class="ptz-label">俯仰角度：{{ ptzPitch }}°</div>
          <Slider v-model:value="ptzPitch" :min="-90" :max="30" />
        </div>
        <div>
          <div class="ptz-label">偏航角度：{{ ptzYaw }}°</div>
          <Slider v-model:value="ptzYaw" :min="-180" :max="180" />
        </div>
        <div>
          <div class="ptz-label">变焦倍数：{{ ptzZoom }}x</div>
          <Slider v-model:value="ptzZoom" :min="1" :max="30" :step="0.5" />
        </div>
        <div class="flex gap-2">
          <Button block @click="ptzPitch = 0; ptzYaw = 0">回中</Button>
          <Button block @click="ptzPitch = -90">正下视</Button>
        </div>
      </div>
    </Drawer>
  </Page>
</template>

<style lang="less" scoped>
.video-grid {
  display: grid;
  gap: 6px;
}

.video-cell {
  display: flex;
  flex-direction: column;
  border-radius: 6px;
  overflow: hidden;
  background: #111827;
  border: 1px solid #1e293b;
}

.video-cell__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 8px;
  background: rgb(0 0 0 / 40%);
  min-height: 32px;
}

.video-cell__name {
  font-size: 11px;
  color: rgb(255 255 255 / 75%);
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 120px;
}

.lens-select {
  :deep(.ant-select-selector) {
    background: transparent !important;
    border: none !important;
    padding: 0 4px !important;
    color: rgb(255 255 255 / 50%) !important;
    font-size: 11px !important;
    min-height: 22px !important;
    height: 22px !important;
  }

  :deep(.ant-select-arrow) {
    color: rgb(255 255 255 / 30%) !important;
    font-size: 10px;
  }
}

.video-cell__body {
  position: relative;
  flex: 1;
  min-height: 140px;
  background: linear-gradient(135deg, #0a0f1a 0%, #111d33 50%, #0d1520 100%);
  overflow: hidden;

  &--ir {
    background: linear-gradient(135deg, #1a0a2e 0%, #2d1040 50%, #1a0820 100%);
  }

  &--nv {
    background: linear-gradient(135deg, #0a1a0a 0%, #102d10 50%, #081508 100%);
  }
}

.video-cell__scanline {
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgb(255 255 255 / 4%), transparent);
  pointer-events: none;
}

.video-cell__noise {
  position: absolute;
  inset: 0;
  opacity: 0.03;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  pointer-events: none;
}

.video-cell__location {
  position: absolute;
  bottom: 8px;
  left: 8px;
  font-size: 11px;
  color: rgb(255 255 255 / 30%);
}

.video-cell__offline {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: rgb(255 255 255 / 25%);
  font-size: 13px;
}

.ai-box {
  position: absolute;
  border: 2px solid #22d3ee;
  border-radius: 2px;
  pointer-events: none;
}

.ai-box__label {
  position: absolute;
  top: -18px;
  left: 0;
  padding: 1px 6px;
  background: #22d3ee;
  color: #000;
  font-size: 10px;
  font-weight: 700;
  border-radius: 2px;
  white-space: nowrap;
}

.video-cell__footer {
  padding: 2px 6px;
  background: rgb(0 0 0 / 40%);
}

.video-btn {
  color: rgb(255 255 255 / 45%) !important;
  font-size: 11px !important;
  padding: 0 4px !important;
  height: 24px !important;

  &:hover {
    color: rgb(255 255 255 / 85%) !important;
  }
}

.video-btn--active {
  color: #22d3ee !important;
}

.ptz-label {
  font-size: 13px;
  color: var(--ant-color-text-secondary);
  margin-bottom: 4px;
}

@media (max-width: 768px) {
  .video-grid {
    grid-template-columns: repeat(1, 1fr) !important;
  }

  .video-cell__body {
    min-height: 200px;
  }
}
</style>
