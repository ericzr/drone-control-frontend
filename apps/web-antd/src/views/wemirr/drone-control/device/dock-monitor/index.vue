<script lang="ts" setup name="DockMonitorPage">
import { Page } from '@vben/common-ui';

import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { Button, Modal, Tooltip, message } from 'ant-design-vue';

import VirtualFlightKeyboard from '../../components/VirtualFlightKeyboard.vue';
import { useClock } from '../../composables/useClock';
import { registerSafeFlightKeydown } from '../../composables/useSafeFlightKeys';

const route = useRoute();
const router = useRouter();

function safeDecodeURI(val: unknown, fallback: string): string {
  if (typeof val !== 'string' || !val) return fallback;
  try { return decodeURIComponent(val); } catch { return val; }
}

const dockName = safeDecodeURI(route.query.dockName, '高新区一号机场');
const droneName = safeDecodeURI(route.query.drone, '大航蜂 M300-01');
const targetLat = Number(route.query.lat) || 34.2655;
const targetLng = Number(route.query.lng) || 108.9432;
const targetAlt = Number(route.query.alt) || 80;

const { currentTime } = useClock();
let telTimer: number | undefined;

const tel = ref({
  battery: 85,
  altitude: 0,
  speed: 0,
  heading: 0,
  gps: 22,
  signal: 98,
  lat: targetLat,
  lng: targetLng,
  wind: 2.8,
  temp: 24,
  flightTime: 0,
  distance: 0,
  rtk: 44,
  phase: 'preflight' as 'ascending' | 'cruise' | 'landed' | 'preflight',
  gimbalPitch: -3.6,
  gimbalYaw: -75.6,
  asl: 37.15,
  hDist: 0.05,
});

function updateTelemetry() {
  const t = tel.value;
  t.flightTime += 1;

  if (t.phase === 'preflight' && t.flightTime > 3) {
    t.phase = 'ascending';
  }

  if (t.phase === 'ascending') {
    t.altitude = Math.min(targetAlt, t.altitude + 2 + Math.random() * 1.5);
    t.speed = Math.min(5, t.speed + 0.5);
    if (t.altitude >= targetAlt - 2) t.phase = 'cruise';
  }

  if (t.phase === 'cruise') {
    t.altitude = targetAlt + (Math.random() - 0.5) * 2;
    t.speed = Math.max(3, Math.min(12, t.speed + (Math.random() - 0.5) * 1));
    t.heading = (t.heading + (Math.random() - 0.45) * 2 + 360) % 360;
    t.distance += Math.round(t.speed);
  }

  t.battery = Math.max(5, t.battery - (Math.random() > 0.8 ? 1 : 0));
  t.gps = Math.max(16, Math.min(28, t.gps + Math.round((Math.random() - 0.5) * 2)));
  t.signal = Math.max(70, Math.min(100, t.signal + Math.round((Math.random() - 0.5) * 2)));
  t.wind = Math.max(0, Math.min(8, t.wind + (Math.random() - 0.5) * 0.4));
  t.lat += (Math.random() - 0.5) * 0.0001;
  t.lng += (Math.random() - 0.5) * 0.0001;
  t.gimbalPitch += (Math.random() - 0.5) * 0.3;
  t.gimbalYaw += (Math.random() - 0.5) * 0.5;
  t.asl = 37.15 + t.altitude * 0.3 + (Math.random() - 0.5) * 0.2;
  t.hDist = t.distance / 1000;
  t.rtk = Math.max(30, Math.min(50, t.rtk + Math.round((Math.random() - 0.5) * 2)));
}

let cleanupFlightKeys: (() => void) | undefined;

const activeKey = ref('');
let lastControlAt = 0;

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

const controlKeyMap: Record<string, string> = {
  q: '机头左转',
  w: '云台抬头',
  e: '机头右转',
  a: '机头左转(细)',
  s: '云台低头',
  d: '机头右转(细)',
  c: '高度下降(演示)',
  ' ': '高度上升(演示)',
};

