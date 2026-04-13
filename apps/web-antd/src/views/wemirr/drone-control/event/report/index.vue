<script lang="ts" setup name="EventReportPage">
import { Page } from '@vben/common-ui';

import { ref } from 'vue';

import {
  Button,
  Card,
  Col,
  DatePicker,
  Descriptions,
  DescriptionsItem,
  Row,
  Select,
  SelectOption,
  Space,
  Statistic,
  Table,
  Tag,
  message,
} from 'ant-design-vue';

const reportRange = ref('month');
const reportDept = ref('all');

const summary = [
  { title: '事件总数', value: 156 },
  { title: '已闭环', value: 138 },
  { title: '闭环率', value: '88.5%' },
  { title: '平均处理时长', value: '2.4h' },
];

const bySceneData = [
  { scene: '森林防火', total: 28, closed: 25, rate: 89.3, avgTime: '1.8h' },
  { scene: '交通巡查', total: 42, closed: 39, rate: 92.9, avgTime: '1.2h' },
  { scene: '市政巡检', total: 35, closed: 30, rate: 85.7, avgTime: '3.1h' },
  { scene: '环境监测', total: 18, closed: 15, rate: 83.3, avgTime: '2.8h' },
  { scene: '安全生产', total: 22, closed: 20, rate: 90.9, avgTime: '1.5h' },
  { scene: '光伏巡检', total: 8, closed: 7, rate: 87.5, avgTime: '4.2h' },
  { scene: '热力巡检', total: 3, closed: 2, rate: 66.7, avgTime: '5.0h' },
];

const sceneColumns = [
  { title: '应用场景', dataIndex: 'scene', key: 'scene' },
  { title: '事件总数', dataIndex: 'total', key: 'total', align: 'right' as const },
  { title: '已闭环', dataIndex: 'closed', key: 'closed', align: 'right' as const },
  { title: '闭环率', dataIndex: 'rate', key: 'rate', align: 'right' as const },
  { title: '平均处理时长', dataIndex: 'avgTime', key: 'avgTime', align: 'right' as const },
];

function handleExport() {
  message.success('报告导出中，请稍候...');
}
</script>

<template>
  <Page>
    <div class="flex flex-col gap-4 p-2">
      <Card :bordered="false" title="事件报告">
        <template #extra>
          <Space>
            <Select v-model:value="reportRange" style="width: 100px" size="small">
              <SelectOption value="week">本周</SelectOption>
              <SelectOption value="month">本月</SelectOption>
              <SelectOption value="quarter">本季度</SelectOption>
              <SelectOption value="year">本年</SelectOption>
            </Select>
            <Select v-model:value="reportDept" style="width: 120px" size="small">
              <SelectOption value="all">全部部门</SelectOption>
              <SelectOption value="team1">飞行一队</SelectOption>
              <SelectOption value="team2">飞行二队</SelectOption>
              <SelectOption value="inspect">巡检组</SelectOption>
            </Select>
            <Button type="primary" size="small" @click="handleExport">
              导出报告
            </Button>
          </Space>
        </template>

        <Row :gutter="[16, 16]">
          <Col v-for="s in summary" :key="s.title" :lg="6" :md="12" :span="24">
            <div class="stat-box">
              <div class="stat-box__title">{{ s.title }}</div>
              <div class="stat-box__value">{{ s.value }}</div>
            </div>
          </Col>
        </Row>
      </Card>

      <Card :bordered="false" title="按场景统计">
        <Table
          :columns="sceneColumns"
          :data-source="bySceneData"
          :pagination="false"
          size="small"
          row-key="scene"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'rate'">
              <Tag :color="record.rate >= 90 ? 'green' : record.rate >= 80 ? 'orange' : 'red'">
                {{ record.rate }}%
              </Tag>
            </template>
          </template>
        </Table>
      </Card>

      <Card :bordered="false" title="报告说明">
        <Descriptions :column="2" bordered size="small">
          <DescriptionsItem label="报告周期">2026 年 4 月</DescriptionsItem>
          <DescriptionsItem label="生成时间">2026-04-13 23:59</DescriptionsItem>
          <DescriptionsItem label="数据范围">全部部门、全部场景</DescriptionsItem>
          <DescriptionsItem label="生成方式">系统自动</DescriptionsItem>
          <DescriptionsItem label="导出格式" :span="2">支持 PDF / Excel / Word</DescriptionsItem>
        </Descriptions>
      </Card>
    </div>
  </Page>
</template>

<style lang="less" scoped>
.stat-box {
  padding: 16px;
  border-radius: 8px;
  background: var(--ant-color-bg-layout);
  text-align: center;
}

.stat-box__title {
  font-size: 12px;
  color: var(--ant-color-text-tertiary);
}

.stat-box__value {
  margin-top: 8px;
  font-size: 24px;
  font-weight: 700;
  color: var(--ant-color-text);
  font-variant-numeric: tabular-nums;
}
</style>
