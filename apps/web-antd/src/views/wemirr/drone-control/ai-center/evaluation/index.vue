<script lang="ts" setup name="AiEvaluationPage">
import { Page } from '@vben/common-ui';

import { onBeforeUnmount, onMounted, ref } from 'vue';

import {
  Badge,
  Button,
  Card,
  Col,
  Descriptions,
  DescriptionsItem,
  Progress,
  Row,
  Select,
  SelectOption,
  Space,
  Table,
  Tabs,
  TabPane,
  Tag,
  message,
} from 'ant-design-vue';

const activeTab = ref('training');

// Training monitor
const trainingRunning = ref(false);
const trainingEpoch = ref(0);
const trainingMaxEpoch = 100;
let trainTimer: number | undefined;

const lossHistory = ref<number[]>([]);
const mapHistory = ref<number[]>([]);

function startTraining() {
  trainingRunning.value = true;
  trainingEpoch.value = 0;
  lossHistory.value = [];
  mapHistory.value = [];
  message.info('训练已启动');

  trainTimer = window.setInterval(() => {
    trainingEpoch.value++;
    const e = trainingEpoch.value;
    lossHistory.value.push(Number((2.5 * Math.exp(-e * 0.04) + 0.15 + Math.random() * 0.08).toFixed(3)));
    mapHistory.value.push(Number((0.85 * (1 - Math.exp(-e * 0.05)) + Math.random() * 0.02).toFixed(3)));

    if (trainingEpoch.value >= trainingMaxEpoch) {
      stopTraining();
      message.success('训练完成！最终 mAP: ' + mapHistory.value[mapHistory.value.length - 1]);
    }
  }, 150);
}

function stopTraining() {
  trainingRunning.value = false;
  if (trainTimer) clearInterval(trainTimer);
}

onBeforeUnmount(() => { if (trainTimer) clearInterval(trainTimer); });

function svgPath(data: number[], maxVal: number, w: number, h: number): string {
  if (data.length < 2) return '';
  return data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - (v / maxVal) * (h - 10) - 5;
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
}

// Evaluation dashboard
const selectedModel = ref('YOLOv11s-VisDrone');
const models = ['YOLOv11s-VisDrone', 'YOLOv11m-VisDrone', 'RT-DETR-L', 'Qwen2-VL-7B'];

const evalMetrics = ref({
  mAP50: 0.847,
  mAP5095: 0.623,
  precision: 0.891,
  recall: 0.812,
  f1: 0.850,
  fps: 42,
  params: '9.4M',
  flops: '21.5G',
  latency: '23.8ms',
});

const classMetrics = [
  { name: '行人', ap: 0.89, precision: 0.92, recall: 0.85, count: 4280 },
  { name: '车辆', ap: 0.91, precision: 0.94, recall: 0.88, count: 6120 },
  { name: '自行车', ap: 0.78, precision: 0.82, recall: 0.74, count: 1850 },
  { name: '三轮车', ap: 0.72, precision: 0.78, recall: 0.68, count: 920 },
  { name: '遮阳篷', ap: 0.65, precision: 0.71, recall: 0.60, count: 580 },
  { name: '公交车', ap: 0.88, precision: 0.91, recall: 0.84, count: 1240 },
  { name: '卡车', ap: 0.85, precision: 0.89, recall: 0.81, count: 2100 },
];

const classColumns = [
  { title: '类别', dataIndex: 'name', key: 'name', width: 80 },
  { title: 'AP', dataIndex: 'ap', key: 'ap', width: 70 },
  { title: 'Precision', dataIndex: 'precision', key: 'precision', width: 90 },
  { title: 'Recall', dataIndex: 'recall', key: 'recall', width: 80 },
  { title: '样本数', dataIndex: 'count', key: 'count', width: 80 },
];

