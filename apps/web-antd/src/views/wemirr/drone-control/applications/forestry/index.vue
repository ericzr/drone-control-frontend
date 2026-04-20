<script lang="ts" setup name="ApplicationForestryInspectionPage">
import { Page } from '@vben/common-ui';

import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import {
  Button,
  Card,
  Col,
  Progress,
  Row,
  Space,
  Statistic,
  Tag,
} from 'ant-design-vue';

import { useMap } from '#/utils/map';

type ZoneRisk = '高' | '中' | '低';
type QueueStatus = '待起飞' | '巡检中' | '待研判' | '处置中';

interface ForestryZone {
  id: string;
  name: string;
  risk: ZoneRisk;
  center: [number, number];
  airport: string;
  airportPosition: [number, number];
  assets: string;
  summary: string;
  path: [number, number][];
}

const router = useRouter();
const mapRef = ref<HTMLElement | null>(null);
const { initMap, destroyMap, addMarker, addPolygon, addPolyline } =
  useMap(mapRef);

const stats = [
  { title: '今日巡检片区', value: 12, suffix: '个' },
  { title: '待核查火点', value: 3, suffix: '处' },
  { title: '违规垦荒线索', value: 6, suffix: '条' },
  { title: '病虫害疑似点', value: 9, suffix: '处' },
] as const;

const zones: ForestryZone[] = [
  {
    id: 'zone-1',
    name: '北坡森林防火核心区',
    risk: '高',
    center: [108.887, 34.304],
    airport: '北坡防火机场',
    airportPosition: [108.868, 34.289],
    assets: '2 机场 / 5 架无人机 / 18 路摄像头',
    summary: '火情高发时段已进入橙色预警，建议继续保持双机轮巡。',
    path: [
      [108.857, 34.324],
      [108.915, 34.321],
      [108.928, 34.295],
      [108.876, 34.278],
    ],
  },
  {
    id: 'zone-2',
    name: '南麓生态修复带',
    risk: '中',
    center: [108.951, 34.255],
    airport: '生态修复机场',
    airportPosition: [108.934, 34.246],
    assets: '1 机场 / 3 架无人机 / 7 台巡护机器人',
    summary: '资源破坏复查任务较密集，建议与地面巡护机器人协同执行。',
    path: [
      [108.925, 34.274],
      [108.975, 34.271],
      [108.985, 34.246],
      [108.938, 34.232],
    ],
  },
  {
    id: 'zone-3',
    name: '西川林草病虫害普查区',
    risk: '中',
    center: [108.824, 34.286],
    airport: '西川巡检机场',
    airportPosition: [108.805, 34.274],
    assets: '1 机场 / 4 架无人机 / 12 路虫情相机',
    summary: '病虫害疑似点连续增长，建议安排多光谱航线开展复核。',
    path: [
      [108.792, 34.306],
      [108.852, 34.302],
      [108.861, 34.275],
      [108.81, 34.258],
    ],
  },
];

const activeZoneId = ref(zones[0]?.id ?? '');

const activeZone = computed(() => {
  return zones.find((item) => item.id === activeZoneId.value) ?? zones[0];
});

const resourceGroups = [
  { label: '区域机场', total: 6, available: 5, tip: '3 个机场支持自动值守轮巡' },
  { label: '巡检无人机', total: 28, available: 21, tip: '含红外、多光谱与喊话机型' },
  { label: '视频感知点位', total: 64, available: 57, tip: '接入林区卡口、瞭望塔与热成像点位' },
  { label: '地面巡护单元', total: 14, available: 10, tip: '包含机器人与巡护车协同资源' },
] as const;

