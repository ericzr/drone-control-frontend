<script lang="ts" setup name="DroneDispatchCenterPage">
import { Page } from '@vben/common-ui';

import { computed, ref } from 'vue';

import {
  Alert,
  Button,
  Card,
  Col,
  Descriptions,
  DescriptionsItem,
  Drawer,
  Empty,
  Progress,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Timeline,
  message,
} from 'ant-design-vue';

const overviewStats = [
  { title: '在线机场', value: 18, suffix: '座' },
  { title: '在线无人机', value: 27, suffix: '架' },
  { title: '执行中任务', value: 9, suffix: '个' },
  { title: '待处理告警', value: 6, suffix: '条' },
];

const layerTags = [
  '卫星底图',
  '禁飞区',
  '机场点位',
  '作业范围',
  '无人机轨迹',
  'AI 告警',
];

const airportCards = [
  {
    name: '高新区一号机场',
    range: '6km',
    status: '在线',
    task: '道路巡查',
    utilization: 72,
  },
  {
    name: '生态园区机场',
    range: '8km',
    status: '作业中',
    task: '河道例行巡检',
    utilization: 86,
  },
  {
    name: '林草防火机场',
    range: '10km',
    status: '待命',
    task: '防火巡查待命',
    utilization: 48,
  },
];

const statusPanels = [
  {
    title: '机场态势',
    value: 18,
    subtitle: '在线 14 / 作业中 3 / 离线 1',
    progress: 78,
  },
  {
    title: '无人机态势',
    value: 27,
    subtitle: '平均电量 74%，今日飞行 46 架次',
    progress: 74,
  },
  {
    title: '任务执行态势',
    value: 9,
    subtitle: '即时任务 3 / 定时任务 6',
    progress: 61,
  },
  {
    title: 'AI 告警态势',
    value: 6,
    subtitle: '待复核 4 / 已确认 2',
    progress: 43,
  },
];

const videoFeeds = [
  {
    key: '1',
    title: '无人机图传 A-03',
    source: 'DJI Dock / 1080P',
    status: '直播中',
    latency: '420ms',
  },
  {
    key: '2',
    title: '机场监控 B-01',
    source: 'GB28181 / 主码流',
    status: '在线',
    latency: '760ms',
  },
  {
    key: '3',
    title: '地面监控 C-19',
    source: '边缘盒 / 子码流',
    status: '离线',
    latency: '--',
  },
  {
    key: '4',
    title: '热成像通道 D-07',
    source: '红外载荷 / 720P',
    status: '直播中',
    latency: '510ms',
  },
];

const regionOptions = [
  { label: '全部区域', value: '全部区域' },
  { label: '高新区北片', value: '高新区北片' },
  { label: '生态园区', value: '生态园区' },
  { label: '林草防火区', value: '林草防火区' },
];

const airportOptions = [
  { label: '全部机场', value: '全部机场' },
  { label: '高新区一号机场', value: '高新区一号机场' },
  { label: '生态园区机场', value: '生态园区机场' },
  { label: '林草防火机场', value: '林草防火机场' },
];

const taskStatusOptions = [
  { label: '全部状态', value: '全部状态' },
  { label: '执行中', value: '执行中' },
  { label: '待起飞', value: '待起飞' },
  { label: '待调度', value: '待调度' },
];

const taskColumns = [
  { title: '任务名称', dataIndex: 'name', key: 'name' },
  { title: '执行设备', dataIndex: 'device', key: 'device' },
  { title: '区域', dataIndex: 'region', key: 'region' },
  { title: '指挥席', dataIndex: 'commander', key: 'commander' },
  { title: '优先级', dataIndex: 'priority', key: 'priority' },
  { title: '状态', dataIndex: 'status', key: 'status' },
  { title: '执行进度', dataIndex: 'progress', key: 'progress' },
  { title: '计划时间', dataIndex: 'time', key: 'time' },
  { title: '操作', dataIndex: 'action', key: 'action', width: 180 },
];

