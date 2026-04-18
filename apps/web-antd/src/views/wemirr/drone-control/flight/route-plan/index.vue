<script lang="ts" setup name="FlightRoutePlanPage">
import { Page } from '@vben/common-ui';

import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue';

import { message, Modal } from 'ant-design-vue';

import { useMap } from '#/utils/map';

import CreateRouteWizard from './components/CreateRouteWizard.vue';
import type { RouteCreationResult } from './components/CreateRouteWizard.vue';
import RouteConfigPanel from './components/RouteConfigPanel.vue';
import type {
  MissionConfig,
  SurveyConfig,
  Waypoint,
} from './components/RouteConfigPanel.vue';
import RouteLibrary from './components/RouteLibrary.vue';
import type { RouteLibraryItem } from './components/RouteLibrary.vue';

const mapRef = ref<HTMLElement | null>(null);
const { initMap, addMarker, addPolyline, removeFeature } = useMap(mapRef);

const libraryCollapsed = ref(false);
const configCollapsed = ref(false);
const activeRouteId = ref<string | null>('1');
const libraryRoutes = ref<RouteLibraryItem[]>([
  {
    id: '1',
    name: '高新区主干道巡查线',
    routeType: '航点航线',
    aircraft: 'Matrice 4T',
    waypoints: 5,
    distance: '3.2 km',
    updatedAt: '2026-04-13 16:00',
  },
  {
    id: '2',
    name: '沿河低空排污核查线',
    routeType: '巡逻航线',
    aircraft: 'Mavic 3T',
    waypoints: 6,
    distance: '4.2 km',
    updatedAt: '2026-04-12 10:30',
  },
  {
    id: '3',
    name: '光伏园区面状测绘线',
    routeType: '面状航线',
    aircraft: 'Matrice 4E',
    waypoints: 30,
    distance: '18.6 km',
    updatedAt: '2026-04-10 09:00',
  },
  {
    id: '4',
    name: '林区周界定时巡检线',
    routeType: '航点航线',
    aircraft: 'Matrice 30T',
    waypoints: 18,
    distance: '12.3 km',
    updatedAt: '2026-03-28 14:00',
  },
]);

const wizardOpen = ref(false);
function openWizard() {
  wizardOpen.value = true;
}

function onWizardConfirm(result: RouteCreationResult) {
  const newId = String(Date.now());
  libraryRoutes.value.unshift({
    id: newId,
    name: result.routeName,
    routeType: result.routeType,
    aircraft: `${result.aircraftSeries} / ${result.aircraftModel}`,
    waypoints: 0,
    distance: '0 m',
    updatedAt: new Date().toLocaleString('zh-CN'),
  });
  activeRouteId.value = newId;
  currentRouteType.value = result.routeType;
  waypoints.value = [];
  renderMap();
  message.success(`航线「${result.routeName}」已创建`);
}

const currentRouteType = ref('waypoint');
const waypoints = ref<Waypoint[]>([
  { id: 1, lng: 108.93, lat: 34.27, alt: 120, speed: 10, action: '拍照', yaw: 0, hoverTime: 0 },
  { id: 2, lng: 108.94, lat: 34.275, alt: 120, speed: 10, action: '悬停', yaw: 0, hoverTime: 5 },
  { id: 3, lng: 108.95, lat: 34.268, alt: 100, speed: 8, action: '拍照', yaw: 0, hoverTime: 0 },
  { id: 4, lng: 108.955, lat: 34.26, alt: 100, speed: 8, action: '拍照', yaw: 0, hoverTime: 0 },
  { id: 5, lng: 108.945, lat: 34.255, alt: 120, speed: 10, action: '返航', yaw: 0, hoverTime: 0 },
]);
let nextWpId = 6;

const missionConfig = reactive<MissionConfig>({
  approachMode: '安全模式',
  finishAction: '自动返航',
  lostAction: '自动返航',
  routeLostBehavior: '执行失联动作',
  routeMode: '单程航线',
  globalAction: '无',
  safeAltitude: 20,
  globalSpeed: 5,
  altitudeMode: '相对地形',
});