const taskTemplates = [
  {
    title: '火情巡检',
    desc: '面向高风险林区进行晨昏双巡，联动红外机型、瞭望视频与火点识别模型。',
    assets: '红外无人机 + 机场值守 + 瞭望摄像头',
    ai: '烟火识别 / 热异常检测',
    accent: '#ef4444',
    path: '/dispatch/task',
  },
  {
    title: '违规垦荒监测',
    desc: '对重点边界片区进行定期比对巡查，输出疑似图斑与复核清单。',
    assets: '多旋翼无人机 + 正射影像',
    ai: '地表变化检测 / 图斑比对',
    accent: '#f59e0b',
    path: '/ai-center/task',
  },
  {
    title: '资源破坏复查',
    desc: '对盗伐、道路开挖、施工侵占等疑似线索，快速编组近端资产复查。',
    assets: '机场 + 巡护机器人 + 车载终端',
    ai: '目标检测 / 处置建议',
    accent: '#22c55e',
    path: '/event/list',
  },
  {
    title: '病虫害普查',
    desc: '面向重点林带开展多光谱巡检，结合历史趋势生成专题报告。',
    assets: '多光谱无人机 + 虫情相机',
    ai: '病虫害识别 / 趋势分析',
    accent: '#6366f1',
    path: '/ai-center/detect-history',
  },
] as const;

const taskQueue = [
  {
    id: 'FRT-240418-01',
    title: '北坡林区午后火情巡检',
    zone: '北坡森林防火核心区',
    window: '14:10 - 15:20',
    asset: '北坡防火机场 / M30T-02',
    status: '巡检中' as QueueStatus,
  },
  {
    id: 'FRT-240418-02',
    title: '西川病虫害复核航线',
    zone: '西川林草病虫害普查区',
    window: '15:30 - 16:50',
    asset: '西川巡检机场 / 多光谱机组',
    status: '待起飞' as QueueStatus,
  },
  {
    id: 'FRT-240418-03',
    title: '南麓疑似垦荒图斑复查',
    zone: '南麓生态修复带',
    window: '16:00 - 17:10',
    asset: '生态修复机场 / 巡护机器人 02',
    status: '待研判' as QueueStatus,
  },
  {
    id: 'FRT-240418-04',
    title: '北坡火点核查处置',
    zone: '北坡森林防火核心区',
    window: '立即处置',
    asset: '林草局值守组 / 应急飞手班',
    status: '处置中' as QueueStatus,
  },
] as const;

const clueList = [
  {
    id: 'CL-01',
    title: '疑似烟点',
    area: '北坡 7 号瞭望区',
    level: '高' as ZoneRisk,
    source: '红外无人机',
    suggestion: '转事件中心并触发应急复查工单',
  },
  {
    id: 'CL-02',
    title: '违规垦荒图斑',
    area: '南麓生态修复带东侧',
    level: '中' as ZoneRisk,
    source: '变化检测模型',
    suggestion: '补派低空复飞与地面踏查协同任务',
  },
  {
    id: 'CL-03',
    title: '病虫害疑似扩散',
    area: '西川 3 号样带',
    level: '中' as ZoneRisk,
    source: '虫情相机 + 多光谱分析',
    suggestion: '关联历史检测结果，生成专题周报',
  },
] as const;

const collaborationLinks = [
  { label: '进入调度中心', hint: '统一编排机场、无人机与地面资源', path: '/dispatch/resource' },
  { label: '查看空域资源', hint: '确认飞行窗口与空域占用冲突', path: '/flight/airspace-resource' },
  { label: '进入事件闭环', hint: '将专题线索转入事件与工单', path: '/event/list' },
  { label: '查看 AI 历史', hint: '复盘检测结果并沉淀专题报告', path: '/ai-center/detect-history' },
] as const;

function zoneRiskColor(risk: ZoneRisk) {
  if (risk === '高') return 'red';
  if (risk === '中') return 'gold';
  return 'green';
}

function queueStatusColor(status: QueueStatus) {
  if (status === '巡检中') return 'blue';
  if (status === '待起飞') return 'default';
  if (status === '待研判') return 'orange';
  return 'red';
}

function progressPercent(available: number, total: number) {
  return Math.round((available / total) * 100);
}

function nav(path: string) {
  router.push(path);
}

function focusZone(zone: ForestryZone) {
  activeZoneId.value = zone.id;
}

