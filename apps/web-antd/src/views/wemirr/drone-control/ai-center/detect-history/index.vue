<script lang="ts" setup name="AiDetectHistoryPage">
import { Page } from '@vben/common-ui';

import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import {
  Button,
  Card,
  Col,
  Descriptions,
  DescriptionsItem,
  Drawer,
  Empty,
  Input,
  Progress,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Timeline,
  TimelineItem,
  message,
} from 'ant-design-vue';

import {
  listAiDetectHistoryRecords,
  type AiDetectHistoryRecord,
  upsertAiDetectHistoryRecord,
} from '../../_services/ai-detect-history-store';
import { upsertClosureEvent } from '../../_services/event-closure-store';
import { EVENT_CONTEXT_SOURCE_OPTIONS } from '../../composables/use-event-context';

const route = useRoute();
const router = useRouter();
const historyRecords = ref<AiDetectHistoryRecord[]>([]);
const detailVisible = ref(false);
const selectedRow = ref<AiDetectHistoryRecord | null>(null);

const filters = reactive({
  keyword: '',
  scene: '全部场景',
  method: '全部方式',
  replay: '全部',
  eventStatus: '全部',
});

const currentEventScene = computed(() => {
  if (filters.scene !== '全部场景') return filters.scene;
  if (selectedRow.value) return selectedRow.value.scene;
  return (route.query.scene as string) || '全部场景';
});

const currentContextSourceLabel = computed(() => {
  const source = (route.query.source as string) || '';
  return (
    EVENT_CONTEXT_SOURCE_OPTIONS.find((item) => item.value === source)?.label ||
    '全部来源'
  );
});

const hasEventContext = computed(() => {
  return Boolean(route.query.scene || route.query.source);
});

const columns: any[] = [
  { title: '检测时间', dataIndex: 'detectTime', key: 'detectTime', width: 170 },
  { title: '场景', dataIndex: 'scene', key: 'scene', width: 110 },
  { title: '数据源', dataIndex: 'sourceName', key: 'sourceName', width: 180 },
  { title: '关联任务', dataIndex: 'taskName', key: 'taskName', width: 180 },
  { title: '识别方式', dataIndex: 'method', key: 'method', width: 110 },
  { title: '模型', dataIndex: 'modelName', key: 'modelName', width: 170 },
  { title: '目标数', dataIndex: 'totalTargets', key: 'totalTargets', width: 90 },
  { title: '平均置信度', dataIndex: 'avgConfidence', key: 'avgConfidence', width: 110 },
  { title: '回放', dataIndex: 'replayReady', key: 'replayReady', width: 90 },
  { title: '事件状态', dataIndex: 'eventStatus', key: 'eventStatus', width: 110 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 90 },
  { title: '操作', dataIndex: 'action', key: 'action', width: 260, fixed: 'right' },
];

const presets = [
  { label: '烟火高优', action: () => {
    filters.keyword = '烟';
    filters.scene = '森林防火';
    filters.method = '全部方式';
    filters.replay = '可回放';
    filters.eventStatus = '全部';
  } },
  { label: '违停复核', action: () => {
    filters.keyword = '违停';
    filters.scene = '交通巡查';
    filters.method = '视频识别';
    filters.replay = '可回放';
    filters.eventStatus = '未转事件';
  } },
  { label: '红外热斑', action: () => {
    filters.keyword = '热';
    filters.scene = '光伏巡检';
    filters.method = '图片识别';
    filters.replay = '全部';
    filters.eventStatus = '全部';
  } },
  { label: '待转事件', action: () => {
    filters.keyword = '';
    filters.scene = '全部场景';
    filters.method = '全部方式';
    filters.replay = '全部';
    filters.eventStatus = '未转事件';
  } },
];

const sceneOptions = computed(() => {
  const labels = Array.from(new Set(historyRecords.value.map((item) => item.scene)));
  return ['全部场景', ...labels].map((label) => ({ label, value: label }));
});

