<script lang="ts" setup name="FlightPlanManagePage">
import { Page } from '@vben/common-ui';

import { computed, onMounted, ref } from 'vue';

import { useFs } from '@fast-crud/fast-crud';

import {
  Badge,
  Button,
  Card,
  Checkbox,
  Col,
  DatePicker,
  Drawer,
  Form,
  FormItem,
  Input,
  InputNumber,
  Modal,
  Radio,
  RadioGroup,
  Row,
  Select,
  SelectOption,
  Space,
  Tag,
  TimePicker,
  message,
} from 'ant-design-vue';

import createCrudOptions from './crud';

const { crudBinding, crudRef, crudExpose } = useFs({ createCrudOptions });

const viewMode = ref<'calendar' | 'list'>('calendar');

// Calendar state
const currentYear = ref(2026);
const currentMonth = ref(3); // 0-indexed, April = 3

const monthNames = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];
const weekDays = ['一', '二', '三', '四', '五', '六', '日'];

interface CalendarTask {
  id: string;
  name: string;
  type: string;
  time: string;
  drone: string;
  airport: string;
  status: string;
  repeat: string;
  priority: string;
}

const tasks = ref<CalendarTask[]>([
  { id: '1', name: '高新主干道日巡', type: '定时任务', time: '08:30', drone: '大航蜂 M300-01', airport: '高新区一号机场', status: '执行中', repeat: '每日', priority: '普通' },
  { id: '2', name: '沿河排污口核查', type: '即时任务', time: '15:48', drone: '大航蜂 M30-06', airport: '水务巡检机场', status: '待执行', repeat: '单次', priority: '高' },
  { id: '3', name: '林草防火晨巡', type: '定时任务', time: '06:00', drone: '大航蜂 M30T-02', airport: '林草防火机场', status: '执行中', repeat: '每日', priority: '高' },
  { id: '4', name: '工业区违建排查', type: '周期任务', time: '09:00', drone: '大航蜂 FP-04', airport: '城管巡检机场', status: '待执行', repeat: '每周一三五', priority: '普通' },
  { id: '5', name: '光伏电站巡检', type: '周期任务', time: '10:00', drone: '大航蜂 M300-07', airport: '光伏巡检机场', status: '已完成', repeat: '每周二四', priority: '普通' },
  { id: '6', name: '城区全覆盖测绘', type: '即时任务', time: '07:00', drone: '大航蜂 M350-03', airport: '高新区一号机场', status: '已完成', repeat: '单次', priority: '普通' },
  { id: '7', name: '夜间红外巡检', type: '定时任务', time: '20:00', drone: '大航蜂 M30T-08', airport: '培训基地', status: '待执行', repeat: '每周五', priority: '普通' },
  { id: '8', name: '渭河全段排查', type: '周期任务', time: '14:00', drone: '大航蜂 M350-02', airport: '水务巡检机场', status: '待执行', repeat: '每周一', priority: '高' },
  { id: '9', name: '交通早高峰监控', type: '定时任务', time: '07:30', drone: '大航蜂 FP-02', airport: '交通主干道机场', status: '执行中', repeat: '工作日', priority: '高' },
  { id: '10', name: '应急演练飞行', type: '即时任务', time: '15:00', drone: '大航蜂 M300-12', airport: '应急起降点', status: '待执行', repeat: '单次', priority: '普通' },
]);

