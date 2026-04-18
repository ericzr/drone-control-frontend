<script lang="ts" setup name="DroneAiCenterPage">
import { computed, onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';

import {
  Alert,
  Button,
  Card,
  Col,
  Descriptions,
  DescriptionsItem,
  Drawer,
  Empty,
  Input,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Timeline,
  message,
} from 'ant-design-vue';

import { PageList } from '#/views/wemirr/ai/model/config/api';

interface ModelRecord {
  createName?: string;
  createTime?: string;
  deployStatus?: string;
  evalScore?: string;
  id: number | string;
  name: string;
  provider: string;
  type: string;
}

const fallbackModels: ModelRecord[] = [
  {
    id: 'local-1',
    name: 'yolo11-visdrone-small',
    provider: '本地资产',
    type: 'IMAGE',
    createName: '算法组',
    createTime: '2026-04-13 14:00:00',
    deployStatus: '已部署',
    evalScore: '0.42992',
  },
  {
    id: 'local-2',
    name: 'qwen-vl-demo',
    provider: 'OpenAI Compatible',
    type: 'TEXT',
    createName: '平台组',
    createTime: '2026-04-13 14:05:00',
    deployStatus: '联调中',
    evalScore: 'N/A',
  },
  {
    id: 'local-3',
    name: 'forest-fire-edge-v1',
    provider: '边缘识别',
    type: 'IMAGE',
    createName: '森防组',
    createTime: '2026-04-13 14:22:00',
    deployStatus: '待部署',
    evalScore: '0.51213',
  },
];

const modelRows = ref<ModelRecord[]>([...fallbackModels]);
const modelLoading = ref(false);
const modelError = ref('');
const keyword = ref('');
const selectedType = ref('全部类型');
const selectedDeployStatus = ref('全部状态');
const detailOpen = ref(false);
const selectedModelId = ref<string | number>(fallbackModels[0]?.id ?? 'local-1');

const typeOptions = [
  { label: '全部类型', value: '全部类型' },
  { label: 'IMAGE', value: 'IMAGE' },
  { label: 'TEXT', value: 'TEXT' },
];

const deployStatusOptions = [
  { label: '全部状态', value: '全部状态' },
  { label: '已部署', value: '已部署' },
  { label: '联调中', value: '联调中' },
  { label: '待部署', value: '待部署' },
];

const stats = computed(() => [
  { title: '模型版本', value: modelRows.value.length, suffix: '个' },
  { title: '边缘部署节点', value: 14, suffix: '个' },
  { title: '评估任务', value: 3, suffix: '项' },
  { title: '大模型服务', value: 2, suffix: '类' },
]);

const deployCards = [
  {
    title: '云端部署',
    value: 4,
    desc: '承接模型统一发布、版本管理与租户分发',
  },
  {
    title: '边缘节点',
    value: 14,
    desc: '支撑现场快速推理、告警回传和离线续航',
  },
  {
    title: '模型评估',
    value: 3,
    desc: '沉淀准确率、误报率、漏报率和推理性能',
  },
];

const c124Assets = [
  '训练脚本 train_yolo11.py 可作为训练任务模板来源',
  'best.pt 与历史权重可纳入模型版本管理',
  'results.csv 与各类指标图可直接映射到模型评估页',
  'PyQt 检测应用能力可拆解为后续在线推理演示入口',
];

const c124Metrics = [
  { title: 'Precision', value: '0.59169' },
  { title: 'Recall', value: '0.42580' },
  { title: 'mAP@50', value: '0.42992' },
  { title: 'mAP@50-95', value: '0.25129' },
];

const c124TrainConfig = [
  '基础模型：yolo11s.pt',
  '训练轮次：300 epochs',
  '批大小：16',
  '输入尺寸：640',
  '优化器：SGD',
  'IoU 阈值：0.7',
];

const modelColumns = [
  { title: '模型名称', dataIndex: 'name', key: 'name' },
  { title: '提供商', dataIndex: 'provider', key: 'provider' },
  { title: '类型', dataIndex: 'type', key: 'type' },
  { title: '部署状态', dataIndex: 'deployStatus', key: 'deployStatus' },
  { title: '评估分数', dataIndex: 'evalScore', key: 'evalScore' },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime' },
  { title: '操作', dataIndex: 'action', key: 'action', width: 180 },
];

function resolveModelRecords(payload: any): ModelRecord[] {
  const candidates = [
    payload,
    payload?.data,
    payload?.records,
    payload?.data?.records,
    payload?.data?.list,
    payload?.list,
  ];
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate.map((item: any, index: number) => ({
        id: item.id ?? `remote-${index}`,
        name: item.name ?? `model-${index}`,
        provider: item.provider ?? '平台模型库',
        type: item.type ?? 'IMAGE',
        createName: item.createName ?? item.creatorName ?? '-',
        createTime: item.createTime ?? '-',
        deployStatus: item.deployStatus ?? '联调中',
        evalScore: item.evalScore ?? '-',
      }));
    }
  }
  return [];
}

