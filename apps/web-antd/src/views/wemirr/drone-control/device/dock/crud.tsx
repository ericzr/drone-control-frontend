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

const dockTypeDict = () =>
  dict({
    data: [
      { value: '固定机场', label: '固定机场' },
      { value: '移动机巢', label: '移动机巢' },
      { value: '车载机巢', label: '车载机巢' },
    ],
  });

const droneStatusDict = () =>
  dict({
    data: [
      { value: '驻机就绪', label: '驻机就绪', color: 'success' },
      { value: '充电中', label: '充电中', color: 'processing' },
      { value: '执行任务', label: '执行任务', color: 'warning' },
      { value: '未驻机', label: '未驻机', color: 'default' },
    ],
  });

const mockData = [
  {
    id: '1',
    name: '高新区一号机场',
    model: 'DJI Dock 2',
    sn: 'DOCK2A001',
    dockType: '固定机场',
    status: '在线',
    region: '高新区北片',
    department: '综合指挥中心',
    longitude: '108.9432',
    latitude: '34.2655',
    droneStatus: '驻机就绪',
    bindDrone: '大航蜂 M300-01',
    temperature: 24.5,
    humidity: 45,
    windSpeed: 3.2,
    firmware: 'dock-v2.3.1',
    lastMaintenance: '2026-03-28',
    createTime: '2025-08-15 10:00:00',
  },
  {
    id: '2',
    name: '生态园区机场',
    model: 'DJI Dock 2',
    sn: 'DOCK2A002',
    dockType: '固定机场',
    status: '作业中',
    region: '生态园区',
    department: '生态环境局',
    longitude: '108.8876',
    latitude: '34.3012',
    droneStatus: '执行任务',
    bindDrone: '大航蜂 M350-03',
    temperature: 22.1,
    humidity: 52,
    windSpeed: 2.8,
    firmware: 'dock-v2.3.1',
    lastMaintenance: '2026-04-01',
    createTime: '2025-08-20 09:00:00',
  },
  {
    id: '3',
    name: '林草防火机场',
    model: 'DJI Dock',
    sn: 'DOCK1B003',
    dockType: '固定机场',
    status: '在线',
    region: '林草防火区',
    department: '林草局',
    longitude: '109.0123',
    latitude: '34.4210',
    droneStatus: '充电中',
    bindDrone: '大航蜂 M30T-02',
    temperature: 18.3,
    humidity: 38,
    windSpeed: 4.5,
    firmware: 'dock-v2.1.0',
    lastMaintenance: '2026-03-15',
    createTime: '2025-09-10 14:00:00',
  },
  {
    id: '4',
    name: '交通主干道机场',
    model: 'DJI Dock 2',
    sn: 'DOCK2C004',
    dockType: '固定机场',
    status: '在线',
    region: '交通主干道',
    department: '交管局',
    longitude: '108.9210',
    latitude: '34.2980',
    droneStatus: '驻机就绪',
    bindDrone: '大航蜂 FP-04',
    temperature: 23.7,
    humidity: 41,
    windSpeed: 2.1,
    firmware: 'dock-v2.3.1',
    lastMaintenance: '2026-04-05',
    createTime: '2025-12-01 08:00:00',
  },
  {
    id: '5',
    name: '水务巡检机场',
    model: 'DJI Dock',
    sn: 'DOCK1D005',
    dockType: '固定机场',
    status: '在线',
    region: '沿河西路',
    department: '水务局',
    longitude: '108.8745',
    latitude: '34.2430',
    droneStatus: '驻机就绪',
    bindDrone: '大航蜂 M30-06',
    temperature: 21.0,
    humidity: 58,
    windSpeed: 3.6,
    firmware: 'dock-v2.1.0',
    lastMaintenance: '2026-03-20',
    createTime: '2025-10-08 11:00:00',
  },
  {
    id: '6',
    name: '城管巡检机场',
    model: 'DJI Dock 2',
    sn: 'DOCK2E006',
    dockType: '固定机场',
    status: '在线',
    region: '城管巡检区',
    department: '城管局',
    longitude: '108.9560',
    latitude: '34.2890',
    droneStatus: '执行任务',
    bindDrone: '大航蜂 M300-07',
    temperature: 25.2,
    humidity: 43,
    windSpeed: 1.9,
    firmware: 'dock-v2.3.1',
    lastMaintenance: '2026-04-08',
    createTime: '2025-07-22 15:00:00',
  },
  {
    id: '7',
    name: '应急备勤机场',
    model: 'DJI Dock',
    sn: 'DOCK1F007',
    dockType: '固定机场',
    status: '离线',
    region: '城管巡检区',
    department: '应急管理局',
    longitude: '108.9680',
    latitude: '34.3150',
    droneStatus: '未驻机',
    bindDrone: '大航蜂 VT-05',
    temperature: 0,
    humidity: 0,
    windSpeed: 0,
    firmware: 'dock-v2.1.0',
    lastMaintenance: '2026-02-10',
    createTime: '2026-02-01 10:00:00',
  },
  {
    id: '8',
    name: '移动应急机巢 A',
    model: '大航蜂 移动方舱',
    sn: 'MDOCK001',
    dockType: '移动机巢',
    status: '在线',
    region: '高新区北片',
    department: '应急管理局',
    longitude: '108.9350',
    latitude: '34.2720',
    droneStatus: '驻机就绪',
    bindDrone: '',
    temperature: 26.0,
    humidity: 40,
    windSpeed: 2.5,
    firmware: 'mdock-v1.2.0',
    lastMaintenance: '2026-04-10',
    createTime: '2026-03-15 09:00:00',
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
        width: 280,
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
          takeoff: {
            text: '一键起飞',
            type: 'link',
            order: 0,
            show: ({ row }: any) =>
              row.status !== '离线' && row.droneStatus === '驻机就绪',
            click: ({ row }: any) => {
              (props as any).context?.openTakeoff?.(row);
            },
          },
        },
      },
      columns: {
        id: hiddenIdColumn,
        name: {
          title: '机场名称',
          type: 'text',
          search: { show: true },
          column: { width: 170 },
          form: {
            rules: [{ required: true, message: '请输入机场名称' }],
          },
        },
        model: {
          title: '设备型号',
          type: 'text',
          column: { width: 150 },
        },
        sn: {
          title: '序列号',
          type: 'text',
          column: { width: 130 },
        },
        dockType: {
          title: '机巢类型',
          type: 'dict-select',
          dict: dockTypeDict(),
          search: { show: true },
          column: { width: 110, align: 'center' },
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
          search: { show: true },
          column: { width: 130 },
        },
        department: {
          title: '责任部门',
          type: 'dict-select',
          dict: departmentDict(),
          column: { width: 130 },
        },
        droneStatus: {
          title: '驻机状态',
          type: 'dict-select',
          dict: droneStatusDict(),
          column: { width: 110, align: 'center' },
          form: { show: false },
        },
        bindDrone: {
          title: '绑定无人机',
          type: 'text',
          column: { width: 160 },
        },
        longitude: {
          title: '经度',
          type: 'text',
          column: { width: 110, show: false },
        },
        latitude: {
          title: '纬度',
          type: 'text',
          column: { width: 110, show: false },
        },
        temperature: {
          title: '舱内温度(°C)',
          type: 'number',
          column: { width: 120, align: 'center' },
          form: { show: false },
        },
        humidity: {
          title: '湿度(%)',
          type: 'number',
          column: { width: 90, align: 'center' },
          form: { show: false },
        },
        windSpeed: {
          title: '风速(m/s)',
          type: 'number',
          column: { width: 100, align: 'center' },
          form: { show: false },
        },
        firmware: {
          title: '固件版本',
          type: 'text',
          column: { width: 120 },
        },
        lastMaintenance: {
          title: '上次维护',
          type: 'text',
          column: { width: 120 },
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
