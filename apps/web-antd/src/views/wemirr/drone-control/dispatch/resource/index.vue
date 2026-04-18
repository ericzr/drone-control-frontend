<script lang="ts" setup name="DispatchResourcePage">
import { Page } from '@vben/common-ui';

import { computed, ref } from 'vue';

import {
  Badge,
  Button,
  Card,
  Col,
  Descriptions,
  DescriptionsItem,
  Modal,
  Row,
  Select,
  SelectOption,
  Space,
  Tag,
  message,
} from 'ant-design-vue';

interface Resource {
  id: string;
  name: string;
  type: string;
  dept: string;
  status: string;
  location: string;
  battery?: number;
}

const resources = ref<Resource[]>([
  { id: '1', name: '大航蜂 M300-01', type: '无人机', dept: '飞行一队', status: '空闲', location: '高新区一号机场', battery: 92 },
  { id: '2', name: '大航蜂 M30T-02', type: '无人机', dept: '飞行一队', status: '执行中', location: '北坡林区', battery: 64 },
  { id: '3', name: '大航蜂 M350-03', type: '无人机', dept: '飞行二队', status: '空闲', location: '水务巡检机场', battery: 88 },
  { id: '4', name: '大航蜂 FP-04', type: '无人机', dept: '巡检组', status: '充电中', location: '城管巡检机场', battery: 35 },
  { id: '5', name: '大航蜂 M30-06', type: '无人机', dept: '应急组', status: '空闲', location: '水务巡检机场', battery: 95 },
  { id: '6', name: '大航蜂 M300-07', type: '无人机', dept: '飞行二队', status: '维护中', location: '光伏巡检机场', battery: 0 },
  { id: '7', name: '大航蜂 M30T-08', type: '无人机', dept: '培训组', status: '空闲', location: '培训基地', battery: 78 },
  { id: '8', name: '大航蜂 M300-12', type: '无人机', dept: '应急组', status: '空闲', location: '应急起降点', battery: 100 },
  { id: '9', name: '张伟', type: '飞手', dept: '飞行一队', status: '执行中', location: '北坡林区' },
  { id: '10', name: '李明', type: '飞手', dept: '飞行一队', status: '空闲', location: '基地' },
  { id: '11', name: '王芳', type: '飞手', dept: '飞行二队', status: '空闲', location: '基地' },
  { id: '12', name: '赵强', type: '飞手', dept: '巡检组', status: '休息', location: '-' },
  { id: '13', name: '刘洋', type: '飞手', dept: '培训组', status: '培训中', location: '培训基地' },
  { id: '14', name: '陈静', type: '飞手', dept: '飞行二队', status: '空闲', location: '基地' },
]);

const departments = ['全部', '飞行一队', '飞行二队', '巡检组', '应急组', '培训组'];
const filterDept = ref('全部');
const filterType = ref('全部');

const filteredResources = computed(() => {
  return resources.value.filter((r) => {
    if (filterDept.value !== '全部' && r.dept !== filterDept.value) return false;
    if (filterType.value !== '全部' && r.type !== filterType.value) return false;
    return true;
  });
});

function statusColor(s: string) {
  if (s === '空闲') return 'success';
  if (s === '执行中') return 'processing';
  if (s === '充电中') return 'warning';
  if (s === '维护中') return 'error';
  if (s === '培训中') return 'processing';
  return 'default';
}

function statusTagColor(s: string) {
  if (s === '空闲') return 'green';
  if (s === '执行中') return 'blue';
  if (s === '充电中') return 'orange';
  if (s === '维护中') return 'red';
  if (s === '培训中') return 'purple';
  return 'default';
}

// Department summary
const deptSummary = computed(() => {
  const depts = ['飞行一队', '飞行二队', '巡检组', '应急组', '培训组'];
  return depts.map((d) => {
    const items = resources.value.filter((r) => r.dept === d);
    const drones = items.filter((r) => r.type === '无人机');
    const pilots = items.filter((r) => r.type === '飞手');
    const available = items.filter((r) => r.status === '空闲').length;
    return { dept: d, total: items.length, drones: drones.length, pilots: pilots.length, available };
  });
});

