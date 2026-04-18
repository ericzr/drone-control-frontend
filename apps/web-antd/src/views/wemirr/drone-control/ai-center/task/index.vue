<script lang="ts" setup name="AiTaskCenterPage">
import { Page } from '@vben/common-ui';

import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

import {
  Alert,
  Button,
  Card,
  Col,
  Descriptions,
  DescriptionsItem,
  Drawer,
  Form,
  FormItem,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Statistic,
  Steps,
  Table,
  Tag,
  Timeline,
  TimelineItem,
  message,
} from 'ant-design-vue';

import {
  appendAiAnalysisTask,
  listAiAnalysisTasks,
  saveAiAnalysisTasks,
  upsertAiAnalysisTask,
  type AiAnalysisTaskRecord,
} from '../../_services/ai-analysis-task-store';
import {
  listAiDataSources,
  type AiDataSourceRecord,
} from '../../_services/ai-data-source-store';

const router = useRouter();

const tasks = ref<AiAnalysisTaskRecord[]>([]);
const sourceAssets = ref<AiDataSourceRecord[]>([]);
const createOpen = ref(false);
const detailOpen = ref(false);
const wizardStep = ref(0);
const selectedTask = ref<AiAnalysisTaskRecord | null>(null);
const selectedSourceId = ref<string>();

const sourceTypeOptions = [
  { label: '实时视频流', value: '实时视频流' },
  { label: '摄像头点位', value: '摄像头点位' },
  { label: '飞行影像', value: '飞行影像' },
  { label: '视频文件', value: '视频文件' },
  { label: '图片批次', value: '图片批次' },
];

const modelOptions = [
  { label: '无人机小目标检测 v11s', value: 'drone-det-v11s', spectrum: '可见光' },
  { label: '车辆违停检测 v8m', value: 'vehicle-det-v8m', spectrum: '可见光' },
  { label: '烟火识别模型', value: 'fire-smoke-det', spectrum: '可见光' },
  { label: '光伏热斑检测', value: 'solar-hotspot', spectrum: '红外' },
  { label: '水体污染识别', value: 'water-pollution', spectrum: '多光谱' },
  { label: '安全帽检测', value: 'helmet-det', spectrum: '可见光' },
];

const sceneOptions = [
  '森林防火',
  '交通巡查',
  '安全生产',
  '环境监测',
  '光伏巡检',
  '城市管理',
  '水域监测',
].map((label) => ({ label, value: label }));

const ruleOptions = [
  '连续三帧触发',
  '区域入侵 + 停留超时',
  '温差阈值告警',
  '未戴安全帽即时告警',
  '多目标聚集阈值触发',
].map((label) => ({ label, value: label }));

const scheduleOptions = [
  { label: '实时持续', value: '实时持续' },
  { label: '周期任务', value: '周期任务' },
  { label: '定时任务', value: '定时任务' },
  { label: '手动触发', value: '手动触发' },
];

const notifyOptions = [
  '站内消息',
  '短信',
  '邮件',
  'Webhook',
  '钉钉机器人',
].map((label) => ({ label, value: label }));

