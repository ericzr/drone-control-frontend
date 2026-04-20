<script lang="ts" setup name="DispatchTaskPage">
import { Page } from '@vben/common-ui';

import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { consumePendingTakeoffTasks } from '../../_services/takeoff-task-store';
import { getPriorityColor, getTaskStatusColor } from '../../constants/colors';

import {
  Button,
  Card,
  Col,
  Descriptions,
  DescriptionsItem,
  Drawer,
  Form,
  FormItem,
  Input,
  Modal,
  Progress,
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

const router = useRouter();

interface TaskRecord {
  key: string;
  name: string;
  type: string;
  airport: string;
  drone: string;
  routeName: string;
  priority: string;
  status: string;
  schedule: string;
  aiPolicy: string;
  progress: number;
}

const taskColumns = [
  { title: '任务名称', dataIndex: 'name', key: 'name', width: 180 },
  { title: '任务类型', dataIndex: 'type', key: 'type', width: 100 },
  { title: '执行机场', dataIndex: 'airport', key: 'airport', width: 150 },
  { title: '执行无人机', dataIndex: 'drone', key: 'drone', width: 150 },
  { title: '优先级', dataIndex: 'priority', key: 'priority', width: 90 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '计划时间', dataIndex: 'schedule', key: 'schedule', width: 140 },
  { title: '操作', dataIndex: 'action', key: 'action', width: 200 },
];

const tasks = ref([
  { key: '1', name: '高新主干道日巡', type: '定时巡查', airport: '高新区一号机场', drone: 'M300-01', routeName: '高新区主干道双向巡查线', priority: '普通', status: '执行中', schedule: '14:20 - 15:00', aiPolicy: '违停识别', progress: 72 },
  { key: '2', name: '城管全覆盖巡查', type: '定时巡查', airport: '城管巡检机场', drone: 'M300-07', routeName: '城管巡检区全覆盖航线', priority: '普通', status: '执行中', schedule: '14:35 - 15:20', aiPolicy: '占道检测', progress: 45 },
  { key: '3', name: '生态水域巡查', type: '定时巡查', airport: '生态园区机场', drone: 'M350-03', routeName: '生态园区水域巡查线', priority: '普通', status: '执行中', schedule: '14:00 - 14:55', aiPolicy: '漂浮物识别', progress: 95 },
  { key: '4', name: '沿河排污口核查', type: '应急复核', airport: '水务巡检机场', drone: 'M30-06', routeName: '沿河排污口核查线', priority: '高', status: '排队中', schedule: '15:10', aiPolicy: '排污口比对', progress: 0 },
  { key: '5', name: '林草热成像巡检', type: '应急复核', airport: '林草防火机场', drone: 'M30T-02', routeName: '北坡林区应急航线', priority: '紧急', status: '排队中', schedule: '15:20', aiPolicy: '烟火识别', progress: 0 },
  { key: '6', name: '交通晚高峰监测', type: '定时巡查', airport: '交通主干道机场', drone: 'FP-04', routeName: '交通主干道监测线', priority: '普通', status: '排队中', schedule: '17:30', aiPolicy: '车流统计', progress: 0 },
  { key: '7', name: '光伏园区测绘', type: '专项采集', airport: '光伏园区机场', drone: 'T40-08', routeName: '光伏A区测绘航线', priority: '普通', status: '排队中', schedule: '待定', aiPolicy: '热斑检测', progress: 0 },
  { key: '8', name: '林区周界巡检', type: '定时巡查', airport: '林草防火机场', drone: 'M30T-02', routeName: '林草周界定时巡检线', priority: '普通', status: '排队中', schedule: '明日 06:00', aiPolicy: '周界识别', progress: 0 },
  { key: '9', name: '高新路口违停抓拍', type: '定时巡查', airport: '高新区一号机场', drone: 'M300-01', routeName: '高新区违停抓拍线', priority: '普通', status: '已完成', schedule: '08:30 - 09:10', aiPolicy: '违停识别', progress: 100 },
  { key: '10', name: '林草晨巡', type: '定时巡查', airport: '林草防火机场', drone: 'M30T-02', routeName: '林草全域晨巡线', priority: '普通', status: '已完成', schedule: '06:00 - 06:45', aiPolicy: '烟火识别', progress: 100 },
  { key: '11', name: '违建区域航拍取证', type: '临时交办', airport: '城管巡检机场', drone: 'M300-07', routeName: '朝阳路违建取证线', priority: '高', status: '排队中', schedule: '16:00', aiPolicy: '违建检测', progress: 0 },
]);

const selectedStatus = ref('全部');
const selectedType = ref('全部');

const statusOptions = [
  { label: '全部', value: '全部' },
  { label: '执行中', value: '执行中' },
  { label: '排队中', value: '排队中' },
  { label: '已完成', value: '已完成' },
  { label: '返航中', value: '返航中' },
  { label: '已取消', value: '已取消' },
];

const typeOptions = [
  { label: '全部类型', value: '全部' },
  { label: '定时巡查', value: '定时巡查' },
  { label: '应急复核', value: '应急复核' },
  { label: '临时交办', value: '临时交办' },
  { label: '专项采集', value: '专项采集' },
];

const stats = computed(() => [
  { title: '排队中', value: tasks.value.filter((t) => t.status === '排队中').length, suffix: '个' },
  { title: '执行中', value: tasks.value.filter((t) => t.status === '执行中').length, suffix: '个' },
  { title: '今日完成', value: tasks.value.filter((t) => t.status === '已完成').length, suffix: '个' },
  { title: '今日取消', value: 2, suffix: '个' },
]);

onMounted(() => {
  const pending = consumePendingTakeoffTasks();
  if (pending.length === 0) return;
  for (const p of pending) {
    tasks.value.unshift({
      key: p.id,
      name: `一键起飞 · ${p.dockName}`,
      type: '机巢起飞',
      airport: p.dockName,
      drone: p.drone || '--',
      routeName: `目标 ${p.targetLat}, ${p.targetLng} · 高度 ${p.altitude}m`,
      priority: '高',
      status: '执行中',
      schedule: '刚刚',
      aiPolicy: '航线跟随',
      progress: 5,
    });
  }
  message.success(`已同步机巢起飞任务 ${pending.length} 条（会话演示）`);
});

const filteredTasks = computed(() => {
  return tasks.value.filter((t) => {
    if (selectedStatus.value !== '全部' && t.status !== selectedStatus.value) return false;
    if (selectedType.value !== '全部' && t.type !== selectedType.value) return false;
    return true;
  });
});

const detailOpen = ref(false);
const selectedTask = ref<(typeof tasks.value)[0] | null>(null);

const dispatchLog = ref([
  { time: '14:42', content: 'M300-01 违停告警 → 已推送城管联动', color: 'red' as const },
  { time: '14:38', content: 'M300-07 航线进度 45%，资源正常', color: 'blue' as const },
  { time: '14:35', content: '城管全覆盖巡查已自动起飞', color: 'green' as const },
  { time: '14:20', content: '高新主干道日巡已起飞', color: 'green' as const },
  { time: '14:15', content: '沿河排污口核查进入排队队列（优先级：高）', color: 'orange' as const },
  { time: '14:05', content: 'M350-03 低电量返航，资源释放中', color: 'orange' as const },
]);

const getStatusColor = getTaskStatusColor;

function openDetail(record: TaskRecord) {
  selectedTask.value = record;
  detailOpen.value = true;
}

function promotePriority(record: TaskRecord) {
  if (record.priority === '普通') record.priority = '高';
  else if (record.priority === '高') record.priority = '紧急';
  const idx = tasks.value.findIndex((t) => t.key === record.key);
  if (idx > 0) {
    const [item] = tasks.value.splice(idx, 1);
    const firstQueued = tasks.value.findIndex((t) => t.status === '排队中');
    tasks.value.splice(firstQueued >= 0 ? firstQueued : 0, 0, item!);
  }
  dispatchLog.value.unshift({ time: new Date().toLocaleTimeString().slice(0, 5), content: `${record.name} 优先级提升为「${record.priority}」`, color: 'orange' });
  message.success(`已提升「${record.name}」优先级为 ${record.priority}`);
}

function recallDrone(record: TaskRecord) {
  Modal.confirm({
    title: '确认返航',
    content: `确定要召回「${record.drone}」？当前任务「${record.name}」将中止并执行返航。`,
    okText: '确认返航',
    okType: 'danger',
    onOk() {
      record.status = '返航中';
      dispatchLog.value.unshift({ time: new Date().toLocaleTimeString().slice(0, 5), content: `${record.drone} 收到返航指令，${record.name} 中止`, color: 'red' });
      message.warning(`已发送「${record.drone}」返航指令`);
    },
  });
}

function cancelTask(record: TaskRecord) {
  Modal.confirm({
    title: '取消任务',
    content: `确定取消任务「${record.name}」？`,
    okText: '确认取消',
    okType: 'danger',
    onOk() {
      record.status = '已取消';
      dispatchLog.value.unshift({ time: new Date().toLocaleTimeString().slice(0, 5), content: `${record.name} 已取消`, color: 'red' });
      message.info(`已取消「${record.name}」`);
    },
  });
}

const createModalVisible = ref(false);
const editingKey = ref<string | null>(null);
const newTask = ref({
  name: '',
  type: '定时巡查',
  airport: '',
  drone: '',
  routeName: '',
  priority: '普通',
  schedule: '',
  aiPolicy: '',
});
let nextKeySeq = 100;

const airportOptions = ['高新区一号机场', '城管巡检机场', '生态园区机场', '水务巡检机场', '林草防火机场', '交通主干道机场', '光伏园区机场'];
const droneOptions = ['M300-01', 'M300-07', 'M350-03', 'M30-06', 'M30T-02', 'FP-04', 'T40-08'];
const routeOptions = ['高新区主干道双向巡查线', '城管巡检区全覆盖航线', '生态园区水域巡查线', '沿河排污口核查线', '北坡林区应急航线', '交通主干道监测线', '光伏A区测绘航线'];
const aiPolicyOptions = ['违停识别', '占道检测', '漂浮物识别', '排污口比对', '烟火识别', '车流统计', '热斑检测', '违建检测', '安全帽检测'];

function openCreateModal() {
  editingKey.value = null;
  newTask.value = { name: '', type: '定时巡查', airport: '', drone: '', routeName: '', priority: '普通', schedule: '', aiPolicy: '' };
  createModalVisible.value = true;
}

function confirmCreateTask() {
  if (!newTask.value.name || !newTask.value.airport || !newTask.value.drone) {
    message.warning('请填写必要信息');
    return;
  }

  if (editingKey.value) {
    const idx = tasks.value.findIndex((t) => t.key === editingKey.value);
    if (idx >= 0) {
      const row = tasks.value[idx]!;
      Object.assign(row, {
        name: newTask.value.name,
        type: newTask.value.type,
        airport: newTask.value.airport,
        drone: newTask.value.drone,
        routeName: newTask.value.routeName,
        priority: newTask.value.priority,
        schedule: newTask.value.schedule || row.schedule,
        aiPolicy: newTask.value.aiPolicy,
      });
      createModalVisible.value = false;
      dispatchLog.value.unshift({ time: new Date().toLocaleTimeString().slice(0, 5), content: `调度任务「${newTask.value.name}」已更新`, color: 'blue' });
      message.success(`已更新调度任务「${newTask.value.name}」`);
      editingKey.value = null;
      return;
    }
  }

  const key = String(nextKeySeq++);
  tasks.value.push({
    key,
    name: newTask.value.name,
    type: newTask.value.type,
    airport: newTask.value.airport,
    drone: newTask.value.drone,
    routeName: newTask.value.routeName,
    priority: newTask.value.priority,
    status: '排队中',
    schedule: newTask.value.schedule || '待定',
    aiPolicy: newTask.value.aiPolicy,
    progress: 0,
  });
  createModalVisible.value = false;
  dispatchLog.value.unshift({ time: new Date().toLocaleTimeString().slice(0, 5), content: `新建调度任务「${newTask.value.name}」进入排队`, color: 'green' });
  message.success(`已创建调度任务「${newTask.value.name}」`);
}

function dispatchNow(record: TaskRecord) {
  Modal.confirm({
    title: '立即下发',
    content: `确认将「${record.name}」下发到 ${record.drone}（${record.airport}）执行？`,
    okText: '确认下发',
    onOk() {
      record.status = '执行中';
      record.progress = 5;
      dispatchLog.value.unshift({ time: new Date().toLocaleTimeString().slice(0, 5), content: `${record.name} 已下发执行，${record.drone} 起飞中`, color: 'green' });
      message.success(`「${record.name}」已下发执行`);
    },
  });
}

function editTask(record: TaskRecord) {
  editingKey.value = record.key;
  newTask.value = {
    name: record.name,
    type: record.type,
    airport: record.airport,
    drone: record.drone,
    routeName: record.routeName,
    priority: record.priority,
    schedule: record.schedule,
    aiPolicy: record.aiPolicy,
  };
  createModalVisible.value = true;
}

function goCockpit(record: TaskRecord) {
  router.push(`/flight/cockpit?drone=${encodeURIComponent(record.drone)}&mission=${encodeURIComponent(record.name)}`);
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
        <Col :xl="16" :span="24">
          <Card :bordered="false" title="任务调度队列">
            <template #extra>
              <Space>
                <Select v-model:value="selectedType" :options="typeOptions" style="width: 130px" />
                <Select v-model:value="selectedStatus" :options="statusOptions" style="width: 120px" />
                <Button type="primary" @click="openCreateModal">新建调度</Button>
              </Space>
            </template>
            <Table
              :columns="taskColumns"
              :data-source="filteredTasks"
              :pagination="{ pageSize: 8 }"
              row-key="key"
              size="small"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'priority'">
                  <Tag :color="getPriorityColor(record.priority)">{{ record.priority }}</Tag>
                </template>
                <template v-else-if="column.key === 'status'">
                  <Tag :color="getStatusColor(record.status)">{{ record.status }}</Tag>
                </template>
                <template v-else-if="column.key === 'action'">
                  <Space>
                    <Button size="small" type="link" @click="openDetail(record)">详情</Button>
                    <Button
                      v-if="record.status === '排队中'"
                      size="small"
                      type="link"
                      @click="promotePriority(record)"
                    >
                      提升优先级
                    </Button>
                    <Button
                      v-if="record.status === '执行中'"
                      size="small"
                      type="link"
                      @click="goCockpit(record)"
                    >
                      座舱
                    </Button>
                    <Button
                      v-if="record.status === '执行中'"
                      size="small"
                      type="link"
                      danger
                      @click="recallDrone(record)"
                    >
                      返航
                    </Button>
                    <Button
                      v-if="record.status === '排队中'"
                      size="small"
                      type="link"
                      danger
                      @click="cancelTask(record)"
                    >
                      取消
                    </Button>
                  </Space>
                </template>
              </template>
            </Table>
          </Card>
        </Col>

        <Col :xl="8" :span="24">
          <Card :bordered="false" title="调度事件流">
            <Timeline>
              <TimelineItem
                v-for="item in dispatchLog"
                :key="item.time + item.content"
                :color="item.color"
              >
                <div class="text-xs text-slate-400">{{ item.time }}</div>
                <div class="text-sm text-slate-700 dark:text-slate-300">{{ item.content }}</div>
              </TimelineItem>
            </Timeline>
          </Card>
        </Col>
      </Row>

      <Drawer v-model:open="detailOpen" title="调度任务详情" width="440" placement="right">
        <template v-if="selectedTask">
          <Descriptions :column="1" bordered size="small">
            <DescriptionsItem label="任务名称">{{ selectedTask.name }}</DescriptionsItem>
            <DescriptionsItem label="任务类型">
              <Tag>{{ selectedTask.type }}</Tag>
            </DescriptionsItem>
            <DescriptionsItem label="关联航线">{{ selectedTask.routeName }}</DescriptionsItem>
            <DescriptionsItem label="执行机场">{{ selectedTask.airport }}</DescriptionsItem>
            <DescriptionsItem label="执行无人机">{{ selectedTask.drone }}</DescriptionsItem>
            <DescriptionsItem label="优先级">
              <Tag :color="getPriorityColor(selectedTask.priority)">{{ selectedTask.priority }}</Tag>
            </DescriptionsItem>
            <DescriptionsItem label="状态">
              <Tag :color="getStatusColor(selectedTask.status)">{{ selectedTask.status }}</Tag>
            </DescriptionsItem>
            <DescriptionsItem label="计划时间">{{ selectedTask.schedule }}</DescriptionsItem>
            <DescriptionsItem label="AI 策略">{{ selectedTask.aiPolicy }}</DescriptionsItem>
            <DescriptionsItem label="执行进度">
              <Progress :percent="selectedTask.progress" size="small" :status="selectedTask.progress >= 100 ? 'success' : 'active'" />
            </DescriptionsItem>
          </Descriptions>
          <div class="mt-4 flex gap-2">
            <Button v-if="selectedTask.status === '排队中'" type="primary" @click="dispatchNow(selectedTask)">立即下发</Button>
            <Button v-if="selectedTask.status === '执行中'" type="primary" danger @click="recallDrone(selectedTask)">一键返航</Button>
            <Button v-if="selectedTask.status === '执行中'" type="link" @click="goCockpit(selectedTask)">进入座舱</Button>
            <Button v-if="selectedTask.status === '排队中'" @click="editTask(selectedTask)">编辑</Button>
          </div>
        </template>
      </Drawer>
      <Modal v-model:open="createModalVisible" :title="editingKey ? '编辑调度任务' : '新建调度任务'" :ok-text="editingKey ? '保存' : '创建'" width="560px" @ok="confirmCreateTask">
        <Form layout="vertical" class="mt-2">
          <FormItem label="任务名称" required>
            <Input v-model:value="newTask.name" placeholder="如：高新区巡查" />
          </FormItem>
          <FormItem label="任务类型">
            <Select v-model:value="newTask.type" style="width: 100%">
              <SelectOption value="定时巡查">定时巡查</SelectOption>
              <SelectOption value="应急复核">应急复核</SelectOption>
              <SelectOption value="临时交办">临时交办</SelectOption>
              <SelectOption value="专项采集">专项采集</SelectOption>
            </Select>
          </FormItem>
          <FormItem label="执行机场" required>
            <Select v-model:value="newTask.airport" placeholder="选择机场" style="width: 100%">
              <SelectOption v-for="ap in airportOptions" :key="ap" :value="ap">{{ ap }}</SelectOption>
            </Select>
          </FormItem>
          <FormItem label="执行无人机" required>
            <Select v-model:value="newTask.drone" placeholder="选择无人机" style="width: 100%">
              <SelectOption v-for="d in droneOptions" :key="d" :value="d">{{ d }}</SelectOption>
            </Select>
          </FormItem>
          <FormItem label="关联航线">
            <Select v-model:value="newTask.routeName" placeholder="选择航线" style="width: 100%" allow-clear>
              <SelectOption v-for="r in routeOptions" :key="r" :value="r">{{ r }}</SelectOption>
            </Select>
          </FormItem>
          <FormItem label="优先级">
            <Select v-model:value="newTask.priority" style="width: 100%">
              <SelectOption value="普通">普通</SelectOption>
              <SelectOption value="高">高</SelectOption>
              <SelectOption value="紧急">紧急</SelectOption>
            </Select>
          </FormItem>
          <FormItem label="AI 策略">
            <Select v-model:value="newTask.aiPolicy" placeholder="选择 AI 识别策略" style="width: 100%" allow-clear>
              <SelectOption v-for="a in aiPolicyOptions" :key="a" :value="a">{{ a }}</SelectOption>
            </Select>
          </FormItem>
          <FormItem label="计划时间">
            <Input v-model:value="newTask.schedule" placeholder="如：15:00 或 明日 06:00" />
          </FormItem>
        </Form>
      </Modal>
    </div>
  </Page>
</template>
