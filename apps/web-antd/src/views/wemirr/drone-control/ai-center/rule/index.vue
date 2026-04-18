<script lang="ts" setup name="AiAlertRulePage">
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
  Switch,
  Table,
  Tag,
  message,
} from 'ant-design-vue';

import {
  appendAiAlertRule,
  listAiAlertRules,
  upsertAiAlertRule,
  type AiAlertRuleRecord,
} from '../../_services/ai-alert-rule-store';

const router = useRouter();

const rules = ref<AiAlertRuleRecord[]>([]);
const drawerOpen = ref(false);
const detailOpen = ref(false);
const selectedRule = ref<AiAlertRuleRecord | null>(null);

const sceneOptions = [
  '森林防火',
  '交通巡查',
  '安全生产',
  '环境监测',
  '光伏巡检',
  '城市管理',
  '水域监测',
].map((label) => ({ label, value: label }));

const eventTypeOptions = [
  '烟火',
  '违停',
  '占道经营',
  '排污',
  '设备异常',
  '漂浮物',
].map((label) => ({ label, value: label }));

const levelOptions = [
  { label: '一般', value: '一般' },
  { label: '较大', value: '较大' },
  { label: '重大', value: '重大' },
].map((item) => item);

const triggerOptions = [
  '连续命中',
  '区域 + 停留时长',
  '温差阈值',
  '单帧命中',
  '多目标聚集',
].map((label) => ({ label, value: label }));

const notifyOptions = [
  '站内消息',
  '短信',
  '邮件',
  'Webhook',
  '钉钉机器人',
].map((label) => ({ label, value: label }));

const relationTaskOptions = [
  '森林烟火实时巡检',
  '高新区违停抓拍复核',
  '光伏热斑日报分析',
  '工地安全帽专项抽检',
].map((label) => ({ label, value: label }));

const templates = [
  {
    title: '森林烟火高优规则',
    desc: '连续命中 + 自动派工 + 短信通知',
    payload: {
      name: '森林烟火连续三帧告警',
      scene: '森林防火',
      eventType: '烟火',
      level: '重大',
      targetType: '烟雾 / 明火',
      triggerType: '连续命中',
      threshold: 0.72,
      durationSec: 6,
      regionName: '北坡林区 3 号防火网格',
      sourceScope: '机巢高点视频流',
      relationTaskName: '森林烟火实时巡检',
      notifyChannels: ['站内消息', '短信'],
      autoCreateWorkorder: true,
      description: '烟雾或明火连续 3 帧命中即触发重大告警，并自动创建应急工单。',
    },
  },
  {
    title: '交通违停复核规则',
    desc: '区域 + 停留超时 + 先复核后派工',
    payload: {
      name: '违停超时复核规则',
      scene: '交通巡查',
      eventType: '违停',
      level: '一般',
      targetType: '机动车',
      triggerType: '区域 + 停留时长',
      threshold: 0.81,
      durationSec: 180,
      regionName: '高新一路公交站台',
      sourceScope: '固定球机 + 无人机补拍',
      relationTaskName: '高新区违停抓拍复核',
      notifyChannels: ['站内消息', 'Webhook'],
      autoCreateWorkorder: false,
      description: '车辆在禁停区域停留超过 180 秒后触发告警，优先进入人工复核。',
    },
  },
];

const formState = reactive({
  name: '',
  scene: '交通巡查',
  eventType: '违停',
  level: '一般',
  targetType: '',
  triggerType: '区域 + 停留时长',
  threshold: 0.8,
  durationSec: 180,
  regionName: '',
  sourceScope: '',
  relationTaskName: '高新区违停抓拍复核',
  notifyChannels: ['站内消息'] as string[],
  autoCreateWorkorder: false,
  description: '',
});