const taskRows = [
  {
    key: '1',
    name: '高新区主干道巡查',
    device: '大航蜂 M300-01',
    airport: '高新区一号机场',
    region: '高新区北片',
    commander: '综合指挥席 A',
    priority: '普通',
    status: '执行中',
    progress: 68,
    time: '14:20 - 15:00',
    objective: '完成主干道违停抓拍与拥堵热区巡检',
    payload: '双光云台 + 扩音器',
    actionAdvice: ['保持现有航线', '图传切到路口 2', '同步回传拥堵热力点'],
  },
  {
    key: '2',
    name: '沿河排污口核查',
    device: '生态园区机场',
    airport: '生态园区机场',
    region: '生态园区',
    commander: '生态巡检席',
    priority: '高',
    status: '待起飞',
    progress: 20,
    time: '14:40 - 15:10',
    objective: '对疑似排污口进行定点拍摄和轨迹留存',
    payload: '4K 可见光 + 热成像',
    actionAdvice: ['优先调用热成像通道 D-07', '先执行定点悬停', '联动事件中心生成复核单'],
  },
  {
    key: '3',
    name: '林草防火热成像巡检',
    device: '林草防火机场',
    airport: '林草防火机场',
    region: '林草防火区',
    commander: '应急指挥席',
    priority: '紧急',
    status: '待调度',
    progress: 0,
    time: '立即执行',
    objective: '对烟点网格执行应急核查，确认是否存在明火',
    payload: '红外热成像 + 探照灯',
    actionAdvice: ['建议一键起飞最近机场', '优先切入低空盘旋模式', '同步推送现场坐标给值班人员'],
  },
];

const alertItems = [
  {
    key: 'A1',
    title: '疑似烟雾告警',
    location: '林草防火区 3 号网格',
    level: '高',
    time: '14:36:08',
    region: '林草防火区',
    airport: '林草防火机场',
    linkedTask: '林草防火热成像巡检',
    status: '待核查',
    confidence: '92%',
    suggestion: '建议调用林草防火机场最近机组，执行红外复核',
  },
  {
    key: 'A2',
    title: '违停识别告警',
    location: '高新区创业大道',
    level: '中',
    time: '14:31:42',
    region: '高新区北片',
    airport: '高新区一号机场',
    linkedTask: '高新区主干道巡查',
    status: '复核中',
    confidence: '83%',
    suggestion: '建议复用当前巡查任务，追加局部盘旋拍摄',
  },
  {
    key: 'A3',
    title: '水面漂浮物告警',
    location: '沿河西路 2 公里处',
    level: '中',
    time: '14:27:13',
    region: '生态园区',
    airport: '生态园区机场',
    linkedTask: '沿河排污口核查',
    status: '待派单',
    confidence: '78%',
    suggestion: '建议创建补充核查任务并同步环保处置人员',
  },
];

const selectedRegion = ref('全部区域');
const selectedAirport = ref('全部机场');
const selectedTaskStatus = ref('全部状态');
const detailOpen = ref(false);
const detailMode = ref<'alert' | 'task'>('task');
const selectedTaskKey = ref(taskRows[2]?.key ?? '');
const selectedAlertKey = ref(alertItems[0]?.key ?? '');

const filteredTaskRows = computed(() => {
  return taskRows.filter((item) => {
    const matchRegion =
      selectedRegion.value === '全部区域' || item.region === selectedRegion.value;
    const matchAirport =
      selectedAirport.value === '全部机场' || item.airport === selectedAirport.value;
    const matchStatus =
      selectedTaskStatus.value === '全部状态' ||
      item.status === selectedTaskStatus.value;
    return matchRegion && matchAirport && matchStatus;
  });
});

const filteredAlertItems = computed(() => {
  return alertItems.filter((item) => {
    const matchRegion =
      selectedRegion.value === '全部区域' || item.region === selectedRegion.value;
    const matchAirport =
      selectedAirport.value === '全部机场' || item.airport === selectedAirport.value;
    return matchRegion && matchAirport;
  });
});

const currentTask = computed(() => {
  return (
    filteredTaskRows.value.find((item) => item.key === selectedTaskKey.value) ||
    filteredTaskRows.value[0] ||
    null
  );
});

const currentAlert = computed(() => {
  return (
    filteredAlertItems.value.find((item) => item.key === selectedAlertKey.value) ||
    filteredAlertItems.value[0] ||
    null
  );
});

const dispatchSteps = computed(() => {
  const task = currentTask.value;
  const alert = currentAlert.value;

  return [
    {
      color: 'blue',
      title: '告警接入与研判',
      description: alert
        ? `${alert.title} 已进入调度席，置信度 ${alert.confidence}`
        : '暂无匹配告警',
    },
    {
      color: 'gold',
      title: '资源匹配与航线下发',
      description: task
        ? `优先匹配 ${task.airport}，载荷为 ${task.payload}`
        : '暂无任务资源',
    },
    {
      color: 'green',
      title: '执行与结果回传',
      description: task
        ? `结果回传至 ${task.commander}，生成现场留痕`
        : '等待调度动作触发',
    },
  ];
});

