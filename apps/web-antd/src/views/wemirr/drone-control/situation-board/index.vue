<script lang="ts" setup name="DroneSituationBoardPage">
import { Page } from '@vben/common-ui';

import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import { message } from 'ant-design-vue';

import { useMap } from '#/utils/map';

import { useClock } from '../composables/useClock';

import type { SceneConfig, SceneType, TerminalItem } from './scenes';

import AiDetectStats from './components/AiDetectStats.vue';
import AiQueryPanel from './components/AiQueryPanel.vue';
import AlertGallery from './components/AlertGallery.vue';
import DataScreenView from './components/DataScreenView.vue';
import SceneSelector from './components/SceneSelector.vue';
import StatPanel from './components/StatPanel.vue';
import TerminalList from './components/TerminalList.vue';
import { defaultScene, sceneList, scenes } from './scenes';

type ViewMode = 'command' | 'dashboard';
const viewMode = ref<ViewMode>('command');
const router = useRouter();

const selectedTerminal = ref<TerminalItem | null>(null);
const sceneBarExpanded = ref(false);

function closeSceneBarOnClickOutside(e: MouseEvent) {
  const target = e.target as HTMLElement;
  if (!target.closest('.scene-toggle-wrapper')) {
    sceneBarExpanded.value = false;
  }
}


function handleSelectTerminal(t: TerminalItem) {
  selectedTerminal.value = selectedTerminal.value?.id === t.id ? null : t;
}

function backToGlobalMap() {
  selectedTerminal.value = null;
}

const panelCollapsed = reactive<Record<string, boolean>>({
  stats: false,
  terminals: false,
  aiDetect: false,
  summary: false,
  gallery: false,
  alertTypes: false,
});

function togglePanel(key: string) {
  panelCollapsed[key] = !panelCollapsed[key];
}

const boardRef = ref<HTMLElement | null>(null);
const isFullscreen = ref(false);

function toggleFullscreen() {
  if (!boardRef.value) return;
  if (!document.fullscreenElement) {
    boardRef.value.requestFullscreen().catch(() => {
      message.warning('当前环境不支持全屏');
    });
  } else {
    document.exitFullscreen().catch(() => {});
  }
}

function onFullscreenChange() {
  isFullscreen.value = !!document.fullscreenElement;
}


const aiPanelOpen = ref(false);

const activeScene = ref<SceneType>(defaultScene);
const scene = computed<SceneConfig>(() => scenes[activeScene.value]);

const { currentTime } = useClock('datetime');


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
  document.addEventListener('click', closeSceneBarOnClickOutside);
  document.addEventListener('fullscreenchange', onFullscreenChange);
  await nextTick();
  await initMapForScene(scene.value);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', closeSceneBarOnClickOutside);
  document.removeEventListener('fullscreenchange', onFullscreenChange);
  destroyMap();
});

watch(activeScene, async () => {
  selectedTerminal.value = null;
  await initMapForScene(scene.value);
});

watch(selectedTerminal, async (val) => {
  if (!val) {
    await nextTick();
    await initMapForScene(scene.value);
  }
});

function handleSceneChange(key: SceneType) {
  activeScene.value = key;
}

function summaryColor(type: string) {
  if (type === 'total') return '#3b82f6';
  if (type === 'handled') return '#10b981';
  return '#f59e0b';
}

const headerTitle = computed(() =>
  viewMode.value === 'command'
    ? '云界空域OS · 区域指挥中心'
    : '云界空域OS · 区域运行驾驶舱',
);
</script>