const surveyConfig = reactive<SurveyConfig>({
  heading: 90,
  sideOverlap: 60,
  frontOverlap: 70,
  gsd: 3.5,
});

function haversine(p1: Waypoint, p2: Waypoint): number {
  const R = 6_371_000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(p2.lat - p1.lat);
  const dLng = toRad(p2.lng - p1.lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(p1.lat)) * Math.cos(toRad(p2.lat)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const totalDistance = computed(() => {
  let dist = 0;
  for (let i = 1; i < waypoints.value.length; i++) {
    dist += haversine(waypoints.value[i - 1]!, waypoints.value[i]!);
  }
  if (dist >= 1000) return `${(dist / 1000).toFixed(1)} km`;
  return `${Math.round(dist)} m`;
});

const estimatedTime = computed(() => {
  let dist = 0;
  for (let i = 1; i < waypoints.value.length; i++) {
    dist += haversine(waypoints.value[i - 1]!, waypoints.value[i]!);
  }
  const avgSpeed = missionConfig.globalSpeed || 5;
  const seconds = dist / avgSpeed;
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  if (mins === 0) return `${secs}秒`;
  return `${mins}分${secs}秒`;
});

const coverageArea = computed(() => {
  if (waypoints.value.length < 3) return '0 m²';
  let area = 0;
  const pts = waypoints.value;
  for (let i = 0; i < pts.length; i++) {
    const j = (i + 1) % pts.length;
    area += pts[i]!.lng * pts[j]!.lat;
    area -= pts[j]!.lng * pts[i]!.lat;
  }
  area = Math.abs(area) / 2;
  const m2 = area * 111_320 * 111_320;
  if (m2 >= 1e6) return `${(m2 / 1e6).toFixed(2)} km²`;
  return `${Math.round(m2)} m²`;
});

const activeRouteName = computed(
  () => libraryRoutes.value.find((r) => r.id === activeRouteId.value)?.name ?? '未选择航线',
);

const routeLineId = ref('');

function renderMap() {
  if (routeLineId.value) removeFeature(routeLineId.value);
  waypoints.value.forEach((wp) => {
    if ((wp as any)._markerId) removeFeature((wp as any)._markerId);
  });

  waypoints.value.forEach((wp, i) => {
    (wp as any)._markerId = addMarker({
      position: [wp.lng, wp.lat],
      label: `${i + 1}`,
    });
  });

  if (waypoints.value.length >= 2) {
    routeLineId.value = addPolyline({
      path: waypoints.value.map((wp) => [wp.lng, wp.lat] as [number, number]),
      color: '#1677ff',
      width: 3,
    });
  }
}

function addWaypoint() {
  const last = waypoints.value[waypoints.value.length - 1];
  const lng = last ? last.lng + 0.005 : 108.94;
  const lat = last ? last.lat - 0.003 : 34.26;
  waypoints.value.push({
    id: nextWpId++,
    lng: Number(lng.toFixed(6)),
    lat: Number(lat.toFixed(6)),
    alt: missionConfig.safeAltitude || 120,
    speed: missionConfig.globalSpeed || 10,
    action: '拍照',
    yaw: 0,
    hoverTime: 0,
  });
  renderMap();
}

function removeWaypoint(id: number) {
  const wp = waypoints.value.find((w) => w.id === id);
  if ((wp as any)?._markerId) removeFeature((wp as any)._markerId);
  waypoints.value = waypoints.value.filter((w) => w.id !== id);
  renderMap();
}

function moveWaypoint(id: number, dir: 'up' | 'down') {
  const idx = waypoints.value.findIndex((w) => w.id === id);
  if (idx < 0) return;
  const target = dir === 'up' ? idx - 1 : idx + 1;
  if (target < 0 || target >= waypoints.value.length) return;
  [waypoints.value[idx], waypoints.value[target]] = [
    waypoints.value[target]!,
    waypoints.value[idx]!,
  ];
  renderMap();
}

function updateWaypoint(id: number, field: string, value: any) {
  const wp = waypoints.value.find((w) => w.id === id);
  if (wp) {
    (wp as any)[field] = value;
    if (field === 'lng' || field === 'lat') renderMap();
  }
}

function updateMission(field: string, value: any) {
  (missionConfig as any)[field] = value;
}

function updateSurvey(field: string, value: any) {
  (surveyConfig as any)[field] = value;
}

function handleImportKmz() {
  message.info('KMZ 导入：请选择 .kmz / .kml 文件（功能接入中）');
}

function handleExportKmz() {
  const data = {
    name: activeRouteName.value,
    missionConfig: { ...missionConfig },
    waypoints: waypoints.value.map(
      ({ id, lng, lat, alt, speed, action, yaw, hoverTime }) => ({
        id, lng, lat, alt, speed, action, yaw, hoverTime,
      }),
    ),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${data.name}.json`;
  a.click();
  URL.revokeObjectURL(url);
  message.success('航线配置已导出（JSON 格式，后续对接 KMZ）');
}

function handleSave() {
  const route = libraryRoutes.value.find((r) => r.id === activeRouteId.value);
  if (route) {
    route.waypoints = waypoints.value.length;
    route.distance = totalDistance.value;
    route.updatedAt = new Date().toLocaleString('zh-CN');
  }
  message.success('航线已保存');
}

function selectLibraryRoute(id: string) {
  activeRouteId.value = id;
  message.info(`已切换至航线: ${libraryRoutes.value.find((r) => r.id === id)?.name}`);
}

function duplicateRoute(id: string) {
  const src = libraryRoutes.value.find((r) => r.id === id);
  if (!src) return;
  const newId = String(Date.now());
  libraryRoutes.value.unshift({
    ...src,
    id: newId,
    name: `${src.name} (副本)`,
    updatedAt: new Date().toLocaleString('zh-CN'),
  });
  message.success('航线已复制');
}

function deleteRoute(id: string) {
  Modal.confirm({
    title: '确认删除',
    content: `确认删除航线「${libraryRoutes.value.find((r) => r.id === id)?.name}」？`,
    onOk: () => {
      libraryRoutes.value = libraryRoutes.value.filter((r) => r.id !== id);
      if (activeRouteId.value === id) {
        activeRouteId.value = libraryRoutes.value[0]?.id ?? null;
      }
      message.success('已删除');
    },
  });
}

onMounted(async () => {
  await nextTick();
  if (mapRef.value) {
    await initMap({ center: [108.94, 34.265], zoom: 14 });
    renderMap();
  }
});
</script>

<template>
  <Page>
    <div class="rp">
      <!-- Full-screen map -->
      <div ref="mapRef" class="rp-map" />
      <div class="rp-map__overlay" />

      <!-- Header -->
      <header class="rp-header">
        <div class="rp-header__left">
          <span class="rp-header__brand">航线规划</span>
          <span class="rp-header__divider" />
          <span class="rp-header__route">{{ activeRouteName }}</span>
          <span class="rp-header__divider" />
          <span class="rp-header__meta">{{ waypoints.length }} 航点 · {{ totalDistance }}</span>
        </div>
        <div class="rp-header__right">
          <button class="rp-hbtn" title="导入 KMZ" @click="handleImportKmz">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="15" height="15"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
            导入
          </button>
          <button class="rp-hbtn" title="导出 KMZ" @click="handleExportKmz">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="15" height="15"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
            导出
          </button>
          <button class="rp-hbtn rp-hbtn--primary" @click="handleSave">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="15" height="15"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>
            保存
          </button>
        </div>
      </header>

      <!-- Left panel: Route library -->
      <aside :class="['rp-left', { 'rp-left--collapsed': libraryCollapsed }]">
        <button
          class="rp-toggle rp-toggle--left"
          @click="libraryCollapsed = !libraryCollapsed"
        >
          <svg
            :style="{ transform: libraryCollapsed ? 'rotate(180deg)' : '' }"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round" width="14" height="14"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div v-if="!libraryCollapsed" class="rp-left__content">
          <RouteLibrary
            :routes="libraryRoutes"
            :active-route-id="activeRouteId"
            @select="selectLibraryRoute"
            @create="openWizard"
            @duplicate="duplicateRoute"
            @delete="deleteRoute"
          />
        </div>
      </aside>

      <!-- Right panel: Config -->
      <aside :class="['rp-right', { 'rp-right--collapsed': configCollapsed }]">
        <button
          class="rp-toggle rp-toggle--right"
          @click="configCollapsed = !configCollapsed"
        >
          <svg
            :style="{ transform: configCollapsed ? '' : 'rotate(180deg)' }"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round" width="14" height="14"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div v-if="!configCollapsed" class="rp-right__content">
          <RouteConfigPanel
            :waypoints="waypoints"
            :route-type="currentRouteType"
            :mission-config="missionConfig"
            :survey-config="surveyConfig"
            :total-distance="totalDistance"
            :estimated-time="estimatedTime"
            :coverage-area="coverageArea"
            @add-waypoint="addWaypoint"
            @remove-waypoint="removeWaypoint"
            @move-waypoint="moveWaypoint"
            @update-waypoint="updateWaypoint"
            @update-mission="updateMission"
            @update-survey="updateSurvey"
            @save="handleSave"
            @import-kmz="handleImportKmz"
            @export-kmz="handleExportKmz"
          />
        </div>
      </aside>

      <!-- Bottom stats bar -->
      <div class="rp-footer">
        <div class="rp-footer__stat">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="13" height="13"><circle cx="12" cy="10" r="3" /><path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 0 0-16 0c0 3 2.7 6.9 8 11.7z" /></svg>
          <span>{{ waypoints.length }} 航点</span>
        </div>
        <div class="rp-footer__stat">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="13" height="13"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
          <span>总距离 {{ totalDistance }}</span>
        </div>
        <div class="rp-footer__stat">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="13" height="13"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
          <span>预计 {{ estimatedTime }}</span>
        </div>
        <div class="rp-footer__stat">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="13" height="13"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /></svg>
          <span>面积 {{ coverageArea }}</span>
        </div>
        <div class="rp-footer__stat">
          <span>速度 {{ missionConfig.globalSpeed }} m/s</span>
        </div>
        <div class="rp-footer__stat">
          <span>安全高度 {{ missionConfig.safeAltitude }} m</span>
        </div>
      </div>

      <!-- Create route wizard -->
      <CreateRouteWizard
        :open="wizardOpen"
        @update:open="wizardOpen = $event"
        @confirm="onWizardConfirm"
      />
    </div>
  </Page>
</template>

<style lang="less" scoped>
.rp {
  position: relative;
  min-height: calc(100vh - 112px);
  overflow: hidden;
  background: #0a0d12;
  display: flex;
  flex-direction: column;
}

.rp-map {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.rp-map__overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(circle at center, transparent 30%, rgb(10 13 18 / 55%) 100%),
    linear-gradient(180deg, rgb(10 13 18 / 40%) 0%, transparent 15%, transparent 85%, rgb(10 13 18 / 50%) 100%);
  z-index: 1;
}

/* ── Header ── */
.rp-header {
  position: relative;
  z-index: 12;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: linear-gradient(180deg, rgb(10 13 18 / 88%) 0%, rgb(10 13 18 / 45%) 100%);
  backdrop-filter: blur(8px);
  flex: none;
}

.rp-header__left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: none;
}

.rp-header__brand {
  color: #f6c453;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.04em;
  white-space: nowrap;
}

.rp-header__divider {
  width: 1px;
  height: 16px;
  background: rgb(255 255 255 / 14%);
}

.rp-header__route {
  color: #f0f0f0;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
}

.rp-header__meta {
  color: rgb(255 255 255 / 45%);
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.rp-header__right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: none;
}

.rp-hbtn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 7px 14px;
  border: 1px solid rgb(255 255 255 / 12%);
  border-radius: 8px;
  background: rgb(255 255 255 / 6%);
  color: rgb(255 255 255 / 65%);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover {
    background: rgb(255 255 255 / 12%);
    color: #f9fafb;
    border-color: rgb(255 255 255 / 20%);
  }

  &--primary {
    background: rgb(22 119 255 / 22%);
    border-color: rgb(22 119 255 / 35%);
    color: #60a5fa;

    &:hover {
      background: rgb(22 119 255 / 35%);
      color: #93c5fd;
    }
  }
}

/* ── Toggle buttons ── */
.rp-toggle {
  position: absolute;
  top: 16px;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 40px;
  border: 1px solid rgb(255 255 255 / 10%);
  background: rgb(12 14 18 / 85%);
  backdrop-filter: blur(12px);
  color: rgb(255 255 255 / 50%);
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgb(12 14 18 / 95%);
    color: #f9fafb;
  }

  &--left {
    right: -28px;
    border-radius: 0 8px 8px 0;
    border-left: none;
  }

  &--right {
    left: -28px;
    border-radius: 8px 0 0 8px;
    border-right: none;
  }
}

/* ── Left panel (route library) ── */
.rp-left {
  position: absolute;
  top: 56px;
  left: 14px;
  bottom: 52px;
  z-index: 10;
  width: 280px;
  transition: width 0.25s ease, opacity 0.25s ease;

  &--collapsed {
    width: 0;

    .rp-left__content {
      opacity: 0;
      pointer-events: none;
    }

    .rp-toggle--left {
      right: -28px;
    }
  }
}

.rp-left__content {
  height: 100%;
  border-radius: 18px;
  border: 1px solid rgb(255 255 255 / 5%);
  background: linear-gradient(180deg, rgb(18 19 21 / 0.92) 0%, rgb(22 23 27 / 0.88) 100%);
  backdrop-filter: blur(18px);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 4%),
    0 16px 40px rgb(0 0 0 / 24%);
  overflow: hidden;
  opacity: 1;
  transition: opacity 0.25s ease;
}

/* ── Right panel (config) ── */
.rp-right {
  position: absolute;
  top: 56px;
  right: 14px;
  bottom: 52px;
  z-index: 10;
  width: 380px;
  transition: width 0.25s ease, opacity 0.25s ease;

  &--collapsed {
    width: 0;

    .rp-right__content {
      opacity: 0;
      pointer-events: none;
    }

    .rp-toggle--right {
      left: -28px;
    }
  }
}

.rp-right__content {
  height: 100%;
  border-radius: 18px;
  border: 1px solid rgb(255 255 255 / 5%);
  background: linear-gradient(180deg, rgb(18 19 21 / 0.92) 0%, rgb(22 23 27 / 0.88) 100%);
  backdrop-filter: blur(18px);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 4%),
    0 16px 40px rgb(0 0 0 / 24%);
  overflow: hidden;
  opacity: 1;
  transition: opacity 0.25s ease;
}

/* ── Footer ── */
.rp-footer {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 10;
  display: flex;
  justify-content: center;
  gap: 28px;
  padding: 12px 0;
  color: rgb(255 255 255 / 55%);
  font-size: 12px;
  font-weight: 500;
  background: linear-gradient(0deg, rgb(10 13 18 / 75%) 0%, transparent 100%);
}

.rp-footer__stat {
  display: flex;
  align-items: center;
  gap: 5px;
  font-variant-numeric: tabular-nums;
}

/* ── Responsive ── */
@media (max-width: 1200px) {
  .rp-left {
    width: 240px;
  }

  .rp-right {
    width: 340px;
  }
}

@media (max-width: 900px) {
  .rp-left,
  .rp-right {
    display: none;
  }
}
</style>