// Version comparison
const versions = [
  { ver: 'v3.2', date: '2026-04-10', mAP: 0.847, fps: 42, params: '9.4M', status: '当前' },
  { ver: 'v3.1', date: '2026-03-28', mAP: 0.831, fps: 40, params: '9.4M', status: '历史' },
  { ver: 'v3.0', date: '2026-03-15', mAP: 0.815, fps: 38, params: '9.4M', status: '历史' },
  { ver: 'v2.0', date: '2026-02-20', mAP: 0.782, fps: 35, params: '7.2M', status: '历史' },
  { ver: 'v1.0', date: '2026-01-10', mAP: 0.721, fps: 30, params: '7.2M', status: '已归档' },
];

const versionColumns = [
  { title: '版本', dataIndex: 'ver', key: 'ver', width: 70 },
  { title: '日期', dataIndex: 'date', key: 'date', width: 110 },
  { title: 'mAP@50', dataIndex: 'mAP', key: 'mAP', width: 90 },
  { title: 'FPS', dataIndex: 'fps', key: 'fps', width: 60 },
  { title: '参数量', dataIndex: 'params', key: 'params', width: 80 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 80 },
];

function metricColor(val: number) {
  if (val >= 0.85) return '#52c41a';
  if (val >= 0.7) return '#1677ff';
  return '#faad14';
}
</script>