<template>
  <Page>
    <div ref="boardRef" class="board-page">
      <!-- Header -->
      <header class="board-header">
        <div class="board-header__left">
          <span class="board-header__brand">{{ headerTitle }}</span>
          <span class="board-header__divider" />
          <span class="board-header__status">链控正常</span>
          <!-- Scene selector: placed in left area to avoid view-switcher overlap -->
          <template v-if="viewMode === 'command'">
            <span class="board-header__divider" />
            <div class="scene-toggle-wrapper">
              <button
                class="scene-toggle"
                :style="{ '--accent': scene.color }"
                @click.stop="sceneBarExpanded = !sceneBarExpanded"
              >
                <span class="scene-toggle__icon">{{ scene.icon }}</span>
                <span class="scene-toggle__label">{{ scene.label }}</span>
                <svg
                  class="scene-toggle__arrow"
                  :class="{ 'scene-toggle__arrow--open': sceneBarExpanded }"
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                  stroke-linecap="round" stroke-linejoin="round" width="14" height="14"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              <Transition name="scene-expand">
                <div v-if="sceneBarExpanded" class="scene-dropdown">
                  <SceneSelector
                    :scenes="sceneList"
                    :active="activeScene"
                    @change="(k: SceneType) => { handleSceneChange(k); sceneBarExpanded = false; }"
                  />
                </div>
              </Transition>
            </div>
          </template>
        </div>

        <div class="board-header__spacer" />

        <div class="board-header__right">
          <span>{{ currentTime }}</span>
          <button
            v-if="viewMode === 'command'"
            class="fullscreen-btn"
            :class="{ 'fullscreen-btn--active': aiPanelOpen }"
            title="AI 问数"
            @click="aiPanelOpen = !aiPanelOpen"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </button>
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

      <!-- Fixed view mode switcher — always same position -->
      <div class="view-switcher">
        <button
          class="view-switcher__btn"
          :class="{ 'view-switcher__btn--active': viewMode === 'command' }"
          @click="viewMode = 'command'"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          指挥中心
        </button>
        <button
          class="view-switcher__btn"
          :class="{ 'view-switcher__btn--active': viewMode === 'dashboard' }"
          @click="viewMode = 'dashboard'"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
          </svg>
          数据驾驶舱
        </button>
      </div>

      <!-- ===== Command Center View ===== -->
      <template v-if="viewMode === 'command'">
        <!-- Main view area: Global Map or Terminal FPV -->
        <div class="board-main-view">
          <!-- Global scene map -->
          <template v-if="!selectedTerminal">
            <div ref="mapContainerRef" class="board-map__canvas" />
            <div class="board-map__overlay" />
          </template>

          <!-- Terminal FPV / monitor view -->
          <template v-else>
            <div class="terminal-fpv">
              <div class="terminal-fpv__grid" />
              <div class="terminal-fpv__crosshair">
                <svg viewBox="0 0 80 80" width="80" height="80">
                  <circle cx="40" cy="40" r="30" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1" />
                  <line x1="40" y1="5" x2="40" y2="20" stroke="rgba(255,255,255,0.15)" stroke-width="1" />
                  <line x1="40" y1="60" x2="40" y2="75" stroke="rgba(255,255,255,0.15)" stroke-width="1" />
                  <line x1="5" y1="40" x2="20" y2="40" stroke="rgba(255,255,255,0.15)" stroke-width="1" />
                  <line x1="60" y1="40" x2="75" y2="40" stroke="rgba(255,255,255,0.15)" stroke-width="1" />
                </svg>
              </div>
              <div class="terminal-fpv__label">
                {{ selectedTerminal.type === 'drone' ? 'FPV 视频流' : '实时监控画面' }}
              </div>

              <!-- AI detection boxes (only for drones) -->
              <template v-if="selectedTerminal.type === 'drone'">
                <div class="terminal-fpv__det" style="left:28%;top:32%;width:16%;height:20%">
                  <span class="terminal-fpv__det-tag">目标 A  87%</span>
                </div>
                <div class="terminal-fpv__det" style="left:58%;top:48%;width:11%;height:16%">
                  <span class="terminal-fpv__det-tag">目标 B  73%</span>
                </div>
              </template>

              <!-- Top-left terminal info bar -->
              <div class="terminal-fpv__info">
                <span class="terminal-fpv__info-icon">{{ selectedTerminal.type === 'drone' ? '✈️' : '📷' }}</span>
                <div>
                  <div class="terminal-fpv__info-name">{{ selectedTerminal.name }}</div>
                  <div class="terminal-fpv__info-mission">{{ selectedTerminal.mission }}</div>
                </div>
                <span v-if="selectedTerminal.battery" class="terminal-fpv__info-battery">🔋 {{ selectedTerminal.battery }}%</span>
                <span class="terminal-fpv__info-signal">📶 {{ selectedTerminal.signal }}%</span>
              </div>

              <!-- Bottom action bar -->
              <div class="terminal-fpv__actions">
                <button class="terminal-fpv__btn" @click="backToGlobalMap">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14">
                    <path d="M19 12H5" /><polyline points="12 19 5 12 12 5" />
                  </svg>
                  返回全局地图
                </button>
                <button
                  v-if="selectedTerminal.type === 'drone'"
                  class="terminal-fpv__btn terminal-fpv__btn--primary"
                  @click="router.push(`/flight/cockpit?drone=${encodeURIComponent(selectedTerminal.name)}&mission=${encodeURIComponent(selectedTerminal.mission)}`)"
                >
                  进入座舱
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </button>
              </div>
            </div>
          </template>
        </div>

        <aside class="board-left">
          <section class="float-card" :class="{ 'float-card--collapsed': panelCollapsed.stats }">
            <div class="float-card__title float-card__title--toggle" @click="togglePanel('stats')">
              <span>数据统计</span>
              <div class="float-card__title-right">
                <span class="float-card__scene-tag" :style="{ color: scene.color, borderColor: scene.color + '44' }">
                  {{ scene.label }}
                </span>
                <svg class="float-card__chevron" :class="{ 'float-card__chevron--up': !panelCollapsed.stats }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><polyline points="6 9 12 15 18 9" /></svg>
              </div>
            </div>
            <div v-show="!panelCollapsed.stats" class="float-card__body">
              <StatPanel :cards="scene.statCards" :devices="scene.devices" />
            </div>
          </section>

          <section class="float-card" :class="{ 'float-card--collapsed': panelCollapsed.terminals, 'float-card--terminals': !panelCollapsed.terminals }">
            <div class="float-card__title float-card__title--toggle" @click="togglePanel('terminals')">
              <span>终端列表</span>
              <div class="float-card__title-right">
                <span class="float-card__tag">{{ scene.terminals.length }} 在线</span>
                <svg class="float-card__chevron" :class="{ 'float-card__chevron--up': !panelCollapsed.terminals }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><polyline points="6 9 12 15 18 9" /></svg>
              </div>
            </div>
            <div v-show="!panelCollapsed.terminals" class="float-card__body">
              <TerminalList
                :terminals="scene.terminals"
                :active-id="selectedTerminal?.id"
                @select="handleSelectTerminal"
              />
            </div>
          </section>

          <section class="float-card" :class="{ 'float-card--collapsed': panelCollapsed.aiDetect }">
            <div class="float-card__title float-card__title--toggle" @click="togglePanel('aiDetect')">
              <span>AI 识别统计</span>
              <div class="float-card__title-right">
                <svg class="float-card__chevron" :class="{ 'float-card__chevron--up': !panelCollapsed.aiDetect }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><polyline points="6 9 12 15 18 9" /></svg>
              </div>
            </div>
            <div v-show="!panelCollapsed.aiDetect" class="float-card__body">
              <AiDetectStats :categories="scene.detectCategories" />
            </div>
          </section>
        </aside>

        <aside class="board-right">
          <section class="float-card" :class="{ 'float-card--collapsed': panelCollapsed.summary }">
            <div class="float-card__title float-card__title--toggle" @click="togglePanel('summary')">
              <span>任务概述</span>
              <div class="float-card__title-right">
                <svg class="float-card__chevron" :class="{ 'float-card__chevron--up': !panelCollapsed.summary }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><polyline points="6 9 12 15 18 9" /></svg>
              </div>
            </div>
            <div v-show="!panelCollapsed.summary" class="float-card__body">
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
                  :style="{ width: `${scene.summary.total > 0 ? (scene.summary.handled / scene.summary.total) * 100 : 0}%` }"
                />
              </div>
              <div class="summary-rate">
                处理率 {{ scene.summary.total > 0 ? ((scene.summary.handled / scene.summary.total) * 100).toFixed(0) : '—' }}%
              </div>
            </div>
          </section>

          <section class="float-card" :class="{ 'float-card--collapsed': panelCollapsed.gallery, 'float-card--gallery': !panelCollapsed.gallery }">
            <div class="float-card__title float-card__title--toggle" @click="togglePanel('gallery')">
              <span>AI 告警图片</span>
              <div class="float-card__title-right">
                <span class="float-card__action" @click.stop="router.push('/event/list')">全部 ›</span>
                <svg class="float-card__chevron" :class="{ 'float-card__chevron--up': !panelCollapsed.gallery }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><polyline points="6 9 12 15 18 9" /></svg>
              </div>
            </div>
            <div v-show="!panelCollapsed.gallery" class="float-card__body">
              <AlertGallery :images="scene.alertImages" />
            </div>
          </section>

          <section class="float-card" :class="{ 'float-card--collapsed': panelCollapsed.alertTypes }">
            <div class="float-card__title float-card__title--toggle" @click="togglePanel('alertTypes')">
              <span>告警类型</span>
              <div class="float-card__title-right">
                <svg class="float-card__chevron" :class="{ 'float-card__chevron--up': !panelCollapsed.alertTypes }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><polyline points="6 9 12 15 18 9" /></svg>
              </div>
            </div>
            <div v-show="!panelCollapsed.alertTypes" class="float-card__body">
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
            </div>
          </section>
        </aside>

        <Transition name="slide-up">
          <div v-if="aiPanelOpen" class="ai-panel">
            <div class="ai-panel__header">
              <span>AI 问数助手</span>
              <button class="ai-panel__close" @click="aiPanelOpen = false">✕</button>
            </div>
            <div class="ai-panel__body">
              <AiQueryPanel />
            </div>
          </div>
        </Transition>

        <div class="board-footer">
          <span>{{ scene.label }}模式</span>
          <span>中心坐标: {{ scene.mapCenter[0] }}, {{ scene.mapCenter[1] }}</span>
          <span>设备: {{ scene.devices.reduce((s, d) => s + d.online, 0) }} 在线</span>
          <span>告警: {{ scene.summary.pending }} 待处理</span>
        </div>
      </template>

      <!-- ===== Dashboard View ===== -->
      <DataScreenView v-else />
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

