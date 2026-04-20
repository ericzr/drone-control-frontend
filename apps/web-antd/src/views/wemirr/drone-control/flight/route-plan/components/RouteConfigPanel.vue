<script lang="ts" setup>
import { computed, ref } from 'vue';

export interface Waypoint {
  id: number;
  lng: number;
  lat: number;
  alt: number;
  speed: number;
  action: string;
  yaw: number;
  hoverTime: number;
}

export interface MissionConfig {
  approachMode: string;
  finishAction: string;
  lostAction: string;
  routeLostBehavior: string;
  routeMode: string;
  globalAction: string;
  safeAltitude: number;
  globalSpeed: number;
  altitudeMode: string;
}

export interface SurveyConfig {
  heading: number;
  sideOverlap: number;
  frontOverlap: number;
  gsd: number;
}

const props = defineProps<{
  waypoints: Waypoint[];
  routeType: string;
  missionConfig: MissionConfig;
  surveyConfig: SurveyConfig;
  totalDistance: string;
  estimatedTime: string;
  coverageArea: string;
}>();

const emit = defineEmits<{
  (e: 'addWaypoint'): void;
  (e: 'removeWaypoint', id: number): void;
  (e: 'moveWaypoint', id: number, dir: 'up' | 'down'): void;
  (e: 'updateWaypoint', id: number, field: string, value: any): void;
  (e: 'updateMission', field: string, value: any): void;
  (e: 'updateSurvey', field: string, value: any): void;
  (e: 'save'): void;
  (e: 'importKmz'): void;
  (e: 'exportKmz'): void;
}>();

const activeTab = ref<'mission' | 'survey' | 'waypoints'>('mission');
const selectedWaypoint = ref<number | null>(null);

const isSurveyType = computed(() =>
  ['area', 'strip', 'oblique', 'geometry', 'closeRange'].includes(props.routeType),
);

const tabs = computed(() => {
  const list: Array<{ key: string; label: string }> = [
    { key: 'mission', label: '任务配置' },
  ];
  if (isSurveyType.value) {
    list.push({ key: 'survey', label: '航线参数' });
  }
  list.push({ key: 'waypoints', label: '航点列表' });
  return list;
});

const approachOptions = ['安全模式', '倾斜进入', '协调转弯'];
const finishOptions = ['自动返航', '悬停', '降落', '返回首航点'];
const lostOptions = ['自动返航', '悬停', '降落'];
const lostBehaviorOptions = ['执行失联动作', '继续航线', '直接返航'];
const routeModeOptions = ['单程航线', '往返航线'];
const globalActionOptions = ['无', '定距拍照', '定时拍照', '持续录像'];
const altitudeModes = ['海拔高度', '相对起飞点', '相对地形'];
const waypointActions = ['拍照', '录像', '悬停', '全景拍摄', '返航'];

function adjustAlt(id: number, delta: number) {
  const wp = props.waypoints.find((w) => w.id === id);
  if (wp) {
    const newAlt = Math.max(0, Math.min(1500, wp.alt + delta));
    emit('updateWaypoint', id, 'alt', newAlt);
  }
}

function selectWaypoint(id: number) {
  selectedWaypoint.value = selectedWaypoint.value === id ? null : id;
}

const selectedWp = computed(() =>
  props.waypoints.find((w) => w.id === selectedWaypoint.value),
);
</script>

