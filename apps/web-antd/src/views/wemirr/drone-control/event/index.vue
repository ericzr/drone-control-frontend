<script lang="ts" setup name="DroneEventCenterPage">
import { Page } from '@vben/common-ui';

import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

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

import {
  createWorkorderFromEvent,
  getClosureEventByNoOrId,
  listClosureEvents,
  listClosureWorkorders,
  submitEventReview,
  upsertClosureEvent,
  useEventClosureVersion,
} from '../_services/event-closure-store';
import EventContextBar from '../components/EventContextBar.vue';
import { matchesEventSource } from '../composables/use-event-context';

interface EventAlertItem {
  key: string;
  eventNo: string;
  title: string;
  type: string;
  level: string;
  status: string;
  confidence: number;
  scene: string;
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
  relatedWorkorderId?: string;
  workorderEvidenceCount: number;
  closureSummary?: string;
}

const route = useRoute();
const router = useRouter();
const closureStoreVersion = useEventClosureVersion();

const levelOptions = [
  { label: '全部等级', value: '全部等级' },
  { label: '高', value: '高' },
  { label: '中', value: '中' },
  { label: '低', value: '低' },
];

const statusOptions = [
  { label: '全部状态', value: '全部状态' },
  { label: '待复核', value: '待复核' },
  { label: '已确认', value: '已确认' },
  { label: '已派单', value: '已派单' },
  { label: '处置中', value: '处置中' },
  { label: '已闭环', value: '已闭环' },
  { label: '误报', value: '误报' },
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

const selectedRegion = ref('全部区域');
const selectedLevel = ref('全部等级');
const selectedStatus = ref('全部状态');
const detailOpen = ref(false);
const selectedEventKey = ref('');

const selectedScene = computed(() => (route.query.scene as string) || 'all');
const selectedSource = computed(() => (route.query.source as string) || 'all');

function parseDateTime(input: string) {
  return new Date(input.replace(/-/g, '/'));
}

function formatDateTime(date = new Date()) {
  return date.toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-');
}

function toLevelLabel(level: string) {
  if (level === '重大') return '高';
  if (level === '较大') return '中';
  return '低';
}

function getWorkorderStatusLabel(status?: number) {
  return ['待指派', '待处置', '处置中', '待复核', '已归档'][status ?? -1] || '待生成';
}

function buildReviewConclusion(
  reviewResult?: string,
  reviewRemark?: string,
  closureSummary?: string,
) {
  if (closureSummary) return closureSummary;
  if (reviewRemark) return reviewRemark;
  if (reviewResult) return reviewResult;
  return '等待人工复核给出结论。';
}

function buildEvidence(
  reviewRemark: string | undefined,
  evidences: { summary: string; title: string }[],
  closureSummary?: string,
) {
  const items = [
    ...evidences.map((item) => item.summary || item.title),
    ...(reviewRemark ? [`复核备注：${reviewRemark}`] : []),
    ...(closureSummary ? [`闭环摘要：${closureSummary}`] : []),
  ].filter(Boolean);

  return items.length > 0 ? items : ['待补充现场图像、视频或文本说明'];
}

function buildSuggestion(item: {
  scene: string;
  status: string;
  region: string;
  relatedWorkorderId?: string;
}) {
  if (item.status === '待复核') {
    return `建议优先对 ${item.scene} 场景进行人工复核，并确认 ${item.region} 点位是否需要派单。`;
  }
  if (item.relatedWorkorderId) {
    return `已生成联动工单 ${item.relatedWorkorderId}，建议持续跟踪现场回传与闭环摘要。`;
  }
  if (item.status === '误报') {
    return '当前事件已判定为误报，建议进入误报样本池，用于后续模型优化。';
  }
  return `建议围绕 ${item.scene} 场景补充证据与处置留痕，形成可导出的闭环链路。`;
}

function getDefaultAssignee(scene: string) {
  if (scene.includes('森林')) return '林区处置组';
  if (scene.includes('交通')) return '交管联动组';
  if (scene.includes('环境') || scene.includes('水域')) return '生态巡检组';
  return '综合处置组';
}

const closureEvents = computed(() => {
  closureStoreVersion.value;
  return listClosureEvents().sort((left, right) => {
    return (
      parseDateTime(right.eventTime || right.createTime).getTime() -
      parseDateTime(left.eventTime || left.createTime).getTime()
    );
  });
});

const closureWorkorders = computed(() => {
  closureStoreVersion.value;
  return listClosureWorkorders();
});

const workorderMap = computed(() => {
  return new Map(closureWorkorders.value.map((item) => [item.eventId, item]));
});

const regionOptions = computed(() => {
  const options = closureEvents.value.map((item) => item.region);
  return [
    { label: '全部区域', value: '全部区域' },
    ...[...new Set(options)].map((item) => ({ label: item, value: item })),
  ];
});

const eventAlerts = computed<EventAlertItem[]>(() => {
  return closureEvents.value.map((item) => {
    const workorder = workorderMap.value.get(item.eventNo);
    return {
      key: item.eventNo,
      eventNo: item.eventNo,
      title: `${item.eventType}事件`,
      type: item.eventType,
      level: toLevelLabel(item.level),
      status: item.status,
      confidence: item.confidence,
      scene: item.scene,
      region: item.region,
      source: item.source,
      linkedTask: `${item.scene}联动任务`,
      linkedAirport: item.sourceDrone || `${item.region}值守单元`,
      location: item.location,
      discoveredAt: item.eventTime || item.createTime,
      assignee: workorder?.assignee || item.reviewer || '待分配',
      evidence: buildEvidence(item.reviewRemark, workorder?.evidences || [], workorder?.closureSummary),
      suggestion: buildSuggestion(item),
      workOrderStatus: getWorkorderStatusLabel(workorder?.status),
      reviewConclusion: buildReviewConclusion(
        item.reviewResult,
        item.reviewRemark,
        workorder?.closureSummary,
      ),
      relatedWorkorderId: workorder?.id,
      workorderEvidenceCount: workorder?.evidences.length || 0,
      closureSummary: workorder?.closureSummary,
    };
  });
});

const stats = computed(() => {
  const events = closureEvents.value;
  const workorders = closureWorkorders.value;
  return [
    { title: '累计事件', value: events.length, suffix: '件' },
    {
      title: '待人工复核',
      value: events.filter((item) => item.status === '待复核').length,
      suffix: '件',
    },
    {
      title: '运行中工单',
      value: workorders.filter((item) => item.status < 4).length,
      suffix: '单',
    },
    {
      title: 'AI 来源事件',
      value: events.filter((item) => item.source.includes('AI')).length,
      suffix: '件',
    },
  ];
});

const workflows = computed(() => {
  const pendingReview = closureEvents.value.filter((item) => item.status === '待复核').length;
  const activeWorkorders = closureWorkorders.value.filter((item) => item.status < 4).length;
  const evidenceCount = closureWorkorders.value.reduce(
    (total, item) => total + item.evidences.length,
    0,
  );
  return [
    {
      title: '复核池看板',
      tags: [`待复核 ${pendingReview} 件`, '确认', '误报', '补证'],
      description: '首页直接读取共享事件会话，适合值班席快速锁定待复核事件。',
    },
    {
      title: '工单联动',
      tags: [`运行中 ${activeWorkorders} 单`, '派单', '督办', '回执'],
      description: '复核后的事件可直接生成工单，并同步进入工单详情与处置链路。',
    },
    {
      title: '闭环留痕',
      tags: [`证据 ${evidenceCount} 份`, '图片', '视频', '摘要'],
      description: '工单证据、闭环摘要与报告页共享同一份状态源，便于演示与汇报。',
    },
  ];
});

const closureStats = computed(() => {
  const events = closureEvents.value;
  const workorders = closureWorkorders.value;
  return [
    { title: '闭环事件', value: events.filter((item) => item.status === '已闭环').length, suffix: '件' },
    { title: '误报样本', value: events.filter((item) => item.status === '误报').length, suffix: '件' },
    {
      title: '处置证据',
      value: workorders.reduce((total, item) => total + item.evidences.length, 0),
      suffix: '份',
    },
    { title: '已归档工单', value: workorders.filter((item) => item.status === 4).length, suffix: '单' },
  ];
});

const filteredEventAlerts = computed(() => {
  return eventAlerts.value.filter((item) => {
    const matchScene = selectedScene.value === 'all' || item.scene === selectedScene.value;
    const matchSource = matchesEventSource(item.source, selectedSource.value);
    const matchRegion =
      selectedRegion.value === '全部区域' || item.region === selectedRegion.value;
    const matchLevel =
      selectedLevel.value === '全部等级' || item.level === selectedLevel.value;
    const matchStatus =
      selectedStatus.value === '全部状态' || item.status === selectedStatus.value;
    return matchScene && matchSource && matchRegion && matchLevel && matchStatus;
  });
});

const selectedEvent = computed(() => {
  return (
    filteredEventAlerts.value.find((item) => item.key === selectedEventKey.value) ||
    filteredEventAlerts.value[0] ||
    null
  );
});

watch(
  filteredEventAlerts,
  (list) => {
    if (list.some((item) => item.key === selectedEventKey.value)) return;
    selectedEventKey.value = list[0]?.key || '';
  },
  { immediate: true },
);

const reviewProgress = computed(() => {
  const status = selectedEvent.value?.status;
  if (status === '已闭环') return 100;
  if (status === '处置中') return 82;
  if (status === '已派单') return 68;
  if (status === '已确认') return 100;
  if (status === '误报') return 100;
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
        ? `${current.scene} · ${current.linkedAirport} / ${current.linkedTask}`
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
        ? `工单状态：${current.workOrderStatus} · 证据 ${current.workorderEvidenceCount} 份`
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
    `${current.scene} 场景当前工单状态为 ${current.workOrderStatus}`,
  ];
});