const dispatchSuggestions = computed(() => {
  const task = currentTask.value;
  const alert = currentAlert.value;
  return [
    `当前建议优先处理 ${task?.name || '应急核查任务'}`,
    alert?.suggestion || '建议补充人工研判',
    `筛选范围内共有 ${filteredTaskRows.value.length} 个任务、${filteredAlertItems.value.length} 条告警`,
  ];
});

function getStatusColor(status: string) {
  if (status === '在线' || status === '直播中') return 'green';
  if (status === '作业中' || status === '执行中') return 'blue';
  if (status === '待核查' || status === '待派单') return 'orange';
  if (status === '复核中') return 'cyan';
  if (status === '待命' || status === '待起飞' || status === '待调度') {
    return 'gold';
  }
  return 'default';
}

function getPriorityColor(priority: string) {
  if (priority === '紧急') return 'red';
  if (priority === '高') return 'orange';
  return 'blue';
}

function getAlertColor(level: string) {
  if (level === '高') return 'red';
  if (level === '中') return 'orange';
  return 'blue';
}

function openTaskDetail(taskKey: string) {
  selectedTaskKey.value = taskKey;
  detailMode.value = 'task';
  detailOpen.value = true;
}

function openAlertDetail(alertKey: string) {
  selectedAlertKey.value = alertKey;
  detailMode.value = 'alert';
  detailOpen.value = true;
}

function quickDispatch(taskKey?: string) {
  const task =
    filteredTaskRows.value.find((item) => item.key === taskKey) || currentTask.value;
  if (!task) return;

  selectedTaskKey.value = task.key;
  detailMode.value = 'task';
  detailOpen.value = true;
  message.success(`已向 ${task.airport} 下发“${task.name}”调度指令`);
}

function launchAlertCheck(alertKey?: string) {
  const alert =
    filteredAlertItems.value.find((item) => item.key === alertKey) || currentAlert.value;
  if (!alert) return;

  selectedAlertKey.value = alert.key;
  detailMode.value = 'alert';
  detailOpen.value = true;
  message.success(`已为“${alert.title}”发起应急核查流程`);
}

function refreshDispatchBoard() {
  message.success('调度态势已刷新，当前为演示数据');
}
</script>

