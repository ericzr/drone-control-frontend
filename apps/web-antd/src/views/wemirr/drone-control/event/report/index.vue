<script lang="ts" setup name="EventReportPage">
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
  Empty,
  Row,
  Select,
  SelectOption,
  Space,
  Statistic,
  Table,
  Tag,
  Timeline,
  TimelineItem,
  message,
} from 'ant-design-vue';

import {
  listClosureEvents,
  listClosureWorkorders,
  useEventClosureVersion,
} from '../../_services/event-closure-store';
import EventContextBar from '../../components/EventContextBar.vue';

const route = useRoute();
const router = useRouter();
const closureStoreVersion = useEventClosureVersion();

const reportRange = ref('month');
const reportSource = ref('all');
const reportScene = ref((route.query.scene as string) || 'all');
const reportPreviewRef = ref<HTMLElement | null>(null);

function parseDateTime(input: string) {
  return new Date(input.replace(/-/g, '/'));
}

function nowForRange() {
  return new Date('2026-04-17T12:00:00');
}

const events = computed(() => {
  closureStoreVersion.value;
  const all = listClosureEvents();
  const now = nowForRange();
  return all.filter((item) => {
    const eventDate = parseDateTime(item.eventTime || item.createTime);
    const diffDays = (now.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24);
    const matchRange =
      reportRange.value === 'week'
        ? diffDays <= 7
        : reportRange.value === 'month'
          ? eventDate.getMonth() === now.getMonth() &&
            eventDate.getFullYear() === now.getFullYear()
          : reportRange.value === 'quarter'
            ? Math.floor(eventDate.getMonth() / 3) === Math.floor(now.getMonth() / 3) &&
              eventDate.getFullYear() === now.getFullYear()
            : eventDate.getFullYear() === now.getFullYear();
    const matchSource =
      reportSource.value === 'all' ||
      (reportSource.value === 'ai' ? item.source.includes('AI') : !item.source.includes('AI'));
    const matchScene =
      reportScene.value === 'all' || item.scene === reportScene.value;
    return matchRange && matchSource && matchScene;
  });
});

const sceneOptions = computed(() => {
  closureStoreVersion.value;
  return [...new Set(listClosureEvents().map((item) => item.scene))];
});

const workorders = computed(() => {
  closureStoreVersion.value;
  const eventNos = new Set(events.value.map((item) => item.eventNo));
  return listClosureWorkorders().filter((item) => eventNos.has(item.eventId));
});

const summary = computed(() => {
  const total = events.value.length;
  const closed = events.value.filter((item) => item.status === '已闭环').length;
  const reviewPending = events.value.filter((item) => item.status === '待复核').length;
  const activeOrders = workorders.value.filter((item) => item.status < 4).length;
  return [
    { title: '事件总数', value: total, suffix: '件' },
    { title: '已闭环事件', value: closed, suffix: '件' },
    { title: '待复核事件', value: reviewPending, suffix: '件' },
    { title: '运行中工单', value: activeOrders, suffix: '单' },
  ];
});

const bySceneData = computed(() => {
  const sceneMap = new Map<
    string,
    {
      scene: string;
      total: number;
      closed: number;
      reviewPending: number;
      workorders: number;
      evidenceCount: number;
    }
  >();

  for (const event of events.value) {
    const item =
      sceneMap.get(event.scene) ||
      {
        scene: event.scene,
        total: 0,
        closed: 0,
        reviewPending: 0,
        workorders: 0,
        evidenceCount: 0,
      };
    item.total += 1;
    if (event.status === '已闭环') item.closed += 1;
    if (event.status === '待复核') item.reviewPending += 1;
    sceneMap.set(event.scene, item);
  }

  for (const workorder of workorders.value) {
    const relatedEvent = events.value.find((item) => item.eventNo === workorder.eventId);
    if (!relatedEvent) continue;
    const item = sceneMap.get(relatedEvent.scene);
    if (!item) continue;
    item.workorders += 1;
    item.evidenceCount += workorder.evidences.length;
  }

  return [...sceneMap.values()]
    .map((item) => ({
      ...item,
      rate: item.total === 0 ? 0 : Number(((item.closed / item.total) * 100).toFixed(1)),
    }))
    .sort((a, b) => b.total - a.total);
});