function getLevelColor(level: string) {
  if (level === '高') return 'red';
  if (level === '中') return 'orange';
  return 'blue';
}

function getStatusColor(status: string) {
  if (status === '已闭环') return 'green';
  if (status === '已派单') return 'processing';
  if (status === '处置中') return 'cyan';
  if (status === '已确认') return 'green';
  if (status === '误报') return 'default';
  return 'orange';
}

function getWorkOrderColor(status: string) {
  if (status === '已归档') return 'green';
  if (status === '待复核') return 'gold';
  if (status === '处理中') return 'processing';
  if (status === '处置中') return 'cyan';
  if (status === '待处置') return 'blue';
  if (status === '待指派') return 'orange';
  if (status === '待生成') return 'orange';
  return 'default';
}

function openEventDetail(eventKey: string) {
  if (!eventKey) return;
  selectedEventKey.value = eventKey;
  detailOpen.value = true;
}

function getSelectedClosureEvent() {
  if (!selectedEventKey.value) return null;
  return getClosureEventByNoOrId(selectedEventKey.value);
}

function confirmEvent() {
  const current = getSelectedClosureEvent();
  if (!current) {
    message.warning('当前没有可操作的事件');
    return;
  }
  submitEventReview({
    eventNo: current.eventNo,
    reviewer: '值班长',
    reviewResult: '确认有效',
    reviewRemark: current.relatedWorkorderId
      ? '首页快捷确认，继续跟踪处置回执。'
      : '首页快捷确认，等待创建联动工单。',
  });
  message.success('事件已确认，状态已同步到复核与工单链路');
}

