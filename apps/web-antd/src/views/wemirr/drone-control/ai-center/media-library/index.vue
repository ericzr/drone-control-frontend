<script lang="ts" setup name="AiMediaLibraryPage">
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
  Modal,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  message,
} from 'ant-design-vue';

import {
  appendAiMediaRecord,
  listAiMediaLibrary,
  type AiMediaLibraryRecord,
  upsertAiMediaRecord,
} from '../../_services/ai-media-library-store';

const router = useRouter();

const mediaRecords = ref<AiMediaLibraryRecord[]>([]);
const detailOpen = ref(false);
const uploadOpen = ref(false);
const selectedRecord = ref<AiMediaLibraryRecord | null>(null);

const filters = reactive({
  keyword: '',
  mediaType: '全部',
  scene: '全部',
  aiStatus: '全部',
  storageClass: '全部',
});

const uploadForm = reactive({
  batchName: '',
  mediaType: '图片',
  scene: '安全生产',
  location: '',
  deviceName: '',
  relationTaskName: '工地安全帽专项抽检',
  uploader: '当前用户',
  fileCount: '18',
  description: '',
});

const sceneOptions = ['全部', '森林防火', '交通巡查', '安全生产', '光伏巡检', '水域监测'].map((label) => ({
  label,
  value: label,
}));
const mediaTypeOptions = ['全部', '图片', '视频', '实时流'].map((label) => ({
  label,
  value: label,
}));
const aiStatusOptions = ['全部', '待分析', '已关联任务', '已分析'].map((label) => ({
  label,
  value: label,
}));
const storageOptions = ['全部', '热存', '标准', '归档'].map((label) => ({
  label,
  value: label,
}));
const relationTaskOptions = [
  '森林烟火实时巡检',
  '高新区违停抓拍复核',
  '光伏热斑日报分析',
  '工地安全帽专项抽检',
  '渭河多光谱污染筛查',
].map((label) => ({ label, value: label }));

const columns: any[] = [
  { title: '文件名称', dataIndex: 'name', key: 'name', width: 240 },
  { title: '类型', dataIndex: 'mediaType', key: 'mediaType', width: 90 },
  { title: '场景', dataIndex: 'scene', key: 'scene', width: 110 },
  { title: '数据来源', dataIndex: 'sourceType', key: 'sourceType', width: 120 },
  { title: '关联任务', dataIndex: 'relationTaskName', key: 'relationTaskName', width: 180 },
  { title: '存储', dataIndex: 'storageClass', key: 'storageClass', width: 90 },
  { title: 'AI状态', dataIndex: 'aiStatus', key: 'aiStatus', width: 110 },
  { title: '同步状态', dataIndex: 'syncStatus', key: 'syncStatus', width: 100 },
  { title: '操作', dataIndex: 'action', key: 'action', width: 260, fixed: 'right' },
];

const stats = computed(() => {
  const total = mediaRecords.value.length;
  const pending = mediaRecords.value.filter((item) => item.aiStatus === '待分析').length;
  const archived = mediaRecords.value.filter((item) => item.storageClass === '归档').length;
  const syncing = mediaRecords.value.filter((item) => item.syncStatus !== '已同步').length;
  return [
    { title: '媒体资产', value: total, suffix: '份' },
    { title: '待分析素材', value: pending, suffix: '份' },
    { title: '归档素材', value: archived, suffix: '份' },
    { title: '待同步 / 上传', value: syncing, suffix: '份' },
  ];
});

const filteredRecords = computed(() => {
  return mediaRecords.value.filter((item) => {
    const matchKeyword =
      filters.keyword.trim() === '' ||
      [item.name, item.location, item.deviceName, item.relationTaskName, item.description]
        .join('|')
        .includes(filters.keyword.trim());
    const matchType = filters.mediaType === '全部' || item.mediaType === filters.mediaType;
    const matchScene = filters.scene === '全部' || item.scene === filters.scene;
    const matchAi = filters.aiStatus === '全部' || item.aiStatus === filters.aiStatus;
    const matchStorage =
      filters.storageClass === '全部' || item.storageClass === filters.storageClass;
    return matchKeyword && matchType && matchScene && matchAi && matchStorage;
  });
});

