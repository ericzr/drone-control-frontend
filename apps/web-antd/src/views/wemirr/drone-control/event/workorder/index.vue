<script lang="ts" setup name="EventWorkorderPage">
import { Page } from '@vben/common-ui';

import { computed, ref } from 'vue';

import {
  Badge,
  Button,
  Card,
  Col,
  Descriptions,
  DescriptionsItem,
  Drawer,
  Input,
  Modal,
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
  message,
} from 'ant-design-vue';

interface Workorder {
  id: string;
  title: string;
  eventId: string;
  type: string;
  level: string;
  status: number;
  location: string;
  assignee: string;
  creator: string;
  createTime: string;
  deadline: string;
  description: string;
  logs: { time: string; action: string; user: string; note?: string }[];
}

const statusLabels = ['待指派', '待处置', '处置中', '待复核', '已归档'];

const workorders = ref<Workorder[]>([
  {
    id: 'WO-20260413-001', title: '北坡林区烟雾告警处置', eventId: 'EVT-20260413-003',
    type: '告警处置', level: '紧急', status: 4, location: '北坡 230m 处',
    assignee: '张伟', creator: '系统自动', createTime: '2026-04-13 14:33', deadline: '2026-04-13 16:00',
    description: 'AI 检测到北坡林区疑似烟雾，置信度 92%，需现场核实并处置。',
    logs: [
      { time: '14:33', action: '工单创建', user: '系统', note: 'AI 告警自动生成' },
      { time: '14:35', action: '指派处理人', user: '李指挥', note: '指派张伟前往现场' },
      { time: '14:50', action: '到达现场', user: '张伟', note: '已到达，确认为农户焚烧秸秆' },
      { time: '15:10', action: '提交处置', user: '张伟', note: '已劝阻农户并扑灭明火，拍照取证' },
      { time: '15:25', action: '复核通过', user: '李指挥', note: '确认处置完毕，归档' },
    ],
  },
  {
    id: 'WO-20260413-002', title: '人民路违停车辆处置', eventId: 'EVT-20260413-005',
    type: '告警处置', level: '一般', status: 2, location: '人民路交叉口',
    assignee: '王芳', creator: '系统自动', createTime: '2026-04-13 15:00', deadline: '2026-04-13 18:00',
    description: 'AI 检测到人民路交叉口红色轿车违停，需通知车主或拖移。',
    logs: [
      { time: '15:00', action: '工单创建', user: '系统', note: 'AI 告警自动生成' },
      { time: '15:05', action: '指派处理人', user: '赵指挥', note: '指派王芳处理' },
      { time: '15:20', action: '到达现场', user: '王芳', note: '已到达，正在联系车主' },
    ],
  },
  {
    id: 'WO-20260413-003', title: '渭河 K12 段漂浮物清理', eventId: 'EVT-20260413-008',
    type: '巡检工单', level: '一般', status: 1, location: '渭河 K12 段',
    assignee: '', creator: '李巡查', createTime: '2026-04-13 10:15', deadline: '2026-04-14 12:00',
    description: '巡检发现渭河 K12 段河面大量漂浮物聚集，需协调水务部门清理。',
    logs: [
      { time: '10:15', action: '工单创建', user: '李巡查', note: '巡检发现，手动创建' },
    ],
  },
  {
    id: 'WO-20260412-004', title: '工业区未戴安全帽人员', eventId: 'EVT-20260412-012',
    type: '告警处置', level: '紧急', status: 3, location: '工业区 B 区工地',
    assignee: '赵强', creator: '系统自动', createTime: '2026-04-12 16:40', deadline: '2026-04-12 18:00',
    description: 'AI 检测到工地现场 3 名人员未佩戴安全帽，需现场整改。',
    logs: [
      { time: '16:40', action: '工单创建', user: '系统', note: 'AI 告警自动生成' },
      { time: '16:42', action: '指派处理人', user: '李指挥', note: '指派赵强前往' },
      { time: '17:00', action: '到达现场', user: '赵强', note: '已到达，要求施工方整改' },
      { time: '17:20', action: '提交处置', user: '赵强', note: '施工方已整改，全员佩戴安全帽' },
    ],
  },
  {
    id: 'WO-20260412-005', title: '光伏板热斑异常', eventId: 'EVT-20260412-015',
    type: '巡检工单', level: '一般', status: 0, location: '光伏电站 A 区',
    assignee: '', creator: '系统自动', createTime: '2026-04-12 11:30', deadline: '2026-04-15 18:00',
    description: '红外巡检发现 A 区 3 号组串存在热斑异常，需安排检修。',
    logs: [
      { time: '11:30', action: '工单创建', user: '系统', note: '红外巡检自动生成' },
    ],
  },
]);

