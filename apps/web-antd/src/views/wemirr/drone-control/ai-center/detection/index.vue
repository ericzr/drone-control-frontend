<script lang="ts" setup name="AiDetectionPage">
import { Page } from '@vben/common-ui';

import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

import {
  Button,
  Card,
  Col,
  Divider,
  Input,
  Progress,
  Row,
  Select,
  SelectOption,
  Slider,
  Space,
  Statistic,
  Table,
  Tabs,
  TabPane,
  Tag,
  Upload,
  message,
} from 'ant-design-vue';

const router = useRouter();
const activeTab = ref('image');

const modelOptions = [
  { value: 'drone-det-v11s', label: '无人机小目标检测 v11s', spectrum: 'visible', scene: 'city-admin' },
  { value: 'vehicle-det-v8m', label: '车辆违停检测 v8m', spectrum: 'visible', scene: 'traffic' },
  { value: 'fire-smoke-det', label: '烟火识别模型', spectrum: 'visible', scene: 'forest-fire' },
  { value: 'solar-hotspot', label: '光伏热斑检测', spectrum: 'infrared', scene: 'solar' },
  { value: 'water-pollution', label: '水体污染识别', spectrum: 'multispectral', scene: 'water' },
  { value: 'road-damage-seg', label: '路面损伤分割', spectrum: 'visible', scene: 'city-admin' },
  { value: 'helmet-det', label: '安全帽检测', spectrum: 'visible', scene: 'construction' },
  { value: 'license-plate-ocr', label: '车牌识别 OCR', spectrum: 'visible', scene: 'traffic' },
];

const selectedModel = ref('drone-det-v11s');
const selectedSpectrum = ref('all');
const confidence = ref(0.45);

const spectrumOptions = [
  { value: 'all', label: '全部光谱' },
  { value: 'visible', label: '可见光（RGB）' },
  { value: 'infrared', label: '红外热成像' },
  { value: 'multispectral', label: '多光谱' },
];

const filteredModels = computed(() => {
  if (selectedSpectrum.value === 'all') return modelOptions;
  return modelOptions.filter((m) => m.spectrum === selectedSpectrum.value);
});

// ===== Image Detection =====
const imageUploaded = ref(false);
const imageDetecting = ref(false);
const imageDetected = ref(false);
const imageFileName = ref('');

const imageResult = ref({
  totalTargets: 0,
  categories: 0,
  avgConfidence: 0,
  maxConfidence: 0,
  detailList: [] as { category: string; count: number; pct: string }[],
  elapsedMs: 0,
});

function handleImageUpload(info: any) {
  const file = info.file?.originFileObj || info.file;
  if (file) {
    imageFileName.value = file.name || 'uploaded_image.jpg';
    imageUploaded.value = true;
    imageDetected.value = false;
    message.success(`已选择图片: ${imageFileName.value}`);
  }
}

function startImageDetect() {
  if (!imageUploaded.value) {
    message.warning('请先上传图片');
    return;
  }
  imageDetecting.value = true;
  imageDetected.value = false;

  setTimeout(() => {
    const mockResults: Record<string, { totalTargets: number; categories: number; avgConfidence: number; maxConfidence: number; detailList: { category: string; count: number; pct: string }[]; elapsedMs: number }> = {
      'drone-det-v11s': {
        totalTargets: 55, categories: 4, avgConfidence: 0.5924, maxConfidence: 0.8819,
        detailList: [
          { category: '小汽车', count: 40, pct: '72.7%' },
          { category: '卡车', count: 11, pct: '20.0%' },
          { category: '面包车', count: 3, pct: '5.5%' },
          { category: '摩托车', count: 1, pct: '1.8%' },
        ],
        elapsedMs: 173,
      },
      'vehicle-det-v8m': {
        totalTargets: 12, categories: 3, avgConfidence: 0.8312, maxConfidence: 0.9543,
        detailList: [
          { category: '违停车辆', count: 8, pct: '66.7%' },
          { category: '正常停车', count: 3, pct: '25.0%' },
          { category: '临时停车', count: 1, pct: '8.3%' },
        ],
        elapsedMs: 86,
      },
      'fire-smoke-det': {
        totalTargets: 3, categories: 2, avgConfidence: 0.9150, maxConfidence: 0.9720,
        detailList: [
          { category: '烟雾', count: 2, pct: '66.7%' },
          { category: '明火', count: 1, pct: '33.3%' },
        ],
        elapsedMs: 45,
      },
    };
    imageResult.value = mockResults[selectedModel.value] || {
      totalTargets: 8, categories: 2, avgConfidence: 0.7856, maxConfidence: 0.9213,
      detailList: [
        { category: '目标A', count: 5, pct: '62.5%' },
        { category: '目标B', count: 3, pct: '37.5%' },
      ],
      elapsedMs: 120,
    };
    imageDetecting.value = false;
    imageDetected.value = true;
    message.success(`检测完成！共检测到 ${imageResult.value.totalTargets} 个目标`);
  }, 1500);
}