function applyMonitorKey(k: string) {
  const t = tel.value;
  if (k === 'q') t.gimbalYaw = clamp(t.gimbalYaw - 6, -180, 180);
  else if (k === 'e') t.gimbalYaw = clamp(t.gimbalYaw + 6, -180, 180);
  else if (k === 'a') t.gimbalYaw = clamp(t.gimbalYaw - 3, -180, 180);
  else if (k === 'd') t.gimbalYaw = clamp(t.gimbalYaw + 3, -180, 180);
  else if (k === 'w') t.gimbalPitch = clamp(t.gimbalPitch + 4, -90, 30);
  else if (k === 's') t.gimbalPitch = clamp(t.gimbalPitch - 4, -90, 30);
  else if (k === 'c') t.altitude = clamp(t.altitude - 2, 0, 500);
  else if (k === ' ') t.altitude = clamp(t.altitude + 2, 0, 500);
}

function handleControlKey(key: string) {
  const k = key.length === 1 ? key.toLowerCase() : key === ' ' ? ' ' : key.toLowerCase();
  const now = Date.now();
  if (now - lastControlAt < 120) return;
  lastControlAt = now;
  applyMonitorKey(k === ' ' ? ' ' : k);
  activeKey.value = k;
  message.info(`指令：${controlKeyMap[k] ?? k}`);
  setTimeout(() => {
    activeKey.value = '';
  }, 200);
}

let returnIssuing = false;

onMounted(() => {
  telTimer = window.setInterval(updateTelemetry, 1000);
  cleanupFlightKeys = registerSafeFlightKeydown((key) => {
    handleControlKey(key);
  });
});

onBeforeUnmount(() => {
  if (telTimer) clearInterval(telTimer);
  cleanupFlightKeys?.();
});

const phaseLabel = computed(() => {
  const m: Record<string, string> = {
    preflight: '起飞准备中',
    ascending: '上升中',
    cruise: '巡航中',
    landed: '已降落',
  };
  return m[tel.value.phase] || '';
});

const batteryColor = computed(() => {
  if (tel.value.battery < 20) return '#ef4444';
  if (tel.value.battery < 50) return '#f59e0b';
  return '#10b981';
});

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

function handleReturn() {
  if (returnIssuing) {
    message.warning('请先关闭当前返航确认框');
    return;
  }
  returnIssuing = true;
  Modal.confirm({
    title: '确认一键返航',
    content: `确认命令 ${droneName} 返航至 ${dockName}？`,
    okText: '确认返航',
    cancelText: '取消',
    async onOk() {
      tel.value.phase = 'landed';
      message.success('返航指令已下发');
      returnIssuing = false;
    },
    onCancel() {
      returnIssuing = false;
    },
  });
}

function handlePause() {
  message.info('已发送悬停指令');
}

function handleResume() {
  if (tel.value.phase === 'landed') return;
  tel.value.phase = 'cruise';
  message.success('继续执行任务');
}

function goBack() {
  router.push('/device/dock');
}
</script>

