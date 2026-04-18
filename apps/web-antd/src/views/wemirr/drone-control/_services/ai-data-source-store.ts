const STORAGE_KEY = 'drone_ai_data_sources_v1';

export type AiDataSourceType =
  | '实时视频流'
  | '摄像头点位'
  | '飞行影像'
  | '视频文件'
  | '图片批次';

export type AiDataSourceStatus = '在线' | '离线' | '待接入';

export interface AiDataSourceRecord {
  id: string;
  name: string;
  sourceType: AiDataSourceType;
  scene: string;
  protocol: string;
  uri: string;
  location: string;
  owner: string;
  deviceName: string;
  streamProfile: string;
  storagePolicy: string;
  onlineStatus: AiDataSourceStatus;
  enabled: boolean;
  bindTaskCount: number;
  bindRuleCount: number;
  lastSyncAt: string;
  latencyMs: number;
  description: string;
  tags: string[];
}

const defaultSources: AiDataSourceRecord[] = [
  {
    id: 'source-001',
    name: '北坡林区 3 号高点',
    sourceType: '实时视频流',
    scene: '森林防火',
    protocol: 'RTSP',
    uri: 'rtsp://10.10.3.21/live',
    location: '北坡林区防火网格',
    owner: '林草局值守专班',
    deviceName: '机巢 NB-001 / M30T-01',
    streamProfile: '主码流 3840×2160 / 25fps',
    storagePolicy: '命中自动截帧 + 7 天热存',
    onlineStatus: '在线',
    enabled: true,
    bindTaskCount: 1,
    bindRuleCount: 1,
    lastSyncAt: '2026-04-16 09:26:00',
    latencyMs: 42,
    description: '用于森林烟火实时巡检，支持高优告警截帧与事件复核。',
    tags: ['烟火', '高点', '实时'],
  },
  {
    id: 'source-002',
    name: '高新一路-路口球机',
    sourceType: '摄像头点位',
    scene: '交通巡查',
    protocol: 'RTSP',
    uri: 'rtsp://10.18.8.10/front',
    location: '高新一路公交站台',
    owner: '交管支队一大队',
    deviceName: '塔杆 TP-003 球机',
    streamProfile: '1080P / 20fps',
    storagePolicy: '15 分钟切片 + 30 天标准存储',
    onlineStatus: '在线',
    enabled: true,
    bindTaskCount: 1,
    bindRuleCount: 1,
    lastSyncAt: '2026-04-16 09:18:00',
    latencyMs: 55,
    description: '重点路段违停抓拍点位，供 AI 轮询和事件复核使用。',
    tags: ['违停', '固定点位', '复核'],
  },
  {
    id: 'source-003',
    name: 'A03 园区航测影像',
    sourceType: '飞行影像',
    scene: '光伏巡检',
    protocol: 'IMAGERY',
    uri: 'imagery://solar/A03/2026-04-15',
    location: 'A03 光伏阵列',
    owner: '新能源巡检组',
    deviceName: 'M30T-08',
    streamProfile: '红外正射批次 / 640×480',
    storagePolicy: '日报分析 + 工单归档',
    onlineStatus: '在线',
    enabled: true,
    bindTaskCount: 1,
    bindRuleCount: 1,
    lastSyncAt: '2026-04-15 18:03:00',
    latencyMs: 0,
    description: '承接红外飞行影像日报分析，支持热斑识别和缺陷工单。',
    tags: ['红外', '热斑', '日报'],
  },
  {
    id: 'source-004',
    name: '工地安全帽抽检批次 A',
    sourceType: '图片批次',
    scene: '安全生产',
    protocol: 'OSS',
    uri: 'oss://construction/2026-04-15/helmet.zip',
    location: 'A 工地 3 号楼',
    owner: '住建安全科',
    deviceName: '项目安监组',
    streamProfile: '18 张高清图片',
    storagePolicy: '热存 7 天 + 人工抽检保留',
    onlineStatus: '待接入',
    enabled: true,
    bindTaskCount: 1,
    bindRuleCount: 1,
    lastSyncAt: '2026-04-16 08:40:00',
    latencyMs: 0,
    description: '项目组本地上传的抽检批次，待送入安全帽检测任务。',
    tags: ['安全帽', '本地上传', '整改'],
  },
  {
    id: 'source-005',
    name: '渭河 K12 巡检航线',
    sourceType: '飞行影像',
    scene: '水域监测',
    protocol: 'IMAGERY',
    uri: 'imagery://water/K12/2026-04-15',
    location: '渭河 K12 段',
    owner: '生态环境监测队',
    deviceName: 'M350-03',
    streamProfile: '多光谱视频 / 2048×1536',
    storagePolicy: '归档 90 天 + 异常片段复核',
    onlineStatus: '离线',
    enabled: false,
    bindTaskCount: 1,
    bindRuleCount: 0,
    lastSyncAt: '2026-04-15 10:49:30',
    latencyMs: 0,
    description: '水域多光谱巡检数据，待链路恢复后重新纳入自动筛查。',
    tags: ['多光谱', '水域', '待恢复'],
  },
];

function cloneDefaults() {
  return defaultSources.map((item) => ({
    ...item,
    tags: [...item.tags],
  }));
}

function readAll(): AiDataSourceRecord[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return cloneDefaults();
    const parsed = JSON.parse(raw) as AiDataSourceRecord[];
    return Array.isArray(parsed) ? parsed : cloneDefaults();
  } catch {
    return cloneDefaults();
  }
}

export function listAiDataSources() {
  return readAll();
}

export function saveAiDataSources(list: AiDataSourceRecord[]) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, 200)));
}

export function appendAiDataSource(record: AiDataSourceRecord) {
  const list = readAll();
  list.unshift(record);
  saveAiDataSources(list);
}

export function upsertAiDataSource(record: AiDataSourceRecord) {
  const list = readAll();
  const index = list.findIndex((item) => item.id === record.id);
  if (index >= 0) {
    list.splice(index, 1, record);
  } else {
    list.unshift(record);
  }
  saveAiDataSources(list);
}
