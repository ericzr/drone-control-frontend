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

const dogModeDict = () =>
  dict({
    data: [
      { value: '自主巡检', label: '自主巡检' },
      { value: '遥控操作', label: '遥控操作' },
      { value: '跟随模式', label: '跟随模式' },
      { value: '待命', label: '待命' },
    ],
  });

const terrainDict = () =>
  dict({
    data: [
      { value: '室内', label: '室内' },
      { value: '室外平地', label: '室外平地' },
      { value: '室外越野', label: '室外越野' },
      { value: '楼梯/台阶', label: '楼梯/台阶' },
    ],
  });

const mockData = [
  {
    id: '1',
    name: '机器狗 G-01',
    model: '宇树 Go2 Pro',
    sn: 'UTGO2P001',
    status: '在线',
    battery: 78,
    region: '热力管网片区',
    department: '应急管理局',
    workMode: '待命',
    terrain: '室外越野',
    currentTask: '',
    speed: 0,
    firmware: 'gdog-v2.1.3',
    network: 'WiFi 6 / 室外网桥',
    lastHeartbeat: '2026-04-13 16:08:22',
    createTime: '2025-11-10 09:00:00',
  },
  {
    id: '2',
    name: '机器狗 G-02',
    model: '宇树 B2',
    sn: 'UTB2A002',
    status: '作业中',
    battery: 56,
    region: '热力管网片区',
    department: '应急管理局',
    workMode: '自主巡检',
    terrain: '室外越野',
    currentTask: '热力隐患复核',
    speed: 1.2,
    firmware: 'gdog-v2.1.3',
    network: '5G',
    lastHeartbeat: '2026-04-13 16:10:45',
    createTime: '2025-12-05 14:00:00',
  },
  {
    id: '3',
    name: '机器狗 G-03',
    model: '宇树 Go2 Pro',
    sn: 'UTGO2P003',
    status: '在线',
    battery: 92,
    region: '光伏园区',
    department: '自然资源局',
    workMode: '待命',
    terrain: '室外平地',
    currentTask: '',
    speed: 0,
    firmware: 'gdog-v2.1.3',
    network: 'WiFi 6',
    lastHeartbeat: '2026-04-13 16:07:10',
    createTime: '2026-01-20 10:00:00',
  },
  {
    id: '4',
    name: '机器狗 G-04',
    model: '小米 铁蛋2',
    sn: 'XMTD2004',
    status: '维护中',
    battery: 15,
    region: '高新区北片',
    department: '综合指挥中心',
    workMode: '待命',
    terrain: '室内',
    currentTask: '电池更换',
    speed: 0,
    firmware: 'gdog-v1.8.0',
    network: '离线',
    lastHeartbeat: '2026-04-13 10:30:00',
    createTime: '2025-10-15 16:00:00',
  },
  {
    id: '5',
    name: '机器狗 G-05',
    model: '宇树 B2',
    sn: 'UTB2A005',
    status: '在线',
    battery: 85,
    region: '城管巡检区',
    department: '城管局',
    workMode: '待命',
    terrain: '室外平地',
    currentTask: '',
    speed: 0,
    firmware: 'gdog-v2.1.3',
    network: '5G',
    lastHeartbeat: '2026-04-13 16:09:33',
    createTime: '2026-02-10 11:00:00',
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
          column: { width: 140 },
          form: {
            rules: [{ required: true, message: '请输入设备名称' }],
          },
        },
        model: {
          title: '设备型号',
          type: 'text',
          column: { width: 140 },
          form: {
            rules: [{ required: true, message: '请输入设备型号' }],
          },
        },
        sn: {
          title: '序列号',
          type: 'text',
          column: { width: 130 },
        },
        status: {
          title: '在线状态',
          type: 'dict-select',
          dict: deviceStatusDict(),
          search: { show: true },
          column: { width: 100, align: 'center' },
        },
        battery: {
          title: '电量 %',
          type: 'number',
          column: { width: 90, align: 'center' },
          form: { component: { min: 0, max: 100 } },
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
        workMode: {
          title: '工作模式',
          type: 'dict-select',
          dict: dogModeDict(),
          column: { width: 110, align: 'center' },
        },
        terrain: {
          title: '适应地形',
          type: 'dict-select',
          dict: terrainDict(),
          column: { width: 120 },
        },
        currentTask: {
          title: '当前任务',
          type: 'text',
          column: { width: 140 },
          form: { show: false },
        },
        speed: {
          title: '速度(m/s)',
          type: 'number',
          column: { width: 100, align: 'center' },
          form: { show: false },
        },
        firmware: {
          title: '固件版本',
          type: 'text',
          column: { width: 120 },
        },
        network: {
          title: '网络连接',
          type: 'text',
          column: { width: 140 },
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