<template>
  <Page :auto-content-height="false">
    <div class="dock-monitor">
      <!-- Top bar -->
      <div class="dm-topbar">
        <div class="dm-topbar__left">
          <button class="dm-back" @click="goBack">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M19 12H5" /><polyline points="12 19 5 12 12 5" /></svg>
          </button>
          <span class="dm-topbar__dock">{{ dockName }}</span>
          <span class="dm-topbar__sep">|</span>
          <span class="dm-topbar__drone">{{ droneName }}</span>
          <span class="dm-topbar__phase" :class="`dm-topbar__phase--${tel.phase}`">{{ phaseLabel }}</span>
        </div>
        <div class="dm-topbar__right">
          <span class="dm-topbar__time">{{ currentTime }}</span>
          <Tooltip title="紧急返航">
            <Button danger size="small" @click="handleReturn">一键返航</Button>
          </Tooltip>
        </div>
      </div>

      <!-- 4-Quadrant grid -->
      <div class="dm-grid">
        <!-- Q1: Top-left — 机巢摄像头 -->
        <div class="dm-quad dm-quad--tl">
          <div class="dm-quad__label">机巢直播</div>
          <div class="dm-quad__video">
            <div class="dm-quad__grid-bg" />
            <!-- Mock nest camera view -->
            <div class="dm-nest-cam">
              <div class="dm-nest-cam__drone-slot">
                <div class="dm-nest-cam__body" />
                <div class="dm-nest-cam__light dm-nest-cam__light--l" />
                <div class="dm-nest-cam__light dm-nest-cam__light--r" />
              </div>
              <span class="dm-nest-cam__tag">机巢内部 · 实时</span>
            </div>
          </div>
        </div>

        <!-- Q2: Top-right — 飞机摄像头 -->
        <div class="dm-quad dm-quad--tr">
          <div class="dm-quad__label">飞机视角</div>
          <div class="dm-quad__video dm-quad__video--fpv">
            <div class="dm-quad__grid-bg" />
            <div class="dm-fpv-crosshair">
              <svg viewBox="0 0 80 80" width="60" height="60">
                <circle cx="40" cy="40" r="28" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1" />
                <line x1="40" y1="8" x2="40" y2="22" stroke="rgba(255,255,255,0.12)" stroke-width="1" />
                <line x1="40" y1="58" x2="40" y2="72" stroke="rgba(255,255,255,0.12)" stroke-width="1" />
                <line x1="8" y1="40" x2="22" y2="40" stroke="rgba(255,255,255,0.12)" stroke-width="1" />
                <line x1="58" y1="40" x2="72" y2="40" stroke="rgba(255,255,255,0.12)" stroke-width="1" />
              </svg>
            </div>
            <!-- AI detection mock -->
            <div class="dm-det" style="left: 25%; top: 30%; width: 18%; height: 24%">
              <span class="dm-det__tag">建筑物 91%</span>
            </div>
            <div class="dm-det" style="left: 55%; top: 50%; width: 13%; height: 18%">
              <span class="dm-det__tag">车辆 78%</span>
            </div>
            <span class="dm-quad__watermark">FPV · {{ droneName }}</span>
            <!-- Zoom control -->
            <div class="dm-zoom">
              <button v-for="z in ['X50','X40','X30','X20','X10','X2']" :key="z" class="dm-zoom__btn" @click="message.info(`切换倍率 ${z}`)">{{ z }}</button>
            </div>
          </div>
        </div>

        <!-- Q3: Bottom-left — 空间地图 -->
        <div class="dm-quad dm-quad--bl">
          <div class="dm-quad__label">空间地图</div>
          <div class="dm-quad__video dm-quad__video--map">
            <div class="dm-map-mock">
              <div class="dm-map-mock__terrain" />
              <!-- Scan overlay -->
              <div class="dm-map-mock__scan" />
              <!-- Drone position marker -->
              <div class="dm-map-mock__marker" :style="{ left: `${50 + (tel.lng - targetLng) * 5000}%`, top: `${50 - (tel.lat - targetLat) * 5000}%` }">
                <div class="dm-map-mock__marker-ring" />
                <svg viewBox="0 0 24 24" fill="#22d3ee" width="16" height="16"><polygon points="12 2 20 20 12 16 4 20" /></svg>
              </div>
              <!-- Route line -->
              <svg class="dm-map-mock__route" viewBox="0 0 100 100" preserveAspectRatio="none">
                <polyline points="50,85 45,60 48,40 55,25 52,15" fill="none" stroke="#22d3ee" stroke-width="0.8" stroke-dasharray="2,2" opacity="0.5" />
              </svg>
              <span class="dm-map-mock__coords">{{ tel.lat.toFixed(5) }}, {{ tel.lng.toFixed(5) }}</span>
            </div>
          </div>
        </div>

        <!-- Q4: Bottom-right — 参数 + 操控 -->
        <div class="dm-quad dm-quad--br">
          <div class="dm-quad__label">飞行数据 · 云台控制</div>
          <div class="dm-ctrl">
            <!-- Telemetry data -->
            <div class="dm-tel-row">
              <div class="dm-tel-item">
                <span class="dm-tel-item__val" :style="{ color: batteryColor }">{{ tel.battery }}%</span>
                <span class="dm-tel-item__label">电池电量</span>
              </div>
              <div class="dm-tel-item">
                <span class="dm-tel-item__val">{{ formatTime(tel.flightTime) }}</span>
                <span class="dm-tel-item__label">飞行时间</span>
              </div>
              <div class="dm-tel-item">
                <span class="dm-tel-item__val">{{ tel.distance }}m</span>
                <span class="dm-tel-item__label">飞行里程</span>
              </div>
            </div>

            <!-- Battery bar -->
            <div class="dm-battery-bar">
              <div class="dm-battery-bar__fill" :style="{ width: `${tel.battery}%`, background: batteryColor }" />
              <div class="dm-battery-bar__home" style="left: 20%" />
            </div>

            <!-- Flight instrument row -->
            <div class="dm-instrument">
              <div class="dm-instrument__left">
                <div class="dm-inst-val"><span class="dm-inst-num">{{ tel.gimbalPitch.toFixed(1) }}°</span></div>
                <div class="dm-inst-val"><span class="dm-inst-lbl">SPD</span> <span class="dm-inst-num dm-inst-num--green">{{ tel.speed.toFixed(2) }}</span></div>
                <div class="dm-inst-val"><span class="dm-inst-lbl">m/s</span></div>
              </div>

              <!-- Compass -->
              <div class="dm-compass">
                <div class="dm-compass__ring" :style="{ transform: `rotate(${-tel.heading}deg)` }">
                  <span class="dm-compass__n">N</span>
                  <span class="dm-compass__s">S</span>
                  <span class="dm-compass__e">E</span>
                  <span class="dm-compass__w">W</span>
                </div>
                <div class="dm-compass__needle" />
              </div>

              <div class="dm-instrument__right">
                <div class="dm-inst-val"><span class="dm-inst-num">{{ tel.gimbalYaw.toFixed(1) }}°</span></div>
                <div class="dm-inst-val"><span class="dm-inst-num">{{ tel.asl.toFixed(2) }}</span> <span class="dm-inst-lbl">ASL</span></div>
                <div class="dm-inst-val"><span class="dm-inst-num dm-inst-num--green">{{ tel.altitude.toFixed(2) }}</span> <span class="dm-inst-lbl dm-inst-lbl--green">ALT m</span></div>
                <div class="dm-inst-val"><span class="dm-inst-lbl">H</span> <span class="dm-inst-num">{{ tel.hDist.toFixed(2) }}m</span></div>
              </div>
            </div>

            <!-- RTK -->
            <div class="dm-rtk-row">
              <span>{{ tel.rtk }}</span>
              <span class="dm-rtk-row__label">RTK搜星数量</span>
            </div>

            <!-- Status message -->
            <div class="dm-status-msg">
              <span class="dm-status-msg__icon">📍</span>
              未 到 达 指 定 位 置
            </div>

            <!-- Control section -->
            <div class="dm-ctrl-section">
              <div class="dm-ctrl-section__header">
                <span>云台控制</span>
                <div class="dm-ctrl-btns">
                  <Tooltip title="悬停"><Button size="small" @click="handlePause">暂停</Button></Tooltip>
                  <Tooltip title="继续"><Button size="small" type="primary" ghost @click="handleResume">继续</Button></Tooltip>
                  <Tooltip title="紧急返航"><Button size="small" danger @click="handleReturn">返航</Button></Tooltip>
                </div>
              </div>

              <VirtualFlightKeyboard :active-key="activeKey" @press="handleControlKey" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </Page>
