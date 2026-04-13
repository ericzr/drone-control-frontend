<script lang="ts" setup name="FlightCockpitPage">
import { Page } from '@vben/common-ui';

import { nextTick, onMounted, ref } from 'vue';

import {
  Button,
  Card,
  Col,
  Descriptions,
  DescriptionsItem,
  Divider,
  Progress,
  Row,
  Slider,
  Space,
  Tag,
  message,
} from 'ant-design-vue';

import { useMap } from '#/utils/map';

const droneInfo = ref({
  name: '大航蜂 M300-01',
  mission: '高新区主干道日巡',
  status: '飞行中',
  battery: 64,
  altitude: 118,
  speed: 9.8,
  heading: 245,
  gpsCount: 22,
  signal: 95,
  latitude: '34.2655',
  longitude: '108.9432',
  flightMode: '航线模式',
  windSpeed: 3.2,
  temperature: 24,
});

const gimbalPitch = ref(-30);
const gimbalYaw = ref(0);
const cameraZoom = ref(1);

const cockpitMapRef = ref<HTMLElement | null>(null);
const { initMap, addMarker, addPolyline } = useMap(cockpitMapRef);

function handleCommand(cmd: string) {
  message.info(`已发送指令：${cmd}`);
}

onMounted(async () => {
  await nextTick();
  if (cockpitMapRef.value) {
    await initMap({
      center: [
        Number.parseFloat(droneInfo.value.longitude),
        Number.parseFloat(droneInfo.value.latitude),
      ],
      zoom: 15,
    });

    addMarker({
      position: [
        Number.parseFloat(droneInfo.value.longitude),
        Number.parseFloat(droneInfo.value.latitude),
      ],
      label: droneInfo.value.name,
    });

    addPolyline({
      path: [
        [108.938, 34.268],
        [108.940, 34.267],
        [108.942, 34.266],
        [108.943, 34.265],
        [108.943, 34.265],
      ],
      color: '#52c41a',
      width: 3,
    });
  }
});
</script>

