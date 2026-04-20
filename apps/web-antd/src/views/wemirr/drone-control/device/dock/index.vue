<script lang="ts" setup name="DeviceDockPage">
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

import { useFs } from '@fast-crud/fast-crud';
import {
  Button,
  Form,
  FormItem,
  Input,
  InputNumber,
  Modal,
  Radio,
  RadioGroup,
  Select,
  SelectOption,
  message,
} from 'ant-design-vue';

import { appendTakeoffTask } from '../../_services/takeoff-task-store';

import DeviceCardView from '../components/DeviceCardView.vue';
import type { DeviceCardAction, DeviceCardField } from '../components/DeviceCardView.vue';
import createCrudOptions from './crud';

const router = useRouter();
const viewMode = ref<'list' | 'card'>('list');

interface DockRow {
  id: string | number;
  name: string;
  latitude?: string;
  longitude?: string;
  bindDrone?: string;
  status?: string;
  droneStatus?: string;
  [k: string]: unknown;
}

function openTakeoff(row: DockRow) {
  currentDock.value = row;
  takeoffForm.targetLat = row.latitude || '31.052912';
  takeoffForm.targetLng = row.longitude || '121.27228';
  takeoffForm.altitude = 80;
  takeoffForm.safeAltitude = 60;
  takeoffForm.returnAltitude = 100;
  takeoffForm.lostAction = '返航';
  takeoffForm.routeLostAction = '退出';
  takeoffForm.returnMode = '设定高度';
  takeoffForm.cmdLostAction = '继续';
  takeoffForm.cmdFlightMode = '设定高度';
  takeoffForm.cmdFlightAlt = 100;
  takeoffModalVisible.value = true;
}

const { crudBinding, crudRef, crudExpose } = useFs({
  createCrudOptions,
  context: { router, openTakeoff },
});

onMounted(async () => {
  await crudExpose.doRefresh();
});

const currentDock = ref<DockRow | null>(null);
const takeoffModalVisible = ref(false);
const takeoffSubmitting = ref(false);

const takeoffForm = reactive({
  targetLat: '31.052912',
  targetLng: '121.27228',
  altitude: 80,
  safeAltitude: 60,
  returnAltitude: 100,
  lostAction: '返航',
  routeLostAction: '退出',
  returnMode: '设定高度',
  cmdLostAction: '继续',
  cmdFlightMode: '设定高度',
  cmdFlightAlt: 100,
});

async function confirmTakeoff() {
  if (takeoffSubmitting.value) {
    return Promise.reject();
  }
  const dock = currentDock.value;
  if (!dock) {
    message.error('未选择机巢');
    return Promise.reject();
  }
  if (!takeoffForm.targetLat || !takeoffForm.targetLng) {
    message.warning('请填写目标点坐标');
    return Promise.reject();
  }
  takeoffSubmitting.value = true;
  try {
    const taskId = `TK-${Date.now()}`;
    appendTakeoffTask({
      id: taskId,
      dockId: String(dock.id ?? ''),
      dockName: String(dock.name ?? ''),
      drone: String(dock.bindDrone ?? ''),
      targetLat: String(takeoffForm.targetLat),
      targetLng: String(takeoffForm.targetLng),
      altitude: takeoffForm.altitude,
      safeAltitude: takeoffForm.safeAltitude,
      returnAltitude: takeoffForm.returnAltitude,
      lostAction: takeoffForm.lostAction,
      returnMode: takeoffForm.returnMode,
      createdAt: new Date().toISOString(),
    });
    takeoffModalVisible.value = false;
    message.success(
      `${dock.name} 一键起飞指令已下发，任务已写入会话（打开「任务调度」可同步）`,
    );
    await router.push(
      `/device/dock-monitor?dockId=${dock.id}`
      + `&dockName=${encodeURIComponent(dock.name || '')}`
      + `&drone=${encodeURIComponent(dock.bindDrone || '')}`
      + `&lat=${takeoffForm.targetLat}&lng=${takeoffForm.targetLng}`
      + `&alt=${takeoffForm.altitude}`
      + `&taskId=${encodeURIComponent(taskId)}`,
    );
  } catch (err) {
    message.error('起飞指令下发失败，请重试');
    console.error(err);
  } finally {
    takeoffSubmitting.value = false;
  }
}

function pickOnMap() {
  message.info('图上选点功能：请在地图上点击选取目标位置（模拟）');
  takeoffForm.targetLat = (34.265 + Math.random() * 0.01).toFixed(6);
  takeoffForm.targetLng = (108.943 + Math.random() * 0.01).toFixed(6);
}

const cardData = computed(() => {
  const binding = crudBinding.value as any;
  return binding?.data ?? binding?.table?.data ?? [];
});

const cardFields: DeviceCardField[] = [
  { key: 'sn', label: '序列号' },
  { key: 'dockType', label: '机巢类型' },
  { key: 'droneStatus', label: '驻机状态' },
  { key: 'bindDrone', label: '绑定无人机' },
  { key: 'region', label: '区域' },
  { key: 'temperature', label: '舱温(°C)' },
];

