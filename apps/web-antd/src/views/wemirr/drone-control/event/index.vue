<script lang="ts" setup name="DroneEventCenterPage">
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

interface EventAlertItem {
  key: string;
  title: string;
  type: string;
  level: string;
  status: string;
  confidence: number;
  region: string;
  source: string;
  linkedTask: string;
  linkedAirport: string;
  location: string;
  discoveredAt: string;
  assignee: string;
  evidence: string[];
  suggestion: string;
  workOrderStatus: string;
  reviewConclusion: string;
}

const stats = [
  { title: '今日告警', value: 29, suffix: '条' },
  { title: '待人工复核', value: 11, suffix: '条' },
  { title: '已生成工单', value: 8, suffix: '单' },
  { title: '平均响应时长', value: 14, suffix: '分钟' },
];

const workflows = [
  {
    title: 'AI 告警复核',
    tags: ['确认', '驳回', '修正'],
    description: '支持查看识别证据、位置、类型和置信度，完成人工复核闭环。',
  },
  {
    title: '工单联动',
    tags: ['派单', '督办', '转派'],
    description: '将确认告警转为工单，联动现场处置与回传，生成处置留痕。',
  },
  {
    title: '事件留痕',
    tags: ['轨迹', '图片', '视频'],
    description: '保留从识别、调度到处置的完整链路，用于追溯和报告导出。',
  },
];

const regionOptions = [
  { label: '全部区域', value: '全部区域' },
  { label: '高新区北片', value: '高新区北片' },
  { label: '生态园区', value: '生态园区' },
  { label: '林草防火区', value: '林草防火区' },
];

const levelOptions = [
  { label: '全部等级', value: '全部等级' },
  { label: '高', value: '高' },
  { label: '中', value: '中' },
  { label: '低', value: '低' },
];

const statusOptions = [
  { label: '全部状态', value: '全部状态' },
  { label: '待复核', value: '待复核' },
  { label: '复核中', value: '复核中' },
  { label: '已确认', value: '已确认' },
  { label: '已驳回', value: '已驳回' },
  { label: '待修正', value: '待修正' },
];

const eventColumns = [
  { title: '告警名称', dataIndex: 'title', key: 'title' },
  { title: '告警类型', dataIndex: 'type', key: 'type' },
  { title: '区域', dataIndex: 'region', key: 'region' },
  { title: '等级', dataIndex: 'level', key: 'level' },
  { title: '状态', dataIndex: 'status', key: 'status' },
  { title: '置信度', dataIndex: 'confidence', key: 'confidence' },
  { title: '联动任务', dataIndex: 'linkedTask', key: 'linkedTask' },
  { title: '发现时间', dataIndex: 'discoveredAt', key: 'discoveredAt' },
  { title: '操作', dataIndex: 'action', key: 'action', width: 200 },
];

const eventAlerts = ref<EventAlertItem[]>([
  {
    key: 'E1',
    title: '疑似烟雾告警',
    type: '烟火识别',
    level: '高',
    status: '待复核',
    confidence: 92,
    region: '林草防火区',
    source: 'YOLOv11 小目标检测模型',
    linkedTask: '林草防火热成像巡检',
    linkedAirport: '林草防火机场',
    location: '林草防火区 3 号网格',
    discoveredAt: '2026-04-13 15:04:18',
    assignee: '应急值守席',
    evidence: ['热成像烟点轮廓', '可见光低空图传', '调度中心应急核查建议'],
    suggestion: '建议优先调用林草防火机场最近机组，执行红外复核并回传现场视频。',
    workOrderStatus: '待生成',
    reviewConclusion: '等待人工确认是否存在持续烟点。',
  },
  {
    key: 'E2',
    title: '水面漂浮物告警',
    type: '河道异常',
    level: '中',
    status: '复核中',
    confidence: 78,
    region: '生态园区',
    source: '边缘识别节点 + 人工规则',
    linkedTask: '沿河排污口核查',
    linkedAirport: '生态园区机场',
    location: '沿河西路 2 公里处',
    discoveredAt: '2026-04-13 14:57:09',
    assignee: '生态巡检席',
    evidence: ['局部漂浮物聚集截图', '上次核查工单定位点', '航线悬停抓拍结果'],
    suggestion: '建议生成补充核查工单，并通知现场人员核实污染来源。',
    workOrderStatus: '处理中',
    reviewConclusion: '需补充一组近距离图像后确认污染类型。',
  },
  {
    key: 'E3',
    title: '违停识别告警',
    type: '城市治理',
    level: '中',
    status: '已确认',
    confidence: 83,
    region: '高新区北片',
    source: '路面治理识别模型',
    linkedTask: '高新区主干道巡查',
    linkedAirport: '高新区一号机场',
    location: '高新区创业大道',
    discoveredAt: '2026-04-13 14:51:42',
    assignee: '综合治理席',
    evidence: ['路口高清抓拍', '巡查任务追加盘旋截图', '违停热区统计点位'],
    suggestion: '建议直接转派城管处置工单，保留调度过程图像作为证据。',
    workOrderStatus: '已派单',
    reviewConclusion: '已确认为违停事件，等待现场处置回执。',
  },
  {
    key: 'E4',
    title: '防护网破损告警',
    type: '设施异常',
    level: '低',
    status: '待修正',
    confidence: 64,
    region: '高新区北片',
    source: '设施巡检识别模型',
    linkedTask: '高新区园区围界巡检',
    linkedAirport: '高新区一号机场',
    location: '园区围界西南角',
    discoveredAt: '2026-04-13 14:39:21',
    assignee: '设施巡检席',
    evidence: ['围界近景图', '模型框选结果', '历史同点位照片'],
    suggestion: '建议调整标注类型后重新入库，并安排二次巡检复核。',
    workOrderStatus: '未生成',
    reviewConclusion: '当前识别框偏移，需要人工修正事件类型。',
  },
]);

