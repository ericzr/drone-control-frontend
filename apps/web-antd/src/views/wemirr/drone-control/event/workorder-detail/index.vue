<script lang="ts" setup name="EventWorkorderDetailPage">
import { Page } from '@vben/common-ui';

import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import {
  Badge,
  Button,
  Card,
  Col,
  Descriptions,
  DescriptionsItem,
  Input,
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
  appendWorkorderEvidence,
  getClosureWorkorderById,
  syncWorkorderStatus,
} from '../../_services/event-closure-store';
import EventContextBar from '../../components/EventContextBar.vue';

const router = useRouter();
const route = useRoute();

const statusLabels = ['待指派', '待处置', '处置中', '待复核', '已归档'];

const orderId = computed(() => (route.query.id as string) || 'WO-20260413-001');
const order = ref(getClosureWorkorderById(orderId.value)!);

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
function levelColor(l: string) { return l === '紧急' ? 'red' : 'orange'; }

const assigneeOptions = ['张伟', '李明', '王芳', '赵强', '刘洋', '陈静'];
const assigneeSelect = ref('');
const handleNote = ref('');
const reviewNote = ref('');
const closureSummary = ref('');
const evidenceForm = ref({
  title: '',
  type: '图片',
  summary: '',
});

function handleAssign() {
  if (!assigneeSelect.value) { message.warning('请选择处理人'); return; }
  const updated = syncWorkorderStatus({
    workorderId: order.value.id,
    status: 1,
    assignee: assigneeSelect.value,
    log: { time: new Date().toLocaleTimeString().slice(0, 5), action: '指派处理人', user: '当前用户', note: `指派 ${assigneeSelect.value}` },
  });
  if (updated) order.value = { ...updated };
  message.success('已指派');
}

function handleArrive() {
  const updated = syncWorkorderStatus({
    workorderId: order.value.id,
    status: 2,
    log: { time: new Date().toLocaleTimeString().slice(0, 5), action: '到达现场', user: order.value.assignee },
  });
  if (updated) order.value = { ...updated };
  message.info('已标记到达现场');
}

function handleSubmit() {
  if (!handleNote.value) { message.warning('请填写处置说明'); return; }
  const updated = syncWorkorderStatus({
    workorderId: order.value.id,
    status: 3,
    log: { time: new Date().toLocaleTimeString().slice(0, 5), action: '提交处置', user: order.value.assignee, note: handleNote.value },
  });
  if (updated) order.value = { ...updated };
  handleNote.value = '';
  message.success('处置记录已提交');
}

function handleAddEvidence() {
  if (!evidenceForm.value.title || !evidenceForm.value.summary) {
    message.warning('请填写证据标题和说明');
    return;
  }
  const updated = appendWorkorderEvidence({
    workorderId: order.value.id,
    title: evidenceForm.value.title,
    type: evidenceForm.value.type as '图片' | '视频' | '文本',
    uploadedBy: '当前用户',
    summary: evidenceForm.value.summary,
  });
  if (updated) order.value = { ...updated };
  evidenceForm.value = { title: '', type: '图片', summary: '' };
  message.success('处置证据已补充');
}

function handleReview(pass: boolean) {
  const updated = syncWorkorderStatus({
    workorderId: order.value.id,
    status: pass ? 4 : 2,
    closureSummary: pass
      ? closureSummary.value || order.value.closureSummary || '已完成处置并归档'
      : order.value.closureSummary,
    log: { time: new Date().toLocaleTimeString().slice(0, 5), action: pass ? '复核通过' : '复核驳回', user: '当前用户', note: reviewNote.value || (pass ? '确认处置完毕' : '需重新处置') },
  });
  if (updated) order.value = { ...updated };
  if (pass) message.success('已归档');
  else message.warning('已驳回，退回处置');
  reviewNote.value = '';
}
</script>