// Gantt-like schedule
interface ScheduleItem {
  id: string;
  task: string;
  resource: string;
  start: number;
  end: number;
  color: string;
}

const scheduleItems: ScheduleItem[] = [
  { id: '1', task: '北坡林区晨巡', resource: 'M30T-02 / 张伟', start: 6, end: 8, color: '#3b82f6' },
  { id: '2', task: '高新主干道日巡', resource: 'M300-01 / 李明', start: 8, end: 10, color: '#3b82f6' },
  { id: '3', task: '渭河排污排查', resource: 'M350-03 / 王芳', start: 9, end: 12, color: '#10b981' },
  { id: '4', task: '工业区违建排查', resource: 'FP-04 / 赵强', start: 8, end: 10, color: '#f59e0b' },
  { id: '5', task: '光伏电站巡检', resource: 'M300-07 / 陈静', start: 10, end: 11, color: '#8b5cf6' },
  { id: '6', task: '交通早高峰监控', resource: 'M300-01 / 李明', start: 7, end: 9, color: '#ef4444' },
  { id: '7', task: '北坡林区午巡', resource: 'M30T-02 / 张伟', start: 13, end: 15, color: '#3b82f6' },
  { id: '8', task: '夜间红外巡检', resource: 'M30T-08 / 刘洋', start: 20, end: 22, color: '#06b6d4' },
  { id: '9', task: '应急演练', resource: 'M300-12 / 张伟', start: 15, end: 17, color: '#ef4444' },
];

const hours = Array.from({ length: 17 }, (_, i) => i + 6);

function hasConflict(item: ScheduleItem) {
  return scheduleItems.some(
    (other) => other.id !== item.id && other.resource === item.resource && other.start < item.end && other.end > item.start,
  );
}

const ganttDetailVisible = ref(false);
const ganttDetailItem = ref<ScheduleItem | null>(null);

function openGanttDetail(item: ScheduleItem) {
  ganttDetailItem.value = item;
  ganttDetailVisible.value = true;
}

// Smart dispatch
const dispatchVisible = ref(false);
const dispatchTask = ref('');
const dispatchResult = ref<{ resource: string; reason: string } | null>(null);

function openSmartDispatch() {
  dispatchTask.value = '';
  dispatchResult.value = null;
  dispatchVisible.value = true;
}

function runSmartDispatch() {
  if (!dispatchTask.value) {
    message.warning('请输入任务描述');
    return;
  }
  const available = resources.value.filter((r) => r.type === '无人机' && r.status === '空闲' && (r.battery ?? 0) > 50);
  if (available.length === 0) {
    dispatchResult.value = { resource: '无可用资源', reason: '所有无人机均在执行任务或电量不足' };
    return;
  }
  const best = available.sort((a, b) => (b.battery ?? 0) - (a.battery ?? 0))[0]!;
  const pilot = resources.value.find((r) => r.type === '飞手' && r.status === '空闲');
  dispatchResult.value = {
    resource: `${best.name}（电量 ${best.battery}%）${pilot ? ` + ${pilot.name}` : ''}`,
    reason: `选择电量最高的空闲无人机，位于${best.location}${pilot ? `，匹配空闲飞手 ${pilot.name}` : ''}`,
  };
}
</script>

