<script lang="ts" setup name="DroneDeviceCenterPage">
import { Page } from '@vben/common-ui';

import { computed, ref } from 'vue';

import {
  Button,
  Card,
  Col,
  Descriptions,
  DescriptionsItem,
  Drawer,
  Input,
  Progress,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  message,
} from 'ant-design-vue';

interface DeviceRow {
  key: string;
  name: string;
  type: string;
  region: string;
  status: string;
  battery: number;
  mission: string;
  airport: string;
  owner: string;
  firmware: string;
  heartbeat: string;
  network: string;
  warranty: string;
}

const stats = [
  { title: '无人机档案', value: 42, suffix: '架' },
  { title: '机场机巢', value: 18, suffix: '座' },
  { title: '监控设备', value: 56, suffix: '路' },
  { title: '环境传感器', value: 73, suffix: '个' },
];

const statusCards = [
  {
    title: '在线设备',
    value: 146,
    desc: '含无人机、机巢、机器狗与感知终端',
  },
  {
    title: '作业中设备',
    value: 24,
    desc: '当前存在任务占用或联动执行状态',
  },
  {
    title: '离线设备',
    value: 11,
    desc: '需要排查链路、供电或硬件维护问题',
  },
];

const typeOptions = [
  { label: '全部类型', value: '全部类型' },
  { label: '无人机', value: '无人机' },
  { label: '机巢', value: '机巢' },
  { label: '机器狗', value: '机器狗' },
  { label: '摄像头', value: '摄像头' },
  { label: '传感器', value: '传感器' },
];

const regionOptions = [
  { label: '全部区域', value: '全部区域' },
  { label: '高新区北片', value: '高新区北片' },
  { label: '生态园区', value: '生态园区' },
  { label: '热力管网片区', value: '热力管网片区' },
  { label: '沿河西路', value: '沿河西路' },
  { label: '林草防火区', value: '林草防火区' },
];

const statusOptions = [
  { label: '全部状态', value: '全部状态' },
  { label: '在线', value: '在线' },
  { label: '作业中', value: '作业中' },
  { label: '离线', value: '离线' },
  { label: '维护中', value: '维护中' },
];

const deviceColumns = [
  { title: '设备名称', dataIndex: 'name', key: 'name' },
  { title: '类型', dataIndex: 'type', key: 'type' },
  { title: '所属区域', dataIndex: 'region', key: 'region' },
  { title: '在线状态', dataIndex: 'status', key: 'status' },
  { title: '电量', dataIndex: 'battery', key: 'battery' },
  { title: '绑定机场', dataIndex: 'airport', key: 'airport' },
  { title: '当前任务', dataIndex: 'mission', key: 'mission' },
  { title: '最后心跳', dataIndex: 'heartbeat', key: 'heartbeat' },
  { title: '操作', dataIndex: 'action', key: 'action', width: 180 },
];

const devices = ref<DeviceRow[]>([
  {
    key: '1',
    name: '大航蜂 M300-01',
    type: '无人机',
    region: '高新区北片',
    status: '在线',
    battery: 86,
    mission: '道路巡查',
    airport: '高新区一号机场',
    owner: '综合指挥席 A',
    firmware: 'v4.6.12',
    heartbeat: '2026-04-13 16:06:18',
    network: '5G / 主链路正常',
    warranty: '2027-10-30',
  },
  {
    key: '2',
    name: '机场 A-03',
    type: '机巢',
    region: '生态园区',
    status: '作业中',
    battery: 100,
    mission: '河道例行巡检',
    airport: '生态园区机场',
    owner: '生态巡检席',
    firmware: 'dock-2.1.0',
    heartbeat: '2026-04-13 16:05:52',
    network: '专线 / 主备切换正常',
    warranty: '2028-02-16',
  },
  {
    key: '3',
    name: '机器狗 G-07',
    type: '机器狗',
    region: '热力管网片区',
    status: '在线',
    battery: 63,
    mission: '热力隐患复核',
    airport: '地面终端组',
    owner: '设施巡检席',
    firmware: 'gdog-1.9.3',
    heartbeat: '2026-04-13 16:04:07',
    network: 'WiFi 6 / 室外网桥',
    warranty: '2027-08-12',
  },
  {
    key: '4',
    name: '水务摄像头 C-19',
    type: '摄像头',
    region: '沿河西路',
    status: '离线',
    battery: 0,
    mission: '无',
    airport: '沿河监测点',
    owner: '水务值守席',
    firmware: 'cam-3.2.0',
    heartbeat: '2026-04-13 12:18:44',
    network: '链路中断',
    warranty: '2026-12-01',
  },
  {
    key: '5',
    name: '气象传感器 S-12',
    type: '传感器',
    region: '林草防火区',
    status: '在线',
    battery: 78,
    mission: '环境监测',
    airport: '林草防火机场',
    owner: '应急值守席',
    firmware: 'sensor-5.0.1',
    heartbeat: '2026-04-13 16:03:31',
    network: 'LoRa / 网关在线',
    warranty: '2028-06-20',
  },
  {
    key: '6',
    name: '大航蜂 M30T-02',
    type: '无人机',
    region: '林草防火区',
    status: '维护中',
    battery: 42,
    mission: '例行维护',
    airport: '林草防火机场',
    owner: '机务维护组',
    firmware: 'v4.5.9',
    heartbeat: '2026-04-13 15:38:12',
    network: '检修模式',
    warranty: '2027-05-11',
  },
]);