const cardActions: DeviceCardAction[] = [
  {
    label: '详情',
    type: 'link',
    onClick: (row) => router.push(`/device/detail?id=${row.id}`),
  },
  {
    label: '一键起飞',
    type: 'link',
    show: (row) => row.status !== '离线' && row.droneStatus === '驻机就绪',
    onClick: (row) => openTakeoff(row as DockRow),
  },
];
</script>

<template>
  <fs-page :class="['page-layout-card', { 'is-card-view': viewMode === 'card' }]">
    <fs-crud ref="crudRef" v-bind="crudBinding">
      <template #toolbar-left>
        <RadioGroup v-model:value="viewMode" size="small" button-style="solid" class="view-mode-toggle">
          <Radio.Button value="list">列表</Radio.Button>
          <Radio.Button value="card">卡片</Radio.Button>
        </RadioGroup>
      </template>
      <template #default>
        <DeviceCardView
          v-if="viewMode === 'card'"
          :data="cardData"
          icon="🏗️"
          :fields="cardFields"
          :actions="cardActions"
        />
      </template>
    </fs-crud>

    <!-- 一键起飞参数设定 Modal -->
    <Modal
      v-model:open="takeoffModalVisible"
      title="一键起飞参数设置"
      :width="520"
      ok-text="确认"
      cancel-text="取消"
      @ok="confirmTakeoff"
    >
      <div class="takeoff-modal__subtitle">
        机巢：{{ currentDock?.name }} ｜ 绑定无人机：{{ currentDock?.bindDrone }}
      </div>

      <Form :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }" class="takeoff-modal__form">
        <FormItem label="目标点纬度">
          <div class="takeoff-modal__coord-row">
            <Input v-model:value="takeoffForm.targetLat" class="takeoff-modal__coord-input" />
            <Button type="primary" @click="pickOnMap">图上选点</Button>
          </div>
        </FormItem>
        <FormItem label="目标点经度">
          <Input v-model:value="takeoffForm.targetLng" />
        </FormItem>
        <FormItem label="高度(m)">
          <InputNumber v-model:value="takeoffForm.altitude" :min="10" :max="500" class="w-full" />
        </FormItem>
        <FormItem label="安全起飞高度(m)">
          <InputNumber v-model:value="takeoffForm.safeAltitude" :min="10" :max="200" class="w-full" />
        </FormItem>
        <FormItem label="返航高度(m)">
          <InputNumber v-model:value="takeoffForm.returnAltitude" :min="20" :max="500" class="w-full" />
        </FormItem>
        <FormItem label="失联动作">
          <Select v-model:value="takeoffForm.lostAction">
            <SelectOption value="返航">返航</SelectOption>
            <SelectOption value="悬停">悬停</SelectOption>
            <SelectOption value="降落">降落</SelectOption>
          </Select>
        </FormItem>
        <FormItem label="航线失联动作">
          <Select v-model:value="takeoffForm.routeLostAction">
            <SelectOption value="退出">退出</SelectOption>
            <SelectOption value="继续">继续</SelectOption>
            <SelectOption value="返航">返航</SelectOption>
          </Select>
        </FormItem>
        <FormItem label="返航模式">
          <Select v-model:value="takeoffForm.returnMode">
            <SelectOption value="设定高度">设定高度</SelectOption>
            <SelectOption value="智能高度">智能高度</SelectOption>
            <SelectOption value="原路返航">原路返航</SelectOption>
          </Select>
        </FormItem>
        <FormItem label="命令模式失联动作">
          <Select v-model:value="takeoffForm.cmdLostAction">
            <SelectOption value="继续">继续</SelectOption>
            <SelectOption value="返航">返航</SelectOption>
            <SelectOption value="悬停">悬停</SelectOption>
          </Select>
        </FormItem>
        <FormItem label="命令飞行模式">
          <Select v-model:value="takeoffForm.cmdFlightMode">
            <SelectOption value="设定高度">设定高度</SelectOption>
            <SelectOption value="地形跟随">地形跟随</SelectOption>
          </Select>
        </FormItem>
        <FormItem label="命令飞行高度(m)">
          <InputNumber v-model:value="takeoffForm.cmdFlightAlt" :min="20" :max="500" class="w-full" />
        </FormItem>
      </Form>
    </Modal>
  </fs-page>
</template>

<style scoped>
.view-mode-toggle {
  margin-right: 8px;
}

.is-card-view :deep(.fs-crud-table),
.is-card-view :deep(.fs-crud-footer) {
  display: none !important;
}

.takeoff-modal__subtitle {
  margin-bottom: 8px;
  color: #999;
  font-size: 12px;
}

.takeoff-modal__form {
  margin-top: 16px;
}

.takeoff-modal__coord-row {
  display: flex;
  gap: 8px;
}

.takeoff-modal__coord-input {
  flex: 1;
}

.w-full {
  width: 100%;
}
</style>