<template>
  <Page>
    <div class="flex flex-col gap-3 p-2">
      <!-- Department Summary -->
      <Row :gutter="[12, 12]">
        <Col v-for="d in deptSummary" :key="d.dept" :lg="{ span: 4 }" :md="{ span: 8 }" :span="12">
          <Card :bordered="false" size="small" class="dept-card" @click="filterDept = d.dept">
            <div class="dept-card__name">{{ d.dept }}</div>
            <div class="dept-card__stats">
              <span>{{ d.drones }} 机</span>
              <span>{{ d.pilots }} 人</span>
              <Tag :color="d.available > 0 ? 'green' : 'red'" size="small">{{ d.available }} 可用</Tag>
            </div>
          </Card>
        </Col>
      </Row>

      <Row :gutter="[16, 16]">
        <!-- Resource Pool -->
        <Col :lg="10" :span="24">
          <Card :bordered="false" size="small" title="资源池">
            <template #extra>
              <Space>
                <Select v-model:value="filterDept" size="small" style="width: 100px">
                  <SelectOption v-for="d in departments" :key="d" :value="d">{{ d }}</SelectOption>
                </Select>
                <Select v-model:value="filterType" size="small" style="width: 90px">
                  <SelectOption value="全部">全部</SelectOption>
                  <SelectOption value="无人机">无人机</SelectOption>
                  <SelectOption value="飞手">飞手</SelectOption>
                </Select>
                <Button type="primary" size="small" @click="openSmartDispatch">智能派单</Button>
              </Space>
            </template>

            <div class="resource-list">
              <div v-for="r in filteredResources" :key="r.id" class="res-item">
                <div class="res-item__left">
                  <Badge :status="statusColor(r.status)" />
                  <div>
                    <div class="res-item__name">{{ r.name }}</div>
                    <div class="res-item__meta">{{ r.dept }} · {{ r.location }}</div>
                  </div>
                </div>
                <div class="res-item__right">
                  <Tag :color="statusTagColor(r.status)" size="small">{{ r.status }}</Tag>
                  <span v-if="r.battery !== undefined" class="res-item__battery" :class="{ 'res-item__battery--low': r.battery < 30 }">
                    {{ r.battery }}%
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </Col>

        <!-- Gantt Schedule -->
        <Col :lg="14" :span="24">
          <Card :bordered="false" size="small" title="今日排程（甘特图）">
            <div class="gantt">
              <div class="gantt__header">
                <div class="gantt__label-col">任务 / 资源</div>
                <div class="gantt__timeline">
                  <span v-for="h in hours" :key="h" class="gantt__hour">{{ h }}:00</span>
                </div>
              </div>
              <div v-for="item in scheduleItems" :key="item.id" class="gantt__row">
                <div class="gantt__label-col">
                  <div class="gantt__task-name">{{ item.task }}</div>
                  <div class="gantt__resource-name">{{ item.resource }}</div>
                </div>
                <div class="gantt__timeline">
                  <div
                    class="gantt__bar"
                    :class="{ 'gantt__bar--conflict': hasConflict(item) }"
                    :style="{
                      left: `${((item.start - 6) / 17) * 100}%`,
                      width: `${((item.end - item.start) / 17) * 100}%`,
                      background: hasConflict(item) ? '#ef4444' : item.color,
                      cursor: 'pointer',
                    }"
                    @click="openGanttDetail(item)"
                  >
                    <span v-if="hasConflict(item)" class="gantt__conflict-icon">⚠</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>

    <!-- Gantt Task Detail -->
    <Modal v-model:open="ganttDetailVisible" title="排程任务详情" :footer="null" width="400">
      <template v-if="ganttDetailItem">
        <Descriptions bordered :column="1" size="small">
          <DescriptionsItem label="任务名称">{{ ganttDetailItem.task }}</DescriptionsItem>
          <DescriptionsItem label="执行资源">{{ ganttDetailItem.resource }}</DescriptionsItem>
          <DescriptionsItem label="开始时间">{{ ganttDetailItem.start }}:00</DescriptionsItem>
          <DescriptionsItem label="结束时间">{{ ganttDetailItem.end }}:00</DescriptionsItem>
          <DescriptionsItem label="时长">{{ ganttDetailItem.end - ganttDetailItem.start }} 小时</DescriptionsItem>
          <DescriptionsItem label="冲突检测">
            <Tag :color="hasConflict(ganttDetailItem) ? 'red' : 'green'">{{ hasConflict(ganttDetailItem) ? '存在资源冲突' : '无冲突' }}</Tag>
          </DescriptionsItem>
        </Descriptions>
      </template>
    </Modal>

    <!-- Smart Dispatch Modal -->
    <Modal v-model:open="dispatchVisible" title="智能派单" :footer="null" width="480">
      <div class="flex flex-col gap-4 py-2">
        <div>
          <div class="mb-1 text-sm" style="color: var(--ant-color-text)">任务描述</div>
          <input
            v-model="dispatchTask"
            class="dispatch-input"
            placeholder="如：北坡林区紧急巡检"
            @keyup.enter="runSmartDispatch"
          />
        </div>
        <Button type="primary" block @click="runSmartDispatch">匹配最优资源</Button>
        <Card v-if="dispatchResult" size="small" :bordered="false" style="background: var(--ant-color-bg-layout)">
          <div class="text-sm font-semibold" style="color: var(--ant-color-text)">推荐资源</div>
          <div class="mt-1 text-sm" style="color: var(--ant-color-primary)">{{ dispatchResult.resource }}</div>
          <div class="mt-2 text-xs" style="color: var(--ant-color-text-tertiary)">{{ dispatchResult.reason }}</div>
          <Button type="primary" size="small" class="mt-3" @click="dispatchVisible = false; message.success('已派单')">确认派单</Button>
        </Card>
      </div>
    </Modal>
  </Page>