const columns: any[] = [
  { title: '规则名称', dataIndex: 'name', key: 'name', width: 220 },
  { title: '场景', dataIndex: 'scene', key: 'scene', width: 110 },
  { title: '事件类型', dataIndex: 'eventType', key: 'eventType', width: 100 },
  { title: '等级', dataIndex: 'level', key: 'level', width: 90 },
  { title: '触发方式', dataIndex: 'triggerType', key: 'triggerType', width: 140 },
  { title: '关联任务', dataIndex: 'relationTaskName', key: 'relationTaskName', width: 180 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '命中次数', dataIndex: 'hitCount', key: 'hitCount', width: 90 },
  { title: '操作', dataIndex: 'action', key: 'action', width: 240, fixed: 'right' },
];

const stats = computed(() => {
  const running = rules.value.filter((item) => item.status === '运行中').length;
  const paused = rules.value.filter((item) => item.status === '已暂停').length;
  const hits = rules.value.reduce((sum, item) => sum + item.hitCount, 0);
  const autoOrder = rules.value.filter((item) => item.autoCreateWorkorder).length;
  return [
    { title: '运行中规则', value: running, suffix: '条' },
    { title: '暂停规则', value: paused, suffix: '条' },
    { title: '累计命中', value: hits, suffix: '次' },
    { title: '自动派工规则', value: autoOrder, suffix: '条' },
  ];
});

const topRules = computed(() => {
  return [...rules.value]
    .sort((a, b) => b.hitCount - a.hitCount)
    .slice(0, 4);
});

function ruleId() {
  return `RULE-${Date.now().toString().slice(-8)}`;
}

function nowString() {
  return new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-');
}

function refreshRules(showMessage = false) {
  rules.value = listAiAlertRules();
  if (showMessage) {
    message.success('告警规则列表已刷新');
  }
}

function resetForm() {
  formState.name = '';
  formState.scene = '交通巡查';
  formState.eventType = '违停';
  formState.level = '一般';
  formState.targetType = '';
  formState.triggerType = '区域 + 停留时长';
  formState.threshold = 0.8;
  formState.durationSec = 180;
  formState.regionName = '';
  formState.sourceScope = '';
  formState.relationTaskName = '高新区违停抓拍复核';
  formState.notifyChannels = ['站内消息'];
  formState.autoCreateWorkorder = false;
  formState.description = '';
}

function openCreate() {
  resetForm();
  drawerOpen.value = true;
}

function applyTemplate(template: (typeof templates)[number]) {
  Object.assign(formState, template.payload);
  drawerOpen.value = true;
  message.success(`已套用模板：${template.title}`);
}

function validateForm() {
  if (!formState.name || !formState.targetType || !formState.regionName) {
    message.warning('请补全规则名称、目标类型与作用区域');
    return false;
  }
  if (!formState.sourceScope || !formState.relationTaskName) {
    message.warning('请补全数据源范围和关联任务');
    return false;
  }
  return true;
}

function submitRule() {
  if (!validateForm()) return;
  const rule: AiAlertRuleRecord = {
    id: ruleId(),
    name: formState.name,
    scene: formState.scene,
    eventType: formState.eventType,
    level: formState.level,
    targetType: formState.targetType,
    triggerType: formState.triggerType,
    threshold: formState.threshold,
    durationSec: formState.durationSec,
    regionName: formState.regionName,
    sourceScope: formState.sourceScope,
    relationTaskName: formState.relationTaskName,
    notifyChannels: [...formState.notifyChannels],
    autoCreateWorkorder: formState.autoCreateWorkorder,
    status: '运行中',
    hitCount: 0,
    falsePositiveRate: 0,
    lastTriggeredAt: '尚未触发',
    createdAt: nowString(),
    description:
      formState.description ||
      `${formState.triggerType}，阈值 ${formState.threshold.toFixed(2)}，通知 ${formState.notifyChannels.join(' / ')}`,
  };
  appendAiAlertRule(rule);
  refreshRules();
  drawerOpen.value = false;
  selectedRule.value = rule;
  detailOpen.value = true;
  message.success(`告警规则「${rule.name}」已创建并启用`);
}