<template>
  <div class="rc">
    <!-- Panel header -->
    <div class="rc-header">
      <span class="rc-header__title">航线配置</span>
    </div>

    <!-- Tab bar -->
    <div class="rc-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        :class="['rc-tab', { 'rc-tab--active': activeTab === tab.key }]"
        @click="activeTab = tab.key as any"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Scrollable body -->
    <div class="rc-body">
      <!-- ═══ Mission Config ═══ -->
      <template v-if="activeTab === 'mission'">
        <div class="rc-section">
          <div class="rc-grid">
            <div class="rc-field">
              <label>飞向首航点</label>
              <select
                class="rc-input"
                :value="missionConfig.approachMode"
                @change="emit('updateMission', 'approachMode', ($event.target as HTMLSelectElement).value)"
              >
                <option v-for="o in approachOptions" :key="o" :value="o">{{ o }}</option>
              </select>
            </div>
            <div class="rc-field">
              <label>完成动作</label>
              <select
                class="rc-input"
                :value="missionConfig.finishAction"
                @change="emit('updateMission', 'finishAction', ($event.target as HTMLSelectElement).value)"
              >
                <option v-for="o in finishOptions" :key="o" :value="o">{{ o }}</option>
              </select>
            </div>
            <div class="rc-field">
              <label>失控动作</label>
              <select
                class="rc-input"
                :value="missionConfig.lostAction"
                @change="emit('updateMission', 'lostAction', ($event.target as HTMLSelectElement).value)"
              >
                <option v-for="o in lostOptions" :key="o" :value="o">{{ o }}</option>
              </select>
            </div>
            <div class="rc-field">
              <label>航线失联</label>
              <select
                class="rc-input"
                :value="missionConfig.routeLostBehavior"
                @change="emit('updateMission', 'routeLostBehavior', ($event.target as HTMLSelectElement).value)"
              >
                <option v-for="o in lostBehaviorOptions" :key="o" :value="o">{{ o }}</option>
              </select>
            </div>
            <div class="rc-field">
              <label>航线模式</label>
              <select
                class="rc-input"
                :value="missionConfig.routeMode"
                @change="emit('updateMission', 'routeMode', ($event.target as HTMLSelectElement).value)"
              >
                <option v-for="o in routeModeOptions" :key="o" :value="o">{{ o }}</option>
              </select>
            </div>
            <div class="rc-field">
              <label>全局动作</label>
              <select
                class="rc-input"
                :value="missionConfig.globalAction"
                @change="emit('updateMission', 'globalAction', ($event.target as HTMLSelectElement).value)"
              >
                <option v-for="o in globalActionOptions" :key="o" :value="o">{{ o }}</option>
              </select>
            </div>
          </div>
        </div>

        <div class="rc-section">
          <div class="rc-field rc-field--full">
            <label>安全起飞高度 (m)</label>
            <div class="rc-range-row">
              <input
                type="range"
                class="rc-range"
                :value="missionConfig.safeAltitude"
                min="5"
                max="200"
                step="1"
                @input="emit('updateMission', 'safeAltitude', Number(($event.target as HTMLInputElement).value))"
              />
              <span class="rc-range__val">{{ missionConfig.safeAltitude }}</span>
            </div>
          </div>
          <div class="rc-field rc-field--full">
            <label>全局飞行速度 (m/s)</label>
            <div class="rc-range-row">
              <input
                type="range"
                class="rc-range"
                :value="missionConfig.globalSpeed"
                min="1"
                max="20"
                step="0.5"
                @input="emit('updateMission', 'globalSpeed', Number(($event.target as HTMLInputElement).value))"
              />
              <span class="rc-range__val">{{ missionConfig.globalSpeed }}</span>
            </div>
          </div>
          <div class="rc-field rc-field--full">
            <label>高度模式</label>
            <div class="rc-seg">
              <button
                v-for="m in altitudeModes"
                :key="m"
                :class="['rc-seg__btn', { 'rc-seg__btn--active': missionConfig.altitudeMode === m }]"
                @click="emit('updateMission', 'altitudeMode', m)"
              >
                {{ m }}
              </button>
            </div>
          </div>
        </div>
      </template>

      <!-- ═══ Survey Config ═══ -->
      <template v-if="activeTab === 'survey'">
        <div class="rc-section">
          <div class="rc-field rc-field--full">
            <label>航摄方向角 (°)</label>
            <div class="rc-range-row">
              <input
                type="range"
                class="rc-range"
                :value="surveyConfig.heading"
                min="0"
                max="360"
                @input="emit('updateSurvey', 'heading', Number(($event.target as HTMLInputElement).value))"
              />
              <span class="rc-range__val">{{ surveyConfig.heading }}°</span>
            </div>
          </div>
          <div class="rc-grid">
            <div class="rc-field">
              <label>旁向重叠 (%)</label>
              <div class="rc-range-row">
                <input
                  type="range"
                  class="rc-range"
                  :value="surveyConfig.sideOverlap"
                  min="10"
                  max="90"
                  @input="emit('updateSurvey', 'sideOverlap', Number(($event.target as HTMLInputElement).value))"
                />
                <span class="rc-range__val">{{ surveyConfig.sideOverlap }}</span>
              </div>
            </div>
            <div class="rc-field">
              <label>航向重叠 (%)</label>
              <div class="rc-range-row">
                <input
                  type="range"
                  class="rc-range"
                  :value="surveyConfig.frontOverlap"
                  min="10"
                  max="90"
                  @input="emit('updateSurvey', 'frontOverlap', Number(($event.target as HTMLInputElement).value))"
                />
                <span class="rc-range__val">{{ surveyConfig.frontOverlap }}</span>
              </div>
            </div>
          </div>
          <div class="rc-field rc-field--full">
            <label>地面分辨率 GSD (cm/px)</label>
            <input
              type="number"
              class="rc-input"
              :value="surveyConfig.gsd"
              min="0.5"
              max="30"
              step="0.1"
              @input="emit('updateSurvey', 'gsd', Number(($event.target as HTMLInputElement).value))"
            />
          </div>
        </div>
      </template>

      <!-- ═══ Waypoints ═══ -->
      <template v-if="activeTab === 'waypoints'">
        <div class="rc-section">
          <div class="wp-toolbar">
            <span class="wp-toolbar__count">{{ waypoints.length }} 个航点</span>
            <button class="wp-toolbar__add" @click="emit('addWaypoint')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="12" height="12"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              添加
            </button>
          </div>

          <div class="wp-list">
            <div
              v-for="(wp, idx) in waypoints"
              :key="wp.id"
              :class="['wp-row', { 'wp-row--selected': selectedWaypoint === wp.id }]"
              @click="selectWaypoint(wp.id)"
            >
              <span class="wp-row__idx">{{ idx + 1 }}</span>
              <div class="wp-row__coords">
                <span>{{ wp.lng.toFixed(4) }}, {{ wp.lat.toFixed(4) }}</span>
                <span class="wp-row__alt">{{ wp.alt }}m · {{ wp.speed }}m/s</span>
              </div>
              <span class="wp-row__action">{{ wp.action }}</span>
              <div class="wp-row__ops">
                <button
                  class="wp-row__btn"
                  :disabled="idx === 0"
                  @click.stop="emit('moveWaypoint', wp.id, 'up')"
                >↑</button>
                <button
                  class="wp-row__btn"
                  :disabled="idx === waypoints.length - 1"
                  @click.stop="emit('moveWaypoint', wp.id, 'down')"
                >↓</button>
                <button
                  class="wp-row__btn wp-row__btn--danger"
                  @click.stop="emit('removeWaypoint', wp.id)"
                >×</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Waypoint detail edit -->
        <Transition name="wp-detail">
          <div v-if="selectedWp" class="wp-detail">
            <div class="wp-detail__header">
              航点 #{{ selectedWp.id }} 详情
            </div>
            <div class="rc-grid">
              <div class="rc-field">
                <label>高度 (m)</label>
                <div class="wp-alt-ctrl">
                  <button class="wp-alt-btn" @click="adjustAlt(selectedWp.id, -10)">-10</button>
                  <input
                    type="number"
                    class="rc-input rc-input--sm"
                    :value="selectedWp.alt"
                    min="0"
                    max="1500"
                    @input="emit('updateWaypoint', selectedWp!.id, 'alt', Number(($event.target as HTMLInputElement).value))"
                  />
                  <button class="wp-alt-btn" @click="adjustAlt(selectedWp.id, 10)">+10</button>
                  <button class="wp-alt-btn" @click="adjustAlt(selectedWp.id, 100)">+100</button>
                </div>
              </div>
              <div class="rc-field">
                <label>速度 (m/s)</label>
                <input
                  type="number"
                  class="rc-input"
                  :value="selectedWp.speed"
                  min="1"
                  max="20"
                  @input="emit('updateWaypoint', selectedWp!.id, 'speed', Number(($event.target as HTMLInputElement).value))"
                />
              </div>
              <div class="rc-field">
                <label>动作</label>
                <select
                  class="rc-input"
                  :value="selectedWp.action"
                  @change="emit('updateWaypoint', selectedWp!.id, 'action', ($event.target as HTMLSelectElement).value)"
                >
                  <option v-for="a in waypointActions" :key="a" :value="a">{{ a }}</option>
                </select>
              </div>
              <div class="rc-field">
                <label>偏航角 (°)</label>
                <input
                  type="number"
                  class="rc-input"
                  :value="selectedWp.yaw"
                  min="-180"
                  max="180"
                  @input="emit('updateWaypoint', selectedWp!.id, 'yaw', Number(($event.target as HTMLInputElement).value))"
                />
              </div>
              <div class="rc-field">
                <label>悬停 (s)</label>
                <input
                  type="number"
                  class="rc-input"
                  :value="selectedWp.hoverTime"
                  min="0"
                  max="300"
                  @input="emit('updateWaypoint', selectedWp!.id, 'hoverTime', Number(($event.target as HTMLInputElement).value))"
                />
              </div>
            </div>
          </div>
        </Transition>
      </template>
    </div>
  </div>
