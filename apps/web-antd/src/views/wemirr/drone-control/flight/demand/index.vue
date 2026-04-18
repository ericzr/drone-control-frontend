<script lang="ts" setup name="FlightDemandPage">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { useFs } from '@fast-crud/fast-crud';

import { Button, Descriptions, DescriptionsItem, Drawer, Modal, Space, Tag, message } from 'ant-design-vue';

import createCrudOptions from './crud';

const router = useRouter();
const detailVisible = ref(false);
const selectedRow = ref<any>(null);

function openDetail(row: any) {
  selectedRow.value = row;
  detailVisible.value = true;
}

function approveDemand(row: any) {
  Modal.confirm({
    title: '审核需求',
    content: `确认通过「${row.title}」需求？`,
    okText: '通过',
    cancelText: '驳回',
    onOk() {
      row.status = '已通过';
      message.success(`需求「${row.title}」已审核通过`);
      crudExpose.doRefresh();
    },
    onCancel() {
      row.status = '已驳回';
      message.info(`需求「${row.title}」已驳回`);
      crudExpose.doRefresh();
    },
  });
}

function toRoute(row: any) {
  message.success(`已基于需求「${row.title}」生成航线规划`);
  router.push(`/flight/route-apply?demandId=${row.id}&demandTitle=${encodeURIComponent(row.title)}&region=${encodeURIComponent(row.region)}`);
}

function toDispatch(row: any) {
  row.status = '已派单';
  message.success(`需求「${row.title}」已创建调度任务`);
  router.push('/dispatch/task');
}

const { crudBinding, crudRef, crudExpose } = useFs({
  createCrudOptions,
  context: { openDetail, approveDemand, toRoute, toDispatch },
});

onMounted(async () => {
  await crudExpose.doRefresh();
});

function priorityColor(p: string) {
  if (p === '紧急') return 'red';
  if (p === '高') return 'orange';
  return 'blue';
}

function statusColor(s: string) {
  if (s === '待审核') return 'processing';
  if (s === '已通过') return 'cyan';
  if (s === '已派单') return 'blue';
  if (s === '已完成') return 'green';
  if (s === '已驳回') return 'red';
  return 'default';
}
</script>

<template>
  <fs-page class="page-layout-card">
    <fs-crud ref="crudRef" v-bind="crudBinding" />

    <Drawer v-model:open="detailVisible" :title="`需求详情 - ${selectedRow?.title || ''}`" width="500" placement="right">
      <template v-if="selectedRow">
        <Descriptions bordered :column="1" size="small">
          <DescriptionsItem label="需求标题">{{ selectedRow.title }}</DescriptionsItem>
          <DescriptionsItem label="提报部门">{{ selectedRow.department }}</DescriptionsItem>
          <DescriptionsItem label="提报人">{{ selectedRow.requester }}</DescriptionsItem>
          <DescriptionsItem label="目标区域">{{ selectedRow.region }}</DescriptionsItem>
          <DescriptionsItem label="需求点位">{{ selectedRow.requirePoints }}</DescriptionsItem>
          <DescriptionsItem label="时间要求">{{ selectedRow.timeRequirement }}</DescriptionsItem>
          <DescriptionsItem label="AI识别类型">{{ selectedRow.aiType }}</DescriptionsItem>
          <DescriptionsItem label="优先级">
            <Tag :color="priorityColor(selectedRow.priority)">{{ selectedRow.priority }}</Tag>
          </DescriptionsItem>
          <DescriptionsItem label="状态">
            <Tag :color="statusColor(selectedRow.status)">{{ selectedRow.status }}</Tag>
          </DescriptionsItem>
          <DescriptionsItem label="备注">{{ selectedRow.remark || '无' }}</DescriptionsItem>
          <DescriptionsItem label="创建时间">{{ selectedRow.createTime }}</DescriptionsItem>
        </Descriptions>
        <div class="mt-4">
          <Space>
            <Button v-if="selectedRow.status === '待审核'" type="primary" @click="approveDemand(selectedRow)">审核</Button>
            <Button v-if="selectedRow.status === '已通过'" type="primary" @click="toRoute(selectedRow)">生成航线</Button>
            <Button v-if="selectedRow.status === '已通过' || selectedRow.status === '已派单'" @click="toDispatch(selectedRow)">创建调度任务</Button>
          </Space>
        </div>
      </template>
    </Drawer>
  </fs-page>
</template>
