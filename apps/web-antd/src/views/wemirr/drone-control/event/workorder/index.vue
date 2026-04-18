<script lang="ts" setup name="EventWorkorderPage">
import { Page } from '@vben/common-ui';

import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import {
  Badge,
  Button,
  Card,
  Col,
  Descriptions,
  DescriptionsItem,
  Drawer,
  Row,
  Select,
  SelectOption,
  Space,
  Steps,
  Table,
  Tag,
  Textarea,
  Timeline,
  TimelineItem,
  Input,
  message,
} from 'ant-design-vue';

import {
  getClosureEventByNoOrId,
  listClosureEvents,
  listClosureWorkorders,
  syncWorkorderStatus,
  type EventWorkorderRecord,
  useEventClosureVersion,
} from '../../_services/event-closure-store';
import EventContextBar from '../../components/EventContextBar.vue';
import { matchesWorkorderSource } from '../../composables/use-event-context';

const route = useRoute();
const router = useRouter();
const closureStoreVersion = useEventClosureVersion();
const statusLabels = ['待指派', '待处置', '处置中', '待复核', '已归档'];

const columns = [
  { title: '工单编号', dataIndex: 'id', key: 'id', width: 170 },
  { title: '标题', dataIndex: 'title', key: 'title' },
  { title: '关联场景', dataIndex: 'scene', key: 'scene', width: 110 },
  { title: '来源', dataIndex: 'source', key: 'source', width: 70 },
  { title: '优先级', dataIndex: 'priority', key: 'priority', width: 70 },
  { title: '类型', dataIndex: 'type', key: 'type', width: 90 },
  { title: '级别', dataIndex: 'level', key: 'level', width: 70 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 80 },
  { title: '处理人', dataIndex: 'assignee', key: 'assignee', width: 80 },
  { title: '截止时间', dataIndex: 'deadline', key: 'deadline', width: 140 },
  { title: '', key: 'ops', width: 100 },
];

function levelColor(l: string) { return l === '紧急' ? 'red' : 'orange'; }
function statusTag(s: number) {
  const colors = ['default', 'orange', 'blue', 'purple', 'green'];
  return colors[s] || 'default';
}
function sourceColor(s: string) {
  if (s === 'AI') return 'purple';
  if (s === '举报') return 'volcano';
  return 'cyan';
}
function priorityColor(p: string) {
  if (p === '一级') return 'red';
  if (p === '二级') return 'orange';
  return 'blue';
}

// Detail drawer
const detailVisible = ref(false);
const currentOrder = ref<EventWorkorderRecord | null>(null);

function openDetail(order: EventWorkorderRecord) {
  currentOrder.value = order;
  detailVisible.value = true;
}

function openDetailFromTable(record: Record<string, any>) {
  openDetail(record as EventWorkorderRecord);
}

// Actions
const assigneeOptions = ['张伟', '李明', '王芳', '赵强', '刘洋', '陈静'];
const assigneeSelect = ref('');
const handleNote = ref('');
const reviewNote = ref('');

const allWorkorders = computed(() => {
  closureStoreVersion.value;
  return listClosureWorkorders();
});

const eventMap = computed(() => {
  closureStoreVersion.value;
  return new Map(listClosureEvents().map((item) => [item.eventNo, item]));
});

function handleAssign() {
  if (!currentOrder.value || !assigneeSelect.value) { message.warning('请选择处理人'); return; }
  const updated = syncWorkorderStatus({
    workorderId: currentOrder.value.id,
    status: 1,
    assignee: assigneeSelect.value,
    log: { time: new Date().toLocaleTimeString().slice(0, 5), action: '指派处理人', user: '当前用户', note: `指派 ${assigneeSelect.value}` },
  });
  if (updated) currentOrder.value = { ...updated };
  message.success('已指派');
}

function handleArrive() {
  if (!currentOrder.value) return;
  const updated = syncWorkorderStatus({
    workorderId: currentOrder.value.id,
    status: 2,
    log: { time: new Date().toLocaleTimeString().slice(0, 5), action: '到达现场', user: currentOrder.value.assignee },
  });
  if (updated) currentOrder.value = { ...updated };
  message.info('已标记到达现场');
}