const taskTemplates = [
  {
    title: '森林防火实时预警',
    desc: '机巢摄像头 + 烟火识别 + 连续三帧高优告警',
    payload: {
      name: '森林烟火实时巡检',
      scene: '森林防火',
      sourceType: '实时视频流',
      sourceName: '北坡林区 3 号高点',
      sourceUri: 'rtsp://10.10.3.21/live',
      modelId: 'fire-smoke-det',
      ruleName: '连续三帧触发',
      threshold: 0.72,
      scheduleType: '实时持续',
      scheduleLabel: '7x24 实时运行',
      priority: '高',
      executor: '林草局值守专班',
      notifyChannels: ['站内消息', '短信'],
      ruleSummary: '连续 3 帧识别到烟雾或明火即生成高优告警',
    },
  },
  {
    title: '交通违停周期巡检',
    desc: '固定球机 + 违停模型 + 工作时段轮询',
    payload: {
      name: '高新区违停抓拍复核',
      scene: '交通巡查',
      sourceType: '摄像头点位',
      sourceName: '高新一路-路口球机',
      sourceUri: 'rtsp://10.18.8.10/front',
      modelId: 'vehicle-det-v8m',
      ruleName: '区域入侵 + 停留超时',
      threshold: 0.81,
      scheduleType: '周期任务',
      scheduleLabel: '每日 07:00-22:00，每 15 分钟巡检一次',
      priority: '中',
      executor: '交管支队一大队',
      notifyChannels: ['站内消息', 'Webhook'],
      ruleSummary: '重点路段停留超过 180 秒且位于禁停区域触发告警',
    },
  },
  {
    title: '光伏热斑日报分析',
    desc: '红外飞行影像 + 热斑检测 + 每日批处理',
    payload: {
      name: '光伏热斑日报分析',
      scene: '光伏巡检',
      sourceType: '飞行影像',
      sourceName: 'A03 园区航测影像',
      sourceUri: 'imagery://solar/A03/2026-04-15',
      modelId: 'solar-hotspot',
      ruleName: '温差阈值告警',
      threshold: 0.68,
      scheduleType: '定时任务',
      scheduleLabel: '每日 18:00 批处理',
      priority: '高',
      executor: '新能源巡检组',
      notifyChannels: ['站内消息', '邮件'],
      ruleSummary: '热斑温差超过 12°C 自动归为疑似缺陷工单',
    },
  },
];

const wizardItems = [
  { title: '数据源' },
  { title: '模型规则' },
  { title: '调度通知' },
  { title: '确认发布' },
];

const taskForm = reactive({
  name: '',
  scene: '交通巡查',
  sourceType: '实时视频流',
  sourceName: '',
  sourceUri: '',
  modelId: 'vehicle-det-v8m',
  ruleName: '区域入侵 + 停留超时',
  threshold: 0.8,
  scheduleType: '实时持续',
  scheduleLabel: '7x24 实时运行',
  priority: '中',
  executor: '综合指挥中心',
  notifyChannels: ['站内消息'] as string[],
  ruleSummary: '',
});

const taskColumns: any[] = [
  { title: '任务名称', dataIndex: 'name', key: 'name', width: 190 },
  { title: '场景', dataIndex: 'scene', key: 'scene', width: 110 },
  { title: '数据源', dataIndex: 'sourceName', key: 'sourceName', width: 170 },
  { title: '模型', dataIndex: 'modelName', key: 'modelName', width: 180 },
  { title: '调度方式', dataIndex: 'scheduleType', key: 'scheduleType', width: 110 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '今日告警', dataIndex: 'alertsTriggered', key: 'alertsTriggered', width: 90 },
  { title: '命中结果', dataIndex: 'resultCount', key: 'resultCount', width: 90 },
  { title: '操作', dataIndex: 'action', key: 'action', width: 260, fixed: 'right' },
];

const selectedModelMeta = computed(() => {
  return modelOptions.find((item) => item.value === taskForm.modelId);
});

const sourceAssetOptions = computed(() => {
  return sourceAssets.value
    .filter((item) => item.enabled)
    .map((item) => ({
      label: `${item.name} · ${item.sourceType} · ${item.scene}`,
      value: item.id,
    }));
});

const stats = computed(() => {
  const running = tasks.value.filter((item) => item.status === '运行中').length;
  const pending = tasks.value.filter((item) => item.status === '待执行').length;
  const alerts = tasks.value.reduce((sum, item) => sum + item.alertsTriggered, 0);
  const avgSuccess =
    tasks.value.length === 0
      ? 0
      : Math.round(
          tasks.value.reduce((sum, item) => sum + item.successRate, 0) /
            tasks.value.length,
        );
  return [
    { title: '运行中任务', value: running, suffix: '个' },
    { title: '待执行任务', value: pending, suffix: '个' },
    { title: '累计触发告警', value: alerts, suffix: '次' },
    { title: '平均成功率', value: avgSuccess, suffix: '%' },
  ];
});

