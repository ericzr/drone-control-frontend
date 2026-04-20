const STORAGE_KEY = 'drone_ai_detect_history_v1';

export type AiDetectHistoryStatus = '已完成' | '检测中' | '失败';
export type AiEventLinkStatus = '未转事件' | '已转事件' | '已归档';

export interface AiDetectFrameMark {
  timeLabel: string;
  label: string;
  confidence: number;
  summary: string;
}

export interface AiDetectTargetStat {
  label: string;
  count: number;
  confidence: number;
}

export interface AiDetectHistoryRecord {
  id: string;
  detectTime: string;
  scene: string;
  taskName: string;
  sourceType: string;
  sourceName: string;
  sourceUri: string;
  mediaName: string;
  location: string;
  method: string;
  modelName: string;
  modelType: string;
  spectrum: 'visible' | 'infrared' | 'multispectral' | 'sar';
  totalTargets: number;
  categories: number;
  avgConfidence: number;
  elapsedMs: number;
  resolution: string;
  status: AiDetectHistoryStatus;
  replayReady: boolean;
  eventStatus: AiEventLinkStatus;
  eventNo?: string;
  durationLabel: string;
  segmentRange: string;
  reviewAdvice: string;
  hitTags: string[];
  targetStats: AiDetectTargetStat[];
  frameMarks: AiDetectFrameMark[];
}

