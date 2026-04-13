<script lang="ts" setup name="AiEvaluationPage">
import { Page } from '@vben/common-ui';

import { ref } from 'vue';

import {
  Card,
  Col,
  Descriptions,
  DescriptionsItem,
  Row,
  Select,
  Statistic,
  Table,
  Tag,
} from 'ant-design-vue';

const selectedModel = ref('drone-det-v11s');
const modelOptions = [
  { label: '无人机小目标检测 v11s', value: 'drone-det-v11s' },
  { label: '车辆违停检测 v8m', value: 'vehicle-det-v8m' },
  { label: '烟火识别模型', value: 'fire-smoke-det' },
  { label: '路面损伤分割', value: 'road-damage-seg' },
  { label: '车牌识别 OCR', value: 'license-plate-ocr' },
];

const evalStats = ref([
  { title: 'mAP@50', value: '42.8%' },
  { title: 'mAP@50:95', value: '28.3%' },
  { title: 'Precision', value: '68.5%' },
  { title: 'Recall', value: '51.2%' },
  { title: 'FPS', value: '156' },
  { title: '模型大小', value: '18.5 MB' },
]);

const classMetrics = ref([
  { key: '1', className: 'pedestrian', ap50: 38.2, ap5095: 22.1, count: 8844, precision: 62.3, recall: 45.8 },
  { key: '2', className: 'car', ap50: 58.6, ap5095: 41.2, count: 5985, precision: 78.1, recall: 62.4 },
  { key: '3', className: 'van', ap50: 32.1, ap5095: 18.6, count: 1469, precision: 55.2, recall: 38.9 },
  { key: '4', className: 'truck', ap50: 28.5, ap5095: 16.3, count: 750, precision: 48.6, recall: 35.2 },
  { key: '5', className: 'bus', ap50: 42.3, ap5095: 28.8, count: 251, precision: 65.8, recall: 48.1 },
  { key: '6', className: 'motor', ap50: 31.8, ap5095: 17.5, count: 2563, precision: 52.4, recall: 39.6 },
  { key: '7', className: 'bicycle', ap50: 18.9, ap5095: 9.2, count: 1302, precision: 42.1, recall: 28.3 },
  { key: '8', className: 'awning-tricycle', ap50: 22.4, ap5095: 12.1, count: 532, precision: 45.8, recall: 31.5 },
  { key: '9', className: 'tricycle', ap50: 34.6, ap5095: 20.8, count: 856, precision: 58.3, recall: 42.7 },
  { key: '10', className: 'people', ap50: 35.1, ap5095: 21.4, count: 4238, precision: 60.2, recall: 43.9 },
]);

const classColumns = [
  { title: '类别', dataIndex: 'className', key: 'className', width: 140 },
  { title: 'AP@50', dataIndex: 'ap50', key: 'ap50', width: 100 },
  { title: 'AP@50:95', dataIndex: 'ap5095', key: 'ap5095', width: 110 },
  { title: '样本数', dataIndex: 'count', key: 'count', width: 100 },
  { title: 'Precision', dataIndex: 'precision', key: 'precision', width: 110 },
  { title: 'Recall', dataIndex: 'recall', key: 'recall', width: 100 },
];

const trainHistory = ref([
  { key: '1', version: 'v1.2.0', epochs: 200, mAP50: 42.8, mAP5095: 28.3, trainTime: '8h 35m', gpu: 'A100 × 1', date: '2026-03-15' },
  { key: '2', version: 'v1.1.0', epochs: 150, mAP50: 39.5, mAP5095: 25.6, trainTime: '6h 12m', gpu: 'A10 × 1', date: '2026-02-10' },
  { key: '3', version: 'v1.0.0', epochs: 100, mAP50: 35.2, mAP5095: 22.1, trainTime: '4h 20m', gpu: 'A10 × 1', date: '2026-01-05' },
]);

const historyColumns = [
  { title: '版本', dataIndex: 'version', key: 'version', width: 90 },
  { title: 'Epochs', dataIndex: 'epochs', key: 'epochs', width: 90 },
  { title: 'mAP@50', dataIndex: 'mAP50', key: 'mAP50', width: 100 },
  { title: 'mAP@50:95', dataIndex: 'mAP5095', key: 'mAP5095', width: 110 },
  { title: '训练时间', dataIndex: 'trainTime', key: 'trainTime', width: 110 },
  { title: 'GPU', dataIndex: 'gpu', key: 'gpu', width: 110 },
  { title: '日期', dataIndex: 'date', key: 'date', width: 110 },
];
</script>

<template>
  <Page :auto-content-height="true">
    <div class="flex flex-col gap-4 p-2">
      <Card :bordered="false" title="模型评估报告">
        <template #extra>
          <Select
            v-model:value="selectedModel"
            :options="modelOptions"
            style="width: 240px"
          />
        </template>

        <Row :gutter="[16, 16]">
          <Col v-for="item in evalStats" :key="item.title" :lg="4" :md="8" :span="12">
            <div class="rounded-lg bg-slate-50 dark:bg-slate-800 p-3 text-center">
              <div class="text-sm text-slate-500">{{ item.title }}</div>
              <div class="mt-1 text-xl font-bold text-slate-800 dark:text-slate-200">{{ item.value }}</div>
            </div>
          </Col>
        </Row>
      </Card>

      <Row :gutter="[16, 16]">
        <Col :xl="14" :span="24">
          <Card :bordered="false" title="各类别评估指标">
            <Table
              :columns="classColumns"
              :data-source="classMetrics"
              :pagination="false"
              row-key="key"
              size="small"
            />
          </Card>
        </Col>

        <Col :xl="10" :span="24">
          <Card :bordered="false" title="模型基本信息">
            <Descriptions :column="1" bordered size="small">
              <DescriptionsItem label="模型标识">drone-det-v11s</DescriptionsItem>
              <DescriptionsItem label="框架">
                <Tag color="blue">YOLOv11</Tag>
              </DescriptionsItem>
              <DescriptionsItem label="数据集">VisDrone 2019</DescriptionsItem>
              <DescriptionsItem label="训练集">6471 张</DescriptionsItem>
              <DescriptionsItem label="验证集">548 张</DescriptionsItem>
              <DescriptionsItem label="测试集">1610 张</DescriptionsItem>
              <DescriptionsItem label="输入尺寸">640 × 640</DescriptionsItem>
              <DescriptionsItem label="类别数">10</DescriptionsItem>
              <DescriptionsItem label="权重文件">best.pt (18.5 MB)</DescriptionsItem>
              <DescriptionsItem label="导出格式">
                <Tag>PyTorch</Tag>
                <Tag>ONNX</Tag>
                <Tag>TensorRT</Tag>
              </DescriptionsItem>
            </Descriptions>
          </Card>
        </Col>
      </Row>

      <Card :bordered="false" title="训练历史对比">
        <Table
          :columns="historyColumns"
          :data-source="trainHistory"
          :pagination="false"
          row-key="key"
          size="small"
        />
      </Card>
    </div>
  </Page>
</template>