function handleSubmit() {
  if (!currentOrder.value || !handleNote.value) { message.warning('请填写处置说明'); return; }
  const updated = syncWorkorderStatus({
    workorderId: currentOrder.value.id,
    status: 3,
    log: { time: new Date().toLocaleTimeString().slice(0, 5), action: '提交处置', user: currentOrder.value.assignee, note: handleNote.value },
  });
  if (updated) currentOrder.value = { ...updated };
  handleNote.value = '';
  message.success('处置记录已提交');
}

function handleReview(pass: boolean) {
  if (!currentOrder.value) return;
  const updated = syncWorkorderStatus({
    workorderId: currentOrder.value.id,
    status: pass ? 4 : 2,
    log: { time: new Date().toLocaleTimeString().slice(0, 5), action: pass ? '复核通过' : '复核驳回', user: '当前用户', note: reviewNote.value || (pass ? '确认处置完毕' : '需重新处置') },
  });
  if (updated) currentOrder.value = { ...updated };
  if (pass) message.success('已归档');
  else message.warning('已驳回，退回处置');
  reviewNote.value = '';
}

const filterStatus = ref<number | null>(
  route.query.status ? Number(route.query.status) : null,
);
const filterScene = ref((route.query.scene as string) || 'all');
const filterSource = ref((route.query.source as string) || 'all');
const keyword = ref((route.query.keyword as string) || '');
const routeEventId = computed(() => (route.query.id as string) || '');

const sceneOptions = computed(() => {
  closureStoreVersion.value;
  return [...new Set(listClosureEvents().map((item) => item.scene))];
});

const workorderRows = computed(() => {
  return allWorkorders.value.map((item) => {
    const event = eventMap.value.get(item.eventId);
    return {
      ...item,
      scene: event?.scene || '未归类',
      eventStatus: event?.status || '未知',
      eventRegion: event?.region || '',
    };
  });
});

const contextTitle = computed(() => {
  const eventId = routeEventId.value;
  if (eventId) return `当前按事件 ${eventId} 查看关联工单`;
  if (filterScene.value !== 'all') return `当前按场景 ${filterScene.value} 查看工单`;
  if (filterSource.value !== 'all') return `当前按来源 ${filterSource.value} 查看工单`;
  return '当前展示全部工单，可按状态、场景、来源快速筛选';
});

const contextOrders = computed(() => {
  return workorderRows.value.filter((order) => {
    const matchEvent = !routeEventId.value || order.eventId === routeEventId.value;
    const matchScene = filterScene.value === 'all' || order.scene === filterScene.value;
    const matchSource = matchesWorkorderSource(order.source, filterSource.value);
    const matchKeyword =
      !keyword.value ||
      [order.id, order.title, order.location, order.eventId]
        .join(' ')
        .toLowerCase()
        .includes(keyword.value.toLowerCase());
    return matchEvent && matchScene && matchSource && matchKeyword;
  });
});

const filteredOrders = computed(() => {
  if (filterStatus.value === null) return contextOrders.value;
  return contextOrders.value.filter((o) => o.status === filterStatus.value);
});

const statusCounts = computed(() => {
  return statusLabels.map((_, i) => contextOrders.value.filter((o) => o.status === i).length);
});

const contextMetrics = computed(() => {
  const orders = contextOrders.value;
  return {
    total: orders.length,
    archived: orders.filter((item) => item.status === 4).length,
    active: orders.filter((item) => item.status < 4).length,
    evidences: orders.reduce((total, item) => total + item.evidences.length, 0),
  };
});

const currentRelatedEvent = computed(() => {
  if (!currentOrder.value) return null;
  return getClosureEventByNoOrId(currentOrder.value.eventId);
});

function resetContextFilters() {
  filterScene.value = 'all';
  filterSource.value = 'all';
  filterStatus.value = null;
  keyword.value = '';
  router.replace({ query: {} });
}