function exportImageResult() {
  message.success('检测结果已导出为 CSV');
}

function exportAnnotatedImage() {
  message.success('标注图片已导出');
}

function clearImageResult() {
  imageUploaded.value = false;
  imageDetected.value = false;
  imageFileName.value = '';
  imageResult.value = { totalTargets: 0, categories: 0, avgConfidence: 0, maxConfidence: 0, detailList: [], elapsedMs: 0 };
}

const imageDetailColumns = [
  { title: '#', dataIndex: 'index', key: 'index', width: 50 },
  { title: '类别', dataIndex: 'category', key: 'category' },
  { title: '数量', dataIndex: 'count', key: 'count', width: 80 },
  { title: '占比', dataIndex: 'pct', key: 'pct', width: 80 },
];

// ===== Video Detection =====
const videoUploaded = ref(false);
const videoDetecting = ref(false);
const videoDetected = ref(false);
const videoFileName = ref('');
const videoProgress = ref(0);
let videoTimer: number | undefined;

const videoResult = ref({
  totalFrames: 0,
  processedFrames: 0,
  totalTargets: 0,
  avgTargetsPerFrame: 0,
  elapsedSec: 0,
  frameResults: [] as { frame: number; targets: number; topCategory: string; maxConf: number }[],
});

function handleVideoUpload(info: any) {
  const file = info.file?.originFileObj || info.file;
  if (file) {
    videoFileName.value = file.name || 'uploaded_video.mp4';
    videoUploaded.value = true;
    videoDetected.value = false;
    videoProgress.value = 0;
    message.success(`已选择视频: ${videoFileName.value}`);
  }
}

function startVideoDetect() {
  if (!videoUploaded.value) {
    message.warning('请先上传视频');
    return;
  }
  videoDetecting.value = true;
  videoDetected.value = false;
  videoProgress.value = 0;

  const totalFrames = 120;
  let current = 0;
  const frameResults: typeof videoResult.value.frameResults = [];

  videoTimer = window.setInterval(() => {
    current += 4;
    if (current > totalFrames) current = totalFrames;
    videoProgress.value = Math.round((current / totalFrames) * 100);

    if (current % 20 === 0) {
      const targets = Math.floor(Math.random() * 15) + 5;
      const categories = ['小汽车', '行人', '卡车', '自行车', '烟雾', '违停'];
      frameResults.push({
        frame: current,
        targets,
        topCategory: categories[Math.floor(Math.random() * categories.length)]!,
        maxConf: Number((0.7 + Math.random() * 0.25).toFixed(3)),
      });
    }

    if (current >= totalFrames) {
      clearInterval(videoTimer);
      const allTargets = frameResults.reduce((s, f) => s + f.targets, 0);
      videoResult.value = {
        totalFrames,
        processedFrames: totalFrames,
        totalTargets: allTargets,
        avgTargetsPerFrame: Number((allTargets / frameResults.length).toFixed(1)),
        elapsedSec: 8.5,
        frameResults,
      };
      videoDetecting.value = false;
      videoDetected.value = true;
      message.success(`视频检测完成！共处理 ${totalFrames} 帧`);
    }
  }, 100);
}

