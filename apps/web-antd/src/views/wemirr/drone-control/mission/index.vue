<script lang="ts" setup name="DroneMissionCenterPage">
import { Page } from '@vben/common-ui';

import { computed, ref } from 'vue';

import {
  Button,
  Card,
  Col,
  Descriptions,
  DescriptionsItem,
  Drawer,
  Input,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Timeline,
  message,
} from 'ant-design-vue';

interface MissionRow {
  key: string;
  name: string;
  type: string;
  region: string;
  airport: string;
  commander: string;
  status: string;
  priority: string;
  schedule: string;
  aiPolicy: string;
  objective: string;
  routePlan: string;
  executionLog: string[];
}

const stats = [
  { title: '今日任务', value: 46, suffix: '个' },
  { title: '执行中', value: 9, suffix: '个' },
  { title: '待起飞', value: 7, suffix: '个' },
  { title: '已完成', value: 28, suffix: '个' },
];

const statusCards = [
  {
    title: '计划管理',
    value: 18,
    desc: '承接待命、即时、定时任务创建与执行窗口配置',
  },
  {
    title: '飞行执行',
    value: 9,
    desc: '同步展示任务状态、续飞策略与执行留痕',
  },
  {
    title: '调度算法',
    value: 6,
    desc: '预留资源匹配、电量预估与时间窗口决策能力',
  },
];

const missionTypeOptions = [
  { label: '全部类型', value: '全部类型' },
  { label: '普巡任务', value: '普巡任务' },
  { label: '应急任务', value: '应急任务' },
  { label: '定时任务', value: '定时任务' },
];

const missionStatusOptions = [
  { label: '全部状态', value: '全部状态' },
  { label: '执行中', value: '执行中' },
  { label: '待起飞', value: '待起飞' },
  { label: '待调度', value: '待调度' },
  { label: '已完成', value: '已完成' },
];

const regionOptions = [
  { label: '全部区域', value: '全部区域' },
  { label: '高新区北片', value: '高新区北片' },
  { label: '生态园区', value: '生态园区' },
  { label: '林草防火区', value: '林草防火区' },
];

const missionColumns = [
  { title: '任务名称', dataIndex: 'name', key: 'name' },
  { title: '任务类型', dataIndex: 'type', key: 'type' },
  { title: '所属区域', dataIndex: 'region', key: 'region' },
  { title: '执行机场', dataIndex: 'airport', key: 'airport' },
  { title: '指挥席', dataIndex: 'commander', key: 'commander' },
  { title: '优先级', dataIndex: 'priority', key: 'priority' },
  { title: '状态', dataIndex: 'status', key: 'status' },
  { title: '执行窗口', dataIndex: 'schedule', key: 'schedule' },
  { title: '操作', dataIndex: 'action', key: 'action', width: 180 },
];

const missions = ref<MissionRow[]>([
  {
    key: '1',
    name: '高新区主干道巡查',
    type: '普巡任务',
    region: '高新区北片',
    airport: '高新区一号机场',
    commander: '综合指挥席 A',
    status: '执行中',
    priority: '普通',
    schedule: '14:20 - 15:00',
    aiPolicy: '违停识别 + 拥堵热区分析',
    objective: '完成主干道道路巡查、违停抓拍与拥堵热区汇总。',
    routePlan: '主干道双向折返航线 + 两处路口盘旋点',
    executionLog: [
      '14:20 任务起飞成功',
      '14:31 回传违停识别告警',
      '14:42 已完成 68% 航线覆盖',
    ],
  },
  {
    key: '2',
    name: '沿河排污口核查',
    type: '应急任务',
    region: '生态园区',
    airport: '生态园区机场',
    commander: '生态巡检席',
    status: '待起飞',
    priority: '高',
    schedule: '16:10 - 16:40',
    aiPolicy: '漂浮物识别 + 排污口比对',
    objective: '对疑似排污口进行定点拍摄并形成复核证据链。',
    routePlan: '沿河低空巡航 + 两处定点悬停拍摄',
    executionLog: [
      '15:48 任务创建完成',
      '15:53 已绑定生态园区机场',
      '16:00 等待起飞窗口',
    ],
  },
  {
    key: '3',
    name: '林草防火热成像巡检',
    type: '应急任务',
    region: '林草防火区',
    airport: '林草防火机场',
    commander: '应急值守席',
    status: '待调度',
    priority: '紧急',
    schedule: '立即执行',
    aiPolicy: '烟火识别 + 热源异常检测',
    objective: '对烟点区域执行应急核查，确认是否存在持续明火。',
    routePlan: '先低空盘旋，再切入热源追踪模式',
    executionLog: [
      '15:26 调度中心发起联动任务',
      '15:28 已生成应急任务单',
      '15:33 等待机组资源匹配',
    ],
  },
  {
    key: '4',
    name: '林区周界定时巡检',
    type: '定时任务',
    region: '林草防火区',
    airport: '林草防火机场',
    commander: '定时任务席',
    status: '已完成',
    priority: '普通',
    schedule: '08:30 - 09:10',
    aiPolicy: '周界识别 + 热成像巡检',
    objective: '完成林区周界例行巡检并上传日巡报告。',
    routePlan: '周界闭环航线 + 三点悬停',
    executionLog: [
      '08:30 自动起飞成功',
      '08:52 航线执行完成',
      '09:10 巡检报告已归档',
    ],
  },
]);

