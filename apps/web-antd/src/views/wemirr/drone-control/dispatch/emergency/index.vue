<script lang="ts" setup name="EmergencyPage">
import { Page } from '@vben/common-ui';

import { nextTick, onMounted, ref } from 'vue';

import {
  Badge,
  Button,
  Card,
  Col,
  Descriptions,
  DescriptionsItem,
  Form,
  FormItem,
  Input,
  Modal,
  Row,
  Select,
  SelectOption,
  Steps,
  Table,
  Tag,
  Timeline,
  TimelineItem,
  message,
} from 'ant-design-vue';

import { useMap } from '#/utils/map';

const mapRef = ref<HTMLElement | null>(null);
const { initMap, addMarker, addPolygon, addPolyline } = useMap(mapRef);

interface Plan {
  id: string;
  name: string;
  scene: string;
  level: string;
  resources: string[];
  airports: string[];
  steps: string[];
}

const plans: Plan[] = [
  {
    id: 'EP-001',
    name: '森林火灾应急响应',
    scene: '森林防火',
    level: '一级',
    resources: ['大航蜂 M30T-01', '大航蜂 M350-03', '大航蜂 M300-01'],
    airports: ['林草防火机场', '北坡应急起降点'],
    steps: ['触发告警 → AI 确认火情', '通知值班人员 + 林草局', '调派 3 架无人机持续监控', '引导地面消防队伍', '火情扑灭后持续巡查 2 小时'],
  },
  {
    id: 'EP-002',
    name: '重大交通事故响应',
    scene: '交通巡查',
    level: '二级',
    resources: ['大航蜂 FP-02', '大航蜂 M300-05'],
    airports: ['交通主干道机场'],
    steps: ['触发告警 → AI 识别事故', '通知交管局 + 120 急救', '调派无人机现场直播', '引导交通疏导', '事故现场取证归档'],
  },
  {
    id: 'EP-003',
    name: '环境污染应急排查',
    scene: '环境监测',
    level: '二级',
    resources: ['大航蜂 M30T-06', '大航蜂 M350-02'],
    airports: ['水务巡检机场'],
    steps: ['触发告警 → 水质异常', '通知环保局 + 水务局', '调派无人机定位污染源', '采集水样 + 影像取证', '跟踪监测直至恢复正常'],
  },
  {
    id: 'EP-004',
    name: '工地安全事故响应',
    scene: '安全生产',
    level: '一级',
    resources: ['大航蜂 M300-12', '大航蜂 M30-09'],
    airports: ['城管巡检机场'],
    steps: ['触发告警 → 人员受伤/违规', '通知应急局 + 120', '调派无人机现场监控', '协助搜救与疏散', '事故调查取证'],
  },
];

const selectedPlan = ref<Plan | null>(null);
const activated = ref(false);
const activationStep = ref(0);

const activationTimeline = ref<{ time: string; text: string; color: string }[]>([]);

function selectPlan(plan: Plan) {
  selectedPlan.value = plan;
  activated.value = false;
  activationStep.value = 0;
  activationTimeline.value = [];
}

const launchModalVisible = ref(false);
const launchForm = ref({
  targetPoint: '',
  launchAirport: '',
  notifyPersonnel: '',
});

const airportCoords: Record<string, [number, number]> = {
  '林草防火机场': [108.88, 34.30],
  '北坡应急起降点': [108.90, 34.33],
  '交通主干道机场': [108.98, 34.22],
  '水务巡检机场': [108.87, 34.24],
  '城管巡检机场': [108.94, 34.20],
};
const targetCoords: Record<string, [number, number]> = {
  '北坡林区 37° 区域': [108.91, 34.31],
  '人民路交叉口': [108.95, 34.26],
  '渭河 K12 段': [108.88, 34.25],
  '工业区 B 区工地': [108.97, 34.24],
};

function activatePlan() {
  if (!selectedPlan.value) return;
  launchForm.value = {
    targetPoint: Object.keys(targetCoords)[0] || '',
    launchAirport: selectedPlan.value.airports[0] || '',
    notifyPersonnel: '值班主任、相关部门负责人',
  };
  launchModalVisible.value = true;
}