<template>
  <Page :auto-content-height="true">
    <div class="flex flex-col gap-4 p-2">
      <Row :gutter="[16, 16]">
        <Col :xl="16" :span="24">
          <Card :bordered="false" class="cockpit-video">
            <div class="cockpit-video__placeholder">
              <div class="cockpit-video__hud">
                <div class="cockpit-video__hud-item">
                  ALT {{ droneInfo.altitude }}m
                </div>
                <div class="cockpit-video__hud-item">
                  SPD {{ droneInfo.speed }}m/s
                </div>
                <div class="cockpit-video__hud-item">
                  HDG {{ droneInfo.heading }}°
                </div>
                <div class="cockpit-video__hud-item">
                  BAT {{ droneInfo.battery }}%
                </div>
              </div>
              <div class="cockpit-video__crosshair">+</div>
              <div class="cockpit-video__label">
                实时视频流区域（待接入 WebRTC / RTSP）
              </div>
            </div>

            <div class="mt-3 flex items-center justify-between">
              <Space>
                <Tag color="green">{{ droneInfo.flightMode }}</Tag>
                <Tag color="blue">GPS: {{ droneInfo.gpsCount }}颗</Tag>
                <Tag color="cyan">信号: {{ droneInfo.signal }}%</Tag>
                <Tag>风速: {{ droneInfo.windSpeed }}m/s</Tag>
              </Space>
              <Space>
                <Button size="small" type="primary" @click="handleCommand('截图')">截图</Button>
                <Button size="small" @click="handleCommand('录像开始')">录像</Button>
                <Button size="small" @click="handleCommand('切换红外')">红外</Button>
              </Space>
            </div>
          </Card>
        </Col>

        <Col :xl="8" :span="24">
          <Card :bordered="false" title="飞行器信息">
            <Descriptions :column="1" bordered size="small">
              <DescriptionsItem label="设备名称">
                {{ droneInfo.name }}
              </DescriptionsItem>
              <DescriptionsItem label="当前任务">
                {{ droneInfo.mission }}
              </DescriptionsItem>
              <DescriptionsItem label="飞行状态">
                <Tag color="processing">{{ droneInfo.status }}</Tag>
              </DescriptionsItem>
              <DescriptionsItem label="经度">
                {{ droneInfo.longitude }}
              </DescriptionsItem>
              <DescriptionsItem label="纬度">
                {{ droneInfo.latitude }}
              </DescriptionsItem>
              <DescriptionsItem label="飞行高度">
                {{ droneInfo.altitude }} m
              </DescriptionsItem>
              <DescriptionsItem label="飞行速度">
                {{ droneInfo.speed }} m/s
              </DescriptionsItem>
              <DescriptionsItem label="航向角">
                {{ droneInfo.heading }}°
              </DescriptionsItem>
              <DescriptionsItem label="气温">
                {{ droneInfo.temperature }}°C
              </DescriptionsItem>
              <DescriptionsItem label="电量">
                <Progress
                  :percent="droneInfo.battery"
                  :status="droneInfo.battery < 30 ? 'exception' : 'active'"
                  size="small"
                />
              </DescriptionsItem>
            </Descriptions>
          </Card>
        </Col>
      </Row>

      <Row :gutter="[16, 16]">
        <Col :xl="8" :span="24">
          <Card :bordered="false" title="飞行控制">
            <div class="flex flex-col gap-4">
              <div class="grid grid-cols-3 gap-2">
                <div />
                <Button block @click="handleCommand('前进')">前进 ↑</Button>
                <div />
                <Button block @click="handleCommand('左转')">左转 ←</Button>
                <Button block type="primary" danger @click="handleCommand('悬停')">悬停</Button>
                <Button block @click="handleCommand('右转')">右转 →</Button>
                <div />
                <Button block @click="handleCommand('后退')">后退 ↓</Button>
                <div />
              </div>
              <Divider style="margin: 4px 0" />
              <div class="flex gap-2">
                <Button block @click="handleCommand('上升 +5m')">上升 +5m</Button>
                <Button block @click="handleCommand('下降 -5m')">下降 -5m</Button>
              </div>
              <div class="flex gap-2">
                <Button block type="primary" @click="handleCommand('一键返航')">一键返航</Button>
                <Button block danger @click="handleCommand('紧急降落')">紧急降落</Button>
              </div>
            </div>
          </Card>
        </Col>

        <Col :xl="8" :span="24">
          <Card :bordered="false" title="云台控制">
            <div class="flex flex-col gap-4">
              <div>
                <div class="mb-1 text-sm text-slate-600 dark:text-slate-400">
                  俯仰角度: {{ gimbalPitch }}°
                </div>
                <Slider v-model:value="gimbalPitch" :max="30" :min="-90" />
              </div>
              <div>
                <div class="mb-1 text-sm text-slate-600 dark:text-slate-400">
                  偏航角度: {{ gimbalYaw }}°
                </div>
                <Slider v-model:value="gimbalYaw" :max="180" :min="-180" />
              </div>
              <div>
                <div class="mb-1 text-sm text-slate-600 dark:text-slate-400">
                  变焦倍数: {{ cameraZoom }}x
                </div>
                <Slider v-model:value="cameraZoom" :max="30" :min="1" :step="0.5" />
              </div>
              <div class="flex gap-2">
                <Button block @click="gimbalPitch = 0; gimbalYaw = 0">云台回中</Button>
                <Button block @click="gimbalPitch = -90">正下视</Button>
              </div>
            </div>
          </Card>
        </Col>

        <Col :xl="8" :span="24">
          <Card :bordered="false" title="航线地图">
            <div class="cockpit-map-container">
              <div ref="cockpitMapRef" class="cockpit-map-inner" />
            </div>
            <div class="mt-2 text-center">
              <Tag color="blue">{{ droneInfo.latitude }}, {{ droneInfo.longitude }}</Tag>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  </Page>
</template>

<style lang="less" scoped>
.cockpit-video__placeholder {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 360px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  border-radius: 8px;
  overflow: hidden;
}

.cockpit-video__hud {
  position: absolute;
  top: 12px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 24px;
}

.cockpit-video__hud-item {
  color: #00ff88;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  font-weight: bold;
  text-shadow: 0 0 6px rgba(0, 255, 136, 0.5);
}

.cockpit-video__crosshair {
  color: rgba(255, 255, 255, 0.6);
  font-size: 48px;
  font-weight: 100;
  user-select: none;
}

.cockpit-video__label {
  position: absolute;
  bottom: 16px;
  color: rgba(255, 255, 255, 0.4);
  font-size: 13px;
}

.cockpit-map-container {
  border-radius: 8px;
  overflow: hidden;
}

.cockpit-map-inner {
  height: 280px;
  border-radius: 8px;
  overflow: hidden;
}
</style>