</template>

<style lang="less" scoped>
.dock-monitor {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 112px);
  background: #0a0d12;
  color: #e5e7eb;
  overflow: hidden;
}

/* ── Top bar ── */
.dm-topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background: rgb(0 0 0 / 60%);
  border-bottom: 1px solid rgb(255 255 255 / 6%);
  flex: none;
}

.dm-topbar__left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.dm-back {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: 1px solid rgb(255 255 255 / 12%);
  border-radius: 6px;
  background: transparent;
  color: #d1d5db;
  cursor: pointer;

  &:hover {
    background: rgb(255 255 255 / 8%);
    color: #f9fafb;
  }
}

.dm-topbar__dock {
  font-size: 14px;
  font-weight: 700;
  color: #f0f0f0;
}

.dm-topbar__sep {
  color: rgb(255 255 255 / 20%);
}

.dm-topbar__drone {
  font-size: 13px;
  color: #9ca3af;
}

.dm-topbar__phase {
  padding: 2px 10px;
  font-size: 11px;
  font-weight: 700;
  border-radius: 999px;
  background: rgb(255 255 255 / 6%);
  color: #9ca3af;

  &--ascending {
    background: rgb(245 158 11 / 15%);
    color: #fbbf24;
  }

  &--cruise {
    background: rgb(16 185 129 / 15%);
    color: #34d399;
  }

  &--landed {
    background: rgb(99 102 241 / 15%);
    color: #818cf8;
  }
}