<template>
  <Page :auto-content-height="true">
    <div class="flex flex-col gap-4 p-2">
      <Alert
        message="调度中心承担区域级统一调度"
        description="这里不是单一无人机任务页，而是面向区域范围统一编排无人机、机场、无人车、机器人与摄像头协同作业的调度席。当前已先收口地图、态势、视频、任务四条主链，后续再接入真地图、真图传和实时遥测。"
        show-icon
        type="info"
      />

      <Card :bordered="false" title="区域调度过滤与快捷动作">
        <div class="dispatch-filters">
          <Space :size="[12, 12]" wrap>
            <Select
              v-model:value="selectedRegion"
              :options="regionOptions"
              class="dispatch-filter__select"
            />
            <Select
              v-model:value="selectedAirport"
              :options="airportOptions"
              class="dispatch-filter__select"
            />
            <Select
              v-model:value="selectedTaskStatus"
              :options="taskStatusOptions"
              class="dispatch-filter__select"
            />
            <Button type="primary" @click="quickDispatch()">
              一键调度当前任务
            </Button>
            <Button @click="launchAlertCheck()">发起告警核查</Button>
            <Button @click="refreshDispatchBoard()">刷新态势</Button>
          </Space>
          <div class="text-sm text-slate-500">
            当前筛选下共 {{ filteredTaskRows.length }} 个任务、{{ filteredAlertItems.length }} 条告警，重点关注
            <span class="font-semibold text-slate-800">
              {{ currentTask?.name || currentAlert?.title || '暂无数据' }}
            </span>
          </div>
        </div>
      </Card>

      <Row :gutter="[16, 16]">
        <Col v-for="item in overviewStats" :key="item.title" :lg="6" :md="12" :span="24">
          <Card :bordered="false">
            <Statistic :suffix="item.suffix" :title="item.title" :value="item.value" />
          </Card>
        </Col>
      </Row>

      <Row :gutter="[16, 16]">
        <Col :xl="16" :span="24">
          <Card :bordered="false" title="区域协同调度图">
            <div class="dispatch-map">
              <div class="dispatch-map__toolbar">
                <Tag v-for="item in layerTags" :key="item" color="processing">
                  {{ item }}
                </Tag>
              </div>

              <div class="dispatch-map__canvas">
                <div class="dispatch-map__grid"></div>

                <div class="dispatch-map__marker marker-airport marker-airport--a">
                  高新区一号机场
                </div>
                <div class="dispatch-map__marker marker-airport marker-airport--b">
                  生态园区机场
                </div>
                <div class="dispatch-map__marker marker-airport marker-airport--c">
                  林草防火机场
                </div>

                <div class="dispatch-map__marker marker-drone marker-drone--a">
                  无人机 A-03
                </div>
                <div class="dispatch-map__marker marker-drone marker-drone--b">
                  无人机 M300-01
                </div>

                <div class="dispatch-map__route route-a"></div>
                <div class="dispatch-map__route route-b"></div>

                <div class="dispatch-map__alert dispatch-map__alert--a">烟雾告警</div>
                <div class="dispatch-map__alert dispatch-map__alert--b">排污口异常</div>
              </div>
            </div>
          </Card>
        </Col>

        <Col :xl="8" :span="24">
          <Card :bordered="false" title="机场与区域覆盖能力">
            <div class="flex flex-col gap-3">
              <div
                v-for="item in airportCards"
                :key="item.name"
                class="rounded-xl border border-slate-200 px-4 py-3"
              >
                <div class="flex items-center justify-between">
                  <div class="text-sm font-semibold text-slate-900">{{ item.name }}</div>
                  <Tag :color="getStatusColor(item.status)">{{ item.status }}</Tag>
                </div>
                <div class="mt-2 text-sm text-slate-500">覆盖范围：{{ item.range }}</div>
                <div class="mt-1 text-sm text-slate-600">当前任务：{{ item.task }}</div>
                <div class="mt-3">
                  <div class="mb-1 text-xs text-slate-500">今日利用率</div>
                  <Progress :percent="item.utilization" size="small" />
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row :gutter="[16, 16]">
        <Col v-for="item in statusPanels" :key="item.title" :xl="6" :md="12" :span="24">
          <Card :bordered="false" :title="item.title">
            <div class="text-3xl font-semibold text-slate-900">{{ item.value }}</div>
            <div class="mt-2 text-sm text-slate-500">{{ item.subtitle }}</div>
            <div class="mt-4">
              <Progress :percent="item.progress" status="active" />
            </div>
          </Card>
        </Col>
      </Row>

      <Row :gutter="[16, 16]">
        <Col :xl="14" :span="24">
          <Card :bordered="false" title="现场视频与图传调度区">
            <div class="grid gap-4 md:grid-cols-2">
              <div
                v-for="item in videoFeeds"
                :key="item.key"
                class="video-tile rounded-xl border border-slate-200"
              >
                <div class="video-tile__screen">
                  <div class="video-tile__noise"></div>
                  <div class="video-tile__badge">{{ item.title }}</div>
                  <div class="video-tile__meta">
                    <Tag :color="getStatusColor(item.status)">{{ item.status }}</Tag>
                    <span>{{ item.latency }}</span>
                  </div>
                </div>
                <div class="px-4 py-3">
                  <div class="text-sm font-medium text-slate-800">{{ item.title }}</div>
                  <div class="mt-1 text-xs text-slate-500">{{ item.source }}</div>
                </div>
              </div>
            </div>
          </Card>
        </Col>

        <Col :xl="10" :span="24">
          <Card :bordered="false" title="实时告警队列">
            <div v-if="filteredAlertItems.length > 0" class="flex flex-col gap-3">
              <div
                v-for="item in filteredAlertItems"
                :key="item.title + item.time"
                :class="[
                  'dispatch-alert-card rounded-xl border px-4 py-3',
                  selectedAlertKey === item.key
                    ? 'dispatch-alert-card--active'
                    : 'border-slate-200',
                ]"
                @click="openAlertDetail(item.key)"
              >
                <div class="flex items-center justify-between">
                  <div class="text-sm font-semibold text-slate-900">{{ item.title }}</div>
                  <Tag :color="getAlertColor(item.level)">{{ item.level }}</Tag>
                </div>
                <div class="mt-2 text-sm text-slate-600">{{ item.location }}</div>
                <div class="mt-1 flex items-center justify-between text-xs text-slate-500">
                  <span>{{ item.time }}</span>
                  <span>状态：{{ item.status }}</span>
                </div>
                <div class="mt-3 flex flex-wrap gap-2">
                  <Tag color="processing">置信度 {{ item.confidence }}</Tag>
                  <Tag :color="getStatusColor(item.status)">{{ item.linkedTask }}</Tag>
                </div>
              </div>
            </div>
            <Empty v-else description="当前筛选下暂无告警" />
          </Card>
        </Col>
      </Row>

      <Row :gutter="[16, 16]">
        <Col :xl="16" :span="24">
          <Card :bordered="false" title="跨设备任务调度队列">
            <Table
              :columns="taskColumns"
              :data-source="filteredTaskRows"
              :pagination="false"
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
                <template v-else-if="column.key === 'progress'">
                  <div class="min-w-[120px]">
                    <Progress :percent="record.progress" size="small" />
                  </div>
                </template>
                <template v-else-if="column.key === 'action'">
                  <Space>
                    <Button size="small" type="link" @click="openTaskDetail(record.key)">
                      查看详情
                    </Button>
                    <Button size="small" type="link" @click="quickDispatch(record.key)">
                      下发调度
                    </Button>
                  </Space>
                </template>
              </template>
            </Table>
          </Card>
        </Col>

        <Col :xl="8" :span="24">
          <Card :bordered="false" title="调度建议与联动闭环">
            <div class="flex flex-col gap-4">
              <div class="dispatch-suggestion-panel">
                <div
                  v-for="item in dispatchSuggestions"
                  :key="item"
                  class="dispatch-suggestion-panel__item"
                >
                  {{ item }}
                </div>
              </div>
              <Timeline>
                <Timeline.Item
                  v-for="item in dispatchSteps"
                  :key="item.title"
                  :color="item.color"
                >
                  <div class="text-sm font-semibold text-slate-900">{{ item.title }}</div>
                  <div class="mt-1 text-xs text-slate-500">{{ item.description }}</div>
                </Timeline.Item>
              </Timeline>
            </div>
          </Card>
        </Col>
      </Row>

      <Drawer
        v-model:open="detailOpen"
        :title="detailMode === 'task' ? '任务调度详情' : '告警联动详情'"
        placement="right"
        width="420"
      >
        <template v-if="detailMode === 'task' && currentTask">
          <Descriptions :column="1" bordered size="small">
            <DescriptionsItem label="任务名称">
              {{ currentTask.name }}
            </DescriptionsItem>
            <DescriptionsItem label="执行机场">
              {{ currentTask.airport }}
            </DescriptionsItem>
            <DescriptionsItem label="执行设备">
              {{ currentTask.device }}
            </DescriptionsItem>
            <DescriptionsItem label="指挥席">
              {{ currentTask.commander }}
            </DescriptionsItem>
            <DescriptionsItem label="任务目标">
              {{ currentTask.objective }}
            </DescriptionsItem>
            <DescriptionsItem label="载荷配置">
              {{ currentTask.payload }}
            </DescriptionsItem>
          </Descriptions>

          <div class="mt-4">
            <div class="mb-2 text-sm font-semibold text-slate-900">执行建议</div>
            <div class="flex flex-col gap-2">
              <div
                v-for="item in currentTask.actionAdvice"
                :key="item"
                class="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600"
              >
                {{ item }}
              </div>
            </div>
          </div>

          <div class="mt-4">
            <div class="mb-2 text-sm font-semibold text-slate-900">执行进度</div>
            <Progress :percent="currentTask.progress" status="active" />
          </div>
        </template>

        <template v-else-if="detailMode === 'alert' && currentAlert">
          <Descriptions :column="1" bordered size="small">
            <DescriptionsItem label="告警名称">
              {{ currentAlert.title }}
            </DescriptionsItem>
            <DescriptionsItem label="告警位置">
              {{ currentAlert.location }}
            </DescriptionsItem>
            <DescriptionsItem label="归属机场">
              {{ currentAlert.airport }}
            </DescriptionsItem>
            <DescriptionsItem label="联动任务">
              {{ currentAlert.linkedTask }}
            </DescriptionsItem>
            <DescriptionsItem label="研判状态">
              <Tag :color="getStatusColor(currentAlert.status)">
                {{ currentAlert.status }}
              </Tag>
            </DescriptionsItem>
            <DescriptionsItem label="模型置信度">
              {{ currentAlert.confidence }}
            </DescriptionsItem>
          </Descriptions>

          <div class="mt-4 rounded-2xl bg-orange-50 px-4 py-3 text-sm text-orange-700">
            {{ currentAlert.suggestion }}
          </div>

          <div class="mt-4 flex gap-3">
            <Button type="primary" @click="launchAlertCheck(currentAlert.key)">
              发起核查
            </Button>
            <Button @click="quickDispatch(currentTask?.key)">
              联动调度
            </Button>
          </div>
        </template>
      </Drawer>
    </div>
  </Page>
