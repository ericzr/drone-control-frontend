<script lang="ts" setup name="DeviceUavPage">
import { onMounted, ref } from 'vue';

import { Spin } from 'ant-design-vue';

import { useFs } from '@fast-crud/fast-crud';

import createCrudOptions from './crud';

const { crudBinding, crudRef, crudExpose } = useFs({ createCrudOptions });

const loading = ref(true);
onMounted(async () => {
  await crudExpose.doRefresh();
  loading.value = false;
});
</script>

<template>
  <fs-page class="page-layout-card">
    <Spin :spinning="loading">
      <fs-crud ref="crudRef" v-bind="crudBinding" />
    </Spin>
  </fs-page>
</template>