const sceneColumns = [
  { title: '应用场景', dataIndex: 'scene', key: 'scene' },
  { title: '事件总数', dataIndex: 'total', key: 'total', align: 'right' as const },
  { title: '已闭环', dataIndex: 'closed', key: 'closed', align: 'right' as const },
  { title: '待复核', dataIndex: 'reviewPending', key: 'reviewPending', align: 'right' as const },
  { title: '工单数', dataIndex: 'workorders', key: 'workorders', align: 'right' as const },
  { title: '证据数', dataIndex: 'evidenceCount', key: 'evidenceCount', align: 'right' as const },
  { title: '闭环率', dataIndex: 'rate', key: 'rate', align: 'right' as const },
];

const topClosedWorkorders = computed(() => {
  return workorders.value
    .filter((item) => item.status === 4)
    .sort((a, b) => b.evidences.length - a.evidences.length)
    .slice(0, 5);
});

const workorderDetailRows = computed(() => {
  return workorders.value.map((item) => {
    const event = events.value.find((current) => current.eventNo === item.eventId);
    return {
      id: item.id,
      title: item.title,
      scene: event?.scene || '未归类',
      eventId: item.eventId,
      assignee: item.assignee || '待指派',
      statusLabel: ['待指派', '待处置', '处置中', '待复核', '已归档'][item.status] || '未知',
      evidenceCount: item.evidences.length,
      closureSummary: item.closureSummary || '当前工单尚未沉淀闭环摘要。',
    };
  });
});

const reportHeadline = computed(() => {
  const topScene = bySceneData.value[0];
  const closed = summary.value[1]?.value || 0;
  const total = summary.value[0]?.value || 0;
  const closureRate =
    typeof closed === 'number' && typeof total === 'number' && total > 0
      ? `${((closed / total) * 100).toFixed(1)}%`
      : '0%';
  return {
    title: `${reportInfo.value.rangeLabel}智慧无人设施事件闭环汇报`,
    subtitle:
      reportScene.value === 'all'
        ? '覆盖全部应用场景的事件、工单与证据沉淀情况'
        : `聚焦「${reportScene.value}」场景的事件闭环与处置摘要`,
    summary: `累计 ${total} 起事件，已闭环 ${closed} 起，整体闭环率 ${closureRate}${topScene ? `，重点场景为 ${topScene.scene}` : ''}。`,
  };
});

const reportHighlights = computed(() => {
  const topScene = bySceneData.value[0];
  const topWorkorder = topClosedWorkorders.value[0];
  return [
    {
      title: '场景重点',
      value: topScene ? `${topScene.scene} · ${topScene.total} 起` : '暂无',
      note: topScene ? `累计沉淀 ${topScene.evidenceCount} 份处置证据` : '当前筛选下暂无重点场景',
    },
    {
      title: '复核压力',
      value: `${summary.value[2]?.value || 0} 起`,
      note: '建议优先调度人工复核与派单资源',
    },
    {
      title: '闭环摘要',
      value: topWorkorder ? topWorkorder.title : '暂无',
      note: topWorkorder?.closureSummary || '当前筛选下暂无归档工单摘要',
    },
  ];
});

const previewColumns = [
  { title: '工单编号', dataIndex: 'id', key: 'id', width: 170 },
  { title: '所属场景', dataIndex: 'scene', key: 'scene', width: 110 },
  { title: '处理人', dataIndex: 'assignee', key: 'assignee', width: 90 },
  { title: '状态', dataIndex: 'statusLabel', key: 'statusLabel', width: 90 },
  { title: '证据数', dataIndex: 'evidenceCount', key: 'evidenceCount', width: 80, align: 'right' as const },
  { title: '闭环摘要', dataIndex: 'closureSummary', key: 'closureSummary' },
];

const reportNarrative = computed(() => {
  const topScene = bySceneData.value[0];
  const closedCount = summary.value[1]?.value || 0;
  const totalCount = summary.value[0]?.value || 0;
  const closureRate =
    typeof closedCount === 'number' && typeof totalCount === 'number' && totalCount > 0
      ? `${((closedCount / totalCount) * 100).toFixed(1)}%`
      : '0%';

  return [
    `本期共纳入 ${totalCount} 起事件，其中 ${closedCount} 起已完成闭环，整体闭环率 ${closureRate}。`,
    topScene
      ? `事件最集中的场景为 ${topScene.scene}，共 ${topScene.total} 起，累计沉淀 ${topScene.evidenceCount} 份处置证据。`
      : '当前筛选条件下暂无场景数据。',
    summary.value[2] && typeof summary.value[2].value === 'number'
      ? `待人工复核事件 ${summary.value[2].value} 起，建议优先调度复核与派单资源。`
      : '暂无待复核事件。',
  ];
});