const selectedRegion = ref('全部区域');
const selectedLevel = ref('全部等级');
const selectedStatus = ref('全部状态');
const detailOpen = ref(false);
const selectedEventKey = ref(eventAlerts.value[0]?.key ?? '');

const filteredEventAlerts = computed(() => {
  return eventAlerts.value.filter((item) => {
    const matchRegion =
      selectedRegion.value === '全部区域' || item.region === selectedRegion.value;
    const matchLevel =
      selectedLevel.value === '全部等级' || item.level === selectedLevel.value;
    const matchStatus =
      selectedStatus.value === '全部状态' || item.status === selectedStatus.value;
    return matchRegion && matchLevel && matchStatus;
  });
});

const selectedEvent = computed(() => {
  return (
    filteredEventAlerts.value.find((item) => item.key === selectedEventKey.value) ||
    filteredEventAlerts.value[0] ||
    null
  );
});

const reviewProgress = computed(() => {
  const status = selectedEvent.value?.status;
  if (status === '已确认') return 100;
  if (status === '复核中') return 70;
  if (status === '待修正') return 55;
  if (status === '已驳回') return 100;
  return 30;
});

const reviewSteps = computed(() => {
  const current = selectedEvent.value;
  return [
    {
      color: 'blue',
      title: '模型识别告警',
      description: current
        ? `${current.source} 上报 ${current.title}`
        : '暂无告警数据',
    },
    {
      color: 'gold',
      title: '调度联动核查',
      description: current
        ? `联动 ${current.linkedAirport} / ${current.linkedTask}`
        : '等待调度关联',
    },
    {
      color: 'green',
      title: '人工复核结论',
      description: current?.reviewConclusion || '等待人工复核',
    },
    {
      color: 'purple',
      title: '工单归档留痕',
      description: current
        ? `工单状态：${current.workOrderStatus}`
        : '待工单联动',
    },
  ];
});

const reviewSuggestions = computed(() => {
  const current = selectedEvent.value;
  if (!current) return [];

  return [
    `建议由 ${current.assignee} 完成人工复核`,
    current.suggestion,
    `当前工单状态为 ${current.workOrderStatus}`,
  ];
});

function getLevelColor(level: string) {
  if (level === '高') return 'red';
  if (level === '中') return 'orange';
  return 'blue';
}

function getStatusColor(status: string) {
  if (status === '已确认') return 'green';
  if (status === '复核中') return 'cyan';
  if (status === '待修正') return 'gold';
  if (status === '已驳回') return 'default';
  return 'orange';
}

function getWorkOrderColor(status: string) {
  if (status === '已派单') return 'green';
  if (status === '处理中') return 'processing';
  if (status === '待生成') return 'orange';
  return 'default';
}

function openEventDetail(eventKey: string) {
  selectedEventKey.value = eventKey;
  detailOpen.value = true;
}

function updateEventStatus(
  status: EventAlertItem['status'],
  workOrderStatus: EventAlertItem['workOrderStatus'],
  reviewConclusion: EventAlertItem['reviewConclusion'],
  successMessage: string,
) {
  const index = eventAlerts.value.findIndex((item) => item.key === selectedEventKey.value);
  if (index === -1) return;

  eventAlerts.value[index] = {
    ...eventAlerts.value[index],
    status,
    workOrderStatus,
    reviewConclusion,
  };

  message.success(successMessage);
}

function confirmEvent() {
  updateEventStatus(
    '已确认',
    '已派单',
    '人工复核通过，事件已确认并转派处置工单。',
    '事件已确认，并已同步生成处置工单',
  );
}