</template>

<style lang="less" scoped>
.rc {
  display: flex;
  flex-direction: column;
  height: 100%;
  color: #e5e7eb;
}

.rc-header {
  padding: 16px 16px 10px;
  flex: none;
}

.rc-header__title {
  font-size: 14px;
  font-weight: 700;
  color: #f9fafb;
}

/* ── Tabs ── */
.rc-tabs {
  display: flex;
  gap: 2px;
  padding: 0 14px;
  flex: none;
  margin-bottom: 2px;
}

.rc-tab {
  flex: 1;
  padding: 7px 0;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: rgb(255 255 255 / 40%);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    color: rgb(255 255 255 / 65%);
    background: rgb(255 255 255 / 4%);
  }

  &--active {
    color: #60a5fa;
    background: rgb(22 119 255 / 15%);
  }
}

/* ── Body ── */
.rc-body {
  flex: 1;
  overflow-y: auto;
  padding: 10px 14px 14px;

  &::-webkit-scrollbar {
    width: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgb(255 255 255 / 10%);
    border-radius: 2px;
  }
}

/* ── Section ── */
.rc-section {
  margin-bottom: 16px;
}

/* ── Grid ── */
.rc-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

/* ── Field ── */
.rc-field {
  display: flex;
  flex-direction: column;
  gap: 5px;

  label {
    font-size: 11px;
    color: rgb(255 255 255 / 40%);
    font-weight: 500;
  }

  &--full {
    grid-column: 1 / -1;
  }
}

