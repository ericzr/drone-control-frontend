<script lang="ts" setup name="EventDetailPage">
import { Page } from '@vben/common-ui';

import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Descriptions,
  DescriptionsItem,
  Empty,
  Modal,
  Row,
  Select,
  SelectOption,
  Space,
  Steps,
  Tag,
  Textarea,
  Timeline,
  TimelineItem,
  message,
} from 'ant-design-vue';

import {
  createWorkorderFromEvent,
  getClosureEventByNoOrId,
  listClosureWorkorders,
  submitEventReview,
  upsertClosureEvent,
  useEventClosureVersion,
} from '../../_services/event-closure-store';
import EventContextBar from '../../components/EventContextBar.vue';

interface LegacyEventRecord {
  confidence: number;
  coordinate: string;
  detectTime: string;
  device: string;
  id: string;
  level: 'critical' | 'info' | 'warning';
  location: string;
  model: string;
  pilot: string;
  scene: string;
  source: string;
  status: '已派单' | '已确认' | '已闭环' | '待复核' | '误报' | '处置中';
  type: string;
}

interface DetailProfile {
  compareAfter: string;
  compareBefore: string;
  coordinate: string;
  device: string;
  dispatchHint: string;
  model: string;
  pilot: string;
  thermal: string;
}

const route = useRoute();
const router = useRouter();
const closureStoreVersion = useEventClosureVersion();

const compareSlider = ref(56);
const selectedAssignee = ref('');
const actionNote = ref('');
const reviewNote = ref('');

const assigneeOptions = ['张伟', '李明', '王芳', '赵强', '刘洋', '陈静'];

const legacyEvents: Record<string, LegacyEventRecord> = {
  'EVT-20260413-001': {
    id: 'EVT-20260413-001',
    type: '违停',
    level: 'warning',
    scene: '交通巡查',
    status: '已派单',
    location: '高新路与科技路交叉口',
    coordinate: '108.9400, 34.2650',
    device: '大航蜂 M300-01',
    pilot: '李明',
    detectTime: '2026-04-13 14:31:00',
    confidence: 96,
    model: '车辆违停检测 v3.2',
    source: 'AI识别',
  },
  'EVT-20260413-003': {
    id: 'EVT-20260413-003',
    type: '烟火',
    level: 'critical',
    scene: '森林防火',
    status: '已闭环',
    location: '北坡 37° 区域',
    coordinate: '108.9300, 34.2700',
    device: '大航蜂 M30T-01',
    pilot: '张伟',
    detectTime: '2026-04-13 10:05:00',
    confidence: 92,
    model: '无人机小目标检测 v11s',
    source: '卫星热点',
  },
  'EVT-20260412-004': {
    id: 'EVT-20260412-004',
    type: '排污',
    level: 'warning',
    scene: '环境监测',
    status: '处置中',
    location: '排污口 A-3',
    coordinate: '108.9050, 34.2380',
    device: '大航蜂 M30-06',
    pilot: '王芳',
    detectTime: '2026-04-12 16:35:00',
    confidence: 92,
    model: '排污识别 v2.4',
    source: 'AI识别',
  },
};

const defaultLegacyEvent: LegacyEventRecord = legacyEvents['EVT-20260413-003'] as LegacyEventRecord;