const keyword = ref('');
const selectedType = ref('全部类型');
const selectedStatus = ref('全部状态');
const selectedRegion = ref('全部区域');
const detailOpen = ref(false);
const selectedMissionKey = ref(missions.value[0]?.key ?? '');

const filteredMissions = computed(() => {
  return missions.value.filter((item) => {
    const matchKeyword =
      keyword.value.trim() === '' ||
      [item.name, item.airport, item.commander, item.aiPolicy].some((field) =>
        field.includes(keyword.value.trim()),
      );
    const matchType =
      selectedType.value === '全部类型' || item.type === selectedType.value;
    const matchStatus =
      selectedStatus.value === '全部状态' || item.status === selectedStatus.value;
    const matchRegion =
      selectedRegion.value === '全部区域' || item.region === selectedRegion.value;
    return matchKeyword && matchType && matchStatus && matchRegion;
  });
});

const selectedMission = computed(() => {
  return (
    filteredMissions.value.find((item) => item.key === selectedMissionKey.value) ||
    missions.value.find((item) => item.key === selectedMissionKey.value) ||
    null
  );
});

const missionProcess = computed(() => {
  const current = selectedMission.value;
  return [
    {
      color: 'blue',
      title: '任务创建与审核',
      description: current ? `${current.name} 已挂载 ${current.aiPolicy}` : '等待任务选择',
    },
    {
      color: 'gold',
      title: '资源匹配与航线生成',
      description: current ? `已匹配 ${current.airport}，航线：${current.routePlan}` : '等待资源匹配',
    },
    {
      color: 'green',
      title: '执行与结果回传',
      description: current ? `当前状态：${current.status}` : '等待执行状态',
    },
  ];
});

function getStatusColor(status: string) {
  if (status === '执行中') return 'blue';
  if (status === '待起飞' || status === '待调度') return 'orange';
  if (status === '已完成') return 'green';
  return 'default';
}

function getPriorityColor(priority: string) {
  if (priority === '紧急') return 'red';
  if (priority === '高') return 'orange';
  return 'blue';
}

function openMissionDetail(missionKey: string) {
  selectedMissionKey.value = missionKey;
  detailOpen.value = true;
}

function refreshMissions() {
  message.success('任务中心已刷新，当前为演示数据');
}

function createMission() {
  message.success('已打开新建任务入口占位');
}

