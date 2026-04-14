<script lang="ts" setup name="DroneControlDataScreenPage">
import { Page } from '@vben/common-ui';
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

// --- Fullscreen ---
const rootRef = ref<HTMLElement | null>(null);
const isFullscreen = ref(false);

function toggleFullscreen() {
  if (!rootRef.value) return;
  if (!document.fullscreenElement) {
    rootRef.value.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen().catch(() => {});
  }
}

function onFsChange() {
  isFullscreen.value = !!document.fullscreenElement;
}

// --- Clock ---
const now = ref(new Date());
let timer: ReturnType<typeof setInterval> | null = null;

const timeStr = computed(() => {
  const d = now.value;
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
});

onMounted(() => {
  timer = setInterval(() => (now.value = new Date()), 1000);
  document.addEventListener('fullscreenchange', onFsChange);
});
onBeforeUnmount(() => {
  if (timer) clearInterval(timer);
  document.removeEventListener('fullscreenchange', onFsChange);
});

// --- LEFT: 设备概览 ---
const devices = [
  { label: '无人机', online: 27, total: 34, pct: 79, color: '#3b82f6' },
  { label: '机巢', online: 14, total: 16, pct: 88, color: '#10b981' },
  { label: '摄像头', online: 42, total: 48, pct: 88, color: '#f59e0b' },
  { label: '传感器', online: 25, total: 30, pct: 83, color: '#8b5cf6' },
];

// --- LEFT: 任务统计 ---
const taskKpis = [
  { label: '今日任务', value: '48', unit: '个' },
  { label: '完成率', value: '92.5', unit: '%' },
  { label: '飞行架次', value: '156', unit: '次' },
  { label: '飞行时长', value: '286', unit: 'h' },
];

// --- LEFT: 告警趋势 ---
const alertDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
const alertCounts = [12, 18, 8, 22, 15, 28, 20];
const alertMax = Math.max(...alertCounts);

// --- CENTER: KPI flip cards ---
const centerKpis = [
  { label: '纳管设备', value: '128', trend: '+3', up: true },
  { label: '今日飞行', value: '48', trend: '+12', up: true },
  { label: 'AI识别', value: '1,256', trend: '+86', up: true },
  { label: '待处理告警', value: '12', trend: '-5', up: false },
];

// --- CENTER: Map pins ---
const mapPins = [
  { top: '22%', left: '30%' },
  { top: '38%', left: '55%' },
  { top: '55%', left: '42%' },
  { top: '68%', left: '65%' },
  { top: '45%', left: '25%' },
  { top: '30%', left: '72%' },
];

// --- RIGHT: AI识别统计 ---
const aiStats = [
  { label: '车辆检测', count: 456, color: '#3b82f6' },
  { label: '行人检测', count: 328, color: '#10b981' },
  { label: '烟雾识别', count: 89, color: '#f59e0b' },
  { label: '安全帽检测', count: 156, color: '#8b5cf6' },
  { label: '路面病害', count: 78, color: '#ef4444' },
  { label: '水域异常', count: 149, color: '#06b6d4' },
];
const aiMax = Math.max(...aiStats.map((a) => a.count));

// --- RIGHT: 部门排行 ---
const deptRank = [
  { label: '飞行一队', pct: 98 },
  { label: '应急组', pct: 96 },
  { label: '飞行二队', pct: 93 },
  { label: '巡检组', pct: 88 },
  { label: '培训组', pct: 82 },
];

// --- RIGHT: 实时告警 ---
const alerts = [
  { time: '14:32:08', tag: '设备告警', tagColor: '#ef4444', loc: '东湖路段 · 机巢NB-012温度异常' },
  { time: '14:28:45', tag: 'AI识别', tagColor: '#f59e0b', loc: '工业园区B栋 · 检测到烟雾事件' },
  { time: '14:25:12', tag: '飞行告警', tagColor: '#3b82f6', loc: '河道巡查 · 无人机DJI-M30T信号弱' },
  { time: '14:20:33', tag: '围栏告警', tagColor: '#8b5cf6', loc: '禁飞区A · 无人机越界预警' },
  { time: '14:18:07', tag: '设备告警', tagColor: '#ef4444', loc: '充电站C · 机巢电池异常' },
];
</script>