function confirmLaunch() {
  launchModalVisible.value = false;
  activated.value = true;
  activationStep.value = 0;
  activationTimeline.value = [];

  const target = targetCoords[launchForm.value.targetPoint];
  const airport = airportCoords[launchForm.value.launchAirport];
  if (target) {
    addMarker({ position: target, label: `事发点：${launchForm.value.targetPoint}` });
  }
  if (target && airport) {
    addPolyline({ path: [airport, target], strokeColor: '#ff4d4f', strokeWidth: 2 });
  }

  const now = new Date();
  const pad = (n: number) => `${n}`.padStart(2, '0');
  const timeStr = () => `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  const events = [
    { text: '预案启动，进入应急响应状态', color: 'red' },
    { text: `通知 ${launchForm.value.notifyPersonnel}`, color: 'blue' },
    { text: `事发点位：${launchForm.value.targetPoint}`, color: 'blue' },
    { text: `调度 ${selectedPlan.value!.resources.join('、')}`, color: 'blue' },
    { text: `${launchForm.value.launchAirport} 执行起飞准备`, color: 'green' },
    { text: '无人机已起飞，前往事发区域', color: 'green' },
  ];

  let i = 0;
  const timer = setInterval(() => {
    if (i >= events.length) {
      clearInterval(timer);
      message.success('应急资源已全部调度完成');
      return;
    }
    now.setSeconds(now.getSeconds() + 15);
    activationTimeline.value.push({
      time: timeStr(),
      text: events[i]!.text,
      color: events[i]!.color,
    });
    activationStep.value = i + 1;
    i++;
  }, 800);
}

const planColumns = [
  { title: '预案编号', dataIndex: 'id', key: 'id', width: 100 },
  { title: '预案名称', dataIndex: 'name', key: 'name' },
  { title: '场景', dataIndex: 'scene', key: 'scene', width: 100 },
  { title: '级别', dataIndex: 'level', key: 'level', width: 80 },
  { title: '无人机', key: 'count', width: 80 },
];

function levelColor(level: string) {
  return level === '一级' ? 'red' : 'orange';
}

onMounted(async () => {
  await nextTick();
  if (mapRef.value) {
    await initMap({ center: [108.94, 34.26], zoom: 12 });
    addMarker({ position: [108.88, 34.30], label: '林草防火机场' });
    addMarker({ position: [108.98, 34.22], label: '交通主干道机场' });
    addMarker({ position: [108.92, 34.32], label: '水务巡检机场' });
    addMarker({ position: [108.94, 34.20], label: '城管巡检机场' });
    addPolygon({
      path: [[108.90, 34.28], [108.96, 34.28], [108.96, 34.24], [108.90, 34.24]],
      fillColor: 'rgba(255,77,79,0.1)',
      strokeColor: '#ff4d4f',
      strokeWidth: 1,
    });
  }
});
</script>

<template>
  <Page>
    <Row :gutter="[16, 0]" class="h-full p-2">
      <Col :lg="10" :span="24">
        <div class="flex flex-col gap-3">
          <Card :bordered="false" size="small" title="应急预案库">
            <Table
              :columns="planColumns"
              :data-source="plans"
              :pagination="false"
              size="small"
              row-key="id"
              :row-class-name="(record: Plan) => record.id === selectedPlan?.id ? 'ant-table-row-selected' : ''"
              :custom-row="(record: Plan) => ({ onClick: () => selectPlan(record) })"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'level'">
                  <Tag :color="levelColor(record.level)" size="small">{{ record.level }}</Tag>
                </template>
                <template v-if="column.key === 'count'">
                  {{ record.resources.length }} 架
                </template>
              </template>
            </Table>
          </Card>

          <Card v-if="selectedPlan" :bordered="false" size="small" :title="selectedPlan.name">
            <Descriptions bordered :column="1" size="small">
              <DescriptionsItem label="预案编号">{{ selectedPlan.id }}</DescriptionsItem>
              <DescriptionsItem label="应用场景">{{ selectedPlan.scene }}</DescriptionsItem>
              <DescriptionsItem label="响应级别">
                <Tag :color="levelColor(selectedPlan.level)">{{ selectedPlan.level }}</Tag>
              </DescriptionsItem>
              <DescriptionsItem label="调度设备">
                <div class="flex flex-wrap gap-1">
                  <Tag v-for="r in selectedPlan.resources" :key="r" size="small">{{ r }}</Tag>
                </div>
              </DescriptionsItem>
              <DescriptionsItem label="起飞机场">
                {{ selectedPlan.airports.join('、') }}
              </DescriptionsItem>
            </Descriptions>

            <div class="mt-3 mb-2 text-sm font-semibold" style="color: var(--ant-color-text)">响应步骤</div>
            <Steps direction="vertical" size="small" :current="activated ? activationStep : -1">
              <Steps.Step v-for="(s, i) in selectedPlan.steps" :key="i" :title="s" />
            </Steps>

            <Button
              type="primary"
              danger
              block
              class="mt-4"
              :disabled="activated"
              @click="activatePlan"
            >
              {{ activated ? '预案已启动' : '启动预案' }}
            </Button>
          </Card>

          <Card v-if="activated && activationTimeline.length > 0" :bordered="false" size="small" title="实时指挥日志">
            <Timeline>
              <TimelineItem v-for="(e, i) in activationTimeline" :key="i" :color="e.color">
                <span class="text-xs" style="color: var(--ant-color-text-tertiary)">{{ e.time }}</span>
                <div class="text-sm" style="color: var(--ant-color-text)">{{ e.text }}</div>
              </TimelineItem>
            </Timeline>
          </Card>
        </div>
      </Col>

      <Col :lg="14" :span="24">
        <Card :bordered="false" class="map-card">
          <div ref="mapRef" class="emergency-map" />
        </Card>
      </Col>
    </Row>

    <Modal v-model:open="launchModalVisible" title="启动应急响应" ok-text="确认启动" @ok="confirmLaunch">
      <Form layout="vertical">
        <FormItem label="事发点位">
          <Select v-model:value="launchForm.targetPoint" style="width: 100%">
            <SelectOption v-for="p in Object.keys(targetCoords)" :key="p" :value="p">{{ p }}</SelectOption>
          </Select>
        </FormItem>
        <FormItem label="起飞机场">
          <Select v-model:value="launchForm.launchAirport" style="width: 100%">
            <SelectOption v-for="a in (selectedPlan?.airports || [])" :key="a" :value="a">{{ a }}</SelectOption>
          </Select>
        </FormItem>
        <FormItem label="通知人员">
          <Input v-model:value="launchForm.notifyPersonnel" />
        </FormItem>
        <FormItem label="调度设备">
          <div class="flex flex-wrap gap-1">
            <Tag v-for="r in (selectedPlan?.resources || [])" :key="r" color="blue">{{ r }}</Tag>
          </div>
        </FormItem>
      </Form>
    </Modal>
  </Page>
</template>

<style lang="less" scoped>
.emergency-map {
  height: calc(100vh - 200px);
  min-height: 500px;
  border-radius: 8px;
  overflow: hidden;
}

.map-card {
  height: 100%;

  :deep(.ant-card-body) {
    padding: 0;
    height: 100%;
  }
}
</style>
