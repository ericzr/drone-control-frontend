export type SceneType =
  | 'cityAdmin'
  | 'environment'
  | 'forestFire'
  | 'heating'
  | 'safety'
  | 'solar'
  | 'traffic';

export interface StatCard {
  color: string;
  label: string;
  suffix: string;
  value: number;
}

export interface AlertImage {
  category: string;
  confidence: number;
  id: string;
  level: 'critical' | 'info' | 'warning';
  location: string;
  src: string;
  time: string;
}

export interface DetectCategory {
  color: string;
  count: number;
  label: string;
}

export interface DeviceStatus {
  label: string;
  online: number;
  total: number;
}

export interface DroneItem {
  battery: number;
  id: string;
  mission: string;
  signal: number;
  status: string;
}

export interface MapFeature {
  color?: string;
  label: string;
  position: [number, number];
  type: 'alert' | 'device' | 'fence' | 'route';
}

export interface SceneConfig {
  alertImages: AlertImage[];
  alertTypes: string[];
  color: string;
  detectCategories: DetectCategory[];
  devices: DeviceStatus[];
  drones: DroneItem[];
  icon: string;
  key: SceneType;
  label: string;
  mapCenter: [number, number];
  mapFeatures: MapFeature[];
  statCards: StatCard[];
  summary: { handled: number; pending: number; total: number };
}