function getTasksForDay(day: number): CalendarTask[] {
  if (day <= 0) return [];
  const result: CalendarTask[] = [];
  for (const t of tasks.value) {
    if (t.repeat === '每日' || t.repeat === '工作日') {
      const dow = new Date(currentYear.value, currentMonth.value, day).getDay();
      if (t.repeat === '工作日' && (dow === 0 || dow === 6)) continue;
      result.push(t);
    } else if (t.repeat === '每周一三五') {
      const dow = new Date(currentYear.value, currentMonth.value, day).getDay();
      if ([1, 3, 5].includes(dow)) result.push(t);
    } else if (t.repeat === '每周二四') {
      const dow = new Date(currentYear.value, currentMonth.value, day).getDay();
      if ([2, 4].includes(dow)) result.push(t);
    } else if (t.repeat === '每周一') {
      const dow = new Date(currentYear.value, currentMonth.value, day).getDay();
      if (dow === 1) result.push(t);
    } else if (t.repeat === '每周五') {
      const dow = new Date(currentYear.value, currentMonth.value, day).getDay();
      if (dow === 5) result.push(t);
    } else if (t.repeat === '单次') {
      const taskDay = [15, 13, 20, 25, 11, 18][Number(t.id) % 6];
      if (day === taskDay) result.push(t);
    }
  }
  return result;
}

const calendarDays = computed(() => {
  const firstDay = new Date(currentYear.value, currentMonth.value, 1).getDay();
  const offset = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(currentYear.value, currentMonth.value + 1, 0).getDate();
  const cells: number[] = [];
  for (let i = 0; i < offset; i++) cells.push(0);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(0);
  return cells;
});

function prevMonth() {
  if (currentMonth.value === 0) {
    currentMonth.value = 11;
    currentYear.value--;
  } else {
    currentMonth.value--;
  }
}

function nextMonth() {
  if (currentMonth.value === 11) {
    currentMonth.value = 0;
    currentYear.value++;
  } else {
    currentMonth.value++;
  }
}

function isToday(day: number) {
  const now = new Date();
  return day === now.getDate() && currentMonth.value === now.getMonth() && currentYear.value === now.getFullYear();
}

function statusColor(s: string) {
  if (s === '执行中') return 'blue';
  if (s === '待执行') return 'orange';
  if (s === '已完成') return 'green';
  return 'default';
}

function priorityColor(p: string) {
  return p === '高' ? 'red' : 'default';
}

// Day detail drawer
const dayDrawerVisible = ref(false);
const selectedDay = ref(0);
const selectedDayTasks = ref<CalendarTask[]>([]);

function openDay(day: number) {
  if (day <= 0) return;
  selectedDay.value = day;
  selectedDayTasks.value = getTasksForDay(day);
  dayDrawerVisible.value = true;
}

// Add task modal
const addModalVisible = ref(false);
const newTask = ref({
  name: '',
  type: '定时任务',
  time: '',
  drone: '',
  airport: '',
  repeat: '单次',
  priority: '普通',
});

const droneOptions = ['大航蜂 M300-01', '大航蜂 M30T-02', '大航蜂 M350-03', '大航蜂 FP-04', '大航蜂 M30-06', '大航蜂 M300-07', '大航蜂 M30T-08'];
const airportOptions = ['高新区一号机场', '林草防火机场', '水务巡检机场', '城管巡检机场', '交通主干道机场', '培训基地'];
const repeatOptions = ['单次', '每日', '工作日', '每周一', '每周一三五', '每周二四', '每周五'];

function openAddTask() {
  newTask.value = { name: '', type: '定时任务', time: '', drone: '', airport: '', repeat: '单次', priority: '普通' };
  addModalVisible.value = true;
}

function handleAddTask() {
  if (!newTask.value.name) {
    message.warning('请输入任务名称');
    return;
  }
  tasks.value.push({
    id: String(Date.now()),
    name: newTask.value.name,
    type: newTask.value.type,
    time: newTask.value.time || '08:00',
    drone: newTask.value.drone || droneOptions[0]!,
    airport: newTask.value.airport || airportOptions[0]!,
    status: '待执行',
    repeat: newTask.value.repeat,
    priority: newTask.value.priority,
  });
  addModalVisible.value = false;
  message.success('任务已添加');
}

onMounted(async () => {
  await crudExpose.doRefresh();
});
</script>

