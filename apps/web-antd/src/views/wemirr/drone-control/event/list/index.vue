<script lang="ts" setup name="EventListPage">
import { onMounted, ref } from 'vue';

import { useRouter } from 'vue-router';

import { useFs } from '@fast-crud/fast-crud';

import {
  Form,
  FormItem,
  Input,
  Modal,
  Select,
  SelectOption,
  message,
} from 'ant-design-vue';

import createCrudOptions from './crud';
import { createWorkorderFromEvent } from '../../_services/event-closure-store';

const router = useRouter();

const woModalVisible = ref(false);
const woForm = ref({ eventNo: '', priority: '二级', assignee: '', note: '' });

function openCreateWorkorder(row: any) {
  woForm.value = { eventNo: row.eventNo, priority: '二级', assignee: '', note: row.description || '' };
  woModalVisible.value = true;
}

function confirmCreateWorkorder() {
  if (!woForm.value.assignee) {
    message.warning('请选择责任人');
    return;
  }
  woModalVisible.value = false;
  const workorder = createWorkorderFromEvent({
    eventNo: woForm.value.eventNo,
    priority: woForm.value.priority as '一级' | '二级' | '三级',
    assignee: woForm.value.assignee,
    note: woForm.value.note,
  });
  if (!workorder) {
    message.error('未找到对应事件，无法创建工单');
    return;
  }
  message.success(`已基于事件 ${woForm.value.eventNo} 创建工单 ${workorder.id}`);
  router.push(`/event/workorder-detail?id=${workorder.id}`);
}

const { crudBinding, crudRef, crudExpose } = useFs({
  createCrudOptions,
  context: { router, openCreateWorkorder },
});

onMounted(async () => {
  await crudExpose.doRefresh();
});
</script>

<template>
  <fs-page class="page-layout-card">
    <fs-crud ref="crudRef" v-bind="crudBinding" />

    <Modal v-model:open="woModalVisible" title="转为工单" ok-text="创建工单" @ok="confirmCreateWorkorder">
      <Form layout="vertical" class="mt-2">
        <FormItem label="关联事件">
          <Input :value="woForm.eventNo" disabled />
        </FormItem>
        <FormItem label="工单优先级">
          <Select v-model:value="woForm.priority" style="width: 100%">
            <SelectOption value="一级">一级（紧急）</SelectOption>
            <SelectOption value="二级">二级（重要）</SelectOption>
            <SelectOption value="三级">三级（一般）</SelectOption>
          </Select>
        </FormItem>
        <FormItem label="责任人">
          <Select v-model:value="woForm.assignee" placeholder="选择责任人" style="width: 100%">
            <SelectOption value="张伟">张伟</SelectOption>
            <SelectOption value="李明">李明</SelectOption>
            <SelectOption value="王芳">王芳</SelectOption>
            <SelectOption value="赵强">赵强</SelectOption>
            <SelectOption value="刘洋">刘洋</SelectOption>
          </Select>
        </FormItem>
        <FormItem label="备注">
          <Input v-model:value="woForm.note" />
        </FormItem>
      </Form>
    </Modal>
  </fs-page>
</template>