function stopVideoDetect() {
  if (videoTimer) clearInterval(videoTimer);
  videoDetecting.value = false;
  message.info('视频检测已停止');
}

const videoFrameColumns = [
  { title: '帧号', dataIndex: 'frame', key: 'frame', width: 70 },
  { title: '目标数', dataIndex: 'targets', key: 'targets', width: 80 },
  { title: '主要类别', dataIndex: 'topCategory', key: 'topCategory' },
  { title: '最高置信度', dataIndex: 'maxConf', key: 'maxConf', width: 110 },
];

// ===== Camera / Stream Detection =====
const cameraConnected = ref(false);
const cameraDetecting = ref(false);
const rtspUrl = ref('');
const cameraSource = ref('rtsp');

const presetCameras = [
  { label: '机巢 NB-001 摄像头', value: 'rtsp://192.168.1.101:554/live' },
  { label: '机巢 NB-002 摄像头', value: 'rtsp://192.168.1.102:554/live' },
  { label: '塔杆 TP-003 球机', value: 'rtsp://192.168.1.103:554/live' },
  { label: '无人车 RV-001 前视', value: 'rtsp://192.168.2.10:554/front' },
];

const cameraStats = ref({
  fps: 0,
  latency: 0,
  totalDetected: 0,
  currentTargets: 0,
  runningTime: '00:00:00',
});

let cameraTimer: number | undefined;
let cameraSeconds = 0;

function connectCamera() {
  if (!rtspUrl.value) {
    message.warning('请输入或选择摄像头地址');
    return;
  }
  cameraConnected.value = true;
  message.success('摄像头已连接');
}

function startCameraDetect() {
  if (!cameraConnected.value) {
    message.warning('请先连接摄像头');
    return;
  }
  cameraDetecting.value = true;
  cameraSeconds = 0;

  cameraTimer = window.setInterval(() => {
    cameraSeconds++;
    const h = String(Math.floor(cameraSeconds / 3600)).padStart(2, '0');
    const m = String(Math.floor((cameraSeconds % 3600) / 60)).padStart(2, '0');
    const s = String(cameraSeconds % 60).padStart(2, '0');
    const currentTargets = Math.floor(Math.random() * 8) + 2;
    cameraStats.value = {
      fps: 25 + Math.floor(Math.random() * 5),
      latency: 12 + Math.floor(Math.random() * 8),
      totalDetected: cameraStats.value.totalDetected + currentTargets,
      currentTargets,
      runningTime: `${h}:${m}:${s}`,
    };
  }, 1000);

  message.success('实时检测已启动');
}

function stopCameraDetect() {
  if (cameraTimer) clearInterval(cameraTimer);
  cameraDetecting.value = false;
  message.info('实时检测已停止');
}

function disconnectCamera() {
  stopCameraDetect();
  cameraConnected.value = false;
  cameraStats.value = { fps: 0, latency: 0, totalDetected: 0, currentTargets: 0, runningTime: '00:00:00' };
  cameraSeconds = 0;
  message.info('摄像头已断开');
}

function saveToHistory() {
  message.success('检测结果已保存到检测历史');
  router.push('/ai-center/detect-history');
}

function goTaskCenter() {
  router.push('/ai-center/task');
}

function spectrumColor(s: string) {
  if (s === 'visible') return '#1677ff';
  if (s === 'infrared') return '#ef4444';
  if (s === 'multispectral') return '#8b5cf6';
  return '#6b7280';
}

function spectrumLabel(s: string) {
  if (s === 'visible') return '可见光';
  if (s === 'infrared') return '红外';
  if (s === 'multispectral') return '多光谱';
  if (s === 'sar') return 'SAR';
  return s;
}
</script>