const methodOptions = computed(() => {
  const labels = Array.from(new Set(historyRecords.value.map((item) => item.method)));
  return ['全部方式', ...labels].map((label) => ({ label, value: label }));
});

const filteredRecords = computed(() => {
  return historyRecords.value.filter((item) => {
    const matchKeyword =
      filters.keyword.trim() === '' ||
      [
        item.scene,
        item.taskName,
        item.sourceName,
        item.mediaName,
        item.location,
        item.modelName,
        item.hitTags.join('|'),
      ]
        .join('|')
        .includes(filters.keyword.trim());
    const matchScene = filters.scene === '全部场景' || item.scene === filters.scene;
    const matchMethod = filters.method === '全部方式' || item.method === filters.method;
    const matchReplay =
      filters.replay === '全部' ||
      (filters.replay === '可回放' ? item.replayReady : !item.replayReady);
    const matchEvent =
      filters.eventStatus === '全部' || item.eventStatus === filters.eventStatus;
    return matchKeyword && matchScene && matchMethod && matchReplay && matchEvent;
  });
});

const stats = computed(() => {
  const total = historyRecords.value.length;
  const replayReady = historyRecords.value.filter((item) => item.replayReady).length;
  const pendingEvent = historyRecords.value.filter((item) => item.eventStatus === '未转事件').length;
  const highConfidence = historyRecords.value.filter((item) => item.avgConfidence >= 0.8).length;
  return [
    { title: '历史记录', value: total, suffix: '条' },
    { title: '可回放片段', value: replayReady, suffix: '条' },
    { title: '待转事件', value: pendingEvent, suffix: '条' },
    { title: '高置信命中', value: highConfidence, suffix: '条' },
  ];
});

const selectedInsight = computed(() => {
  return selectedRow.value || filteredRecords.value[0] || null;
});

const playbackCoverage = computed(() => {
  if (filteredRecords.value.length === 0) return 0;
  return Math.round(
    (filteredRecords.value.filter((item) => item.replayReady).length / filteredRecords.value.length) * 100,
  );
});

function refreshHistory(showMessage = false) {
  historyRecords.value = listAiDetectHistoryRecords().sort((a, b) =>
    b.detectTime.localeCompare(a.detectTime),
  );
  if (!selectedRow.value && historyRecords.value[0]) {
    selectedRow.value = historyRecords.value[0];
  }
  if (showMessage) {
    message.success('检测历史已刷新');
  }
}

function resetFilters() {
  filters.keyword = '';
  filters.scene = (route.query.scene as string) || '全部场景';
  filters.method = '全部方式';
  filters.replay = '全部';
  filters.eventStatus = '全部';
}

function buildEventContextQuery(row?: AiDetectHistoryRecord | null) {
  const scene = row?.scene || (filters.scene !== '全部场景' ? filters.scene : (route.query.scene as string | undefined));
  return {
    ...(scene && scene !== '全部场景' ? { scene } : {}),
    source: 'ai',
  };
}

function pushEventLink(path: string, row?: AiDetectHistoryRecord | null, query: Record<string, string | number> = {}) {
  router.push({
    path,
    query: {
      ...buildEventContextQuery(row),
      ...query,
    },
  });
}

function clearEventContext() {
  const nextQuery = { ...route.query };
  delete nextQuery.scene;
  delete nextQuery.source;
  router.replace({
    path: route.path,
    query: nextQuery,
  });
}

function openEventOverview() {
  router.push({
    path: '/event',
    query: {
      ...buildEventContextQuery(selectedRow.value),
    },
  });
}

function openDetail(row: AiDetectHistoryRecord) {
  selectedRow.value = row;
  detailVisible.value = true;
}