const queueTimeline = computed(() => {
  return tasks.value.slice(0, 5).map((item) => ({
    id: item.id,
    title: item.name,
    desc: `${item.scheduleLabel} · ${item.executor}`,
    color:
      item.status === '运行中'
        ? 'green'
        : item.status === '待执行'
          ? 'blue'
          : item.status === '异常'
            ? 'red'
            : 'gray',
  }));
});

function nowString() {
  return new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-');
}

function buildTaskId() {
  return `AIT-${Date.now().toString().slice(-8)}`;
}

function refreshTasks(showMessage = false) {
  tasks.value = listAiAnalysisTasks();
  if (showMessage) {
    message.success('分析任务列表已刷新');
  }
}

function refreshSourceAssets() {
  sourceAssets.value = listAiDataSources();
}

function resetWizard() {
  selectedSourceId.value = undefined;
  wizardStep.value = 0;
  taskForm.name = '';
  taskForm.scene = '交通巡查';
  taskForm.sourceType = '实时视频流';
  taskForm.sourceName = '';
  taskForm.sourceUri = '';
  taskForm.modelId = 'vehicle-det-v8m';
  taskForm.ruleName = '区域入侵 + 停留超时';
  taskForm.threshold = 0.8;
  taskForm.scheduleType = '实时持续';
  taskForm.scheduleLabel = '7x24 实时运行';
  taskForm.priority = '中';
  taskForm.executor = '综合指挥中心';
  taskForm.notifyChannels = ['站内消息'];
  taskForm.ruleSummary = '';
}

function openCreateDrawer() {
  refreshSourceAssets();
  resetWizard();
  createOpen.value = true;
}

function applyTemplate(template: (typeof taskTemplates)[number]) {
  refreshSourceAssets();
  Object.assign(taskForm, template.payload);
  selectedSourceId.value = undefined;
  createOpen.value = true;
  wizardStep.value = 0;
  message.success(`已套用模板：${template.title}`);
}

function applySourceAsset(sourceId?: string) {
  if (!sourceId) return;
  const target = sourceAssets.value.find((item) => item.id === sourceId);
  if (!target) return;
  taskForm.scene = target.scene;
  taskForm.sourceType = target.sourceType;
  taskForm.sourceName = target.name;
  taskForm.sourceUri = target.uri;
  message.success(`已套用数据源「${target.name}」`);
}

function handleSourceAssetChange(value: any) {
  applySourceAsset(typeof value === 'string' ? value : undefined);
}

function validateCurrentStep() {
  if (wizardStep.value === 0) {
    if (!taskForm.name || !taskForm.sourceName || !taskForm.sourceUri) {
      message.warning('请先补全任务名称、数据源名称与地址');
      return false;
    }
  }
  if (wizardStep.value === 1) {
    if (!taskForm.modelId || !taskForm.ruleName) {
      message.warning('请选择分析模型和触发规则');
      return false;
    }
  }
  if (wizardStep.value === 2) {
    if (!taskForm.scheduleLabel || !taskForm.executor) {
      message.warning('请补全调度说明和执行责任人');
      return false;
    }
  }
  return true;
}

function nextStep() {
  if (!validateCurrentStep()) return;
  wizardStep.value += 1;
}

function prevStep() {
  wizardStep.value -= 1;
}

function submitTask() {
  if (!validateCurrentStep()) return;
  const createdAt = nowString();
  const task: AiAnalysisTaskRecord = {
    id: buildTaskId(),
    name: taskForm.name,
    scene: taskForm.scene,
    sourceType: taskForm.sourceType,
    sourceName: taskForm.sourceName,
    sourceUri: taskForm.sourceUri,
    modelId: taskForm.modelId,
    modelName: selectedModelMeta.value?.label || taskForm.modelId,
    spectrum: selectedModelMeta.value?.spectrum || '可见光',
    ruleName: taskForm.ruleName,
    ruleSummary:
      taskForm.ruleSummary ||
      `${taskForm.ruleName}，阈值 ${taskForm.threshold.toFixed(2)}，通知 ${taskForm.notifyChannels.join(' / ')}`,
    threshold: taskForm.threshold,
    scheduleType: taskForm.scheduleType,
    scheduleLabel: taskForm.scheduleLabel,
    status: taskForm.scheduleType === '手动触发' ? '待执行' : '运行中',
    priority: taskForm.priority,
    executor: taskForm.executor,
    notifyChannels: [...taskForm.notifyChannels],
    alertsTriggered: 0,
    resultCount: 0,
    successRate: 100,
    createdAt,
    lastRunAt: taskForm.scheduleType === '手动触发' ? '尚未执行' : createdAt,
    nextRunAt:
      taskForm.scheduleType === '实时持续'
        ? '实时持续'
        : taskForm.scheduleType === '手动触发'
          ? '等待人工触发'
          : taskForm.scheduleLabel,
  };
  appendAiAnalysisTask(task);
  refreshTasks();
  createOpen.value = false;
  selectedTask.value = task;
  detailOpen.value = true;
  message.success(`分析任务「${task.name}」已创建`);
}

