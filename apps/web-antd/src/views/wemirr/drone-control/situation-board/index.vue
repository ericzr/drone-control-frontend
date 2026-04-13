<script lang="ts" setup name="DroneSituationBoardPage">
import { Page } from '@vben/common-ui';

import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';

import { useMap } from '#/utils/map';

const boardRef = ref<HTMLElement | null>(null);
const isFullscreen = ref(false);

function toggleFullscreen() {
  if (!boardRef.value) return;
  if (!document.fullscreenElement) {
    boardRef.value.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen().catch(() => {});
  }
}

function onFullscreenChange() {
  isFullscreen.value = !!document.fullscreenElement;
}

onMounted(() => {
  document.addEventListener('fullscreenchange', onFullscreenChange);
});

onBeforeUnmount(() => {
  document.removeEventListener('fullscreenchange', onFullscreenChange);
});

import type { SceneConfig, SceneType } from './scenes';

import AiDetectStats from './components/AiDetectStats.vue';
import AlertGallery from './components/AlertGallery.vue';
import DroneMonitor from './components/DroneMonitor.vue';
import SceneSelector from './components/SceneSelector.vue';
import StatPanel from './components/StatPanel.vue';
import { defaultScene, scenes, sceneList } from './scenes';

const activeScene = ref<SceneType>(defaultScene);
const scene = computed<SceneConfig>(() => scenes[activeScene.value]);

const currentTime = ref('');
let timer: number | undefined;