<template>
  <Page auto-content-height>
    <div ref="rootRef" class="ds-root">
      <!-- Header -->
      <header class="ds-header">
        <div class="ds-header-left" />
        <h1 class="ds-title">大航蜂Drone OS · 数据驾驶舱</h1>
        <div class="ds-header-right">
          <span class="ds-time">{{ timeStr }}</span>
          <button class="ds-fs-btn" :title="isFullscreen ? '退出全屏' : '全屏'" @click="toggleFullscreen">
            <svg v-if="!isFullscreen" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
            <svg v-else viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>
          </button>
        </div>
      </header>

      <!-- Body: 3-column -->
      <div class="ds-body">
        <!-- ========== LEFT PANEL ========== -->
        <div class="ds-col ds-col-left">
          <!-- 设备概览 -->
          <section class="ds-card">
            <div class="ds-card-title"><span class="ds-title-bar" />设备概览</div>
            <div class="ds-device-list">
              <div v-for="d in devices" :key="d.label" class="ds-device-row">
                <span class="ds-device-name">{{ d.label }}</span>
                <span class="ds-device-count">{{ d.online }}<span class="ds-device-total">/{{ d.total }}</span></span>
                <div class="ds-prog-track">
                  <div class="ds-prog-fill" :style="{ width: d.pct + '%', background: d.color }" />
                </div>
                <span class="ds-device-pct">{{ d.pct }}%</span>
              </div>
            </div>
          </section>

          <!-- 任务统计 -->
          <section class="ds-card">
            <div class="ds-card-title"><span class="ds-title-bar" />任务统计</div>
            <div class="ds-kpi-grid">
              <div v-for="k in taskKpis" :key="k.label" class="ds-kpi-item">
                <div class="ds-kpi-val">{{ k.value }}<span class="ds-kpi-unit">{{ k.unit }}</span></div>
                <div class="ds-kpi-label">{{ k.label }}</div>
              </div>
            </div>
          </section>

          <!-- 告警趋势 -->
          <section class="ds-card ds-card-grow">
            <div class="ds-card-title"><span class="ds-title-bar" />告警趋势</div>
            <div class="ds-bar-chart">
              <div v-for="(c, i) in alertCounts" :key="i" class="ds-bar-col">
                <div class="ds-bar-track">
                  <div class="ds-bar-fill" :style="{ height: (c / alertMax) * 100 + '%' }" />
                </div>
                <span class="ds-bar-label">{{ alertDays[i] }}</span>
              </div>
            </div>
          </section>
        </div>

        <!-- ========== CENTER PANEL ========== -->
        <div class="ds-col ds-col-center">
          <!-- KPI flip cards -->
          <div class="ds-flip-row">
            <div v-for="kpi in centerKpis" :key="kpi.label" class="ds-flip-card">
              <div class="ds-flip-label">{{ kpi.label }}</div>
              <div class="ds-flip-value">{{ kpi.value }}</div>
              <div class="ds-flip-trend" :class="kpi.up ? 'ds-trend-up' : 'ds-trend-down'">
                {{ kpi.up ? '↑' : '↓' }} {{ kpi.trend }}
              </div>
            </div>
          </div>

          <!-- Mock map -->
          <div class="ds-map">
            <div class="ds-map-grid" />
            <div v-for="(pin, i) in mapPins" :key="i" class="ds-map-pin" :style="{ top: pin.top, left: pin.left }">
              <span class="ds-pin-dot" />
              <span class="ds-pin-ring" />
            </div>
            <div class="ds-map-center-label">实时态势地图</div>
          </div>
        </div>

        <!-- ========== RIGHT PANEL ========== -->
        <div class="ds-col ds-col-right">
          <!-- AI识别统计 -->
          <section class="ds-card">
            <div class="ds-card-title"><span class="ds-title-bar" />AI识别统计</div>
            <div class="ds-ai-list">
              <div v-for="a in aiStats" :key="a.label" class="ds-ai-row">
                <span class="ds-ai-name">{{ a.label }}</span>
                <div class="ds-prog-track ds-prog-track--wide">
                  <div class="ds-prog-fill" :style="{ width: (a.count / aiMax) * 100 + '%', background: a.color }" />
                </div>
                <span class="ds-ai-count">{{ a.count }}</span>
              </div>
            </div>
          </section>

          <!-- 部门排行 -->
          <section class="ds-card">
            <div class="ds-card-title"><span class="ds-title-bar" />部门排行</div>
            <div class="ds-rank-list">
              <div v-for="(r, i) in deptRank" :key="r.label" class="ds-rank-row">
                <span class="ds-rank-idx" :class="i < 3 ? 'ds-rank-top' : ''">{{ i + 1 }}</span>
                <span class="ds-rank-name">{{ r.label }}</span>
                <div class="ds-prog-track">
                  <div class="ds-prog-fill" :style="{ width: r.pct + '%', background: i === 0 ? '#f59e0b' : i === 1 ? '#10b981' : '#3b82f6' }" />
                </div>
                <span class="ds-rank-pct">{{ r.pct }}%</span>
              </div>
            </div>
          </section>

          <!-- 实时告警 -->
          <section class="ds-card ds-card-grow ds-alert-card">
            <div class="ds-card-title"><span class="ds-title-bar" />实时告警</div>
            <div class="ds-alert-scroll">
              <div class="ds-alert-track">
                <div v-for="(a, i) in [...alerts, ...alerts]" :key="i" class="ds-alert-item">
                  <span class="ds-alert-time">{{ a.time }}</span>
                  <span class="ds-alert-tag" :style="{ background: a.tagColor + '22', color: a.tagColor, borderColor: a.tagColor + '44' }">{{ a.tag }}</span>
                  <span class="ds-alert-loc">{{ a.loc }}</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  </Page>