async function renderMap() {
  const zone = activeZone.value;
  if (!zone) return;

  destroyMap();
  await nextTick();
  if (!mapRef.value) return;

  await initMap({
    center: zone.center,
    zoom: 11.8,
  });

  zones.forEach((item) => {
    const isActive = item.id === activeZoneId.value;
    addPolygon({
      path: item.path,
      fillColor: isActive ? '#22c55e33' : '#1677ff22',
      strokeColor: isActive ? '#22c55e' : '#60a5fa',
      strokeWidth: isActive ? 3 : 2,
    });
    addMarker({
      position: item.center,
      label: item.name,
    });
    addMarker({
      position: item.airportPosition,
      label: `${item.airport} · 机场`,
    });
    addPolyline({
      path: [item.airportPosition, item.center],
      color: isActive ? '#22c55e' : '#38bdf8',
      width: isActive ? 3 : 2,
    });
  });
}

onMounted(async () => {
  await renderMap();
});

watch(activeZoneId, async () => {
  await renderMap();
});
</script>

<template>
  <Page>
    <div class="forestry-page">
      <Card :bordered="false">
        <div class="hero-card">
          <div class="hero-card__main">
            <div class="hero-card__title">专题应用 · 林草巡检专题</div>
            <div class="hero-card__desc">
              基于云界空域OS 的全域统飞底座，为林草部门提供垂直任务管理工作台。可直接调动区域机场、无人机、摄像头、巡护机器人与 AI
              模型，完成火情发现、违规垦荒、资源破坏和病虫害监测等专题任务。
            </div>
          </div>
          <div class="hero-card__actions">
            <Space wrap>
              <Tag color="blue">平台底座承载</Tag>
              <Tag color="green">部门专题作业</Tag>
              <Tag color="orange">多资产协同</Tag>
              <Tag color="purple">AI 识别联动</Tag>
            </Space>
            <Space wrap>
              <Button type="primary" @click="nav('/dispatch/task')">创建专题任务</Button>
              <Button @click="nav('/flight/airspace-resource')">查看空域窗口</Button>
            </Space>
          </div>
        </div>
      </Card>

      <Row :gutter="[16, 16]">
        <Col v-for="item in stats" :key="item.title" :lg="6" :md="12" :span="24">
          <Card :bordered="false">
            <Statistic :suffix="item.suffix" :title="item.title" :value="item.value" />
          </Card>
        </Col>
      </Row>

      <Row :gutter="[16, 16]">
        <Col :lg="15" :span="24">
          <Card :bordered="false" title="林草片区态势">
            <template #extra>
              <Space wrap>
                <Tag color="red">高风险 1</Tag>
                <Tag color="gold">中风险 2</Tag>
                <Tag color="green">可调用机场 5</Tag>
              </Space>
            </template>
            <div class="map-panel">
              <div ref="mapRef" class="map-panel__canvas" />
              <div class="map-panel__overlay">
                <div v-if="activeZone" class="map-panel__focus">
                  <span class="map-panel__focus-label">当前焦点片区</span>
                  <div class="map-panel__focus-title">
                    {{ activeZone.name }}
                    <Tag :color="zoneRiskColor(activeZone.risk)">{{ activeZone.risk }}风险</Tag>
                  </div>
                  <div class="map-panel__focus-meta">{{ activeZone.assets }}</div>
                  <div class="map-panel__focus-meta">{{ activeZone.summary }}</div>
                </div>
                <div class="map-panel__zones">
                  <button
                    v-for="zone in zones"
                    :key="zone.id"
                    class="zone-chip"
                    :class="{ 'zone-chip--active': zone.id === activeZoneId }"
                    @click="focusZone(zone)"
                  >
                    <span>{{ zone.name }}</span>
                    <Tag :color="zoneRiskColor(zone.risk)">{{ zone.risk }}</Tag>
                  </button>
                </div>
              </div>
            </div>
          </Card>
        </Col>

        <Col :lg="9" :span="24">
          <Card :bordered="false" title="区域资源编组">
            <div class="resource-list">
              <div v-for="item in resourceGroups" :key="item.label" class="resource-item">
                <div class="resource-item__head">
                  <span class="resource-item__title">{{ item.label }}</span>
                  <span class="resource-item__value">{{ item.available }} / {{ item.total }}</span>
                </div>
                <Progress :percent="progressPercent(item.available, item.total)" :show-info="false" size="small" />
                <div class="resource-item__tip">{{ item.tip }}</div>
              </div>
            </div>
          </Card>

          <Card :bordered="false" title="专题处置链路" class="mt-4">
            <div class="chain-list">
              <div class="chain-item">
                <span class="chain-item__index">01</span>
                <div>
                  <div class="chain-item__title">任务编排</div>
                  <div class="chain-item__desc">按片区、时段与风险等级选择机场与机组</div>
                </div>
              </div>
              <div class="chain-item">
                <span class="chain-item__index">02</span>
                <div>
                  <div class="chain-item__title">AI 识别联动</div>
                  <div class="chain-item__desc">火点、图斑、病虫害结果自动回写专题线索池</div>
                </div>
              </div>
              <div class="chain-item">
                <span class="chain-item__index">03</span>
                <div>
                  <div class="chain-item__title">事件闭环</div>
                  <div class="chain-item__desc">疑似问题一键转事件、转工单并跟踪处置反馈</div>
                </div>
              </div>
              <div class="chain-item">
                <span class="chain-item__index">04</span>
                <div>
                  <div class="chain-item__title">专题复盘</div>
                  <div class="chain-item__desc">沉淀影像、轨迹、检测与处置结果形成报告</div>
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row :gutter="[16, 16]">
        <Col :lg="12" :span="24">
          <Card :bordered="false" title="专题任务模板">
            <div class="template-list">
              <div
                v-for="item in taskTemplates"
                :key="item.title"
                class="template-card"
                :style="{ '--accent': item.accent }"
              >
                <div class="template-card__head">
                  <div class="template-card__title">{{ item.title }}</div>
                  <Button type="link" size="small" @click="nav(item.path)">进入</Button>
                </div>
                <div class="template-card__desc">{{ item.desc }}</div>
                <div class="template-card__meta">资源编组：{{ item.assets }}</div>
                <div class="template-card__meta">算法支撑：{{ item.ai }}</div>
              </div>
            </div>
          </Card>
        </Col>

        <Col :lg="12" :span="24">
          <Card :bordered="false" title="今日任务队列">
            <div class="queue-list">
              <div v-for="item in taskQueue" :key="item.id" class="queue-item">
                <div class="queue-item__head">
                  <div>
                    <div class="queue-item__title">{{ item.title }}</div>
                    <div class="queue-item__meta">{{ item.zone }} · {{ item.window }}</div>
                  </div>
                  <Tag :color="queueStatusColor(item.status)">{{ item.status }}</Tag>
                </div>
                <div class="queue-item__asset">{{ item.asset }}</div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row :gutter="[16, 16]">
        <Col :lg="14" :span="24">
          <Card :bordered="false" title="专题线索池">
            <div class="clue-list">
              <div v-for="item in clueList" :key="item.id" class="clue-item">
                <div class="clue-item__head">
                  <div class="clue-item__title">{{ item.title }}</div>
                  <Tag :color="zoneRiskColor(item.level)">{{ item.level }}优先</Tag>
                </div>
                <div class="clue-item__meta">{{ item.area }} · 来源：{{ item.source }}</div>
                <div class="clue-item__desc">{{ item.suggestion }}</div>
              </div>
            </div>
          </Card>
        </Col>

        <Col :lg="10" :span="24">
          <Card :bordered="false" title="平台联动入口">
            <div class="link-list">
              <button
                v-for="item in collaborationLinks"
                :key="item.label"
                class="link-item"
                @click="nav(item.path)"
              >
                <div class="link-item__title">{{ item.label }}</div>
                <div class="link-item__hint">{{ item.hint }}</div>
              </button>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  </Page>
