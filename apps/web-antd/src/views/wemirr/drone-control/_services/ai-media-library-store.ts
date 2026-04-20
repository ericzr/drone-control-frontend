const STORAGE_KEY = 'drone_ai_media_library_v1';

export interface AiMediaLibraryRecord {
  id: string;
  name: string;
  mediaType: '图片' | '视频' | '实时流';
  sourceType: string;
  scene: string;
  location: string;
  deviceName: string;
  relationTaskName: string;
  resolution: string;
  fileSize: string;
  storageClass: '热存' | '标准' | '归档';
  syncStatus: '已同步' | '同步中' | '待上传';
  aiStatus: '待分析' | '已关联任务' | '已分析';
  tags: string[];
  captureTime: string;
  uploader: string;
  description: string;
  previewLabel: string;
}

const defaultMedia: AiMediaLibraryRecord[] = [
  {
    id: 'media-001',
    name: '北坡林区烟火巡检_20260416_0926.jpg',
    mediaType: '图片',
    sourceType: '自动回传',
    scene: '森林防火',
    location: '北坡林区 3 号高点',
    deviceName: '机巢 NB-001 / M30T-01',
    relationTaskName: '森林烟火实时巡检',
    resolution: '3840×2160',
    fileSize: '8.4 MB',
    storageClass: '热存',
    syncStatus: '已同步',
    aiStatus: '已分析',
    tags: ['烟雾', '林区', '高优告警'],
    captureTime: '2026-04-16 09:26:00',
    uploader: '机巢自动上传',
    description: '烟火识别任务命中后自动截帧并入库，用于事件复核和报告取证。',
    previewLabel: '烟火截帧',
  },
  {
    id: 'media-002',
    name: '高新一路违停球机_20260416_0915.mp4',
    mediaType: '视频',
    sourceType: '视频流落盘',
    scene: '交通巡查',
    location: '高新一路公交站台',
    deviceName: '球机 TP-003',
    relationTaskName: '高新区违停抓拍复核',
    resolution: '1920×1080',
    fileSize: '186 MB',
    storageClass: '标准',
    syncStatus: '已同步',
    aiStatus: '已关联任务',
    tags: ['违停', '公交站台', '复核'],
    captureTime: '2026-04-16 09:15:00',
    uploader: '边缘节点自动汇聚',
    description: '重点路口视频流按 15 分钟切片汇聚，供违停规则复核和历史回放使用。',
    previewLabel: '违停视频',
  },
  {
    id: 'media-003',
    name: 'A03光伏园区红外航测_20260415.tiff',
    mediaType: '图片',
    sourceType: '飞行影像归档',
    scene: '光伏巡检',
    location: 'A03 光伏阵列',
    deviceName: 'M30T-08',
    relationTaskName: '光伏热斑日报分析',
    resolution: '640×480',
    fileSize: '22 MB',
    storageClass: '标准',
    syncStatus: '已同步',
    aiStatus: '已分析',
    tags: ['热成像', '光伏', '热斑'],
    captureTime: '2026-04-15 18:03:00',
    uploader: '飞行任务自动归档',
    description: '红外影像与热斑规则联动，支持日报分析和缺陷工单生成。',
    previewLabel: '红外热斑',
  },
  {
    id: 'media-004',
    name: '工地安全帽抽检_批次A.zip',
    mediaType: '图片',
    sourceType: '本地批量上传',
    scene: '安全生产',
    location: 'A 工地 3 号楼',
    deviceName: '项目安监组',
    relationTaskName: '工地安全帽专项抽检',
    resolution: '4032×3024',
    fileSize: '512 MB',
    storageClass: '热存',
    syncStatus: '待上传',
    aiStatus: '待分析',
    tags: ['安全帽', '工地', '批量上传'],
    captureTime: '2026-04-16 08:40:00',
    uploader: '王安全',
    description: '本地抽检图片批量上传到媒体库，后续送交 AI 检测和规则校验。',
    previewLabel: '安全帽批次',
  },
  {
    id: 'media-005',
    name: '渭河K12多光谱巡检_20260415.avi',
    mediaType: '视频',
    sourceType: '飞行影像归档',
    scene: '水域监测',
    location: '渭河 K12 段',
    deviceName: 'M350-03',
    relationTaskName: '渭河多光谱污染筛查',
    resolution: '2048×1536',
    fileSize: '1.2 GB',
    storageClass: '归档',
    syncStatus: '已同步',
    aiStatus: '待分析',
    tags: ['多光谱', '水域', '污染筛查'],
    captureTime: '2026-04-15 10:45:00',
    uploader: '飞行任务自动归档',
    description: '多光谱视频归档后等待 AI 污染识别任务调度。',
    previewLabel: '多光谱视频',
  },
];

function cloneDefaults() {
  return defaultMedia.map((item) => ({ ...item, tags: [...item.tags] }));
}

function readAll(): AiMediaLibraryRecord[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return cloneDefaults();
    const parsed = JSON.parse(raw) as AiMediaLibraryRecord[];
    return Array.isArray(parsed) ? parsed : cloneDefaults();
  } catch {
    return cloneDefaults();
  }
}

export function listAiMediaLibrary() {
  return readAll();
}

export function saveAiMediaLibrary(list: AiMediaLibraryRecord[]) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, 200)));
}

export function appendAiMediaRecord(record: AiMediaLibraryRecord) {
  const list = readAll();
  list.unshift(record);
  saveAiMediaLibrary(list);
}

export function upsertAiMediaRecord(record: AiMediaLibraryRecord) {
  const list = readAll();
  const index = list.findIndex((item) => item.id === record.id);
  if (index >= 0) {
    list.splice(index, 1, record);
  } else {
    list.unshift(record);
  }
  saveAiMediaLibrary(list);
}
