<script lang="ts" setup name="PilotRosterPage">
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
</script>

<template>
  <fs-page class="page-layout-card">
    <fs-crud ref="crudRef" v-bind="crudBinding" />

    <Drawer v-model:open="detailVisible" :title="`飞手详情 - ${selectedRow?.name || ''}`" width="480" placement="right">
      <template v-if="selectedRow">
        <Descriptions bordered :column="1" size="small">
          <DescriptionsItem label="飞手编号">{{ selectedRow.code }}</DescriptionsItem>
          <DescriptionsItem label="姓名">{{ selectedRow.name }}</DescriptionsItem>
          <DescriptionsItem label="性别">{{ selectedRow.gender }}</DescriptionsItem>
          <DescriptionsItem label="联系电话">{{ selectedRow.phone }}</DescriptionsItem>
          <DescriptionsItem label="所属部门">{{ selectedRow.department }}</DescriptionsItem>
          <DescriptionsItem label="技能等级">
            <Tag :color="selectedRow.skillLevel === '专家' ? 'red' : selectedRow.skillLevel === '高级' ? 'orange' : 'blue'">{{ selectedRow.skillLevel }}</Tag>
          </DescriptionsItem>
          <DescriptionsItem label="状态">{{ selectedRow.status }}</DescriptionsItem>
          <DescriptionsItem label="飞行时长">{{ selectedRow.totalHours }} 小时</DescriptionsItem>
          <DescriptionsItem label="飞行架次">{{ selectedRow.totalSorties }} 架次</DescriptionsItem>
          <DescriptionsItem label="关联设备">{{ selectedRow.assignedDrone || '未分配' }}</DescriptionsItem>
          <DescriptionsItem label="入职日期">{{ selectedRow.createTime }}</DescriptionsItem>
        </Descriptions>
      </template>
    </Drawer>
  </fs-page>
</template>