const columns = [
  { title: '工单编号', dataIndex: 'id', key: 'id', width: 170 },
  { title: '标题', dataIndex: 'title', key: 'title' },
  { title: '类型', dataIndex: 'type', key: 'type', width: 90 },
  { title: '级别', dataIndex: 'level', key: 'level', width: 70 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 80 },
  { title: '处理人', dataIndex: 'assignee', key: 'assignee', width: 80 },
  { title: '截止时间', dataIndex: 'deadline', key: 'deadline', width: 140 },
  { title: '', key: 'ops', width: 60 },
];

function levelColor(l: string) { return l === '紧急' ? 'red' : 'orange'; }
function statusTag(s: number) {
  const colors = ['default', 'orange', 'blue', 'purple', 'green'];
  return colors[s] || 'default';
}

// Detail drawer
const detailVisible = ref(false);
const currentOrder = ref<Workorder | null>(null);

function openDetail(order: Workorder) {
  currentOrder.value = order;
  detailVisible.value = true;
}

// Actions
const assigneeOptions = ['张伟', '李明', '王芳', '赵强', '刘洋', '陈静'];
const assigneeSelect = ref('');
const handleNote = ref('');
const reviewNote = ref('');

function handleAssign() {
  if (!currentOrder.value || !assigneeSelect.value) { message.warning('请选择处理人'); return; }
  currentOrder.value.assignee = assigneeSelect.value;
  currentOrder.value.status = 1;
  currentOrder.value.logs.push({ time: new Date().toLocaleTimeString().slice(0, 5), action: '指派处理人', user: '当前用户', note: `指派 ${assigneeSelect.value}` });
  message.success('已指派');
}

function handleArrive() {
  if (!currentOrder.value) return;
  currentOrder.value.status = 2;
  currentOrder.value.logs.push({ time: new Date().toLocaleTimeString().slice(0, 5), action: '到达现场', user: currentOrder.value.assignee });
  message.info('已标记到达现场');
}

function handleSubmit() {
  if (!currentOrder.value || !handleNote.value) { message.warning('请填写处置说明'); return; }
  currentOrder.value.status = 3;
  currentOrder.value.logs.push({ time: new Date().toLocaleTimeString().slice(0, 5), action: '提交处置', user: currentOrder.value.assignee, note: handleNote.value });
  handleNote.value = '';
  message.success('处置记录已提交');
}

function handleReview(pass: boolean) {
  if (!currentOrder.value) return;
  if (pass) {
    currentOrder.value.status = 4;
    currentOrder.value.logs.push({ time: new Date().toLocaleTimeString().slice(0, 5), action: '复核通过', user: '当前用户', note: reviewNote.value || '确认处置完毕' });
    message.success('已归档');
  } else {
    currentOrder.value.status = 2;
    currentOrder.value.logs.push({ time: new Date().toLocaleTimeString().slice(0, 5), action: '复核驳回', user: '当前用户', note: reviewNote.value || '需重新处置' });
    message.warning('已驳回，退回处置');
  }
  reviewNote.value = '';
}

const filterStatus = ref<number | null>(null);
const filteredOrders = computed(() => {
  if (filterStatus.value === null) return workorders.value;
  return workorders.value.filter((o) => o.status === filterStatus.value);
});

const statusCounts = computed(() => {
  return statusLabels.map((_, i) => workorders.value.filter((o) => o.status === i).length);
});
</script>

<template>
  <Page>
    <div class="flex flex-col gap-3 p-2">
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
              <Button type="link" size="small" @click="openDetail(record)">详情</Button>
            </template>
          </template>
        </Table>
      </Card>
    </div>

    <!-- Detail Drawer -->
    <Drawer v-model:open="detailVisible" :title="currentOrder?.id || ''" width="520" placement="right">
      <template v-if="currentOrder">
        <Steps :current="currentOrder.status" size="small" class="mb-4" :items="statusLabels.map(s => ({ title: s }))" />

        <Descriptions bordered :column="2" size="small">
          <DescriptionsItem label="标题" :span="2">{{ currentOrder.title }}</DescriptionsItem>
          <DescriptionsItem label="关联事件">{{ currentOrder.eventId }}</DescriptionsItem>
          <DescriptionsItem label="类型">{{ currentOrder.type }}</DescriptionsItem>
          <DescriptionsItem label="级别"><Tag :color="levelColor(currentOrder.level)" size="small">{{ currentOrder.level }}</Tag></DescriptionsItem>
          <DescriptionsItem label="处理人">{{ currentOrder.assignee || '未指派' }}</DescriptionsItem>
          <DescriptionsItem label="位置">{{ currentOrder.location }}</DescriptionsItem>
          <DescriptionsItem label="截止时间">{{ currentOrder.deadline }}</DescriptionsItem>
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
</style>
