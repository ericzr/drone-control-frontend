const STORAGE_KEY = 'drone_ai_alert_rules_v1';

export type AiAlertRuleStatus = '运行中' | '已暂停' | '草稿';

export interface AiAlertRuleRecord {
  id: string;
  name: string;
  scene: string;
  eventType: string;
  level: string;
  targetType: string;
  triggerType: string;
  threshold: number;
  durationSec: number;
  regionName: string;
  sourceScope: string;
  relationTaskName: string;
  notifyChannels: string[];
  autoCreateWorkorder: boolean;
  status: AiAlertRuleStatus;
  hitCount: number;
  falsePositiveRate: number;
  lastTriggeredAt?: string;
  createdAt: string;
  description: string;
}

const defaultRules: AiAlertRuleRecord[] = [
  {
    id: 'rule-001',
    name: '森林烟火连续三帧告警',
    scene: '森林防火',
    eventType: '烟火',
    level: '重大',
    targetType: '烟雾 / 明火',
    triggerType: '连续命中',
    threshold: 0.72,
    durationSec: 6,
    regionName: '北坡林区 3 号防火网格',
    sourceScope: '机巢高点视频流',
    relationTaskName: '森林烟火实时巡检',
    notifyChannels: ['站内消息', '短信'],
    autoCreateWorkorder: true,
    status: '运行中',
    hitCount: 6,
    falsePositiveRate: 3,
    lastTriggeredAt: '2026-04-16 09:26:00',
    createdAt: '2026-04-15 09:08:00',
    description: '烟雾或明火连续 3 帧命中即触发重大告警，并自动创建应急工单。',
  },
  {
    id: 'rule-002',
    name: '违停超时复核规则',
    scene: '交通巡查',
    eventType: '违停',
    level: '一般',
    targetType: '机动车',
    triggerType: '区域 + 停留时长',
    threshold: 0.81,
    durationSec: 180,
    regionName: '高新一路公交站台',
    sourceScope: '固定球机 + 无人机补拍',
    relationTaskName: '高新区违停抓拍复核',
    notifyChannels: ['站内消息', 'Webhook'],
    autoCreateWorkorder: false,
    status: '运行中',
    hitCount: 14,
    falsePositiveRate: 8,
    lastTriggeredAt: '2026-04-16 09:18:00',
    createdAt: '2026-04-15 09:56:00',
    description: '车辆在禁停区域停留超过 180 秒后触发告警，优先进入人工复核。',
  },
  {
    id: 'rule-003',
    name: '光伏热斑温差阈值告警',
    scene: '光伏巡检',
    eventType: '设备异常',
    level: '较大',
    targetType: '组件热斑',
    triggerType: '温差阈值',
    threshold: 0.68,
    durationSec: 0,
    regionName: 'A03 光伏阵列',
    sourceScope: '红外飞行影像',
    relationTaskName: '光伏热斑日报分析',
    notifyChannels: ['站内消息', '邮件'],
    autoCreateWorkorder: true,
    status: '运行中',
    hitCount: 2,
    falsePositiveRate: 1,
    lastTriggeredAt: '2026-04-15 18:03:00',
    createdAt: '2026-04-15 16:18:00',
    description: '热斑温差超过阈值时触发较大告警，并直接生成疑似缺陷工单。',
  },
  {
    id: 'rule-004',
    name: '安全帽缺失即时提醒',
    scene: '安全生产',
    eventType: '设备异常',
    level: '一般',
    targetType: '施工人员',
    triggerType: '单帧命中',
    threshold: 0.86,
    durationSec: 0,
    regionName: 'A 工地 3 号楼',
    sourceScope: '球机视频 + 视频文件抽检',
    relationTaskName: '工地安全帽专项抽检',
    notifyChannels: ['站内消息'],
    autoCreateWorkorder: false,
    status: '已暂停',
    hitCount: 8,
    falsePositiveRate: 6,
    lastTriggeredAt: '2026-04-15 11:20:00',
    createdAt: '2026-04-14 15:35:00',
    description: '识别到未佩戴安全帽目标即提醒，优先交由人工确认后再派单。',
  },
];

function cloneDefaultRules() {
  return defaultRules.map((item) => ({
    ...item,
    notifyChannels: [...item.notifyChannels],
  }));
}

function readAll(): AiAlertRuleRecord[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return cloneDefaultRules();
    const parsed = JSON.parse(raw) as AiAlertRuleRecord[];
    return Array.isArray(parsed) ? parsed : cloneDefaultRules();
  } catch {
    return cloneDefaultRules();
  }
}

export function listAiAlertRules() {
  return readAll();
}

export function saveAiAlertRules(list: AiAlertRuleRecord[]) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, 100)));
}

export function appendAiAlertRule(rule: AiAlertRuleRecord) {
  const list = readAll();
  list.unshift(rule);
  saveAiAlertRules(list);
}

export function upsertAiAlertRule(rule: AiAlertRuleRecord) {
  const list = readAll();
  const index = list.findIndex((item) => item.id === rule.id);
  if (index >= 0) {
    list.splice(index, 1, rule);
  } else {
    list.unshift(rule);
  }
  saveAiAlertRules(list);
}