const defaultHistoryRecords: AiDetectHistoryRecord[] = [
  {
    id: 'history-001',
    detectTime: '2026-04-16 09:26:18',
    scene: '森林防火',
    taskName: '森林烟火实时巡检',
    sourceType: '实时视频流',
    sourceName: '北坡林区 3 号高点',
    sourceUri: 'rtsp://10.10.3.21/live',
    mediaName: '北坡林区烟火巡检_20260416_0926.jpg',
    location: '北坡林区防火瞭望带',
    method: '摄像头识别',
    modelName: '烟火识别模型',
    modelType: '目标检测',
    spectrum: 'visible',
    totalTargets: 4,
    categories: 2,
    avgConfidence: 0.91,
    elapsedMs: 280,
    resolution: '3840×2160',
    status: '已完成',
    replayReady: true,
    eventStatus: '已转事件',
    eventNo: 'EVT-20260416-126',
    durationLabel: '00:42',
    segmentRange: '09:25:54 - 09:26:36',
    reviewAdvice: '建议优先调取相邻 2 分钟热视频片段，复核烟雾扩散方向并同步机巢喊话。',
    hitTags: ['烟雾', '林区', '高优', '自动截帧'],
    targetStats: [
      { label: '烟雾', count: 3, confidence: 0.94 },
      { label: '明火', count: 1, confidence: 0.82 },
    ],
    frameMarks: [
      { timeLabel: '00:06', label: '疑似烟点出现', confidence: 0.78, summary: '东侧山脊出现轻烟，建议提前放大复核。' },
      { timeLabel: '00:18', label: '烟雾持续扩散', confidence: 0.92, summary: '连续三帧命中，触发高优告警。' },
      { timeLabel: '00:31', label: '明火闪点', confidence: 0.82, summary: '建议联动热成像与邻近机位复核。' },
    ],
  },
  {
    id: 'history-002',
    detectTime: '2026-04-16 09:15:22',
    scene: '交通巡查',
    taskName: '高新区违停抓拍复核',
    sourceType: '摄像头点位',
    sourceName: '高新一路-路口球机',
    sourceUri: 'rtsp://10.18.8.10/front',
    mediaName: '高新一路违停球机_20260416_0915.mp4',
    location: '高新一路公交站台',
    method: '视频识别',
    modelName: '车辆违停检测 v8m',
    modelType: '目标检测',
    spectrum: 'visible',
    totalTargets: 12,
    categories: 3,
    avgConfidence: 0.84,
    elapsedMs: 8600,
    resolution: '1920×1080',
    status: '已完成',
    replayReady: true,
    eventStatus: '未转事件',
    durationLabel: '15:00',
    segmentRange: '09:00:00 - 09:15:00',
    reviewAdvice: '建议按“公交站台 + 连续停留超 180 秒”检索片段，优先输出 3 个高置信证据帧。',
    hitTags: ['违停', '公交站台', '复核待办'],
    targetStats: [
      { label: '违停车辆', count: 6, confidence: 0.86 },
      { label: '公交专用道占用', count: 3, confidence: 0.79 },
      { label: '行人聚集', count: 3, confidence: 0.73 },
    ],
    frameMarks: [
      { timeLabel: '03:20', label: '车辆进入禁停区域', confidence: 0.75, summary: '白色 SUV 驶入公交站湾。' },
      { timeLabel: '07:12', label: '停留超时', confidence: 0.88, summary: '停留时间超过规则阈值。' },
      { timeLabel: '12:45', label: '证据帧锁定', confidence: 0.9, summary: '车牌区域清晰，适合推送事件中心。' },
    ],
  },
  {
    id: 'history-003',
    detectTime: '2026-04-15 18:05:10',
    scene: '光伏巡检',
    taskName: '光伏热斑日报分析',
    sourceType: '飞行影像',
    sourceName: 'A03 园区航测影像',
    sourceUri: 'imagery://solar/A03/2026-04-15',
    mediaName: 'A03光伏园区红外航测_20260415.tiff',
    location: 'A03 光伏阵列',
    method: '图片识别',
    modelName: '光伏热斑检测',
    modelType: '异常检测',
    spectrum: 'infrared',
    totalTargets: 8,
    categories: 2,
    avgConfidence: 0.76,
    elapsedMs: 210,
    resolution: '640×480',
    status: '已完成',
    replayReady: true,
    eventStatus: '已归档',
    eventNo: 'WO-20260415-043',
    durationLabel: '单帧',
    segmentRange: '18:05:10',
    reviewAdvice: '建议查看同航线前后两次热成像结果，对温差超 12°C 的组件生成缺陷工单。',
    hitTags: ['热斑', '红外', '日报分析'],
    targetStats: [
      { label: '一级热斑', count: 3, confidence: 0.84 },
      { label: '二级热斑', count: 5, confidence: 0.71 },
    ],
    frameMarks: [
      { timeLabel: 'T0', label: '组件温差异常', confidence: 0.84, summary: 'A03-17 组串温差超阈值。' },
      { timeLabel: 'T1', label: '热斑聚类完成', confidence: 0.77, summary: '建议输出日报与工单。' },
    ],
  },
  {
    id: 'history-004',
    detectTime: '2026-04-15 11:20:00',
    scene: '安全生产',
    taskName: '工地安全帽专项抽检',
    sourceType: '图片批次',
    sourceName: 'A 工地 3 号楼',
    sourceUri: 'oss://construction/2026-04-15/helmet.zip',
    mediaName: '工地安全帽抽检_批次A.zip',
    location: 'A 工地 3 号楼',
    method: '图片识别',
    modelName: '安全帽检测',
    modelType: '目标检测',
    spectrum: 'visible',
    totalTargets: 23,
    categories: 2,
    avgConfidence: 0.88,
    elapsedMs: 1240,
    resolution: '4032×3024',
    status: '已完成',
    replayReady: false,
    eventStatus: '未转事件',
    durationLabel: '18 张图片',
    segmentRange: '2026-04-15 11:10 - 11:20',
    reviewAdvice: '建议按楼栋和班组快速过滤未佩戴安全帽人员，输出现场整改清单。',
    hitTags: ['安全帽', '批量抽检', '待整改'],
    targetStats: [
      { label: '未戴安全帽', count: 5, confidence: 0.91 },
      { label: '佩戴规范', count: 18, confidence: 0.93 },
    ],
    frameMarks: [
      { timeLabel: 'IMG-03', label: '吊装区域违规', confidence: 0.94, summary: '吊装作业区发现 2 名未佩戴人员。' },
      { timeLabel: 'IMG-11', label: '高处作业违规', confidence: 0.89, summary: '建议立即派单整改并复查。' },
    ],
  },
  {
    id: 'history-005',
    detectTime: '2026-04-15 10:45:00',
    scene: '水域监测',
    taskName: '渭河多光谱污染筛查',
    sourceType: '飞行影像',
    sourceName: '渭河 K12 巡检航线',
    sourceUri: 'imagery://water/K12/2026-04-15',
    mediaName: '渭河K12多光谱巡检_20260415.avi',
    location: '渭河 K12 段',
    method: '视频识别',
    modelName: '水体污染识别',
    modelType: '图像分类',
    spectrum: 'multispectral',
    totalTargets: 3,
    categories: 1,
    avgConfidence: 0.68,
    elapsedMs: 12300,
    resolution: '2048×1536',
    status: '检测中',
    replayReady: true,
    eventStatus: '未转事件',
    durationLabel: '08:30',
    segmentRange: '10:41:00 - 10:49:30',
    reviewAdvice: '建议叠加上游断面历史趋势，对异常水色片段做二次复核后再转入事件。',
    hitTags: ['多光谱', '水色异常', '待复核'],
    targetStats: [{ label: '疑似污染区', count: 3, confidence: 0.68 }],
    frameMarks: [
      { timeLabel: '01:25', label: '水色异常片段', confidence: 0.64, summary: '近岸带出现异常反射带。' },
      { timeLabel: '05:40', label: '多光谱分层比对', confidence: 0.7, summary: '建议联动人工复核和采样任务。' },
    ],
  },
  {
    id: 'history-006',
    detectTime: '2026-04-12 16:00:00',
    scene: '森林防火',
    taskName: '森林烟火实时巡检',
    sourceType: '摄像头点位',
    sourceName: '北坡林区 1 号高点',
    sourceUri: 'rtsp://192.168.1.101:554/live',
    mediaName: '林区固定点位回看',
    location: '北坡林区北侧山脊',
    method: '摄像头识别',
    modelName: '无人机小目标检测 v11s',
    modelType: '目标检测',
    spectrum: 'visible',
    totalTargets: 0,
    categories: 0,
    avgConfidence: 0,
    elapsedMs: 0,
    resolution: '1920×1080',
    status: '失败',
    replayReady: false,
    eventStatus: '未转事件',
    durationLabel: '回看失败',
    segmentRange: '16:00:00',
    reviewAdvice: '该路视频流回看失败，建议先排查网络连通性与边缘节点缓存。',
    hitTags: ['链路异常', '失败记录'],
    targetStats: [],
    frameMarks: [],
  },
];

function cloneDefaults() {
  return defaultHistoryRecords.map((item) => ({
    ...item,
    hitTags: [...item.hitTags],
    targetStats: item.targetStats.map((target) => ({ ...target })),
    frameMarks: item.frameMarks.map((frame) => ({ ...frame })),
  }));
}

function readAll(): AiDetectHistoryRecord[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return cloneDefaults();
    const parsed = JSON.parse(raw) as AiDetectHistoryRecord[];
    return Array.isArray(parsed) ? parsed : cloneDefaults();
  } catch {
    return cloneDefaults();
  }
}

export function listAiDetectHistoryRecords() {
  return readAll();
}

export function saveAiDetectHistoryRecords(list: AiDetectHistoryRecord[]) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, 200)));
}

export function upsertAiDetectHistoryRecord(record: AiDetectHistoryRecord) {
  const list = readAll();
  const index = list.findIndex((item) => item.id === record.id);
  if (index >= 0) {
    list.splice(index, 1, record);
  } else {
    list.unshift(record);
  }
  saveAiDetectHistoryRecords(list);
}