/* ── Inputs (dark native) ── */
.rc-input {
  width: 100%;
  height: 30px;
  padding: 0 8px;
  border: 1px solid rgb(255 255 255 / 10%);
  border-radius: 6px;
  background: rgb(255 255 255 / 5%);
  color: #e5e7eb;
  font-size: 12px;
  outline: none;
  transition: border-color 0.2s;
  appearance: auto;

  &:focus {
    border-color: rgb(22 119 255 / 50%);
  }

  option {
    background: #1a1c20;
    color: #e5e7eb;
  }

  &--sm {
    height: 26px;
    font-size: 11px;
  }
}

/* ── Range slider ── */
.rc-range-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.rc-range {
  flex: 1;
  height: 4px;
  appearance: none;
  background: rgb(255 255 255 / 10%);
  border-radius: 2px;
  outline: none;

  &::-webkit-slider-thumb {
    appearance: none;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #1677ff;
    border: 2px solid #60a5fa;
    cursor: pointer;
  }
}

.rc-range__val {
  min-width: 36px;
  text-align: right;
  font-size: 12px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: rgb(255 255 255 / 65%);
}

/* ── Segmented ── */
.rc-seg {
  display: flex;
  gap: 0;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgb(255 255 255 / 10%);
}

.rc-seg__btn {
  flex: 1;
  padding: 6px 0;
  border: none;
  background: rgb(255 255 255 / 3%);
  color: rgb(255 255 255 / 45%);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;

  &:not(:last-child) {
    border-right: 1px solid rgb(255 255 255 / 8%);
  }

  &:hover {
    color: rgb(255 255 255 / 65%);
    background: rgb(255 255 255 / 6%);
  }

  &--active {
    color: #60a5fa;
    background: rgb(22 119 255 / 18%);
  }
}