<template>
  <Page>
    <div class="flex flex-col gap-4 p-2">
      <!-- Model & Params Bar -->
      <Card :bordered="false">
        <div class="flex items-center gap-4 flex-wrap">
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium whitespace-nowrap">光谱类型</span>
            <Select v-model:value="selectedSpectrum" style="width: 150px" size="small">
              <SelectOption v-for="s in spectrumOptions" :key="s.value" :value="s.value">{{ s.label }}</SelectOption>
            </Select>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium whitespace-nowrap">检测模型</span>
            <Select v-model:value="selectedModel" style="width: 240px" size="small" show-search option-filter-prop="label">
              <SelectOption v-for="m in filteredModels" :key="m.value" :value="m.value" :label="m.label">
                <div class="flex items-center gap-2">
                  <span>{{ m.label }}</span>
                  <Tag :color="spectrumColor(m.spectrum)" size="small" :bordered="false">{{ spectrumLabel(m.spectrum) }}</Tag>
                </div>
              </SelectOption>
            </Select>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium whitespace-nowrap">置信度阈值</span>
            <Slider v-model:value="confidence" :min="0.1" :max="0.95" :step="0.05" style="width: 140px" />
            <span class="text-xs tabular-nums" style="color: var(--ant-color-text-tertiary); width: 36px">{{ confidence.toFixed(2) }}</span>
          </div>
          <div class="ml-auto flex items-center gap-2">
            <Button size="small" @click="router.push('/ai-center/data-source')">数据源管理</Button>
            <Button size="small" @click="router.push('/ai-center/detect-history')">检测历史</Button>
            <Button size="small" type="primary" @click="goTaskCenter">分析任务</Button>
          </div>
        </div>
      </Card>

      <!-- Detection Tabs -->
      <Tabs v-model:activeKey="activeTab" type="card">
        <!-- ===== Image Detection ===== -->
        <TabPane key="image" tab="图片识别">
          <Row :gutter="[16, 16]">
            <Col :lg="12" :span="24">
              <Card :bordered="false" title="图片预览">
                <template #extra>
                  <Space>
                    <Upload :show-upload-list="false" :before-upload="() => false" @change="handleImageUpload" accept="image/*">
                      <Button size="small" type="primary">打开图片</Button>
                    </Upload>
                    <Button size="small" :loading="imageDetecting" :disabled="!imageUploaded" @click="startImageDetect">开始检测</Button>
                    <Button size="small" :disabled="!imageDetected" @click="exportAnnotatedImage">导出图片</Button>
                    <Button size="small" :disabled="!imageDetected" @click="exportImageResult">导出CSV</Button>
                    <Button size="small" @click="clearImageResult">清除</Button>
                  </Space>
                </template>

                <div class="detect-preview">
                  <div v-if="!imageUploaded" class="detect-preview__empty">
                    <div class="text-4xl mb-2" style="color: var(--ant-color-text-quaternary)">🖼️</div>
                    <div style="color: var(--ant-color-text-tertiary)">支持 JPG/PNG/BMP 格式，上传图片后点击开始检测</div>
                  </div>
                  <div v-else class="detect-preview__img">
                    <div class="detect-preview__placeholder">
                      <div class="text-lg font-medium mb-1">{{ imageFileName }}</div>
                      <div class="text-xs" style="color: var(--ant-color-text-tertiary)">分辨率: 1360×766 · 大小: 173.1 KB</div>
                      <div v-if="imageDetected" class="detect-preview__overlay">
                        <div v-for="i in Math.min(imageResult.totalTargets, 12)" :key="i" class="detect-bbox" :style="{
                          top: `${10 + Math.random() * 60}%`,
                          left: `${5 + Math.random() * 60}%`,
                          width: `${8 + Math.random() * 15}%`,
                          height: `${8 + Math.random() * 20}%`,
                        }">
                          <span class="detect-bbox__label">{{ imageResult.detailList[i % imageResult.detailList.length]?.category }} {{ (confidence + Math.random() * 0.3).toFixed(2) }}</span>
                        </div>
                      </div>
                    </div>
                    <div v-if="imageDetecting" class="detect-preview__loading">
                      <Progress type="circle" :percent="75" :size="64" status="active" />
                      <div class="mt-2 text-sm">检测中...</div>
                    </div>
                  </div>
                </div>
                <div v-if="imageUploaded" class="mt-2 text-xs text-center" style="color: var(--ant-color-text-tertiary)">
                  文件: {{ imageFileName }} · 分辨率: 1360×766 · 大小: 173.1 KB
                </div>
              </Card>
            </Col>

            <Col :lg="12" :span="24">
              <Card :bordered="false" title="识别结果">
                <template #extra>
                  <Tabs size="small" :active-key="imageDetected ? 'stats' : 'stats'" style="margin: -12px 0">
                    <TabPane key="stats" tab="统计摘要" />
                    <TabPane key="detail" tab="详细数据" />
                    <TabPane key="conf" tab="置信度分布" />
                  </Tabs>
                </template>

                <div v-if="!imageDetected" class="text-center py-12" style="color: var(--ant-color-text-tertiary)">
                  上传图片并点击"开始检测"后查看识别结果
                </div>

                <template v-else>
                  <Row :gutter="[12, 12]">
                    <Col :span="6">
                      <Card size="small" :bordered="false" class="stat-mini">
                        <Statistic title="总目标数" :value="imageResult.totalTargets" :value-style="{ fontSize: '24px', fontWeight: 800 }" />
                      </Card>
                    </Col>
                    <Col :span="6">
                      <Card size="small" :bordered="false" class="stat-mini">
                        <Statistic title="类别数" :value="imageResult.categories" :value-style="{ fontSize: '24px', fontWeight: 800 }" />
                      </Card>
                    </Col>
                    <Col :span="6">
                      <Card size="small" :bordered="false" class="stat-mini">
                        <Statistic title="平均置信度" :value="imageResult.avgConfidence" :precision="4" :value-style="{ fontSize: '24px', fontWeight: 800 }" />
                      </Card>
                    </Col>
                    <Col :span="6">
                      <Card size="small" :bordered="false" class="stat-mini">
                        <Statistic title="最高置信度" :value="imageResult.maxConfidence" :precision="4" :value-style="{ fontSize: '24px', fontWeight: 800 }" />
                      </Card>
                    </Col>
                  </Row>

                  <Divider style="margin: 12px 0" />
                  <div class="text-sm font-medium mb-2">各类别检测数量</div>
                  <Table :columns="imageDetailColumns" :data-source="imageResult.detailList.map((d, i) => ({ ...d, index: i + 1 }))" :pagination="false" size="small" row-key="category" />

                  <div class="mt-4 p-3 rounded-lg" style="background: var(--ant-color-success-bg)">
                    <div class="text-center">
                      <span class="text-lg font-bold" style="color: var(--ant-color-success)">✓ 检测完成</span>
                    </div>
                    <div class="text-center mt-1 text-sm" style="color: var(--ant-color-text-secondary)">
                      共检测到 {{ imageResult.totalTargets }} 个目标 · {{ imageResult.categories }} 个类别 · 平均置信度 {{ imageResult.avgConfidence.toFixed(4) }}
                    </div>
                  </div>

                  <div class="mt-3 flex justify-end gap-2">
                    <Button size="small" @click="saveToHistory">保存到历史</Button>
                    <Button size="small" type="primary" @click="message.info('转事件功能已触发')">转为事件</Button>
                  </div>
                </template>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <!-- ===== Video Detection ===== -->
        <TabPane key="video" tab="视频识别">
          <Row :gutter="[16, 16]">
            <Col :lg="14" :span="24">
              <Card :bordered="false" title="视频检测">
                <template #extra>
                  <Space>
                    <Upload :show-upload-list="false" :before-upload="() => false" @change="handleVideoUpload" accept="video/*">
                      <Button size="small" type="primary">选择视频</Button>
                    </Upload>
                    <Button v-if="!videoDetecting" size="small" :disabled="!videoUploaded" @click="startVideoDetect">开始检测</Button>
                    <Button v-else size="small" danger @click="stopVideoDetect">停止</Button>
                  </Space>
                </template>

                <div class="detect-preview">
                  <div v-if="!videoUploaded" class="detect-preview__empty">
                    <div class="text-4xl mb-2" style="color: var(--ant-color-text-quaternary)">🎬</div>
                    <div style="color: var(--ant-color-text-tertiary)">支持 MP4/AVI/MOV 格式，上传后逐帧检测</div>
                  </div>
                  <div v-else class="detect-preview__placeholder">
                    <div class="text-lg font-medium mb-1">{{ videoFileName }}</div>
                    <div v-if="videoDetecting || videoDetected" class="mt-3 w-full px-4">
                      <Progress :percent="videoProgress" :status="videoDetecting ? 'active' : 'success'" />
                    </div>
                  </div>
                </div>

                <div v-if="videoDetected" class="mt-4">
                  <Row :gutter="[12, 12]">
                    <Col :span="6"><Card size="small" :bordered="false" class="stat-mini"><Statistic title="总帧数" :value="videoResult.totalFrames" /></Card></Col>
                    <Col :span="6"><Card size="small" :bordered="false" class="stat-mini"><Statistic title="总目标" :value="videoResult.totalTargets" /></Card></Col>
                    <Col :span="6"><Card size="small" :bordered="false" class="stat-mini"><Statistic title="平均/帧" :value="videoResult.avgTargetsPerFrame" /></Card></Col>
                    <Col :span="6"><Card size="small" :bordered="false" class="stat-mini"><Statistic title="用时(s)" :value="videoResult.elapsedSec" /></Card></Col>
                  </Row>
                </div>
              </Card>
            </Col>
            <Col :lg="10" :span="24">
              <Card :bordered="false" title="帧级检测结果">
                <div v-if="!videoDetected && !videoDetecting" class="text-center py-12" style="color: var(--ant-color-text-tertiary)">
                  视频检测完成后展示逐帧结果
                </div>
                <Table v-else :columns="videoFrameColumns" :data-source="videoResult.frameResults" :pagination="{ pageSize: 5 }" size="small" row-key="frame">
                  <template #bodyCell="{ column, record }">
                    <template v-if="column.key === 'maxConf'">
                      <Tag :color="record.maxConf >= 0.85 ? 'green' : record.maxConf >= 0.7 ? 'blue' : 'orange'" size="small">{{ record.maxConf }}</Tag>
                    </template>
                  </template>
                </Table>
                <div v-if="videoDetected" class="mt-3 flex justify-end gap-2">
                  <Button size="small" @click="saveToHistory">保存到历史</Button>
                </div>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <!-- ===== Camera / Stream Detection ===== -->
        <TabPane key="camera" tab="摄像头识别">
          <Row :gutter="[16, 16]">
            <Col :lg="14" :span="24">
              <Card :bordered="false" title="实时视频流">
                <template #extra>
                  <Space>
                    <Button v-if="!cameraConnected" size="small" type="primary" @click="connectCamera">连接</Button>
                    <Button v-else size="small" danger @click="disconnectCamera">断开</Button>
                    <Button v-if="cameraConnected && !cameraDetecting" size="small" @click="startCameraDetect">启动检测</Button>
                    <Button v-if="cameraDetecting" size="small" danger @click="stopCameraDetect">停止检测</Button>
                  </Space>
                </template>

                <div class="flex items-center gap-3 mb-4">
                  <Select v-model:value="cameraSource" style="width: 120px" size="small">
                    <SelectOption value="rtsp">RTSP 流</SelectOption>
                    <SelectOption value="preset">预设摄像头</SelectOption>
                  </Select>
                  <template v-if="cameraSource === 'rtsp'">
                    <Input v-model:value="rtspUrl" placeholder="rtsp://192.168.1.x:554/live" style="flex: 1" size="small" />
                  </template>
                  <template v-else>
                    <Select v-model:value="rtspUrl" placeholder="选择摄像头" style="flex: 1" size="small">
                      <SelectOption v-for="cam in presetCameras" :key="cam.value" :value="cam.value">{{ cam.label }}</SelectOption>
                    </Select>
                  </template>
                </div>

                <div class="detect-preview detect-preview--stream">
                  <div v-if="!cameraConnected" class="detect-preview__empty">
                    <div class="text-4xl mb-2" style="color: var(--ant-color-text-quaternary)">📷</div>
                    <div style="color: var(--ant-color-text-tertiary)">输入 RTSP 地址或选择预设摄像头后点击"连接"</div>
                  </div>
                  <div v-else class="detect-preview__placeholder stream-active">
                    <div class="stream-indicator">
                      <span class="stream-dot" :class="{ 'stream-dot--active': cameraDetecting }" />
                      <span>{{ cameraDetecting ? 'LIVE · 检测中' : 'LIVE · 已连接' }}</span>
                    </div>
                    <div class="text-lg font-medium">{{ rtspUrl }}</div>
                    <div v-if="cameraDetecting" class="mt-2 text-sm" style="color: var(--ant-color-text-secondary)">
                      当前帧目标数: <span class="font-bold">{{ cameraStats.currentTargets }}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
            <Col :lg="10" :span="24">
              <Card :bordered="false" title="实时统计">
                <Row :gutter="[12, 12]">
                  <Col :span="12">
                    <Card size="small" :bordered="false" class="stat-mini">
                      <Statistic title="帧率 (FPS)" :value="cameraStats.fps" :value-style="{ color: cameraDetecting ? '#52c41a' : undefined }" />
                    </Card>
                  </Col>
                  <Col :span="12">
                    <Card size="small" :bordered="false" class="stat-mini">
                      <Statistic title="延迟 (ms)" :value="cameraStats.latency" />
                    </Card>
                  </Col>
                  <Col :span="12">
                    <Card size="small" :bordered="false" class="stat-mini">
                      <Statistic title="累计检测" :value="cameraStats.totalDetected" />
                    </Card>
                  </Col>
                  <Col :span="12">
                    <Card size="small" :bordered="false" class="stat-mini">
                      <Statistic title="当前目标" :value="cameraStats.currentTargets" />
                    </Card>
                  </Col>
                </Row>
                <div class="mt-4 p-3 rounded-lg text-center" style="background: var(--ant-color-bg-layout)">
                  <div class="text-xs" style="color: var(--ant-color-text-tertiary)">运行时间</div>
                  <div class="text-2xl font-mono font-bold tabular-nums mt-1">{{ cameraStats.runningTime }}</div>
                </div>
                <div v-if="cameraDetecting" class="mt-3 flex justify-end gap-2">
                  <Button size="small" @click="saveToHistory">保存到历史</Button>
                </div>
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>
    </div>
  </Page>
