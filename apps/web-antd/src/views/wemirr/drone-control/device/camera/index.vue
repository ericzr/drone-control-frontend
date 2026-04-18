<script lang="ts" setup name="DeviceCameraPage">
import { computed, onMounted, ref } from 'vue';

import { useRouter } from 'vue-router';

import { useFs } from '@fast-crud/fast-crud';
import { Radio, RadioGroup } from 'ant-design-vue';

import DeviceCardView from '../components/DeviceCardView.vue';
import type { DeviceCardAction, DeviceCardField } from '../components/DeviceCardView.vue';
import createCrudOptions from './crud';

const router = useRouter();
const viewMode = ref<'list' | 'card'>('list');

const { crudBinding, crudRef, crudExpose } = useFs({
  createCrudOptions,
  context: { router },
});

onMounted(async () => {
  await crudExpose.doRefresh();
});

const cardData = computed(() => {
  const binding = crudBinding.value as any;
  return binding?.data ?? binding?.table?.data ?? [];
});

const cardFields: DeviceCardField[] = [
  { key: 'sn', label: '序列号' },
  { key: 'cameraType', label: '摄像头类型' },
  { key: 'protocol', label: '接入协议' },
  { key: 'ip', label: 'IP 地址' },
  { key: 'resolution', label: '分辨率' },
  { key: 'region', label: '区域' },
];

const cardActions: DeviceCardAction[] = [
  {
    label: '详情',
    type: 'link',
    onClick: (row) => router.push(`/device/detail?id=${row.id}`),
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
          battery-key=""
          icon="📷"
          :fields="cardFields"
          :actions="cardActions"
        />
      </template>
    </fs-crud>
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
</style>