function rejectEvent() {
  updateEventStatus(
    '已驳回',
    '未生成',
    '人工复核判定为误报，事件已驳回归档。',
    '事件已驳回，当前告警将进入误报样本池',
  );
}

function correctEvent() {
  updateEventStatus(
    '待修正',
    '未生成',
    '当前事件需要修正识别类型和证据标签后再确认。',
    '事件已转入修正流程，等待补充修正信息',
  );
}

function createWorkOrder() {
  updateEventStatus(
    selectedEvent.value?.status === '待复核' ? '复核中' : selectedEvent.value?.status || '复核中',
    '处理中',
    '已发起工单联动，等待现场处置反馈。',
    '已创建联动工单，并同步到处置队列',
  );
}

function refreshEventBoard() {
  message.success('事件中心数据已刷新，当前仍为演示数据');
}
</script>

<template>
  <Page :auto-content-height="true">
    <div class="flex flex-col gap-4 p-2">
      <Alert
        message="事件中心已升级为告警复核与工单联动演示页"
        description="当前页面聚焦识别告警进入人工复核后的闭环处理，可与调度中心和 AI 模型中心形成完整演示链。"
        show-icon
        type="error"
      />

      <Card :bordered="false" title="事件筛选与快捷动作">
        <div class="event-toolbar">
          <Space :size="[12, 12]" wrap>
            <Select
              v-model:value="selectedRegion"
              :options="regionOptions"
              class="event-toolbar__select"
            />
            <Select
              v-model:value="selectedLevel"
              :options="levelOptions"
              class="event-toolbar__select"
            />
            <Select
              v-model:value="selectedStatus"
              :options="statusOptions"
              class="event-toolbar__select"
            />
            <Button type="primary" @click="confirmEvent()">快速确认当前事件</Button>
            <Button @click="createWorkOrder()">创建联动工单</Button>
            <Button @click="refreshEventBoard()">刷新事件态势</Button>
          </Space>
          <div class="text-sm text-slate-500">
            当前筛选结果共 {{ filteredEventAlerts.length }} 条事件，当前聚焦
            <span class="font-semibold text-slate-800">
              {{ selectedEvent?.title || '暂无数据' }}
            </span>
          </div>
        </div>
      </Card>

      <Row :gutter="[16, 16]">
        <Col v-for="item in stats" :key="item.title" :lg="6" :md="12" :span="24">
          <Card :bordered="false">
            <Statistic :suffix="item.suffix" :title="item.title" :value="item.value" />
          </Card>
        </Col>
      </Row>

      <Row :gutter="[16, 16]">
        <Col v-for="item in workflows" :key="item.title" :lg="8" :span="24">
          <Card :bordered="false" :title="item.title">
            <div class="text-sm leading-6 text-slate-600">{{ item.description }}</div>
            <div class="mt-4 flex flex-wrap gap-2">
              <Tag v-for="tag in item.tags" :key="tag" color="red">
                {{ tag }}
              </Tag>
            </div>
          </Card>
        </Col>
      </Row>

      <Row :gutter="[16, 16]">
        <Col :xl="15" :span="24">
          <Card :bordered="false" title="告警复核队列">
            <Table
              :columns="eventColumns"
              :data-source="filteredEventAlerts"
              :pagination="false"
              row-key="key"
              size="middle"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'level'">
                  <Tag :color="getLevelColor(record.level)">{{ record.level }}</Tag>
                </template>
                <template v-else-if="column.key === 'status'">
                  <Tag :color="getStatusColor(record.status)">{{ record.status }}</Tag>
                </template>
                <template v-else-if="column.key === 'confidence'">
                  <span>{{ record.confidence }}%</span>
                </template>
                <template v-else-if="column.key === 'action'">
                  <Space>
                    <Button size="small" type="link" @click="openEventDetail(record.key)">
                      查看详情
                    </Button>
                    <Button
                      size="small"
                      type="link"
                      @click="
                        selectedEventKey = record.key;
                        confirmEvent();
                      "
                    >
                      确认
                    </Button>
                    <Button
                      size="small"
                      type="link"
                      @click="
                        selectedEventKey = record.key;
                        createWorkOrder();
                      "
                    >
                      转工单
                    </Button>
                  </Space>
                </template>
              </template>
            </Table>
          </Card>
        </Col>

        <Col :xl="9" :span="24">
          <Card :bordered="false" title="当前事件摘要">
            <template v-if="selectedEvent">
              <div class="flex flex-col gap-4">
                <div class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <div class="flex items-start justify-between gap-3">
                    <div>
                      <div class="text-base font-semibold text-slate-900">
                        {{ selectedEvent.title }}
                      </div>
                      <div class="mt-1 text-sm text-slate-500">
                        {{ selectedEvent.location }}
                      </div>
                    </div>
                    <Tag :color="getStatusColor(selectedEvent.status)">
                      {{ selectedEvent.status }}
                    </Tag>
                  </div>
                  <div class="mt-4">
                    <div class="mb-2 text-xs text-slate-500">人工复核推进度</div>
                    <Progress :percent="reviewProgress" status="active" />
                  </div>
                </div>

                <div class="event-suggestion-panel">
                  <div
                    v-for="item in reviewSuggestions"
                    :key="item"
                    class="event-suggestion-panel__item"
                  >
                    {{ item }}
                  </div>
                </div>

                <Timeline>
                  <Timeline.Item
                    v-for="item in reviewSteps"
                    :key="item.title"
                    :color="item.color"
                  >
                    <div class="text-sm font-semibold text-slate-900">{{ item.title }}</div>
                    <div class="mt-1 text-xs text-slate-500">{{ item.description }}</div>
                  </Timeline.Item>
                </Timeline>
              </div>
            </template>
            <Empty v-else description="当前筛选下暂无事件" />
          </Card>
        </Col>
      </Row>

      <Card :bordered="false" title="人工复核操作台">
        <div class="flex flex-wrap items-center gap-3">
          <Button type="primary" @click="confirmEvent()">确认事件</Button>
          <Button danger @click="rejectEvent()">驳回告警</Button>
          <Button @click="correctEvent()">修正类型</Button>
          <Button @click="createWorkOrder()">转派工单</Button>
          <Button @click="openEventDetail(selectedEvent?.key || '')">查看完整详情</Button>
        </div>
      </Card>

      <Drawer
        v-model:open="detailOpen"
        title="事件详情"
        placement="right"
        width="440"
      >
        <template v-if="selectedEvent">
          <Descriptions :column="1" bordered size="small">
            <DescriptionsItem label="告警名称">
              {{ selectedEvent.title }}
            </DescriptionsItem>
            <DescriptionsItem label="告警类型">
              {{ selectedEvent.type }}
            </DescriptionsItem>
            <DescriptionsItem label="告警等级">
              <Tag :color="getLevelColor(selectedEvent.level)">
                {{ selectedEvent.level }}
              </Tag>
            </DescriptionsItem>
            <DescriptionsItem label="当前状态">
              <Tag :color="getStatusColor(selectedEvent.status)">
                {{ selectedEvent.status }}
              </Tag>
            </DescriptionsItem>
            <DescriptionsItem label="置信度">
              {{ selectedEvent.confidence }}%
            </DescriptionsItem>
            <DescriptionsItem label="归属区域">
              {{ selectedEvent.region }}
            </DescriptionsItem>
            <DescriptionsItem label="联动机场">
              {{ selectedEvent.linkedAirport }}
            </DescriptionsItem>
            <DescriptionsItem label="联动任务">
              {{ selectedEvent.linkedTask }}
            </DescriptionsItem>
            <DescriptionsItem label="发现时间">
              {{ selectedEvent.discoveredAt }}
            </DescriptionsItem>
            <DescriptionsItem label="当前处理人">
              {{ selectedEvent.assignee }}
            </DescriptionsItem>
            <DescriptionsItem label="工单状态">
              <Tag :color="getWorkOrderColor(selectedEvent.workOrderStatus)">
                {{ selectedEvent.workOrderStatus }}
              </Tag>
            </DescriptionsItem>
          </Descriptions>

          <div class="mt-4">
            <div class="mb-2 text-sm font-semibold text-slate-900">证据摘要</div>
            <div class="flex flex-col gap-2">
              <div
                v-for="item in selectedEvent.evidence"
                :key="item"
                class="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600"
              >
                {{ item }}
              </div>
            </div>
          </div>

          <div class="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {{ selectedEvent.suggestion }}
          </div>

          <div class="mt-4 flex flex-wrap gap-3">
            <Button type="primary" @click="confirmEvent()">确认事件</Button>
            <Button danger @click="rejectEvent()">驳回</Button>
            <Button @click="correctEvent()">修正</Button>
            <Button @click="createWorkOrder()">转工单</Button>
          </div>
        </template>
      </Drawer>
    </div>
  </Page>
</template>

<style lang="less" scoped>
.event-toolbar {
  display: flex;
  gap: 16px;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}

.event-toolbar__select {
  width: 160px;
}

.event-suggestion-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.event-suggestion-panel__item {
  padding: 12px 14px;
  color: #334155;
  font-size: 13px;
  background: linear-gradient(135deg, #fff1f2 0%, #f8fafc 100%);
  border: 1px solid #ffe4e6;
  border-radius: 16px;
}
</style>
