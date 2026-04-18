const STORAGE_KEY = 'drone_ai_analysis_tasks_v1';

export type AiTaskStatus = '待执行' | '运行中' | '已暂停' | '已完成' | '异常';

export interface AiAnalysisTaskRecord {
  id: string;
  name: string;
  scene: string;
  sourceType: string;
  sourceName: string;
  sourceUri: string;
  modelId: string;
  modelName: string;
  spectrum: string;
  ruleName: string;
  ruleSummary: string;
  threshold: number;
  scheduleType: string;
  scheduleLabel: string;
  status: AiTaskStatus;
  priority: string;
  executor: string;
  notifyChannels: string[];
  alertsTriggered: number;
  resultCount: number;
  successRate: number;
  createdAt: string;
  lastRunAt?: string;
  nextRunAt?: string;
}

const defaultTasks: AiAnalysisTaskRecord[] = [
  {
    id: 'ai-task-001',
    name: '森林烟火实时巡检',
    scene: '森林防火',
    sourceType: '实时视频流',
    sourceName: '北坡林区 3 号高点',
    sourceUri: 'rtsp://10.10.3.21/live',
    modelId: 'fire-smoke-det',
    modelName: '烟火识别模型',
    spectrum: 'visible',
    ruleName: '连续三帧触发',
    ruleSummary: '连续 3 帧识别到烟雾或明火即生成高优告警',
    threshold: 0.72,
    scheduleType: '实时持续',
    scheduleLabel: '7x24 实时运行',
    status: '运行中',
    priority: '高',
    executor: '林草局值守专班',
    notifyChannels: ['站内消息', '短信'],
    alertsTriggered: 6,
    resultCount: 138,
    successRate: 98,
    createdAt: '2026-04-15 09:10:00',
    lastRunAt: '2026-04-16 09:26:00',
    nextRunAt: '实时持续',
  },
  {
    id: 'ai-task-002',
    name: '高新区违停抓拍复核',
    scene: '交通巡查',
    sourceType: '摄像头点位',
    sourceName: '高新一路-路口球机',
    sourceUri: 'rtsp://10.18.8.10/front',
    modelId: 'vehicle-det-v8m',
    modelName: '车辆违停检测 v8m',
    spectrum: 'visible',
    ruleName: '区域入侵 + 停留超时',
    ruleSummary: '重点路段停留超过 180 秒且位于禁停区域触发告警',
    threshold: 0.81,
    scheduleType: '周期任务',
    scheduleLabel: '每日 07:00-22:00，每 15 分钟巡检一次',
    status: '运行中',
    priority: '中',
    executor: '交管支队一大队',
    notifyChannels: ['站内消息', 'Webhook'],
    alertsTriggered: 14,
    resultCount: 286,
    successRate: 95,
    createdAt: '2026-04-15 10:00:00',
    lastRunAt: '2026-04-16 09:15:00',
    nextRunAt: '2026-04-16 09:30:00',
  },
  {
    id: 'ai-task-003',
    name: '光伏热斑日报分析',
    scene: '光伏巡检',
    sourceType: '飞行影像',
    sourceName: 'A03 园区航测影像',
    sourceUri: 'imagery://solar/A03/2026-04-15',
    modelId: 'solar-hotspot',
    modelName: '光伏热斑检测',
    spectrum: 'infrared',
    ruleName: '温差阈值告警',
    ruleSummary: '热斑温差超过 12°C 自动归为疑似缺陷工单',
    threshold: 0.68,
    scheduleType: '定时任务',
    scheduleLabel: '每日 18:00 批处理',
    status: '待执行',
    priority: '高',
    executor: '新能源巡检组',
    notifyChannels: ['站内消息', '邮件'],
    alertsTriggered: 2,
    resultCount: 45,
    successRate: 100,
    createdAt: '2026-04-15 16:20:00',
    lastRunAt: '2026-04-15 18:00:00',
    nextRunAt: '2026-04-16 18:00:00',
  },
  {
    id: 'ai-task-004',
    name: '工地安全帽专项抽检',
    scene: '安全生产',
    sourceType: '视频文件',
    sourceName: 'A 工地 3 号楼',
    sourceUri: 'oss://construction/2026-04-15/helmet.mp4',
    modelId: 'helmet-det',
    modelName: '安全帽检测',
    spectrum: 'visible',
    ruleName: '未戴安全帽即时告警',
    ruleSummary: '单帧识别到未戴安全帽目标即推送人工复核',
    threshold: 0.86,
    scheduleType: '手动触发',
    scheduleLabel: '人工触发 / 支持重复执行',
    status: '已暂停',
    priority: '中',
    executor: '住建安全科',
    notifyChannels: ['站内消息'],
    alertsTriggered: 8,
    resultCount: 71,
    successRate: 93,
    createdAt: '2026-04-14 15:40:00',
    lastRunAt: '2026-04-15 11:20:00',
    nextRunAt: '等待人工触发',
  },
];

function cloneDefaultTasks() {
  return defaultTasks.map((item) => ({ ...item, notifyChannels: [...item.notifyChannels] }));
}

function readAll(): AiAnalysisTaskRecord[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return cloneDefaultTasks();
    const parsed = JSON.parse(raw) as AiAnalysisTaskRecord[];
    return Array.isArray(parsed) ? parsed : cloneDefaultTasks();
  } catch {
    return cloneDefaultTasks();
  }
}

export function saveAiAnalysisTasks(list: AiAnalysisTaskRecord[]) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, 100)));
}

export function listAiAnalysisTasks() {
  return readAll();
}

export function appendAiAnalysisTask(task: AiAnalysisTaskRecord) {
  const list = readAll();
  list.unshift(task);
  saveAiAnalysisTasks(list);
}

export function upsertAiAnalysisTask(task: AiAnalysisTaskRecord) {
  const list = readAll();
  const index = list.findIndex((item) => item.id === task.id);
  if (index >= 0) {
    list.splice(index, 1, task);
  } else {
    list.unshift(task);
  }
  saveAiAnalysisTasks(list);
}
