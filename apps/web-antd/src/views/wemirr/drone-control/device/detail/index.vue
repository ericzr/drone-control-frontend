<script lang="ts" setup name="DeviceDetailPage">
import { Page } from '@vben/common-ui';

import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import {
  Badge,
  Button,
  Card,
  Col,
  Descriptions,
  DescriptionsItem,
  Divider,
  Progress,
  Row,
  Space,
  Table,
  Tabs,
  TabPane,
  Tag,
  Timeline,
  TimelineItem,
  message,
} from 'ant-design-vue';

const route = useRoute();
const router = useRouter();
const deviceId = computed(() => (route.query.id as string) || '1');

const device = ref({
  id: '1',
  name: '大航蜂 M300-01',
  model: 'DJI M300 RTK',
  sn: '1ZNBJ1D00C00G1',
  category: '多旋翼',
  status: '在线',
  region: '高新区',
  department: '飞行一队',
  airport: '高新区一号机场',
  firmware: 'V07.01.10.01',
  battery: 64,
  totalHours: 286.5,
  totalSorties: 342,
  lastFlight: '2026-04-13 14:32',
  purchaseDate: '2024-03-15',
  warrantyEnd: '2027-03-14',
});

const payloads = [
  { name: '禅思 H20T', type: '多传感器负载', firmware: 'V01.04.03', status: '正常', mount: '上挂载' },
  { name: '禅思 L2', type: '激光雷达', firmware: 'V03.01.02', status: '正常', mount: '下挂载' },
  { name: 'RTK 模块', type: '定位模块', firmware: 'V02.00.06', status: '正常', mount: '内置' },
];

const payloadColumns = [
  { title: '负载名称', dataIndex: 'name', key: 'name' },
  { title: '类型', dataIndex: 'type', key: 'type' },
  { title: '固件版本', dataIndex: 'firmware', key: 'firmware' },
  { title: '状态', dataIndex: 'status', key: 'status' },
  { title: '挂载位', dataIndex: 'mount', key: 'mount' },
];

const maintenanceRecords = [
  { time: '2026-04-10', type: '保养', desc: '全机体清洁、桨叶检查、电池循环' },
  { time: '2026-03-22', type: '维修', desc: '更换前左电机，原电机轴承异响' },
  { time: '2026-03-05', type: '保养', desc: '固件升级至 V07.01.10.01，RTK 校准' },
  { time: '2026-02-18', type: '更换', desc: '更换电池组 #3，循环次数达上限 200 次' },
  { time: '2026-01-15', type: '保养', desc: '年度深度保养，云台校准，图传模块检测' },
  { time: '2025-11-20', type: '维修', desc: '降落时碰撞，更换起落架与底壳' },
];

const alertLogs = [
  { time: '2026-04-13 14:32', level: 'warning', type: '低电量', desc: '电量低于 30%，自动返航', status: '已处理' },
  { time: '2026-04-11 09:15', level: 'info', type: '信号弱', desc: '图传信号低于 70%，持续 12 秒', status: '已忽略' },
  { time: '2026-04-08 16:42', level: 'critical', type: 'IMU 异常', desc: 'IMU 数据波动超阈值，已悬停', status: '已处理' },
  { time: '2026-03-30 11:28', level: 'warning', type: '禁飞区接近', desc: '距限飞区边界 200m，已减速', status: '已处理' },
  { time: '2026-03-22 08:55', level: 'critical', type: '电机异常', desc: '前左电机转速异常，紧急降落', status: '已维修' },
];

const alertColumns = [
  { title: '时间', dataIndex: 'time', key: 'time', width: 160 },
  { title: '级别', dataIndex: 'level', key: 'level', width: 80 },
  { title: '告警类型', dataIndex: 'type', key: 'type', width: 110 },
  { title: '描述', dataIndex: 'desc', key: 'desc' },
  { title: '状态', dataIndex: 'status', key: 'status', width: 90 },
];

function levelColor(level: string) {
  if (level === 'critical') return 'red';
  if (level === 'warning') return 'orange';
  return 'blue';
}

function typeColor(type: string) {
  if (type === '维修') return 'red';
  if (type === '更换') return 'orange';
  return 'green';
}

function handleRemoteDebug() {
  message.info('远程调试功能待接入');
}

function handleLiveView() {
  router.push('/flight/cockpit');
}

function goBack() {
  router.back();
}
</script>

