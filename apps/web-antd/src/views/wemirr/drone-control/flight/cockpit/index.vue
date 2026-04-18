<script lang="ts" setup name="FlightCockpitPage">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { Button, Input, Modal, Slider, Tag, message } from 'ant-design-vue';

import VirtualFlightKeyboard from '../../components/VirtualFlightKeyboard.vue';
import { useClock } from '../../composables/useClock';
import { registerSafeFlightKeydown } from '../../composables/useSafeFlightKeys';

const router = useRouter();
const route = useRoute();

const { currentTime } = useClock();
let telemetryTimer: number | undefined;

function safeDecodeURI(val: unknown, fallback: string): string {
  if (typeof val !== 'string' || !val) return fallback;
  try { return decodeURIComponent(val); } catch { return val; }
}

const droneName = safeDecodeURI(route.query.drone, '大航蜂 M300-01');
const missionName = safeDecodeURI(route.query.mission, '高新区主干道日巡');

const drone = ref({
  name: droneName,
  mission: missionName,
  status: '飞行中',
  battery: 64,
  altitude: 118,
  speed: 9.8,
  heading: 245,
  gps: 22,
  signal: 95,
  lat: 34.2655,
  lng: 108.9432,
  mode: '航线模式',
  wind: 3.2,
  temp: 24,
  flightTime: 720,
  distance: 4850,
});

function updateTelemetry() {
  const d = drone.value;
  d.battery = Math.max(5, d.battery - (Math.random() > 0.7 ? 1 : 0));
  d.altitude = Math.max(20, Math.min(200, d.altitude + (Math.random() - 0.5) * 4));
  d.speed = Math.max(0, Math.min(18, d.speed + (Math.random() - 0.5) * 1.2));
  d.heading = (d.heading + (Math.random() - 0.45) * 3 + 360) % 360;
  d.gps = Math.max(12, Math.min(28, d.gps + Math.round((Math.random() - 0.5) * 2)));
  d.signal = Math.max(60, Math.min(100, d.signal + Math.round((Math.random() - 0.5) * 3)));
  d.lat += (Math.random() - 0.5) * 0.0002;
  d.lng += (Math.random() - 0.5) * 0.0002;
  d.wind = Math.max(0, Math.min(12, d.wind + (Math.random() - 0.5) * 0.6));
  d.temp = Math.max(15, Math.min(38, d.temp + (Math.random() - 0.5) * 0.5));
  d.flightTime += 1;
  d.distance += Math.round(d.speed);

  if (d.battery < 20 && d.status === '飞行中') {
    d.status = '低电量';
  }
}

let cleanupFlightKeys: (() => void) | undefined;

const gimbalPitch = ref(-30);
const gimbalYaw = ref(0);
const cameraZoom = ref(1);
const recording = ref(false);
const aiOverlay = ref(true);

const aiBoxes = ref([
  { id: 1, label: '车辆', confidence: 92, x: 30, y: 35, w: 18, h: 22 },
  { id: 2, label: '行人', confidence: 78, x: 60, y: 50, w: 12, h: 18 },
]);

let aiUpdateTimer: number | undefined;
function updateAiBoxes() {
  aiBoxes.value.forEach((b) => {
    b.x += (Math.random() - 0.5) * 1.5;
    b.y += (Math.random() - 0.5) * 1.2;
    b.confidence = Math.max(60, Math.min(99, b.confidence + Math.round((Math.random() - 0.5) * 4)));
  });
  if (Math.random() > 0.95 && aiBoxes.value.length < 5) {
    aiBoxes.value.push({
      id: Date.now(),
      label: ['车辆', '行人', '违停', '占道'][Math.floor(Math.random() * 4)]!,
      confidence: 70 + Math.floor(Math.random() * 25),
      x: 15 + Math.random() * 60,
      y: 20 + Math.random() * 50,
      w: 8 + Math.random() * 12,
      h: 10 + Math.random() * 15,
    });
  }
  if (Math.random() > 0.92 && aiBoxes.value.length > 1) {
    aiBoxes.value.splice(Math.floor(Math.random() * aiBoxes.value.length), 1);
  }
}

function handlePhoto() {
  message.success(`已拍照保存 — ${drone.value.lat.toFixed(4)}, ${drone.value.lng.toFixed(4)} @ ${currentTime.value}`);
}

