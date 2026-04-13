<script lang="ts" setup name="FlightOperationPage">
import { Page } from '@vben/common-ui';

import { ref } from 'vue';

import {
  Badge,
  Button,
  Card,
  Col,
  Descriptions,
  DescriptionsItem,
  Progress,
  Row,
  Space,
  Statistic,
  Table,
  Tag,
  Timeline,
  message,
} from 'ant-design-vue';

const stats = [
  { title: '正在执行', value: 3, suffix: '架次' },
  { title: '排队等待', value: 5, suffix: '架次' },
  { title: '今日完成', value: 28, suffix: '架次' },
  { title: '异常中断', value: 1, suffix: '架次' },
];

const activeFlights = ref([
  {
    key: '1',
    drone: '大航蜂 M300-01',
    mission: '高新区主干道日巡',
    airport: '高新区一号机场',
    status: '飞行中',
    progress: 72,
    battery: 64,
    altitude: 118,
    speed: 9.8,
    startTime: '14:20',
    eta: '14:58',
  },
  {
    key: '2',
    drone: '大航蜂 M300-07',
    airport: '城管巡检机场',
    mission: '城管全覆盖巡查',
    status: '飞行中',
    progress: 45,
    battery: 78,
    altitude: 100,
    speed: 8.2,
    startTime: '14:35',
    eta: '15:20',
  },
  {
    key: '3',
    drone: '大航蜂 M350-03',
    airport: '生态园区机场',
    mission: '生态园区水域巡查',
    status: '返航中',
    progress: 95,
    battery: 32,
    altitude: 60,
    speed: 12.0,
    startTime: '14:00',
    eta: '14:52',
  },
]);

const flightColumns = [
  { title: '执行无人机', dataIndex: 'drone', key: 'drone', width: 160 },
  { title: '当前任务', dataIndex: 'mission', key: 'mission', width: 180 },
  { title: '执行机场', dataIndex: 'airport', key: 'airport', width: 150 },
  { title: '飞行状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '航线进度', dataIndex: 'progress', key: 'progress', width: 160 },
  { title: '电量', dataIndex: 'battery', key: 'battery', width: 90 },
  { title: '高度(m)', dataIndex: 'altitude', key: 'altitude', width: 90 },
  { title: '速度(m/s)', dataIndex: 'speed', key: 'speed', width: 100 },
  { title: '操作', dataIndex: 'action', key: 'action', width: 180 },
];

const queueList = ref([
  { key: 'q1', mission: '沿河排污口应急核查', drone: '大航蜂 M30-06', priority: '高', eta: '15:10' },
  { key: 'q2', mission: '林草防火热成像巡检', drone: '大航蜂 M30T-02', priority: '紧急', eta: '15:20' },
  { key: 'q3', mission: '交通晚高峰监测', drone: '大航蜂 FP-04', priority: '普通', eta: '17:30' },
  { key: 'q4', mission: '光伏园区测绘', drone: '大航蜂 T40-08', priority: '普通', eta: '待定' },
  { key: 'q5', mission: '林区周界定时巡检', drone: '大航蜂 M30T-02', priority: '普通', eta: '明日 06:00' },
]);

const eventLog = ref([
  { time: '14:42', content: 'M300-01 回传违停识别告警（高新路口）', color: 'red' as const },
  { time: '14:38', content: 'M300-07 航线执行进度 45%', color: 'blue' as const },
  { time: '14:35', content: '城管巡检任务自动起飞', color: 'green' as const },
  { time: '14:31', content: 'M300-01 完成第5航点 / 共12航点', color: 'blue' as const },
  { time: '14:20', content: '高新主干道日巡任务起飞成功', color: 'green' as const },
  { time: '14:05', content: 'M350-03 低电量触发返航策略', color: 'orange' as const },
  { time: '14:00', content: '生态水域巡查任务起飞成功', color: 'green' as const },
]);

const selectedFlight = ref(activeFlights.value[0]);

function getPriorityColor(p: string) {
  if (p === '紧急') return 'red';
  if (p === '高') return 'orange';
  return 'blue';
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

      <Card :bordered="false" title="实时飞行监控">
        <Table
          :columns="flightColumns"
          :data-source="activeFlights"
          :pagination="false"
          row-key="key"
          size="middle"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'status'">
              <Badge
                :status="record.status === '返航中' ? 'warning' : 'processing'"
                :text="record.status"
              />
            </template>
            <template v-else-if="column.key === 'progress'">
              <Progress
                :percent="record.progress"
                :status="record.progress >= 90 ? 'success' : 'active'"
                size="small"
              />
            </template>
            <template v-else-if="column.key === 'battery'">
              <span :class="record.battery < 30 ? 'text-red-500 font-bold' : ''">
                {{ record.battery }}%
              </span>
            </template>
            <template v-else-if="column.key === 'action'">
              <Space>
                <Button size="small" type="link" @click="selectedFlight = record; message.info(`已聚焦 ${record.drone}`)">
                  聚焦
                </Button>
                <Button size="small" type="link" @click="message.success(`已发送 ${record.drone} 返航指令`)">
                  一键返航
                </Button>
              </Space>
            </template>
          </template>
        </Table>
      </Card>

      <Row :gutter="[16, 16]">
        <Col :xl="8" :span="24">
          <Card :bordered="false" title="飞行器状态">
            <template v-if="selectedFlight">
              <Descriptions :column="1" bordered size="small">
                <DescriptionsItem label="无人机">{{ selectedFlight.drone }}</DescriptionsItem>
                <DescriptionsItem label="当前任务">{{ selectedFlight.mission }}</DescriptionsItem>
                <DescriptionsItem label="执行机场">{{ selectedFlight.airport }}</DescriptionsItem>
                <DescriptionsItem label="飞行高度">{{ selectedFlight.altitude }} m</DescriptionsItem>
                <DescriptionsItem label="飞行速度">{{ selectedFlight.speed }} m/s</DescriptionsItem>
                <DescriptionsItem label="剩余电量">
                  <Progress :percent="selectedFlight.battery" :status="selectedFlight.battery < 30 ? 'exception' : 'active'" size="small" />
                </DescriptionsItem>
                <DescriptionsItem label="航线进度">
                  <Progress :percent="selectedFlight.progress" size="small" />
                </DescriptionsItem>
                <DescriptionsItem label="预计完成">{{ selectedFlight.eta }}</DescriptionsItem>
              </Descriptions>
              <div class="mt-3 flex gap-2">
                <Button type="primary" @click="message.info('虚拟驾驶舱入口占位')">进入驾驶舱</Button>
                <Button danger @click="message.warning('紧急悬停指令已发送')">紧急悬停</Button>
              </div>
            </template>
          </Card>
        </Col>

        <Col :xl="8" :span="24">
          <Card :bordered="false" title="待执行队列">
            <div class="flex flex-col gap-3">
              <div
                v-for="item in queueList"
                :key="item.key"
                class="flex items-center justify-between rounded-lg border border-slate-100 dark:border-slate-700 px-3 py-2"
              >
                <div>
                  <div class="text-sm font-medium text-slate-800 dark:text-slate-200">{{ item.mission }}</div>
                  <div class="mt-1 text-xs text-slate-500">{{ item.drone }} · {{ item.eta }}</div>
                </div>
                <Tag :color="getPriorityColor(item.priority)">{{ item.priority }}</Tag>
              </div>
            </div>
          </Card>
        </Col>

        <Col :xl="8" :span="24">
          <Card :bordered="false" title="实时事件流">
            <Timeline>
              <Timeline.Item
                v-for="item in eventLog"
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
    </div>
  </Page>
</template>
