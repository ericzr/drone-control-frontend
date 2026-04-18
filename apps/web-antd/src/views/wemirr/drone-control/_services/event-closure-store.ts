import { ref } from 'vue';

const EVENT_STORAGE_KEY = 'drone_event_closure_events_v1';
const WORKORDER_STORAGE_KEY = 'drone_event_closure_workorders_v1';
const closureStoreVersion = ref(0);

export interface EventClosureRecord {
  id: string;
  eventNo: string;
  eventType: string;
  level: '一般' | '较大' | '重大';
  scene: string;
  region: string;
  location: string;
  source: string;
  sourceDrone: string;
  confidence: number;
  status: '待复核' | '已确认' | '已派单' | '处置中' | '已闭环' | '误报';
  description: string;
  eventTime: string;
  createTime: string;
  reviewer?: string;
  reviewResult?: string;
  reviewRemark?: string;
  reviewTime?: string;
  relatedWorkorderId?: string;
}

export interface WorkorderLog {
  time: string;
  action: string;
  user: string;
  note?: string;
}

export interface WorkorderEvidence {
  id: string;
  title: string;
  type: '图片' | '视频' | '文本';
  uploadedBy: string;
  uploadedAt: string;
  summary: string;
}

export interface EventWorkorderRecord {
  id: string;
  title: string;
  eventId: string;
  type: string;
  level: string;
  source: 'AI' | '人工' | '举报';
  priority: '一级' | '二级' | '三级';
  status: number;
  location: string;
  assignee: string;
  creator: string;
  createTime: string;
  deadline: string;
  description: string;
  closureSummary?: string;
  evidences: WorkorderEvidence[];
  logs: WorkorderLog[];
}

const defaultEvents: EventClosureRecord[] = [
  {
    id: '1',
    eventNo: 'EVT-20260413-001',
    eventType: '违停',
    level: '一般',
    scene: '交通巡查',
    region: '高新区北片',
    location: '高新路与科技路交叉口',
    source: 'AI识别',
    sourceDrone: '大航蜂 M300-01',
    confidence: 96,
    status: '已派单',
    description: '白色轿车违停占用公交站台',
    eventTime: '2026-04-13 14:31:00',
    createTime: '2026-04-13 14:31:02',
    reviewer: '张指挥',
    reviewResult: '确认有效',
    reviewRemark: '确认违停，已转派交管局',
    reviewTime: '2026-04-13 14:45:00',
    relatedWorkorderId: 'WO-20260413-002',
  },
  {
    id: '2',
    eventNo: 'EVT-20260413-002',
    eventType: '占道经营',
    level: '一般',
    scene: '城管巡检',
    region: '城管巡检区',
    location: '朝阳路步行街入口',
    source: 'AI识别',
    sourceDrone: '大航蜂 M300-07',
    confidence: 89,
    status: '待复核',
    description: '流动摊贩占用人行道',
    eventTime: '2026-04-13 14:40:00',
    createTime: '2026-04-13 14:40:05',
  },
  {
    id: '3',
    eventNo: 'EVT-20260413-003',
    eventType: '烟火',
    level: '重大',
    scene: '森林防火',
    region: '林草防火区',
    location: '北坡 37° 区域',
    source: '卫星热点',
    sourceDrone: '',
    confidence: 92,
    status: '已闭环',
    description: '卫星热点告警，疑似明火',
    eventTime: '2026-04-13 10:05:00',
    createTime: '2026-04-13 10:05:30',
    reviewer: '王安全',
    reviewResult: '待现场核实',
    reviewRemark: '已派无人机前往核查',
    reviewTime: '2026-04-13 10:15:00',
    relatedWorkorderId: 'WO-20260413-001',
  },
  {
    id: '4',
    eventNo: 'EVT-20260412-004',
    eventType: '排污',
    level: '较大',
    scene: '环境监测',
    region: '沿河西路',
    location: '排污口 A-3',
    source: 'AI识别',
    sourceDrone: '大航蜂 M30-06',
    confidence: 92,
    status: '处置中',
    description: '疑似工业废水排放',
    eventTime: '2026-04-12 16:35:00',
    createTime: '2026-04-12 16:35:08',
    reviewer: '李巡查',
    reviewResult: '确认有效',
    reviewRemark: '确认为工业废水排放，需现场取证',
    reviewTime: '2026-04-12 17:00:00',
  },
  {
    id: '5',
    eventNo: 'EVT-20260412-005',
    eventType: '漂浮物',
    level: '一般',
    scene: '水域监测',
    region: '生态园区',
    location: '人工湖西侧',
    source: 'AI识别',
    sourceDrone: '大航蜂 M350-03',
    confidence: 85,
    status: '已闭环',
    description: '大面积水面垃圾漂浮',
    eventTime: '2026-04-12 14:10:00',
    createTime: '2026-04-12 14:10:12',
  },
  {
    id: '6',
    eventNo: 'EVT-20260411-007',
    eventType: '违停',
    level: '一般',
    scene: '交通巡查',
    region: '高新区北片',
    location: '创业路 56 号门前',
    source: 'AI识别',
    sourceDrone: '大航蜂 M300-01',
    confidence: 94,
    status: '误报',
    description: '临时停车（已核实有许可）',
    eventTime: '2026-04-11 08:45:00',
    createTime: '2026-04-11 08:45:06',
    reviewer: '张指挥',
    reviewResult: '误报排除',
    reviewRemark: '核实为临时许可停车',
    reviewTime: '2026-04-11 09:10:00',
  },
];