function levelColor(level: string) {
  if (level === '重大') return 'red';
  if (level === '较大') return 'orange';
  return 'blue';
}

function statusColor(status: AiAlertRuleRecord['status']) {
  if (status === '运行中') return 'green';
  if (status === '已暂停') return 'orange';
  return 'default';
}

function openDetail(rule: AiAlertRuleRecord) {
  selectedRule.value = rule;
  detailOpen.value = true;
}

function openDetailFromTable(rule: Record<string, any>) {
  openDetail(rule as AiAlertRuleRecord);
}

function toggleRule(rule: AiAlertRuleRecord) {
  const updated: AiAlertRuleRecord = {
    ...rule,
    status: rule.status === '运行中' ? '已暂停' : '运行中',
  };
  upsertAiAlertRule(updated);
  refreshRules();
  if (selectedRule.value?.id === rule.id) {
    selectedRule.value = updated;
  }
  message.success(
    updated.status === '运行中'
      ? `已启用规则「${rule.name}」`
      : `已暂停规则「${rule.name}」`,
  );
}

function toggleRuleFromTable(rule: Record<string, any>) {
  toggleRule(rule as AiAlertRuleRecord);
}

function simulateTrigger(rule: AiAlertRuleRecord) {
  const updated: AiAlertRuleRecord = {
    ...rule,
    status: '运行中',
    hitCount: rule.hitCount + 1,
    lastTriggeredAt: nowString(),
  };
  upsertAiAlertRule(updated);
  refreshRules();
  if (selectedRule.value?.id === rule.id) {
    selectedRule.value = updated;
  }
  message.success(`已模拟触发规则「${rule.name}」`);
}

function simulateFromTable(rule: Record<string, any>) {
  simulateTrigger(rule as AiAlertRuleRecord);
}

function toEvent(rule: AiAlertRuleRecord) {
  message.success(`已根据规则「${rule.name}」跳转事件列表查看处置闭环`);
  router.push('/event/list');
}

function toEventFromTable(rule: Record<string, any>) {
  toEvent(rule as AiAlertRuleRecord);
}

function toTask(rule: AiAlertRuleRecord) {
  message.info(`前往分析任务，查看规则「${rule.name}」关联任务`);
  router.push('/ai-center/task');
}

onMounted(() => {
  refreshRules();
});
</script>