</template>

<style lang="less" scoped>
.detect-preview {
  position: relative;
  min-height: 280px;
  border-radius: 12px;
  border: 1px dashed var(--ant-color-border);
  background: var(--ant-color-bg-layout);
  overflow: hidden;
}

.detect-preview--stream {
  min-height: 240px;
}

.detect-preview__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 280px;
}

.detect-preview__img {
  position: relative;
  min-height: 280px;
}

.detect-preview__placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 280px;
  position: relative;
  background: linear-gradient(135deg, rgba(59,130,246,0.03) 0%, rgba(139,92,246,0.03) 100%);
}

.detect-preview__overlay {
  position: absolute;
  inset: 0;
}

.detect-preview__loading {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(4px);
}

.detect-bbox {
  position: absolute;
  border: 2px solid #00e5ff;
  border-radius: 2px;
}

.detect-bbox__label {
  position: absolute;
  top: -18px;
  left: 0;
  background: #00e5ff;
  color: #000;
  font-size: 10px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 2px;
  white-space: nowrap;
}

.stat-mini {
  text-align: center;
  background: var(--ant-color-bg-layout);
}

.stream-active {
  background: linear-gradient(135deg, rgba(16,185,129,0.05) 0%, rgba(59,130,246,0.05) 100%);
}

.stream-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: var(--ant-color-text-secondary);
  margin-bottom: 8px;
}

.stream-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #6b7280;
}

.stream-dot--active {
  background: #ef4444;
  box-shadow: 0 0 6px rgba(239, 68, 68, 0.6);
  animation: stream-blink 1.2s ease-in-out infinite;
}

@keyframes stream-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
</style>