function toEvent(row: AiDetectHistoryRecord) {
  if (row.eventStatus === '已转事件' && row.eventNo) {
    message.info(`检测记录已关联事件 ${row.eventNo}`);
    pushEventLink('/event/detail', row, {
      id: row.eventNo,
      from: 'detect',
      eventNo: row.eventNo,
      model: row.modelName,
    });
    return;
  }
  const eventNo = `EVT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(
    Math.floor(Math.random() * 900) + 100,
  )}`;
  const updated: AiDetectHistoryRecord = {
    ...row,
    eventStatus: '已转事件',
    eventNo,
  };
  upsertClosureEvent({
    id: row.id,
    eventNo,
    eventType: row.scene === '森林防火' ? '烟火' : row.scene === '交通巡查' ? '违停' : row.scene === '安全生产' ? '设备异常' : row.scene === '光伏巡检' ? '设备异常' : '漂浮物',
    level: row.avgConfidence >= 0.85 ? '重大' : row.avgConfidence >= 0.7 ? '较大' : '一般',
    scene: row.scene,
    region: row.location,
    location: row.location,
    source: 'AI识别',
    sourceDrone: row.sourceName,
    confidence: Math.round(row.avgConfidence * 100),
    status: '待复核',
    description: row.reviewAdvice,
    eventTime: row.detectTime,
    createTime: row.detectTime,
    relatedWorkorderId: undefined,
  });
  upsertAiDetectHistoryRecord(updated);
  selectedRow.value = updated;
  refreshHistory();
  message.success(`已将检测记录转为事件 ${eventNo}，目标数: ${row.totalTargets}`);
  pushEventLink('/event/detail', row, {
    id: eventNo,
    from: 'detect',
    model: row.modelName,
    targets: row.totalTargets,
    eventNo,
  });
}

function toMedia(row: AiDetectHistoryRecord) {
  selectedRow.value = row;
  message.info(`前往媒体库查看素材「${row.mediaName}」`);
  router.push('/ai-center/media-library');
}

function openDetailFromTable(row: Record<string, any>) {
  openDetail(row as AiDetectHistoryRecord);
}

function toMediaFromTable(row: Record<string, any>) {
  toMedia(row as AiDetectHistoryRecord);
}

function toEventFromTable(row: Record<string, any>) {
  toEvent(row as AiDetectHistoryRecord);
}

function openReviewFromTable(row: Record<string, any>) {
  const target = row as AiDetectHistoryRecord;
  pushEventLink('/event/review', target, { id: target.eventNo || target.id });
}

onMounted(async () => {
  refreshHistory();
  const scene = route.query.scene as string | undefined;
  if (scene) {
    filters.scene = scene;
  }
  const id = route.query.id as string | undefined;
  if (id) {
    const row = listAiDetectHistoryRecords().find((item) => item.id === id || item.eventNo === id);
    if (row) {
      openDetail(row);
    }
  }
});

watch(
  () => route.query.scene,
  (scene) => {
    filters.scene = (scene as string) || '全部场景';
  },
);

function statusColor(s: string) {
  if (s === '已完成') return 'green';
  if (s === '检测中') return 'blue';
  if (s === '失败') return 'red';
  return 'default';
}

function methodIcon(m: string) {
  if (m === '图片识别') return '🖼️';
  if (m === '视频识别') return '🎬';
  return '📷';
}

function eventColor(status: string) {
  if (status === '已转事件') return 'processing';
  if (status === '已归档') return 'default';
  return 'orange';
}

function spectrumColor(s: string) {
  if (s === 'visible') return 'blue';
  if (s === 'infrared') return 'red';
  if (s === 'multispectral') return 'purple';
  return 'default';
}

function spectrumLabel(s: string) {
  if (s === 'visible') return '可见光';
  if (s === 'infrared') return '红外';
  if (s === 'multispectral') return '多光谱';
  if (s === 'sar') return 'SAR';
  return s;
}

function replayLabel(ready: boolean) {
  return ready ? '可回放' : '静态结果';
}

function replayColor(ready: boolean) {
  return ready ? 'cyan' : 'default';
}