const defaultWorkorders: EventWorkorderRecord[] = [
  {
    id: 'WO-20260413-001',
    title: '北坡林区烟雾告警处置',
    eventId: 'EVT-20260413-003',
    type: '告警处置',
    level: '紧急',
    source: 'AI',
    priority: '一级',
    status: 4,
    location: '北坡 230m 处',
    assignee: '张伟',
    creator: '系统自动',
    createTime: '2026-04-13 14:33',
    deadline: '2026-04-13 16:00',
    description: 'AI 检测到北坡林区疑似烟雾，置信度 92%，需现场核实并处置。',
    closureSummary: '现场确认农户焚烧秸秆，已完成扑灭与劝阻，处置链路已归档。',
    evidences: [
      { id: 'evi-001', title: '现场扑灭照片', type: '图片', uploadedBy: '张伟', uploadedAt: '2026-04-13 15:12', summary: '记录明火扑灭后现场状态。' },
      { id: 'evi-002', title: '现场处置视频', type: '视频', uploadedBy: '张伟', uploadedAt: '2026-04-13 15:14', summary: '展示现场核查与劝阻过程。' },
    ],
    logs: [
      { time: '14:33', action: '工单创建', user: '系统', note: 'AI 告警自动生成' },
      { time: '14:35', action: '指派处理人', user: '李指挥', note: '指派张伟前往现场' },
      { time: '14:50', action: '到达现场', user: '张伟', note: '已到达，确认为农户焚烧秸秆' },
      { time: '15:10', action: '提交处置', user: '张伟', note: '已劝阻农户并扑灭明火，拍照取证' },
      { time: '15:25', action: '复核通过', user: '李指挥', note: '确认处置完毕，归档' },
    ],
  },
  {
    id: 'WO-20260413-002',
    title: '人民路违停车辆处置',
    eventId: 'EVT-20260413-001',
    type: '告警处置',
    level: '一般',
    source: 'AI',
    priority: '二级',
    status: 2,
    location: '人民路交叉口',
    assignee: '王芳',
    creator: '系统自动',
    createTime: '2026-04-13 15:00',
    deadline: '2026-04-13 18:00',
    description: 'AI 检测到人民路交叉口红色轿车违停，需通知车主或拖移。',
    evidences: [
      { id: 'evi-003', title: '违停抓拍图', type: '图片', uploadedBy: '系统自动', uploadedAt: '2026-04-13 15:00', summary: '用于城管和交警联动取证。' },
    ],
    logs: [
      { time: '15:00', action: '工单创建', user: '系统', note: 'AI 告警自动生成' },
      { time: '15:05', action: '指派处理人', user: '赵指挥', note: '指派王芳处理' },
      { time: '15:20', action: '到达现场', user: '王芳', note: '已到达，正在联系车主' },
    ],
  },
  {
    id: 'WO-20260413-003',
    title: '渭河 K12 段漂浮物清理',
    eventId: 'EVT-20260413-008',
    type: '巡检工单',
    level: '一般',
    source: '人工',
    priority: '三级',
    status: 1,
    location: '渭河 K12 段',
    assignee: '',
    creator: '李巡查',
    createTime: '2026-04-13 10:15',
    deadline: '2026-04-14 12:00',
    description: '巡检发现渭河 K12 段河面大量漂浮物聚集，需协调水务部门清理。',
    evidences: [],
    logs: [{ time: '10:15', action: '工单创建', user: '李巡查', note: '巡检发现，手动创建' }],
  },
];