function toggleRecord() {
  recording.value = !recording.value;
  message.info(recording.value ? '开始录制视频' : '停止录制，视频已保存');
}

const speakModalVisible = ref(false);
const speakText = ref('');
const speakVolume = ref(80);

function openSpeakModal() {
  speakText.value = '';
  speakModalVisible.value = true;
}

function confirmSpeak() {
  if (!speakText.value.trim()) {
    message.warning('请输入喊话内容');
    return;
  }
  speakModalVisible.value = false;
  message.success(`喊话已发送：「${speakText.value}」音量 ${speakVolume.value}%`);
}

function handleLight() {
  message.info('探照灯已开启');
}

function resetGimbal() {
  gimbalPitch.value = 0;
  gimbalYaw.value = 0;
  message.success('云台已回中');
}

function lookDown() {
  gimbalPitch.value = -90;
}

let emergencyModalOpen = false;

function handleEmergencyReturn() {
  if (emergencyModalOpen) {
    message.warning('请先关闭当前确认框');
    return;
  }
  emergencyModalOpen = true;
  Modal.confirm({
    title: '紧急返航',
    content: `确认让「${drone.value.name}」立即返航？当前任务将中止。`,
    okText: '确认返航',
    okType: 'danger',
    onOk() {
      drone.value.status = '返航中';
      message.warning('已执行紧急返航');
      emergencyModalOpen = false;
    },
    onCancel() {
      emergencyModalOpen = false;
    },
  });
}

const controlKeyMap: Record<string, string> = {
  q: '机头左转', w: '云台抬头', e: '机头右转',
  a: '机头左转(细)', s: '云台低头', d: '机头右转(细)',
  c: '镜头变焦-', ' ': '镜头变焦+',
};

const activeKey = ref('');
let lastControlAt = 0;

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function applyGimbalFromKey(k: string) {
  if (k === 'q') gimbalYaw.value = clamp(gimbalYaw.value - 6, -180, 180);
  else if (k === 'e') gimbalYaw.value = clamp(gimbalYaw.value + 6, -180, 180);
  else if (k === 'a') gimbalYaw.value = clamp(gimbalYaw.value - 3, -180, 180);
  else if (k === 'd') gimbalYaw.value = clamp(gimbalYaw.value + 3, -180, 180);
  else if (k === 'w') gimbalPitch.value = clamp(gimbalPitch.value + 4, -90, 30);
  else if (k === 's') gimbalPitch.value = clamp(gimbalPitch.value - 4, -90, 30);
  else if (k === 'c') cameraZoom.value = clamp(cameraZoom.value - 0.5, 1, 30);
  else if (k === ' ') cameraZoom.value = clamp(cameraZoom.value + 0.5, 1, 30);
}

function handleControlKey(key: string) {
  const k = key.length === 1 ? key.toLowerCase() : key === ' ' ? ' ' : key.toLowerCase();
  const label = controlKeyMap[k];
  if (!label) return;

  const now = Date.now();
  if (now - lastControlAt < 120) return;
  lastControlAt = now;

  applyGimbalFromKey(k === ' ' ? ' ' : k);
  activeKey.value = k;
  message.info(`指令：${label}`);
  setTimeout(() => {
    activeKey.value = '';
  }, 200);
}

onMounted(() => {
  telemetryTimer = window.setInterval(updateTelemetry, 1000);
  aiUpdateTimer = window.setInterval(updateAiBoxes, 800);
  cleanupFlightKeys = registerSafeFlightKeydown(
    (key) => {
      handleControlKey(key);
    },
    { enabled: () => !speakModalVisible.value },
  );
});

onBeforeUnmount(() => {
  if (telemetryTimer) clearInterval(telemetryTimer);
  if (aiUpdateTimer) clearInterval(aiUpdateTimer);
  cleanupFlightKeys?.();
});

function formatDuration(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, '0')}`;
}

function formatDistance(m: number) {
  return m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${m} m`;
}
</script>

