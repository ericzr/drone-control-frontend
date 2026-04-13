<script lang="ts" setup name="DispatchVideoWallPage">
import { Page } from '@vben/common-ui';

import { ref } from 'vue';

import {
  Button,
  Card,
  Col,
  Row,
  Select,
  Space,
  Tag,
  message,
} from 'ant-design-vue';

const layoutOptions = [
  { label: '2×2 四画面', value: '2x2' },
  { label: '3×3 九画面', value: '3x3' },
  { label: '1+5 画中画', value: '1+5' },
  { label: '4×4 十六画面', value: '4x4' },
];

const currentLayout = ref('3x3');

const channels = ref([
  { id: 'ch1', name: '高新路口球机 C-01', status: '在线', protocol: 'GB28181', location: '高新区北片' },
  { id: 'ch2', name: '沿河监控 C-02', status: '在线', protocol: 'GB28181', location: '沿河西路' },
  { id: 'ch3', name: '林区枪机 C-03', status: '在线', protocol: 'RTSP', location: '林草防火区' },
  { id: 'ch4', name: '园区全景 C-04', status: '在线', protocol: 'ONVIF', location: '生态园区' },
  { id: 'ch5', name: '热成像 C-05', status: '在线', protocol: 'GB28181', location: '林草防火区' },
  { id: 'ch6', name: '城管路口 C-06', status: '离线', protocol: 'GB28181', location: '城管巡检区' },
  { id: 'ch7', name: '大航蜂 M300-01 FPV', status: '推流中', protocol: 'RTMP', location: '高新区北片' },
  { id: 'ch8', name: '大航蜂 M300-07 FPV', status: '推流中', protocol: 'RTMP', location: '城管巡检区' },
  { id: 'ch9', name: '大航蜂 M350-03 FPV', status: '推流中', protocol: 'RTMP', location: '生态园区' },
]);

const gridCols = { '2x2': 2, '3x3': 3, '1+5': 3, '4x4': 4 };

function getStatusColor(s: string) {
  if (s === '推流中') return 'processing';
  if (s === '在线') return 'success';
  return 'default';
}

function getStatusTagColor(s: string) {
  if (s === '推流中') return 'blue';
  if (s === '在线') return 'green';
  return 'default';
}
</script>

<template>
  <Page :auto-content-height="true">
    <div class="flex flex-col gap-4 p-2">
      <Card :bordered="false">
        <div class="flex items-center justify-between">
          <Space>
            <span class="text-sm text-slate-600 dark:text-slate-400">布局模式：</span>
            <Select
              v-model:value="currentLayout"
              :options="layoutOptions"
              style="width: 160px"
            />
          </Space>
          <Space>
            <Button @click="message.info('全部截图占位')">全部截图</Button>
            <Button @click="message.info('全部录制占位')">全部录制</Button>
            <Button type="primary" @click="message.info('全屏模式占位')">全屏</Button>
          </Space>
        </div>
      </Card>

      <div
        class="video-grid"
        :style="{ gridTemplateColumns: `repeat(${gridCols[currentLayout as keyof typeof gridCols] || 3}, 1fr)` }"
      >
        <div
          v-for="ch in channels"
          :key="ch.id"
          class="video-cell"
        >
          <div class="video-cell__header">
            <div class="flex items-center gap-2">
              <Tag :color="getStatusTagColor(ch.status)" size="small" class="m-0">
                {{ ch.status }}
              </Tag>
              <span class="text-xs text-white/80 font-medium">{{ ch.name }}</span>
            </div>
            <span class="text-xs text-white/50">{{ ch.protocol }}</span>
          </div>
          <div class="video-cell__body">
            <div v-if="ch.status === '离线'" class="video-cell__offline">
              <div class="text-white/30 text-sm">信号中断</div>
            </div>
            <div v-else class="video-cell__stream">
              <div class="text-white/40 text-xs">{{ ch.location }}</div>
              <div class="text-white/20 text-xs mt-1">实时视频流占位</div>
            </div>
          </div>
          <div class="video-cell__footer">
            <Space :size="4">
              <Button size="small" type="text" class="video-btn" @click="message.info(`${ch.name} 云台控制`)">云台</Button>
              <Button size="small" type="text" class="video-btn" @click="message.info(`${ch.name} 截图`)">截图</Button>
              <Button size="small" type="text" class="video-btn" @click="message.info(`${ch.name} 回放`)">回放</Button>
            </Space>
          </div>
        </div>
      </div>
    </div>
  </Page>
</template>

<style lang="less" scoped>
.video-grid {
  display: grid;
  gap: 8px;
}

.video-cell {
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  overflow: hidden;
  background: #1a1a2e;
  border: 1px solid #2a2a4a;
}

.video-cell__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 10px;
  background: rgba(0, 0, 0, 0.3);
}

.video-cell__body {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 160px;
  background: linear-gradient(135deg, #0a0a1a 0%, #16213e 100%);
}

.video-cell__offline {
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-cell__stream {
  text-align: center;
}

.video-cell__footer {
  padding: 4px 8px;
  background: rgba(0, 0, 0, 0.3);
}

.video-btn {
  color: rgba(255, 255, 255, 0.5) !important;
  font-size: 12px !important;
  padding: 0 4px !important;

  &:hover {
    color: rgba(255, 255, 255, 0.9) !important;
  }
}
</style>
