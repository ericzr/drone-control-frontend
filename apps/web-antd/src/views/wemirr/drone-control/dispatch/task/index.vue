<script lang="ts" setup name="DispatchTaskPage">
import { Page } from '@vben/common-ui';

import { computed, ref } from 'vue';

import {
  Button,
  Card,
  Col,
  Descriptions,
  DescriptionsItem,
  Drawer,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Timeline,
  message,
} from 'ant-design-vue';

const stats = [
  { title: '排队中', value: 5, suffix: '个' },
  { title: '执行中', value: 3, suffix: '个' },
  { title: '今日完成', value: 28, suffix: '个' },
  { title: '今日取消', value: 2, suffix: '个' },
];

const taskColumns = [
  { title: '任务名称', dataIndex: 'name', key: 'name', width: 180 },
  { title: '任务类型', dataIndex: 'type', key: 'type', width: 100 },
  { title: '执行机场', dataIndex: 'airport', key: 'airport', width: 150 },
  { title: '执行无人机', dataIndex: 'drone', key: 'drone', width: 150 },
  { title: '优先级', dataIndex: 'priority', key: 'priority', width: 90 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '计划时间', dataIndex: 'schedule', key: 'schedule', width: 140 },
  { title: '操作', dataIndex: 'action', key: 'action', width: 200 },
];

const tasks = ref([
  { key: '1', name: '高新主干道日巡', type: '定时', airport: '高新区一号机场', drone: 'M300-01', priority: '普通', status: '执行中', schedule: '14:20 - 15:00', aiPolicy: '违停识别', progress: 72 },
  { key: '2', name: '城管全覆盖巡查', type: '定时', airport: '城管巡检机场', drone: 'M300-07', priority: '普通', status: '执行中', schedule: '14:35 - 15:20', aiPolicy: '占道检测', progress: 45 },
  { key: '3', name: '生态水域巡查', type: '定时', airport: '生态园区机场', drone: 'M350-03', priority: '普通', status: '执行中', schedule: '14:00 - 14:55', aiPolicy: '漂浮物识别', progress: 95 },
  { key: '4', name: '沿河排污口核查', type: '应急', airport: '水务巡检机场', drone: 'M30-06', priority: '高', status: '排队中', schedule: '15:10', aiPolicy: '排污口比对', progress: 0 },
  { key: '5', name: '林草热成像巡检', type: '应急', airport: '林草防火机场', drone: 'M30T-02', priority: '紧急', status: '排队中', schedule: '15:20', aiPolicy: '烟火识别', progress: 0 },
  { key: '6', name: '交通晚高峰监测', type: '定时', airport: '交通主干道机场', drone: 'FP-04', priority: '普通', status: '排队中', schedule: '17:30', aiPolicy: '车流统计', progress: 0 },
  { key: '7', name: '光伏园区测绘', type: '待命', airport: '光伏园区机场', drone: 'T40-08', priority: '普通', status: '排队中', schedule: '待定', aiPolicy: '热斑检测', progress: 0 },
  { key: '8', name: '林区周界巡检', type: '定时', airport: '林草防火机场', drone: 'M30T-02', priority: '普通', status: '排队中', schedule: '明日 06:00', aiPolicy: '周界识别', progress: 0 },
  { key: '9', name: '高新路口违停抓拍', type: '定时', airport: '高新区一号机场', drone: 'M300-01', priority: '普通', status: '已完成', schedule: '08:30 - 09:10', aiPolicy: '违停识别', progress: 100 },
  { key: '10', name: '林草晨巡', type: '定时', airport: '林草防火机场', drone: 'M30T-02', priority: '普通', status: '已完成', schedule: '06:00 - 06:45', aiPolicy: '烟火识别', progress: 100 },
]);

const selectedStatus = ref('全部');
const statusOptions = [
  { label: '全部', value: '全部' },
  { label: '执行中', value: '执行中' },
  { label: '排队中', value: '排队中' },
  { label: '已完成', value: '已完成' },
];

const filteredTasks = computed(() => {
  if (selectedStatus.value === '全部') return tasks.value;
  return tasks.value.filter((t) => t.status === selectedStatus.value);
});

const detailOpen = ref(false);
const selectedTask = ref<(typeof tasks.value)[0] | null>(null);

const dispatchLog = ref([
  { time: '14:42', content: 'M300-01 违停告警 → 已推送城管联动', color: 'red' as const },
  { time: '14:38', content: 'M300-07 航线进度 45%，资源正常', color: 'blue' as const },
  { time: '14:35', content: '城管全覆盖巡查已自动起飞', color: 'green' as const },
  { time: '14:20', content: '高新主干道日巡已起飞', color: 'green' as const },
  { time: '14:15', content: '沿河排污口核查进入排队队列（优先级：高）', color: 'orange' as const },
  { time: '14:05', content: 'M350-03 低电量返航，资源释放中', color: 'orange' as const },
]);