function placeholder(idx: number): string {
  const colors = ['3b82f6', 'ef4444', 'f59e0b', '10b981', '8b5cf6', 'ec4899'];
  const c = colors[idx % colors.length];
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='320' height='240'%3E%3Crect width='320' height='240' fill='%23111827'/%3E%3Crect x='60' y='50' width='200' height='140' rx='4' fill='none' stroke='%23${c}' stroke-width='3' stroke-dasharray='8,4'/%3E%3Ctext x='160' y='128' text-anchor='middle' fill='%23${c}' font-size='14' font-family='monospace'%3EAI Detection%3C/text%3E%3Ctext x='160' y='152' text-anchor='middle' fill='%23666' font-size='11' font-family='monospace'%3E${320}x${240}%3C/text%3E%3C/svg%3E`;
}

export const scenes: Record<SceneType, SceneConfig> = {
  forestFire: {
    key: 'forestFire',
    label: '森林防火',
    icon: '🌲',
    color: '#ef4444',
    alertTypes: ['烟雾', '明火', '人员违规', '车辆入侵'],
    statCards: [
      { label: '在线设备', value: 24, suffix: '台', color: '#3b82f6' },
      { label: '今日巡检', value: 38, suffix: '架次', color: '#10b981' },
      { label: '发现火情', value: 3, suffix: '起', color: '#ef4444' },
      { label: '林区覆盖', value: 87, suffix: '%', color: '#f59e0b' },
    ],
    devices: [
      { label: '无人机', total: 16, online: 14 },
      { label: '红外摄像头', total: 12, online: 10 },
    ],
    drones: [
      { id: '大航蜂 M30T-01', mission: '北坡林区巡检', status: '飞行中', battery: 72, signal: 94 },
      { id: '大航蜂 M350-03', mission: '东岭防火带巡查', status: '飞行中', battery: 58, signal: 89 },
    ],
    detectCategories: [
      { label: '烟雾检测', count: 45, color: '#94a3b8' },
      { label: '明火检测', count: 3, color: '#ef4444' },
      { label: '人员检测', count: 12, color: '#f59e0b' },
      { label: '车辆检测', count: 8, color: '#3b82f6' },
    ],
    alertImages: [
      { id: 'f1', category: '烟雾', confidence: 0.92, level: 'critical', location: '北坡 230m 处', time: '14:32', src: placeholder(1) },
      { id: 'f2', category: '人员违规', confidence: 0.87, level: 'warning', location: '东岭防火带', time: '13:18', src: placeholder(2) },
      { id: 'f3', category: '车辆入侵', confidence: 0.79, level: 'warning', location: '禁火区入口', time: '11:45', src: placeholder(3) },
      { id: 'f4', category: '明火', confidence: 0.95, level: 'critical', location: '南坡密林区', time: '10:20', src: placeholder(1) },
    ],
    summary: { total: 8, handled: 5, pending: 3 },
    mapCenter: [108.94, 34.26],
    mapFeatures: [
      { type: 'device', label: '北坡机场', position: [108.96, 34.29], color: '#3b82f6' },
      { type: 'device', label: '东岭机场', position: [108.90, 34.24], color: '#3b82f6' },
      { type: 'alert', label: '烟雾告警', position: [108.93, 34.27], color: '#ef4444' },
      { type: 'alert', label: '明火告警', position: [108.91, 34.25], color: '#ef4444' },
      { type: 'fence', label: '重点防火区', position: [108.94, 34.26], color: '#f59e0b' },
    ],
  },

  traffic: {
    key: 'traffic',
    label: '交通巡查',
    icon: '🚗',
    color: '#3b82f6',
    alertTypes: ['违停', '事故', '路面病害', '标线缺失'],
    statCards: [
      { label: '在线设备', value: 42, suffix: '台', color: '#3b82f6' },
      { label: '今日巡查', value: 68, suffix: '次', color: '#10b981' },
      { label: '发现违规', value: 21, suffix: '起', color: '#ef4444' },
      { label: '道路覆盖', value: 76, suffix: '%', color: '#f59e0b' },
    ],
    devices: [
      { label: '无人机', total: 10, online: 8 },
      { label: '地面摄像头', total: 36, online: 34 },
    ],
    drones: [
      { id: '大航蜂 FP-02', mission: '主干道早高峰巡查', status: '飞行中', battery: 81, signal: 97 },
      { id: '大航蜂 M300-05', mission: '高架桥段巡检', status: '飞行中', battery: 65, signal: 91 },
    ],
    detectCategories: [
      { label: '违停检测', count: 89, color: '#ef4444' },
      { label: '事故检测', count: 2, color: '#f59e0b' },
      { label: '路面病害', count: 15, color: '#8b5cf6' },
      { label: '标线缺失', count: 7, color: '#94a3b8' },
    ],
    alertImages: [
      { id: 't1', category: '违停', confidence: 0.94, level: 'warning', location: '人民路与解放路交叉口', time: '14:55', src: placeholder(0) },
      { id: 't2', category: '路面病害', confidence: 0.88, level: 'info', location: '环城西路 K3+200', time: '13:40', src: placeholder(4) },
      { id: 't3', category: '事故', confidence: 0.91, level: 'critical', location: '高架桥 A 段', time: '12:15', src: placeholder(1) },
      { id: 't4', category: '违停', confidence: 0.86, level: 'warning', location: '学府路商业街', time: '11:30', src: placeholder(0) },
    ],
    summary: { total: 21, handled: 16, pending: 5 },
    mapCenter: [108.94, 34.26],
    mapFeatures: [
      { type: 'route', label: '主干道', position: [108.95, 34.27], color: '#3b82f6' },
      { type: 'alert', label: '违停告警', position: [108.93, 34.25], color: '#f59e0b' },
      { type: 'alert', label: '事故告警', position: [108.96, 34.28], color: '#ef4444' },
      { type: 'device', label: '交通枢纽机场', position: [108.94, 34.26], color: '#3b82f6' },
    ],
  },

  cityAdmin: {
    key: 'cityAdmin',
    label: '市政巡检',
    icon: '🏙️',
    color: '#8b5cf6',
    alertTypes: ['占道经营', '违建', '渣土偷倒', '井盖异常'],
    statCards: [
      { label: '在线设备', value: 36, suffix: '台', color: '#3b82f6' },
      { label: '今日巡检', value: 52, suffix: '次', color: '#10b981' },
      { label: '发现问题', value: 18, suffix: '起', color: '#ef4444' },
      { label: '网格覆盖', value: 91, suffix: '%', color: '#f59e0b' },
    ],
    devices: [
      { label: '无人机', total: 14, online: 12 },
      { label: '地面摄像头', total: 28, online: 24 },
    ],
    drones: [
      { id: '大航蜂 M300-01', mission: '商业街占道巡查', status: '飞行中', battery: 69, signal: 93 },
      { id: '大航蜂 M30-04', mission: '工地违建监测', status: '飞行中', battery: 77, signal: 96 },
    ],
    detectCategories: [
      { label: '占道经营', count: 34, color: '#f59e0b' },
      { label: '违建识别', count: 6, color: '#ef4444' },
      { label: '渣土偷倒', count: 9, color: '#8b5cf6' },
      { label: '井盖异常', count: 5, color: '#94a3b8' },
    ],
    alertImages: [
      { id: 'c1', category: '占道经营', confidence: 0.90, level: 'warning', location: '朝阳路步行街', time: '15:10', src: placeholder(2) },
      { id: 'c2', category: '违建', confidence: 0.85, level: 'critical', location: '新城区 B 地块', time: '14:25', src: placeholder(1) },
      { id: 'c3', category: '渣土偷倒', confidence: 0.82, level: 'warning', location: '城南大道路边', time: '09:40', src: placeholder(4) },
      { id: 'c4', category: '井盖异常', confidence: 0.78, level: 'info', location: '文化路人行道', time: '08:15', src: placeholder(5) },
    ],
    summary: { total: 18, handled: 12, pending: 6 },
    mapCenter: [108.94, 34.26],
    mapFeatures: [
      { type: 'fence', label: '重点巡查网格', position: [108.93, 34.26], color: '#8b5cf6' },
      { type: 'alert', label: '占道告警', position: [108.95, 34.27], color: '#f59e0b' },
      { type: 'alert', label: '违建告警', position: [108.92, 34.24], color: '#ef4444' },
      { type: 'device', label: '城管巡检机场', position: [108.94, 34.26], color: '#3b82f6' },
    ],
  },

  environment: {
    key: 'environment',
    label: '环境监测',
    icon: '🌊',
    color: '#06b6d4',
    alertTypes: ['排污口', '漂浮物', '偷排废水', '违规捕捞'],
    statCards: [
      { label: '在线设备', value: 28, suffix: '台', color: '#3b82f6' },
      { label: '今日巡查', value: 34, suffix: '次', color: '#10b981' },
      { label: '发现异常', value: 7, suffix: '起', color: '#ef4444' },
      { label: '水域覆盖', value: 83, suffix: '%', color: '#f59e0b' },
    ],
    devices: [
      { label: '无人机', total: 12, online: 10 },
      { label: '水质传感器', total: 20, online: 18 },
    ],
    drones: [
      { id: '大航蜂 M30T-06', mission: '渭河流域巡查', status: '飞行中', battery: 74, signal: 92 },
      { id: '大航蜂 M350-02', mission: '排污口排查', status: '飞行中', battery: 61, signal: 88 },
    ],
    detectCategories: [
      { label: '排污口检测', count: 18, color: '#ef4444' },
      { label: '漂浮物检测', count: 23, color: '#f59e0b' },
      { label: '偷排废水', count: 4, color: '#8b5cf6' },
      { label: '违规捕捞', count: 2, color: '#06b6d4' },
    ],
    alertImages: [
      { id: 'e1', category: '排污口', confidence: 0.93, level: 'critical', location: '渭河 K12 段', time: '14:50', src: placeholder(3) },
      { id: 'e2', category: '漂浮物', confidence: 0.81, level: 'warning', location: '灞河桥下游 200m', time: '13:20', src: placeholder(5) },
      { id: 'e3', category: '偷排废水', confidence: 0.88, level: 'critical', location: '工业园区排水渠', time: '11:55', src: placeholder(1) },
      { id: 'e4', category: '违规捕捞', confidence: 0.76, level: 'info', location: '禁渔区 B 段', time: '10:30', src: placeholder(0) },
    ],
    summary: { total: 7, handled: 4, pending: 3 },
    mapCenter: [108.94, 34.26],
    mapFeatures: [
      { type: 'route', label: '巡查河段', position: [108.95, 34.27], color: '#06b6d4' },
      { type: 'alert', label: '排污告警', position: [108.93, 34.25], color: '#ef4444' },
      { type: 'device', label: '水务巡检机场', position: [108.94, 34.26], color: '#3b82f6' },
    ],
  },

  solar: {
    key: 'solar',
    label: '光伏巡检',
    icon: '☀️',
    color: '#f59e0b',
    alertTypes: ['热斑', '污损', '裂缝', '遮挡'],
    statCards: [
      { label: '在线设备', value: 18, suffix: '台', color: '#3b82f6' },
      { label: '今日巡检', value: 22, suffix: '架次', color: '#10b981' },
      { label: '发现缺陷', value: 14, suffix: '处', color: '#ef4444' },
      { label: '电站覆盖', value: 95, suffix: '%', color: '#f59e0b' },
    ],
    devices: [
      { label: '无人机', total: 8, online: 7 },
      { label: '红外传感器', total: 12, online: 11 },
    ],
    drones: [
      { id: '大航蜂 M30T-08', mission: 'A 区光伏板巡检', status: '飞行中', battery: 82, signal: 95 },
      { id: '大航蜂 M350-05', mission: 'B 区红外热成像', status: '飞行中', battery: 56, signal: 90 },
    ],
    detectCategories: [
      { label: '热斑检测', count: 32, color: '#ef4444' },
      { label: '污损检测', count: 18, color: '#f59e0b' },
      { label: '裂缝检测', count: 8, color: '#8b5cf6' },
      { label: '遮挡检测', count: 5, color: '#94a3b8' },
    ],
    alertImages: [
      { id: 'so1', category: '热斑', confidence: 0.96, level: 'critical', location: 'A 区 3 排 15 号', time: '15:20', src: placeholder(1) },
      { id: 'so2', category: '污损', confidence: 0.84, level: 'warning', location: 'B 区 7 排 22 号', time: '14:05', src: placeholder(2) },
      { id: 'so3', category: '裂缝', confidence: 0.89, level: 'warning', location: 'A 区 1 排 8 号', time: '12:40', src: placeholder(4) },
      { id: 'so4', category: '遮挡', confidence: 0.77, level: 'info', location: 'C 区 2 排 5 号', time: '11:10', src: placeholder(5) },
    ],
    summary: { total: 14, handled: 9, pending: 5 },
    mapCenter: [108.94, 34.26],
    mapFeatures: [
      { type: 'fence', label: 'A 区光伏阵列', position: [108.93, 34.27], color: '#f59e0b' },
      { type: 'fence', label: 'B 区光伏阵列', position: [108.95, 34.25], color: '#f59e0b' },
      { type: 'alert', label: '热斑告警', position: [108.93, 34.27], color: '#ef4444' },
      { type: 'device', label: '光伏巡检机场', position: [108.94, 34.26], color: '#3b82f6' },
    ],
  },

  heating: {
    key: 'heating',
    label: '热力巡检',
    icon: '🔥',
    color: '#f97316',
    alertTypes: ['管道泄漏', '树木干扰', '施工靠近', '管道破损'],
    statCards: [
      { label: '在线设备', value: 20, suffix: '台', color: '#3b82f6' },
      { label: '今日巡检', value: 28, suffix: '次', color: '#10b981' },
      { label: '发现隐患', value: 6, suffix: '处', color: '#ef4444' },
      { label: '管网覆盖', value: 88, suffix: '%', color: '#f59e0b' },
    ],
    devices: [
      { label: '无人机', total: 10, online: 8 },
      { label: '热成像仪', total: 14, online: 12 },
    ],
    drones: [
      { id: '大航蜂 M30T-10', mission: '主管网红外巡检', status: '飞行中', battery: 68, signal: 93 },
      { id: '大航蜂 M300-08', mission: '支管网泄漏排查', status: '飞行中', battery: 75, signal: 91 },
    ],
    detectCategories: [
      { label: '管道泄漏', count: 12, color: '#ef4444' },
      { label: '树木干扰', count: 9, color: '#10b981' },
      { label: '施工靠近', count: 6, color: '#f59e0b' },
      { label: '管道破损', count: 4, color: '#8b5cf6' },
    ],
    alertImages: [
      { id: 'h1', category: '管道泄漏', confidence: 0.94, level: 'critical', location: '主管网 K8+500', time: '15:30', src: placeholder(1) },
      { id: 'h2', category: '树木干扰', confidence: 0.82, level: 'warning', location: '支管网 L3 段', time: '14:10', src: placeholder(3) },
      { id: 'h3', category: '施工靠近', confidence: 0.86, level: 'warning', location: '建设路地下管廊', time: '12:50', src: placeholder(2) },
      { id: 'h4', category: '管道破损', confidence: 0.80, level: 'info', location: '工业区 D 段', time: '10:45', src: placeholder(4) },
    ],
    summary: { total: 6, handled: 4, pending: 2 },
    mapCenter: [108.94, 34.26],
    mapFeatures: [
      { type: 'route', label: '主管网', position: [108.94, 34.27], color: '#f97316' },
      { type: 'route', label: '支管网', position: [108.92, 34.25], color: '#fb923c' },
      { type: 'alert', label: '泄漏告警', position: [108.95, 34.27], color: '#ef4444' },
      { type: 'device', label: '热力巡检机场', position: [108.94, 34.26], color: '#3b82f6' },
    ],
  },

  safety: {
    key: 'safety',
    label: '安全生产',
    icon: '⛑️',
    color: '#10b981',
    alertTypes: ['未戴安全帽', '未穿反光衣', '越界入侵', '工地烟火'],
    statCards: [
      { label: '在线设备', value: 30, suffix: '台', color: '#3b82f6' },
      { label: '今日巡查', value: 45, suffix: '次', color: '#10b981' },
      { label: '发现违规', value: 11, suffix: '起', color: '#ef4444' },
      { label: '工地覆盖', value: 92, suffix: '%', color: '#f59e0b' },
    ],
    devices: [
      { label: '无人机', total: 12, online: 11 },
      { label: '监控摄像头', total: 24, online: 19 },
    ],
    drones: [
      { id: '大航蜂 M300-12', mission: 'A 工地安全巡查', status: '飞行中', battery: 78, signal: 95 },
      { id: '大航蜂 M30-09', mission: 'B 工地围栏监控', status: '飞行中', battery: 64, signal: 88 },
    ],
    detectCategories: [
      { label: '未戴安全帽', count: 28, color: '#ef4444' },
      { label: '未穿反光衣', count: 15, color: '#f59e0b' },
      { label: '越界入侵', count: 7, color: '#8b5cf6' },
      { label: '工地烟火', count: 3, color: '#94a3b8' },
    ],
    alertImages: [
      { id: 'sa1', category: '未戴安全帽', confidence: 0.93, level: 'critical', location: 'A 工地 3 号楼', time: '15:45', src: placeholder(1) },
      { id: 'sa2', category: '越界入侵', confidence: 0.88, level: 'warning', location: 'B 工地围栏东侧', time: '14:20', src: placeholder(2) },
      { id: 'sa3', category: '未穿反光衣', confidence: 0.85, level: 'warning', location: 'C 工地基坑区', time: '13:10', src: placeholder(3) },
      { id: 'sa4', category: '工地烟火', confidence: 0.91, level: 'critical', location: 'A 工地仓库旁', time: '11:50', src: placeholder(1) },
    ],
    summary: { total: 11, handled: 7, pending: 4 },
    mapCenter: [108.94, 34.26],
    mapFeatures: [
      { type: 'fence', label: 'A 工地', position: [108.93, 34.27], color: '#10b981' },
      { type: 'fence', label: 'B 工地', position: [108.95, 34.25], color: '#10b981' },
      { type: 'alert', label: '安全帽违规', position: [108.93, 34.27], color: '#ef4444' },
      { type: 'device', label: '安全巡检机场', position: [108.94, 34.26], color: '#3b82f6' },
    ],
  },
};

export const sceneList: SceneConfig[] = Object.values(scenes);

export const defaultScene: SceneType = 'forestFire';