<template>
  <Page>
    <div class="flex flex-col gap-3 p-2">
      <Tabs v-model:activeKey="activeTab" type="card">
        <!-- Training Monitor -->
        <TabPane key="training" tab="训练监控">
          <Card :bordered="false" size="small">
            <div class="flex items-center justify-between mb-4">
              <Space>
                <Select v-model:value="selectedModel" style="width: 200px" size="small">
                  <SelectOption v-for="m in models" :key="m" :value="m">{{ m }}</SelectOption>
                </Select>
                <Button v-if="!trainingRunning" type="primary" size="small" @click="startTraining">开始训练</Button>
                <Button v-else size="small" danger @click="stopTraining">停止训练</Button>
              </Space>
              <div class="text-sm" style="color: var(--ant-color-text-tertiary)">
                Epoch: {{ trainingEpoch }} / {{ trainingMaxEpoch }}
              </div>
            </div>

            <Progress :percent="Math.round((trainingEpoch / trainingMaxEpoch) * 100)" :status="trainingRunning ? 'active' : 'normal'" />

            <Row :gutter="[16, 16]" class="mt-4">
              <Col :span="12">
                <Card size="small" title="Loss 曲线" :bordered="false" class="chart-card">
                  <svg viewBox="0 0 400 150" class="train-chart">
                    <path v-if="lossHistory.length >= 2" :d="svgPath(lossHistory, 3, 400, 150)" fill="none" stroke="#ef4444" stroke-width="2" />
                    <text x="5" y="15" fill="rgba(255,255,255,0.3)" font-size="10">Loss</text>
                    <text v-if="lossHistory.length" x="370" :y="145" fill="rgba(255,255,255,0.5)" font-size="11" text-anchor="end">
                      {{ lossHistory[lossHistory.length - 1] }}
                    </text>
                  </svg>
                </Card>
              </Col>
              <Col :span="12">
                <Card size="small" title="mAP 曲线" :bordered="false" class="chart-card">
                  <svg viewBox="0 0 400 150" class="train-chart">
                    <path v-if="mapHistory.length >= 2" :d="svgPath(mapHistory, 1, 400, 150)" fill="none" stroke="#1677ff" stroke-width="2" />
                    <text x="5" y="15" fill="rgba(255,255,255,0.3)" font-size="10">mAP@50</text>
                    <text v-if="mapHistory.length" x="370" :y="145" fill="rgba(255,255,255,0.5)" font-size="11" text-anchor="end">
                      {{ mapHistory[mapHistory.length - 1] }}
                    </text>
                  </svg>
                </Card>
              </Col>
            </Row>

            <Row :gutter="[16, 16]" class="mt-3">
              <Col :span="6">
                <Card size="small" :bordered="false" class="metric-mini">
                  <div class="metric-mini__val">{{ lossHistory.length ? lossHistory[lossHistory.length - 1] : '-' }}</div>
                  <div class="metric-mini__label">当前 Loss</div>
                </Card>
              </Col>
              <Col :span="6">
                <Card size="small" :bordered="false" class="metric-mini">
                  <div class="metric-mini__val">{{ mapHistory.length ? mapHistory[mapHistory.length - 1] : '-' }}</div>
                  <div class="metric-mini__label">当前 mAP</div>
                </Card>
              </Col>
              <Col :span="6">
                <Card size="small" :bordered="false" class="metric-mini">
                  <div class="metric-mini__val">{{ trainingEpoch }}</div>
                  <div class="metric-mini__label">Epoch</div>
                </Card>
              </Col>
              <Col :span="6">
                <Card size="small" :bordered="false" class="metric-mini">
                  <div class="metric-mini__val">0.001</div>
                  <div class="metric-mini__label">学习率</div>
                </Card>
              </Col>
            </Row>
          </Card>
        </TabPane>

        <!-- Evaluation Dashboard -->
        <TabPane key="evaluation" tab="评估仪表盘">
          <Row :gutter="[16, 16]">
            <Col :lg="16" :span="24">
              <Card :bordered="false" size="small" title="核心指标">
                <Row :gutter="[16, 16]">
                  <Col :span="8">
                    <div class="eval-gauge">
                      <svg viewBox="0 0 120 70" class="gauge-svg">
                        <path d="M10,65 A50,50 0 0,1 110,65" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="8" stroke-linecap="round" />
                        <path d="M10,65 A50,50 0 0,1 110,65" fill="none" :stroke="metricColor(evalMetrics.mAP50)" stroke-width="8" stroke-linecap="round" :stroke-dasharray="`${evalMetrics.mAP50 * 157} 157`" />
                        <text x="60" y="55" text-anchor="middle" fill="#f9fafb" font-size="18" font-weight="800">{{ (evalMetrics.mAP50 * 100).toFixed(1) }}%</text>
                        <text x="60" y="68" text-anchor="middle" fill="rgba(255,255,255,0.4)" font-size="9">mAP@50</text>
                      </svg>
                    </div>
                  </Col>
                  <Col :span="8">
                    <div class="eval-gauge">
                      <svg viewBox="0 0 120 70" class="gauge-svg">
                        <path d="M10,65 A50,50 0 0,1 110,65" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="8" stroke-linecap="round" />
                        <path d="M10,65 A50,50 0 0,1 110,65" fill="none" :stroke="metricColor(evalMetrics.precision)" stroke-width="8" stroke-linecap="round" :stroke-dasharray="`${evalMetrics.precision * 157} 157`" />
                        <text x="60" y="55" text-anchor="middle" fill="#f9fafb" font-size="18" font-weight="800">{{ (evalMetrics.precision * 100).toFixed(1) }}%</text>
                        <text x="60" y="68" text-anchor="middle" fill="rgba(255,255,255,0.4)" font-size="9">Precision</text>
                      </svg>
                    </div>
                  </Col>
                  <Col :span="8">
                    <div class="eval-gauge">
                      <svg viewBox="0 0 120 70" class="gauge-svg">
                        <path d="M10,65 A50,50 0 0,1 110,65" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="8" stroke-linecap="round" />
                        <path d="M10,65 A50,50 0 0,1 110,65" fill="none" :stroke="metricColor(evalMetrics.recall)" stroke-width="8" stroke-linecap="round" :stroke-dasharray="`${evalMetrics.recall * 157} 157`" />
                        <text x="60" y="55" text-anchor="middle" fill="#f9fafb" font-size="18" font-weight="800">{{ (evalMetrics.recall * 100).toFixed(1) }}%</text>
                        <text x="60" y="68" text-anchor="middle" fill="rgba(255,255,255,0.4)" font-size="9">Recall</text>
                      </svg>
                    </div>
                  </Col>
                </Row>
              </Card>

              <Card :bordered="false" size="small" title="各类别评估" class="mt-3">
                <Table :columns="classColumns" :data-source="classMetrics" :pagination="false" size="small" row-key="name">
                  <template #bodyCell="{ column, record }">
                    <template v-if="column.key === 'ap'">
                      <span :style="{ color: metricColor(record.ap) }">{{ record.ap }}</span>
                    </template>
                  </template>
                </Table>
              </Card>
            </Col>

            <Col :lg="8" :span="24">
              <Card :bordered="false" size="small" title="模型参数">
                <Descriptions :column="1" size="small" bordered>
                  <DescriptionsItem label="mAP@50">{{ evalMetrics.mAP50 }}</DescriptionsItem>
                  <DescriptionsItem label="mAP@50:95">{{ evalMetrics.mAP5095 }}</DescriptionsItem>
                  <DescriptionsItem label="F1 Score">{{ evalMetrics.f1 }}</DescriptionsItem>
                  <DescriptionsItem label="FPS">{{ evalMetrics.fps }}</DescriptionsItem>
                  <DescriptionsItem label="参数量">{{ evalMetrics.params }}</DescriptionsItem>
                  <DescriptionsItem label="FLOPs">{{ evalMetrics.flops }}</DescriptionsItem>
                  <DescriptionsItem label="推理延迟">{{ evalMetrics.latency }}</DescriptionsItem>
                </Descriptions>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <!-- Version Comparison -->
        <TabPane key="versions" tab="版本对比">
          <Card :bordered="false" size="small" title="模型版本历史">
            <Table :columns="versionColumns" :data-source="versions" :pagination="false" size="small" row-key="ver">
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'mAP'">
                  <span :style="{ color: metricColor(record.mAP), fontWeight: 700 }">{{ record.mAP }}</span>
                </template>
                <template v-if="column.key === 'status'">
                  <Tag :color="record.status === '当前' ? 'blue' : record.status === '历史' ? 'default' : 'orange'" size="small">{{ record.status }}</Tag>
                </template>
              </template>
            </Table>
          </Card>

          <Card :bordered="false" size="small" title="mAP 版本趋势" class="mt-3">
            <svg viewBox="0 0 400 120" class="version-chart">
              <line v-for="i in 5" :key="i" x1="0" :y1="i * 24" x2="400" :y2="i * 24" stroke="rgba(255,255,255,0.04)" />
              <polyline :points="versions.slice().reverse().map((v, i) => `${i * 100 + 20},${110 - v.mAP * 120}`).join(' ')" fill="none" stroke="#1677ff" stroke-width="2" />
              <circle v-for="(v, i) in versions.slice().reverse()" :key="v.ver" :cx="i * 100 + 20" :cy="110 - v.mAP * 120" r="4" fill="#1677ff" />
              <text v-for="(v, i) in versions.slice().reverse()" :key="'t' + v.ver" :x="i * 100 + 20" y="118" text-anchor="middle" fill="rgba(255,255,255,0.35)" font-size="10">{{ v.ver }}</text>
            </svg>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  </Page>
</template>

<style lang="less" scoped>
.chart-card {
  background: var(--ant-color-bg-layout);
}

.train-chart {
  width: 100%;
  height: 120px;
}

.metric-mini {
  text-align: center;
  background: var(--ant-color-bg-layout);
}

.metric-mini__val {
  font-size: 20px;
  font-weight: 800;
  color: var(--ant-color-primary);
  font-variant-numeric: tabular-nums;
}

.metric-mini__label {
  font-size: 11px;
  color: var(--ant-color-text-tertiary);
  margin-top: 2px;
}

.eval-gauge {
  text-align: center;
}

.gauge-svg {
  width: 100%;
  max-width: 140px;
}

.version-chart {
  width: 100%;
  height: 120px;
}
</style>
