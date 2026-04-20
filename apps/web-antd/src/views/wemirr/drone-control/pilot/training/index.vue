<script lang="ts" setup name="PilotTrainingPage">
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
  if (s === '已完成') return 'green';
  if (s === '进行中') return 'blue';
  return 'default';
}
</script>

<template>
  <fs-page class="page-layout-card">
    <fs-crud ref="crudRef" v-bind="crudBinding" />

    <Drawer v-model:open="detailVisible" :title="`培训详情 - ${selectedRow?.title || ''}`" width="480" placement="right">
      <template v-if="selectedRow">
        <Descriptions bordered :column="1" size="small">
          <DescriptionsItem label="培训主题">{{ selectedRow.title }}</DescriptionsItem>
          <DescriptionsItem label="培训类型">{{ selectedRow.type }}</DescriptionsItem>
          <DescriptionsItem label="培训讲师">{{ selectedRow.trainer }}</DescriptionsItem>
          <DescriptionsItem label="参训人数">{{ selectedRow.participants }} 人</DescriptionsItem>
          <DescriptionsItem label="学时">{{ selectedRow.hours }} 小时</DescriptionsItem>
          <DescriptionsItem label="开始日期">{{ selectedRow.startDate }}</DescriptionsItem>
          <DescriptionsItem label="结束日期">{{ selectedRow.endDate }}</DescriptionsItem>
          <DescriptionsItem label="培训地点">{{ selectedRow.location }}</DescriptionsItem>
          <DescriptionsItem label="状态">
            <Tag :color="statusColor(selectedRow.status)">{{ selectedRow.status }}</Tag>
          </DescriptionsItem>
          <DescriptionsItem label="培训内容">{{ selectedRow.content }}</DescriptionsItem>
        </Descriptions>
      </template>
    </Drawer>
  </fs-page>
</template>
