<script lang="ts" setup name="PilotCertificatePage">
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
  if (s === '有效') return 'green';
  if (s === '即将过期') return 'orange';
  return 'red';
}
</script>

<template>
  <fs-page class="page-layout-card">
    <fs-crud ref="crudRef" v-bind="crudBinding" />

    <Drawer v-model:open="detailVisible" :title="`证书详情 - ${selectedRow?.licenseNo || ''}`" width="480" placement="right">
      <template v-if="selectedRow">
        <Descriptions bordered :column="1" size="small">
          <DescriptionsItem label="飞手姓名">{{ selectedRow.pilotName }}</DescriptionsItem>
          <DescriptionsItem label="飞手编号">{{ selectedRow.pilotCode }}</DescriptionsItem>
          <DescriptionsItem label="证书类型">{{ selectedRow.licenseType }}</DescriptionsItem>
          <DescriptionsItem label="证书编号">{{ selectedRow.licenseNo }}</DescriptionsItem>
          <DescriptionsItem label="发证机关">{{ selectedRow.issuer }}</DescriptionsItem>
          <DescriptionsItem label="发证日期">{{ selectedRow.issueDate }}</DescriptionsItem>
          <DescriptionsItem label="有效期至">{{ selectedRow.expiryDate }}</DescriptionsItem>
          <DescriptionsItem label="状态">
            <Tag :color="statusColor(selectedRow.status)">{{ selectedRow.status }}</Tag>
          </DescriptionsItem>
        </Descriptions>
      </template>
    </Drawer>
  </fs-page>
</template>