const filteredModels = computed(() => {
  return modelRows.value.filter((item) => {
    const matchKeyword =
      keyword.value.trim() === '' ||
      [item.name, item.provider, item.createName || ''].some((field) =>
        field.includes(keyword.value.trim()),
      );
    const matchType =
      selectedType.value === '全部类型' || item.type === selectedType.value;
    const matchDeploy =
      selectedDeployStatus.value === '全部状态' ||
      item.deployStatus === selectedDeployStatus.value;
    return matchKeyword && matchType && matchDeploy;
  });
});

const selectedModel = computed(() => {
  return (
    filteredModels.value.find((item) => item.id === selectedModelId.value) ||
    modelRows.value.find((item) => item.id === selectedModelId.value) ||
    null
  );
});

function getDeployColor(status?: string) {
  if (status === '已部署') return 'green';
  if (status === '联调中') return 'blue';
  if (status === '待部署') return 'orange';
  return 'default';
}

function openModelDetail(modelId: string | number) {
  selectedModelId.value = modelId;
  detailOpen.value = true;
}

function refreshModels() {
  message.success('模型列表已刷新，当前为接口联调 + 本地兜底数据');
}

function deployModel(modelId?: string | number) {
  const target =
    modelRows.value.find((item) => item.id === modelId) || selectedModel.value;
  if (!target) return;
  message.success(`已打开 ${target.name} 的部署入口占位`);
}

onMounted(async () => {
  modelLoading.value = true;
  try {
    const response = await PageList({
      current: 1,
      size: 10,
    } as any);
    const records = resolveModelRecords(response);
    if (records.length > 0) {
      modelRows.value = records;
      modelError.value = '';
    } else {
      modelError.value = 'AI 模型接口已接入，但当前未返回有效模型列表，先展示本地占位数据。';
    }
  } catch (error) {
    console.error('load ai model list failed', error);
    modelError.value = '当前无法连接 /ai/models 接口，已自动回退到本地占位数据。';
  } finally {
    modelLoading.value = false;
  }
});
</script>