function getPriorityColor(p: string) {
  if (p === '紧急') return 'red';
  if (p === '高') return 'orange';
  return 'blue';
}

function getStatusColor(s: string) {
  if (s === '执行中') return 'processing';
  if (s === '排队中') return 'warning';
  if (s === '已完成') return 'success';
  return 'default';
}

function openDetail(record: any) {
  selectedTask.value = record;
  detailOpen.value = true;
}
</script>

<template>
  <Page :auto-content-height="true">
    <div class="flex flex-col gap-4 p-2">
      <Row :gutter="[16, 16]">
        <Col v-for="item in stats" :key="item.title" :lg="6" :md="12" :span="24">
          <Card :bordered="false">
            <Statistic :suffix="item.suffix" :title="item.title" :value="item.value" />
          </Card>
        </Col>
      </Row>

      <Row :gutter="[16, 16]">
        <Col :xl="16" :span="24">
          <Card :bordered="false" title="任务调度队列">
            <template #extra>
              <Space>
                <Select v-model:value="selectedStatus" :options="statusOptions" style="width: 120px" />
                <Button type="primary" @click="message.info('新建调度任务占位')">新建调度</Button>
              </Space>
            </template>
            <Table
              :columns="taskColumns"
              :data-source="filteredTasks"
              :pagination="{ pageSize: 8 }"
              row-key="key"
              size="small"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'priority'">
                  <Tag :color="getPriorityColor(record.priority)">{{ record.priority }}</Tag>
                </template>
                <template v-else-if="column.key === 'status'">
                  <Tag :color="getStatusColor(record.status)">{{ record.status }}</Tag>
                </template>
                <template v-else-if="column.key === 'action'">
                  <Space>
                    <Button size="small" type="link" @click="openDetail(record)">详情</Button>
                    <Button
                      v-if="record.status === '排队中'"
                      size="small"
                      type="link"
                      @click="message.success(`已提升"${record.name}"优先级`)"
                    >
                      提升优先级
                    </Button>
                    <Button
                      v-if="record.status === '执行中'"
                      size="small"
                      type="link"
                      danger
                      @click="message.warning(`已发送"${record.drone}"返航指令`)"
                    >
                      一键返航
                    </Button>
                    <Button
                      v-if="record.status === '排队中'"
                      size="small"
                      type="link"
                      danger
                      @click="message.info(`已取消"${record.name}"`)"
                    >
                      取消
                    </Button>
                  </Space>
                </template>
              </template>
            </Table>
          </Card>
        </Col>

        <Col :xl="8" :span="24">
          <Card :bordered="false" title="调度事件流">
            <Timeline>
              <Timeline.Item
                v-for="item in dispatchLog"
                :key="item.time + item.content"
                :color="item.color"
              >
                <div class="text-xs text-slate-400">{{ item.time }}</div>
                <div class="text-sm text-slate-700 dark:text-slate-300">{{ item.content }}</div>
              </Timeline.Item>
            </Timeline>
          </Card>
        </Col>
      </Row>

      <Drawer v-model:open="detailOpen" title="调度任务详情" width="400" placement="right">
        <template v-if="selectedTask">
          <Descriptions :column="1" bordered size="small">
            <DescriptionsItem label="任务名称">{{ selectedTask.name }}</DescriptionsItem>
            <DescriptionsItem label="任务类型">{{ selectedTask.type }}</DescriptionsItem>
            <DescriptionsItem label="执行机场">{{ selectedTask.airport }}</DescriptionsItem>
            <DescriptionsItem label="执行无人机">{{ selectedTask.drone }}</DescriptionsItem>
            <DescriptionsItem label="优先级">
              <Tag :color="getPriorityColor(selectedTask.priority)">{{ selectedTask.priority }}</Tag>
            </DescriptionsItem>
            <DescriptionsItem label="状态">
              <Tag :color="getStatusColor(selectedTask.status)">{{ selectedTask.status }}</Tag>
            </DescriptionsItem>
            <DescriptionsItem label="计划时间">{{ selectedTask.schedule }}</DescriptionsItem>
            <DescriptionsItem label="AI 策略">{{ selectedTask.aiPolicy }}</DescriptionsItem>
          </Descriptions>
          <div class="mt-4 flex gap-2">
            <Button type="primary" @click="message.info('任务下发占位')">立即下发</Button>
            <Button @click="message.info('编辑任务占位')">编辑</Button>
          </div>
        </template>
      </Drawer>
    </div>
  </Page>
</template>