function cloneEvents() {
  return defaultEvents.map((item) => ({ ...item }));
}

function cloneWorkorders() {
  return defaultWorkorders.map((item) => ({
    ...item,
    evidences: item.evidences.map((evidence) => ({ ...evidence })),
    logs: item.logs.map((log) => ({ ...log })),
  }));
}

function readEvents() {
  try {
    const raw = sessionStorage.getItem(EVENT_STORAGE_KEY);
    if (!raw) return cloneEvents();
    const parsed = JSON.parse(raw) as EventClosureRecord[];
    return Array.isArray(parsed) ? parsed : cloneEvents();
  } catch {
    return cloneEvents();
  }
}

function readWorkorders() {
  try {
    const raw = sessionStorage.getItem(WORKORDER_STORAGE_KEY);
    if (!raw) return cloneWorkorders();
    const parsed = JSON.parse(raw) as EventWorkorderRecord[];
    return Array.isArray(parsed) ? parsed : cloneWorkorders();
  } catch {
    return cloneWorkorders();
  }
}

function bumpClosureStoreVersion() {
  closureStoreVersion.value += 1;
}

export function useEventClosureVersion() {
  return closureStoreVersion;
}

export function listClosureEvents() {
  return readEvents();
}

export function saveClosureEvents(list: EventClosureRecord[]) {
  sessionStorage.setItem(EVENT_STORAGE_KEY, JSON.stringify(list.slice(0, 200)));
  bumpClosureStoreVersion();
}

export function upsertClosureEvent(record: EventClosureRecord) {
  const list = readEvents();
  const index = list.findIndex(
    (item) => item.eventNo === record.eventNo || item.id === record.id,
  );
  if (index >= 0) {
    list.splice(index, 1, record);
  } else {
    list.unshift(record);
  }
  saveClosureEvents(list);
  return record;
}

export function listClosureWorkorders() {
  return readWorkorders();
}

export function saveClosureWorkorders(list: EventWorkorderRecord[]) {
  sessionStorage.setItem(WORKORDER_STORAGE_KEY, JSON.stringify(list.slice(0, 200)));
  bumpClosureStoreVersion();
}

export function getClosureEventByNoOrId(id: string) {
  return readEvents().find((item) => item.eventNo === id || item.id === id) || null;
}

export function getClosureWorkorderById(id: string) {
  return readWorkorders().find((item) => item.id === id) || null;
}