const selectedType = ref('全部类型');
const selectedRegion = ref('全部区域');
const selectedStatus = ref('全部状态');
const keyword = ref('');
const detailOpen = ref(false);
const selectedDeviceKey = ref(devices.value[0]?.key ?? '');

const filteredDevices = computed(() => {
  return devices.value.filter((item) => {
    const matchType =
      selectedType.value === '全部类型' || item.type === selectedType.value;
    const matchRegion =
      selectedRegion.value === '全部区域' || item.region === selectedRegion.value;
    const matchStatus =
      selectedStatus.value === '全部状态' || item.status === selectedStatus.value;
    const matchKeyword =
      keyword.value.trim() === '' ||
      [item.name, item.airport, item.mission, item.owner].some((field) =>
        field.includes(keyword.value.trim()),
      );
    return matchType && matchRegion && matchStatus && matchKeyword;
  });
});

const selectedDevice = computed(() => {
  return (
    filteredDevices.value.find((item) => item.key === selectedDeviceKey.value) ||
    devices.value.find((item) => item.key === selectedDeviceKey.value) ||
    null
  );
});

const apiPlan = [
  '设备分页列表：统一查询无人机、机巢、机器狗、无人车、摄像头、传感器',
  '设备详情接口：提供档案、状态、挂载、维护、告警与遥测信息',
  '远程操作接口：支持绑定机场、启停、远程调试与 OTA 状态查询',
  '区域与组织接口：支持区域变更、归属部门、权限过滤与地图联动',
];

function getStatusColor(status: string) {
  if (status === '在线') return 'green';
  if (status === '作业中') return 'blue';
  if (status === '维护中') return 'orange';
  return 'default';
}

function openDetail(deviceKey: string) {
  selectedDeviceKey.value = deviceKey;
  detailOpen.value = true;
}

function refreshTable() {
  message.success('设备台账已刷新，当前为演示数据');
}

function openRemoteDebug(deviceKey: string) {
  const target =
    devices.value.find((item) => item.key === deviceKey) || selectedDevice.value;
  if (!target) return;
  message.success(`已打开 ${target.name} 的远程调试入口占位`);
}
</script>