.dm-topbar__right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.dm-topbar__time {
  font-size: 13px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: rgb(255 255 255 / 50%);
}

/* ── 4-Quadrant grid ── */
.dm-grid {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 2px;
  min-height: 0;
}

.dm-quad {
  position: relative;
  overflow: hidden;
  background: #111318;
}

.dm-quad__label {
  position: absolute;
  top: 8px;
  left: 10px;
  z-index: 5;
  padding: 2px 10px;
  font-size: 11px;
  font-weight: 700;
  color: rgb(255 255 255 / 50%);
  background: rgb(0 0 0 / 50%);
  border-radius: 4px;
  backdrop-filter: blur(4px);
}

.dm-quad__video {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dm-quad__grid-bg {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgb(255 255 255 / 2%) 1px, transparent 1px),
    linear-gradient(90deg, rgb(255 255 255 / 2%) 1px, transparent 1px);
  background-size: 60px 60px;
}

.dm-quad__watermark {
  position: absolute;
  bottom: 8px;
  left: 10px;
  font-size: 10px;
  color: rgb(255 255 255 / 20%);
}

/* ── Nest camera mock ── */
.dm-nest-cam {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  z-index: 2;
}

.dm-nest-cam__drone-slot {
  position: relative;
  width: 120px;
  height: 80px;
  border: 2px solid rgb(255 255 255 / 8%);
  border-radius: 12px;
  background: rgb(20 22 28 / 80%);
}

.dm-nest-cam__body {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 30px;
  border-radius: 6px;
  background: linear-gradient(135deg, #2a2d35, #3a3d45);
  border: 1px solid rgb(255 255 255 / 10%);
}

.dm-nest-cam__light {
  position: absolute;
  top: 12px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ef4444;
  animation: blink 1.5s infinite;

  &--l { left: 16px; }
  &--r { right: 16px; animation-delay: 0.75s; }
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.2; }
}

.dm-nest-cam__tag {
  font-size: 11px;
  color: rgb(255 255 255 / 30%);
  letter-spacing: 2px;
}