</template>

<style scoped>
/* ── Root ── */
.ds-root {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: linear-gradient(180deg, #0a0e1a 0%, #111827 100%);
  color: rgba(255, 255, 255, 0.85);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ── Header ── */
.ds-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  padding: 0 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  flex-shrink: 0;
}

.ds-header-left {
  width: 160px;
  flex-shrink: 0;
}

.ds-title {
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 2px;
  color: rgba(255, 255, 255, 0.95);
  margin: 0;
  text-align: center;
}

.ds-header-right {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 160px;
  justify-content: flex-end;
  flex-shrink: 0;
}

.ds-time {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.45);
  font-variant-numeric: tabular-nums;
}

.ds-fs-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.06);
  color: #d1d5db;
  cursor: pointer;
  transition: all 0.2s;
}

.ds-fs-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #f9fafb;
  border-color: rgba(255, 255, 255, 0.2);
}

/* ── Body 3-col ── */
.ds-body {
  flex: 1;
  display: flex;
  gap: 16px;
  padding: 16px;
  min-height: 0;
}

.ds-col {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
}

.ds-col-left,
.ds-col-right {
  width: 30%;
  flex-shrink: 0;
}

.ds-col-center {
  width: 40%;
  flex-shrink: 0;
}

/* ── Card ── */
.ds-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  padding: 16px;
  flex-shrink: 0;
}

.ds-card-grow {
  flex: 1;
  min-height: 0;
  flex-shrink: 1;
}

.ds-card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 14px;
  letter-spacing: 0.5px;
}

.ds-title-bar {
  width: 3px;
  height: 14px;
  border-radius: 2px;
  background: #3b82f6;
  flex-shrink: 0;
}

/* ── Progress bar shared ── */
.ds-prog-track {
  flex: 1;
  height: 6px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 3px;
  overflow: hidden;
}

.ds-prog-track--wide {
  height: 8px;
  border-radius: 4px;
}

.ds-prog-fill {
  height: 100%;
  border-radius: inherit;
  transition: width 0.6s ease;
}

/* ── LEFT: 设备概览 ── */
.ds-device-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.ds-device-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.ds-device-name {
  width: 52px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.55);
  flex-shrink: 0;
}

.ds-device-count {
  width: 48px;
  font-size: 15px;
  font-weight: 700;
  color: #f9fafb;
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
}

.ds-device-total {
  font-size: 12px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.3);
}

.ds-device-pct {
  width: 36px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  font-variant-numeric: tabular-nums;
  text-align: right;
  flex-shrink: 0;
}

/* ── LEFT: 任务统计 KPI grid ── */
.ds-kpi-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.ds-kpi-item {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
  padding: 14px 12px;
  text-align: center;
}

.ds-kpi-val {
  font-size: 28px;
  font-weight: 800;
  color: #f9fafb;
  font-variant-numeric: tabular-nums;
}

.ds-kpi-unit {
  font-size: 12px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.35);
  margin-left: 2px;
}