/* ── View switcher (fixed position) ── */
.view-switcher {
  position: absolute;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 15;
  display: flex;
  gap: 2px;
  padding: 3px;
  border-radius: 10px;
  background: rgb(0 0 0 / 50%);
  backdrop-filter: blur(12px);
  border: 1px solid rgb(255 255 255 / 8%);
  box-shadow: 0 4px 16px rgb(0 0 0 / 30%);
}

.view-switcher__btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 16px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: rgb(255 255 255 / 50%);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s;
  white-space: nowrap;

  &:hover {
    color: rgb(255 255 255 / 75%);
    background: rgb(255 255 255 / 6%);
  }

  &--active {
    background: rgb(22 119 255 / 22%);
    color: #60a5fa;
    box-shadow: 0 0 8px rgb(22 119 255 / 15%);
  }
}

/* ── Scene toggle wrapper ── */
.scene-toggle-wrapper {
  position: relative;
}

/* ── Scene toggle (collapsed) ── */
.scene-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border: 1px solid rgb(255 255 255 / 10%);
  border-radius: 999px;
  background: rgb(255 255 255 / 5%);
  color: #f0f0f0;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover {
    background: rgb(255 255 255 / 8%);
    border-color: var(--accent, rgb(255 255 255 / 15%));
  }
}