<template>
  <Page>
    <div class="flex flex-col gap-4 p-2">
      <EventContextBar current="" />

      <!-- Header -->
      <Card :bordered="false">
        <div class="flex items-start justify-between">
          <div>
            <div class="flex items-center gap-3">
              <span class="text-lg font-bold" style="color: var(--ant-color-text)">{{ order.id }}</span>
              <Tag :color="sourceColor(order.source)" size="small">{{ order.source }}</Tag>
              <Tag :color="priorityColor(order.priority)" size="small">{{ order.priority }}</Tag>
              <Tag :color="levelColor(order.level)" size="small">{{ order.level }}</Tag>
            </div>
            <div class="mt-1 text-base font-semibold" style="color: var(--ant-color-text)">{{ order.title }}</div>
            <div class="mt-1 text-sm" style="color: var(--ant-color-text-tertiary)">
              {{ order.type }} · {{ order.location }} · {{ order.createTime }}
            </div>
          </div>
          <Space>
            <Button @click="pushWithContext('/event/detail', { id: order.eventId })">查看关联事件</Button>
            <Button @click="router.back()">返回列表</Button>
          </Space>
        </div>
      </Card>

      <!-- Steps -->
      <Card :bordered="false" title="工单进度">
        <Steps :current="order.status" size="small" :items="statusLabels.map(s => ({ title: s }))" />
      </Card>

      <Row :gutter="[16, 16]">
        <!-- Left: Info + Actions -->
        <Col :lg="12" :span="24">
          <Card :bordered="false" title="基本信息">
            <Descriptions bordered :column="1" size="small">
              <DescriptionsItem label="工单编号">{{ order.id }}</DescriptionsItem>
              <DescriptionsItem label="标题">{{ order.title }}</DescriptionsItem>
              <DescriptionsItem label="关联事件">
                <Button type="link" size="small" style="padding: 0" @click="pushWithContext('/event/detail', { id: order.eventId })">{{ order.eventId }}</Button>
              </DescriptionsItem>
              <DescriptionsItem label="类型">{{ order.type }}</DescriptionsItem>
              <DescriptionsItem label="来源"><Tag :color="sourceColor(order.source)" size="small">{{ order.source }}</Tag></DescriptionsItem>
              <DescriptionsItem label="优先级"><Tag :color="priorityColor(order.priority)" size="small">{{ order.priority }}</Tag></DescriptionsItem>
              <DescriptionsItem label="级别"><Tag :color="levelColor(order.level)" size="small">{{ order.level }}</Tag></DescriptionsItem>
              <DescriptionsItem label="处理人">{{ order.assignee || '未指派' }}</DescriptionsItem>
              <DescriptionsItem label="创建人">{{ order.creator }}</DescriptionsItem>
              <DescriptionsItem label="位置">{{ order.location }}</DescriptionsItem>
              <DescriptionsItem label="创建时间">{{ order.createTime }}</DescriptionsItem>
              <DescriptionsItem label="截止时间">{{ order.deadline }}</DescriptionsItem>
              <DescriptionsItem label="描述">{{ order.description }}</DescriptionsItem>
            </Descriptions>
          </Card>

          <Card :bordered="false" title="处置操作" class="mt-4">
            <div v-if="order.status === 0" class="action-area">
              <Select v-model:value="assigneeSelect" placeholder="选择处理人" style="width: 200px" size="small">
                <SelectOption v-for="a in assigneeOptions" :key="a" :value="a">{{ a }}</SelectOption>
              </Select>
              <Button type="primary" size="small" @click="handleAssign">确认指派</Button>
            </div>
            <div v-else-if="order.status === 1" class="action-area">
              <Button type="primary" size="small" @click="handleArrive">标记到达现场</Button>
            </div>
            <div v-else-if="order.status === 2" class="action-area-col">
              <Textarea v-model:value="handleNote" :rows="3" placeholder="填写处置说明..." />
              <Button type="primary" size="small" @click="handleSubmit">提交处置记录</Button>
            </div>
            <div v-else-if="order.status === 3" class="action-area-col">
              <Textarea v-model:value="closureSummary" :rows="2" placeholder="归档摘要（用于事件报告和客户汇报）" />
              <Textarea v-model:value="reviewNote" :rows="2" placeholder="复核说明（可选）" />
              <Space>
                <Button type="primary" size="small" @click="handleReview(true)">通过并归档</Button>
                <Button size="small" danger @click="handleReview(false)">驳回</Button>
              </Space>
            </div>
            <div v-else>
              <Badge status="success" text="工单已归档闭环" />
            </div>
          </Card>

          <Card :bordered="false" title="处置证据" class="mt-4">
            <div class="action-area-col">
              <div class="grid gap-3 md:grid-cols-2">
                <Input v-model:value="evidenceForm.title" placeholder="证据标题，例如：现场照片 1" />
                <Select v-model:value="evidenceForm.type" size="small">
                  <SelectOption value="图片">图片</SelectOption>
                  <SelectOption value="视频">视频</SelectOption>
                  <SelectOption value="文本">文本</SelectOption>
                </Select>
              </div>
              <Textarea v-model:value="evidenceForm.summary" :rows="2" placeholder="补充证据说明，例如拍摄位置、处置结果等" />
              <div>
                <Button size="small" @click="handleAddEvidence">添加证据</Button>
              </div>
              <div class="flex flex-col gap-2">
                <div
                  v-for="evidence in order.evidences"
                  :key="evidence.id"
                  class="rounded-lg border border-slate-200 p-3 dark:border-slate-700"
                >
                  <div class="flex items-center justify-between">
                    <div class="font-medium">{{ evidence.title }}</div>
                    <Tag size="small">{{ evidence.type }}</Tag>
                  </div>
                  <div class="mt-1 text-xs text-slate-500">{{ evidence.uploadedAt }} · {{ evidence.uploadedBy }}</div>
                  <div class="mt-2 text-sm">{{ evidence.summary }}</div>
                </div>
              </div>
            </div>
          </Card>
        </Col>

        <!-- Right: Timeline -->
        <Col :lg="12" :span="24">
          <Card :bordered="false" title="闭环摘要" class="mb-4">
            <div class="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm leading-6 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
              {{ order.closureSummary || '当前工单尚未形成闭环摘要，归档时可补充用于事件报告和客户汇报。' }}
            </div>
          </Card>

          <Card :bordered="false" title="处置日志">
            <Timeline>
              <TimelineItem v-for="(log, i) in order.logs" :key="i" :color="i === order.logs.length - 1 ? 'blue' : 'gray'">
                <div class="flex items-center gap-2">
                  <Tag size="small">{{ log.action }}</Tag>
                  <span class="text-xs" style="color: var(--ant-color-text-tertiary)">{{ log.time }} · {{ log.user }}</span>
                </div>
                <div v-if="log.note" class="mt-1 text-sm" style="color: var(--ant-color-text-secondary)">{{ log.note }}</div>
              </TimelineItem>
            </Timeline>
          </Card>
        </Col>
      </Row>
    </div>
  </Page>
</template>

<style lang="less" scoped>
.action-area { display: flex; align-items: center; gap: 12px; }
.action-area-col { display: flex; flex-direction: column; gap: 10px; }
</style>