</template>

<style lang="less" scoped>
.dispatch-filters {
  display: flex;
  gap: 16px;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}

.dispatch-filter__select {
  width: 160px;
}

.dispatch-map {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dispatch-map__toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.dispatch-map__canvas {
  position: relative;
  min-height: 440px;
  overflow: hidden;
  border: 1px solid #dbe4f0;
  border-radius: 20px;
  background:
    radial-gradient(circle at top left, rgb(56 189 248 / 28%), transparent 28%),
    radial-gradient(circle at bottom right, rgb(34 197 94 / 24%), transparent 25%),
    linear-gradient(135deg, #eff6ff 0%, #dbeafe 42%, #ecfeff 100%);
}

.dispatch-map__grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgb(255 255 255 / 55%) 1px, transparent 1px),
    linear-gradient(90deg, rgb(255 255 255 / 55%) 1px, transparent 1px);
  background-size: 48px 48px;
}

.dispatch-map__marker,
.dispatch-map__alert {
  position: absolute;
  z-index: 2;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  box-shadow: 0 10px 25px rgb(15 23 42 / 12%);
}

.marker-airport {
  color: #0f172a;
  background: rgb(255 255 255 / 90%);
  border: 1px solid #cbd5e1;
}

.marker-airport--a {
  top: 54px;
  left: 68px;
}

