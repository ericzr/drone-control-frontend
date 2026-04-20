<script lang="ts" setup>
import { computed, reactive, ref } from 'vue';

export interface RouteCreationResult {
  routeCategory: string;
  routeType: string;
  aircraftSeries: string;
  aircraftModel: string;
  routeName: string;
}

const props = defineProps<{ open: boolean }>();
const emit = defineEmits<{
  (e: 'update:open', val: boolean): void;
  (e: 'confirm', result: RouteCreationResult): void;
}>();

const step = ref(0);
const form = reactive({
  routeCategory: '',
  routeType: '',
  aircraftSeries: '',
  aircraftModel: '',
  routeName: '',
});

const routeCategories = [
  {
    group: '巡逻巡检',
    items: [
      { key: 'waypoint', label: '航点航线', icon: '📍', desc: '自定义航点逐点飞行' },
      { key: 'patrol', label: '巡逻航线', icon: '🔄', desc: '循环巡逻路径规划' },
    ],
  },
  {
    group: '测绘航线',
    items: [
      { key: 'area', label: '面状航线', icon: '🗺️', desc: '区域全覆盖测绘扫描' },
      { key: 'strip', label: '带状航线', icon: '📏', desc: '沿线带状测绘航摄' },
    ],
  },
  {
    group: '精细化测绘',
    items: [
      { key: 'oblique', label: '斜面航线', icon: '📐', desc: '倾斜摄影建模采集' },
      { key: 'geometry', label: '几何体航线', icon: '🏗️', desc: '建筑物环绕精细建模' },
      { key: 'closeRange', label: '贴近摄影', icon: '📸', desc: '近距离精细纹理采集' },
    ],
  },
];

const aircraftOptions = [
  { series: '经纬 M30 系列', models: ['Matrice 30', 'Matrice 30T'] },
  { series: 'Mavic 3 行业系列', models: ['Mavic 3E', 'Mavic 3T', 'Mavic 3M'] },
  { series: 'Matrice 3D 系列', models: ['Matrice 3D', 'Matrice 3TD'] },
  { series: 'Matrice 4 行业系列', models: ['Matrice 4E', 'Matrice 4T'] },
  { series: 'Matrice 4D 系列', models: ['Matrice 4D'] },
  { series: 'Matrice 400', models: ['Matrice 400'] },
];

const availableModels = computed(() => {
  return aircraftOptions.find((a) => a.series === form.aircraftSeries)?.models ?? [];
});

const stepLabels = ['航线类型', '选择飞行器', '航线名称'];

function selectRouteType(key: string) {
  form.routeType = key;
  const typeLabels: Record<string, string> = {
    waypoint: '航点', patrol: '巡逻', area: '面状', strip: '带状',
    oblique: '斜面', geometry: '几何体', closeRange: '贴近摄影',
  };
  form.routeName = `新建${typeLabels[key] ?? ''}航线`;
}

function selectSeries(series: string) {
  form.aircraftSeries = series;
  form.aircraftModel = '';
}

const canNext = computed(() => {
  if (step.value === 0) return !!form.routeType;
  if (step.value === 1) return !!form.aircraftModel;
  if (step.value === 2) return !!form.routeName.trim();
  return false;
});

function handleNext() {
  if (!canNext.value) return;
  if (step.value < 2) {
    step.value++;
  } else {
    emit('confirm', { ...form });
    handleClose();
  }
}

function handlePrev() {
  if (step.value > 0) step.value--;
}

function handleClose() {
  step.value = 0;
  form.routeCategory = '';
  form.routeType = '';
  form.aircraftSeries = '';
  form.aircraftModel = '';
  form.routeName = '';
  emit('update:open', false);
}
</script>