function statusColor(status: AiAnalysisTaskRecord['status']) {
  if (status === '运行中') return 'green';
  if (status === '待执行') return 'blue';
  if (status === '已暂停') return 'orange';
  if (status === '异常') return 'red';
  return 'default';
}

function priorityColor(priority: string) {
  if (priority === '高') return 'red';
  if (priority === '中') return 'orange';
  return 'blue';
}

function openDetail(record: AiAnalysisTaskRecord) {
  selectedTask.value = record;
  detailOpen.value = true;
}

function openDetailFromTable(record: Record<string, any>) {
  openDetail(record as AiAnalysisTaskRecord);
}

function toggleTask(record: AiAnalysisTaskRecord) {
  const nextStatus = record.status === '运行中' ? '已暂停' : '运行中';
  const updated: AiAnalysisTaskRecord = {
    ...record,
    status: nextStatus,
    lastRunAt: nextStatus === '运行中' ? nowString() : record.lastRunAt,
  };
  upsertAiAnalysisTask(updated);
  refreshTasks();
  if (selectedTask.value?.id === record.id) {
    selectedTask.value = updated;
  }
  message.success(
    nextStatus === '运行中'
      ? `已启动任务「${record.name}」`
      : `已暂停任务「${record.name}」`,
  );
}

function runNow(record: AiAnalysisTaskRecord) {
  const updated: AiAnalysisTaskRecord = {
    ...record,
    status: '运行中',
    alertsTriggered: record.alertsTriggered + 1,
    resultCount: record.resultCount + Math.floor(Math.random() * 6) + 1,
    lastRunAt: nowString(),
  };
  upsertAiAnalysisTask(updated);
  refreshTasks();
  if (selectedTask.value?.id === record.id) {
    selectedTask.value = updated;
  }
  message.success(`已立即执行任务「${record.name}」`);
}

function runNowFromTable(record: Record<string, any>) {
  runNow(record as AiAnalysisTaskRecord);
}

function cloneTask(record: AiAnalysisTaskRecord) {
  const clone: AiAnalysisTaskRecord = {
    ...record,
    id: buildTaskId(),
    name: `${record.name} - 副本`,
    status: '待执行',
    createdAt: nowString(),
    lastRunAt: '尚未执行',
    nextRunAt: record.scheduleLabel,
    alertsTriggered: 0,
    resultCount: 0,
  };
  appendAiAnalysisTask(clone);
  refreshTasks();
  message.success(`已复制任务「${record.name}」`);
}

function cloneTaskFromTable(record: Record<string, any>) {
  cloneTask(record as AiAnalysisTaskRecord);
}

function toggleTaskFromTable(record: Record<string, any>) {
  toggleTask(record as AiAnalysisTaskRecord);
}

function batchPauseRunning() {
  const updated = tasks.value.map((item) =>
    item.status === '运行中' ? { ...item, status: '已暂停' as const } : item,
  );
  saveAiAnalysisTasks(updated);
  refreshTasks();
  message.success('运行中分析任务已全部暂停');
}

function goDetection() {
  router.push('/ai-center/detection');
}

function goDataSource() {
  router.push('/ai-center/data-source');
}

function goHistory() {
  router.push('/ai-center/detect-history');
}

onMounted(() => {
  refreshTasks();
  refreshSourceAssets();
});
</script>