function previewSvg(label: string, mediaType: string) {
  const color =
    mediaType === '视频' ? 'ef4444' : mediaType === '实时流' ? '06b6d4' : '3b82f6';
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='360' height='220'%3E%3Crect width='360' height='220' fill='%230f172a'/%3E%3Crect x='36' y='36' width='288' height='148' rx='8' fill='none' stroke='%23${color}' stroke-width='2' stroke-dasharray='6,4'/%3E%3Ctext x='180' y='116' text-anchor='middle' fill='%23${color}' font-size='14' font-family='monospace'%3E${encodeURIComponent(label)}%3C/text%3E%3C/svg%3E`;
}

function nowString() {
  return new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-');
}

function mediaId() {
  return `MEDIA-${Date.now().toString().slice(-8)}`;
}

function refreshLibrary(showMessage = false) {
  mediaRecords.value = listAiMediaLibrary();
  if (showMessage) {
    message.success('媒体库已刷新');
  }
}

function openDetail(record: AiMediaLibraryRecord) {
  selectedRecord.value = record;
  detailOpen.value = true;
}

function openDetailFromTable(record: Record<string, any>) {
  openDetail(record as AiMediaLibraryRecord);
}

function storageColor(storage: string) {
  if (storage === '热存') return 'red';
  if (storage === '标准') return 'blue';
  return 'default';
}

function aiColor(status: string) {
  if (status === '已分析') return 'green';
  if (status === '已关联任务') return 'blue';
  return 'orange';
}

function syncColor(status: string) {
  if (status === '已同步') return 'green';
  if (status === '同步中') return 'blue';
  return 'orange';
}

function toDetection(record: AiMediaLibraryRecord) {
  message.success(`已将素材「${record.name}」送往在线检测入口`);
  router.push('/ai-center/detection');
}

function toDetectionFromTable(record: Record<string, any>) {
  toDetection(record as AiMediaLibraryRecord);
}

function toTask(record: AiMediaLibraryRecord) {
  message.info(`前往分析任务查看素材「${record.name}」关联编排`);
  router.push('/ai-center/task');
}

function toTaskFromTable(record: Record<string, any>) {
  toTask(record as AiMediaLibraryRecord);
}

function toHistory(record: AiMediaLibraryRecord) {
  message.info(`前往历史回放查看素材「${record.name}」关联结果`);
  router.push('/ai-center/detect-history');
}

function toHistoryFromTable(record: Record<string, any>) {
  toHistory(record as AiMediaLibraryRecord);
}

function archiveRecord(record: AiMediaLibraryRecord) {
  const updated: AiMediaLibraryRecord = {
    ...record,
    storageClass: '归档',
    syncStatus: '已同步',
  };
  upsertAiMediaRecord(updated);
  refreshLibrary();
  if (selectedRecord.value?.id === record.id) {
    selectedRecord.value = updated;
  }
  message.success(`素材「${record.name}」已转入归档存储`);
}

function archiveFromTable(record: Record<string, any>) {
  archiveRecord(record as AiMediaLibraryRecord);
}

function submitUpload() {
  if (!uploadForm.batchName || !uploadForm.location || !uploadForm.deviceName) {
    message.warning('请补全批次名称、位置和来源设备');
    return;
  }
  const record: AiMediaLibraryRecord = {
    id: mediaId(),
    name: `${uploadForm.batchName}.${uploadForm.mediaType === '视频' ? 'mp4' : 'zip'}`,
    mediaType: uploadForm.mediaType as AiMediaLibraryRecord['mediaType'],
    sourceType: '本地批量上传',
    scene: uploadForm.scene,
    location: uploadForm.location,
    deviceName: uploadForm.deviceName,
    relationTaskName: uploadForm.relationTaskName,
    resolution: uploadForm.mediaType === '视频' ? '1920×1080' : '4032×3024',
    fileSize:
      uploadForm.mediaType === '视频'
        ? `${Number(uploadForm.fileCount || 1) * 36} MB`
        : `${Number(uploadForm.fileCount || 1) * 8} MB`,
    storageClass: '热存',
    syncStatus: '待上传',
    aiStatus: '待分析',
    tags: [uploadForm.scene, '批量上传', uploadForm.mediaType],
    captureTime: nowString(),
    uploader: uploadForm.uploader,
    description:
      uploadForm.description ||
      `本地上传 ${uploadForm.fileCount} 个${uploadForm.mediaType === '视频' ? '视频片段' : '图像文件'}，待进入 AI 分析流程。`,
    previewLabel: uploadForm.batchName,
  };
  appendAiMediaRecord(record);
  refreshLibrary();
  uploadOpen.value = false;
  selectedRecord.value = record;
  detailOpen.value = true;
  message.success(`批次「${uploadForm.batchName}」已加入媒体库`);
}

onMounted(() => {
  refreshLibrary();
});
</script>

<template>
  <Page :auto-content-height="true">
    <div class="flex flex-col gap-4 p-2">
      <Alert
        type="success"
        show-icon
        message="P0 优先能力：媒体库管理"
        description="统一承接自动回传、飞行影像归档、视频流切片和本地批量上传，先打通媒体素材入库、筛选、生命周期管理和分析入口。"
      />

      <Row :gutter="[16, 16]">
        <Col v-for="item in stats" :key="item.title" :lg="6" :md="12" :span="24">
          <Card :bordered="false">
            <Statistic :suffix="item.suffix" :title="item.title" :value="item.value" />
          </Card>
        </Col>
      </Row>

      <Card :bordered="false" title="媒体库筛选">
        <div class="flex flex-wrap items-center gap-3">
          <Input
            v-model:value="filters.keyword"
            allow-clear
            placeholder="搜索文件名、位置、设备或任务"
            style="width: 280px"
          />
          <Select v-model:value="filters.mediaType" :options="mediaTypeOptions" style="width: 120px" />
          <Select v-model:value="filters.scene" :options="sceneOptions" style="width: 130px" />
          <Select v-model:value="filters.aiStatus" :options="aiStatusOptions" style="width: 130px" />
          <Select v-model:value="filters.storageClass" :options="storageOptions" style="width: 120px" />
          <div class="ml-auto flex items-center gap-2">
            <Button size="small" @click="router.push('/ai-center/data-source')">数据源管理</Button>
            <Button size="small" @click="router.push('/dispatch/imagery')">时空影像</Button>
            <Button size="small" @click="router.push('/flight/imagery')">飞行影像</Button>
            <Button size="small" @click="router.push('/ai-center/task')">分析任务</Button>
            <Button size="small" @click="router.push('/ai-center/detect-history')">历史回放</Button>
            <Button size="small" type="primary" @click="uploadOpen = true">本地批量上传</Button>
          </div>
        </div>
      </Card>

      <Row :gutter="[16, 16]">
        <Col :xl="16" :span="24">
          <Card :bordered="false" title="统一媒体库">
            <template #extra>
              <span class="text-xs text-slate-500">自动回传 / 飞行归档 / 本地上传统一收口</span>
            </template>
            <Table
              :columns="columns"
              :data-source="filteredRecords"
              :pagination="{ pageSize: 6 }"
              row-key="id"
              size="small"
              :scroll="{ x: 1360 }"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'name'">
                  <div class="font-medium">{{ record.name }}</div>
                  <div class="text-xs text-slate-400">{{ record.location }}</div>
                </template>
                <template v-else-if="column.key === 'mediaType'">
                  <Tag :color="record.mediaType === '视频' ? 'red' : record.mediaType === '实时流' ? 'cyan' : 'blue'">
                    {{ record.mediaType }}
                  </Tag>
                </template>
                <template v-else-if="column.key === 'storageClass'">
                  <Tag :color="storageColor(record.storageClass)">{{ record.storageClass }}</Tag>
                </template>
                <template v-else-if="column.key === 'aiStatus'">
                  <Tag :color="aiColor(record.aiStatus)">{{ record.aiStatus }}</Tag>
                </template>
                <template v-else-if="column.key === 'syncStatus'">
                  <Tag :color="syncColor(record.syncStatus)">{{ record.syncStatus }}</Tag>
                </template>
                <template v-else-if="column.key === 'action'">
                  <Space>
                    <Button size="small" type="link" @click="openDetailFromTable(record)">详情</Button>
                    <Button size="small" type="link" @click="toDetectionFromTable(record)">送检测</Button>
                    <Button size="small" type="link" @click="toTaskFromTable(record)">关联任务</Button>
                    <Button size="small" type="link" @click="toHistoryFromTable(record)">历史回放</Button>
                    <Button size="small" type="link" @click="archiveFromTable(record)">归档</Button>
                  </Space>
                </template>
              </template>
            </Table>
          </Card>
        </Col>

        <Col :xl="8" :span="24">
          <Card :bordered="false" title="接入链路">
            <div class="flex flex-col gap-3 text-sm text-slate-600 dark:text-slate-300">
              <div class="rounded-xl border border-slate-200/70 p-4 dark:border-slate-700">
                <div class="mb-1 font-medium">自动回传</div>
                <div class="text-xs">机巢、无人机、球机采集后自动入库，适合烟火、违停、水域等实时分析。</div>
              </div>
              <div class="rounded-xl border border-slate-200/70 p-4 dark:border-slate-700">
                <div class="mb-1 font-medium">飞行影像归档</div>
                <div class="text-xs">把时空影像和飞行影像沉淀为统一数据源，供 AI 批处理与历史检索使用。</div>
              </div>
              <div class="rounded-xl border border-slate-200/70 p-4 dark:border-slate-700">
                <div class="mb-1 font-medium">本地批量上传</div>
                <div class="text-xs">支持巡查员或项目组把图片、视频批量上传到媒体库，再送往在线检测或分析任务。</div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Modal
        v-model:open="uploadOpen"
        title="本地批量上传到媒体库"
        ok-text="加入媒体库"
        @ok="submitUpload"
      >
        <Form layout="vertical" class="mt-2">
          <FormItem label="批次名称">
            <Input v-model:value="uploadForm.batchName" placeholder="例如：工地安全帽抽检_批次B" />
          </FormItem>
          <FormItem label="媒体类型">
            <Select v-model:value="uploadForm.mediaType" :options="mediaTypeOptions.filter((item) => item.value !== '全部' && item.value !== '实时流')" />
          </FormItem>
          <FormItem label="业务场景">
            <Select v-model:value="uploadForm.scene" :options="sceneOptions.filter((item) => item.value !== '全部')" />
          </FormItem>
          <FormItem label="采集位置">
            <Input v-model:value="uploadForm.location" placeholder="例如：A 工地 3 号楼" />
          </FormItem>
          <FormItem label="来源设备 / 人员">
            <Input v-model:value="uploadForm.deviceName" placeholder="例如：项目安监组" />
          </FormItem>
          <FormItem label="关联分析任务">
            <Select v-model:value="uploadForm.relationTaskName" :options="relationTaskOptions" />
          </FormItem>
          <FormItem label="文件数量">
            <Input v-model:value="uploadForm.fileCount" placeholder="例如：18" />
          </FormItem>
          <FormItem label="上传人">
            <Input v-model:value="uploadForm.uploader" />
          </FormItem>
          <FormItem label="说明">
            <Input v-model:value="uploadForm.description" placeholder="例如：等待安全帽模型检测" />
          </FormItem>
        </Form>
      </Modal>

      <Drawer
        v-model:open="detailOpen"
        :title="selectedRecord ? `媒体详情 - ${selectedRecord.name}` : '媒体详情'"
        width="560"
        placement="right"
      >
        <template v-if="selectedRecord">
          <div class="mb-4 overflow-hidden rounded-xl border border-slate-200/70 dark:border-slate-700">
            <img
              :src="previewSvg(selectedRecord.previewLabel, selectedRecord.mediaType)"
              :alt="selectedRecord.name"
              class="block w-full"
            />
          </div>

          <Descriptions :column="1" bordered size="small">
            <DescriptionsItem label="文件名称">{{ selectedRecord.name }}</DescriptionsItem>
            <DescriptionsItem label="媒体类型">
              <Tag :color="selectedRecord.mediaType === '视频' ? 'red' : selectedRecord.mediaType === '实时流' ? 'cyan' : 'blue'">
                {{ selectedRecord.mediaType }}
              </Tag>
            </DescriptionsItem>
            <DescriptionsItem label="数据来源">{{ selectedRecord.sourceType }}</DescriptionsItem>
            <DescriptionsItem label="业务场景">{{ selectedRecord.scene }}</DescriptionsItem>
            <DescriptionsItem label="采集位置">{{ selectedRecord.location }}</DescriptionsItem>
            <DescriptionsItem label="来源设备">{{ selectedRecord.deviceName }}</DescriptionsItem>
            <DescriptionsItem label="关联任务">{{ selectedRecord.relationTaskName }}</DescriptionsItem>
            <DescriptionsItem label="分辨率">{{ selectedRecord.resolution }}</DescriptionsItem>
            <DescriptionsItem label="文件大小">{{ selectedRecord.fileSize }}</DescriptionsItem>
            <DescriptionsItem label="存储等级">
              <Tag :color="storageColor(selectedRecord.storageClass)">{{ selectedRecord.storageClass }}</Tag>
            </DescriptionsItem>
            <DescriptionsItem label="AI状态">
              <Tag :color="aiColor(selectedRecord.aiStatus)">{{ selectedRecord.aiStatus }}</Tag>
            </DescriptionsItem>
            <DescriptionsItem label="同步状态">
              <Tag :color="syncColor(selectedRecord.syncStatus)">{{ selectedRecord.syncStatus }}</Tag>
            </DescriptionsItem>
            <DescriptionsItem label="采集时间">{{ selectedRecord.captureTime }}</DescriptionsItem>
            <DescriptionsItem label="上传人">{{ selectedRecord.uploader }}</DescriptionsItem>
            <DescriptionsItem label="标签">{{ selectedRecord.tags.join(' / ') }}</DescriptionsItem>
            <DescriptionsItem label="说明">{{ selectedRecord.description }}</DescriptionsItem>
          </Descriptions>

          <div class="mt-4 flex gap-2">
            <Button type="primary" @click="toDetection(selectedRecord)">送去在线检测</Button>
            <Button @click="toTask(selectedRecord)">查看关联任务</Button>
            <Button @click="toHistory(selectedRecord)">历史回放</Button>
            <Button @click="archiveRecord(selectedRecord)">归档存储</Button>
          </div>
        </template>
      </Drawer>
    </div>
  </Page>
</template>
