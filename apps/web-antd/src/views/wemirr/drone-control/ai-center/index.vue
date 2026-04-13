<script lang="ts" setup name="DroneAiCenterPage">
import { computed, onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';

import {
  Alert,
  Card,
  Col,
  Empty,
  Row,
  Statistic,
  Table,
  Tag,
  Timeline,
} from 'ant-design-vue';

import { PageList } from '#/views/wemirr/ai/model/config/api';

interface ModelRecord {
  createName?: string;
  createTime?: string;
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
  },
  {
    id: 'local-2',
    name: 'qwen-vl-demo',
    provider: 'OpenAI Compatible',
    type: 'TEXT',
    createName: '平台组',
    createTime: '2026-04-13 14:05:00',
  },
];

const modelRows = ref<ModelRecord[]>([...fallbackModels]);
const modelLoading = ref(false);
const modelError = ref('');

const stats = computed(() => [
  { title: '模型版本', value: modelRows.value.length, suffix: '个' },
  { title: '边缘部署节点', value: 14, suffix: '个' },
  { title: '评估任务', value: 3, suffix: '项' },
  { title: '大模型服务', value: 2, suffix: '类' },
]);

const sections = [
  {
    title: '模型管理',
    description: '管理模型文件、版本、类型、部署位置与状态，沉淀算法资产目录。',
  },
  {
    title: '模型部署',
    description: '展示云端、边缘、端侧的部署状态，承接一键下发和远程更新能力。',
  },
  {
    title: '模型配置',
    description: '管理置信度、NMS、类别清单、推理精度和场景绑定等关键参数。',
  },
  {
    title: '模型训练',
    description: '承接数据集、标注、训练任务和导出流程，后续与训练平台联动。',
  },
  {
    title: '模型评估',
    description: '沉淀准确率、误报率、漏报率、性能监控与评估报告视图。',
  },
  {
    title: '大模型服务',
    description: '承接语义搜图、AI 问数、知识库和 Prompt 模板等能力配置。',
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
  { title: '创建人', dataIndex: 'createName', key: 'createName' },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime' },
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
      return candidate;
    }
  }
  return [];
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
        description="当前先以模型资产、评估图表和演示能力的形式接入，后续再把训练与推理能力服务化，接入 wemirr-platform 后端。"
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
        <Col v-for="item in sections" :key="item.title" :lg="8" :span="24">
          <Card :bordered="false" :title="item.title">
            <div class="text-sm leading-6 text-slate-600">{{ item.description }}</div>
          </Card>
        </Col>
      </Row>

      <Card :bordered="false" title="AI 模型列表联调预览">
        <Alert
          v-if="modelError"
          :description="modelError"
          class="mb-4"
          show-icon
          type="warning"
        />
        <Table
          v-if="modelRows.length > 0"
          :columns="modelColumns"
          :data-source="modelRows"
          :loading="modelLoading"
          :pagination="false"
          row-key="id"
          size="middle"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'type'">
              <Tag :color="record.type === 'IMAGE' ? 'green' : 'blue'">
                {{ record.type }}
              </Tag>
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
    </div>
  </Page>
</template>