</template>

<style lang="less" scoped>
.forestry-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 8px;
}

.hero-card {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.hero-card__main {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.hero-card__title {
  font-size: 24px;
  font-weight: 700;
  color: var(--ant-color-text);
}

.hero-card__desc {
  max-width: 860px;
  line-height: 1.75;
  color: var(--ant-color-text-description);
}

.hero-card__actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
}

.map-panel {
  position: relative;
  overflow: hidden;
  border-radius: 16px;
  min-height: 430px;
  background:
    radial-gradient(circle at top, rgb(56 189 248 / 14%), transparent 45%),
    linear-gradient(180deg, rgb(15 23 42 / 3%), rgb(15 23 42 / 10%));
}

.map-panel__canvas {
  width: 100%;
  height: 430px;
}

.map-panel__overlay {
  pointer-events: none;
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 16px;
}

.map-panel__focus {
  pointer-events: auto;
  width: min(360px, 100%);
  border: 1px solid rgb(255 255 255 / 18%);
  border-radius: 16px;
  padding: 14px 16px;
  backdrop-filter: blur(14px);
  background: rgb(15 23 42 / 54%);
  color: #e2e8f0;
  box-shadow: 0 18px 40px rgb(15 23 42 / 18%);
}

.map-panel__focus-label {
  font-size: 12px;
  color: rgb(148 163 184);
}

.map-panel__focus-title {
  margin-top: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
}

.map-panel__focus-meta {
  margin-top: 6px;
  font-size: 13px;
  line-height: 1.6;
  color: rgb(203 213 225);
}

.map-panel__zones {
  pointer-events: auto;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.zone-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid rgb(255 255 255 / 16%);
  border-radius: 999px;
  padding: 8px 12px;
  backdrop-filter: blur(12px);
  background: rgb(15 23 42 / 54%);
  color: #e2e8f0;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    background 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    border-color: rgb(56 189 248 / 55%);
  }
}

