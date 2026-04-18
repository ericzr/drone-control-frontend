<script lang="ts" setup name="DroneControlOverviewPage">
import { Page } from '@vben/common-ui';

import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import {
  Alert,
  Badge,
  Card,
  Col,
  message,
  Progress,
  Row,
  Skeleton,
  Space,
  Statistic,
  Tag,
} from 'ant-design-vue';

import { peekTakeoffTasks } from '../_services/takeoff-task-store';
import { getAlertLevelColor, getAlertLevelText } from '../constants/colors';

function escapeCsvCell(cell: string) {
  if (/[",\n\r]/.test(cell)) return `"${cell.replace(/"/g, '""')}"`;
  return cell;
}

function exportCsv(headers: string[], rows: string[][], filename: string) {
  const bom = '\uFEFF';
  const csv = bom + [headers.map(escapeCsvCell).join(','), ...rows.map((r) => r.map(escapeCsvCell).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const router = useRouter();

const loading = ref(true);
const pendingTakeoffCount = ref(0);
let pendingTakeoffTimer: number | undefined;
let loadingTimeout: number | undefined;

onMounted(() => {
  loadingTimeout = window.setTimeout(() => {
    loading.value = false;
  }, 600);
  const tick = () => {
    pendingTakeoffCount.value = peekTakeoffTasks().length;
  };
  tick();
  pendingTakeoffTimer = window.setInterval(tick, 2000);
});

onBeforeUnmount(() => {
  if (loadingTimeout) window.clearTimeout(loadingTimeout);
  if (pendingTakeoffTimer) window.clearInterval(pendingTakeoffTimer);
});

const stats = [
  { title: '纳管设备', value: 128, suffix: '台' },
  { title: '今日任务', value: 46, suffix: '个' },
  { title: '待复核告警', value: 17, suffix: '条' },
  { title: '在线模型', value: 12, suffix: '个' },
];

const modules = [
  { key: 'cmd', title: '指挥中心', desc: '面向区域的一张图态势总览，统一查看多行业场景、多类型资产与告警分布', path: '/situation-board' },
  { key: 'dsp', title: '调度中心', desc: '统一编排无人机、机场、无人车、机器人与摄像头的协同任务与现场联动', path: '/dispatch/situation' },
  { key: 'dev', title: '设备中心', desc: '统一纳管区域内无人机、机场、机器人、无人车、摄像头、传感器等全量资产', path: '/device/uav' },
  { key: 'flt', title: '飞控中心', desc: '承接统飞中的空域资源、航线申请、计划管理、飞行执行与座舱控制', path: '/flight/airspace-resource' },
  { key: 'app', title: '专题应用', desc: '基于全域统飞底座，为林草、交通、城管、环保、工程等部门场景提供垂直作业工作台', path: '/applications/forestry' },
  { key: 'evt', title: '事件中心', desc: '围绕农林、交通、城管、环保、工程等场景完成事件研判、处置与闭环留痕', path: '/event/list' },
  { key: 'ai', title: 'AI 模型中心', desc: '为统飞提供数据源、识别、预警、历史回放、模型部署与效果评估的智能引擎', path: '/ai-center/data-source' },
];

const quickLinks = [
  { label: '无人机管理', path: '/device/uav', icon: 'mdi:quadcopter' },
  { label: '机巢管理', path: '/device/dock', icon: 'mdi:home-variant-outline' },
  { label: '空域资源', path: '/flight/airspace-resource', icon: 'mdi:vector-polyline' },
  { label: '林草巡检专题', path: '/applications/forestry', icon: 'mdi:pine-tree' },
  { label: '航线规划', path: '/flight/route-plan', icon: 'mdi:map-marker-path' },
  { label: '虚拟驾驶舱', path: '/flight/cockpit', icon: 'mdi:steering' },
  { label: '综合态势', path: '/dispatch/situation', icon: 'mdi:earth' },
  { label: '视频监控', path: '/dispatch/video-wall', icon: 'mdi:monitor-multiple' },
  { label: '事件列表', path: '/event/list', icon: 'mdi:format-list-bulleted' },
  { label: '创建工单', path: '/event/workorder', icon: 'mdi:clipboard-plus-outline' },
  { label: '工单管理', path: '/event/workorder', icon: 'mdi:clipboard-flow-outline' },
  { label: '媒体库', path: '/ai-center/media-library', icon: 'mdi:folder-multiple-image' },
  { label: '数据源管理', path: '/ai-center/data-source', icon: 'mdi:database-cog-outline' },
  { label: '分析任务', path: '/ai-center/task', icon: 'mdi:tune-variant' },
  { label: '告警规则', path: '/ai-center/rule', icon: 'mdi:shield-alert-outline' },
  { label: '历史回放', path: '/ai-center/detect-history', icon: 'mdi:history' },
  { label: '模型库', path: '/ai-center/model-repo', icon: 'mdi:database-outline' },
  { label: '算法商城', path: '/ai-center/marketplace', icon: 'mdi:store-outline' },
  { label: '评估报告', path: '/ai-center/evaluation', icon: 'mdi:chart-line' },
  { label: '部署管理', path: '/ai-center/deploy', icon: 'mdi:rocket-launch-outline' },
];

const recentAlerts = [
  { id: '3', type: '烟雾告警', level: 'critical', location: '北坡 230m 处', time: '3 分钟前', scene: '森林防火', source: 'AI' },
  { id: '1', type: '违停检测', level: 'warning', location: '人民路交叉口', time: '15 分钟前', scene: '交通巡查', source: 'AI' },
  { id: '5', type: '未戴安全帽', level: 'critical', location: 'A 工地 3 号楼', time: '28 分钟前', scene: '安全生产', source: 'AI' },
  { id: '4', type: '管道泄漏', level: 'warning', location: '主管网 K8+500', time: '45 分钟前', scene: '热力巡检', source: '设备' },
  { id: '2', type: '占道经营', level: 'info', location: '朝阳路步行街', time: '1 小时前', scene: '市政巡检', source: '人工' },
];

const deviceOverview = [
  { label: '无人机', total: 34, online: 27 },
  { label: '机巢', total: 16, online: 14 },
  { label: '摄像头', total: 48, online: 42 },
  { label: '传感器', total: 30, online: 25 },
];

const notifications = [
  { id: 1, type: 'task', title: '北坡林区巡检任务已分配', time: '10 分钟前', read: false },
  { id: 2, type: 'alert', title: 'M350-03 电池循环次数达 180 次，建议更换', time: '25 分钟前', read: false },
  { id: 3, type: 'system', title: '天地图服务证书将于 5 天后过期', time: '1 小时前', read: false },
  { id: 4, type: 'task', title: '高新区主干道日巡任务已完成', time: '2 小时前', read: true },
  { id: 5, type: 'alert', title: '林草防火机场温度传感器离线', time: '3 小时前', read: true },
  { id: 6, type: 'system', title: 'CAAC 证书续期提醒：王芳（PLT-003）', time: '5 小时前', read: false },
];

const calendarEvents = [
  { date: 13, items: [{ text: '北坡林区巡检', type: 'task' }, { text: '安全教育培训', type: 'training' }] },
  { date: 14, items: [{ text: 'M350 新机型培训', type: 'training' }] },
  { date: 15, items: [{ text: '渭河全段排查', type: 'task' }, { text: 'M300-01 定期保养', type: 'maintenance' }] },
  { date: 18, items: [{ text: '月度飞行考核', type: 'training' }] },
  { date: 20, items: [{ text: '安全教育培训', type: 'training' }] },
  { date: 25, items: [{ text: '夜间红外巡检实操', type: 'training' }, { text: '工业区违建复查', type: 'task' }] },
];

const currentMonthLabel = computed(() => `${new Date().getMonth() + 1} 月`);

function calendarTypeColor(type: string) {
  if (type === 'task') return 'blue';
  if (type === 'training') return 'green';
  return 'orange';
}

function nav(path: string) {
  router.push(path);
}

function quickEmoji(icon: string) {
  const map: Record<string, string> = {
    'mdi:quadcopter': '🛸',
    'mdi:home-variant-outline': '🏠',
    'mdi:vector-polyline': '🧭',
    'mdi:pine-tree': '🌲',
    'mdi:map-marker-path': '🗺️',
    'mdi:steering': '🎮',
    'mdi:earth': '🌍',
    'mdi:monitor-multiple': '📺',
    'mdi:format-list-bulleted': '📋',
    'mdi:clipboard-plus-outline': '📝',
    'mdi:clipboard-flow-outline': '📦',
    'mdi:folder-multiple-image': '🗂️',
    'mdi:database-cog-outline': '🛰️',
    'mdi:tune-variant': '🧠',
    'mdi:shield-alert-outline': '🚨',
    'mdi:history': '⏱️',
    'mdi:database-outline': '🗄️',
    'mdi:store-outline': '🛒',
    'mdi:chart-line': '📈',
    'mdi:rocket-launch-outline': '🚀',
  };
  return map[icon] || '•';
}

function handleExportDevices() {
  exportCsv(
    ['设备类型', '在线', '总数', '在线率(%)'],
    deviceOverview.map((d) => [
      d.label,
      String(d.online),
      String(d.total),
      String(Math.round((d.online / d.total) * 100)),
    ]),
    'device_overview.csv',
  );
  message.success('设备概览已导出');
}

const levelColor = getAlertLevelColor;
const levelText = getAlertLevelText;
</script>

<template>
  <Page>
    <div class="flex flex-col gap-4 p-2">
      <Card :bordered="false">
        <div class="overview-hero">
          <div class="overview-hero__main">
            <div class="overview-hero__title">云界空域OS · 一网统飞运行总览</div>
            <div class="overview-hero__desc">
              面向市 / 区县范围统一纳管无人机、机场、无人车、机器人与摄像头资产，围绕农林、交通、城管、环保、工程项目等场景开展跨设备协同巡检与事件闭环。
            </div>
          </div>
          <Space wrap>
            <Tag color="blue">区域统筹</Tag>
            <Tag color="cyan">多资产联动</Tag>
            <Tag color="purple">多场景巡检</Tag>
            <Tag color="green">事件闭环</Tag>
          </Space>
        </div>
      </Card>

      <Skeleton :loading="loading" active :paragraph="{ rows: 1 }">
        <Row :gutter="[16, 16]">
          <Col v-for="item in stats" :key="item.title" :lg="6" :md="12" :span="24">
            <Card :bordered="false">
              <Statistic :suffix="item.suffix" :title="item.title" :value="item.value" />
            </Card>
          </Col>
        </Row>
      </Skeleton>

      <Alert
        v-if="pendingTakeoffCount > 0"
        type="info"
        show-icon
        :message="`有 ${pendingTakeoffCount} 条机巢起飞任务待同步至任务调度（会话演示）`"
      >
        <template #action>
          <a class="text-primary" @click="nav('/dispatch/task')">前往任务调度</a>
        </template>
      </Alert>

      <Row :gutter="[16, 16]">
        <Col v-for="m in modules" :key="m.key" :lg="8" :md="12" :span="24">
          <Card :bordered="false" hoverable class="cursor-pointer" @click="nav(m.path)">
            <div class="module-title">{{ m.title }}</div>
            <div class="module-desc">{{ m.desc }}</div>
          </Card>
        </Col>
      </Row>

      <Row :gutter="[16, 16]">
        <Col :lg="8" :span="24">
          <Card :bordered="false" title="快捷入口">
            <div class="quick-grid">
              <div
                v-for="link in quickLinks"
                :key="link.path"
                class="quick-item"
                @click="nav(link.path)"
              >
                <span class="quick-item__icon">{{ quickEmoji(link.icon) }}</span>
                <span>{{ link.label }}</span>
              </div>
            </div>
          </Card>
        </Col>

        <Col :lg="8" :span="24">
          <Card :bordered="false" title="最新告警">
            <template #extra>
              <a class="text-xs" @click="nav('/event/list')">全部 ></a>
            </template>
            <div class="alert-list">
              <div
                v-for="a in recentAlerts"
                :key="a.id"
                class="alert-item"
                @click="nav(`/event/detail?id=${a.id}`)"
              >
                <Badge :color="levelColor(a.level)" />
                <div class="alert-item__content">
                  <div class="alert-item__head">
                    <span class="alert-item__type">{{ a.type }}</span>
                    <div class="flex items-center gap-1">
                      <Tag :color="a.source === 'AI' ? 'purple' : a.source === '设备' ? 'cyan' : 'default'" size="small" :bordered="false">{{ a.source }}</Tag>
                      <Tag :color="levelColor(a.level)" size="small" :bordered="false">
                        {{ levelText(a.level) }}
                      </Tag>
                    </div>
                  </div>
                  <div class="alert-item__meta">
                    {{ a.location }} · {{ a.scene }} · {{ a.time }}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </Col>

        <Col :lg="8" :span="24">
          <Card :bordered="false" title="设备概览">
            <template #extra>
              <Space>
                <a class="text-xs" @click="handleExportDevices">导出</a>
                <a class="text-xs" @click="nav('/device/uav')">详情 ></a>
              </Space>
            </template>
            <div class="device-list">
              <div v-for="d in deviceOverview" :key="d.label" class="device-item">
                <div class="device-item__header">
                  <span>{{ d.label }}</span>
                  <span class="device-item__count">{{ d.online }} / {{ d.total }}</span>
                </div>
                <Progress
                  :percent="Math.round((d.online / d.total) * 100)"
                  :show-info="false"
                  size="small"
                />
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row :gutter="[16, 16]">
        <Col :lg="12" :span="24">
          <Card :bordered="false" title="通知中心">
            <div class="notif-list">
              <div
                v-for="n in notifications"
                :key="n.id"
                class="notif-item"
                :class="{ 'notif-item--unread': !n.read }"
              >
                <div class="notif-item__head">
                  <span class="notif-item__title">{{ n.title }}</span>
                  <span v-if="!n.read" class="notif-item__dot" />
                </div>
                <div class="notif-item__time">{{ n.time }}</div>
              </div>
            </div>
          </Card>
        </Col>

        <Col :lg="12" :span="24">
          <Card :bordered="false" :title="`本月日程 · ${currentMonthLabel}`">
            <div class="calendar-list">
              <div v-for="day in calendarEvents" :key="day.date" class="calendar-day">
                <div class="calendar-day__date">
                  <span class="calendar-day__num">{{ day.date }}</span>
                  <span class="calendar-day__label">日</span>
                </div>
                <div class="calendar-day__items">
                  <Tag v-for="(item, i) in day.items" :key="i" :color="calendarTypeColor(item.type)" size="small">
                    {{ item.text }}
                  </Tag>
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  </Page>
</template>

<style lang="less" scoped>
.overview-hero {
  align-items: flex-start;
  display: flex;
  gap: 16px;
  justify-content: space-between;
}

.overview-hero__main {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.overview-hero__title {
  color: var(--ant-color-text);
  font-size: 24px;
  font-weight: 700;
  line-height: 1.2;
}

.overview-hero__desc {
  color: var(--ant-color-text-description);
  line-height: 1.7;
  max-width: 860px;
}

.module-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--ant-color-text);
}

.module-desc {
  margin-top: 6px;
  font-size: 12px;
  line-height: 1.6;
  color: var(--ant-color-text-tertiary);
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0;
  border-top: 1px solid var(--ant-color-border-secondary);
  border-left: 1px solid var(--ant-color-border-secondary);
}

@media (max-width: 768px) {
  .overview-hero {
    align-items: stretch;
    flex-direction: column;
  }

  .quick-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.quick-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 14px 8px;
  text-align: center;
  font-size: 12px;
  cursor: pointer;
  color: var(--ant-color-text);
  border-right: 1px solid var(--ant-color-border-secondary);
  border-bottom: 1px solid var(--ant-color-border-secondary);
  transition: background 0.2s;

  &:hover {
    background: var(--ant-color-primary-bg);
  }
}

.quick-item__icon {
  font-size: 20px;
  color: var(--ant-color-text-secondary);
}

.alert-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.alert-item {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 6px 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: var(--ant-color-bg-layout);
  }
}

.alert-item__content {
  flex: 1;
  min-width: 0;
}

.alert-item__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.alert-item__type {
  font-size: 13px;
  font-weight: 600;
  color: var(--ant-color-text);
}

.alert-item__meta {
  margin-top: 2px;
  font-size: 11px;
  color: var(--ant-color-text-tertiary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.device-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.device-item__header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  font-size: 13px;
  color: var(--ant-color-text);
}

.device-item__count {
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--ant-color-text-secondary);
}

/* notification */
.notif-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.notif-item {
  padding: 10px 12px;
  border-radius: 8px;
  transition: background 0.2s;

  &:hover {
    background: var(--ant-color-bg-layout);
  }
}

.notif-item--unread {
  background: var(--ant-color-primary-bg);
}

.notif-item__head {
  display: flex;
  align-items: center;
  gap: 8px;
}

.notif-item__title {
  font-size: 13px;
  color: var(--ant-color-text);
  flex: 1;
}

.notif-item__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--ant-color-primary);
  flex: none;
}

.notif-item__time {
  margin-top: 2px;
  font-size: 11px;
  color: var(--ant-color-text-tertiary);
}

/* calendar */
.calendar-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.calendar-day {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  padding: 8px 0;
  border-bottom: 1px solid var(--ant-color-border-secondary);

  &:last-child {
    border-bottom: none;
  }
}

.calendar-day__date {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 36px;
  flex: none;
}

.calendar-day__num {
  font-size: 18px;
  font-weight: 700;
  color: var(--ant-color-text);
  font-variant-numeric: tabular-nums;
}

.calendar-day__label {
  font-size: 10px;
  color: var(--ant-color-text-quaternary);
}

.calendar-day__items {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding-top: 2px;
}
</style>
