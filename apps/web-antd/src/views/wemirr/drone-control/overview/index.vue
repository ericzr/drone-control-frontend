<script lang="ts" setup name="DroneControlOverviewPage">
import { Page } from '@vben/common-ui';

import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { Icon } from '@iconify/vue';
import {
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

function exportCsv(headers: string[], rows: string[][], filename: string) {
  const bom = '\uFEFF';
  const csv = bom + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
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
onMounted(() => {
  setTimeout(() => {
    loading.value = false;
  }, 600);
});

const stats = [
  { title: '纳管设备', value: 128, suffix: '台' },
  { title: '今日任务', value: 46, suffix: '个' },
  { title: '待复核告警', value: 17, suffix: '条' },
  { title: '在线模型', value: 12, suffix: '个' },
];

const modules = [
  { key: 'cmd', title: '指挥中心', desc: '全域态势一张图，多场景切换，AI 告警与数据驾驶舱', path: '/situation-board' },
  { key: 'dsp', title: '调度中心', desc: '综合态势、视频监控墙、任务调度', path: '/dispatch/situation' },
  { key: 'dev', title: '设备中心', desc: '无人机、机巢、机器狗、无人车、摄像头、传感器、充电站', path: '/device/uav' },
  { key: 'flt', title: '飞控中心', desc: '航线规划、计划管理、飞行作业、虚拟驾驶舱', path: '/flight/route-plan' },
  { key: 'evt', title: '事件中心', desc: '事件列表、事件复核、工单管理', path: '/event/list' },
  { key: 'ai', title: 'AI 模型中心', desc: '模型库、部署管理、评估报告、算法商城', path: '/ai-center/model-repo' },
];

const quickLinks = [
  { label: '无人机管理', path: '/device/uav', icon: 'mdi:quadcopter' },
  { label: '机巢管理', path: '/device/dock', icon: 'mdi:home-variant-outline' },
  { label: '航线规划', path: '/flight/route-plan', icon: 'mdi:map-marker-path' },
  { label: '虚拟驾驶舱', path: '/flight/cockpit', icon: 'mdi:steering' },
  { label: '综合态势', path: '/dispatch/situation', icon: 'mdi:earth' },
  { label: '视频监控', path: '/dispatch/video-wall', icon: 'mdi:monitor-multiple' },
  { label: '事件列表', path: '/event/list', icon: 'mdi:format-list-bulleted' },
  { label: '工单管理', path: '/event/workorder', icon: 'mdi:clipboard-flow-outline' },
  { label: '模型库', path: '/ai-center/model-repo', icon: 'mdi:database-outline' },
  { label: '算法商城', path: '/ai-center/marketplace', icon: 'mdi:store-outline' },
  { label: '评估报告', path: '/ai-center/evaluation', icon: 'mdi:chart-line' },
  { label: '部署管理', path: '/ai-center/deploy', icon: 'mdi:rocket-launch-outline' },
];

const recentAlerts = [
  { type: '烟雾告警', level: 'critical', location: '北坡 230m 处', time: '3 分钟前', scene: '森林防火' },
  { type: '违停检测', level: 'warning', location: '人民路交叉口', time: '15 分钟前', scene: '交通巡查' },
  { type: '未戴安全帽', level: 'critical', location: 'A 工地 3 号楼', time: '28 分钟前', scene: '安全生产' },
  { type: '管道泄漏', level: 'warning', location: '主管网 K8+500', time: '45 分钟前', scene: '热力巡检' },
  { type: '占道经营', level: 'info', location: '朝阳路步行街', time: '1 小时前', scene: '市政巡检' },
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

function notifIcon(type: string) {
  if (type === 'task') return '📋';
  if (type === 'alert') return '⚠️';
  return '🔔';
}

function calendarTypeColor(type: string) {
  if (type === 'task') return 'blue';
  if (type === 'training') return 'green';
  return 'orange';
}

function nav(path: string) {
  router.push(path);
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

function levelColor(level: string) {
  if (level === 'critical') return '#ff4d4f';
  if (level === 'warning') return '#faad14';
  return '#1677ff';
}

function levelText(level: string) {
  if (level === 'critical') return '紧急';
  if (level === 'warning') return '一般';
  return '提示';
}
</script>

<template>
  <Page>
    <div class="flex flex-col gap-4 p-2">
      <Skeleton :loading="loading" active :paragraph="{ rows: 1 }">
        <Row :gutter="[16, 16]">
          <Col v-for="item in stats" :key="item.title" :lg="6" :md="12" :span="24">
            <Card :bordered="false">
              <Statistic :suffix="item.suffix" :title="item.title" :value="item.value" />
            </Card>
          </Col>
        </Row>
      </Skeleton>

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
                <Icon :icon="link.icon" class="quick-item__icon" />
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
                v-for="(a, i) in recentAlerts"
                :key="i"
                class="alert-item"
                @click="nav('/event/list')"
              >
                <Badge :color="levelColor(a.level)" />
                <div class="alert-item__content">
                  <div class="alert-item__head">
                    <span class="alert-item__type">{{ a.type }}</span>
                    <Tag :color="levelColor(a.level)" size="small" :bordered="false">
                      {{ levelText(a.level) }}
                    </Tag>
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
          <Card :bordered="false" title="本月日程 · 4 月">
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