function openRouteContext() {
  const workorderId = route.query.workorderId as string | undefined;
  if (workorderId) {
    const order = allWorkorders.value.find((item) => item.id === workorderId);
    if (order) openDetail(order);
    return;
  }
  if (routeEventId.value) {
    const order = allWorkorders.value.find((item) => item.eventId === routeEventId.value);
    if (order) openDetail(order);
  }
}

watch(
  [
    () => route.query.id,
    () => route.query.workorderId,
    () => route.query.scene,
    () => route.query.source,
    () => closureStoreVersion.value,
  ],
  () => {
    filterScene.value = (route.query.scene as string) || 'all';
    filterSource.value = (route.query.source as string) || 'all';
    openRouteContext();
  },
  { immediate: true },
);
</script>

<template>
  <Page>
    <div class="flex flex-col gap-3 p-2">
      <EventContextBar current="workorder" />

      <Card :bordered="false" size="small">
        <div class="toolbar-card">
          <div>
            <div class="toolbar-card__title">工单上下文筛选</div>
            <div class="toolbar-card__desc">{{ contextTitle }}</div>
          </div>
          <Space :size="[10, 10]" wrap>
            <Input
              v-model:value="keyword"
              placeholder="搜索工单编号 / 标题 / 位置"
              style="width: 220px"
            />
            <Select v-model:value="filterScene" style="width: 140px" size="small">
              <SelectOption value="all">全部场景</SelectOption>
              <SelectOption v-for="scene in sceneOptions" :key="scene" :value="scene">
                {{ scene }}
              </SelectOption>
            </Select>
            <Select v-model:value="filterSource" style="width: 110px" size="small">
              <SelectOption value="all">全部来源</SelectOption>
              <SelectOption value="AI">AI</SelectOption>
              <SelectOption value="人工">人工</SelectOption>
              <SelectOption value="举报">举报</SelectOption>
            </Select>
            <Button @click="resetContextFilters">清空上下文</Button>
          </Space>
        </div>
      </Card>

      <Row :gutter="[12, 12]">
        <Col :lg="6" :span="12">
          <Card :bordered="false" size="small">
            <div class="metric-card__value">{{ contextMetrics.total }}</div>
            <div class="metric-card__label">上下文工单</div>
          </Card>
        </Col>
        <Col :lg="6" :span="12">
          <Card :bordered="false" size="small">
            <div class="metric-card__value">{{ contextMetrics.active }}</div>
            <div class="metric-card__label">运行中</div>
          </Card>
        </Col>
        <Col :lg="6" :span="12">
          <Card :bordered="false" size="small">
            <div class="metric-card__value">{{ contextMetrics.archived }}</div>
            <div class="metric-card__label">已归档</div>
          </Card>
        </Col>
        <Col :lg="6" :span="12">
          <Card :bordered="false" size="small">
            <div class="metric-card__value">{{ contextMetrics.evidences }}</div>
            <div class="metric-card__label">证据总数</div>
          </Card>
        </Col>
      </Row>

      <!-- Status summary -->
      <Row :gutter="[12, 12]">
        <Col v-for="(label, i) in statusLabels" :key="i" :lg="{ span: 4 }" :span="12">
          <Card
            :bordered="false" size="small"
            class="status-card"
            :class="{ 'status-card--active': filterStatus === i }"
            @click="filterStatus = filterStatus === i ? null : i"
          >
            <div class="status-card__count">{{ statusCounts[i] }}</div>
            <div class="status-card__label">
              <Badge :color="['#8c8c8c','#faad14','#1677ff','#722ed1','#52c41a'][i]" />
              {{ label }}
            </div>
          </Card>
        </Col>
      </Row>

      <!-- Table -->
      <Card :bordered="false" size="small">
        <Table :columns="columns" :data-source="filteredOrders" size="small" row-key="id">
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'source'">
              <Tag :color="sourceColor(record.source)" size="small">{{ record.source }}</Tag>
            </template>
            <template v-if="column.key === 'priority'">
              <Tag :color="priorityColor(record.priority)" size="small">{{ record.priority }}</Tag>
            </template>
            <template v-if="column.key === 'scene'">
              <Tag color="blue" size="small">{{ record.scene }}</Tag>
            </template>
            <template v-if="column.key === 'level'">
              <Tag :color="levelColor(record.level)" size="small">{{ record.level }}</Tag>
            </template>
            <template v-if="column.key === 'status'">
              <Tag :color="statusTag(record.status)" size="small">{{ statusLabels[record.status] }}</Tag>
            </template>
            <template v-if="column.key === 'assignee'">
              {{ record.assignee || '-' }}
            </template>
            <template v-if="column.key === 'ops'">
              <Space>
                <Button type="link" size="small" @click="openDetailFromTable(record)">详情</Button>
                <Button type="link" size="small" @click="router.push(`/event/detail?id=${record.eventId}`)">事件</Button>
              </Space>
            </template>
          </template>
        </Table>
      </Card>
    </div>

    <!-- Detail Drawer -->
    <Drawer v-model:open="detailVisible" :title="currentOrder?.id || ''" width="520" placement="right">
      <template #extra>
        <Button type="link" size="small" @click="router.push(`/event/workorder-detail?id=${currentOrder?.id}`)">在页面中查看 ›</Button>
      </template>
      <template v-if="currentOrder">
        <Steps :current="currentOrder.status" size="small" class="mb-4" :items="statusLabels.map(s => ({ title: s }))" />

        <Descriptions bordered :column="2" size="small">
          <DescriptionsItem label="标题" :span="2">{{ currentOrder.title }}</DescriptionsItem>
          <DescriptionsItem label="关联事件">
            <Button type="link" size="small" style="padding: 0" @click="router.push(`/event/detail?id=${currentOrder.eventId}`)">{{ currentOrder.eventId }}</Button>
          </DescriptionsItem>
          <DescriptionsItem label="关联场景">
            <Tag color="blue" size="small">{{ currentRelatedEvent?.scene || '未归类' }}</Tag>
          </DescriptionsItem>
          <DescriptionsItem label="类型">{{ currentOrder.type }}</DescriptionsItem>
          <DescriptionsItem label="来源"><Tag :color="sourceColor(currentOrder.source)" size="small">{{ currentOrder.source }}</Tag></DescriptionsItem>
          <DescriptionsItem label="优先级"><Tag :color="priorityColor(currentOrder.priority)" size="small">{{ currentOrder.priority }}</Tag></DescriptionsItem>
          <DescriptionsItem label="级别"><Tag :color="levelColor(currentOrder.level)" size="small">{{ currentOrder.level }}</Tag></DescriptionsItem>
          <DescriptionsItem label="处理人">{{ currentOrder.assignee || '未指派' }}</DescriptionsItem>
          <DescriptionsItem label="位置">{{ currentOrder.location }}</DescriptionsItem>
          <DescriptionsItem label="截止时间">{{ currentOrder.deadline }}</DescriptionsItem>
          <DescriptionsItem label="事件状态">
            <Tag :color="currentRelatedEvent?.status === '已闭环' ? 'green' : 'orange'">
              {{ currentRelatedEvent?.status || '未知' }}
            </Tag>
          </DescriptionsItem>
          <DescriptionsItem label="证据数量">{{ currentOrder.evidences.length }} 份</DescriptionsItem>
          <DescriptionsItem label="描述" :span="2">{{ currentOrder.description }}</DescriptionsItem>
        </Descriptions>

        <!-- Actions by status -->
        <Card size="small" :bordered="false" class="mt-4" title="操作">
          <!-- 待指派 -->
          <div v-if="currentOrder.status === 0" class="action-area">
            <Select v-model:value="assigneeSelect" placeholder="选择处理人" style="width: 200px" size="small">
              <SelectOption v-for="a in assigneeOptions" :key="a" :value="a">{{ a }}</SelectOption>
            </Select>
            <Button type="primary" size="small" @click="handleAssign">确认指派</Button>
          </div>
          <!-- 待处置 -->
          <div v-else-if="currentOrder.status === 1" class="action-area">
            <Button type="primary" size="small" @click="handleArrive">标记到达现场</Button>
          </div>
          <!-- 处置中 -->
          <div v-else-if="currentOrder.status === 2" class="action-area-col">
            <Textarea v-model:value="handleNote" :rows="3" placeholder="填写处置说明..." />
            <Button type="primary" size="small" @click="handleSubmit">提交处置记录</Button>
          </div>
          <!-- 待复核 -->
          <div v-else-if="currentOrder.status === 3" class="action-area-col">
            <Textarea v-model:value="reviewNote" :rows="2" placeholder="复核说明（可选）" />
            <Space>
              <Button type="primary" size="small" @click="handleReview(true)">通过并归档</Button>
              <Button size="small" danger @click="handleReview(false)">驳回</Button>
            </Space>
          </div>
          <!-- 已归档 -->
          <div v-else>
            <Badge status="success" text="工单已归档闭环" />
          </div>
        </Card>

        <!-- Timeline -->
        <Card size="small" :bordered="false" class="mt-4" title="闭环摘要">
          <div class="summary-box">
            {{ currentOrder.closureSummary || '当前工单尚未形成闭环摘要，可在归档或工单详情页继续补充。' }}
          </div>
          <div class="mt-3 flex flex-wrap gap-2">
            <Button size="small" @click="router.push(`/event/map-view?id=${currentOrder.eventId}`)">地图聚焦</Button>
            <Button size="small" @click="router.push(`/event/review?id=${currentOrder.eventId}`)">打开复核</Button>
            <Button size="small" @click="router.push(`/event/report?scene=${currentRelatedEvent?.scene || ''}`)">查看报告</Button>
          </div>
        </Card>

        <Card size="small" :bordered="false" class="mt-4" title="处置日志">
          <Timeline>
            <TimelineItem v-for="(log, i) in currentOrder.logs" :key="i" :color="i === currentOrder.logs.length - 1 ? 'blue' : 'gray'">
              <div class="flex items-center gap-2">
                <Tag size="small">{{ log.action }}</Tag>
                <span class="text-xs" style="color: var(--ant-color-text-tertiary)">{{ log.time }} · {{ log.user }}</span>
              </div>
              <div v-if="log.note" class="mt-1 text-sm" style="color: var(--ant-color-text-secondary)">{{ log.note }}</div>
            </TimelineItem>
          </Timeline>
        </Card>
      </template>
    </Drawer>
  </Page>