.scene-toggle__icon {
  font-size: 15px;
}

.scene-toggle__label {
  color: var(--accent, #60a5fa);
}

.scene-toggle__arrow {
  transition: transform 0.25s ease;
  color: rgb(255 255 255 / 40%);

  &--open {
    transform: rotate(180deg);
  }
}

/* ── Scene dropdown (expanded) ── */
.scene-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  z-index: 20;
  padding: 10px 14px;
  border-radius: 16px;
  border: 1px solid rgb(255 255 255 / 8%);
  background: rgb(12 14 18 / 0.95);
  backdrop-filter: blur(16px);
  box-shadow: 0 12px 40px rgb(0 0 0 / 50%);
  white-space: nowrap;
}

.scene-expand-enter-active,
.scene-expand-leave-active {
  transition: all 0.25s ease;
}

.scene-expand-enter-from,
.scene-expand-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* ── Main view area ── */
.board-main-view {
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

/* ── Terminal FPV view (replaces map when terminal selected) ── */
.terminal-fpv {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #0d1520 0%, #111d33 50%, #0a1018 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.terminal-fpv__grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgb(255 255 255 / 2%) 1px, transparent 1px),
    linear-gradient(90deg, rgb(255 255 255 / 2%) 1px, transparent 1px);
  background-size: 80px 80px;
}

.terminal-fpv__crosshair {
  z-index: 2;
}

.terminal-fpv__label {
  position: absolute;
  bottom: 80px;
  color: rgb(255 255 255 / 15%);
  font-size: 14px;
  letter-spacing: 4px;
}

.terminal-fpv__det {
  position: absolute;
  border: 2px solid #22d3ee;
  border-radius: 2px;
  z-index: 3;
}

.terminal-fpv__det-tag {
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

.terminal-fpv__info {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 5;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  border-radius: 12px;
  background: rgb(0 0 0 / 50%);
  backdrop-filter: blur(10px);
  border: 1px solid rgb(255 255 255 / 8%);
}

.terminal-fpv__info-icon {
  font-size: 20px;
}

.terminal-fpv__info-name {
  color: #f0f0f0;
  font-size: 13px;
  font-weight: 700;
}

.terminal-fpv__info-mission {
  color: #9ca3af;
  font-size: 11px;
  margin-top: 2px;
}

.terminal-fpv__info-battery,
.terminal-fpv__info-signal {
  font-size: 11px;
  color: rgb(255 255 255 / 55%);
  margin-left: 4px;
}

.terminal-fpv__actions {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 5;
  display: flex;
  gap: 10px;
}

.terminal-fpv__btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 20px;
  border: 1px solid rgb(255 255 255 / 12%);
  border-radius: 10px;
  background: rgb(0 0 0 / 45%);
  backdrop-filter: blur(8px);
  color: rgb(255 255 255 / 65%);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgb(0 0 0 / 60%);
    color: #f9fafb;
    border-color: rgb(255 255 255 / 20%);
  }

  &--primary {
    background: rgb(22 119 255 / 25%);
    border-color: rgb(22 119 255 / 40%);
    color: #60a5fa;

    &:hover {
      background: rgb(22 119 255 / 35%);
      color: #93c5fd;
    }
  }
}