<template>
  <Teleport to="body">
    <Transition name="wz-fade">
      <div v-if="open" class="wz-backdrop" @click.self="handleClose">
        <div class="wz">
          <!-- Header -->
          <div class="wz-header">
            <span class="wz-header__title">创建新航线</span>
            <button class="wz-header__close" @click="handleClose">✕</button>
          </div>

          <!-- Steps indicator -->
          <div class="wz-steps">
            <div
              v-for="(label, i) in stepLabels"
              :key="i"
              :class="['wz-step', { 'wz-step--active': step === i, 'wz-step--done': step > i }]"
            >
              <span class="wz-step__num">{{ step > i ? '✓' : i + 1 }}</span>
              <span class="wz-step__label">{{ label }}</span>
            </div>
          </div>

          <!-- Body -->
          <div class="wz-body">
            <!-- Step 0: Route type -->
            <template v-if="step === 0">
              <div v-for="cat in routeCategories" :key="cat.group" class="wz-group">
                <div class="wz-group__title">{{ cat.group }}</div>
                <div class="wz-group__grid">
                  <div
                    v-for="item in cat.items"
                    :key="item.key"
                    :class="['wz-type', { 'wz-type--active': form.routeType === item.key }]"
                    @click="selectRouteType(item.key)"
                  >
                    <span class="wz-type__icon">{{ item.icon }}</span>
                    <span class="wz-type__label">{{ item.label }}</span>
                    <span class="wz-type__desc">{{ item.desc }}</span>
                  </div>
                </div>
              </div>
            </template>

            <!-- Step 1: Aircraft -->
            <template v-if="step === 1">
              <div class="wz-label">飞行器系列</div>
              <div class="wz-chips">
                <button
                  v-for="ac in aircraftOptions"
                  :key="ac.series"
                  :class="['wz-chip', { 'wz-chip--active': form.aircraftSeries === ac.series }]"
                  @click="selectSeries(ac.series)"
                >
                  {{ ac.series }}
                </button>
              </div>
              <template v-if="form.aircraftSeries">
                <div class="wz-label" style="margin-top: 18px">选择型号</div>
                <div class="wz-chips">
                  <button
                    v-for="m in availableModels"
                    :key="m"
                    :class="['wz-chip', { 'wz-chip--active': form.aircraftModel === m }]"
                    @click="form.aircraftModel = m"
                  >
                    {{ m }}
                  </button>
                </div>
              </template>
            </template>

            <!-- Step 2: Name -->
            <template v-if="step === 2">
              <div class="wz-label">航线名称</div>
              <input
                v-model="form.routeName"
                class="wz-input"
                placeholder="请输入航线名称"
                maxlength="50"
              />
              <div class="wz-summary">
                <div class="wz-summary__row">
                  <span class="wz-summary__label">航线类型</span>
                  <span>{{ form.routeType }}</span>
                </div>
                <div class="wz-summary__row">
                  <span class="wz-summary__label">飞行器</span>
                  <span>{{ form.aircraftSeries }} / {{ form.aircraftModel }}</span>
                </div>
              </div>
            </template>
          </div>

          <!-- Footer -->
          <div class="wz-footer">
            <button v-if="step > 0" class="wz-btn" @click="handlePrev">上一步</button>
            <button
              class="wz-btn wz-btn--primary"
              :class="{ 'wz-btn--disabled': !canNext }"
              @click="handleNext"
            >
              {{ step < 2 ? '下一步' : '创 建' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="less" scoped>
/* ── Backdrop ── */
.wz-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(0 0 0 / 60%);
  backdrop-filter: blur(4px);
}

/* ── Modal ── */
.wz {
  width: 680px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  border-radius: 20px;
  border: 1px solid rgb(255 255 255 / 8%);
  background: linear-gradient(180deg, rgb(18 19 23 / 0.98) 0%, rgb(22 23 28 / 0.96) 100%);
  backdrop-filter: blur(20px);
  box-shadow: 0 24px 60px rgb(0 0 0 / 50%);
  overflow: hidden;
}

/* ── Header ── */
.wz-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 24px;
  border-bottom: 1px solid rgb(255 255 255 / 6%);
}

.wz-header__title {
  font-size: 16px;
  font-weight: 700;
  color: #f9fafb;
}

.wz-header__close {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 7px;
  background: transparent;
  color: rgb(255 255 255 / 40%);
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;

  &:hover {
    background: rgb(255 255 255 / 8%);
    color: #f9fafb;
  }
}

/* ── Steps ── */
.wz-steps {
  display: flex;
  gap: 4px;
  padding: 16px 24px;
  flex: none;
}

.wz-step {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 10px;
  background: rgb(255 255 255 / 3%);
  transition: all 0.2s;

  &--active {
    background: rgb(22 119 255 / 15%);

    .wz-step__num {
      background: #1677ff;
      color: #fff;
    }

    .wz-step__label {
      color: #60a5fa;
    }
  }

  &--done {
    .wz-step__num {
      background: rgb(16 185 129 / 20%);
      color: #10b981;
    }

    .wz-step__label {
      color: rgb(255 255 255 / 40%);
    }
  }
}