const detailProfiles: Record<string, DetailProfile> = {
  default: {
    compareAfter: '当前帧 · AI 检测叠框',
    compareBefore: '历史底片 · 同点位复查',
    coordinate: '108.9400, 34.2600',
    device: '大航蜂 M300-01',
    dispatchHint: '建议调用最近机场值守资源进行二次核查，并保留过程影像。',
    model: '平台识别模型',
    pilot: '值守飞手',
    thermal: '热力层 · 异常区域增强',
  },
  交通巡查: {
    compareAfter: '当前帧 · 路口违停框选',
    compareBefore: '历史底片 · 早高峰路口快照',
    coordinate: '108.9400, 34.2650',
    device: '大航蜂 M300-01',
    dispatchHint: '建议联动交管席与现场巡查员，优先完成通知与拖移回执。',
    model: '车辆违停检测 v3.2',
    pilot: '李明',
    thermal: '车流热力层 · 路口拥堵热区',
  },
  城管巡检: {
    compareAfter: '当前帧 · 占道经营识别',
    compareBefore: '历史底片 · 步行街白天巡查',
    coordinate: '108.9250, 34.2600',
    device: '大航蜂 M300-07',
    dispatchHint: '建议协同城管网格员到场核实，并保留摊点分布与回执。',
    model: '占道检测 v3.1',
    pilot: '陈静',
    thermal: '密度热力层 · 人流聚集分析',
  },
  森林防火: {
    compareAfter: '当前帧 · 烟点疑似轮廓',
    compareBefore: '历史底片 · 林区正常状态',
    coordinate: '108.9300, 34.2700',
    device: '大航蜂 M30T-01',
    dispatchHint: '建议先调度红外复核，确认后同步地面应急组与机巢起飞资源。',
    model: '无人机小目标检测 v11s',
    pilot: '张伟',
    thermal: '红外热力层 · 疑似热源增强',
  },
  环境监测: {
    compareAfter: '当前帧 · 排污口异常识别',
    compareBefore: '历史底片 · 上轮取证影像',
    coordinate: '108.9050, 34.2380',
    device: '大航蜂 M30-06',
    dispatchHint: '建议联合生态巡检席与现场取样组，沉淀证据后转工单督办。',
    model: '排污识别 v2.4',
    pilot: '王芳',
    thermal: '水域热力层 · 可疑排放带',
  },
  水域监测: {
    compareAfter: '当前帧 · 漂浮物聚集识别',
    compareBefore: '历史底片 · 河道正常状态',
    coordinate: '108.9220, 34.2460',
    device: '大航蜂 M350-03',
    dispatchHint: '建议联动水务处置组并补充近距离俯拍，形成清理前后对比证据。',
    model: '漂浮物识别 v2.0',
    pilot: '刘洋',
    thermal: '密度热力层 · 漂浮物聚集带',
  },
};

const statusSteps = [
  { title: '识别上报' },
  { title: '待复核' },
  { title: '已确认' },
  { title: '已派单' },
  { title: '处置中' },
  { title: '已闭环' },
];

const queryId = computed(() => (route.query.id as string) || 'EVT-20260413-003');

const closureEvent = computed(() => {
  closureStoreVersion.value;
  return getClosureEventByNoOrId(queryId.value);
});

const relatedWorkorder = computed(() => {
  closureStoreVersion.value;
  return listClosureWorkorders().find((item) => item.eventId === queryId.value) || null;
});

function getProfile(scene: string): DetailProfile {
  return detailProfiles[scene] ?? detailProfiles.default!;
}

function levelColor(level: string) {
  if (level === '重大' || level === 'critical') return 'red';
  if (level === '较大' || level === 'warning') return 'orange';
  return 'blue';
}

function statusColor(status: string) {
  if (status === '已闭环') return 'green';
  if (status === '已派单' || status === '处置中') return 'processing';
  if (status === '误报') return 'default';
  if (status === '已确认') return 'cyan';
  return 'orange';
}

function getStatusStep(status: string) {
  if (status === '待复核') return 1;
  if (status === '已确认') return 2;
  if (status === '已派单') return 3;
  if (status === '处置中') return 4;
  if (status === '已闭环') return 5;
  if (status === '误报') return 5;
  return 0;
}

function defaultAssignee(scene: string) {
  if (scene.includes('森林')) return '张伟';
  if (scene.includes('交通')) return '李明';
  if (scene.includes('环境') || scene.includes('水域')) return '王芳';
  return '陈静';
}

function formatNow() {
  return new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-');
}