<template>
  <Page :auto-content-height="true">
    <div class="flex flex-col gap-4 p-2">
      <Alert
        type="info"
        show-icon
        message="P0 优先能力：AI 分析任务创建向导 + 调度管理"
        description="当前以前端演示链路为主，先把数据源、模型、告警规则、调度策略与任务状态统一收口，后续再替换为真实任务编排接口。"
      />

      <Row :gutter="[16, 16]">
        <Col v-for="item in stats" :key="item.title" :lg="6" :md="12" :span="24">
          <Card :bordered="false">
            <Statistic :suffix="item.suffix" :title="item.title" :value="item.value" />
          </Card>
        </Col>
      </Row>

      <Row :gutter="[16, 16]">
        <Col :xl="16" :span="24">
          <Card :bordered="false" title="分析任务中心">
            <template #extra>
              <Space>
                <Button size="small" @click="goDataSource">数据源管理</Button>
                <Button size="small" @click="router.push('/ai-center/media-library')">媒体库</Button>
                <Button size="small" @click="router.push('/ai-center/rule')">告警规则</Button>
                <Button size="small" @click="goDetection">在线检测</Button>
                <Button size="small" @click="goHistory">检测历史</Button>
                <Button size="small" @click="batchPauseRunning">一键暂停</Button>
                <Button size="small" type="primary" @click="openCreateDrawer">新建任务</Button>
              </Space>
            </template>

            <Table
              :columns="taskColumns"
              :data-source="tasks"
              :pagination="{ pageSize: 6 }"
              row-key="id"
              size="small"
              :scroll="{ x: 1280 }"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'name'">
                  <div class="font-medium">{{ record.name }}</div>
                  <div class="text-xs text-slate-400">{{ record.ruleName }}</div>
                </template>
                <template v-else-if="column.key === 'sourceName'">
                  <div>{{ record.sourceName }}</div>
                  <div class="text-xs text-slate-400">{{ record.sourceType }}</div>
                </template>
                <template v-else-if="column.key === 'modelName'">
                  <div>{{ record.modelName }}</div>
                  <div class="text-xs text-slate-400">{{ record.spectrum }}</div>
                </template>
                <template v-else-if="column.key === 'status'">
                  <Tag :color="statusColor(record.status)">{{ record.status }}</Tag>
                </template>
                <template v-else-if="column.key === 'alertsTriggered'">
                  <Tag :color="record.alertsTriggered > 10 ? 'red' : 'blue'">
                    {{ record.alertsTriggered }}
                  </Tag>
                </template>
                <template v-else-if="column.key === 'action'">
                  <Space>
                    <Button size="small" type="link" @click="openDetailFromTable(record)">详情</Button>
                    <Button size="small" type="link" @click="runNowFromTable(record)">立即执行</Button>
                    <Button size="small" type="link" @click="toggleTaskFromTable(record)">
                      {{ record.status === '运行中' ? '暂停' : '启动' }}
                    </Button>
                    <Button size="small" type="link" @click="cloneTaskFromTable(record)">复制</Button>
                  </Space>
                </template>
              </template>
            </Table>
          </Card>
        </Col>

        <Col :xl="8" :span="24">
          <Card :bordered="false" title="任务模板">
            <div class="flex flex-col gap-3">
              <div
                v-for="template in taskTemplates"
                :key="template.title"
                class="rounded-xl border border-slate-200/70 p-4 transition hover:border-[var(--ant-color-primary)] dark:border-slate-700"
              >
                <div class="mb-1 font-medium">{{ template.title }}</div>
                <div class="mb-3 text-xs text-slate-500">{{ template.desc }}</div>
                <Button block size="small" @click="applyTemplate(template)">套用模板</Button>
              </div>
            </div>
          </Card>

          <Card :bordered="false" title="调度队列" class="mt-4">
            <Timeline>
              <TimelineItem
                v-for="item in queueTimeline"
                :key="item.id"
                :color="item.color"
              >
                <div class="text-sm font-medium">{{ item.title }}</div>
                <div class="text-xs text-slate-400">{{ item.desc }}</div>
              </TimelineItem>
            </Timeline>
          </Card>
        </Col>
      </Row>

      <Drawer
        v-model:open="createOpen"
        title="新建 AI 分析任务"
        width="560"
        placement="right"
      >
        <Steps :current="wizardStep" :items="wizardItems" size="small" />

        <Form class="mt-6" layout="vertical">
          <template v-if="wizardStep === 0">
            <FormItem label="任务名称">
              <Input v-model:value="taskForm.name" placeholder="例如：高新区违停抓拍复核" />
            </FormItem>
            <FormItem label="业务场景">
              <Select v-model:value="taskForm.scene" :options="sceneOptions" />
            </FormItem>
            <FormItem label="快速套用数据源">
              <Select
                v-model:value="selectedSourceId"
                :options="sourceAssetOptions"
                allow-clear
                placeholder="从数据源管理中选择已纳管的数据源"
                @change="handleSourceAssetChange"
              />
            </FormItem>
            <FormItem label="数据源类型">
              <Select v-model:value="taskForm.sourceType" :options="sourceTypeOptions" />
            </FormItem>
            <FormItem label="数据源名称">
              <Input v-model:value="taskForm.sourceName" placeholder="例如：高新一路-路口球机" />
            </FormItem>
            <FormItem label="数据源地址 / 标识">
              <Input
                v-model:value="taskForm.sourceUri"
                placeholder="例如：rtsp://10.18.8.10/front"
              />
            </FormItem>
          </template>

          <template v-else-if="wizardStep === 1">
            <FormItem label="分析模型">
              <Select v-model:value="taskForm.modelId" :options="modelOptions" />
            </FormItem>
            <FormItem label="触发规则">
              <Select v-model:value="taskForm.ruleName" :options="ruleOptions" />
            </FormItem>
            <FormItem label="阈值">
              <InputNumber
                v-model:value="taskForm.threshold"
                :max="0.99"
                :min="0.1"
                :step="0.01"
                style="width: 100%"
              />
            </FormItem>
            <FormItem label="规则说明">
              <Input
                v-model:value="taskForm.ruleSummary"
                placeholder="例如：重点路段停留超过 180 秒且位于禁停区域触发告警"
              />
            </FormItem>
          </template>

          <template v-else-if="wizardStep === 2">
            <FormItem label="调度方式">
              <Select v-model:value="taskForm.scheduleType" :options="scheduleOptions" />
            </FormItem>
            <FormItem label="调度说明">
              <Input
                v-model:value="taskForm.scheduleLabel"
                placeholder="例如：每日 07:00-22:00，每 15 分钟巡检一次"
              />
            </FormItem>
            <FormItem label="优先级">
              <Select
                v-model:value="taskForm.priority"
                :options="[
                  { label: '高', value: '高' },
                  { label: '中', value: '中' },
                  { label: '低', value: '低' },
                ]"
              />
            </FormItem>
            <FormItem label="执行责任人">
              <Input v-model:value="taskForm.executor" placeholder="例如：交管支队一大队" />
            </FormItem>
            <FormItem label="通知渠道">
              <Select
                v-model:value="taskForm.notifyChannels"
                mode="multiple"
                :options="notifyOptions"
                placeholder="选择告警通知渠道"
              />
            </FormItem>
          </template>

          <template v-else>
            <Card size="small" :bordered="false" style="background: var(--ant-color-bg-layout)">
              <Descriptions :column="1" bordered size="small">
                <DescriptionsItem label="任务名称">{{ taskForm.name }}</DescriptionsItem>
                <DescriptionsItem label="业务场景">{{ taskForm.scene }}</DescriptionsItem>
                <DescriptionsItem label="数据源">
                  {{ taskForm.sourceType }} / {{ taskForm.sourceName }}
                </DescriptionsItem>
                <DescriptionsItem label="分析模型">
                  {{ selectedModelMeta?.label }} / {{ selectedModelMeta?.spectrum }}
                </DescriptionsItem>
                <DescriptionsItem label="规则摘要">
                  {{ taskForm.ruleSummary || `${taskForm.ruleName}（阈值 ${taskForm.threshold.toFixed(2)}）` }}
                </DescriptionsItem>
                <DescriptionsItem label="调度方式">
                  {{ taskForm.scheduleType }} / {{ taskForm.scheduleLabel }}
                </DescriptionsItem>
                <DescriptionsItem label="通知渠道">
                  {{ taskForm.notifyChannels.join(' / ') || '无' }}
                </DescriptionsItem>
              </Descriptions>
            </Card>
          </template>
        </Form>

        <div class="mt-6 flex justify-between">
          <Button v-if="wizardStep > 0" @click="prevStep">上一步</Button>
          <span v-else />
          <Space>
            <Button @click="createOpen = false">取消</Button>
            <Button
              v-if="wizardStep < 3"
              type="primary"
              @click="nextStep"
            >
              下一步
            </Button>
            <Button v-else type="primary" @click="submitTask">创建任务</Button>
          </Space>
        </div>
      </Drawer>

      <Drawer
        v-model:open="detailOpen"
        :title="selectedTask ? `任务详情 - ${selectedTask.name}` : '任务详情'"
        width="520"
        placement="right"
      >
        <template v-if="selectedTask">
          <Descriptions :column="1" bordered size="small">
            <DescriptionsItem label="任务编号">{{ selectedTask.id }}</DescriptionsItem>
            <DescriptionsItem label="任务名称">{{ selectedTask.name }}</DescriptionsItem>
            <DescriptionsItem label="业务场景">{{ selectedTask.scene }}</DescriptionsItem>
            <DescriptionsItem label="状态">
              <Tag :color="statusColor(selectedTask.status)">{{ selectedTask.status }}</Tag>
            </DescriptionsItem>
            <DescriptionsItem label="优先级">
              <Tag :color="priorityColor(selectedTask.priority)">{{ selectedTask.priority }}</Tag>
            </DescriptionsItem>
            <DescriptionsItem label="数据源">
              {{ selectedTask.sourceType }} / {{ selectedTask.sourceName }}
            </DescriptionsItem>
            <DescriptionsItem label="数据源地址">{{ selectedTask.sourceUri }}</DescriptionsItem>
            <DescriptionsItem label="分析模型">
              {{ selectedTask.modelName }} / {{ selectedTask.spectrum }}
            </DescriptionsItem>
            <DescriptionsItem label="规则名称">{{ selectedTask.ruleName }}</DescriptionsItem>
            <DescriptionsItem label="规则说明">{{ selectedTask.ruleSummary }}</DescriptionsItem>
            <DescriptionsItem label="阈值">{{ selectedTask.threshold }}</DescriptionsItem>
            <DescriptionsItem label="调度方式">
              {{ selectedTask.scheduleType }} / {{ selectedTask.scheduleLabel }}
            </DescriptionsItem>
            <DescriptionsItem label="通知渠道">
              {{ selectedTask.notifyChannels.join(' / ') }}
            </DescriptionsItem>
            <DescriptionsItem label="责任人">{{ selectedTask.executor }}</DescriptionsItem>
            <DescriptionsItem label="今日告警">{{ selectedTask.alertsTriggered }}</DescriptionsItem>
            <DescriptionsItem label="命中结果">{{ selectedTask.resultCount }}</DescriptionsItem>
            <DescriptionsItem label="成功率">{{ selectedTask.successRate }}%</DescriptionsItem>
            <DescriptionsItem label="最近执行">{{ selectedTask.lastRunAt }}</DescriptionsItem>
            <DescriptionsItem label="下一次执行">{{ selectedTask.nextRunAt }}</DescriptionsItem>
            <DescriptionsItem label="创建时间">{{ selectedTask.createdAt }}</DescriptionsItem>
          </Descriptions>

          <div class="mt-4 flex gap-2">
            <Button type="primary" @click="runNow(selectedTask)">立即执行</Button>
            <Button @click="toggleTask(selectedTask)">
              {{ selectedTask.status === '运行中' ? '暂停任务' : '启动任务' }}
            </Button>
            <Button @click="cloneTask(selectedTask)">复制任务</Button>
          </div>
        </template>
      </Drawer>
    </div>
  </Page>
</template>