/* ── header ── */
.board-header {
  position: relative;
  z-index: 12;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  background: linear-gradient(180deg, rgb(10 13 18 / 85%) 0%, rgb(10 13 18 / 40%) 100%);
  backdrop-filter: blur(8px);
  flex: none;
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

.board-header__spacer {
  flex: 1;
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
  min-height: 120px;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .float-card__body {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

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

.float-card--collapsed {
  flex: none !important;
  min-height: 0 !important;
  overflow: hidden !important;

  .float-card__title {
    margin-bottom: 0;
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

.float-card__title--toggle {
  cursor: pointer;
  user-select: none;
  border-radius: 8px;
  margin: -4px -6px;
  padding: 4px 6px;
  transition: background 0.15s;

  &:hover {
    background: rgb(255 255 255 / 4%);
  }
}

.float-card__title-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.float-card__chevron {
  color: rgb(255 255 255 / 30%);
  transition: transform 0.25s ease;
  flex: none;

  &--up {
    transform: rotate(180deg);
  }
}

.float-card__body {
  /* content area below title */
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

.fullscreen-btn--active {
  background: rgb(22 119 255 / 20%);
  border-color: #1677ff;
  color: #60a5fa;
}

/* ── AI panel ── */
.ai-panel {
  position: absolute;
  bottom: 40px;
  right: 14px;
  z-index: 20;
  width: 380px;
  height: 520px;
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  border: 1px solid rgb(255 255 255 / 8%);
  background: linear-gradient(180deg, rgb(18 19 21 / 0.96) 0%, rgb(22 23 27 / 0.94) 100%);
  backdrop-filter: blur(20px);
  box-shadow: 0 20px 50px rgb(0 0 0 / 40%);
  overflow: hidden;
}

.ai-panel__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid rgb(255 255 255 / 6%);
  color: #f9fafb;
  font-size: 14px;
  font-weight: 700;
}

.ai-panel__close {
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: rgb(255 255 255 / 40%);
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: rgb(255 255 255 / 8%);
    color: #f9fafb;
  }
}

.ai-panel__body {
  flex: 1;
  padding: 12px 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* ── Terminal list card ── */
.float-card--terminals {
  flex: 1;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .float-card__body {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  :deep(.tl) {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  :deep(.tl-list) {
    flex: 1;
    overflow-y: auto;
  }
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

  .view-switcher {
    position: relative;
    top: auto;
    left: auto;
    transform: none;
    margin: 8px auto;
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

  .board-main-view {
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