const detail = computed(() => {
  const closure = closureEvent.value;
  if (closure) {
    const profile = getProfile(closure.scene);
    return {
      id: closure.eventNo,
      type: closure.eventType,
      level: closure.level,
      scene: closure.scene,
      status: closure.status,
      location: closure.location,
      coordinate: profile.coordinate,
      device: closure.sourceDrone || profile.device,
      pilot: profile.pilot,
      detectTime: closure.eventTime || closure.createTime,
      confidence: closure.confidence,
      model: profile.model,
      source: closure.source,
      reviewer: closure.reviewer || '待复核',
      reviewResult: closure.reviewResult || '待人工复核',
      reviewRemark: closure.reviewRemark || '当前尚未提交复核意见。',
      dispatchHint: profile.dispatchHint,
      compareAfter: profile.compareAfter,
      compareBefore: profile.compareBefore,
      thermal: profile.thermal,
    };
  }

  const fallback = legacyEvents[queryId.value] ?? defaultLegacyEvent;
  const profile = getProfile(fallback.scene);
  return {
    id: fallback.id,
    type: fallback.type,
    level: fallback.level,
    scene: fallback.scene,
    status: fallback.status,
    location: fallback.location,
    coordinate: fallback.coordinate,
    device: fallback.device,
    pilot: fallback.pilot,
    detectTime: fallback.detectTime,
    confidence: fallback.confidence,
    model: fallback.model,
    source: fallback.source,
    reviewer: '待复核',
    reviewResult: '演示数据',
    reviewRemark: '当前为历史占位详情，优先演示共享闭环事件。',
    dispatchHint: profile.dispatchHint,
    compareAfter: profile.compareAfter,
    compareBefore: profile.compareBefore,
    thermal: profile.thermal,
  };
});

const evidenceHighlights = computed(() => {
  if (relatedWorkorder.value) {
    const evidences = relatedWorkorder.value.evidences.slice(0, 3).map((item) => ({
      title: item.title,
      note: `${item.type} · ${item.uploadedAt}`,
      summary: item.summary,
    }));
    if (evidences.length > 0) return evidences;
  }
  return [
    {
      title: '当前帧识别截图',
      note: 'AI 自动沉淀',
      summary: `${detail.value.type} 当前帧已完成识别框选与置信度计算，可用于复核对比。`,
    },
    {
      title: '调度联动建议',
      note: '系统生成',
      summary: detail.value.dispatchHint,
    },
  ];
});

const imageryPanels = computed(() => {
  return [
    {
      title: detail.value.compareAfter,
      subtitle: '实时帧',
      accent: 'rgba(248, 113, 113, 0.55)',
    },
    {
      title: detail.value.compareBefore,
      subtitle: '历史帧',
      accent: 'rgba(96, 165, 250, 0.45)',
    },
    {
      title: detail.value.thermal,
      subtitle: '辅助分析',
      accent: 'rgba(45, 212, 191, 0.45)',
    },
  ];
});

const aiInsights = computed(() => {
  return [
    { label: '识别模型', value: detail.value.model },
    { label: '识别来源', value: detail.value.source },
    { label: '检测耗时', value: `${detail.value.confidence >= 90 ? 12 : 18} ms` },
    { label: '标注框', value: detail.value.scene.includes('森林') ? '左上 (132, 76) → 右下 (316, 228)' : '左上 (118, 84) → 右下 (348, 214)' },
  ];
});

const eventTimeline = computed(() => {
  const items: Array<{ color: string; note: string; time: string; title: string }> = [
    {
      color: 'blue',
      title: 'AI 识别上报',
      time: detail.value.detectTime,
      note: `${detail.value.model} 输出 ${detail.value.type}，当前置信度 ${detail.value.confidence}%`,
    },
  ];

  if (closureEvent.value?.reviewTime) {
    items.push({
      color: 'gold',
      title: '人工复核',
      time: closureEvent.value.reviewTime,
      note: `${detail.value.reviewer} · ${detail.value.reviewRemark}`,
    });
  }

  if (relatedWorkorder.value) {
    items.push({
      color: 'cyan',
      title: '联动工单',
      time: relatedWorkorder.value.createTime,
      note: `${relatedWorkorder.value.id} · ${relatedWorkorder.value.assignee || '待指派'}`,
    });

    for (const log of relatedWorkorder.value.logs.slice(-4)) {
      items.push({
        color: log.action.includes('归档') || log.action.includes('通过') ? 'green' : 'gray',
        title: log.action,
        time: log.time,
        note: `${log.user}${log.note ? ` · ${log.note}` : ''}`,
      });
    }
  }

  if (detail.value.status === '误报') {
    items.push({
      color: 'default',
      title: '误报归档',
      time: closureEvent.value?.reviewTime || formatNow(),
      note: '当前事件已进入误报样本池，用于模型后续优化。',
    });
  }

  return items;
});

const currentStatusStep = computed(() => getStatusStep(detail.value.status));

