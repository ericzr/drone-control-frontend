<script lang="ts" setup name="FlightRouteApplyPage">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { useFs } from '@fast-crud/fast-crud';

import { Alert, Button, Descriptions, DescriptionsItem, Drawer, Space, Tag, message } from 'ant-design-vue';

import createCrudOptions from './crud';

const route = useRoute();
const router = useRouter();

const fromDemand = !!route.query.demandId;
const demandTitle = decodeURIComponent((route.query.demandTitle as string) || '');
const demandRegion = decodeURIComponent((route.query.region as string) || '');

const detailVisible = ref(false);
const selectedRow = ref<any>(null);

function openDetail(row: any) {
  selectedRow.value = row;
  detailVisible.value = true;
}

function createDispatchFromRoute(row: any) {
  message.success(`已基于航线「${row.routeName}」创建调度任务`);
  router.push('/dispatch/task');
}

const { crudBinding, crudRef, crudExpose } = useFs({
  createCrudOptions,
  context: { openDetail, createDispatchFromRoute },
});

onMounted(async () => {
  await crudExpose.doRefresh();
});

function statusColor(s: string) {
  if (s === '已批准') return 'green';
  if (s === '待审批') return 'blue';
  if (s === '已驳回') return 'red';
  return 'default';
}
</script>

<template>
  <fs-page class="page-layout-card">
    <Alert
      v-if="fromDemand"
      type="info"
      show-icon
      closable
      class="mb-3"
      :message="`来自飞行需求「${demandTitle}」· 区域: ${demandRegion}，请新建或选择航线关联。`"
    />
    <fs-crud ref="crudRef" v-bind="crudBinding" />

    <Drawer v-model:open="detailVisible" :title="`航线申请详情 - ${selectedRow?.applyNo || ''}`" width="500" placement="right">
      <template v-if="selectedRow">
        <Descriptions bordered :column="1" size="small">
          <DescriptionsItem label="申请编号">{{ selectedRow.applyNo }}</DescriptionsItem>
          <DescriptionsItem label="航线名称">{{ selectedRow.routeName }}</DescriptionsItem>
          <DescriptionsItem label="空域类型">{{ selectedRow.airspaceType }}</DescriptionsItem>
          <DescriptionsItem label="飞行目的">{{ selectedRow.purpose }}</DescriptionsItem>
          <DescriptionsItem label="飞手">{{ selectedRow.pilot }} ({{ selectedRow.pilotCode }})</DescriptionsItem>
          <DescriptionsItem label="执行设备">{{ selectedRow.drone }}</DescriptionsItem>
          <DescriptionsItem label="最大高度">{{ selectedRow.maxAlt }} m</DescriptionsItem>
          <DescriptionsItem label="飞行日期">{{ selectedRow.flightDate }}</DescriptionsItem>
          <DescriptionsItem label="飞行时段">{{ selectedRow.startTime }} - {{ selectedRow.endTime }}</DescriptionsItem>
          <DescriptionsItem label="飞行区域">{{ selectedRow.area }}</DescriptionsItem>
          <DescriptionsItem label="状态">
            <Tag :color="statusColor(selectedRow.status)">{{ selectedRow.status }}</Tag>
          </DescriptionsItem>
          <DescriptionsItem label="审批人">{{ selectedRow.approver || '待审批' }}</DescriptionsItem>
          <DescriptionsItem label="备注">{{ selectedRow.remark || '无' }}</DescriptionsItem>
          <DescriptionsItem label="申请时间">{{ selectedRow.createTime }}</DescriptionsItem>
        </Descriptions>
        <div class="mt-4">
          <Space>
            <Button v-if="selectedRow.status === '已批准'" type="primary" @click="createDispatchFromRoute(selectedRow)">创建调度任务</Button>
          </Space>
        </div>
      </template>
    </Drawer>
  </fs-page>
</template>