function rejectEvent() {
  const current = getSelectedClosureEvent();
  if (!current) {
    message.warning('当前没有可操作的事件');
    return;
  }
  submitEventReview({
    eventNo: current.eventNo,
    reviewer: '值班长',
    reviewResult: '误报排除',
    reviewRemark: '首页快捷驳回，已转入误报样本池。',
  });
  message.success('事件已驳回，误报样本已写入共享会话');
}

function correctEvent() {
  const current = getSelectedClosureEvent();
  if (!current) {
    message.warning('当前没有可操作的事件');
    return;
  }
  upsertClosureEvent({
    ...current,
    reviewer: '值班长',
    reviewResult: '待补充复核',
    reviewRemark: '首页已标记为待补充图像与类型修正，请补充后再次确认。',
    reviewTime: formatDateTime(),
    status: '待复核',
  });
  message.success('事件已标记为待补充复核，等待补证后再次确认');
}

function createWorkOrder() {
  const current = getSelectedClosureEvent();
  if (!current) {
    message.warning('当前没有可操作的事件');
    return;
  }
  if (current.status === '误报') {
    message.warning('误报事件不能转派工单');
    return;
  }
  if (current.relatedWorkorderId) {
    message.info('当前事件已生成联动工单，正在打开工单详情');
    router.push(`/event/workorder-detail?id=${current.relatedWorkorderId}`);
    return;
  }
  const workorder = createWorkorderFromEvent({
    eventNo: current.eventNo,
    priority:
      current.level === '重大'
        ? '一级'
        : current.level === '较大'
          ? '二级'
          : '三级',
    assignee: getDefaultAssignee(current.scene),
    note: `${current.scene} 场景事件联动处置，需补充现场证据并回写闭环摘要。`,
  });
  if (!workorder) {
    message.error('工单创建失败，请稍后再试');
    return;
  }
  message.success(`已创建联动工单 ${workorder.id}`);
  router.push(`/event/workorder-detail?id=${workorder.id}`);
}

function refreshEventBoard() {
  message.success('事件中心态势已刷新，当前页面已与共享闭环状态同步');
}
</script>

<template>
  <Page :auto-content-height="true">
    <div class="flex flex-col gap-4 p-2">
      <Alert
        message="事件中心首页已切换为共享闭环态势页"
        description="当前页面直接读取事件、复核、工单共享会话状态，首页动作会同步回写到复核页、工单页和报告页。"
        show-icon
        type="error"
      />

      <EventContextBar current="overview" />

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
        <Col v-for="item in closureStats" :key="item.title" :lg="6" :md="12" :span="24">
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
                    <Button size="small" type="link" @click="router.push('/event/review')">
                      去复核
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
            <DescriptionsItem label="关联工单">
              {{ selectedEvent.relatedWorkorderId || '未生成' }}
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
            <Button
              v-if="selectedEvent.relatedWorkorderId"
              @click="router.push(`/event/workorder-detail?id=${selectedEvent.relatedWorkorderId}`)"
            >
              查看工单
            </Button>
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