function updateClock() {
  const now = new Date();
  const pad = (n: number) => `${n}`.padStart(2, '0');
  currentTime.value = `${now.getFullYear()}/${pad(now.getMonth() + 1)}/${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

onMounted(() => {
  updateClock();
  timer = window.setInterval(updateClock, 1000);
});

onBeforeUnmount(() => {
  if (timer) window.clearInterval(timer);
});

const mapContainerRef = ref<HTMLElement | null>(null);
const {
  initMap,
  destroyMap,
  addMarker,
  addPolyline,
  addPolygon,
  ready: mapReady,
} = useMap(mapContainerRef);

function renderMapFeatures(cfg: SceneConfig) {
  for (const f of cfg.mapFeatures) {
    switch (f.type) {
      case 'device':
      case 'alert':
        addMarker({
          position: f.position,
          label: f.label,
        });
        break;
      case 'route':
        addPolyline({
          path: [
            f.position,
            [f.position[0] + 0.03, f.position[1] + 0.01],
            [f.position[0] + 0.06, f.position[1] - 0.01],
          ],
          color: f.color ?? '#3b82f6',
          width: 3,
        });
        break;
      case 'fence':
        addPolygon({
          path: [
            [f.position[0] - 0.02, f.position[1] + 0.015],
            [f.position[0] + 0.02, f.position[1] + 0.015],
            [f.position[0] + 0.02, f.position[1] - 0.015],
            [f.position[0] - 0.02, f.position[1] - 0.015],
          ],
          fillColor: `${f.color ?? '#3b82f6'}33`,
          strokeColor: f.color ?? '#3b82f6',
          strokeWidth: 2,
        });
        break;
    }
  }
}

async function initMapForScene(cfg: SceneConfig) {
  destroyMap();
  await nextTick();
  if (mapContainerRef.value) {
    await initMap({ center: cfg.mapCenter, zoom: 13 });
    renderMapFeatures(cfg);
  }
}

onMounted(async () => {
  await nextTick();
  await initMapForScene(scene.value);
});

watch(activeScene, async () => {
  await initMapForScene(scene.value);
});

function handleSceneChange(key: SceneType) {
  activeScene.value = key;
}

function summaryColor(type: string) {
  if (type === 'total') return '#3b82f6';
  if (type === 'handled') return '#10b981';
  return '#f59e0b';
}
</script>

<template>
  <Page>
    <div ref="boardRef" class="board-page">
      <!-- Map background -->
      <div class="board-map">
        <div ref="mapContainerRef" class="board-map__canvas" />
        <div class="board-map__overlay" />
      </div>

      <!-- Header -->
      <header class="board-header">
        <div class="board-header__left">
          <span class="board-header__brand">大航蜂指挥中心</span>
          <span class="board-header__divider" />
          <span class="board-header__status">链控正常</span>
        </div>
        <div class="board-header__center">
          <SceneSelector
            :scenes="sceneList"
            :active="activeScene"
            @change="handleSceneChange"
          />
        </div>
        <div class="board-header__right">
          <span>{{ currentTime }}</span>
          <button class="fullscreen-btn" :title="isFullscreen ? '退出全屏' : '全屏模式'" @click="toggleFullscreen">
            <svg v-if="!isFullscreen" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
              <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
            </svg>
          </button>
        </div>
      </header>

      <!-- Left panel -->
      <aside class="board-left">
        <section class="float-card">
          <div class="float-card__title">
            <span>数据统计</span>
            <span class="float-card__scene-tag" :style="{ color: scene.color, borderColor: scene.color + '44' }">
              {{ scene.label }}
            </span>
          </div>
          <StatPanel :cards="scene.statCards" :devices="scene.devices" />
        </section>

        <section class="float-card">
          <div class="float-card__title">
            <span>无人机监控</span>
            <span class="float-card__tag">{{ scene.drones.length }} 在线</span>
          </div>
          <DroneMonitor :drones="scene.drones" />
        </section>

        <section class="float-card">
          <div class="float-card__title">
            <span>AI 识别统计</span>
          </div>
          <AiDetectStats :categories="scene.detectCategories" />
        </section>
      </aside>

      <!-- Right panel -->
      <aside class="board-right">
        <section class="float-card">
          <div class="float-card__title">
            <span>任务概述</span>
          </div>
          <div class="summary-grid">
            <div class="summary-item">
              <div class="summary-item__value" :style="{ color: summaryColor('total') }">
                {{ scene.summary.total }}
              </div>
              <div class="summary-item__label">发现问题</div>
            </div>
            <div class="summary-item">
              <div class="summary-item__value" :style="{ color: summaryColor('handled') }">
                {{ scene.summary.handled }}
              </div>
              <div class="summary-item__label">已处理</div>
            </div>
            <div class="summary-item">
              <div class="summary-item__value" :style="{ color: summaryColor('pending') }">
                {{ scene.summary.pending }}
              </div>
              <div class="summary-item__label">待处理</div>
            </div>
          </div>
          <div class="summary-bar">
            <div
              class="summary-bar__fill summary-bar__fill--done"
              :style="{ width: `${(scene.summary.handled / scene.summary.total) * 100}%` }"
            />
          </div>
          <div class="summary-rate">
            处理率 {{ ((scene.summary.handled / scene.summary.total) * 100).toFixed(0) }}%
          </div>
        </section>

        <section class="float-card float-card--gallery">
          <div class="float-card__title">
            <span>AI 告警图片</span>
            <span class="float-card__action">全部 ›</span>
          </div>
          <AlertGallery :images="scene.alertImages" />
        </section>

        <section class="float-card">
          <div class="float-card__title">
            <span>告警类型</span>
          </div>
          <div class="alert-type-tags">
            <span
              v-for="at in scene.alertTypes"
              :key="at"
              class="alert-type-tag"
              :style="{ borderColor: scene.color + '44', color: scene.color }"
            >
              {{ at }}
            </span>
          </div>
        </section>
      </aside>

      <!-- Footer -->
      <div class="board-footer">
        <span>{{ scene.label }}模式</span>
        <span>中心坐标: {{ scene.mapCenter[0] }}, {{ scene.mapCenter[1] }}</span>
        <span>设备: {{ scene.devices.reduce((s, d) => s + d.online, 0) }} 在线</span>
        <span>告警: {{ scene.summary.pending }} 待处理</span>
      </div>
    </div>
  </Page>
</template>

<style lang="less" scoped>
.board-page {
  position: relative;
  min-height: calc(100vh - 112px);
  overflow: hidden;
  padding: 0;
  background: #0a0d12;
  display: flex;
  flex-direction: column;
}

/* ── map ── */
.board-map {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.board-map__canvas {
  width: 100%;
  height: 100%;
}

.board-map__overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(circle at center, transparent 30%, rgb(10 13 18 / 55%) 100%),
    linear-gradient(180deg, rgb(10 13 18 / 40%) 0%, transparent 15%, transparent 85%, rgb(10 13 18 / 50%) 100%);
}

/* ── header ── */
.board-header {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  background: linear-gradient(180deg, rgb(10 13 18 / 85%) 0%, rgb(10 13 18 / 40%) 100%);
  backdrop-filter: blur(8px);
}

.board-header__left {
  display: flex;
  gap: 12px;
  align-items: center;
  flex: none;
}

.board-header__brand {
  color: #f6c453;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.04em;
  white-space: nowrap;
}

.board-header__divider {
  width: 1px;
  height: 16px;
  background: rgb(255 255 255 / 14%);
}

.board-header__status {
  color: #63e08f;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
}

.board-header__center {
  flex: 1;
  display: flex;
  justify-content: center;
  overflow-x: auto;
  padding: 0 16px;

  &::-webkit-scrollbar {
    display: none;
  }
}

.board-header__right {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #e5e7eb;
  font-size: 13px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  flex: none;
}

.fullscreen-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid rgb(255 255 255 / 12%);
  border-radius: 8px;
  background: rgb(255 255 255 / 6%);
  color: #d1d5db;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgb(255 255 255 / 12%);
    color: #f9fafb;
    border-color: rgb(255 255 255 / 20%);
  }
}

/* ── panels ── */
.board-left,
.board-right {
  position: absolute;
  top: 62px;
  bottom: 40px;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
  padding: 8px 0;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgb(255 255 255 / 12%);
    border-radius: 2px;
  }
}

.board-left {
  left: 14px;
  width: 280px;
}

.board-right {
  right: 14px;
  width: 300px;
}

.float-card {
  padding: 16px;
  border: 1px solid rgb(255 255 255 / 5%);
  border-radius: 18px;
  background: linear-gradient(180deg, rgb(18 19 21 / 0.92) 0%, rgb(22 23 27 / 0.88) 100%);
  backdrop-filter: blur(18px);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 4%),
    0 16px 40px rgb(0 0 0 / 24%);
  flex: none;
}

.float-card--gallery {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  :deep(.alert-gallery) {
    flex: 1;
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 3px;
    }

    &::-webkit-scrollbar-thumb {
      background: rgb(255 255 255 / 12%);
      border-radius: 2px;
    }
  }
}

.float-card__title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
  color: #f9fafb;
  font-size: 13px;
  font-weight: 700;
}

.float-card__tag {
  padding: 3px 10px;
  color: #6ef1a4;
  font-size: 11px;
  font-weight: 600;
  background: rgb(39 82 55 / 54%);
  border-radius: 999px;
}

.float-card__scene-tag {
  padding: 3px 10px;
  font-size: 11px;
  font-weight: 600;
  border: 1px solid;
  border-radius: 999px;
}

.float-card__action {
  color: #f4c54d;
  font-size: 12px;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
}

/* ── summary ── */
.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.summary-item {
  padding: 12px 8px 10px;
  text-align: center;
  border-radius: 14px;
  background: rgb(255 255 255 / 4%);
}

.summary-item__value {
  font-size: 20px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.summary-item__label {
  margin-top: 4px;
  color: #9ca3af;
  font-size: 11px;
}

.summary-bar {
  margin-top: 12px;
  height: 6px;
  border-radius: 3px;
  background: rgb(255 255 255 / 8%);
  overflow: hidden;
}

.summary-bar__fill--done {
  height: 100%;
  border-radius: 3px;
  background: linear-gradient(90deg, #10b981, #34d399);
  transition: width 0.6s ease;
}

.summary-rate {
  margin-top: 6px;
  color: #9ca3af;
  font-size: 11px;
  text-align: right;
}

/* ── alert type tags ── */
.alert-type-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.alert-type-tag {
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid;
  border-radius: 999px;
}

/* ── footer ── */
.board-footer {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 10;
  display: flex;
  justify-content: center;
  gap: 24px;
  padding: 10px 0;
  color: rgb(255 255 255 / 50%);
  font-size: 12px;
  background: linear-gradient(0deg, rgb(10 13 18 / 70%) 0%, transparent 100%);
}

/* ── fullscreen ── */
.board-page:fullscreen {
  min-height: 100vh;
}

/* ── responsive ── */
@media (max-width: 1400px) {
  .board-left {
    width: 250px;
  }

  .board-right {
    width: 270px;
  }
}

@media (max-width: 1100px) {
  .board-page {
    overflow: auto;
  }

  .board-header {
    position: relative;
    flex-wrap: wrap;
    gap: 8px;
    background: rgb(10 13 18 / 95%);
  }

  .board-header__center {
    order: 3;
    flex-basis: 100%;
    justify-content: flex-start;
    padding: 0;
  }

  .board-left,
  .board-right {
    position: relative;
    top: auto;
    bottom: auto;
    left: auto;
    right: auto;
    width: auto;
    overflow: visible;
    padding: 12px;
  }

  .board-map {
    position: relative;
    height: 400px;
    flex: none;
  }

  .board-map__overlay {
    display: none;
  }

  .board-footer {
    position: relative;
    background: rgb(10 13 18 / 90%);
    flex-wrap: wrap;
    padding: 12px;
  }
}
</style>