.zone-chip--active {
  border-color: rgb(34 197 94 / 65%);
  background: rgb(15 23 42 / 72%);
}

.resource-list,
.template-list,
.queue-list,
.clue-list,
.link-list,
.chain-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.resource-item {
  border-radius: 12px;
  padding: 14px;
  background: var(--ant-color-fill-quaternary);
}

.resource-item__head,
.queue-item__head,
.clue-item__head,
.template-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.resource-item__title,
.template-card__title,
.queue-item__title,
.clue-item__title,
.chain-item__title,
.link-item__title {
  font-size: 15px;
  font-weight: 600;
  color: var(--ant-color-text);
}

.resource-item__value {
  font-weight: 600;
  color: var(--ant-color-text-secondary);
}

.resource-item__tip,
.template-card__meta,
.queue-item__meta,
.queue-item__asset,
.clue-item__meta,
.clue-item__desc,
.chain-item__desc,
.link-item__hint {
  margin-top: 6px;
  font-size: 12px;
  line-height: 1.65;
  color: var(--ant-color-text-tertiary);
}

.template-card {
  border-left: 4px solid var(--accent);
  border-radius: 14px;
  padding: 16px;
  background: linear-gradient(180deg, var(--ant-color-fill-quaternary), rgb(255 255 255 / 0%));
}

.template-card__desc {
  margin-top: 8px;
  line-height: 1.7;
  color: var(--ant-color-text-description);
}

.queue-item,
.clue-item {
  border-radius: 12px;
  padding: 14px;
  border: 1px solid var(--ant-color-border-secondary);
  background: var(--ant-color-bg-container);
}

.chain-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.chain-item__index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 999px;
  background: var(--ant-color-primary-bg);
  color: var(--ant-color-primary);
  font-size: 12px;
  font-weight: 700;
}

.link-item {
  text-align: left;
  border: 1px solid var(--ant-color-border-secondary);
  border-radius: 14px;
  padding: 14px 16px;
  background: linear-gradient(135deg, rgb(22 119 255 / 6%), rgb(34 197 94 / 4%));
  cursor: pointer;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    border-color: rgb(22 119 255 / 35%);
  }
}

@media (max-width: 992px) {
  .hero-card {
    flex-direction: column;
  }

  .hero-card__actions {
    align-items: flex-start;
  }

  .map-panel,
  .map-panel__canvas {
    min-height: 360px;
    height: 360px;
  }
}
</style>