const reportInfo = computed(() => {
  const rangeLabelMap: Record<string, string> = {
    week: '近 7 天',
    month: '本月',
    quarter: '本季度',
    year: '本年',
  };
  const sourceLabelMap: Record<string, string> = {
    all: '全部来源',
    ai: 'AI 告警',
    manual: '人工 / 其他',
  };
  return {
    rangeLabel: rangeLabelMap[reportRange.value] || '本月',
    sourceLabel: sourceLabelMap[reportSource.value] || '全部来源',
    generatedAt: '2026-04-17 18:00',
  };
});

function escapeCsvCell(cell: string) {
  if (/[",\n\r]/.test(cell)) return `"${cell.replace(/"/g, '""')}"`;
  return cell;
}

function handleExport() {
  const bom = '\uFEFF';
  const summaryHeaders = ['场景', '事件总数', '已闭环', '待复核', '工单数', '证据数', '闭环率(%)'];
  const summaryRows = bySceneData.value.map((item) => [
    item.scene,
    String(item.total),
    String(item.closed),
    String(item.reviewPending),
    String(item.workorders),
    String(item.evidenceCount),
    String(item.rate),
  ]);
  const detailHeaders = ['工单编号', '所属场景', '关联事件', '处理人', '状态', '证据数', '闭环摘要'];
  const detailRows = workorderDetailRows.value.map((item) => [
    item.id,
    item.scene,
    item.eventId,
    item.assignee,
    item.statusLabel,
    String(item.evidenceCount),
    item.closureSummary,
  ]);
  const csv =
    bom +
    [
      ['报告周期', reportInfo.value.rangeLabel].map(escapeCsvCell).join(','),
      ['数据范围', reportInfo.value.sourceLabel].map(escapeCsvCell).join(','),
      ['场景范围', reportScene.value === 'all' ? '全部场景' : reportScene.value].map(escapeCsvCell).join(','),
      ['生成时间', reportInfo.value.generatedAt].map(escapeCsvCell).join(','),
      '',
      '场景汇总',
      summaryHeaders.map(escapeCsvCell).join(','),
      ...summaryRows.map((row) => row.map(escapeCsvCell).join(',')),
      '',
      '工单明细',
      detailHeaders.map(escapeCsvCell).join(','),
      ...detailRows.map((row) => row.map(escapeCsvCell).join(',')),
    ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'event_closure_report.csv';
  a.click();
  URL.revokeObjectURL(url);
  message.success('事件闭环报告与工单明细已导出');
}

function handlePrint() {
  window.print();
}

watch(
  [() => route.query.scene, () => route.query.source],
  ([scene, source]) => {
    reportScene.value = (scene as string) || 'all';
    reportSource.value = (source as string) || 'all';
  },
  { immediate: true },
);
</script>

<template>
  <Page :auto-content-height="true">
    <div class="flex flex-col gap-4 p-2">
      <EventContextBar current="report" />

      <Alert
        type="info"
        show-icon
        message="事件报告已切换为动态闭环汇总页"
        description="当前报告直接读取事件 / 工单共享会话状态，适合用于客户演示、内部汇报和联调前的业务走查。"
      />

      <Card :bordered="false" title="事件闭环报告">
        <template #extra>
          <Space>
            <Select v-model:value="reportRange" style="width: 110px" size="small">
              <SelectOption value="week">近 7 天</SelectOption>
              <SelectOption value="month">本月</SelectOption>
              <SelectOption value="quarter">本季度</SelectOption>
              <SelectOption value="year">本年</SelectOption>
            </Select>
            <Select v-model:value="reportSource" style="width: 120px" size="small">
              <SelectOption value="all">全部来源</SelectOption>
              <SelectOption value="ai">AI 告警</SelectOption>
              <SelectOption value="manual">人工 / 其他</SelectOption>
            </Select>
            <Select v-model:value="reportScene" style="width: 140px" size="small">
              <SelectOption value="all">全部场景</SelectOption>
              <SelectOption v-for="scene in sceneOptions" :key="scene" :value="scene">
                {{ scene }}
              </SelectOption>
            </Select>
            <Button
              size="small"
              @click="router.push(`/event/workorder${reportScene !== 'all' ? `?scene=${reportScene}` : ''}`)"
            >
              查看工单
            </Button>
            <Button size="small" @click="handlePrint">打印预览</Button>
            <Button type="primary" size="small" @click="handleExport">导出报告</Button>
          </Space>
        </template>

        <div ref="reportPreviewRef" class="report-cover">
          <div class="report-cover__main">
            <div class="report-cover__eyebrow">云界空域OS · 闭环汇报</div>
            <div class="report-cover__title">{{ reportHeadline.title }}</div>
            <div class="report-cover__subtitle">{{ reportHeadline.subtitle }}</div>
            <div class="report-cover__summary">{{ reportHeadline.summary }}</div>
          </div>
          <div class="report-cover__meta">
            <div class="report-cover__meta-item">
              <span>报告周期</span>
              <strong>{{ reportInfo.rangeLabel }}</strong>
            </div>
            <div class="report-cover__meta-item">
              <span>数据范围</span>
              <strong>{{ reportInfo.sourceLabel }}</strong>
            </div>
            <div class="report-cover__meta-item">
              <span>场景范围</span>
              <strong>{{ reportScene === 'all' ? '全部场景' : reportScene }}</strong>
            </div>
            <div class="report-cover__meta-item">
              <span>生成时间</span>
              <strong>{{ reportInfo.generatedAt }}</strong>
            </div>
          </div>
        </div>

        <Row :gutter="[16, 16]" class="mt-4">
          <Col v-for="item in summary" :key="item.title" :lg="6" :md="12" :span="24">
            <Card :bordered="false" class="report-stat">
              <Statistic :title="item.title" :value="item.value" :suffix="item.suffix" />
            </Card>
          </Col>
        </Row>
      </Card>

      <Row :gutter="[16, 16]">
        <Col v-for="item in reportHighlights" :key="item.title" :lg="8" :span="24">
          <Card :bordered="false" class="highlight-card">
            <div class="highlight-card__title">{{ item.title }}</div>
            <div class="highlight-card__value">{{ item.value }}</div>
            <div class="highlight-card__note">{{ item.note }}</div>
          </Card>
        </Col>
      </Row>

      <Row :gutter="[16, 16]">
        <Col :xl="15" :span="24">
          <Card :bordered="false" title="按场景闭环统计">
            <template v-if="bySceneData.length > 0">
              <Table
                :columns="sceneColumns"
                :data-source="bySceneData"
                :pagination="false"
                row-key="scene"
                size="small"
              >
                <template #bodyCell="{ column, record }">
                  <template v-if="column.key === 'rate'">
                    <Tag :color="record.rate >= 90 ? 'green' : record.rate >= 70 ? 'orange' : 'red'">
                      {{ record.rate }}%
                    </Tag>
                  </template>
                  <template v-else-if="column.key === 'scene'">
                    <Button
                      type="link"
                      size="small"
                      @click="router.push(`/event/workorder?scene=${record.scene}`)"
                    >
                      {{ record.scene }}
                    </Button>
                  </template>
                </template>
              </Table>
            </template>
            <Empty v-else description="当前筛选下暂无事件数据" />
          </Card>
        </Col>

        <Col :xl="9" :span="24">
          <Card :bordered="false" title="报告结论">
            <div class="report-brief">
              <div v-for="item in reportNarrative" :key="item" class="report-brief__item">
                {{ item }}
              </div>
            </div>
          </Card>

          <Card :bordered="false" title="闭环摘要 Top 5" class="mt-4">
            <template v-if="topClosedWorkorders.length > 0">
              <Timeline>
                <TimelineItem
                  v-for="item in topClosedWorkorders"
                  :key="item.id"
                  color="green"
                >
                  <div class="font-medium">{{ item.title }}</div>
                  <div class="mt-1 text-xs text-slate-500">
                    {{ item.id }} · 证据 {{ item.evidences.length }} 份
                  </div>
                  <div class="mt-2 text-sm text-slate-600">
                    {{ item.closureSummary || '当前工单已归档，尚未补充闭环摘要。' }}
                  </div>
                  <div class="mt-2">
                    <Button
                      type="link"
                      size="small"
                      style="padding: 0"
                      @click="router.push(`/event/workorder?workorderId=${item.id}`)"
                    >
                      查看工单详情
                    </Button>
                  </div>
                </TimelineItem>
              </Timeline>
            </template>
            <Empty v-else description="暂无已归档工单" />
          </Card>
        </Col>
      </Row>

      <Card :bordered="false" title="工单明细预览">
        <template #extra>
          <Button
            size="small"
            @click="router.push(`/event/workorder${reportScene !== 'all' ? `?scene=${reportScene}` : ''}`)"
          >
            打开完整工单列表
          </Button>
        </template>
        <template v-if="workorderDetailRows.length > 0">
          <Table
            :columns="previewColumns"
            :data-source="workorderDetailRows.slice(0, 6)"
            :pagination="false"
            row-key="id"
            size="small"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'id'">
                <Button
                  type="link"
                  size="small"
                  @click="router.push(`/event/workorder?workorderId=${record.id}`)"
                >
                  {{ record.id }}
                </Button>
              </template>
              <template v-else-if="column.key === 'scene'">
                <Tag color="blue">{{ record.scene }}</Tag>
              </template>
              <template v-else-if="column.key === 'statusLabel'">
                <Tag :color="record.statusLabel === '已归档' ? 'green' : record.statusLabel === '处置中' ? 'processing' : 'orange'">
                  {{ record.statusLabel }}
                </Tag>
              </template>
            </template>
          </Table>
        </template>
        <Empty v-else description="当前筛选下暂无工单明细" />
      </Card>

      <Card :bordered="false" title="报告说明">
        <Descriptions :column="2" bordered size="small">
          <DescriptionsItem label="报告周期">{{ reportInfo.rangeLabel }}</DescriptionsItem>
          <DescriptionsItem label="生成时间">{{ reportInfo.generatedAt }}</DescriptionsItem>
          <DescriptionsItem label="数据范围">{{ reportInfo.sourceLabel }}</DescriptionsItem>
          <DescriptionsItem label="场景范围">{{ reportScene === 'all' ? '全部场景' : reportScene }}</DescriptionsItem>
          <DescriptionsItem label="生成方式">共享会话闭环数据自动汇总</DescriptionsItem>
          <DescriptionsItem label="导出格式" :span="2">
            当前支持 CSV 场景汇总 + 工单明细联合导出，后续可接 PDF / Word 导出
          </DescriptionsItem>
        </Descriptions>
      </Card>
    </div>
  </Page>
</template>

<style lang="less" scoped>
.report-stat {
  background: var(--ant-color-bg-layout);
}

.report-cover {
  display: grid;
  grid-template-columns: 1.8fr 1fr;
  gap: 16px;
  padding: 20px;
  border-radius: 20px;
  background:
    radial-gradient(circle at top right, rgba(59, 130, 246, 0.16), transparent 28%),
    linear-gradient(135deg, #0f172a 0%, #1e293b 52%, #0f172a 100%);
  color: #f8fafc;
}

.report-cover__main {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.report-cover__eyebrow {
  color: rgba(255, 255, 255, 0.68);
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.report-cover__title {
  font-size: 28px;
  font-weight: 800;
  line-height: 1.25;
}

.report-cover__subtitle {
  color: rgba(255, 255, 255, 0.78);
  font-size: 14px;
}

.report-cover__summary {
  max-width: 700px;
  color: rgba(255, 255, 255, 0.86);
  font-size: 14px;
  line-height: 1.9;
}

.report-cover__meta {
  display: grid;
  gap: 10px;
}

.report-cover__meta-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.06);

  span {
    color: rgba(255, 255, 255, 0.6);
    font-size: 12px;
  }

  strong {
    color: #ffffff;
    font-size: 14px;
    font-weight: 700;
  }
}

.report-brief {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.report-brief__item {
  border: 1px solid var(--ant-color-border-secondary);
  border-radius: 14px;
  line-height: 1.8;
  padding: 12px 14px;
}

.highlight-card {
  min-height: 150px;
  background: linear-gradient(135deg, rgba(248, 250, 252, 0.96), rgba(255, 255, 255, 0.98));
}

.highlight-card__title {
  color: var(--ant-color-text-secondary);
  font-size: 12px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.highlight-card__value {
  margin-top: 12px;
  color: var(--ant-color-text);
  font-size: 22px;
  font-weight: 800;
  line-height: 1.4;
}

.highlight-card__note {
  margin-top: 10px;
  color: var(--ant-color-text-secondary);
  font-size: 13px;
  line-height: 1.8;
}

@media (max-width: 960px) {
  .report-cover {
    grid-template-columns: 1fr;
  }
}

@media print {
  :deep(.ant-card) {
    box-shadow: none !important;
  }

  :deep(button),
  :deep(.ant-btn) {
    display: none !important;
  }

  .report-cover {
    break-inside: avoid;
  }
}
</style>