.ds-kpi-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  margin-top: 4px;
}

/* ── LEFT: 告警趋势 bar chart ── */
.ds-bar-chart {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  height: 100%;
  min-height: 80px;
  padding-top: 4px;
}

.ds-bar-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  height: 100%;
}

.ds-bar-track {
  flex: 1;
  width: 100%;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 3px;
  display: flex;
  align-items: flex-end;
  overflow: hidden;
}

.ds-bar-fill {
  width: 100%;
  background: linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%);
  border-radius: 3px 3px 0 0;
  transition: height 0.6s ease;
  min-height: 4px;
}

.ds-bar-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.35);
  flex-shrink: 0;
}

/* ── CENTER: Flip cards ── */
.ds-flip-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  flex-shrink: 0;
}

.ds-flip-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  padding: 16px 12px 14px;
  text-align: center;
  transition: border-color 0.3s;
}

.ds-flip-card:hover {
  border-color: rgba(59, 130, 246, 0.3);
}

.ds-flip-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.45);
  margin-bottom: 6px;
}

.ds-flip-value {
  font-size: 32px;
  font-weight: 800;
  color: #f9fafb;
  font-variant-numeric: tabular-nums;
  line-height: 1.1;
  text-shadow: 0 0 24px rgba(59, 130, 246, 0.4), 0 0 48px rgba(59, 130, 246, 0.15);
}

.ds-flip-trend {
  font-size: 12px;
  margin-top: 6px;
  font-variant-numeric: tabular-nums;
}

.ds-trend-up {
  color: #10b981;
}

.ds-trend-down {
  color: #ef4444;
}

/* ── CENTER: Mock map ── */
.ds-map {
  flex: 1;
  min-height: 200px;
  background: linear-gradient(135deg, #0d1220 0%, #111827 50%, #0d1220 100%);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  position: relative;
  overflow: hidden;
}

.ds-map-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 40px 40px;
}

.ds-map-pin {
  position: absolute;
}

.ds-pin-dot {
  display: block;
  width: 8px;
  height: 8px;
  background: #3b82f6;
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(59, 130, 246, 0.7);
}

.ds-pin-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 20px;
  height: 20px;
  margin: -10px 0 0 -10px;
  border: 1px solid rgba(59, 130, 246, 0.4);
  border-radius: 50%;
  animation: ds-ring-pulse 2.5s ease-out infinite;
}

@keyframes ds-ring-pulse {
  0% { transform: scale(0.5); opacity: 1; }
  100% { transform: scale(2); opacity: 0; }
}

.ds-map-center-label {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 13px;
  color: rgba(255, 255, 255, 0.15);
  letter-spacing: 4px;
}

/* ── RIGHT: AI识别统计 ── */
.ds-ai-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ds-ai-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.ds-ai-name {
  width: 64px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.55);
  flex-shrink: 0;
  text-align: right;
}

.ds-ai-count {
  width: 36px;
  font-size: 13px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.85);
  font-variant-numeric: tabular-nums;
  text-align: right;
  flex-shrink: 0;
}

/* ── RIGHT: 部门排行 ── */
.ds-rank-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ds-rank-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.ds-rank-idx {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.4);
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ds-rank-top {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
}

.ds-rank-name {
  width: 56px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  flex-shrink: 0;
}

.ds-rank-pct {
  width: 36px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  font-variant-numeric: tabular-nums;
  text-align: right;
  flex-shrink: 0;
}

/* ── RIGHT: 实时告警 ── */
.ds-alert-card {
  overflow: hidden;
}

.ds-alert-scroll {
  flex: 1;
  overflow: hidden;
  position: relative;
  min-height: 0;
}

.ds-alert-track {
  display: flex;
  flex-direction: column;
  animation: ds-scroll-up 30s linear infinite;
}

.ds-alert-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  flex-shrink: 0;
}

.ds-alert-time {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
}

.ds-alert-tag {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 4px;
  border: 1px solid;
  flex-shrink: 0;
  white-space: nowrap;
}

.ds-alert-loc {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.55);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@keyframes ds-scroll-up {
  0% { transform: translateY(0); }
  100% { transform: translateY(-50%); }
}

/* ── Fullscreen ── */
.ds-root:fullscreen {
  position: fixed;
  inset: 0;
}
</style>