/* ── Waypoint list ── */
.wp-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.wp-toolbar__count {
  font-size: 12px;
  color: rgb(255 255 255 / 35%);
}

.wp-toolbar__add {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 12px;
  border: 1px solid rgb(22 119 255 / 35%);
  border-radius: 6px;
  background: rgb(22 119 255 / 15%);
  color: #60a5fa;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgb(22 119 255 / 25%);
    color: #93c5fd;
  }
}

.wp-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 360px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgb(255 255 255 / 10%);
    border-radius: 2px;
  }
}

.wp-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;
  border: 1px solid transparent;

  &:hover {
    background: rgb(255 255 255 / 4%);
  }

  &--selected {
    background: rgb(22 119 255 / 8%);
    border-color: rgb(22 119 255 / 25%);
  }
}

.wp-row__idx {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 6px;
  background: rgb(22 119 255 / 18%);
  color: #60a5fa;
  font-size: 11px;
  font-weight: 700;
  flex: none;
}

.wp-row__coords {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  font-size: 11px;
  color: rgb(255 255 255 / 60%);
  font-variant-numeric: tabular-nums;
}

.wp-row__alt {
  font-size: 10px;
  color: rgb(255 255 255 / 30%);
}

.wp-row__action {
  padding: 2px 8px;
  border-radius: 999px;
  border: 1px solid rgb(255 255 255 / 10%);
  font-size: 10px;
  font-weight: 600;
  color: rgb(255 255 255 / 50%);
  flex: none;
}

.wp-row__ops {
  display: flex;
  gap: 3px;
  flex: none;
  opacity: 0;
  transition: opacity 0.15s;

  .wp-row:hover & {
    opacity: 1;
  }
}

.wp-row__btn {
  width: 20px;
  height: 20px;
  border: none;
  border-radius: 4px;
  background: rgb(255 255 255 / 6%);
  color: rgb(255 255 255 / 45%);
  font-size: 11px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;

  &:disabled {
    opacity: 0.25;
    cursor: default;
  }

  &:not(:disabled):hover {
    background: rgb(255 255 255 / 12%);
    color: #f9fafb;
  }

  &--danger:not(:disabled):hover {
    background: rgb(239 68 68 / 15%);
    color: #ef4444;
  }
}

/* ── Waypoint detail panel ── */
.wp-detail {
  margin-top: 12px;
  padding: 14px;
  border-radius: 12px;
  background: rgb(255 255 255 / 3%);
  border: 1px solid rgb(255 255 255 / 6%);
}

.wp-detail__header {
  font-size: 12px;
  font-weight: 700;
  color: #60a5fa;
  margin-bottom: 12px;
}

.wp-alt-ctrl {
  display: flex;
  gap: 4px;
  align-items: center;
}

.wp-alt-btn {
  padding: 3px 8px;
  border: 1px solid rgb(255 255 255 / 10%);
  border-radius: 4px;
  background: rgb(255 255 255 / 5%);
  color: rgb(255 255 255 / 50%);
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
  flex: none;
  transition: all 0.15s;

  &:hover {
    background: rgb(255 255 255 / 10%);
    color: #f9fafb;
  }
}

/* ── Transition ── */
.wp-detail-enter-active,
.wp-detail-leave-active {
  transition: all 0.2s ease;
}

.wp-detail-enter-from,
.wp-detail-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
