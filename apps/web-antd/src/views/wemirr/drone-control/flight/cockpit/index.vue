<script lang="ts" setup name="FlightCockpitPage">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { Button, Slider, Tag, message } from 'ant-design-vue';

const router = useRouter();
const currentTime = ref('');
let timer: number | undefined;

function updateTime() {
  const d = new Date();
  const pad = (n: number) => `${n}`.padStart(2, '0');
  currentTime.value = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

onMounted(() => {
  updateTime();
  timer = window.setInterval(updateTime, 1000);
});
onBeforeUnmount(() => { if (timer) clearInterval(timer); });

const drone = ref({
  name: '大航蜂 M300-01',
  mission: '高新区主干道日巡',
  status: '飞行中',
  battery: 64,
  altitude: 118,
  speed: 9.8,
  heading: 245,
  gps: 22,
  signal: 95,
  lat: '34.2655',
  lng: '108.9432',
  mode: '航线模式',
  wind: 3.2,
  temp: 24,
});

const gimbalPitch = ref(-30);
const gimbalYaw = ref(0);
const cameraZoom = ref(1);
const recording = ref(false);
const aiOverlay = ref(true);

function handlePhoto() { message.success('已拍照'); }
function toggleRecord() { recording.value = !recording.value; message.info(recording.value ? '开始录制' : '停止录制'); }
function handleSpeak() { message.info('喊话功能待接入'); }
function handleLight() { message.info('照明已开启'); }
function resetGimbal() { gimbalPitch.value = 0; gimbalYaw.value = 0; message.success('云台已回中'); }
function lookDown() { gimbalPitch.value = -90; }
</script>

<template>
  <div class="cockpit">
    <!-- Top Bar -->
    <div class="ck-top">
      <Button type="text" class="ck-back" @click="router.back()">← 返回</Button>
      <div class="ck-top__center">
        <span class="ck-top__name">{{ drone.name }}</span>
        <span class="ck-top__sep">·</span>
        <span class="ck-top__mission">{{ drone.mission }}</span>
        <Tag color="blue" size="small" class="ml-2">{{ drone.status }}</Tag>
      </div>
      <span class="ck-top__time">{{ currentTime }}</span>
    </div>

    <!-- FPV Video Area -->
    <div class="ck-fpv">
      <div class="ck-fpv__grid" />
      <div class="ck-fpv__crosshair">
        <svg viewBox="0 0 80 80" width="80" height="80">
          <circle cx="40" cy="40" r="30" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1" />
          <line x1="40" y1="5" x2="40" y2="20" stroke="rgba(255,255,255,0.2)" stroke-width="1" />
          <line x1="40" y1="60" x2="40" y2="75" stroke="rgba(255,255,255,0.2)" stroke-width="1" />
          <line x1="5" y1="40" x2="20" y2="40" stroke="rgba(255,255,255,0.2)" stroke-width="1" />
          <line x1="60" y1="40" x2="75" y2="40" stroke="rgba(255,255,255,0.2)" stroke-width="1" />
        </svg>
      </div>
      <div class="ck-fpv__label">FPV 视频流</div>

      <!-- AI Overlay -->
      <template v-if="aiOverlay">
        <div class="ai-det" style="left:30%;top:35%;width:18%;height:22%">
          <span class="ai-det__tag">车辆 92%</span>
        </div>
        <div class="ai-det" style="left:60%;top:50%;width:12%;height:18%">
          <span class="ai-det__tag">行人 78%</span>
        </div>
      </template>

      <!-- Zoom indicator -->
      <div class="ck-zoom">{{ cameraZoom.toFixed(1) }}x</div>
      <!-- Recording indicator -->
      <div v-if="recording" class="ck-rec">● REC</div>
    </div>

    <!-- LEFT: Flight Instruments -->
    <div class="ck-panel ck-panel--left">
      <div class="ck-hud">
        <div class="ck-hud__item">
          <div class="ck-hud__val">{{ drone.altitude }}</div>
          <div class="ck-hud__unit">m</div>
          <div class="ck-hud__label">高度</div>
        </div>
        <div class="ck-hud__item">
          <div class="ck-hud__val">{{ drone.speed }}</div>
          <div class="ck-hud__unit">m/s</div>
          <div class="ck-hud__label">速度</div>
        </div>
        <div class="ck-hud__item">
          <div class="ck-hud__val">{{ drone.heading }}°</div>
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
        <div class="ck-info__row"><span>坐标</span><span>{{ drone.lng }}, {{ drone.lat }}</span></div>
        <div class="ck-info__row"><span>模式</span><span>{{ drone.mode }}</span></div>
        <div class="ck-info__row"><span>风速</span><span>{{ drone.wind }} m/s</span></div>
        <div class="ck-info__row"><span>温度</span><span>{{ drone.temp }}°C</span></div>
      </div>
    </div>

    <!-- RIGHT: Gimbal + Camera -->
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
    </div>

    <!-- BOTTOM: Action Bar -->
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
        <span>AI</span>
      </button>
      <button class="ck-action" @click="handleSpeak">
        <span class="ck-action__icon">📢</span>
        <span>喊话</span>
      </button>
      <button class="ck-action" @click="handleLight">
        <span class="ck-action__icon">💡</span>
        <span>照明</span>
      </button>
    </div>
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

/* Top */
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

/* FPV */
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

/* AI detection boxes */
.ai-det {
  position: absolute;
  border: 2px solid #22d3ee;
  border-radius: 2px;
  z-index: 3;
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

/* Panels */
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

/* HUD */
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
}
.ck-hud__unit { font-size: 10px; color: rgba(255,255,255,0.3); margin-top: 2px; }
.ck-hud__label { font-size: 10px; color: rgba(255,255,255,0.4); margin-top: 4px; }
.ck-hud__item--warn .ck-hud__val { color: #ef4444; }

/* Info */
.ck-info { display: flex; flex-direction: column; gap: 6px; }
.ck-info__row {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: rgba(255,255,255,0.5);
}
.ck-info__row span:last-child { color: rgba(255,255,255,0.75); font-variant-numeric: tabular-nums; }

/* Right panel */
.ck-section-title {
  font-size: 12px;
  font-weight: 700;
  color: rgba(255,255,255,0.6);
  margin-bottom: 10px;
}
.ck-slider-row {
  margin-bottom: 8px;
}
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

/* Bottom action bar */
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