.wz-step__num {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  background: rgb(255 255 255 / 8%);
  color: rgb(255 255 255 / 45%);
  font-size: 12px;
  font-weight: 700;
  flex: none;
}

.wz-step__label {
  font-size: 12px;
  font-weight: 600;
  color: rgb(255 255 255 / 35%);
}

/* ── Body ── */
.wz-body {
  flex: 1;
  overflow-y: auto;
  padding: 4px 24px 20px;
  min-height: 280px;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgb(255 255 255 / 10%);
    border-radius: 2px;
  }
}

/* ── Route type group ── */
.wz-group {
  margin-bottom: 18px;
}

.wz-group__title {
  font-size: 11px;
  font-weight: 600;
  color: rgb(255 255 255 / 30%);
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.wz-group__grid {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.wz-type {
  width: 140px;
  padding: 16px 14px;
  border: 1.5px solid rgb(255 255 255 / 8%);
  border-radius: 12px;
  cursor: pointer;
  text-align: center;
  transition: all 0.2s;
  background: rgb(255 255 255 / 2%);

  &:hover {
    border-color: rgb(22 119 255 / 35%);
    background: rgb(22 119 255 / 6%);
  }

  &--active {
    border-color: rgb(22 119 255 / 50%);
    background: rgb(22 119 255 / 12%);
    box-shadow: 0 0 0 1px rgb(22 119 255 / 25%);
  }
}

.wz-type__icon {
  display: block;
  font-size: 26px;
  margin-bottom: 8px;
}

.wz-type__label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #f0f0f0;
}

.wz-type__desc {
  display: block;
  font-size: 10px;
  color: rgb(255 255 255 / 30%);
  margin-top: 4px;
}

/* ── Label ── */
.wz-label {
  font-size: 12px;
  font-weight: 600;
  color: rgb(255 255 255 / 50%);
  margin-bottom: 10px;
}

/* ── Chips ── */
.wz-chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.wz-chip {
  padding: 8px 18px;
  border: 1.5px solid rgb(255 255 255 / 10%);
  border-radius: 8px;
  background: rgb(255 255 255 / 3%);
  color: rgb(255 255 255 / 60%);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    border-color: rgb(22 119 255 / 35%);
    color: #e5e7eb;
  }

  &--active {
    border-color: #1677ff;
    background: rgb(22 119 255 / 22%);
    color: #60a5fa;
    font-weight: 600;
  }
}

/* ── Input ── */
.wz-input {
  width: 100%;
  height: 44px;
  padding: 0 14px;
  border: 1px solid rgb(255 255 255 / 12%);
  border-radius: 10px;
  background: rgb(255 255 255 / 5%);
  color: #f0f0f0;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: rgb(22 119 255 / 50%);
  }

  &::placeholder {
    color: rgb(255 255 255 / 25%);
  }
}

/* ── Summary box ── */
.wz-summary {
  margin-top: 20px;
  padding: 16px;
  border-radius: 12px;
  background: rgb(255 255 255 / 3%);
  border: 1px solid rgb(255 255 255 / 6%);
}

.wz-summary__row {
  display: flex;
  justify-content: space-between;
  padding: 5px 0;
  font-size: 13px;
  color: rgb(255 255 255 / 65%);
}

.wz-summary__label {
  color: rgb(255 255 255 / 35%);
}

/* ── Footer ── */
.wz-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 16px 24px;
  border-top: 1px solid rgb(255 255 255 / 6%);
  flex: none;
}

.wz-btn {
  padding: 8px 24px;
  border: 1px solid rgb(255 255 255 / 12%);
  border-radius: 8px;
  background: rgb(255 255 255 / 5%);
  color: rgb(255 255 255 / 65%);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgb(255 255 255 / 10%);
    color: #f9fafb;
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

  &--disabled {
    opacity: 0.4;
    cursor: default;
    pointer-events: none;
  }
}

/* ── Transitions ── */
.wz-fade-enter-active,
.wz-fade-leave-active {
  transition: all 0.25s ease;
}

.wz-fade-enter-from,
.wz-fade-leave-to {
  opacity: 0;

  .wz {
    transform: scale(0.96) translateY(10px);
  }
}
</style>