<template>
  <div class="cockpit">
    <div class="ck-top">
      <Button type="text" class="ck-back" @click="router.back()">← 返回</Button>
      <div class="ck-top__center">
        <span class="ck-top__name">{{ drone.name }}</span>
        <span class="ck-top__sep">·</span>
        <span class="ck-top__mission">{{ drone.mission }}</span>
        <Tag :color="drone.status === '飞行中' ? 'blue' : drone.status === '低电量' ? 'red' : 'orange'" size="small" class="ml-2">{{ drone.status }}</Tag>
      </div>
      <span class="ck-top__time">{{ currentTime }}</span>
    </div>

    <div class="ck-fpv">
      <div class="ck-fpv__grid" />
      <canvas class="ck-fpv__noise" />
      <div class="ck-fpv__crosshair">
        <svg viewBox="0 0 80 80" width="80" height="80">
          <circle cx="40" cy="40" r="30" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1" />
          <line x1="40" y1="5" x2="40" y2="20" stroke="rgba(255,255,255,0.2)" stroke-width="1" />
          <line x1="40" y1="60" x2="40" y2="75" stroke="rgba(255,255,255,0.2)" stroke-width="1" />
          <line x1="5" y1="40" x2="20" y2="40" stroke="rgba(255,255,255,0.2)" stroke-width="1" />
          <line x1="60" y1="40" x2="75" y2="40" stroke="rgba(255,255,255,0.2)" stroke-width="1" />
        </svg>
      </div>
      <div class="ck-fpv__label">FPV 视频流 · {{ cameraZoom.toFixed(1) }}x</div>

      <template v-if="aiOverlay">
        <div
          v-for="box in aiBoxes"
          :key="box.id"
          class="ai-det"
          :style="{ left: box.x + '%', top: box.y + '%', width: box.w + '%', height: box.h + '%' }"
        >
          <span class="ai-det__tag">{{ box.label }} {{ box.confidence }}%</span>
        </div>
      </template>

      <div class="ck-zoom">{{ cameraZoom.toFixed(1) }}x</div>
      <div v-if="recording" class="ck-rec">● REC {{ formatDuration(drone.flightTime) }}</div>
    </div>

    <div class="ck-panel ck-panel--left">
      <div class="ck-hud">
        <div class="ck-hud__item">
          <div class="ck-hud__val">{{ Math.round(drone.altitude) }}</div>
          <div class="ck-hud__unit">m</div>
          <div class="ck-hud__label">高度</div>
        </div>
        <div class="ck-hud__item">
          <div class="ck-hud__val">{{ drone.speed.toFixed(1) }}</div>
          <div class="ck-hud__unit">m/s</div>
          <div class="ck-hud__label">速度</div>
        </div>
        <div class="ck-hud__item">
          <div class="ck-hud__val">{{ Math.round(drone.heading) }}°</div>
          <div class="ck-hud__unit">&nbsp;</div>
          <div class="ck-hud__label">航向</div>
        </div>
        <div class="ck-hud__item" :class="{ 'ck-hud__item--warn': drone.battery < 30 }">
          <div class="ck-hud__val">{{ drone.battery }}%</div>
          <div class="ck-hud__unit">&nbsp;</div>
          <div class="ck-hud__label">电量</div>
        </div>
      </div>

      <div class="ck-info">
        <div class="ck-info__row"><span>GPS</span><span>{{ drone.gps }} 颗</span></div>
        <div class="ck-info__row"><span>信号</span><span>{{ drone.signal }}%</span></div>
        <div class="ck-info__row"><span>坐标</span><span>{{ drone.lng.toFixed(4) }}, {{ drone.lat.toFixed(4) }}</span></div>
        <div class="ck-info__row"><span>模式</span><span>{{ drone.mode }}</span></div>
        <div class="ck-info__row"><span>风速</span><span>{{ drone.wind.toFixed(1) }} m/s</span></div>
        <div class="ck-info__row"><span>温度</span><span>{{ drone.temp.toFixed(0) }}°C</span></div>
        <div class="ck-info__row"><span>飞行时间</span><span>{{ formatDuration(drone.flightTime) }}</span></div>
        <div class="ck-info__row"><span>累计里程</span><span>{{ formatDistance(drone.distance) }}</span></div>
      </div>
    </div>

    <div class="ck-panel ck-panel--right">
      <div class="ck-section-title">云台控制</div>
      <div class="ck-slider-row">
        <span class="ck-slider-label">俯仰 {{ gimbalPitch }}°</span>
        <Slider v-model:value="gimbalPitch" :min="-90" :max="30" class="ck-slider" />
      </div>
      <div class="ck-slider-row">
        <span class="ck-slider-label">偏航 {{ gimbalYaw }}°</span>
        <Slider v-model:value="gimbalYaw" :min="-180" :max="180" class="ck-slider" />
      </div>
      <div class="ck-slider-row">
        <span class="ck-slider-label">变焦 {{ cameraZoom.toFixed(1) }}x</span>
        <Slider v-model:value="cameraZoom" :min="1" :max="30" :step="0.5" class="ck-slider" />
      </div>
      <div class="ck-gimbal-btns">
        <button class="ck-btn" @click="resetGimbal">回中</button>
        <button class="ck-btn" @click="lookDown">正下视</button>
      </div>

      <div class="ck-section-title mt-4">飞行操控</div>
      <VirtualFlightKeyboard :active-key="activeKey" @press="handleControlKey" />
      <div class="ck-keys__hint">
        <span>Q/E/A/D 偏航 · W/S 俯仰</span>
        <span>C / Space 变焦 − / +</span>
      </div>

      <div class="ck-section-title mt-4">快捷操作</div>
      <div class="ck-gimbal-btns">
        <button class="ck-btn ck-btn--danger" @click="handleEmergencyReturn">紧急返航</button>
      </div>
    </div>

    <div class="ck-bottom">
      <button class="ck-action" @click="handlePhoto">
        <span class="ck-action__icon">📷</span>
        <span>拍照</span>
      </button>
      <button class="ck-action" :class="{ 'ck-action--active': recording }" @click="toggleRecord">
        <span class="ck-action__icon">⏺</span>
        <span>{{ recording ? '停止' : '录制' }}</span>
      </button>
      <button class="ck-action" :class="{ 'ck-action--active': aiOverlay }" @click="aiOverlay = !aiOverlay">
        <span class="ck-action__icon">🤖</span>
        <span>AI {{ aiOverlay ? 'ON' : 'OFF' }}</span>
      </button>
      <button class="ck-action" @click="openSpeakModal">
        <span class="ck-action__icon">📢</span>
        <span>喊话</span>
      </button>
      <button class="ck-action" @click="handleLight">
        <span class="ck-action__icon">💡</span>
        <span>照明</span>
      </button>
    </div>

    <Modal v-model:open="speakModalVisible" title="无人机喊话" ok-text="发送喊话" @ok="confirmSpeak">
      <div class="flex flex-col gap-3 mt-2">
        <div>
          <span class="text-sm text-gray-500 mr-2">快捷语音：</span>
          <div class="flex gap-2 flex-wrap mt-1">
            <Tag class="cursor-pointer" color="blue" @click="speakText = '请注意安全，此区域正在进行无人机巡查'">安全提示</Tag>
            <Tag class="cursor-pointer" color="orange" @click="speakText = '前方车辆请立即驶离，您已违规停车'">违停警告</Tag>
            <Tag class="cursor-pointer" color="red" @click="speakText = '请立即离开危险区域，此处禁止通行'">疏散警告</Tag>
            <Tag class="cursor-pointer" color="green" @click="speakText = '感谢配合，巡查结束，祝您一切顺利'">结束通知</Tag>
          </div>
        </div>
        <Input
          v-model:value="speakText"
          type="textarea"
          :rows="3"
          placeholder="输入喊话内容..."
        />
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-500">音量:</span>
          <Slider v-model:value="speakVolume" :min="20" :max="100" style="flex:1" />
          <span class="text-sm">{{ speakVolume }}%</span>
        </div>
      </div>
    </Modal>
  </div>
