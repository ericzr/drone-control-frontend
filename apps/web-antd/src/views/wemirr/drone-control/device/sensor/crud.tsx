import type {
  CreateCrudOptionsProps,
  CreateCrudOptionsRet,
} from '@fast-crud/fast-crud';

import { dict } from '@fast-crud/fast-crud';

import { hiddenIdColumn } from '#/plugin/fast-crud/shared';

import {
  createMockCrud,
  departmentDict,
  deviceStatusDict,
  regionDict,
} from '../_mock';

const sensorTypeDict = () =>
  dict({
    data: [
      { value: '气象站', label: '气象站' },
      { value: '空气质量', label: '空气质量' },
      { value: '水质监测', label: '水质监测' },
      { value: '噪声监测', label: '噪声监测' },
      { value: '土壤监测', label: '土壤监测' },
      { value: '烟感', label: '烟感' },
    ],
  });

const networkDict = () =>
  dict({
    data: [
      { value: 'LoRa', label: 'LoRa' },
      { value: 'NB-IoT', label: 'NB-IoT' },
      { value: '4G', label: '4G' },
      { value: 'WiFi', label: 'WiFi' },
      { value: '有线', label: '有线' },
    ],
  });

const mockData = [
  {
    id: '1',
    name: '气象站 S-01',
    sensorType: '气象站',
    model: '维萨拉 WXT536',
    sn: 'WXT536001',
    status: '在线',
    region: '林草防火区',
    department: '林草局',
    network: 'LoRa',
    dataInterval: 60,
    lastValue: '温度 18.3°C / 湿度 38% / 风速 4.5m/s',
    lastHeartbeat: '2026-04-13 16:10:00',
    createTime: '2025-08-01 10:00:00',
  },
  {
    id: '2',
    name: '空气监测 S-02',
    sensorType: '空气质量',
    model: '先河 XHAQMS-200',
    sn: 'XHAQ002',
    status: '在线',
    region: '城管巡检区',
    department: '生态环境局',
    network: '4G',
    dataInterval: 300,
    lastValue: 'PM2.5 35μg/m³ / AQI 52',
    lastHeartbeat: '2026-04-13 16:08:20',
    createTime: '2025-09-15 09:00:00',
  },
  {
    id: '3',
    name: '水质站 S-03',
    sensorType: '水质监测',
    model: '雪迪龙 SDL-WQ300',
    sn: 'SDLWQ003',
    status: '在线',
    region: '沿河西路',
    department: '水务局',
    network: '4G',
    dataInterval: 600,
    lastValue: 'pH 7.2 / 溶解氧 6.8mg/L / 浊度 12NTU',
    lastHeartbeat: '2026-04-13 16:05:30',
    createTime: '2025-10-08 11:00:00',
  },
  {
    id: '4',
    name: '噪声监测 S-04',
    sensorType: '噪声监测',
    model: '爱华 AWA6228+',
    sn: 'AWA6228004',
    status: '在线',
    region: '高新区北片',
    department: '生态环境局',
    network: 'NB-IoT',
    dataInterval: 120,
    lastValue: 'Leq 52.3dB(A)',
    lastHeartbeat: '2026-04-13 16:09:10',
    createTime: '2025-11-20 14:00:00',
  },
  {
    id: '5',
    name: '烟感探测 S-05',
    sensorType: '烟感',
    model: '海湾 JTY-GD-G3',
    sn: 'HWJTY005',
    status: '在线',
    region: '林草防火区',
    department: '林草局',
    network: 'LoRa',
    dataInterval: 30,
    lastValue: '正常 / 烟雾浓度 0.02%',
    lastHeartbeat: '2026-04-13 16:10:30',
    createTime: '2025-12-01 08:00:00',
  },
  {
    id: '6',
    name: '气象站 S-06',
    sensorType: '气象站',
    model: '维萨拉 WXT536',
    sn: 'WXT536006',
    status: '离线',
    region: '光伏园区',
    department: '自然资源局',
    network: 'LoRa',
    dataInterval: 60,
    lastValue: '数据中断',
    lastHeartbeat: '2026-04-12 22:30:00',
    createTime: '2026-01-05 10:00:00',
  },
  {
    id: '7',
    name: '土壤站 S-07',
    sensorType: '土壤监测',
    model: '博云 BY-TR300',
    sn: 'BYTR007',
    status: '在线',
    region: '生态园区',
    department: '生态环境局',
    network: 'NB-IoT',
    dataInterval: 1800,
    lastValue: '含水率 28% / 温度 16°C / pH 6.8',
    lastHeartbeat: '2026-04-13 16:00:00',
    createTime: '2026-02-18 15:00:00',
  },
];

const mockCrud = createMockCrud(mockData);

export default function (props: CreateCrudOptionsProps): CreateCrudOptionsRet {
  return {
    crudOptions: {
      request: {
        pageRequest: mockCrud.pageRequest,
        addRequest: mockCrud.addRequest,
        editRequest: mockCrud.editRequest,
        delRequest: mockCrud.delRequest,
      },
      rowHandle: {
        fixed: 'right',
        width: 200,
        buttons: {
          detail: {
            text: '详情',
            type: 'link',
            order: -1,
            click: ({ row }: any) => {
              (props as any).context?.router?.push(
                `/device/detail?id=${row.id}`,
              );
            },
          },
        },
      },
      columns: {
        id: hiddenIdColumn,
        name: {
          title: '传感器名称',
          type: 'text',
          search: { show: true },
          column: { width: 150 },
          form: {
            rules: [{ required: true, message: '请输入传感器名称' }],
          },
        },
        sensorType: {
          title: '传感器类型',
          type: 'dict-select',
          dict: sensorTypeDict(),
          search: { show: true },
          column: { width: 120, align: 'center' },
          form: {
            rules: [{ required: true, message: '请选择传感器类型' }],
          },
        },
        model: {
          title: '设备型号',
          type: 'text',
          column: { width: 160 },
        },
        sn: {
          title: '序列号',
          type: 'text',
          column: { width: 120 },
        },
        status: {
          title: '在线状态',
          type: 'dict-select',
          dict: deviceStatusDict(),
          search: { show: true },
          column: { width: 100, align: 'center' },
        },
        region: {
          title: '所属区域',
          type: 'dict-select',
          dict: regionDict(),
          column: { width: 130 },
        },
        department: {
          title: '责任部门',
          type: 'dict-select',
          dict: departmentDict(),
          column: { width: 130 },
        },
        network: {
          title: '通信方式',
          type: 'dict-select',
          dict: networkDict(),
          column: { width: 110 },
        },
        dataInterval: {
          title: '采集间隔(s)',
          type: 'number',
          column: { width: 120, align: 'center' },
          form: { component: { min: 1 } },
        },
        lastValue: {
          title: '最新数据',
          type: 'text',
          column: { width: 280, ellipsis: true },
          form: { show: false },
        },
        lastHeartbeat: {
          title: '最后心跳',
          type: 'text',
          column: { width: 170 },
          form: { show: false },
        },
        createTime: {
          title: '创建时间',
          type: 'text',
          column: { width: 170 },
          form: { show: false },
        },
      },
    },
  };
}
