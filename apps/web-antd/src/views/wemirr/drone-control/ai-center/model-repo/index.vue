<script lang="ts" setup name="AiModelRepoPage">
import { onMounted, ref } from 'vue';

import { useFs } from '@fast-crud/fast-crud';

import { Descriptions, DescriptionsItem, Drawer, Tag } from 'ant-design-vue';

import createCrudOptions from './crud';

const detailVisible = ref(false);
const selectedRow = ref<any>(null);

function openDetail(row: any) {
  selectedRow.value = row;
  detailVisible.value = true;
}

const { crudBinding, crudRef, crudExpose } = useFs({
  createCrudOptions,
  context: { openDetail },
});

onMounted(async () => {
  await crudExpose.doRefresh();
});

function statusColor(s: string) {
  if (s === '已发布') return 'green';
  if (s === '训练中') return 'blue';
  return 'default';
}

function spectrumColor(s: string) {
  if (s === 'visible') return 'blue';
  if (s === 'infrared') return 'red';
  if (s === 'multispectral') return 'purple';
  return 'default';
}

function spectrumLabel(s: string) {
  const map: Record<string, string> = { visible: '可见光（RGB）', infrared: '红外热成像', multispectral: '多光谱', sar: 'SAR 雷达' };
  return map[s] || s;
}

function inputSourceLabel(s: string) {
  const map: Record<string, string> = { image: '图片', video: '视频', stream: '实时流', all: '全类型' };
  return map[s] || s;
}

function sceneLabel(s: string) {
  const map: Record<string, string> = { traffic: '交通巡查', 'forest-fire': '森林防火', construction: '安全生产', environment: '环境监测', solar: '光伏巡检', 'city-admin': '城市管理', water: '水域监测' };
  return map[s] || s;
}
</script>

<template>
  <fs-page class="page-layout-card">
    <fs-crud ref="crudRef" v-bind="crudBinding" />

    <Drawer v-model:open="detailVisible" :title="`模型详情 - ${selectedRow?.displayName || ''}`" width="500" placement="right">
      <template v-if="selectedRow">
        <Descriptions bordered :column="1" size="small">
          <DescriptionsItem label="模型标识">{{ selectedRow.name }}</DescriptionsItem>
          <DescriptionsItem label="模型名称">{{ selectedRow.displayName }}</DescriptionsItem>
          <DescriptionsItem label="模型类型">{{ selectedRow.modelType }}</DescriptionsItem>
          <DescriptionsItem label="光谱类型">
            <Tag :color="spectrumColor(selectedRow.spectrum)" size="small">{{ spectrumLabel(selectedRow.spectrum) }}</Tag>
          </DescriptionsItem>
          <DescriptionsItem label="输入源">{{ inputSourceLabel(selectedRow.inputSource) }}</DescriptionsItem>
          <DescriptionsItem label="应用场景">{{ sceneLabel(selectedRow.scene) }}</DescriptionsItem>
          <DescriptionsItem label="框架">{{ selectedRow.framework }}</DescriptionsItem>
          <DescriptionsItem label="版本">{{ selectedRow.version }}</DescriptionsItem>
          <DescriptionsItem label="训练数据集">{{ selectedRow.dataset }}</DescriptionsItem>
          <DescriptionsItem label="mAP@50">{{ selectedRow.mAP50 > 0 ? selectedRow.mAP50 : '-' }}</DescriptionsItem>
          <DescriptionsItem label="mAP@50:95">{{ selectedRow.mAP5095 > 0 ? selectedRow.mAP5095 : '-' }}</DescriptionsItem>
          <DescriptionsItem label="FPS">{{ selectedRow.fps }}</DescriptionsItem>
          <DescriptionsItem label="模型大小">{{ selectedRow.modelSize }}</DescriptionsItem>
          <DescriptionsItem label="状态">
            <Tag :color="statusColor(selectedRow.status)">{{ selectedRow.status }}</Tag>
          </DescriptionsItem>
          <DescriptionsItem label="创建者">{{ selectedRow.creator }}</DescriptionsItem>
          <DescriptionsItem label="创建时间">{{ selectedRow.createTime }}</DescriptionsItem>
        </Descriptions>
      </template>
    </Drawer>
  </fs-page>
</template>
