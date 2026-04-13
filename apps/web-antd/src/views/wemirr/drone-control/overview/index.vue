<script lang="ts" setup name="DroneControlOverviewPage">
import { Page } from '@vben/common-ui';

import { useRouter } from 'vue-router';

import { Icon } from '@iconify/vue';
import {
  Badge,
  Card,
  Col,
  Progress,
  Row,
  Statistic,
  Tag,
} from 'ant-design-vue';

const router = useRouter();

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

function nav(path: string) {
  router.push(path);
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
      <Row :gutter="[16, 16]">
        <Col v-for="item in stats" :key="item.title" :lg="6" :md="12" :span="24">
          <Card :bordered="false">
            <Statistic :suffix="item.suffix" :title="item.title" :value="item.value" />
          </Card>
        </Col>
      </Row>

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
              <a class="text-xs" @click="nav('/device/uav')">详情 ></a>
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
</style>