<template>
  <Page>
    <div class="flex flex-col gap-3 p-2">
      <Card :bordered="false" size="small">
        <div class="flex items-center justify-between">
          <RadioGroup v-model:value="viewMode" button-style="solid" size="small">
            <Radio.Button value="calendar">日历看板</Radio.Button>
            <Radio.Button value="list">列表视图</Radio.Button>
          </RadioGroup>
          <Button type="primary" size="small" @click="openAddTask">新建任务</Button>
        </div>
      </Card>

      <!-- Calendar View -->
      <template v-if="viewMode === 'calendar'">
        <Card :bordered="false" size="small">
          <div class="cal-header">
            <Button size="small" @click="prevMonth">&lt;</Button>
            <span class="cal-header__title">{{ currentYear }} 年 {{ monthNames[currentMonth] }}</span>
            <Button size="small" @click="nextMonth">&gt;</Button>
          </div>

          <div class="cal-grid">
            <div v-for="w in weekDays" :key="w" class="cal-weekday">{{ w }}</div>
            <div
              v-for="(day, i) in calendarDays"
              :key="i"
              class="cal-cell"
              :class="{ 'cal-cell--empty': day === 0, 'cal-cell--today': isToday(day) }"
              @click="openDay(day)"
            >
              <template v-if="day > 0">
                <div class="cal-cell__day">{{ day }}</div>
                <div class="cal-cell__tasks">
                  <div
                    v-for="t in getTasksForDay(day).slice(0, 3)"
                    :key="t.id"
                    class="cal-task"
                    :class="`cal-task--${t.status === '执行中' ? 'active' : t.status === '已完成' ? 'done' : 'pending'}`"
                  >
                    <span class="cal-task__time">{{ t.time }}</span>
                    <span class="cal-task__name">{{ t.name }}</span>
                  </div>
                  <div v-if="getTasksForDay(day).length > 3" class="cal-task__more">
                    +{{ getTasksForDay(day).length - 3 }} 更多
                  </div>
                </div>
              </template>
            </div>
          </div>
        </Card>

        <Card :bordered="false" size="small" title="任务图例">
          <Space>
            <Badge color="#1677ff" text="执行中" />
            <Badge color="#faad14" text="待执行" />
            <Badge color="#52c41a" text="已完成" />
            <span class="text-xs" style="color: var(--ant-color-text-tertiary)">· 点击日期查看详情</span>
          </Space>
        </Card>
      </template>

      <!-- List View (original CRUD) -->
      <template v-else>
        <fs-page class="page-layout-card">
          <fs-crud ref="crudRef" v-bind="crudBinding" />
        </fs-page>
      </template>
    </div>

    <!-- Day Detail Drawer -->
    <Drawer
      v-model:open="dayDrawerVisible"
      :title="`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')} 任务列表`"
      width="420"
      placement="right"
    >
      <div v-if="selectedDayTasks.length === 0" class="text-center text-sm" style="color: var(--ant-color-text-tertiary); padding: 40px 0">
        当日无任务
      </div>
      <div v-else class="flex flex-col gap-3">
        <Card v-for="t in selectedDayTasks" :key="t.id" size="small" :bordered="false" class="task-detail-card">
          <div class="flex items-center justify-between">
            <span class="text-sm font-semibold" style="color: var(--ant-color-text)">{{ t.name }}</span>
            <Tag :color="statusColor(t.status)" size="small">{{ t.status }}</Tag>
          </div>
          <div class="mt-2 flex flex-col gap-1 text-xs" style="color: var(--ant-color-text-tertiary)">
            <div class="flex justify-between">
              <span>时间：{{ t.time }}</span>
              <Tag v-if="t.priority === '高'" :color="priorityColor(t.priority)" size="small">高优先</Tag>
            </div>
            <div>设备：{{ t.drone }}</div>
            <div>机场：{{ t.airport }}</div>
            <div>类型：{{ t.type }} · 周期：{{ t.repeat }}</div>
          </div>
        </Card>
      </div>
    </Drawer>

    <!-- Add Task Modal -->
    <Modal v-model:open="addModalVisible" title="新建任务" @ok="handleAddTask" ok-text="创建" cancel-text="取消">
      <Form layout="vertical" class="mt-4">
        <FormItem label="任务名称" required>
          <Input v-model:value="newTask.name" placeholder="输入任务名称" />
        </FormItem>
        <Row :gutter="16">
          <Col :span="12">
            <FormItem label="任务类型">
              <Select v-model:value="newTask.type" style="width: 100%">
                <SelectOption value="定时任务">定时任务</SelectOption>
                <SelectOption value="即时任务">即时任务</SelectOption>
                <SelectOption value="周期任务">周期任务</SelectOption>
              </Select>
            </FormItem>
          </Col>
          <Col :span="12">
            <FormItem label="优先级">
              <Select v-model:value="newTask.priority" style="width: 100%">
                <SelectOption value="普通">普通</SelectOption>
                <SelectOption value="高">高</SelectOption>
              </Select>
            </FormItem>
          </Col>
        </Row>
        <FormItem label="执行时间">
          <Input v-model:value="newTask.time" placeholder="如 08:30" />
        </FormItem>
        <FormItem label="任务周期">
          <Select v-model:value="newTask.repeat" style="width: 100%">
            <SelectOption v-for="r in repeatOptions" :key="r" :value="r">{{ r }}</SelectOption>
          </Select>
        </FormItem>
        <Row :gutter="16">
          <Col :span="12">
            <FormItem label="执行设备">
              <Select v-model:value="newTask.drone" placeholder="选择无人机" style="width: 100%">
                <SelectOption v-for="d in droneOptions" :key="d" :value="d">{{ d }}</SelectOption>
              </Select>
            </FormItem>
          </Col>
          <Col :span="12">
            <FormItem label="执行机场">
              <Select v-model:value="newTask.airport" placeholder="选择机场" style="width: 100%">
                <SelectOption v-for="a in airportOptions" :key="a" :value="a">{{ a }}</SelectOption>
              </Select>
            </FormItem>
          </Col>
        </Row>
      </Form>
    </Modal>
  </Page>
