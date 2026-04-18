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

const uavTypeDict = () =>
  dict({
    data: [
      { value: '多旋翼', label: '多旋翼' },
      { value: '固定翼', label: '固定翼' },
      { value: '垂直起降', label: '垂直起降' },
    ],
  });

const payloadDict = () =>
  dict({
    data: [
      { value: '可见光', label: '可见光' },
      { value: '红外热成像', label: '红外热成像' },
      { value: '可见光+热成像', label: '可见光+热成像' },
      { value: '多光谱', label: '多光谱' },
      { value: '激光雷达', label: '激光雷达' },
      { value: '喊话器', label: '喊话器' },
    ],
  });

const mockData = [
  {
    id: '1',
    name: '大航蜂 M300-01',
    model: 'DJI M300 RTK',
    sn: '1ZNBJ1D00C00G1',
    uavType: '多旋翼',
    status: '在线',
    battery: 86,
    bindDock: '高新区一号机场',
    region: '高新区北片',
    department: '综合指挥中心',
    payload: '可见光+热成像',
    firmware: 'v4.6.12',
    flightHours: 326,
    mileage: 1580,
    lastHeartbeat: '2026-04-13 16:06:18',
    createTime: '2025-09-01 10:00:00',
  },
  {
    id: '2',
    name: '大航蜂 M30T-02',
    model: 'DJI M30T',
    sn: '1ZNBJ2A00C00K3',
    uavType: '多旋翼',
    status: '维护中',
    battery: 42,
    bindDock: '林草防火机场',
    region: '林草防火区',
    department: '林草局',
    payload: '可见光+热成像',
    firmware: 'v4.5.9',
    flightHours: 218,
    mileage: 890,
    lastHeartbeat: '2026-04-13 15:38:12',
    createTime: '2025-09-15 09:00:00',
  },
  {
    id: '3',
    name: '大航蜂 M350-03',
    model: 'DJI M350 RTK',
    sn: '1ZNBJ3B00D00M5',
    uavType: '多旋翼',
    status: '作业中',
    battery: 72,
    bindDock: '生态园区机场',
    region: '生态园区',
    department: '生态环境局',
    payload: '多光谱',
    firmware: 'v5.1.3',
    flightHours: 157,
    mileage: 620,
    lastHeartbeat: '2026-04-13 16:10:02',
    createTime: '2025-11-20 14:00:00',
  },
  {
    id: '4',
    name: '大航蜂 FP-04',
    model: '纵横 CW-25',
    sn: 'ZH25CW0001',
    uavType: '固定翼',
    status: '在线',
    battery: 90,
    bindDock: '交通主干道机场',
    region: '交通主干道',
    department: '交管局',
    payload: '可见光',
    firmware: 'v2.8.1',
    flightHours: 89,
    mileage: 2350,
    lastHeartbeat: '2026-04-13 16:08:44',
    createTime: '2026-01-10 11:00:00',
  },
  {
    id: '5',
    name: '大航蜂 VT-05',
    model: '垂鹰 VT-15',
    sn: 'VT15E0005',
    uavType: '垂直起降',
    status: '离线',
    battery: 0,
    bindDock: '应急备勤机场',
    region: '城管巡检区',
    department: '应急管理局',
    payload: '红外热成像',
    firmware: 'v1.4.7',
    flightHours: 45,
    mileage: 380,
    lastHeartbeat: '2026-04-12 08:22:10',
    createTime: '2026-02-28 16:00:00',
  },
  {
    id: '6',
    name: '大航蜂 M30-06',
    model: 'DJI M30',
    sn: '1ZNBJ6D00C00P8',
    uavType: '多旋翼',
    status: '在线',
    battery: 95,
    bindDock: '水务巡检机场',
    region: '沿河西路',
    department: '水务局',
    payload: '可见光+热成像',
    firmware: 'v4.6.12',
    flightHours: 198,
    mileage: 760,
    lastHeartbeat: '2026-04-13 16:11:30',
    createTime: '2025-10-05 08:30:00',
  },
  {
    id: '7',
    name: '大航蜂 M300-07',
    model: 'DJI M300 RTK',
    sn: '1ZNBJ7A00C00R2',
    uavType: '多旋翼',
    status: '作业中',
    battery: 64,
    bindDock: '城管巡检机场',
    region: '城管巡检区',
    department: '城管局',
    payload: '可见光',
    firmware: 'v4.6.10',
    flightHours: 412,
    mileage: 1920,
    lastHeartbeat: '2026-04-13 16:09:55',
    createTime: '2025-06-18 09:00:00',
  },
  {
    id: '8',
    name: '大航蜂 T40-08',
    model: 'DJI T40',
    sn: '1ZNBJ8C00E00S4',
    uavType: '多旋翼',
    status: '在线',
    battery: 78,
    bindDock: '光伏园区机场',
    region: '光伏园区',
    department: '自然资源局',
    payload: '激光雷达',
    firmware: 'v3.2.5',
    flightHours: 134,
    mileage: 510,
    lastHeartbeat: '2026-04-13 16:05:08',
    createTime: '2026-03-01 13:00:00',
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
          title: '设备名称',
          type: 'text',
          search: { show: true },
          column: { width: 160 },
          form: {
            rules: [{ required: true, message: '请输入设备名称' }],
          },
        },
        model: {
          title: '设备型号',
          type: 'text',
          column: { width: 150 },
          form: {
            rules: [{ required: true, message: '请输入设备型号' }],
          },
        },
        sn: {
          title: '序列号',
          type: 'text',
          column: { width: 150 },
          form: {
            rules: [{ required: true, message: '请输入序列号' }],
          },
        },
        uavType: {
          title: '机型分类',
          type: 'dict-select',
          dict: uavTypeDict(),
          search: { show: true },
          column: { width: 110, align: 'center' },
          form: {
            rules: [{ required: true, message: '请选择机型分类' }],
          },
        },
        status: {
          title: '在线状态',
          type: 'dict-select',
          dict: deviceStatusDict(),
          search: { show: true },
          column: { width: 100, align: 'center' },
          addForm: { value: '在线' },
        },
        battery: {
          title: '电量 %',
          type: 'number',
          column: { width: 90, align: 'center' },
          addForm: { value: 100 },
          form: { component: { min: 0, max: 100 } },
        },
        bindDock: {
          title: '绑定机场',
          type: 'text',
          column: { width: 150 },
        },
        region: {
          title: '所属区域',
          type: 'dict-select',
          dict: regionDict(),
          search: { show: true },
          column: { width: 130 },
          form: {
            rules: [{ required: true, message: '请选择所属区域' }],
          },
        },
        department: {
          title: '责任部门',
          type: 'dict-select',
          dict: departmentDict(),
          column: { width: 130 },
        },
        payload: {
          title: '挂载负载',
          type: 'dict-select',
          dict: payloadDict(),
          column: { width: 140 },
        },
        firmware: {
          title: '固件版本',
          type: 'text',
          column: { width: 110 },
        },
        flightHours: {
          title: '累计飞行(h)',
          type: 'number',
          column: { width: 120, align: 'center' },
          form: { show: false },
        },
        mileage: {
          title: '累计里程(km)',
          type: 'number',
          column: { width: 130, align: 'center' },
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