function dispatchMission(missionKey: string) {
  const target =
    missions.value.find((item) => item.key === missionKey) || selectedMission.value;
  if (!target) return;
  message.success(`已向 ${target.airport} 下发“${target.name}”执行指令`);
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
        <Col v-for="item in statusCards" :key="item.title" :lg="8" :span="24">
          <Card :bordered="false">
            <div class="text-lg font-semibold text-slate-900">{{ item.title }}</div>
            <div class="mt-3 text-3xl font-bold text-slate-900">{{ item.value }}</div>
            <div class="mt-2 text-sm text-slate-500">{{ item.desc }}</div>
          </Card>
        </Col>
      </Row>

      <Card :bordered="false" title="任务筛选与操作">
        <div class="mission-toolbar">
          <Space :size="[12, 12]" wrap>
            <Input
              v-model:value="keyword"
              allow-clear
              class="mission-toolbar__input"
              placeholder="搜索任务名称 / 机场 / 指挥席 / AI 策略"
            />
            <Select
              v-model:value="selectedType"
              :options="missionTypeOptions"
              class="mission-toolbar__select"
            />
            <Select
              v-model:value="selectedStatus"
              :options="missionStatusOptions"
              class="mission-toolbar__select"
            />
            <Select
              v-model:value="selectedRegion"
              :options="regionOptions"
              class="mission-toolbar__select"
            />
            <Button type="primary" @click="refreshMissions()">刷新任务</Button>
            <Button @click="createMission()">新建任务</Button>
          </Space>
          <div class="text-sm text-slate-500">
            当前筛选结果共 {{ filteredMissions.length }} 个任务，重点关注
            <span class="font-semibold text-slate-800">
              {{ selectedMission?.name || '暂无任务' }}
            </span>
          </div>
        </div>
      </Card>

      <Row :gutter="[16, 16]">
        <Col :xl="16" :span="24">
          <Card :bordered="false" title="任务列表">
            <Table
              :columns="missionColumns"
              :data-source="filteredMissions"
              :pagination="{ pageSize: 5 }"
              row-key="key"
              size="middle"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'priority'">
                  <Tag :color="getPriorityColor(record.priority)">
                    {{ record.priority }}
                  </Tag>
                </template>
                <template v-else-if="column.key === 'status'">
                  <Tag :color="getStatusColor(record.status)">
                    {{ record.status }}
                  </Tag>
                </template>
                <template v-else-if="column.key === 'action'">
                  <Space>
                    <Button size="small" type="link" @click="openMissionDetail(record.key)">
                      查看详情
                    </Button>
                    <Button size="small" type="link" @click="dispatchMission(record.key)">
                      下发任务
                    </Button>
                  </Space>
                </template>
              </template>
            </Table>
          </Card>
        </Col>

        <Col :xl="8" :span="24">
          <Card :bordered="false" title="任务闭环流程">
            <Timeline>
              <Timeline.Item
                v-for="item in missionProcess"
                :key="item.title"
                :color="item.color"
              >
                <div class="text-sm font-semibold text-slate-900">{{ item.title }}</div>
                <div class="mt-1 text-xs text-slate-500">{{ item.description }}</div>
              </Timeline.Item>
            </Timeline>
          </Card>
        </Col>
      </Row>

      <Drawer
        v-model:open="detailOpen"
        title="任务详情"
        placement="right"
        width="420"
      >
        <template v-if="selectedMission">
          <Descriptions :column="1" bordered size="small">
            <DescriptionsItem label="任务名称">
              {{ selectedMission.name }}
            </DescriptionsItem>
            <DescriptionsItem label="任务类型">
              {{ selectedMission.type }}
            </DescriptionsItem>
            <DescriptionsItem label="所属区域">
              {{ selectedMission.region }}
            </DescriptionsItem>
            <DescriptionsItem label="执行机场">
              {{ selectedMission.airport }}
            </DescriptionsItem>
            <DescriptionsItem label="指挥席">
              {{ selectedMission.commander }}
            </DescriptionsItem>
            <DescriptionsItem label="优先级">
              <Tag :color="getPriorityColor(selectedMission.priority)">
                {{ selectedMission.priority }}
              </Tag>
            </DescriptionsItem>
            <DescriptionsItem label="当前状态">
              <Tag :color="getStatusColor(selectedMission.status)">
                {{ selectedMission.status }}
              </Tag>
            </DescriptionsItem>
            <DescriptionsItem label="执行窗口">
              {{ selectedMission.schedule }}
            </DescriptionsItem>
            <DescriptionsItem label="AI 策略">
              {{ selectedMission.aiPolicy }}
            </DescriptionsItem>
            <DescriptionsItem label="任务目标">
              {{ selectedMission.objective }}
            </DescriptionsItem>
            <DescriptionsItem label="航线规划">
              {{ selectedMission.routePlan }}
            </DescriptionsItem>
          </Descriptions>

          <div class="mt-4">
            <div class="mb-2 text-sm font-semibold text-slate-900">执行日志</div>
            <div class="flex flex-col gap-2">
              <div
                v-for="item in selectedMission.executionLog"
                :key="item"
                class="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600"
              >
                {{ item }}
              </div>
            </div>
          </div>

          <div class="mt-4 flex flex-wrap gap-3">
            <Button type="primary" @click="dispatchMission(selectedMission.key)">
              下发任务
            </Button>
            <Button @click="message.success('已打开航线规划入口占位')">
              航线规划
            </Button>
            <Button @click="message.success('已打开复盘分析入口占位')">
              复盘分析
            </Button>
          </div>
        </template>
      </Drawer>
    </div>
  </Page>
</template>

<style lang="less" scoped>
.mission-toolbar {
  display: flex;
  gap: 16px;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}

.mission-toolbar__input {
  width: 320px;
}

.mission-toolbar__select {
  width: 160px;
}
</style>