<template>
  <Page :auto-content-height="true">
    <div class="flex flex-col gap-4 p-2">
      <Alert
        message="c124 将作为 AI 模型中心的一期算法资产来源"
        description="当前先以模型资产、部署摘要、评估指标和演示能力的形式接入，后续再把训练与推理能力服务化，接入大航蜂 Drone OS 后端。"
        show-icon
        type="success"
      />

      <Row :gutter="[16, 16]">
        <Col v-for="item in stats" :key="item.title" :lg="6" :md="12" :span="24">
          <Card :bordered="false">
            <Statistic :suffix="item.suffix" :title="item.title" :value="item.value" />
          </Card>
        </Col>
      </Row>

      <Row :gutter="[16, 16]">
        <Col v-for="item in deployCards" :key="item.title" :lg="8" :span="24">
          <Card :bordered="false">
            <div class="text-lg font-semibold text-slate-900">{{ item.title }}</div>
            <div class="mt-3 text-3xl font-bold text-slate-900">{{ item.value }}</div>
            <div class="mt-2 text-sm text-slate-500">{{ item.desc }}</div>
          </Card>
        </Col>
      </Row>

      <Card :bordered="false" title="模型筛选与联调预览">
        <Alert
          v-if="modelError"
          :description="modelError"
          class="mb-4"
          show-icon
          type="warning"
        />
        <div class="ai-toolbar">
          <Space :size="[12, 12]" wrap>
            <Input
              v-model:value="keyword"
              allow-clear
              class="ai-toolbar__input"
              placeholder="搜索模型名称 / 提供商 / 创建人"
            />
            <Select
              v-model:value="selectedType"
              :options="typeOptions"
              class="ai-toolbar__select"
            />
            <Select
              v-model:value="selectedDeployStatus"
              :options="deployStatusOptions"
              class="ai-toolbar__select"
            />
            <Button type="primary" @click="refreshModels()">刷新模型</Button>
          </Space>
          <div class="text-sm text-slate-500">
            当前筛选结果共 {{ filteredModels.length }} 个模型，重点关注
            <span class="font-semibold text-slate-800">
              {{ selectedModel?.name || '暂无模型' }}
            </span>
          </div>
        </div>

        <Table
          v-if="filteredModels.length > 0"
          :columns="modelColumns"
          :data-source="filteredModels"
          :loading="modelLoading"
          :pagination="{ pageSize: 5 }"
          row-key="id"
          size="middle"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'type'">
              <Tag :color="record.type === 'IMAGE' ? 'green' : 'blue'">
                {{ record.type }}
              </Tag>
            </template>
            <template v-else-if="column.key === 'deployStatus'">
              <Tag :color="getDeployColor(record.deployStatus)">
                {{ record.deployStatus }}
              </Tag>
            </template>
            <template v-else-if="column.key === 'action'">
              <Space>
                <Button size="small" type="link" @click="openModelDetail(record.id)">
                  查看详情
                </Button>
                <Button size="small" type="link" @click="deployModel(record.id)">
                  部署模型
                </Button>
              </Space>
            </template>
          </template>
        </Table>
        <Empty v-else description="暂无可展示的模型数据" />
      </Card>

      <Row :gutter="[16, 16]">
        <Col :lg="12" :span="24">
          <Card :bordered="false" title="c124 资产接入映射">
            <div class="flex flex-col gap-3">
              <div
                v-for="item in c124Assets"
                :key="item"
                class="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
              >
                {{ item }}
              </div>
            </div>
            <div class="mt-4 flex flex-wrap gap-2">
              <Tag color="green">YOLOv11</Tag>
              <Tag color="green">best.pt</Tag>
              <Tag color="green">results.csv</Tag>
              <Tag color="green">指标图表</Tag>
              <Tag color="green">演示验证</Tag>
            </div>
          </Card>
        </Col>
        <Col :lg="12" :span="24">
          <Card :bordered="false" title="c124 实际训练指标">
            <div class="grid gap-3 md:grid-cols-2">
              <div
                v-for="item in c124Metrics"
                :key="item.title"
                class="rounded-lg border border-slate-200 px-4 py-3"
              >
                <div class="text-sm text-slate-500">{{ item.title }}</div>
                <div class="mt-2 text-2xl font-semibold text-slate-900">{{ item.value }}</div>
              </div>
            </div>
            <div class="mt-4 grid gap-3 md:grid-cols-2">
              <div
                v-for="item in c124TrainConfig"
                :key="item"
                class="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-700"
              >
                {{ item }}
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Card :bordered="false" title="平台化演进路线">
        <Timeline>
          <Timeline.Item color="blue">先完成 AI 模型中心页面和资产展示</Timeline.Item>
          <Timeline.Item color="blue">补模型管理、模型评估与部署状态接口</Timeline.Item>
          <Timeline.Item color="blue">把 c124 训练结果与模型版本纳入平台管理</Timeline.Item>
          <Timeline.Item color="blue">将桌面检测能力拆分为在线推理服务和演示入口</Timeline.Item>
        </Timeline>
      </Card>

      <Drawer
        v-model:open="detailOpen"
        title="模型详情"
        placement="right"
        width="420"
      >
        <template v-if="selectedModel">
          <Descriptions :column="1" bordered size="small">
            <DescriptionsItem label="模型名称">
              {{ selectedModel.name }}
            </DescriptionsItem>
            <DescriptionsItem label="提供商">
              {{ selectedModel.provider }}
            </DescriptionsItem>
            <DescriptionsItem label="模型类型">
              <Tag :color="selectedModel.type === 'IMAGE' ? 'green' : 'blue'">
                {{ selectedModel.type }}
              </Tag>
            </DescriptionsItem>
            <DescriptionsItem label="部署状态">
              <Tag :color="getDeployColor(selectedModel.deployStatus)">
                {{ selectedModel.deployStatus }}
              </Tag>
            </DescriptionsItem>
            <DescriptionsItem label="评估分数">
              {{ selectedModel.evalScore || '-' }}
            </DescriptionsItem>
            <DescriptionsItem label="创建人">
              {{ selectedModel.createName || '-' }}
            </DescriptionsItem>
            <DescriptionsItem label="创建时间">
              {{ selectedModel.createTime || '-' }}
            </DescriptionsItem>
          </Descriptions>

          <div class="mt-4">
            <div class="mb-2 text-sm font-semibold text-slate-900">部署摘要</div>
            <div class="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
              当前模型支持云端发布、边缘节点下发和演示环境联调，下一步将对接真实部署状态与日志回传能力。
            </div>
          </div>

          <div class="mt-4 flex flex-wrap gap-3">
            <Button type="primary" @click="deployModel(selectedModel.id)">
              部署模型
            </Button>
            <Button @click="message.success('已打开评估报告入口占位')">
              评估报告
            </Button>
            <Button @click="message.success('已打开训练配置入口占位')">
              训练配置
            </Button>
          </div>
        </template>
      </Drawer>
    </div>
  </Page>
</template>

<style lang="less" scoped>
.ai-toolbar {
  display: flex;
  gap: 16px;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.ai-toolbar__input {
  width: 320px;
}

.ai-toolbar__select {
  width: 160px;
}
</style>