export function createWorkorderFromEvent(payload: {
  eventNo: string;
  priority: '一级' | '二级' | '三级';
  assignee: string;
  note: string;
}) {
  const events = readEvents();
  const workorders = readWorkorders();
  const event = events.find((item) => item.eventNo === payload.eventNo);
  if (!event) return null;

  const woId = `WO-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(
    Math.floor(Math.random() * 900) + 100,
  )}`;
  const now = new Date();
  const timeLabel = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(
    2,
    '0',
  )}`;
  const workorder: EventWorkorderRecord = {
    id: woId,
    title: `${event.location} ${event.eventType}处置`,
    eventId: event.eventNo,
    type: '告警处置',
    level: event.level === '重大' ? '紧急' : '一般',
    source: event.source.includes('AI') ? 'AI' : '人工',
    priority: payload.priority,
    status: payload.assignee ? 1 : 0,
    location: event.location,
    assignee: payload.assignee,
    creator: '当前用户',
    createTime: now.toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
    deadline: '',
    description: payload.note || event.description,
    evidences: [],
    logs: [
      { time: timeLabel, action: '工单创建', user: '当前用户', note: `基于事件 ${event.eventNo} 创建` },
      ...(payload.assignee
        ? [{ time: timeLabel, action: '指派处理人', user: '当前用户', note: `指派 ${payload.assignee}` }]
        : []),
    ],
  };

  event.relatedWorkorderId = woId;
  event.status = '已派单';

  workorders.unshift(workorder);
  saveClosureWorkorders(workorders);
  saveClosureEvents(events);
  return workorder;
}

export function submitEventReview(payload: {
  eventNo: string;
  reviewer: string;
  reviewResult: string;
  reviewRemark: string;
}) {
  const events = readEvents();
  const event = events.find((item) => item.eventNo === payload.eventNo);
  if (!event) return null;
  const now = new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-');
  event.reviewer = payload.reviewer;
  event.reviewResult = payload.reviewResult;
  event.reviewRemark = payload.reviewRemark;
  event.reviewTime = now;
  event.status =
    payload.reviewResult === '误报排除'
      ? '误报'
      : payload.reviewResult === '待现场核实'
        ? '已确认'
        : event.relatedWorkorderId
          ? '已派单'
          : '已确认';
  saveClosureEvents(events);
  return event;
}

export function syncWorkorderStatus(payload: {
  workorderId: string;
  status: number;
  assignee?: string;
  closureSummary?: string;
  log?: WorkorderLog;
}) {
  const workorders = readWorkorders();
  const events = readEvents();
  const workorder = workorders.find((item) => item.id === payload.workorderId);
  if (!workorder) return null;
  workorder.status = payload.status;
  if (payload.assignee !== undefined) {
    workorder.assignee = payload.assignee;
  }
  if (payload.closureSummary !== undefined) {
    workorder.closureSummary = payload.closureSummary;
  }
  if (payload.log) {
    workorder.logs.push(payload.log);
  }
  const relatedEvent = events.find((item) => item.eventNo === workorder.eventId);
  if (relatedEvent) {
    relatedEvent.relatedWorkorderId = workorder.id;
    relatedEvent.status =
      payload.status >= 4
        ? '已闭环'
        : payload.status >= 2
          ? '处置中'
          : '已派单';
  }
  saveClosureWorkorders(workorders);
  saveClosureEvents(events);
  return workorder;
}

export function appendWorkorderEvidence(payload: {
  workorderId: string;
  title: string;
  type: '图片' | '视频' | '文本';
  uploadedBy: string;
  summary: string;
}) {
  const workorders = readWorkorders();
  const workorder = workorders.find((item) => item.id === payload.workorderId);
  if (!workorder) return null;
  const now = new Date();
  const uploadedAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate(),
  ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  workorder.evidences.unshift({
    id: `evi-${Date.now()}`,
    title: payload.title,
    type: payload.type,
    uploadedBy: payload.uploadedBy,
    uploadedAt,
    summary: payload.summary,
  });
  workorder.logs.push({
    time: uploadedAt.slice(11, 16),
    action: '补充证据',
    user: payload.uploadedBy,
    note: payload.title,
  });
  saveClosureWorkorders(workorders);
  return workorder;
}