.marker-airport--b {
  top: 166px;
  left: 360px;
}

.marker-airport--c {
  right: 88px;
  bottom: 62px;
}

.marker-drone {
  color: white;
  background: linear-gradient(135deg, #2563eb 0%, #0891b2 100%);
}

.marker-drone--a {
  top: 112px;
  left: 250px;
}

.marker-drone--b {
  top: 286px;
  left: 520px;
}

.dispatch-map__route {
  position: absolute;
  z-index: 1;
  height: 4px;
  border-radius: 999px;
  opacity: 0.95;
}

.route-a {
  top: 130px;
  left: 145px;
  width: 180px;
  background: linear-gradient(90deg, #38bdf8 0%, #2563eb 100%);
  transform: rotate(10deg);
}

.route-b {
  bottom: 118px;
  left: 430px;
  width: 210px;
  background: linear-gradient(90deg, #22c55e 0%, #16a34a 100%);
  transform: rotate(-22deg);
}

.dispatch-map__alert {
  color: white;
  background: linear-gradient(135deg, #ef4444 0%, #f97316 100%);
}

.dispatch-map__alert--a {
  top: 218px;
  left: 146px;
}

.dispatch-map__alert--b {
  right: 132px;
  top: 124px;
}

.dispatch-alert-card {
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.dispatch-alert-card:hover,
.dispatch-alert-card--active {
  border-color: #93c5fd;
  box-shadow: 0 12px 30px rgb(37 99 235 / 12%);
  transform: translateY(-1px);
}

.video-tile__screen {
  position: relative;
  min-height: 170px;
  overflow: hidden;
  border-bottom: 1px solid #e2e8f0;
  background:
    radial-gradient(circle at top right, rgb(59 130 246 / 34%), transparent 24%),
    linear-gradient(145deg, #0f172a 0%, #111827 48%, #1e293b 100%);
}

.video-tile__noise {
  position: absolute;
  inset: 0;
  opacity: 0.35;
  background-image:
    linear-gradient(rgb(255 255 255 / 8%) 1px, transparent 1px),
    linear-gradient(90deg, rgb(255 255 255 / 8%) 1px, transparent 1px);
  background-size: 14px 14px;
}

.video-tile__badge {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 1;
  padding: 4px 10px;
  color: white;
  font-size: 12px;
  background: rgb(15 23 42 / 65%);
  border: 1px solid rgb(255 255 255 / 12%);
  border-radius: 999px;
}

.video-tile__meta {
  position: absolute;
  right: 12px;
  bottom: 12px;
  z-index: 1;
  display: flex;
  gap: 8px;
  align-items: center;
  color: rgb(226 232 240);
  font-size: 12px;
}

.dispatch-suggestion-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.dispatch-suggestion-panel__item {
  padding: 12px 14px;
  color: #334155;
  font-size: 13px;
  background: linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%);
  border: 1px solid #dbeafe;
  border-radius: 16px;
}
</style>