const eventContextQuery = computed(() => {
  const nextQuery: Record<string, string> = {};
  const scene = route.query.scene as string | undefined;
  const source = route.query.source as string | undefined;
  if (scene) nextQuery.scene = scene;
  if (source) nextQuery.source = source;
  return nextQuery;
});

function pushWithContext(path: string, query: Record<string, string> = {}) {
  router.push({
    path,
    query: {
      ...eventContextQuery.value,
      ...query,
    },
  });
}

function handleConfirm() {
  if (!closureEvent.value) {
    message.warning('当前详情未接入共享闭环数据');
    return;
  }
  submitEventReview({
    eventNo: closureEvent.value.eventNo,
    reviewer: '当前用户',
    reviewResult: '确认有效',
    reviewRemark: reviewNote.value || '详情页确认有效，建议尽快联动工单处置。',
  });
  reviewNote.value = '';
  message.success('事件已确认，并同步写回共享复核状态');
}

function handleReject() {
  if (!closureEvent.value) {
    message.warning('当前详情未接入共享闭环数据');
    return;
  }
  Modal.confirm({
    title: '确认驳回事件',
    content: '驳回后将标记为误报并进入误报样本池。',
    onOk() {
      submitEventReview({
        eventNo: closureEvent.value!.eventNo,
        reviewer: '当前用户',
        reviewResult: '误报排除',
        reviewRemark: reviewNote.value || '详情页驳回，已转误报样本池。',
      });
      reviewNote.value = '';
      message.success('事件已驳回并标记为误报');
    },
  });
}

function handleMarkPending() {
  if (!closureEvent.value) {
    message.warning('当前详情未接入共享闭环数据');
    return;
  }
  upsertClosureEvent({
    ...closureEvent.value,
    status: '待复核',
    reviewer: '当前用户',
    reviewResult: '待补充复核',
    reviewRemark: reviewNote.value || '需补充近景图像、位置与处置备注后再次确认。',
    reviewTime: formatNow(),
  });
  reviewNote.value = '';
  message.success('事件已标记为待补充复核');
}

function handleAssign() {
  if (!closureEvent.value) {
    message.warning('当前详情未接入共享闭环数据');
    return;
  }
  if (relatedWorkorder.value) {
    router.push(`/event/workorder-detail?id=${relatedWorkorder.value.id}`);
    return;
  }

  const workorder = createWorkorderFromEvent({
    eventNo: closureEvent.value.eventNo,
    priority:
      closureEvent.value.level === '重大'
        ? '一级'
        : closureEvent.value.level === '较大'
          ? '二级'
          : '三级',
    assignee: selectedAssignee.value || defaultAssignee(detail.value.scene),
    note: actionNote.value || `${detail.value.scene} 场景事件联动处置，需补充证据并回写闭环摘要。`,
  });
  if (!workorder) {
    message.error('工单创建失败，请稍后再试');
    return;
  }
  actionNote.value = '';
  selectedAssignee.value = '';
  message.success(`已生成联动工单 ${workorder.id}`);
  pushWithContext('/event/workorder-detail', { id: workorder.id });
}

function goBack() {
  router.back();
}
</script>