<template>
  <Page :auto-content-height="true">
    <div class="flex flex-col gap-4 p-2">
      <Alert
        type="warning"
        show-icon
        message="P0 优先能力：告警规则引擎"
        description="先把目标类型、触发条件、作用区域、通知渠道、自动派工这些关键规则要素沉淀到前端可演示页面，后续再接真实规则引擎和事件总线。"
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
          <Card :bordered="false" title="告警规则中心">
            <template #extra>
              <Space>
                <Button size="small" @click="router.push('/ai-center/task')">分析任务</Button>
                <Button size="small" @click="router.push('/event/list')">事件中心</Button>
                <Button size="small" type="primary" @click="openCreate">新建规则</Button>
              </Space>
            </template>

            <Table
              :columns="columns"
              :data-source="rules"
              :pagination="{ pageSize: 6 }"
              row-key="id"
              size="small"
              :scroll="{ x: 1280 }"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'name'">
                  <div class="font-medium">{{ record.name }}</div>
                  <div class="text-xs text-slate-400">{{ record.description }}</div>
                </template>
                <template v-else-if="column.key === 'level'">
                  <Tag :color="levelColor(record.level)">{{ record.level }}</Tag>
                </template>
                <template v-else-if="column.key === 'status'">
                  <Tag :color="statusColor(record.status)">{{ record.status }}</Tag>
                </template>
                <template v-else-if="column.key === 'hitCount'">
                  <Tag :color="record.hitCount > 10 ? 'red' : 'blue'">{{ record.hitCount }}</Tag>
                </template>
                <template v-else-if="column.key === 'action'">
                  <Space>
                    <Button size="small" type="link" @click="openDetailFromTable(record)">详情</Button>
                    <Button size="small" type="link" @click="simulateFromTable(record)">触发</Button>
                    <Button size="small" type="link" @click="toggleRuleFromTable(record)">
                      {{ record.status === '运行中' ? '暂停' : '启用' }}
                    </Button>
                    <Button size="small" type="link" @click="toEventFromTable(record)">看事件</Button>
                  </Space>
                </template>
              </template>
            </Table>
          </Card>
        </Col>

        <Col :xl="8" :span="24">
          <Card :bordered="false" title="规则模板">
            <div class="flex flex-col gap-3">
              <div
                v-for="template in templates"
                :key="template.title"
                class="rounded-xl border border-slate-200/70 p-4 transition hover:border-[var(--ant-color-primary)] dark:border-slate-700"
              >
                <div class="mb-1 font-medium">{{ template.title }}</div>
                <div class="mb-3 text-xs text-slate-500">{{ template.desc }}</div>
                <Button block size="small" @click="applyTemplate(template)">套用模板</Button>
              </div>
            </div>
          </Card>

          <Card :bordered="false" title="高命中规则" class="mt-4">
            <div class="flex flex-col gap-3">
              <div
                v-for="rule in topRules"
                :key="rule.id"
                class="rounded-xl border border-slate-200/60 p-4 dark:border-slate-700"
              >
                <div class="mb-1 flex items-center justify-between">
                  <span class="font-medium">{{ rule.name }}</span>
                  <Tag :color="statusColor(rule.status)">{{ rule.status }}</Tag>
                </div>
                <div class="mb-2 text-xs text-slate-500">{{ rule.regionName }}</div>
                <div class="flex items-center justify-between text-xs text-slate-500">
                  <span>命中 {{ rule.hitCount }} 次</span>
                  <span>误报率 {{ rule.falsePositiveRate }}%</span>
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Drawer v-model:open="drawerOpen" title="新建告警规则" width="520" placement="right">
        <Form layout="vertical">
          <FormItem label="规则名称">
            <Input v-model:value="formState.name" placeholder="例如：违停超时复核规则" />
          </FormItem>
          <FormItem label="业务场景">
            <Select v-model:value="formState.scene" :options="sceneOptions" />
          </FormItem>
          <FormItem label="事件类型">
            <Select v-model:value="formState.eventType" :options="eventTypeOptions" />
          </FormItem>
          <FormItem label="告警等级">
            <Select v-model:value="formState.level" :options="levelOptions" />
          </FormItem>
          <FormItem label="目标类型">
            <Input v-model:value="formState.targetType" placeholder="例如：机动车 / 烟雾 / 热斑" />
          </FormItem>
          <FormItem label="触发方式">
            <Select v-model:value="formState.triggerType" :options="triggerOptions" />
          </FormItem>
          <Row :gutter="[12, 0]">
            <Col :span="12">
              <FormItem label="置信度阈值">
                <InputNumber
                  v-model:value="formState.threshold"
                  :max="0.99"
                  :min="0.1"
                  :step="0.01"
                  style="width: 100%"
                />
              </FormItem>
            </Col>
            <Col :span="12">
              <FormItem label="持续时长（秒）">
                <InputNumber
                  v-model:value="formState.durationSec"
                  :min="0"
                  :step="1"
                  style="width: 100%"
                />
              </FormItem>
            </Col>
          </Row>
          <FormItem label="作用区域">
            <Input v-model:value="formState.regionName" placeholder="例如：高新一路公交站台" />
          </FormItem>
          <FormItem label="数据源范围">
            <Input v-model:value="formState.sourceScope" placeholder="例如：固定球机 + 无人机补拍" />
          </FormItem>
          <FormItem label="关联分析任务">
            <Select
              v-model:value="formState.relationTaskName"
              :options="relationTaskOptions"
            />
          </FormItem>
          <FormItem label="通知渠道">
            <Select
              v-model:value="formState.notifyChannels"
              mode="multiple"
              :options="notifyOptions"
            />
          </FormItem>
          <FormItem label="自动创建工单">
            <Switch v-model:checked="formState.autoCreateWorkorder" />
          </FormItem>
          <FormItem label="规则说明">
            <Input
              v-model:value="formState.description"
              placeholder="例如：车辆在禁停区域停留超过 180 秒后触发告警"
            />
          </FormItem>
        </Form>

        <div class="mt-6 flex justify-end gap-2">
          <Button @click="drawerOpen = false">取消</Button>
          <Button type="primary" @click="submitRule">创建并启用</Button>
        </div>
      </Drawer>

      <Drawer
        v-model:open="detailOpen"
        :title="selectedRule ? `规则详情 - ${selectedRule.name}` : '规则详情'"
        width="520"
        placement="right"
      >
        <template v-if="selectedRule">
          <Descriptions :column="1" bordered size="small">
            <DescriptionsItem label="规则编号">{{ selectedRule.id }}</DescriptionsItem>
            <DescriptionsItem label="规则名称">{{ selectedRule.name }}</DescriptionsItem>
            <DescriptionsItem label="业务场景">{{ selectedRule.scene }}</DescriptionsItem>
            <DescriptionsItem label="事件类型">{{ selectedRule.eventType }}</DescriptionsItem>
            <DescriptionsItem label="告警等级">
              <Tag :color="levelColor(selectedRule.level)">{{ selectedRule.level }}</Tag>
            </DescriptionsItem>
            <DescriptionsItem label="状态">
              <Tag :color="statusColor(selectedRule.status)">{{ selectedRule.status }}</Tag>
            </DescriptionsItem>
            <DescriptionsItem label="目标类型">{{ selectedRule.targetType }}</DescriptionsItem>
            <DescriptionsItem label="触发方式">{{ selectedRule.triggerType }}</DescriptionsItem>
            <DescriptionsItem label="阈值">{{ selectedRule.threshold }}</DescriptionsItem>
            <DescriptionsItem label="持续时长">
              {{ selectedRule.durationSec }} 秒
            </DescriptionsItem>
            <DescriptionsItem label="作用区域">{{ selectedRule.regionName }}</DescriptionsItem>
            <DescriptionsItem label="数据源范围">{{ selectedRule.sourceScope }}</DescriptionsItem>
            <DescriptionsItem label="关联任务">{{ selectedRule.relationTaskName }}</DescriptionsItem>
            <DescriptionsItem label="通知渠道">
              {{ selectedRule.notifyChannels.join(' / ') }}
            </DescriptionsItem>
            <DescriptionsItem label="自动派工">
              {{ selectedRule.autoCreateWorkorder ? '开启' : '关闭' }}
            </DescriptionsItem>
            <DescriptionsItem label="规则说明">{{ selectedRule.description }}</DescriptionsItem>
            <DescriptionsItem label="累计命中">{{ selectedRule.hitCount }}</DescriptionsItem>
            <DescriptionsItem label="误报率">{{ selectedRule.falsePositiveRate }}%</DescriptionsItem>
            <DescriptionsItem label="最近触发">{{ selectedRule.lastTriggeredAt }}</DescriptionsItem>
            <DescriptionsItem label="创建时间">{{ selectedRule.createdAt }}</DescriptionsItem>
          </Descriptions>

          <div class="mt-4 flex gap-2">
            <Button type="primary" @click="simulateTrigger(selectedRule)">模拟触发</Button>
            <Button @click="toggleRule(selectedRule)">
              {{ selectedRule.status === '运行中' ? '暂停规则' : '启用规则' }}
            </Button>
            <Button @click="toTask(selectedRule)">查看关联任务</Button>
          </div>
        </template>
      </Drawer>
    </div>
  </Page>
</template>