/* ── FPV view ── */
.dm-quad__video--fpv {
  background: linear-gradient(135deg, #0d1520 0%, #111d33 50%, #0a1018 100%);
}

.dm-fpv-crosshair {
  z-index: 2;
}

.dm-det {
  position: absolute;
  border: 2px solid #22d3ee;
  border-radius: 2px;
  z-index: 3;
}

.dm-det__tag {
  position: absolute;
  top: -16px;
  left: 0;
  padding: 1px 6px;
  background: #22d3ee;
  color: #000;
  font-size: 9px;
  font-weight: 700;
  border-radius: 2px;
  white-space: nowrap;
}

.dm-zoom {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 5;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.dm-zoom__btn {
  padding: 4px 8px;
  border: 1px solid rgb(255 255 255 / 8%);
  border-radius: 4px;
  background: rgb(0 0 0 / 40%);
  color: rgb(255 255 255 / 50%);
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background: rgb(0 0 0 / 60%);
    color: #f0f0f0;
  }
}

/* ── Map mock ── */
.dm-quad__video--map {
  background: #0c1018;
}

.dm-map-mock {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.dm-map-mock__terrain {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(145deg, #1a2636 0%, #0f1a28 40%, #162030 70%, #0d1520 100%);
  opacity: 0.8;
}

.dm-map-mock__scan {
  position: absolute;
  top: 20%;
  left: 15%;
  width: 50%;
  height: 50%;
  background: linear-gradient(135deg, rgb(34 211 238 / 0.08), rgb(34 211 238 / 0.02));
  border: 1px solid rgb(34 211 238 / 0.15);
  transform: skewX(-5deg) skewY(3deg);
}

.dm-map-mock__marker {
  position: absolute;
  z-index: 4;
  transform: translate(-50%, -50%);
}

.dm-map-mock__marker-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 1px solid rgb(34 211 238 / 0.4);
  animation: pulse-ring 2s infinite;
}

@keyframes pulse-ring {
  0% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
  100% { transform: translate(-50%, -50%) scale(2.5); opacity: 0; }
}

.dm-map-mock__route {
  position: absolute;
  inset: 0;
  z-index: 3;
}

.dm-map-mock__coords {
  position: absolute;
  bottom: 8px;
  right: 10px;
  font-size: 10px;
  color: rgb(255 255 255 / 30%);
  font-variant-numeric: tabular-nums;
}

/* ── Control panel (Q4) ── */
.dm-ctrl {
  position: absolute;
  inset: 0;
  padding: 32px 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
  background: #111318;

  &::-webkit-scrollbar {
    width: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgb(255 255 255 / 10%);
    border-radius: 2px;
  }
}

.dm-tel-row {
  display: flex;
  gap: 8px;
}

.dm-tel-item {
  flex: 1;
  text-align: center;
  padding: 8px 4px;
  border-radius: 8px;
  background: rgb(255 255 255 / 3%);
}

.dm-tel-item__val {
  display: block;
  font-size: 16px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  color: #f0f0f0;
}

.dm-tel-item__label {
  display: block;
  margin-top: 2px;
  font-size: 10px;
  color: rgb(255 255 255 / 40%);
}

/* ── Battery bar ── */
.dm-battery-bar {
  position: relative;
  height: 8px;
  border-radius: 4px;
  background: rgb(255 255 255 / 6%);
  overflow: hidden;
}

.dm-battery-bar__fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.6s ease;
}

.dm-battery-bar__home {
  position: absolute;
  top: -2px;
  width: 3px;
  height: 12px;
  background: #f59e0b;
  border-radius: 1px;
  transform: translateX(-50%);
}

/* ── Instrument display ── */
.dm-instrument {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
}

.dm-instrument__left,
.dm-instrument__right {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.dm-instrument__right {
  text-align: right;
}

.dm-inst-val {
  font-size: 11px;
  color: rgb(255 255 255 / 50%);
  font-variant-numeric: tabular-nums;
}

.dm-inst-num {
  color: #f0f0f0;
  font-weight: 700;

  &--green {
    color: #34d399;
  }
}

.dm-inst-lbl {
  font-size: 10px;
  color: rgb(255 255 255 / 35%);

  &--green {
    color: rgb(52 211 153 / 0.6);
  }
}

/* ── Compass ── */
.dm-compass {
  position: relative;
  width: 80px;
  height: 80px;
  flex: none;
}

.dm-compass__ring {
  position: absolute;
  inset: 0;
  border: 1px solid rgb(255 255 255 / 12%);
  border-radius: 50%;
  transition: transform 0.3s ease;
}

.dm-compass__n,
.dm-compass__s,
.dm-compass__e,
.dm-compass__w {
  position: absolute;
  font-size: 10px;
  font-weight: 700;
  color: rgb(255 255 255 / 35%);
}

.dm-compass__n { top: 4px; left: 50%; transform: translateX(-50%); color: #ef4444; }
.dm-compass__s { bottom: 4px; left: 50%; transform: translateX(-50%); }
.dm-compass__e { right: 4px; top: 50%; transform: translateY(-50%); }
.dm-compass__w { left: 4px; top: 50%; transform: translateY(-50%); }

.dm-compass__needle {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 2px;
  height: 20px;
  background: linear-gradient(180deg, #ef4444 50%, #d1d5db 50%);
  transform: translate(-50%, -50%);
  border-radius: 1px;
}

/* ── RTK row ── */
.dm-rtk-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: rgb(255 255 255 / 60%);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.dm-rtk-row__label {
  font-size: 10px;
  font-weight: 400;
  color: rgb(255 255 255 / 35%);
}

/* ── Status message ── */
.dm-status-msg {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 6px;
  background: rgb(255 255 255 / 3%);
  font-size: 12px;
  color: rgb(255 255 255 / 50%);
  letter-spacing: 3px;
}

.dm-status-msg__icon {
  font-size: 14px;
}

/* ── Control section ── */
.dm-ctrl-section {
  margin-top: auto;
}

.dm-ctrl-section__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 12px;
  font-weight: 700;
  color: rgb(255 255 255 / 60%);
}

.dm-ctrl-btns {
  display: flex;
  gap: 6px;
}

/* ── Responsive ── */
@media (max-width: 900px) {
  .dm-grid {
    grid-template-columns: 1fr;
    grid-template-rows: repeat(4, 1fr);
  }
}
</style>