<template>
  <Page>
    <div class="flex flex-col gap-4 p-2">
      <EventContextBar current="" />

      <Alert
        type="info"
        show-icon
        message="事件详情页已升级为共享闭环详情中枢"
        description="这一页已和事件首页、复核页、工单页、报告页共用同一份状态，适合用于客户演示事件全流程。"
      />

      <Card :bordered="false">
        <div class="detail-header">
          <div>
            <div class="flex flex-wrap items-center gap-3">
              <span class="text-lg font-bold text-slate-900">{{ detail.id }}</span>
              <Tag :color="levelColor(detail.level)">
                {{ detail.level === '重大' || detail.level === 'critical' ? '重大' : detail.level === '较大' || detail.level === 'warning' ? '较大' : '一般' }}
              </Tag>
              <Tag color="blue">{{ detail.scene }}</Tag>
              <Tag :color="statusColor(detail.status)">{{ detail.status }}</Tag>
            </div>
            <div class="mt-2 text-sm text-slate-500">
              {{ detail.type }} · {{ detail.location }} · {{ detail.detectTime }}
            </div>
            <div class="mt-3 flex flex-wrap gap-2">
              <Tag color="purple">置信度 {{ detail.confidence }}%</Tag>
              <Tag color="cyan">{{ detail.source }}</Tag>
              <Tag v-if="relatedWorkorder" color="green">{{ relatedWorkorder.id }}</Tag>
            </div>
          </div>
          <Space>
            <Button v-if="relatedWorkorder" @click="pushWithContext('/event/workorder-detail', { id: relatedWorkorder.id })">
              查看工单
            </Button>
            <Button @click="pushWithContext('/event/report')">查看报告</Button>
            <Button @click="goBack">返回列表</Button>
          </Space>
        </div>
      </Card>

      <Card :bordered="false" title="闭环进度">
        <Steps :current="currentStatusStep" size="small" :items="statusSteps" />
      </Card>

      <Row :gutter="[16, 16]">
        <Col :xl="10" :span="24">
          <Card :bordered="false" title="事件档案">
            <Descriptions bordered :column="1" size="small">
              <DescriptionsItem label="事件编号">{{ detail.id }}</DescriptionsItem>
              <DescriptionsItem label="事件类型">{{ detail.type }}</DescriptionsItem>
              <DescriptionsItem label="当前状态">
                <Tag :color="statusColor(detail.status)">{{ detail.status }}</Tag>
              </DescriptionsItem>
              <DescriptionsItem label="应用场景">{{ detail.scene }}</DescriptionsItem>
              <DescriptionsItem label="事件位置">{{ detail.location }}</DescriptionsItem>
              <DescriptionsItem label="坐标">{{ detail.coordinate }}</DescriptionsItem>
              <DescriptionsItem label="来源设备">{{ detail.device }}</DescriptionsItem>
              <DescriptionsItem label="值守飞手">{{ detail.pilot }}</DescriptionsItem>
              <DescriptionsItem label="发现时间">{{ detail.detectTime }}</DescriptionsItem>
              <DescriptionsItem label="检测模型">{{ detail.model }}</DescriptionsItem>
              <DescriptionsItem label="复核人">{{ detail.reviewer }}</DescriptionsItem>
              <DescriptionsItem label="复核结论">{{ detail.reviewResult }}</DescriptionsItem>
              <DescriptionsItem label="复核意见">{{ detail.reviewRemark }}</DescriptionsItem>
            </Descriptions>
          </Card>

          <Card :bordered="false" title="复核与派单操作" class="mt-4">
            <div class="action-block">
              <div class="action-block__hint">
                {{ detail.dispatchHint }}
              </div>

              <Textarea
                v-model:value="reviewNote"
                :rows="3"
                placeholder="补充复核说明、修正建议或派单备注..."
              />

              <div class="flex flex-wrap gap-2">
                <Button
                  v-if="detail.status === '待复核'"
                  type="primary"
                  @click="handleConfirm"
                >
                  确认事件
                </Button>
                <Button
                  v-if="detail.status === '待复核'"
                  danger
                  @click="handleReject"
                >
                  驳回误报
                </Button>
                <Button
                  v-if="detail.status === '待复核' || detail.status === '已确认'"
                  @click="handleMarkPending"
                >
                  标记待补证
                </Button>
              </div>

              <div
                v-if="detail.status === '已确认' || detail.status === '已派单' || detail.status === '处置中'"
                class="dispatch-box"
              >
                <div class="grid gap-3 md:grid-cols-2">
                  <Select
                    v-model:value="selectedAssignee"
                    placeholder="选择处理人，不选则按场景默认指派"
                    size="small"
                  >
                    <SelectOption
                      v-for="name in assigneeOptions"
                      :key="name"
                      :value="name"
                    >
                      {{ name }}
                    </SelectOption>
                  </Select>
                  <Textarea
                    v-model:value="actionNote"
                    :rows="2"
                    placeholder="填写派单备注或处置要求..."
                  />
                </div>
                <Space>
                  <Button type="primary" @click="handleAssign">
                    {{ relatedWorkorder ? '打开关联工单' : '生成联动工单' }}
                  </Button>
                  <Button
                    v-if="detail.status === '处置中' && relatedWorkorder"
                    @click="pushWithContext('/event/workorder-detail', { id: relatedWorkorder.id })"
                  >
                    查看处置进度
                  </Button>
                </Space>
              </div>

              <div v-if="detail.status === '已闭环'" class="status-banner status-banner--success">
                当前事件已完成闭环，可前往报告页或工单页查看完整摘要。
              </div>
              <div v-if="detail.status === '误报'" class="status-banner">
                当前事件已归入误报样本池，可作为后续模型优化样本。
              </div>
            </div>
          </Card>

          <Card :bordered="false" title="证据摘要" class="mt-4">
            <div class="evidence-list">
              <div
                v-for="item in evidenceHighlights"
                :key="item.title"
                class="evidence-item"
              >
                <div class="flex items-center justify-between gap-3">
                  <div class="font-medium text-slate-900">{{ item.title }}</div>
                  <span class="text-xs text-slate-400">{{ item.note }}</span>
                </div>
                <div class="mt-2 text-sm leading-6 text-slate-600">
                  {{ item.summary }}
                </div>
              </div>
            </div>
          </Card>
        </Col>

        <Col :xl="14" :span="24">
          <Card :bordered="false" title="现场影像对比">
            <div class="compare-container">
              <div class="compare-viewport">
                <div class="compare-layer compare-layer--history">
                  <div class="compare-placeholder compare-placeholder--history">
                    <div class="compare-badge">历史底片</div>
                    <span>{{ detail.compareBefore }}</span>
                  </div>
                </div>
                <div
                  class="compare-layer compare-layer--current"
                  :style="{ clipPath: `inset(0 ${100 - compareSlider}% 0 0)` }"
                >
                  <div class="compare-placeholder compare-placeholder--current">
                    <div class="compare-box" />
                    <div class="compare-badge compare-badge--danger">当前识别帧</div>
                    <span>{{ detail.compareAfter }}</span>
                  </div>
                </div>
                <div class="compare-divider" :style="{ left: `${compareSlider}%` }" />
              </div>

              <input
                v-model="compareSlider"
                class="compare-slider"
                type="range"
                min="0"
                max="100"
              />

              <div class="compare-grid">
                <div
                  v-for="panel in imageryPanels"
                  :key="panel.title"
                  class="compare-tile"
                >
                  <div class="compare-tile__preview" :style="{ background: `linear-gradient(135deg, ${panel.accent}, rgba(15,23,42,0.95))` }" />
                  <div class="mt-3 flex items-center justify-between gap-3">
                    <div>
                      <div class="text-sm font-medium text-slate-900">{{ panel.title }}</div>
                      <div class="mt-1 text-xs text-slate-400">{{ panel.subtitle }}</div>
                    </div>
                    <Badge status="processing" />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Row :gutter="[16, 16]" class="mt-0.5">
            <Col :lg="12" :span="24">
              <Card :bordered="false" title="AI 标注信息" class="mt-4">
                <Descriptions bordered :column="1" size="small">
                  <DescriptionsItem
                    v-for="item in aiInsights"
                    :key="item.label"
                    :label="item.label"
                  >
                    <template v-if="item.label === '检测耗时'">
                      <Tag color="green">{{ item.value }}</Tag>
                    </template>
                    <template v-else>
                      {{ item.value }}
                    </template>
                  </DescriptionsItem>
                </Descriptions>
              </Card>
            </Col>

            <Col :lg="12" :span="24">
              <Card :bordered="false" title="关联工单摘要" class="mt-4">
                <template v-if="relatedWorkorder">
                  <div class="workorder-summary">
                    <div class="flex flex-wrap items-center gap-2">
                      <Tag color="blue">{{ relatedWorkorder.id }}</Tag>
                      <Tag :color="relatedWorkorder.status === 4 ? 'green' : 'orange'">
                        {{ ['待指派', '待处置', '处置中', '待复核', '已归档'][relatedWorkorder.status] }}
                      </Tag>
                    </div>
                    <div class="text-sm text-slate-600">
                      {{ relatedWorkorder.title }}
                    </div>
                    <div class="text-sm text-slate-500">
                      处理人：{{ relatedWorkorder.assignee || '待指派' }} · 证据 {{ relatedWorkorder.evidences.length }} 份
                    </div>
                    <div class="workorder-summary__note">
                      {{ relatedWorkorder.closureSummary || '当前工单尚未沉淀闭环摘要，可在工单详情页补充。' }}
                    </div>
                    <Button
                      type="primary"
                      ghost
                      @click="pushWithContext('/event/workorder-detail', { id: relatedWorkorder.id })"
                    >
                      打开工单详情
                    </Button>
                  </div>
                </template>
                <Empty v-else description="当前事件尚未关联工单" />
              </Card>
            </Col>
          </Row>

          <Card :bordered="false" title="处置轨迹" class="mt-4">
            <Timeline>
              <TimelineItem
                v-for="item in eventTimeline"
                :key="`${item.title}-${item.time}`"
                :color="item.color"
              >
                <div class="flex flex-wrap items-center gap-2">
                  <div class="font-medium text-slate-900">{{ item.title }}</div>
                  <span class="text-xs text-slate-400">{{ item.time }}</span>
                </div>
                <div class="mt-1 text-sm leading-6 text-slate-600">
                  {{ item.note }}
                </div>
              </TimelineItem>
            </Timeline>
          </Card>
        </Col>
      </Row>
    </div>
  </Page>