<template>
  <Page>
    <div class="flex flex-col gap-4 p-2">
      <Card :bordered="false">
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-4">
            <div>
              <div class="flex items-center gap-3">
                <span class="text-lg font-bold" style="color: var(--ant-color-text)">{{ device.name }}</span>
                <Badge :status="device.status === '在线' ? 'success' : 'default'" :text="device.status" />
              </div>
              <div class="mt-1 text-sm" style="color: var(--ant-color-text-tertiary)">
                {{ device.model }} · {{ device.sn }} · {{ device.category }}
              </div>
            </div>
          </div>
          <Space>
            <Button @click="handleLiveView">查看实时画面</Button>
            <Button @click="handleRemoteDebug">远程调试</Button>
            <Button @click="goBack">返回列表</Button>
          </Space>
        </div>
      </Card>

      <Tabs type="card">
        <TabPane key="basic" tab="基础信息">
          <Card :bordered="false">
            <Row :gutter="[16, 16]">
              <Col :lg="16" :span="24">
                <Descriptions bordered :column="2" size="small">
                  <DescriptionsItem label="设备名称">{{ device.name }}</DescriptionsItem>
                  <DescriptionsItem label="设备型号">{{ device.model }}</DescriptionsItem>
                  <DescriptionsItem label="序列号">{{ device.sn }}</DescriptionsItem>
                  <DescriptionsItem label="机型分类">
                    <Tag color="blue">{{ device.category }}</Tag>
                  </DescriptionsItem>
                  <DescriptionsItem label="所属区域">{{ device.region }}</DescriptionsItem>
                  <DescriptionsItem label="所属部门">{{ device.department }}</DescriptionsItem>
                  <DescriptionsItem label="绑定机场">{{ device.airport }}</DescriptionsItem>
                  <DescriptionsItem label="固件版本">{{ device.firmware }}</DescriptionsItem>
                  <DescriptionsItem label="购入日期">{{ device.purchaseDate }}</DescriptionsItem>
                  <DescriptionsItem label="质保截止">{{ device.warrantyEnd }}</DescriptionsItem>
                </Descriptions>
              </Col>
              <Col :lg="8" :span="24">
                <div class="flex flex-col gap-4">
                  <Card size="small" title="飞行统计">
                    <div class="flex justify-around text-center">
                      <div>
                        <div class="text-2xl font-bold" style="color: var(--ant-color-primary)">{{ device.totalHours }}</div>
                        <div class="text-xs" style="color: var(--ant-color-text-tertiary)">飞行时长(h)</div>
                      </div>
                      <div>
                        <div class="text-2xl font-bold" style="color: var(--ant-color-primary)">{{ device.totalSorties }}</div>
                        <div class="text-xs" style="color: var(--ant-color-text-tertiary)">飞行架次</div>
                      </div>
                    </div>
                  </Card>
                  <Card size="small" title="当前电量">
                    <Progress :percent="device.battery" :status="device.battery < 30 ? 'exception' : 'active'" />
                  </Card>
                  <div class="text-xs" style="color: var(--ant-color-text-tertiary)">
                    最近飞行：{{ device.lastFlight }}
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
        </TabPane>

        <TabPane key="payload" tab="挂载负载">
          <Card :bordered="false">
            <Table
              :columns="payloadColumns"
              :data-source="payloads"
              :pagination="false"
              size="small"
              row-key="name"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'status'">
                  <Badge status="success" :text="record.status" />
                </template>
              </template>
            </Table>
          </Card>
        </TabPane>

        <TabPane key="maintenance" tab="维护记录">
          <Card :bordered="false">
            <Timeline>
              <TimelineItem
                v-for="(r, i) in maintenanceRecords"
                :key="i"
                :color="typeColor(r.type)"
              >
                <div class="flex items-center gap-2">
                  <Tag :color="typeColor(r.type)" size="small">{{ r.type }}</Tag>
                  <span class="text-xs" style="color: var(--ant-color-text-tertiary)">{{ r.time }}</span>
                </div>
                <div class="mt-1 text-sm" style="color: var(--ant-color-text)">{{ r.desc }}</div>
              </TimelineItem>
            </Timeline>
          </Card>
        </TabPane>

        <TabPane key="alerts" tab="告警日志">
          <Card :bordered="false">
            <Table
              :columns="alertColumns"
              :data-source="alertLogs"
              :pagination="false"
              size="small"
              row-key="time"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'level'">
                  <Tag :color="levelColor(record.level)" size="small">
                    {{ record.level === 'critical' ? '严重' : record.level === 'warning' ? '警告' : '提示' }}
                  </Tag>
                </template>
                <template v-if="column.key === 'status'">
                  <span class="text-xs" style="color: var(--ant-color-text-secondary)">{{ record.status }}</span>
                </template>
              </template>
            </Table>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  </Page>
</template>