</template>

<style lang="less" scoped>
.status-card { cursor: pointer; text-align: center; transition: all 0.2s; }
.status-card--active { border-color: var(--ant-color-primary); background: var(--ant-color-primary-bg); }
.status-card__count { font-size: 24px; font-weight: 800; color: var(--ant-color-text); font-variant-numeric: tabular-nums; }
.status-card__label { font-size: 12px; color: var(--ant-color-text-tertiary); display: flex; align-items: center; justify-content: center; gap: 4px; }

.action-area { display: flex; align-items: center; gap: 12px; }
.action-area-col { display: flex; flex-direction: column; gap: 10px; }
.toolbar-card { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
.toolbar-card__title { font-size: 14px; font-weight: 700; color: var(--ant-color-text); }
.toolbar-card__desc { font-size: 12px; color: var(--ant-color-text-tertiary); margin-top: 4px; }
.metric-card__value { font-size: 24px; font-weight: 800; color: var(--ant-color-text); font-variant-numeric: tabular-nums; }
.metric-card__label { font-size: 12px; color: var(--ant-color-text-tertiary); margin-top: 2px; }
.summary-box { padding: 12px 14px; border-radius: 14px; background: var(--ant-color-bg-layout); color: var(--ant-color-text-secondary); font-size: 13px; line-height: 1.8; }
</style>