</template>

<style lang="less" scoped>
.cockpit {
  position: fixed;
  inset: 0;
  z-index: 999;
  background: #0a0e1a;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: 'SF Mono', 'Menlo', monospace;
}

.ck-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  height: 44px;
  background: rgba(0,0,0,0.6);
  border-bottom: 1px solid rgba(255,255,255,0.06);
  z-index: 10;
}
.ck-back { color: rgba(255,255,255,0.6) !important; font-size: 13px !important; }
.ck-top__center { display: flex; align-items: center; gap: 6px; }
.ck-top__name { color: #f9fafb; font-size: 14px; font-weight: 700; }
.ck-top__sep { color: rgba(255,255,255,0.2); }
.ck-top__mission { color: rgba(255,255,255,0.5); font-size: 12px; }
.ck-top__time { color: rgba(255,255,255,0.4); font-size: 12px; font-variant-numeric: tabular-nums; }

.ck-fpv {
  flex: 1;
  position: relative;
  background: linear-gradient(135deg, #0d1520 0%, #111d33 50%, #0a1018 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}
.ck-fpv__grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
  background-size: 80px 80px;
}
.ck-fpv__noise {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0.03;
  pointer-events: none;
  mix-blend-mode: screen;
}
.ck-fpv__crosshair { z-index: 2; }
.ck-fpv__label {
  position: absolute;
  bottom: 60px;
  color: rgba(255,255,255,0.15);
  font-size: 14px;
  letter-spacing: 4px;
}
.ck-zoom {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 10px;
  background: rgba(0,0,0,0.5);
  color: rgba(255,255,255,0.6);
  font-size: 12px;
  border-radius: 4px;
  font-variant-numeric: tabular-nums;
}
.ck-rec {
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  padding: 4px 12px;
  background: rgba(239,68,68,0.8);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  border-radius: 4px;
  animation: rec-blink 1s infinite;
}
@keyframes rec-blink { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }

.ai-det {
  position: absolute;
  border: 2px solid #22d3ee;
  border-radius: 2px;
  z-index: 3;
  transition: all 0.3s ease;
}
.ai-det__tag {
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

.ck-panel {
  position: absolute;
  top: 60px;
  width: 220px;
  padding: 14px;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 10px;
  z-index: 5;
}
.ck-panel--left { left: 14px; }
.ck-panel--right { right: 14px; }

.ck-hud {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 14px;
}
.ck-hud__item { text-align: center; }
.ck-hud__val {
  font-size: 22px;
  font-weight: 800;
  color: #f9fafb;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  transition: color 0.3s;
}
.ck-hud__unit { font-size: 10px; color: rgba(255,255,255,0.3); margin-top: 2px; }
.ck-hud__label { font-size: 10px; color: rgba(255,255,255,0.4); margin-top: 4px; }
.ck-hud__item--warn .ck-hud__val { color: #ef4444; }

.ck-info { display: flex; flex-direction: column; gap: 6px; }
.ck-info__row {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: rgba(255,255,255,0.5);
}
.ck-info__row span:last-child { color: rgba(255,255,255,0.75); font-variant-numeric: tabular-nums; }

.ck-section-title {
  font-size: 12px;
  font-weight: 700;
  color: rgba(255,255,255,0.6);
  margin-bottom: 10px;
}
.ck-slider-row { margin-bottom: 8px; }
.ck-slider-label {
  font-size: 11px;
  color: rgba(255,255,255,0.45);
  font-variant-numeric: tabular-nums;
}
.ck-slider {
  :deep(.ant-slider-rail) { background: rgba(255,255,255,0.08) !important; }
  :deep(.ant-slider-track) { background: #1677ff !important; }
  :deep(.ant-slider-handle::after) { box-shadow: 0 0 0 2px #1677ff !important; }
}
.ck-gimbal-btns {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}
.ck-btn {
  flex: 1;
  padding: 6px 0;
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 6px;
  background: rgba(255,255,255,0.04);
  color: rgba(255,255,255,0.6);
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s;
  &:hover { background: rgba(255,255,255,0.08); color: #f9fafb; }
}
.ck-btn--danger {
  border-color: rgba(239,68,68,0.3);
  color: #ef4444;
  &:hover { background: rgba(239,68,68,0.15); }
}

.ck-keys__hint {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  margin-top: 6px;
  font-size: 9px;
  color: rgba(255,255,255,0.25);
  text-align: center;
}

.ck-bottom {
  display: flex;
  justify-content: center;
  gap: 6px;
  padding: 8px 16px;
  background: rgba(0,0,0,0.6);
  border-top: 1px solid rgba(255,255,255,0.06);
  z-index: 10;
}
.ck-action {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 8px 18px;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 8px;
  background: rgba(255,255,255,0.03);
  color: rgba(255,255,255,0.55);
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s;
  &:hover { background: rgba(255,255,255,0.08); color: #f9fafb; }
}
.ck-action--active {
  background: rgba(22,119,255,0.15);
  border-color: rgba(22,119,255,0.3);
  color: #60a5fa;
}
.ck-action__icon { font-size: 18px; }
</style>