</template>

<style lang="less" scoped>
.detail-header {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: flex-start;
  justify-content: space-between;
}

.action-block {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-block__hint {
  padding: 12px 14px;
  border: 1px solid rgba(22, 119, 255, 0.12);
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(239, 246, 255, 0.95), rgba(248, 250, 252, 0.98));
  color: #334155;
  font-size: 13px;
  line-height: 1.8;
}

.dispatch-box {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px;
  border: 1px solid var(--ant-color-border-secondary);
  border-radius: 16px;
  background: var(--ant-color-bg-layout);
}

.status-banner {
  padding: 12px 14px;
  border-radius: 14px;
  background: rgba(148, 163, 184, 0.12);
  color: #475569;
  font-size: 13px;
}

.status-banner--success {
  background: rgba(34, 197, 94, 0.1);
  color: #166534;
}

.evidence-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.evidence-item {
  padding: 14px;
  border: 1px solid var(--ant-color-border-secondary);
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.98));
}

.compare-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.compare-viewport {
  position: relative;
  overflow: hidden;
  height: 320px;
  border-radius: 18px;
  background: #0f172a;
}

.compare-layer {
  position: absolute;
  inset: 0;
}

.compare-layer--current {
  z-index: 2;
}

.compare-layer--history {
  z-index: 1;
}

