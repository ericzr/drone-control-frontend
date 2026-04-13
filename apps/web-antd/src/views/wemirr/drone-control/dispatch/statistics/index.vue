<script lang="ts" setup name="DispatchStatisticsPage">
import { Page } from '@vben/common-ui';

import { onMounted, ref } from 'vue';

import {
  Button,
  Card,
  Col,
  message,
  Progress,
  Row,
  Skeleton,
  Statistic,
  Table,
  Tag,
} from 'ant-design-vue';

function exportCsv(headers: string[], rows: string[][], filename: string) {
  const bom = '\uFEFF';
  const csv = bom + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const loading = ref(true);
onMounted(() => {
  setTimeout(() => {
    loading.value = false;
  }, 600);
});

const summaryStats = [
  { title: '本月总任务', value: 342, suffix: '个' },
  { title: '完成率', value: 94.2, suffix: '%' },
  { title: '平均响应', value: 4.6, suffix: '分钟' },
  { title: '飞行总里程', value: 1280, suffix: 'km' },
];

const byTypeData = [
  { type: '日常巡检', count: 156, rate: 96 },
  { type: '应急响应', count: 28, rate: 100 },
  { type: '定期测绘', count: 45, rate: 91 },
  { type: '专项排查', count: 68, rate: 89 },
  { type: '设备维护', count: 32, rate: 97 },
  { type: '培训飞行', count: 13, rate: 100 },
];

function handleExport() {
  exportCsv(
    ['类型', '数量', '完成率(%)'],
    byTypeData.map((d) => [d.type, String(d.count), String(d.rate)]),
    'dispatch_statistics.csv',
  );
  message.success('调度统计已导出');
}

const byDeptData = [
  { dept: '飞行一队', total: 98, done: 95, rate: 96.9 },
  { dept: '飞行二队', total: 86, done: 82, rate: 95.3 },
  { dept: '巡检组', total: 72, done: 65, rate: 90.3 },
  { dept: '应急组', total: 48, done: 48, rate: 100 },
  { dept: '培训组', total: 38, done: 32, rate: 84.2 },
];

const deptColumns = [
  { title: '部门', dataIndex: 'dept', key: 'dept' },
  { title: '总任务', dataIndex: 'total', key: 'total', align: 'right' as const },
  { title: '已完成', dataIndex: 'done', key: 'done', align: 'right' as const },
  { title: '完成率', dataIndex: 'rate', key: 'rate', align: 'right' as const },
];

const byTimeData = [
  { period: '06:00 - 08:00', count: 42, label: '早班高峰' },
  { period: '08:00 - 10:00', count: 68, label: '上午密集' },
  { period: '10:00 - 12:00', count: 55, label: '' },
  { period: '12:00 - 14:00', count: 18, label: '午间低谷' },
  { period: '14:00 - 16:00', count: 62, label: '下午密集' },
  { period: '16:00 - 18:00', count: 72, label: '下午高峰' },
  { period: '18:00 - 20:00', count: 25, label: '傍晚' },
];

const maxTimeCount = Math.max(...byTimeData.map((d) => d.count));
</script>

<template>
  <Page>
    <div class="flex flex-col gap-4 p-2">
      <Skeleton :loading="loading" active :paragraph="{ rows: 1 }">
        <Row :gutter="[16, 16]">
          <Col v-for="s in summaryStats" :key="s.title" :lg="6" :md="12" :span="24">
            <Card :bordered="false">
              <Statistic :suffix="s.suffix" :title="s.title" :value="s.value" />
            </Card>
          </Col>
        </Row>
      </Skeleton>

      <Row :gutter="[16, 16]">
        <Col :lg="12" :span="24">
          <Card :bordered="false" title="按类型统计">
            <template #extra><Button size="small" @click="handleExport">导出 CSV</Button></template>
            <div class="flex flex-col gap-3">
              <div v-for="item in byTypeData" :key="item.type" class="flex items-center gap-3">
                <span class="w-20 flex-none text-sm" style="color: var(--ant-color-text)">{{ item.type }}</span>
                <Progress :percent="item.rate" :stroke-width="12" class="flex-1" />
                <Tag>{{ item.count }} 个</Tag>
              </div>
            </div>
          </Card>
        </Col>

        <Col :lg="12" :span="24">
          <Card :bordered="false" title="按部门排行">
            <Table
              :columns="deptColumns"
              :data-source="byDeptData"
              :pagination="false"
              size="small"
              row-key="dept"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'rate'">
                  <Tag :color="record.rate >= 95 ? 'green' : record.rate >= 90 ? 'orange' : 'red'">
                    {{ record.rate }}%
                  </Tag>
                </template>
              </template>
            </Table>
          </Card>
        </Col>
      </Row>

      <Card :bordered="false" title="时段分布">
        <div class="flex flex-col gap-3">
          <div v-for="item in byTimeData" :key="item.period" class="flex items-center gap-3">
            <span class="w-28 flex-none text-xs" style="color: var(--ant-color-text-secondary)">{{ item.period }}</span>
            <div class="flex-1">
              <div
                class="rounded"
                :style="{
                  width: `${(item.count / maxTimeCount) * 100}%`,
                  height: '20px',
                  background: 'var(--ant-color-primary)',
                  opacity: 0.7 + (item.count / maxTimeCount) * 0.3,
                }"
              />
            </div>
            <span class="w-12 flex-none text-right text-sm font-semibold" style="color: var(--ant-color-text)">{{ item.count }}</span>
            <span v-if="item.label" class="w-16 flex-none text-xs" style="color: var(--ant-color-text-tertiary)">{{ item.label }}</span>
            <span v-else class="w-16 flex-none" />
          </div>
        </div>
      </Card>
    </div>
  </Page>
</template>