function previewSvg(row: AiDetectHistoryRecord) {
  const accent =
    row.spectrum === 'infrared'
      ? 'ef4444'
      : row.spectrum === 'multispectral'
        ? '8b5cf6'
        : '22c55e';
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='680' height='320'%3E%3Crect width='680' height='320' fill='%230b1220'/%3E%3Crect x='24' y='24' width='632' height='272' rx='18' fill='none' stroke='%23${accent}' stroke-width='2' stroke-dasharray='10,8'/%3E%3Ctext x='340' y='116' text-anchor='middle' fill='%23e2e8f0' font-size='28' font-family='Arial'%3E${encodeURIComponent(
    row.scene,
  )}%3C/text%3E%3Ctext x='340' y='160' text-anchor='middle' fill='%23${accent}' font-size='20' font-family='Arial'%3E${encodeURIComponent(
    row.modelName,
  )}%3C/text%3E%3Ctext x='340' y='202' text-anchor='middle' fill='%2394a3b8' font-size='16' font-family='Arial'%3E${encodeURIComponent(
    row.segmentRange,
  )}%3C/text%3E%3C/svg%3E`;
}
</script>

<template>
  <Page :auto-content-height="true">
    <div class="flex flex-col gap-4 p-2">
      <Card :bordered="false">
        <div class="page-hero">
          <div class="page-hero__main">
            <div class="page-hero__title">检测历史</div>
            <div class="page-hero__desc">
              回放 AI 检测结果、定位关联素材，并按需转入事件闭环。
            </div>
          </div>
          <Space wrap>
            <Button @click="router.push('/ai-center/task')">查看分析任务</Button>
            <Button type="primary" @click="refreshHistory(true)">刷新历史</Button>
          </Space>
        </div>
      </Card>

      <div v-if="hasEventContext" class="context-ribbon">
        <div class="context-ribbon__main">
          <div class="context-ribbon__title">当前联动上下文</div>
          <div class="context-ribbon__desc">
            你正在以事件链路语境查看检测历史；当前筛选和转事件动作会继续保留这组上下文。
          </div>
          <div class="context-ribbon__tags">
            <Tag color="blue">场景：{{ currentEventScene }}</Tag>
            <Tag color="purple">来源：{{ currentContextSourceLabel }}</Tag>
          </div>
        </div>
        <Space wrap>
          <Button size="small" @click="openEventOverview">返回事件链路</Button>
          <Button size="small" @click="clearEventContext">清除上下文</Button>
        </Space>
      </div>

      <Row :gutter="[16, 16]">
        <Col v-for="item in stats" :key="item.title" :lg="6" :md="12" :span="24">
          <Card :bordered="false">
            <Statistic :title="item.title" :value="item.value" :suffix="item.suffix" />
          </Card>
        </Col>
      </Row>

      <Card :bordered="false" title="智能检索">
        <div class="flex flex-col gap-4">
          <div class="toolbar-grid">
            <Input v-model:value="filters.keyword" allow-clear placeholder="按任务、模型、素材、位置关键字检索" />
            <Select v-model:value="filters.scene" :options="sceneOptions" />
            <Select v-model:value="filters.method" :options="methodOptions" />
            <Select
              v-model:value="filters.replay"
              :options="[
                { label: '全部', value: '全部' },
                { label: '可回放', value: '可回放' },
                { label: '静态结果', value: '静态结果' },
              ]"
            />
            <Select
              v-model:value="filters.eventStatus"
              :options="[
                { label: '全部', value: '全部' },
                { label: '未转事件', value: '未转事件' },
                { label: '已转事件', value: '已转事件' },
                { label: '已归档', value: '已归档' },
              ]"
            />
            <Button @click="resetFilters">重置筛选</Button>
          </div>

          <Space wrap>
            <Button
              v-for="preset in presets"
              :key="preset.label"
              size="small"
              type="dashed"
              @click="preset.action()"
            >
              {{ preset.label }}
            </Button>
          </Space>
        </div>
      </Card>

      <Row :gutter="[16, 16]">
        <Col :lg="16" :span="24">
          <Card :bordered="false" title="检测历史列表">
            <Table
              :columns="columns"
              :data-source="filteredRecords"
              :pagination="{ pageSize: 6, showSizeChanger: false }"
              :scroll="{ x: 1600 }"
              row-key="id"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'method'">
                  <span>{{ methodIcon(record.method) }} {{ record.method }}</span>
                </template>
                <template v-else-if="column.key === 'avgConfidence'">
                  <Tag
                    :color="
                      record.avgConfidence >= 0.8
                        ? 'green'
                        : record.avgConfidence >= 0.6
                          ? 'blue'
                          : 'orange'
                    "
                  >
                    {{ record.avgConfidence > 0 ? `${Math.round(record.avgConfidence * 100)}%` : '-' }}
                  </Tag>
                </template>
                <template v-else-if="column.key === 'replayReady'">
                  <Tag :color="replayColor(record.replayReady)">{{ replayLabel(record.replayReady) }}</Tag>
                </template>
                <template v-else-if="column.key === 'eventStatus'">
                  <Tag :color="eventColor(record.eventStatus)">{{ record.eventStatus }}</Tag>
                </template>
                <template v-else-if="column.key === 'status'">
                  <Tag :color="statusColor(record.status)">{{ record.status }}</Tag>
                </template>
                <template v-else-if="column.key === 'action'">
                  <Space wrap size="small">
                    <Button size="small" type="link" @click="openDetailFromTable(record)">回放</Button>
                    <Button size="small" type="link" @click="toMediaFromTable(record)">素材</Button>
                    <Button size="small" type="link" @click="router.push('/ai-center/task')">任务</Button>
                    <Button size="small" type="link" @click="toEventFromTable(record)">转事件</Button>
                    <Button
                      v-if="record.eventStatus !== '未转事件'"
                      size="small"
                      type="link"
                      @click="openReviewFromTable(record)"
                    >
                      去复核
                    </Button>
                  </Space>
                </template>
              </template>
            </Table>
          </Card>
        </Col>

        <Col :lg="8" :span="24">
          <Card :bordered="false" title="命中时间轴">
            <template v-if="filteredRecords.length > 0">
              <Timeline>
                <TimelineItem
                  v-for="item in filteredRecords.slice(0, 6)"
                  :key="item.id"
                  :color="item.status === '失败' ? 'red' : item.eventStatus === '未转事件' ? 'blue' : 'green'"
                >
                  <div class="timeline-item" @click="openDetail(item)">
                    <div class="timeline-item__title">{{ item.detectTime }}</div>
                    <div class="timeline-item__meta">{{ item.scene }} · {{ item.taskName }}</div>
                    <div class="timeline-item__meta">{{ item.sourceName }}</div>
                  </div>
                </TimelineItem>
              </Timeline>
            </template>
            <Empty v-else description="当前筛选条件无结果" />
          </Card>

          <Card :bordered="false" title="检索洞察" class="mt-4">
            <template v-if="selectedInsight">
              <div class="insight-row">
                <span>当前焦点</span>
                <strong>{{ selectedInsight.scene }}</strong>
              </div>
              <div class="insight-row">
                <span>关联任务</span>
                <strong>{{ selectedInsight.taskName }}</strong>
              </div>
              <div class="insight-row">
                <span>回放覆盖率</span>
                <strong>{{ playbackCoverage }}%</strong>
              </div>
              <Progress :percent="playbackCoverage" :show-info="false" stroke-color="#1677ff" />
              <div class="insight-tags">
                <Tag v-for="tag in selectedInsight.hitTags" :key="tag" color="geekblue">
                  {{ tag }}
                </Tag>
              </div>
              <div class="insight-advice">
                {{ selectedInsight.reviewAdvice }}
              </div>
            </template>
            <Empty v-else description="请选择一条记录查看洞察" />
          </Card>
        </Col>
      </Row>

      <Drawer
        v-model:open="detailVisible"
        :title="selectedRow ? `历史回放 - ${selectedRow.taskName}` : '历史回放'"
        width="640"
        placement="right"
      >
        <template v-if="selectedRow">
          <div class="drawer-preview">
            <img :src="previewSvg(selectedRow)" alt="回放预览" class="drawer-preview__image" />
            <div class="drawer-preview__stats">
              <div class="drawer-preview__metric">
                <span>回放区间</span>
                <strong>{{ selectedRow.segmentRange }}</strong>
              </div>
              <div class="drawer-preview__metric">
                <span>素材</span>
                <strong>{{ selectedRow.mediaName }}</strong>
              </div>
            </div>
          </div>

          <Descriptions bordered :column="1" size="small">
            <DescriptionsItem label="检测时间">{{ selectedRow.detectTime }}</DescriptionsItem>
            <DescriptionsItem label="检测方式">
              <span>{{ methodIcon(selectedRow.method) }} {{ selectedRow.method }}</span>
            </DescriptionsItem>
            <DescriptionsItem label="关联任务">{{ selectedRow.taskName }}</DescriptionsItem>
            <DescriptionsItem label="数据源">{{ selectedRow.sourceName }}</DescriptionsItem>
            <DescriptionsItem label="使用模型">{{ selectedRow.modelName }}</DescriptionsItem>
            <DescriptionsItem label="模型类型">{{ selectedRow.modelType }}</DescriptionsItem>
            <DescriptionsItem label="光谱类型">
              <Tag :color="spectrumColor(selectedRow.spectrum)">{{ spectrumLabel(selectedRow.spectrum) }}</Tag>
            </DescriptionsItem>
            <DescriptionsItem label="目标总数">
              <span class="font-bold text-lg">{{ selectedRow.totalTargets }}</span>
            </DescriptionsItem>
            <DescriptionsItem label="平均置信度">
              <Tag
                :color="
                  selectedRow.avgConfidence >= 0.8
                    ? 'green'
                    : selectedRow.avgConfidence >= 0.6
                      ? 'blue'
                      : 'orange'
                "
              >
                {{ selectedRow.avgConfidence > 0 ? selectedRow.avgConfidence.toFixed(2) : '-' }}
              </Tag>
            </DescriptionsItem>
            <DescriptionsItem label="时长 / 耗时">
              {{ selectedRow.durationLabel }} / {{ selectedRow.elapsedMs > 1000 ? `${(selectedRow.elapsedMs / 1000).toFixed(1)} s` : `${selectedRow.elapsedMs} ms` }}
            </DescriptionsItem>
            <DescriptionsItem label="位置">{{ selectedRow.location }}</DescriptionsItem>
            <DescriptionsItem label="分辨率">{{ selectedRow.resolution }}</DescriptionsItem>
            <DescriptionsItem label="事件状态">
              <Tag :color="eventColor(selectedRow.eventStatus)">{{ selectedRow.eventStatus }}</Tag>
              <span v-if="selectedRow.eventNo" class="ml-2">{{ selectedRow.eventNo }}</span>
            </DescriptionsItem>
          </Descriptions>

          <Card :bordered="false" size="small" title="关键片段" class="mt-4">
            <template v-if="selectedRow.frameMarks.length > 0">
              <Timeline>
                <TimelineItem
                  v-for="frame in selectedRow.frameMarks"
                  :key="`${selectedRow.id}-${frame.timeLabel}`"
                  color="blue"
                >
                  <div class="frame-card">
                    <div class="frame-card__head">
                      <strong>{{ frame.timeLabel }} · {{ frame.label }}</strong>
                      <Tag color="blue">{{ Math.round(frame.confidence * 100) }}%</Tag>
                    </div>
                    <div class="frame-card__desc">{{ frame.summary }}</div>
                  </div>
                </TimelineItem>
              </Timeline>
            </template>
            <Empty v-else description="当前记录暂无关键片段" />
          </Card>

          <Card :bordered="false" size="small" title="目标概览" class="mt-4">
            <template v-if="selectedRow.targetStats.length > 0">
              <div class="target-grid">
                <div v-for="target in selectedRow.targetStats" :key="target.label" class="target-card">
                  <div class="target-card__title">{{ target.label }}</div>
                  <div class="target-card__value">{{ target.count }}</div>
                  <div class="target-card__meta">平均命中 {{ Math.round(target.confidence * 100) }}%</div>
                </div>
              </div>
            </template>
            <Empty v-else description="当前记录无目标命中" />
          </Card>

          <Card :bordered="false" size="small" title="智能复核建议" class="mt-4">
            <div class="insight-advice">{{ selectedRow.reviewAdvice }}</div>
            <Space wrap class="mt-3">
              <Button size="small" @click="toMedia(selectedRow)">查看素材</Button>
              <Button size="small" @click="router.push('/ai-center/task')">查看任务</Button>
              <Button size="small" type="primary" @click="toEvent(selectedRow)">转事件</Button>
              <Button
                v-if="selectedRow.eventStatus !== '未转事件'"
                size="small"
                @click="pushEventLink('/event/review', selectedRow, { id: selectedRow.eventNo || selectedRow.id })"
              >
                打开复核
              </Button>
              <Button size="small" @click="pushEventLink('/event/report', selectedRow)">
                查看报告
              </Button>
            </Space>
          </Card>
        </template>
      </Drawer>
    </div>
  </Page>
</template>

<style scoped>
.page-hero {
  align-items: flex-start;
  display: flex;
  gap: 16px;
  justify-content: space-between;
}

.page-hero__main {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.page-hero__title {
  color: var(--ant-color-text);
  font-size: 24px;
  font-weight: 700;
  line-height: 1.2;
}

.page-hero__desc {
  color: var(--ant-color-text-description);
  line-height: 1.7;
  max-width: 720px;
}

.context-ribbon {
  align-items: center;
  background: color-mix(in srgb, var(--ant-color-primary) 5%, white);
  border: 1px solid color-mix(in srgb, var(--ant-color-primary) 14%, transparent);
  border-radius: 16px;
  display: flex;
  gap: 16px;
  justify-content: space-between;
  padding: 14px 16px;
}

.context-ribbon__main {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.context-ribbon__title {
  color: var(--ant-color-text);
  font-size: 14px;
  font-weight: 700;
}

.context-ribbon__desc {
  color: var(--ant-color-text-description);
  font-size: 12px;
  line-height: 1.6;
}

.context-ribbon__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.toolbar-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(6, minmax(0, 1fr));
}

.timeline-item {
  cursor: pointer;
}

.timeline-item__title {
  color: var(--ant-color-text);
  font-weight: 600;
}

.timeline-item__meta {
  color: var(--ant-color-text-description);
  font-size: 12px;
  line-height: 1.6;
}

.insight-row {
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.insight-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.insight-advice {
  background: color-mix(in srgb, var(--ant-color-primary) 8%, transparent);
  border: 1px solid color-mix(in srgb, var(--ant-color-primary) 20%, transparent);
  border-radius: 12px;
  color: var(--ant-color-text);
  line-height: 1.7;
  margin-top: 12px;
  padding: 12px 14px;
}

.drawer-preview {
  margin-bottom: 16px;
}

.drawer-preview__image {
  border-radius: 16px;
  display: block;
  height: auto;
  margin-bottom: 12px;
  width: 100%;
}

.drawer-preview__stats {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.drawer-preview__metric {
  background: var(--ant-color-fill-quaternary);
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px 14px;
}

.drawer-preview__metric span,
.target-card__meta,
.frame-card__desc {
  color: var(--ant-color-text-description);
  font-size: 12px;
}

.frame-card__head {
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}

.target-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.target-card {
  background: var(--ant-color-fill-quaternary);
  border-radius: 14px;
  padding: 14px;
}

.target-card__title {
  color: var(--ant-color-text);
  font-weight: 600;
}

.target-card__value {
  color: var(--ant-color-primary);
  font-size: 24px;
  font-weight: 700;
  margin: 6px 0;
}

@media (max-width: 1200px) {
  .toolbar-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .page-hero,
  .context-ribbon {
    align-items: stretch;
    flex-direction: column;
  }

  .toolbar-grid,
  .drawer-preview__stats,
  .target-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
