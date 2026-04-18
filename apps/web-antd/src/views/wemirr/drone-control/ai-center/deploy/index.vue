<script lang="ts" setup name="AiDeployPage">
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
  if (s === '运行中') return 'green';
  if (s === '部署中') return 'blue';
  if (s === '已停止') return 'red';
  return 'default';
}
</script>

<template>
  <fs-page class="page-layout-card">
    <fs-crud ref="crudRef" v-bind="crudBinding" />

    <Drawer v-model:open="detailVisible" :title="`部署详情 - ${selectedRow?.serviceName || ''}`" width="500" placement="right">
      <template v-if="selectedRow">
        <Descriptions bordered :column="1" size="small">
          <DescriptionsItem label="服务名称">{{ selectedRow.serviceName }}</DescriptionsItem>
          <DescriptionsItem label="关联模型">{{ selectedRow.modelName }}</DescriptionsItem>
          <DescriptionsItem label="模型类型">{{ selectedRow.modelType }}</DescriptionsItem>
          <DescriptionsItem label="推理引擎">{{ selectedRow.inference }}</DescriptionsItem>
          <DescriptionsItem label="部署设备">{{ selectedRow.device }}</DescriptionsItem>
          <DescriptionsItem label="副本数">{{ selectedRow.replicas }}</DescriptionsItem>
          <DescriptionsItem label="状态">
            <Tag :color="statusColor(selectedRow.status)">{{ selectedRow.status }}</Tag>
          </DescriptionsItem>
          <DescriptionsItem label="QPS">{{ selectedRow.qps }}</DescriptionsItem>
          <DescriptionsItem label="平均延迟">{{ selectedRow.avgLatency }} ms</DescriptionsItem>
          <DescriptionsItem label="GPU 使用率">{{ selectedRow.gpuUsage }}%</DescriptionsItem>
          <DescriptionsItem label="API 端点">{{ selectedRow.apiEndpoint }}</DescriptionsItem>
          <DescriptionsItem label="运行时间">{{ selectedRow.uptime }}</DescriptionsItem>
          <DescriptionsItem label="创建时间">{{ selectedRow.createTime }}</DescriptionsItem>
        </Descriptions>
      </template>
    </Drawer>
  </fs-page>
</template>