</template>

<style lang="less" scoped>
.cal-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 12px;
}

.cal-header__title {
  font-size: 16px;
  font-weight: 700;
  color: var(--ant-color-text);
  min-width: 120px;
  text-align: center;
}

.cal-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: var(--ant-color-border-secondary);
  border: 1px solid var(--ant-color-border-secondary);
  border-radius: 8px;
  overflow: hidden;
}

.cal-weekday {
  padding: 8px;
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  color: var(--ant-color-text-tertiary);
  background: var(--ant-color-bg-layout);
}

.cal-cell {
  min-height: 100px;
  padding: 6px;
  background: var(--ant-color-bg-container);
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: var(--ant-color-primary-bg);
  }
}

.cal-cell--empty {
  background: var(--ant-color-bg-layout);
  cursor: default;

  &:hover {
    background: var(--ant-color-bg-layout);
  }
}

.cal-cell--today {
  .cal-cell__day {
    background: var(--ant-color-primary);
    color: #fff;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.cal-cell__day {
  font-size: 13px;
  font-weight: 600;
  color: var(--ant-color-text);
  margin-bottom: 4px;
  font-variant-numeric: tabular-nums;
}

.cal-cell__tasks {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.cal-task {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.cal-task--active {
  background: rgb(22 119 255 / 12%);
  color: var(--ant-color-primary);
}

.cal-task--pending {
  background: rgb(250 173 20 / 10%);
  color: #d48806;
}

.cal-task--done {
  background: rgb(82 196 26 / 10%);
  color: #389e0d;
}

.cal-task__time {
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  flex: none;
}

.cal-task__name {
  overflow: hidden;
  text-overflow: ellipsis;
}

.cal-task__more {
  font-size: 10px;
  color: var(--ant-color-text-quaternary);
  padding: 0 6px;
}

.task-detail-card {
  background: var(--ant-color-bg-layout);
}

@media (max-width: 768px) {
  .cal-cell {
    min-height: 60px;
    padding: 4px;
  }

  .cal-task__name {
    display: none;
  }
}
</style>