.compare-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  height: 100%;
  color: rgba(255, 255, 255, 0.78);
}

.compare-placeholder--current {
  background:
    radial-gradient(circle at 28% 35%, rgba(248, 113, 113, 0.28), transparent 35%),
    linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #111827 100%);
}

.compare-placeholder--history {
  background:
    radial-gradient(circle at 68% 28%, rgba(96, 165, 250, 0.22), transparent 34%),
    linear-gradient(135deg, #111827 0%, #1f2937 50%, #0f172a 100%);
}

.compare-badge {
  padding: 4px 10px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 999px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(8px);
}

.compare-badge--danger {
  border-color: rgba(248, 113, 113, 0.42);
  background: rgba(127, 29, 29, 0.32);
}

.compare-box {
  width: 170px;
  height: 104px;
  border: 2px dashed rgba(248, 113, 113, 0.95);
  border-radius: 10px;
  box-shadow: 0 0 0 6px rgba(248, 113, 113, 0.08);
}

.compare-divider {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 3px;
  background: rgba(255, 255, 255, 0.98);
  z-index: 3;
  transform: translateX(-50%);
  box-shadow: 0 0 12px rgba(15, 23, 42, 0.35);
}

.compare-slider {
  width: 100%;
  cursor: ew-resize;
}

.compare-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.compare-tile {
  padding: 12px;
  border: 1px solid var(--ant-color-border-secondary);
  border-radius: 16px;
}

.compare-tile__preview {
  height: 88px;
  border-radius: 12px;
}

.workorder-summary {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.workorder-summary__note {
  padding: 12px 14px;
  border-radius: 14px;
  background: var(--ant-color-bg-layout);
  color: var(--ant-color-text-secondary);
  font-size: 13px;
  line-height: 1.8;
}

@media (max-width: 768px) {
  .compare-grid {
    grid-template-columns: 1fr;
  }
}
</style>