</template>

<style lang="less" scoped>
.dept-card {
  cursor: pointer;
  transition: all 0.2s;
  &:hover { border-color: var(--ant-color-primary); }
}
.dept-card__name { font-size: 13px; font-weight: 600; color: var(--ant-color-text); }
.dept-card__stats { display: flex; align-items: center; gap: 8px; margin-top: 4px; font-size: 12px; color: var(--ant-color-text-tertiary); }

.resource-list { display: flex; flex-direction: column; gap: 4px; max-height: 480px; overflow-y: auto; }
.res-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 8px 10px; border-radius: 8px; transition: background 0.15s;
  &:hover { background: var(--ant-color-primary-bg); }
}
.res-item__left { display: flex; align-items: center; gap: 10px; }
.res-item__name { font-size: 13px; color: var(--ant-color-text); font-weight: 500; }
.res-item__meta { font-size: 11px; color: var(--ant-color-text-tertiary); }
.res-item__right { display: flex; align-items: center; gap: 8px; }
.res-item__battery { font-size: 11px; color: var(--ant-color-text-secondary); font-variant-numeric: tabular-nums; }
.res-item__battery--low { color: #ef4444; font-weight: 700; }

/* Gantt */
.gantt { overflow-x: auto; }
.gantt__header, .gantt__row { display: flex; align-items: center; min-height: 36px; }
.gantt__header { border-bottom: 1px solid var(--ant-color-border-secondary); }
.gantt__label-col { width: 160px; flex: none; padding: 4px 8px; }
.gantt__timeline { flex: 1; position: relative; display: flex; min-width: 600px; }
.gantt__hour { flex: 1; font-size: 10px; color: var(--ant-color-text-quaternary); text-align: center; font-variant-numeric: tabular-nums; }
.gantt__row { border-bottom: 1px solid var(--ant-color-border-secondary); }
.gantt__row .gantt__timeline { height: 36px; }
.gantt__task-name { font-size: 11px; color: var(--ant-color-text); font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 150px; }
.gantt__resource-name { font-size: 10px; color: var(--ant-color-text-quaternary); }
.gantt__bar {
  position: absolute; top: 6px; height: 24px; border-radius: 4px; opacity: 0.85;
  display: flex; align-items: center; justify-content: center;
}
.gantt__bar--conflict { animation: conflict-pulse 1.5s infinite; }
.gantt__conflict-icon { font-size: 12px; }
@keyframes conflict-pulse { 0%,100% { opacity: 0.85; } 50% { opacity: 0.5; } }

.dispatch-input {
  width: 100%; padding: 8px 12px; border: 1px solid var(--ant-color-border);
  border-radius: 8px; background: var(--ant-color-bg-container); color: var(--ant-color-text);
  font-size: 13px; outline: none;
  &:focus { border-color: var(--ant-color-primary); }
}
</style>
