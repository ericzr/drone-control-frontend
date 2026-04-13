<script lang="ts" setup name="FlightImageryPage">
import { onMounted } from 'vue';

import { useFs } from '@fast-crud/fast-crud';

import createCrudOptions from './crud';

const { crudBinding, crudRef, crudExpose } = useFs({ createCrudOptions });

onMounted(async () => {
  await crudExpose.doRefresh();
});
</script>

<template>
  <fs-page class="page-layout-card">
    <fs-crud ref="crudRef" v-bind="crudBinding" />
  </fs-page>
</template>
