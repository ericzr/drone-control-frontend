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

const chargerTypeDict = () =>
  dict({
    data: [
      { value: '无人机快充桩', label: '无人机快充桩' },
      { value: '无人车充电桩', label: '无人车充电桩' },
      { value: '机器狗充电座', label: '机器狗充电座' },
      { value: '通用慢充桩', label: '通用慢充桩' },
    ],
  });

const powerStatusDict = () =>
  dict({
    data: [
      { value: '正常供电', label: '正常供电', color: 'success' },
      { value: '备用电源', label: '备用电源', color: 'warning' },
      { value: '断电', label: '断电', color: 'error' },
    ],
  });

const mockData = [
  {
    id: '1',
    name: '快充桩 CH-01',
    model: '大航蜂 DC-120W',
    sn: 'DHFDC001',
    chargerType: '无人机快充桩',
    status: '在线',
    region: '高新区北片',
    department: '综合指挥中心',
    totalSlots: 4,
    usedSlots: 1,
    powerStatus: '正常供电',
    outputPower: 120,
    totalCharges: 1258,
    firmware: 'ch-v1.3.2',
    lastHeartbeat: '2026-04-13 16:10:00',
    createTime: '2025-08-20 10:00:00',
  },
  {
    id: '2',
    name: '快充桩 CH-02',
    model: '大航蜂 DC-120W',
    sn: 'DHFDC002',
    chargerType: '无人机快充桩',
    status: '在线',
    region: '林草防火区',
    department: '林草局',
    totalSlots: 4,
    usedSlots: 2,
    powerStatus: '正常供电',
    outputPower: 120,
    totalCharges: 987,
    firmware: 'ch-v1.3.2',
    lastHeartbeat: '2026-04-13 16:08:30',
    createTime: '2025-09-15 09:00:00',
  },
  {
    id: '3',
    name: '车辆充电桩 CH-03',
    model: '特来电 DC-60kW',
    sn: 'TLDC003',
    chargerType: '无人车充电桩',
    status: '在线',
    region: '城管巡检区',
    department: '城管局',
    totalSlots: 2,
    usedSlots: 1,
    powerStatus: '正常供电',
    outputPower: 60000,
    totalCharges: 342,
    firmware: 'tl-v2.1.0',
    lastHeartbeat: '2026-04-13 16:09:15',
    createTime: '2026-01-10 14:00:00',
  },
  {
    id: '4',
    name: '机器狗充电座 CH-04',
    model: '宇树 充电底座',
    sn: 'UTCHG004',
    chargerType: '机器狗充电座',
    status: '在线',
    region: '热力管网片区',
    department: '应急管理局',
    totalSlots: 2,
    usedSlots: 0,
    powerStatus: '正常供电',
    outputPower: 200,
    totalCharges: 456,
    firmware: 'ch-v1.0.5',
    lastHeartbeat: '2026-04-13 16:07:40',
    createTime: '2025-11-20 11:00:00',
  },
  {
    id: '5',
    name: '快充桩 CH-05',
    model: '大航蜂 DC-120W',
    sn: 'DHFDC005',
    chargerType: '无人机快充桩',
    status: '离线',
    region: '生态园区',
    department: '生态环境局',
    totalSlots: 4,
    usedSlots: 0,
    powerStatus: '断电',
    outputPower: 0,
    totalCharges: 678,
    firmware: 'ch-v1.3.0',
    lastHeartbeat: '2026-04-12 14:20:00',
    createTime: '2025-10-05 08:00:00',
  },
  {
    id: '6',
    name: '慢充桩 CH-06',
    model: '通用 AC-7kW',
    sn: 'TYAC006',
    chargerType: '通用慢充桩',
    status: '在线',
    region: '光伏园区',
    department: '自然资源局',
    totalSlots: 6,
    usedSlots: 2,
    powerStatus: '正常供电',
    outputPower: 7000,
    totalCharges: 215,
    firmware: 'ac-v1.1.0',
    lastHeartbeat: '2026-04-13 16:04:55',
    createTime: '2026-02-28 16:00:00',
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
          title: '充电站名称',
          type: 'text',
          search: { show: true },
          column: { width: 160 },
          form: {
            rules: [{ required: true, message: '请输入充电站名称' }],
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
        chargerType: {
          title: '充电桩类型',
          type: 'dict-select',
          dict: chargerTypeDict(),
          search: { show: true },
          column: { width: 140, align: 'center' },
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
        totalSlots: {
          title: '总槽位',
          type: 'number',
          column: { width: 90, align: 'center' },
          form: { component: { min: 1, max: 20 } },
        },
        usedSlots: {
          title: '使用中',
          type: 'number',
          column: { width: 90, align: 'center' },
          form: { show: false },
        },
        powerStatus: {
          title: '供电状态',
          type: 'dict-select',
          dict: powerStatusDict(),
          column: { width: 110, align: 'center' },
          form: { show: false },
        },
        outputPower: {
          title: '输出功率(W)',
          type: 'number',
          column: { width: 120, align: 'center' },
        },
        totalCharges: {
          title: '累计充电次数',
          type: 'number',
          column: { width: 130, align: 'center' },
          form: { show: false },
        },
        firmware: {
          title: '固件版本',
          type: 'text',
          column: { width: 110 },
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