<template>
  <Page :auto-content-height="true">
    <div class="flex flex-col gap-4 p-2">
      <Row :gutter="[16, 16]">
        <Col v-for="item in stats" :key="item.title" :lg="6" :md="12" :span="24">
          <Card :bordered="false">
            <Statistic :suffix="item.suffix" :title="item.title" :value="item.value" />
          </Card>
        </Col>
      </Row>

      <Row :gutter="[16, 16]">
        <Col v-for="item in statusCards" :key="item.title" :lg="8" :span="24">
          <Card :bordered="false">
            <div class="text-lg font-semibold text-slate-900">{{ item.title }}</div>
            <div class="mt-3 text-3xl font-bold text-slate-900">{{ item.value }}</div>
            <div class="mt-2 text-sm text-slate-500">{{ item.desc }}</div>
          </Card>
        </Col>
      </Row>

      <Card :bordered="false" title="设备筛选与操作">
        <div class="device-toolbar">
          <Space :size="[12, 12]" wrap>
            <Input
              v-model:value="keyword"
              allow-clear
              class="device-toolbar__input"
              placeholder="搜索设备名称 / 机场 / 任务 / 责任人"
            />
            <Select
              v-model:value="selectedType"
              :options="typeOptions"
              class="device-toolbar__select"
            />
            <Select
              v-model:value="selectedRegion"
              :options="regionOptions"
              class="device-toolbar__select"
            />
            <Select
              v-model:value="selectedStatus"
              :options="statusOptions"
              class="device-toolbar__select"
            />
            <Button type="primary" @click="refreshTable()">刷新台账</Button>
          </Space>
          <div class="text-sm text-slate-500">
            当前筛选结果共 {{ filteredDevices.length }} 台设备，重点关注
            <span class="font-semibold text-slate-800">
              {{ selectedDevice?.name || '暂无设备' }}
            </span>
          </div>
        </div>
      </Card>

      <Card :bordered="false" title="设备台账">
        <Table
          :columns="deviceColumns"
          :data-source="filteredDevices"
          :pagination="{ pageSize: 5 }"
          row-key="key"
          size="middle"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'status'">
              <Tag :color="getStatusColor(record.status)">
                {{ record.status }}
              </Tag>
            </template>
            <template v-else-if="column.key === 'battery'">
              <div class="min-w-32">
                <Progress
                  :percent="record.battery"
                  :show-info="true"
                  :status="record.battery < 20 ? 'exception' : 'active'"
                  size="small"
                />
              </div>
            </template>
            <template v-else-if="column.key === 'action'">
              <Space>
                <Button size="small" type="link" @click="openDetail(record.key)">
                  查看详情
                </Button>
                <Button size="small" type="link" @click="openRemoteDebug(record.key)">
                  远程调试
                </Button>
              </Space>
            </template>
          </template>
        </Table>
      </Card>

      <Card :bordered="false" title="下一步联调接口">
        <div class="grid gap-3 md:grid-cols-2">
          <div
            v-for="item in apiPlan"
            :key="item"
            class="rounded-lg bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700"
          >
            {{ item }}
          </div>
        </div>
      </Card>

      <Drawer
        v-model:open="detailOpen"
        title="设备详情"
        placement="right"
        width="420"
      >
        <template v-if="selectedDevice">
          <Descriptions :column="1" bordered size="small">
            <DescriptionsItem label="设备名称">
              {{ selectedDevice.name }}
            </DescriptionsItem>
            <DescriptionsItem label="设备类型">
              {{ selectedDevice.type }}
            </DescriptionsItem>
            <DescriptionsItem label="所属区域">
              {{ selectedDevice.region }}
            </DescriptionsItem>
            <DescriptionsItem label="在线状态">
              <Tag :color="getStatusColor(selectedDevice.status)">
                {{ selectedDevice.status }}
              </Tag>
            </DescriptionsItem>
            <DescriptionsItem label="绑定机场">
              {{ selectedDevice.airport }}
            </DescriptionsItem>
            <DescriptionsItem label="当前任务">
              {{ selectedDevice.mission }}
            </DescriptionsItem>
            <DescriptionsItem label="责任人">
              {{ selectedDevice.owner }}
            </DescriptionsItem>
            <DescriptionsItem label="固件版本">
              {{ selectedDevice.firmware }}
            </DescriptionsItem>
            <DescriptionsItem label="网络状态">
              {{ selectedDevice.network }}
            </DescriptionsItem>
            <DescriptionsItem label="最后心跳">
              {{ selectedDevice.heartbeat }}
            </DescriptionsItem>
            <DescriptionsItem label="质保到期">
              {{ selectedDevice.warranty }}
            </DescriptionsItem>
          </Descriptions>

          <div class="mt-4">
            <div class="mb-2 text-sm font-semibold text-slate-900">设备电量</div>
            <Progress
              :percent="selectedDevice.battery"
              :status="selectedDevice.battery < 20 ? 'exception' : 'active'"
            />
          </div>

          <div class="mt-4 flex flex-wrap gap-3">
            <Button type="primary" @click="openRemoteDebug(selectedDevice.key)">
              远程调试
            </Button>
            <Button @click="message.success('已打开区域绑定入口占位')">
              区域绑定
            </Button>
            <Button @click="message.success('已打开维护记录入口占位')">
              维护记录
            </Button>
          </div>
        </template>
      </Drawer>
    </div>
  </Page>
</template>

<style lang="less" scoped>
.device-toolbar {
  display: flex;
  gap: 16px;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}

.device-toolbar__input {
  width: 320px;
}

.device-toolbar__select {
  width: 160px;
}
</style>
