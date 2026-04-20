<script lang="ts" setup name="DispatchImageryPage">
import { onMounted, ref } from 'vue';

import { useFs } from '@fast-crud/fast-crud';

import { Descriptions, DescriptionsItem, Drawer } from 'ant-design-vue';

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
</script>

<template>
  <fs-page class="page-layout-card">
    <fs-crud ref="crudRef" v-bind="crudBinding" />

    <Drawer v-model:open="detailVisible" :title="`影像详情 - ${selectedRow?.taskName || ''}`" width="480" placement="right">
      <template v-if="selectedRow">
        <Descriptions bordered :column="1" size="small">
          <DescriptionsItem label="任务名称">{{ selectedRow.taskName }}</DescriptionsItem>
          <DescriptionsItem label="飞行日期">{{ selectedRow.flightDate }}</DescriptionsItem>
          <DescriptionsItem label="执行设备">{{ selectedRow.drone }}</DescriptionsItem>
          <DescriptionsItem label="飞手">{{ selectedRow.pilot }}</DescriptionsItem>
          <DescriptionsItem label="影像类型">{{ selectedRow.imageryType }}</DescriptionsItem>
          <DescriptionsItem label="照片数">{{ selectedRow.photoCount }} 张</DescriptionsItem>
          <DescriptionsItem label="航点数">{{ selectedRow.waypoints }} 个</DescriptionsItem>
          <DescriptionsItem label="覆盖范围">{{ selectedRow.coverage }}</DescriptionsItem>
          <DescriptionsItem label="飞行时长">{{ selectedRow.duration }}</DescriptionsItem>
          <DescriptionsItem label="数据量">{{ selectedRow.fileSize }}</DescriptionsItem>
        </Descriptions>
      </template>
    </Drawer>
  </fs-page>
</template>
